import React from 'react';
import * as GameLogic from '../../../logic/gameLogic';

const LibraryInterior = ({ research, doResearch, stats, buildings }) => {

    const ResearchOption = ({ typeId }) => {
        const def = GameLogic.RESEARCH_TYPES[typeId];
        const level = research[typeId] || 0;
        const cost = GameLogic.getResearchCost(typeId, level);
        const libLevel = GameLogic.getLibraryLevel(buildings);
        const cap = GameLogic.getResearchCap(typeId, libLevel);

        const isMaxed = level >= def.maxLevel;
        const isCapped = level >= cap;
        const canAfford = stats.gold >= cost;

        return (
            <div style={{
                background: 'rgba(255, 255, 255, 0.7)',
                padding: '15px',
                marginBottom: '10px',
                borderRadius: '8px',
                border: '1px solid #dcdde1',
                display: 'flex',
                flexWrap: 'wrap', // Responsive wrapping
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '15px'
            }}>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#2c3e50' }}>{def.name}</h3>
                        <span style={{ background: '#34495e', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '0.8rem' }}>
                            Lvl {level} / {cap}
                        </span>
                    </div>
                    <p style={{ margin: '5px 0', fontSize: '0.9rem', color: '#7f8c8d' }}>
                        {def.desc}
                    </p>
                </div>

                <button
                    className="btn"
                    onClick={() => doResearch(typeId)}
                    disabled={isMaxed}
                    style={{
                        background: isMaxed ? '#95a5a6' : ((isCapped || !canAfford) ? '#7f8c8d' : '#27ae60'), // Changed Blue to Green
                        border: '1px solid #fff', // Added white border for consistency
                        borderRadius: '4px', // Ensured 4px radius
                        color: 'white',
                        padding: '8px 16px',
                        cursor: isMaxed ? 'not-allowed' : 'pointer',
                        opacity: isMaxed ? 0.7 : ((isCapped || !canAfford) ? 0.6 : 1),
                        minWidth: '120px',
                        display: 'flex',
                        flexDirection: 'row', // Horizontal layout like others
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    {isMaxed ? (
                        <span style={{ fontWeight: 'bold' }}>MAX</span>
                    ) : isCapped ? (
                        <><span>🔒</span><span style={{ fontWeight: 'bold' }}>Locked</span></>
                    ) : (
                        <>
                            <span>🪙</span>
                            <span style={{ fontWeight: 'bold' }}>{GameLogic.kFormat ? GameLogic.kFormat(cost) : cost}</span>
                        </>
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
