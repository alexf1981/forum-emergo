import React, { useState } from 'react';
import { useCity } from '../../hooks/useCity';
import CityLayout from '../city/CityLayout';
import { useLanguage } from '../../context/LanguageContext';
import BuildingModal from '../city/BuildingModal';
import TavernInterior from '../city/interiors/TavernInterior';

const CapitalView = ({ stats, heroes, actions, formatNumber }) => {
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

    const renderBuildingContent = () => {
        if (!selectedBuilding) return null;

        // Determine type - handle both ID and type properties if needed
        // Assuming ID 'tavern' matches the created mockup building
        if (selectedBuilding.type === 'tavern' || selectedBuilding.id === 'tavern') {
            return (
                <TavernInterior
                    heroes={heroes}
                    stats={stats}
                    onRecruit={actions.recruitHero}
                    formatNumber={formatNumber}
                />
            );
        }

        // Generic placeholder for now
        return (
            <div style={{ textAlign: 'center', padding: '20px' }}>
                <p>Dit gebouw is nog in constructie.</p>
                <div style={{ margin: '20px 0', opacity: 0.5 }}>🚧 🔨 🏗️</div>
                <button className="btn" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                    Upgrade (Binnenkort)
                </button>
            </div>
        );
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

            {/* Building Modal Overlay */}
            {selectedBuilding && (
                <BuildingModal
                    building={{
                        ...selectedBuilding,
                        // Dynamically add header image based on type or ID
                        headerImage: (() => {
                            const type = selectedBuilding.type || selectedBuilding.id;
                            if (type === 'town_hall') return './assets/city/town_hall.png';
                            if (type === 'tavern') return './assets/city/tavern.png';
                            if (type === 'library') return './assets/city/library.png';
                            if (type === 'market') return './assets/city/market.png';
                            if (type === 'house') return './assets/city/house.png';
                            return null;
                        })()
                    }}
                    onClose={() => setSelectedBuilding(null)}
                >
                    {renderBuildingContent()}
                </BuildingModal>
            )}

        </div>
    );
};

export default CapitalView;
