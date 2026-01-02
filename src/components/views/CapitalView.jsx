import React, { useState } from 'react';
import { useCity } from '../../hooks/useCity';
import CityLayout from '../city/CityLayout';
import { useLanguage } from '../../context/LanguageContext';

const CapitalView = ({ stats, formatNumber }) => {
    const { t } = useLanguage();
    const { buildings, resources, upgradeBuilding, buildBuilding } = useCity();

    // UI State for selection
    const [selectedBuilding, setSelectedBuilding] = useState(null);

    const handleBuildHouse = () => {
        // Random position
        const x = 20 + Math.random() * 60;
        const y = 30 + Math.random() * 40; // Adjusted for overlay space
        buildBuilding('house', x, y);
    };

    return (
        <div className="capital-view" style={{
            position: 'fixed', // Force full viewport coverage
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 50, // Below Nav (1000) and Header (2000), but above base background
            overflow: 'hidden',
            backgroundColor: '#000'
        }}>
            {/* Main City Background Layer */}
            <CityLayout
                buildings={buildings}
                // When a building is clicked from the layout
                onBuildingClick={(b) => setSelectedBuilding(b)}
            />

            {/* Top Overlay: Header / Resources */}
            <div className="capital-overlay-top" style={{
                position: 'absolute',
                top: '70px', // Below the Hero Header
                left: '10px',
                right: '10px',
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px 15px',
                background: 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(4px)',
                borderRadius: '8px',
                color: 'white',
                zIndex: 10,
                boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.1)'
            }}>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem', textShadow: '0 2px 4px black' }}>
                    {t('nav_city') || 'Stad'}
                </div>
                <div style={{ display: 'flex', gap: '15px', fontWeight: '500' }}>
                    <span title="Goud">🪙 {formatNumber(stats.gold)}</span>
                    <span title="Hout">🌲 {formatNumber(resources.wood)}</span>
                    <span title="Steen">🪨 {formatNumber(resources.stone)}</span>
                </div>
            </div>

            {/* Bottom Overlay: Actions */}
            <div className="capital-overlay-bottom" style={{
                position: 'absolute',
                bottom: '90px', // Above BottomNav
                right: '20px',
                zIndex: 10
            }}>
                <button
                    className="btn primary-btn-bounce"
                    onClick={handleBuildHouse}
                    style={{
                        boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
                        border: '2px solid #fff',
                        backgroundColor: '#27ae60',
                        fontSize: '1rem',
                        padding: '12px 24px'
                    }}
                >
                    🏗️ Bouw Huis (50g)
                </button>
            </div>

            {/* Selection/Info Toast */}
            {selectedBuilding && (
                <div style={{
                    position: 'absolute',
                    top: '140px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(255, 255, 255, 0.95)',
                    color: '#2c3e50',
                    padding: '10px 20px',
                    borderRadius: '30px',
                    zIndex: 20,
                    fontWeight: 'bold',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
                    animation: 'fadeIn 0.3s ease',
                    cursor: 'pointer'
                }} onClick={() => setSelectedBuilding(null)}>
                    Geselecteerd: {selectedBuilding.name} (Lvl {selectedBuilding.level})
                </div>
            )}
        </div>
    );
};

export default CapitalView;
