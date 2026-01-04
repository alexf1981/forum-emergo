import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import Icons from '../Icons';
import * as GameLogic from '../../logic/gameLogic';

const BuildingModal = ({ building, buildings, onClose, onUpgrade, children, formatNumber, playerGold }) => {
    const { t } = useLanguage();

    // Helper: Localized Building Name with Roman Numeral
    const getLocalizedName = (type, level) => {
        const base = t(`building_${type}`);
        const romans = ["", "I", "II", "III", "IV", "V"];
        const num = (level >= 1 && level < romans.length) ? romans[level] : level;
        return `${base} ${num}`;
    };

    // Helper: Localized Benefit Text
    const getLocalizedBenefit = (type, level) => {
        if (level === 0) return "-";

        switch (type) {
            case 'town_hall':
                const mult = GameLogic.TOWN_HALL_MULTIPLIERS[level] || 1;
                const reward = GameLogic.BASE_TASK_GOLD * mult;
                return t('benefit_town_hall', { amount: reward });
            case 'house':
                const pop = GameLogic.POPULATION_PER_LEVEL[level] || 0;
                return t('benefit_house', { amount: pop });
            case 'library':
                const caps = GameLogic.RESEARCH_CAPS[level];
                if (!caps) return "-";
                return t('benefit_library', { tax: caps.tax, interest: caps.interest });
            case 'market':
                if (level === 1) return t('benefit_market_unlock');
                return t('benefit_market_prices');
            case 'tavern':
                const heroCap = GameLogic.TAVERN_CAPS[level] || 0;
                return t('benefit_tavern', { amount: heroCap });
            default:
                return t('benefit_unknown');
        }
    };

    return (
        <div className="building-modal-overlay" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 3000, // Significantly higher to ensure it's above hero bar (often 1000-2000)
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)', // Slightly darker
            backdropFilter: 'blur(2px)', // Nice effect
            padding: '20px', // Ensure 20px gap from all screen edges
            paddingTop: '80px', // Extra visual breathing room from top (and avoids notch/browser bars)
            animation: 'fadeIn 0.2s ease-out'
        }} onClick={onClose}>

            {/* Modal Content - Floating Page */}
            <div className="modal-content" style={{
                position: 'relative',
                width: '95%', // Responsive width
                maxWidth: '600px',
                maxHeight: '85vh', // Ensure it fits in viewport height
                display: 'flex',
                flexDirection: 'column',
                padding: '0',
                overflow: 'hidden',
                animation: 'slideUp 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28)',
                background: '#f4e4bc',
                borderRadius: '8px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.5)' // Floating shadow
            }} onClick={(e) => e.stopPropagation()}>

                {/* Optional Header Image Banner */}
                {building.headerImage ? (
                    <div style={{
                        width: '100%',
                        height: '100px', // Reduced height
                        backgroundImage: `url("${building.headerImage}")`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        position: 'relative',
                        borderBottom: '4px solid #5d4037'
                    }}>
                        {/* Title Overlay on Image */}
                        <div style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            background: 'rgba(0,0,0,0.6)',
                            color: '#f1c40f',
                            padding: '5px 15px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <h2 style={{ margin: 0, fontFamily: 'Trajan Pro, serif', fontSize: '1.2rem', textShadow: '2px 2px 0px #000' }}>
                                {getLocalizedName(building.type || building.id, building.level)} <span style={{ fontSize: '0.6em', color: '#ddd' }}>({t('lbl_level')} {building.level})</span>
                            </h2>
                            {(() => {
                                // Logic inside IIFE to keep it self-contained within this render block for the header
                                if (building.level >= 5) {
                                    return (
                                        <button disabled style={{
                                            background: '#95a5a6', // Grey for Max
                                            border: '1px solid #fff',
                                            color: 'white',
                                            borderRadius: '4px',
                                            padding: '8px 16px',
                                            fontSize: '0.9rem',
                                            fontWeight: 'bold',
                                            cursor: 'not-allowed',
                                            marginLeft: 'auto',
                                            marginRight: '30px',
                                            minWidth: '120px',
                                            opacity: 0.7,
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center'
                                        }}>
                                            {t('lbl_max')}
                                        </button>
                                    );
                                }

                                const type = building.type || building.id;
                                const nextLvl = (building.level !== undefined ? building.level : 0) + 1;
                                const cost = GameLogic.UPGRADE_COSTS[type]?.[nextLvl] || 0;
                                const canAfford = playerGold >= cost;

                                let isRestricted = false;
                                if (type !== 'town_hall' && buildings) {
                                    const townHallLevel = GameLogic.getTownHallLevel(buildings);
                                    if (nextLvl > townHallLevel) {
                                        isRestricted = true;
                                    }
                                }

                                return (
                                    <button
                                        onClick={() => onUpgrade(building.id)}
                                        style={{
                                            background: (isRestricted || !canAfford) ? '#7f8c8d' : '#27ae60',
                                            border: '1px solid #fff',
                                            color: 'white',
                                            borderRadius: '4px',
                                            padding: '8px 16px',
                                            fontSize: '0.9rem',
                                            fontWeight: 'bold',
                                            cursor: 'pointer',
                                            boxShadow: (isRestricted || !canAfford) ? 'none' : '0 2px 5px rgba(0,0,0,0.5)',
                                            marginLeft: 'auto',
                                            marginRight: '30px',
                                            minWidth: '120px',
                                            opacity: (isRestricted || !canAfford) ? 0.6 : 1,
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}
                                    >
                                        {isRestricted ? (
                                            <><span>🔒</span><span style={{ fontWeight: 'bold' }}>{t('lbl_locked')}</span></>
                                        ) : (
                                            <>
                                                <span>⬆️</span>
                                                <span>{formatNumber ? formatNumber(cost) : cost}</span>
                                            </>
                                        )}
                                    </button>
                                );
                            })()}
                        </div>
                        {/* Close X inside banner */}
                        <button onClick={onClose} style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            background: 'rgba(0,0,0,0.6)',
                            border: '2px solid #fff',
                            borderRadius: '50%',
                            width: '32px', // Larger for touch
                            height: '32px',
                            color: '#fff',
                            fontSize: '1.2rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            lineHeight: 1,
                            zIndex: 10
                        }}>×</button>
                    </div>
                ) : (
                    /* Standard Header (only if no image) */
                    <div className="modal-header" style={{ borderBottom: '2px solid #8d6e63' }}>
                        <h2 style={{ margin: 0, color: '#5d4037' }}>
                            {getLocalizedName(building.type || building.id, building.level)} <span style={{ fontSize: '0.6em', color: '#8d6e63' }}>({t('lbl_level')} {building.level})</span>
                        </h2>
                        <button className="btn-icon" onClick={onClose} style={{ color: '#5d4037' }}><Icons.X /></button>
                    </div>
                )}

                {/* Body */}
                <div className="modal-body" style={{
                    padding: '20px',
                    overflowY: 'auto',
                    overscrollBehavior: 'contain' // Prevent background scroll
                }}>
                    {children}
                    {/* UPGRADE TABLE - HouseInterior Style */}
                    <div style={{ marginTop: '20px', color: '#2c3e50' }}>
                        <h3 style={{ borderBottom: '2px solid #7f8c8d', paddingBottom: '5px', marginBottom: '10px', fontSize: '1.1rem' }}>
                            {t(`building_${building.type}`)} {t('lbl_stats')}
                        </h3>

                        {/* Removed specific scrolling implementation here to let the modal body scroll */}
                        <div style={{ overflowX: 'auto' }}>
                            <table className="upgrade-table">
                                <thead>
                                    <tr style={{ background: '#ecf0f1', borderBottom: '2px solid #bdc3c7' }}>
                                        <th className="upgrade-cell">{t('lbl_level')}</th>
                                        <th className="upgrade-cell">{t('lbl_name')}</th>
                                        <th className="upgrade-cell">{t('lbl_effect')}</th>
                                        <th className="upgrade-cell">{t('lbl_cost')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[1, 2, 3, 4, 5].map(lvl => {
                                        const type = building.type || building.id;
                                        const cost = GameLogic.UPGRADE_COSTS[type]?.[lvl] || (lvl === 1 ? GameLogic.BUILDING_COSTS[type] : 0);
                                        const benefit = getLocalizedBenefit(type, lvl);
                                        const name = getLocalizedName(type, lvl);
                                        const isCurrent = building.level === lvl;

                                        return (
                                            <tr key={lvl} style={{
                                                background: isCurrent ? '#ebf5fb' : 'transparent',
                                                fontWeight: isCurrent ? 'bold' : 'normal',
                                                color: isCurrent ? '#2980b9' : '#2c3e50',
                                                borderBottom: '1px solid #bdc3c7'
                                            }}>
                                                <td className="upgrade-cell">{lvl}</td>
                                                <td className="upgrade-cell">{name}</td>
                                                <td className="upgrade-cell">{benefit}</td>
                                                <td className="upgrade-cell">
                                                    {lvl === 1 && cost === 0 ? '-' : (
                                                        <>
                                                            {formatNumber ? formatNumber(cost) : cost} <span style={{ fontSize: '0.8em' }}>🪙</span>
                                                        </>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <div style={{ marginTop: '10px', fontStyle: 'italic', fontSize: '0.8rem', color: '#7f8c8d' }}>
                            * {t('txt_upgrade_building')}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                
                .upgrade-table {
                    width: 100%;
                    min-width: 300px;
                    border-collapse: collapse;
                    font-size: 0.9rem;
                }
                .upgrade-cell {
                    padding: 10px;
                    text-align: left;
                }
                
                @media (max-width: 400px) {
                    .upgrade-table {
                        font-size: 0.8rem;
                        min-width: 100%; /* Allow shrinking below 300px */
                    }
                    .upgrade-cell {
                        padding: 6px 4px; /* Tighter padding */
                    }
                }
            `}</style>
        </div>
    );
};

export default BuildingModal;
