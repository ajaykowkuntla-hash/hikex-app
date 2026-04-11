/**
 * HIKEX BLE Service
 * Handles Web Bluetooth connection to the HIKEX_Device wearable.
 * Reads real-time sensor data: bpm, lat, lng, battery, lowBattery, gpsReady, sos
 */

const DEVICE_NAME = 'HIKEX_Device';
// Standard UUIDs — update these if your ESP32 uses custom UUIDs
const SERVICE_UUID = '0000180d-0000-1000-8000-00805f9b34fb';         // Heart Rate Service
const HIKEX_SERVICE_UUID = '12345678-1234-1234-1234-123456789abc';   // Custom HIKEX service
const HIKEX_CHAR_UUID = '12345678-1234-1234-1234-123456789abd';      // Custom HIKEX data characteristic

class BLEService {
  constructor() {
    this.device = null;
    this.server = null;
    this.characteristic = null;
    this.isConnected = false;
    this.listeners = new Set();
    this.statusListeners = new Set();
    this._reconnectAttempts = 0;
    this._maxReconnect = 3;
  }

  // Check if Web Bluetooth is supported
  isSupported() {
    return !!(navigator.bluetooth);
  }

  // Connect to HIKEX_Device
  async connect() {
    if (!this.isSupported()) {
      throw new Error('Web Bluetooth is not supported in this browser. Use Chrome on Android or desktop.');
    }

    try {
      this._notifyStatus('scanning');

      // Request device with name filter
      this.device = await navigator.bluetooth.requestDevice({
        filters: [{ name: DEVICE_NAME }],
        optionalServices: [SERVICE_UUID, HIKEX_SERVICE_UUID],
      });

      this._notifyStatus('connecting');

      // Listen for disconnections
      this.device.addEventListener('gattserverdisconnected', () => {
        this.isConnected = false;
        this._notifyStatus('disconnected');
        this._attemptReconnect();
      });

      // Connect to GATT server
      this.server = await this.device.gatt.connect();
      this.isConnected = true;
      this._reconnectAttempts = 0;
      this._notifyStatus('connected');

      // Try to subscribe to notifications
      await this._subscribeToNotifications();

      return { success: true, deviceName: this.device.name };
    } catch (error) {
      this.isConnected = false;
      this._notifyStatus('error');

      if (error.name === 'NotFoundError') {
        throw new Error('No HIKEX_Device found nearby. Make sure the device is powered on.');
      }
      throw error;
    }
  }

  // Subscribe to BLE notifications for real-time data
  async _subscribeToNotifications() {
    if (!this.server) return;

    try {
      // Try custom HIKEX service first
      const service = await this.server.getPrimaryService(HIKEX_SERVICE_UUID).catch(() => null)
        || await this.server.getPrimaryService(SERVICE_UUID).catch(() => null);

      if (!service) {
        console.warn('BLE: No known service found. Using polling fallback.');
        return;
      }

      this.characteristic = await service.getCharacteristic(HIKEX_CHAR_UUID).catch(() => null);

      if (this.characteristic && this.characteristic.properties.notify) {
        await this.characteristic.startNotifications();
        this.characteristic.addEventListener('characteristicvaluechanged', (event) => {
          const value = event.target.value;
          const data = this._parseData(value);
          if (data) this._notifyListeners(data);
        });
      } else if (this.characteristic && this.characteristic.properties.read) {
        // Fallback: poll every 2 seconds
        this._pollInterval = setInterval(async () => {
          try {
            const value = await this.characteristic.readValue();
            const data = this._parseData(value);
            if (data) this._notifyListeners(data);
          } catch (e) {
            console.warn('BLE read error:', e.message);
          }
        }, 2000);
      }
    } catch (error) {
      console.warn('BLE subscription error:', error.message);
    }
  }

  // Parse raw BLE DataView into our data format
  _parseData(dataView) {
    try {
      // Try JSON parse first (ESP32 sending JSON string)
      const decoder = new TextDecoder();
      const text = decoder.decode(dataView.buffer);
      const parsed = JSON.parse(text);
      return {
        bpm: parsed.bpm ?? 0,
        lat: parsed.lat ?? 0,
        lng: parsed.lng ?? 0,
        battery: parsed.battery ?? 0,
        lowBattery: parsed.lowBattery ?? false,
        gpsReady: parsed.gpsReady ?? false,
        sos: parsed.sos ?? false,
        source: 'ble',
        timestamp: Date.now(),
      };
    } catch {
      // Fallback: parse as binary struct
      // Byte layout: [bpm(1), lat_int(4), lng_int(4), battery(1), flags(1)]
      // flags bit 0 = lowBattery, bit 1 = gpsReady, bit 2 = sos
      if (dataView.byteLength >= 11) {
        const bpm = dataView.getUint8(0);
        const lat = dataView.getFloat32(1, true);
        const lng = dataView.getFloat32(5, true);
        const battery = dataView.getUint8(9);
        const flags = dataView.getUint8(10);
        return {
          bpm,
          lat,
          lng,
          battery,
          lowBattery: !!(flags & 0x01),
          gpsReady: !!(flags & 0x02),
          sos: !!(flags & 0x04),
          source: 'ble',
          timestamp: Date.now(),
        };
      }
      return null;
    }
  }

  // Auto-reconnect on disconnection
  async _attemptReconnect() {
    if (this._reconnectAttempts >= this._maxReconnect || !this.device) return;
    this._reconnectAttempts++;
    this._notifyStatus('reconnecting');

    try {
      await new Promise(r => setTimeout(r, 2000));
      if (this.device.gatt) {
        this.server = await this.device.gatt.connect();
        this.isConnected = true;
        this._reconnectAttempts = 0;
        this._notifyStatus('connected');
        await this._subscribeToNotifications();
      }
    } catch (e) {
      console.warn(`BLE reconnect attempt ${this._reconnectAttempts} failed:`, e.message);
      if (this._reconnectAttempts < this._maxReconnect) {
        this._attemptReconnect();
      } else {
        this._notifyStatus('disconnected');
      }
    }
  }

  // Disconnect
  disconnect() {
    if (this._pollInterval) clearInterval(this._pollInterval);
    if (this.device && this.device.gatt.connected) {
      this.device.gatt.disconnect();
    }
    this.isConnected = false;
    this.device = null;
    this.server = null;
    this.characteristic = null;
    this._notifyStatus('disconnected');
  }

  // Data listeners
  onData(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  _notifyListeners(data) {
    this.listeners.forEach(cb => cb(data));
  }

  // Status listeners
  onStatusChange(callback) {
    this.statusListeners.add(callback);
    return () => this.statusListeners.delete(callback);
  }

  _notifyStatus(status) {
    this.statusListeners.forEach(cb => cb(status));
  }
}

// Singleton instance
const bleService = new BLEService();
export default bleService;
