import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import '../../css/components.css'; // Corrected path to root css folder

const OnboardingModal = ({ onClose }) => {
    const { t } = useLanguage();

    return (
        <div className="modal-overlay" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10000
        }}>
            <div className="modal-content" style={{
                background: '#fff',
                padding: '2rem',
                borderRadius: '8px',
                maxWidth: '500px',
                textAlign: 'center',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                border: '2px solid #D4AF37' // Gold border for Roman feel
            }}>
                <h2 style={{ color: '#800020', marginBottom: '1rem' }}>{t('onboarding_title')}</h2>
                <p style={{ lineHeight: '1.6', marginBottom: '2rem', color: '#333' }}>
                    {t('onboarding_text')}
                </p>
                <button
                    className="btn-primary"
                    onClick={onClose}
                    style={{
                        padding: '10px 20px',
                        fontSize: '1.1rem',
                        background: '#800020', // Roman Red
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    {t('btn_start_reign')}
                </button>
            </div>
        </div>
    );
};

export default OnboardingModal;
