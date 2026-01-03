import React from 'react';
import * as GameLogic from '../../../logic/gameLogic';
import { useLanguage } from '../../../context/LanguageContext';

const HouseInterior = ({ building, buildings, upgradeBuilding, stats }) => {
    const { t } = useLanguage();
    const currentLevel = building.level;
    const isMaxLevel = currentLevel >= 5;

    // TODO: move upgrade logic here if needed, but currently BuildingModal handles the button.
    // Actually BuildingModal handles the header button.
    // This interior view just shows stats.

    const rows = [1, 2, 3, 4, 5].map(level => {
        const info = GameLogic.HOUSE_LEVELS[level];
        const pop = GameLogic.POPULATION_PER_LEVEL[level];
        const cost = GameLogic.UPGRADE_COSTS.house[level] || '-'; // Lvl 1 has no upgrade cost (build cost)
        const isCurrent = level === currentLevel;

        // Determine cost display
        let costDisplay = cost;
        if (level === 1) costDisplay = GameLogic.BUILDING_COSTS.house; // Build cost

        return (
            <tr key={level} style={{
                backgroundColor: isCurrent ? 'rgba(39, 174, 96, 0.2)' : 'transparent',
                fontWeight: isCurrent ? 'bold' : 'normal',
                borderBottom: '1px solid #ccc'
            }}>
                <td style={{ padding: '10px' }}>{level}</td>
                <td style={{ padding: '10px' }}>
                    <div style={{ fontWeight: 'bold' }}>{info.name}</div>
                    <div style={{ fontSize: '0.8rem', fontStyle: 'italic', opacity: 0.8 }}>{info.desc}</div>
                </td>
                <td style={{ padding: '10px' }}>{GameLogic.toRoman ? pop : pop}</td> {/* Assuming user preference handled elsewhere or raw number fine */}
                <td style={{ padding: '10px' }}>
                    {level === 1 ? '100' : (cost || '-')}
                    {level > 1 && <span style={{ fontSize: '0.8em' }}> 🪙</span>}
                </td>
            </tr>
        );
    });

    return (
        <div style={{ padding: '10px', color: '#2c3e50' }}>
            <h3 style={{ borderBottom: '2px solid #7f8c8d', paddingBottom: '5px' }}>Woonhuis Statistieken</h3>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                <thead>
                    <tr style={{ background: '#ecf0f1', borderBottom: '2px solid #bdc3c7' }}>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Lvl</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Type</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Pop.</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Kosten</th>
                    </tr>
                </thead>
                <tbody>
                    {rows}
                </tbody>
            </table>

            <div style={{ marginTop: '20px', fontStyle: 'italic', fontSize: '0.9rem', color: '#7f8c8d' }}>
                * Hogere bevolking zorgt voor meer belastinginkomsten.
            </div>
        </div>
    );
};

export default HouseInterior;
