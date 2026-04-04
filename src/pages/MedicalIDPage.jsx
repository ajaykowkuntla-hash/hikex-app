import { ArrowLeft, Stethoscope, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function MedicalIDPage() {
  const navigate = useNavigate();
  const { medicalID, setMedicalID } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(medicalID);

  const handleSave = () => {
    setMedicalID(formData);
    setIsEditing(false);
  };

  const handleNestedChange = (category, field, value) => {
    setFormData(prev => ({
      ...prev,
      [category]: { ...prev[category], [field]: value }
    }));
  };

  return (
    <div className="page-container">
      <header className="mb-6 flex justify-between items-center animate-in stagger-1">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <ArrowLeft size={24} className="cursor-pointer opacity-70 hover:opacity-100 transition-opacity" onClick={() => navigate(-1)} />
          <h1 className="display-text text-2xl font-bold tracking-tight">Medical ID</h1>
        </div>
        {!isEditing ? (
          <button className="btn btn-outline" style={{ padding: '8px 16px', borderRadius: '12px' }} onClick={() => setIsEditing(true)}>Edit</button>
        ) : (
          <button className="btn btn-primary" style={{ padding: '8px 16px', borderRadius: '12px' }} onClick={handleSave}>Save</button>
        )}
      </header>

      <div style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: '12px', padding: '16px', marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'center' }} className="animate-in stagger-2">
         <Stethoscope size={24} color="var(--accent-rose)" />
         <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>These vitals are broadcasted with GPS coordinates to Emergency Responders during an SOS transmission.</span>
      </div>

      <div className="glass-panel mb-6 animate-in stagger-3">
        <h3 className="font-display font-semibold text-[var(--accent-primary)] mb-4">Core Vitals</h3>
        
        <div className="input-group">
          <span className="input-label text-xs uppercase tracking-widest font-bold">Blood Type</span>
          {isEditing ? (
            <input className="input-field" value={formData.bloodType} onChange={(e) => handleNestedChange('bloodType', null, e.target.value)} />
          ) : (
            <div style={{ padding: '16px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>{formData.bloodType}</div>
          )}
        </div>
        
        <div className="input-group" style={{ marginBottom: 0 }}>
          <span className="input-label text-xs uppercase tracking-widest font-bold">Weight (kg)</span>
          {isEditing ? (
            <input type="number" className="input-field" value={formData.weight || ''} onChange={(e) => handleNestedChange('weight', null, e.target.value)} placeholder="e.g. 75" />
          ) : (
            <div style={{ padding: '16px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>{formData.weight ? `${formData.weight} kg` : 'Not Set'}</div>
          )}
        </div>
      </div>

      <div className="glass-panel mb-6 animate-in stagger-4">
        <h3 className="font-display font-semibold text-[var(--accent-amber)] mb-4 flex items-center gap-2">Medical History</h3>

        <div className="input-group">
          <span className="input-label text-xs uppercase tracking-widest font-bold">Allergies</span>
          {isEditing ? (
            <input className="input-field" value={formData.allergies} onChange={(e) => setFormData({...formData, allergies: e.target.value})} />
          ) : (
            <div style={{ padding: '16px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', border: '1px solid var(--glass-border)', color: formData.allergies && formData.allergies !== 'None known' ? 'var(--accent-amber)' : 'inherit' }}>{formData.allergies}</div>
          )}
        </div>

        <div className="input-group">
          <span className="input-label text-xs uppercase tracking-widest font-bold">Conditions</span>
          {isEditing ? (
            <input className="input-field" value={formData.conditions || ''} onChange={(e) => handleNestedChange('conditions', null, e.target.value)} placeholder="e.g. Asthma, Diabetes" />
          ) : (
            <div style={{ padding: '16px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>{formData.conditions || 'None'}</div>
          )}
        </div>

        <div className="input-group" style={{ marginBottom: 0 }}>
          <span className="input-label text-xs uppercase tracking-widest font-bold">Medications</span>
          {isEditing ? (
            <input className="input-field" value={formData.medications || ''} onChange={(e) => handleNestedChange('medications', null, e.target.value)} placeholder="e.g. Inhaler" />
          ) : (
            <div style={{ padding: '16px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>{formData.medications || 'None'}</div>
          )}
        </div>
      </div>

      <div className="glass-panel animate-in stagger-4" style={{ animationDelay: '250ms' }}>
        <h3 className="font-display font-semibold text-[var(--accent-emerald)] mb-4 flex items-center gap-2"><Phone size={18} /> Primary Contact</h3>
        
        <div className="input-group">
          <span className="input-label text-xs uppercase tracking-widest font-bold">Name & Relation</span>
          {isEditing ? (
            <input className="input-field" value={formData.emergencyContact1?.name} onChange={(e) => handleNestedChange('emergencyContact1', 'name', e.target.value)} />
          ) : (
            <div style={{ padding: '16px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>{formData.emergencyContact1?.name} ({formData.emergencyContact1?.relation})</div>
          )}
        </div>
        
        <div className="input-group" style={{ marginBottom: 0 }}>
          <span className="input-label text-xs uppercase tracking-widest font-bold">Comm Link</span>
          {isEditing ? (
            <input className="input-field" value={formData.emergencyContact1?.phone} onChange={(e) => handleNestedChange('emergencyContact1', 'phone', e.target.value)} />
          ) : (
            <div style={{ padding: '16px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>{formData.emergencyContact1?.phone}</div>
          )}
        </div>
      </div>

    </div>
  );
}
