import React from 'react';
import { useLanguage } from '../../../context/LanguageContext';

const TavernInterior = ({ heroes, stats, onRecruit, formatNumber }) => {
    const { t } = useLanguage();
    const recruitCost = 100; // Hardcoded for now, could be passed or derived

    return (
        <div className="tavern-interior">
            {/* Intro Text - Removed as per user request */}

            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '15px',
                alignItems: 'center',
                padding: '15px',
                backgroundColor: 'rgba(93, 64, 55, 0.1)', // Light brown tint 
                border: '1px solid #8d6e63',
                borderRadius: '8px'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <strong style={{ color: '#3e2723' }}>Rekruteer een Nieuwe Held</strong>
                </div>

                <button
                    className="btn"
                    onClick={onRecruit}
                    disabled={heroes.length >= 10} // Disable if full
                    style={{
                        padding: '8px 16px',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        backgroundColor: heroes.length >= 10 ? '#95a5a6' : (stats.gold >= recruitCost ? '#27ae60' : '#7f8c8d'),
                        color: 'white',
                        border: '1px solid #fff',
                        borderRadius: '4px',
                        cursor: heroes.length >= 10 ? 'not-allowed' : 'pointer',
                        opacity: (heroes.length >= 10 || stats.gold < recruitCost) ? 0.6 : 1,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '8px',
                        minWidth: '120px',
                        boxShadow: (heroes.length < 10 && stats.gold >= recruitCost) ? '0 2px 5px rgba(0,0,0,0.5)' : 'none'
                    }}
                >
                    {heroes.length >= 10 ? (
                        <span>Vol (10/10)</span>
                    ) : (
                        <>
                            <span>🍺</span>
                            <span>{formatNumber(recruitCost)}</span>
                        </>
                    )}
                </button>
            </div>

            <div style={{ marginTop: '20px', fontSize: '0.9rem' }}>
                <h4 style={{ borderBottom: '1px solid #8d6e63', paddingBottom: '5px', color: '#3e2723' }}>Huidige Helden ({heroes.length}/10)</h4>
                <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {heroes.length === 0 ? (
                        <div style={{ color: '#5d4037', fontStyle: 'italic', textAlign: 'center' }}>Geen helden in dienst...</div>
                    ) : (
                        heroes.map(hero => (
                            <div key={hero.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 10px', background: 'rgba(93, 64, 55, 0.15)', borderRadius: '4px', border: '1px solid rgba(141, 110, 99, 0.3)' }}>
                                <span style={{ color: '#3e2723' }}>{hero.name} (Lvl {hero.lvl})</span>
                                <span style={{ color: hero.hp < hero.maxHp * 0.5 ? '#d32f2f' : '#2e7d32', fontWeight: 'bold' }}>
                                    HP: {hero.hp}/{hero.maxHp}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default TavernInterior;
