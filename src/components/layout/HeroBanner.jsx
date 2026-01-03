import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

const HeroBanner = ({ isCompact = false, className = '', style = {} }) => {
    const { t } = useLanguage();

    return (
        <div
            className={`hero-banner ${isCompact ? 'compact' : ''} ${className}`}
            style={style}
        >
            <div className="hero-overlay header-content">
                <h1>Forum Emergo</h1>
                <div className="subtitle">{t('subtitle')}</div>
            </div>
        </div>
    );
};

export default HeroBanner;
