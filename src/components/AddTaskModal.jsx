import React, { useState } from 'react';
import UnifiedModal from './layout/UnifiedModal';
import UnifiedButton from './common/UnifiedButton';
import { useLanguage } from '../context/LanguageContext';

function AddTaskModal({ onClose, onAdd }) {
    const { t, language } = useLanguage();
    const [text, setText] = useState('');
    const [type, setType] = useState('virtue');
    const [isRecurring, setIsRecurring] = useState(false);

    // Dynamic locale based on language
    const localeMap = {
        nl: 'nl-NL',
        en: 'en-US',
        de: 'de-DE',
        es: 'es-ES'
    };
    const today = new Date().toLocaleDateString(localeMap[language] || 'en-US');

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
        <UnifiedModal
            isOpen={true}
            onClose={onClose}
            title={t('title_add_task')}
        >
            <div className="modal-body" style={{ padding: '0 20px 20px 20px' }}>
                <div className="modal-form-group">
                    <label>{t('lbl_description')}:</label>
                    <input
                        type="text"
                        value={text}
                        onChange={e => setText(e.target.value)}
                        autoFocus
                        style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                    />
                </div>

                <div className="modal-form-group">
                    <label>{t('lbl_created')}:</label>
                    <div className="date-display">{today}</div>
                </div>

                <div className="modal-form-group">
                    <div className="modal-radio-group">
                        {[
                            { value: 'virtue', label: t('lbl_virtue') },
                            { value: 'vice', label: t('lbl_vice') },
                            { value: 'todo', label: t('lbl_todo') }
                        ].map((option) => (
                            <label
                                key={option.value}
                                className={`modal-radio-label type-${option.value} ${type === option.value ? 'selected' : ''}`}
                            >
                                <input
                                    type="radio"
                                    name="type"
                                    value={option.value}
                                    checked={type === option.value}
                                    onChange={e => handleTypeChange(e.target.value)}
                                    style={{ display: 'none' }}
                                />
                                <span className="modal-radio-indicator"></span>
                                <span className="modal-radio-text">
                                    {option.label}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="modal-form-group">
                    <label className={`modal-checkbox-label ${type === 'todo' ? 'disabled' : ''}`}>
                        <input
                            type="checkbox"
                            checked={isRecurring}
                            onChange={e => setIsRecurring(e.target.checked)}
                            disabled={type === 'todo'}
                        />
                        {t('lbl_recurring')}
                    </label>
                </div>

                <div className="modal-actions" style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end' }}>
                    <UnifiedButton variant="primary" onClick={() => handleSubmit(null, true)}>{t('btn_ok_new').toUpperCase()}</UnifiedButton>
                    <UnifiedButton variant="primary" onClick={() => handleSubmit(null, false)}>OK</UnifiedButton>
                </div>
            </div>
        </UnifiedModal>
    );
}

export default AddTaskModal;
