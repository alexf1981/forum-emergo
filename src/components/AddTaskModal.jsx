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
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Nieuwe taak toevoegen</h2>
                    <button className="btn-icon" onClick={onClose}><Icons.X /></button>
                </div>

                <div className="modal-body">
                    <div className="modal-form-group">
                        <label>Omschrijving:</label>
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
                        />
                    </div>

                    <div className="modal-form-group">
                        <label>Aangemaakt:</label>
                        <div className="date-display">{today}</div>
                    </div>

                    <div className="modal-form-group">
                        <div className="modal-radio-group">
                            {[
                                { value: 'virtue', label: 'Virtus', color: '#4CAF50' },
                                { value: 'vice', label: 'Barbarium', color: '#F44336' },
                                { value: 'todo', label: 'Mandatum', color: '#2196F3' }
                            ].map((option) => (
                                <label key={option.value} className="modal-radio-label" style={{ background: type === option.value ? 'rgba(0,0,0,0.05)' : 'transparent' }}>
                                    <input
                                        type="radio"
                                        name="type"
                                        value={option.value}
                                        checked={type === option.value}
                                        onChange={e => handleTypeChange(e.target.value)}
                                        style={{ display: 'none' }}
                                    />
                                    <span className="modal-radio-indicator" style={{
                                        border: `2px solid ${option.color}`,
                                        background: type === option.value ? option.color : 'transparent',
                                    }}></span>
                                    <span className="modal-radio-text" style={{ fontWeight: type === option.value ? 'bold' : 'normal', color: type === option.value ? option.color : 'inherit' }}>
                                        {option.label}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="modal-form-group">
                        <label className="modal-checkbox-label" style={{ cursor: type === 'todo' ? 'not-allowed' : 'pointer', opacity: type === 'todo' ? 0.5 : 1 }}>
                            <input
                                type="checkbox"
                                checked={isRecurring}
                                onChange={e => setIsRecurring(e.target.checked)}
                                disabled={type === 'todo'}
                            />
                            Repeterend?
                        </label>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn" onClick={onClose}>ANNULEER</button>
                        <button type="button" className="btn" onClick={() => handleSubmit(null, true)}>OK & NIEUWE</button>
                        <button type="button" className="btn" onClick={() => handleSubmit(null, false)}>OK</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AddTaskModal;
