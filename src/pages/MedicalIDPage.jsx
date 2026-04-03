import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  Heart, ArrowLeft, Save, User, Calendar, Droplets,
  AlertTriangle, Pill, Smartphone, Phone, Stethoscope,
  FileText, Edit3
} from 'lucide-react';

export default function MedicalIDPage() {
  const { medicalID, setMedicalID } = useApp();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ ...medicalID });

  const handleSave = () => {
    setMedicalID(formData);
    setEditing(false);
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateNestedField = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value }
    }));
  };

  const renderField = (label, field, icon) => (
    <div className="medical-field">
      <div className="medical-field-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {icon}
        {label}
      </div>
      {editing ? (
        <input
          className="input-field"
          value={formData[field] || ''}
          onChange={(e) => updateField(field, e.target.value)}
          style={{ width: '180px', textAlign: 'right', padding: '6px 10px', fontSize: '0.875rem' }}
        />
      ) : (
        <div className="medical-field-value">{medicalID[field] || '—'}</div>
      )}
    </div>
  );

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header animate-in">
        <button className="page-header-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} />
          Back
        </button>
        <button 
          className={`btn ${editing ? 'btn-primary' : 'btn-outline'}`}
          onClick={editing ? handleSave : () => setEditing(true)}
          style={{ fontSize: '0.8125rem', padding: '8px 16px' }}
          id="medical-edit-btn"
        >
          {editing ? <><Save size={14} /> Save</> : <><Edit3 size={14} /> Edit</>}
        </button>
      </div>

      <div className="animate-in" style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{ 
          width: '56px', height: '56px', borderRadius: '50%',
          background: 'var(--accent-red-bg)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 8px'
        }}>
          <Heart size={28} color="var(--accent-red)" />
        </div>
        <h1>Medical ID</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Critical health information for emergencies
        </p>
      </div>

      {/* Personal Information */}
      <div className="card animate-in stagger-1 mb-md">
        <div className="medical-section">
          <h3>Personal Information</h3>
          {renderField('Full Name', 'fullName', <User size={14} color="var(--accent-blue)" />)}
          {renderField('Date of Birth', 'dob', <Calendar size={14} color="var(--accent-blue)" />)}
          {renderField('Blood Type', 'bloodType', <Droplets size={14} color="var(--accent-red)" />)}
        </div>
      </div>

      {/* Medical Conditions */}
      <div className="card animate-in stagger-2 mb-md">
        <div className="medical-section">
          <h3>Medical Conditions</h3>
          {renderField('Allergies', 'allergies', <AlertTriangle size={14} color="var(--accent-yellow)" />)}
          {renderField('Chronic Conditions', 'chronicConditions', <Heart size={14} color="var(--accent-red)" />)}
          {renderField('Medications', 'medications', <Pill size={14} color="var(--accent-purple)" />)}
          {renderField('Medical Devices', 'medicalDevices', <Smartphone size={14} color="var(--accent-blue)" />)}
        </div>
      </div>

      {/* Emergency Contacts */}
      <div className="card animate-in stagger-3 mb-md">
        <div className="medical-section">
          <h3>Emergency Contacts</h3>
          <div className="medical-field">
            <div className="medical-field-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Phone size={14} color="var(--accent-green)" />
              Contact 1
            </div>
            {editing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
                <input
                  className="input-field"
                  placeholder="Name"
                  value={formData.emergencyContact1?.name || ''}
                  onChange={(e) => updateNestedField('emergencyContact1', 'name', e.target.value)}
                  style={{ width: '180px', textAlign: 'right', padding: '4px 8px', fontSize: '0.8125rem' }}
                />
                <input
                  className="input-field"
                  placeholder="Phone"
                  value={formData.emergencyContact1?.phone || ''}
                  onChange={(e) => updateNestedField('emergencyContact1', 'phone', e.target.value)}
                  style={{ width: '180px', textAlign: 'right', padding: '4px 8px', fontSize: '0.8125rem' }}
                />
              </div>
            ) : (
              <div className="medical-field-value">
                <div>{medicalID.emergencyContact1?.name}</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--accent-blue)' }}>
                  {medicalID.emergencyContact1?.phone}
                </div>
              </div>
            )}
          </div>

          <div className="medical-field">
            <div className="medical-field-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Phone size={14} color="var(--accent-green)" />
              Contact 2
            </div>
            {editing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
                <input
                  className="input-field"
                  placeholder="Name"
                  value={formData.emergencyContact2?.name || ''}
                  onChange={(e) => updateNestedField('emergencyContact2', 'name', e.target.value)}
                  style={{ width: '180px', textAlign: 'right', padding: '4px 8px', fontSize: '0.8125rem' }}
                />
                <input
                  className="input-field"
                  placeholder="Phone"
                  value={formData.emergencyContact2?.phone || ''}
                  onChange={(e) => updateNestedField('emergencyContact2', 'phone', e.target.value)}
                  style={{ width: '180px', textAlign: 'right', padding: '4px 8px', fontSize: '0.8125rem' }}
                />
              </div>
            ) : (
              <div className="medical-field-value">
                <div>{medicalID.emergencyContact2?.name}</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--accent-blue)' }}>
                  {medicalID.emergencyContact2?.phone}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Doctor & Directives */}
      <div className="card animate-in stagger-4 mb-md">
        <div className="medical-section">
          <h3>Medical Provider</h3>
          {renderField('Primary Doctor', 'primaryDoctor', <Stethoscope size={14} color="var(--accent-blue)" />)}
          {renderField('Doctor Phone', 'doctorPhone', <Phone size={14} color="var(--accent-blue)" />)}
        </div>
      </div>

      <div className="card animate-in stagger-5 mb-md">
        <div className="medical-section">
          <h3>Advance Directives</h3>
          <div className="medical-field">
            <div className="medical-field-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileText size={14} color="var(--accent-yellow)" />
              DNR Status
            </div>
            {editing ? (
              <div 
                className={`toggle ${formData.dnr ? 'active' : ''}`}
                onClick={() => updateField('dnr', !formData.dnr)}
              ></div>
            ) : (
              <div className="medical-field-value" style={{ color: medicalID.dnr ? 'var(--accent-red)' : 'var(--accent-green)' }}>
                {medicalID.dnr ? 'Yes — DNR' : 'No DNR'}
              </div>
            )}
          </div>
          {renderField('Directives', 'advanceDirectives', <FileText size={14} color="var(--text-muted)" />)}
        </div>
      </div>
    </div>
  );
}
