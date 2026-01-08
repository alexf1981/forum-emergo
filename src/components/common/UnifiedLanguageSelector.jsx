import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../locales/translations';
import Flag from '../layout/Flag';

const UnifiedLanguageSelector = ({ style }) => {
    const { language, changeLanguage } = useLanguage();

    return (
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', ...style }}>
            {Object.keys(translations).map(langKey => (
                <button
                    key={langKey}
                    onClick={() => changeLanguage(langKey)}
                    style={{
                        background: 'none',
                        border: language === langKey ? '2px solid var(--color-gold)' : '2px solid transparent',
                        borderRadius: '6px', // Rectangular with slight rounding
                        width: '48px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        padding: '0',
                        overflow: 'hidden',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        transform: language === langKey ? 'scale(1.15)' : 'scale(1)',
                        boxShadow: language === langKey ? '0 0 10px rgba(255, 215, 0, 0.5)' : 'none'
                    }}
                    title={translations[langKey].name}
                    aria-label={`Select ${translations[langKey].name}`}
                >
                    <Flag code={langKey} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
            ))}
        </div>
    );
};

export default UnifiedLanguageSelector;
