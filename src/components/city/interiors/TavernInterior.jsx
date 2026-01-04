import React from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import * as GameLogic from '../../../logic/gameLogic';

const TavernInterior = ({ heroes, stats, onRecruit, formatNumber, buildings }) => {
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
                    <strong style={{ color: '#3e2723' }}>{t('header_tavern')}</strong>
                </div>

                {(() => {
                    const tavern = buildings ? buildings.find(b => b.type === 'tavern') : null;
                    const tavernLevel = tavern ? tavern.level : 0;
                    const tavernCap = GameLogic.TAVERN_CAPS[tavernLevel] || 0;

                    const isGlobalMax = heroes.length >= 10;
                    const isLevelCapped = !isGlobalMax && heroes.length >= tavernCap;
                    const canAfford = stats.gold >= recruitCost;
                    const isLocked = isLevelCapped;

                    // Button Logic:
                    // 1. Global Max -> Grey "MAX"
                    // 2. Level Capped -> Grey "Lock"
                    // 3. Poor -> Grey "Gold Icon + Cost"
                    // 4. Affordable -> Green "Gold Icon + Cost"

                    let btnColor = '#27ae60'; // Green
                    let btnDisabled = false;
                    let btnContent = null;
                    let cursorStyle = 'pointer';

                    if (isGlobalMax) {
                        btnColor = '#95a5a6'; // Grey
                        btnDisabled = true;
                        cursorStyle = 'not-allowed';
                        btnContent = <span>{t('lbl_max')}</span>;
                    } else if (isLevelCapped) {
                        btnColor = '#7f8c8d'; // Grey
                        btnDisabled = false; // Clickable for toast
                        // cursorStyle = 'pointer'; // Keep pointer to encourage click for info
                        // Or just Lock icon? User asked: "staat er een slotje op grijze knop"
                        btnContent = <span style={{ fontSize: '1.2rem' }}>🔒</span>;
                    } else if (!canAfford) {
                        btnColor = '#7f8c8d'; // Grey
                        btnDisabled = false; // Clickable for toast
                        btnContent = (
                            <>
                                <span>🪙</span>
                                <span>{formatNumber(recruitCost)}</span>
                            </>
                        );
                    } else {
                        // Affordable & Available
                        btnColor = '#27ae60';
                        btnContent = (
                            <>
                                <span>🪙</span>
                                <span>{formatNumber(recruitCost)}</span>
                            </>
                        );
                    }

                    return (
                        <button
                            className="btn"
                            onClick={onRecruit}
                            disabled={btnDisabled}
                            style={{
                                padding: '8px 16px',
                                fontSize: '1rem',
                                fontWeight: 'bold',
                                backgroundColor: btnColor,
                                color: 'white',
                                border: '1px solid #fff',
                                borderRadius: '4px',
                                cursor: cursorStyle,
                                opacity: btnDisabled ? 0.6 : 1, // Only fade if truly disabled (MAX)
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '8px',
                                minWidth: '120px',
                                boxShadow: (!btnDisabled && canAfford) ? '0 2px 5px rgba(0,0,0,0.5)' : 'none'
                            }}
                        >
                            {btnContent}
                        </button>
                    );
                })()}
            </div>

            <div style={{ marginTop: '20px', fontSize: '0.9rem' }}>
                <h4 style={{ borderBottom: '1px solid #8d6e63', paddingBottom: '5px', color: '#3e2723' }}>{t('lbl_current_heroes', { count: heroes.length, max: 10 })}</h4>
                <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {heroes.length === 0 ? (
                        <div style={{ color: '#5d4037', fontStyle: 'italic', textAlign: 'center' }}>{t('msg_no_heroes')}</div>
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
