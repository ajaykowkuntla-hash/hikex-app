# HIKEX Hardware Stability Notes

This document highlights critical stability and architecture recommendations for the physical HIKEX ESP32 Wearable prototype. Ensuring these rules are followed is critical for demo readiness and hackathon presentations.

## ⚡ 1. Power & Grounding
- **GND Loops:** Ensure **all GND pins** across components (ESP32, GPS module, Max30102, Buzzer, Battery) are physically bridged/connected to a common ground rail. Floating grounds cause intermittent I2C crashes inside `Wire.h`.
- **Power Draw:** The GPS and BLE transmission can cause significant power spikes. Use a high-quality **Boost Converter** or ensure your 18650/LiPo battery can deliver sustained bursts without dipping the voltage below the ESP32's 3.3V tolerance.

## 🛰️ 2. GPS (NEO-6M / Compatible)
- **Signal Condition:** GPS requires explicit **line of sight to the sky**. The device will likely hang on "Searching..." if booted inside a concrete building. If testing indoors, walk near a large window, or pre-flash static coordinates in the C++ logic.
- **Cold vs Warm Start:** Cold boots without a backup battery on the GPS module can take ~45-90 seconds. Keep the device powered on during transit to the judge's booth.

## 💗 3. Heart Rate & SpO2
- **Sensor Contact:** Ensure the MAX30102 sensor window is clean and strapped flush against the skin. Ambient light interference can cause erratic jumps in the real-time graphing.
- **Smoothing Pipeline:** The web interface expects a relatively stable input but applies a 30% Exponential Moving Average (EMA). Send integer BPM counts that are naturally parsed.

## 🔌 4. Prototyping Breadboard
- If using a standard breadboard during the hackathon demo, ensure all jumper wires are **fully seated**. Vibration can cause power drops to the I2C array, leading the ESP32 to freeze during data-reads.
- Solder the final presentation version onto a prototyping perf-board or custom PCB to prevent signal bouncing.

## 🚨 5. SOS Push Button
- Use a hardware debouncing capacitor across the emergency switch, or incorporate an aggressive software debounce (e.g. `if(millis() - lastInterrupt > 250)`) in the ESP32 firmware to prevent rapid-fire SOS bursts, though the UI will filter duplicates effectively.
