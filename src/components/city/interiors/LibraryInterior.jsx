import React from 'react';
import * as GameLogic from '../../../logic/gameLogic';

const LibraryInterior = ({ research, doResearch, stats }) => {

    const ResearchOption = ({ typeId }) => {
        const def = GameLogic.RESEARCH_TYPES[typeId];
        const level = research[typeId] || 0;
        const cost = GameLogic.getResearchCost(typeId, level);
        const isMaxed = level >= def.maxLevel;
        const canAfford = stats.gold >= cost;

        return (
            <div style={{
                background: 'rgba(255, 255, 255, 0.7)',
                padding: '15px',
                marginBottom: '10px',
                borderRadius: '8px',
                border: '1px solid #dcdde1',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '15px'
            }}>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#2c3e50' }}>{def.name}</h3>
                        <span style={{ background: '#34495e', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '0.8rem' }}>
                            Lvl {level} / {def.maxLevel}
                        </span>
                    </div>
                    <p style={{ margin: '5px 0', fontSize: '0.9rem', color: '#7f8c8d' }}>
                        {def.desc}
                    </p>
                </div>

                <button
                    className="btn"
                    onClick={() => doResearch(typeId)}
                    disabled={isMaxed || !canAfford}
                    style={{
                        background: isMaxed ? '#95a5a6' : (canAfford ? '#3498db' : '#e74c3c'),
                        border: 'none',
                        color: 'white',
                        padding: '10px 15px',
                        cursor: (isMaxed || !canAfford) ? 'not-allowed' : 'pointer',
                        opacity: (isMaxed || !canAfford) ? 0.7 : 1,
                        minWidth: '100px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                    }}
                >
                    <span style={{ fontWeight: 'bold' }}>
                        {isMaxed ? 'MAX' : 'Onderzoek'}
                    </span>
                    {!isMaxed && (
                        <span style={{ fontSize: '0.8rem' }}>
                            🪙 {cost}
                        </span>
                    )}
                </button>
            </div>
        );
    };

    return (
        <div style={{ padding: '20px', color: '#2c3e50' }}>
            <div style={{ borderBottom: '2px solid #34495e', marginBottom: '20px', paddingBottom: '10px' }}>
                <h2 style={{ margin: 0 }}>Koninklijke Bibliotheek</h2>
                <p style={{ margin: '5px 0 0 0', fontStyle: 'italic', opacity: 0.8 }}>
                    Vergaar kennis om uw rijk efficiënter te besturen.
                </p>
            </div>

            <div className="research-list">
                <ResearchOption typeId="tax" />
                <ResearchOption typeId="interest" />
            </div>
        </div>
    );
};

export default LibraryInterior;
