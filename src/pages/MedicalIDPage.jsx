import { ArrowLeft, Stethoscope, Phone, Edit3, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function MedicalIDPage() {
  const navigate = useNavigate();
  const { medicalID, setMedicalID } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...medicalID });

  const handleSave = () => {
    setMedicalID(formData);
    setIsEditing(false);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value }
    }));
  };

  const inputStyle = {
    width: '100%',
    padding: '14px 16px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '12px',
    color: '#fff',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'border-color 0.2s, background 0.2s',
  };

  const displayStyle = {
    padding: '14px 16px',
    background: 'rgba(0,0,0,0.3)',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.05)',
    color: '#fff',
    fontSize: '0.95rem',
  };

  const renderField = (label, field, placeholder) => (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', marginBottom: '8px' }}>{label}</label>
      {isEditing ? (
        <input
          style={inputStyle}
          value={formData[field] || ''}
          onChange={(e) => handleChange(field, e.target.value)}
          placeholder={placeholder || ''}
          maxLength={250}
          onFocus={(e) => { e.target.style.borderColor = 'var(--accent-primary)'; e.target.style.background = 'rgba(255,255,255,0.08)'; }}
          onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.15)'; e.target.style.background = 'rgba(255,255,255,0.05)'; }}
        />
      ) : (
        <div style={displayStyle}>{formData[field] || 'Not Set'}</div>
      )}
    </div>
  );

  const renderNestedField = (label, parent, field, placeholder) => (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', marginBottom: '8px' }}>{label}</label>
      {isEditing ? (
        <input
          style={inputStyle}
          value={formData[parent]?.[field] || ''}
          onChange={(e) => handleNestedChange(parent, field, e.target.value)}
          placeholder={placeholder || ''}
          maxLength={250}
          onFocus={(e) => { e.target.style.borderColor = 'var(--accent-primary)'; e.target.style.background = 'rgba(255,255,255,0.08)'; }}
          onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.15)'; e.target.style.background = 'rgba(255,255,255,0.05)'; }}
        />
      ) : (
        <div style={displayStyle}>{formData[parent]?.[field] || 'Not Set'}</div>
      )}
    </div>
  );

  return (
    <div className="page-container" style={{ paddingBottom: '100px' }}>
      <header className="mb-6 flex justify-between items-center animate-in stagger-1">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <ArrowLeft size={24} className="cursor-pointer opacity-70 hover:opacity-100 transition-opacity" onClick={() => navigate(-1)} />
          <h1 className="display-text text-2xl font-bold tracking-tight">Medical ID</h1>
        </div>
        {!isEditing ? (
          <button className="btn btn-outline" style={{ padding: '8px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => setIsEditing(true)}>
             <Edit3 size={14} /> Edit
          </button>
        ) : (
          <button className="btn btn-primary" style={{ padding: '8px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--accent-primary)', border: 'none', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }} onClick={handleSave}>
             <Save size={14} /> Save
          </button>
        )}
      </header>

      <div style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: '16px', padding: '16px', marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'center' }} className="animate-in stagger-2">
         <Stethoscope size={24} color="var(--accent-rose)" />
         <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>These vitals are broadcasted with GPS coordinates to Emergency Responders during SOS.</span>
      </div>

      {/* Personal Info */}
      <div className="glass-panel mb-6 animate-in stagger-2" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--accent-primary)', marginBottom: '20px' }}>Personal Information</h3>
        {renderField('Full Name', 'fullName', 'Enter full name')}
        {renderField('Date of Birth', 'dob', 'YYYY-MM-DD')}
        {renderField('Blood Type', 'bloodType', 'e.g. O+, A-, B+')}
      </div>

      {/* Health Details */}
      <div className="glass-panel mb-6 animate-in stagger-3" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--accent-amber)', marginBottom: '20px' }}>Health & Conditions</h3>
        {renderField('Allergies', 'allergies', 'e.g. Penicillin, Peanuts')}
        {renderField('Chronic Conditions', 'chronicConditions', 'e.g. Asthma, Diabetes')}
        {renderField('Current Medications', 'medications', 'e.g. Inhaler, Insulin')}
        {renderField('Medical Devices', 'medicalDevices', 'e.g. Pacemaker, Insulin Pump')}
      </div>

      {/* Emergency Contact 1 */}
      <div className="glass-panel mb-6 animate-in stagger-4" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--accent-emerald)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><Phone size={14} /> Emergency Contact 1</h3>
        {renderNestedField('Contact Name', 'emergencyContact1', 'name', 'e.g. John Doe')}
        {renderNestedField('Relation', 'emergencyContact1', 'relation', 'e.g. Father, Spouse')}
        {renderNestedField('Phone Number', 'emergencyContact1', 'phone', '+91 98765 43210')}
      </div>

      {/* Emergency Contact 2 */}
      <div className="glass-panel mb-6 animate-in stagger-4" style={{ padding: '24px', animationDelay: '250ms' }}>
        <h3 style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--accent-teal)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><Phone size={14} /> Emergency Contact 2</h3>
        {renderNestedField('Contact Name', 'emergencyContact2', 'name', 'e.g. Jane Doe')}
        {renderNestedField('Relation', 'emergencyContact2', 'relation', 'e.g. Friend, Sibling')}
        {renderNestedField('Phone Number', 'emergencyContact2', 'phone', '+91 87654 32109')}
      </div>

      {/* Doctor Info */}
      <div className="glass-panel animate-in stagger-4" style={{ padding: '24px', animationDelay: '300ms' }}>
        <h3 style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-secondary)', marginBottom: '20px' }}>Primary Physician</h3>
        {renderField('Doctor Name', 'primaryDoctor', 'e.g. Dr. Sharma')}
        {renderField('Doctor Phone', 'doctorPhone', '+91 99887 76655')}
        {renderField('Advance Directives', 'advanceDirectives', 'e.g. DNR, Living Will')}
      </div>

    </div>
  );
}
