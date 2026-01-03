import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import Icons from '../Icons';

const AdventureView = () => {
    const { t } = useLanguage();

    return (
        <div style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '40px',
            color: '#555'
        }}>
            <div style={{
                fontSize: '64px',
                marginBottom: '20px',
                opacity: 0.5
            }}>
                ⚔️
            </div>
            <h2 style={{
                fontSize: '24px',
                marginBottom: '10px',
                color: '#8E1600'
            }}>
                {t('adventure_wip_title')}
            </h2>
            <p style={{
                maxWidth: '400px',
                lineHeight: '1.6'
            }}>
                {t('adventure_wip_desc')}
            </p>
        </div>
    );
};

export default AdventureView;
