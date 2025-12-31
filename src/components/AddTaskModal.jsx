import React, { useState } from 'react';
// HMR trigger verify
import Icons from './Icons';

function AddTaskModal({ onClose, onAdd }) {
    const [text, setText] = useState('');
    const [type, setType] = useState('virtue');
    const [isRecurring, setIsRecurring] = useState(false);
    const today = new Date().toLocaleDateString('nl-NL');

    const handleTypeChange = (newType) => {
        setType(newType);
        if (newType === 'todo') {
            setIsRecurring(false);
        }
    };

    const handleSubmit = (e, keepOpen = false) => {
        if (e) e.preventDefault();
        if (!text) return;
        // bucket (one-time) is the inverse of isRecurring
        onAdd(text, type, !isRecurring);

        if (keepOpen) {
            setText('');
        } else {
            onClose();
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Nieuwe taak toevoegen</h2>
                    <button className="btn-icon" onClick={onClose}><Icons.X /></button>
                </div>

                <div className="modal-body">
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Omschrijving:</label>
                        <input
                            type="text"
                            value={text}
                            onChange={e => setText(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter' || e.keyCode === 13) {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleSubmit(e);
                                }
                            }}
                            autoFocus
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Aangemaakt:</label>
                        <div className="date-display" style={{ fontStyle: 'italic', color: '#666' }}>{today}</div>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                            {[
                                { value: 'virtue', label: 'Virtus', color: '#4CAF50' },
                                { value: 'vice', label: 'Barbarium', color: '#F44336' },
                                { value: 'todo', label: 'Mandatum', color: '#2196F3' }
                            ].map((option) => (
                                <label key={option.value} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 8px', borderRadius: '4px', border: '1px solid transparent', background: type === option.value ? 'rgba(0,0,0,0.05)' : 'transparent' }}>
                                    <input
                                        type="radio"
                                        name="type"
                                        value={option.value}
                                        checked={type === option.value}
                                        onChange={e => handleTypeChange(e.target.value)}
                                        style={{ display: 'none' }}
                                    />
                                    <span style={{
                                        display: 'inline-block',
                                        width: '16px',
                                        height: '16px',
                                        borderRadius: '50%',
                                        border: `2px solid ${option.color}`,
                                        background: type === option.value ? option.color : 'transparent',
                                        transition: 'all 0.2s'
                                    }}></span>
                                    <span style={{ fontWeight: type === option.value ? 'bold' : 'normal', color: type === option.value ? option.color : 'inherit' }}>
                                        {option.label}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ cursor: type === 'todo' ? 'not-allowed' : 'pointer', opacity: type === 'todo' ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <input
                                type="checkbox"
                                checked={isRecurring}
                                onChange={e => setIsRecurring(e.target.checked)}
                                disabled={type === 'todo'}
                            />
                            Repeterend?
                        </label>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                        <button type="button" className="btn" style={{ background: '#ccc', borderColor: '#999', color: '#333' }} onClick={onClose}>ANNULEER</button>
                        <button type="button" className="btn" onClick={() => handleSubmit(null, true)}>OK & NIEUWE</button>
                        <button type="button" className="btn" onClick={() => handleSubmit(null, false)}>OK</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AddTaskModal;
