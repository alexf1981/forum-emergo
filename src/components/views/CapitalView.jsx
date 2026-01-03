import React, { useState } from 'react';
import { useCity } from '../../hooks/useCity';
import CityLayout from '../city/CityLayout';
import { useLanguage } from '../../context/LanguageContext';
import BuildingModal from '../city/BuildingModal';
import TavernInterior from '../city/interiors/TavernInterior';
import TownHallInterior from '../city/interiors/TownHallInterior';

const CapitalView = ({ stats, heroes, actions, formatNumber }) => {
    const { t } = useLanguage();
    const { buildings, resources, upgradeBuilding, buildBuilding } = useCity();

    // UI State for selection
    const [selectedBuildingId, setSelectedBuildingId] = useState(null);
    const [isEditMode, setIsEditMode] = useState(localStorage.getItem('CITY_EDIT_MODE') === 'true');
    // Local state for dragging visual updates
    const [localBuildings, setLocalBuildings] = useState(buildings);

    // Sync local state when buildings prop changes (e.g. initial load or upgrades)
    React.useEffect(() => {
        setLocalBuildings(buildings);
    }, [buildings]);

    // Listen for Edit Mode changes from Admin Panel
    React.useEffect(() => {
        const handleEditModeChange = () => {
            setIsEditMode(localStorage.getItem('CITY_EDIT_MODE') === 'true');
        };

        window.addEventListener('city-edit-mode-change', handleEditModeChange);
        window.addEventListener('storage', handleEditModeChange);

        return () => {
            window.removeEventListener('city-edit-mode-change', handleEditModeChange);
            window.removeEventListener('storage', handleEditModeChange);
        };
    }, []);

    const selectedBuilding = selectedBuildingId
        ? buildings.find(b => b.id === selectedBuildingId)
        : null;

    const renderBuildingContent = () => {
        // ... (keep existing renderBuildingContent logic)
        if (!selectedBuilding) return null;
        const type = selectedBuilding.type || selectedBuilding.id;
        if (type === 'town_hall') {
            return (
                <TownHallInterior
                    onClose={() => setSelectedBuildingId(null)}
                    buildings={buildings}
                    buildBuilding={buildBuilding}
                    resources={resources}
                    stats={stats}
                />
            );
        }
        if (type === 'tavern') {
            return (
                <TavernInterior
                    heroes={heroes}
                    stats={stats}
                    onRecruit={actions.recruitHero}
                    formatNumber={formatNumber}
                />
            );
        }
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

    // Drag Logic updates local state
    const handleLocalMove = (id, newX, newY) => {
        setLocalBuildings(prev => prev.map(b =>
            b.id === id ? { ...b, x: newX, y: newY } : b
        ));
    };

    const handleExportCoords = () => {
        console.log('--- EXPORT COORDINATES ---');
        localBuildings.forEach(b => {
            console.log(`Building '${b.type || b.id}': { x: ${Math.round(b.x)}, y: ${Math.round(b.y)} }`);
        });
        alert('Coordinaten geëxporteerd naar Console (F12)');
    };

    return (
        <div className="capital-view" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 50,
            overflow: 'hidden',
            backgroundColor: '#000'
        }}>
            {/* Main City Background Layer */}
            <CityLayout
                buildings={localBuildings} // Use local moved state
                // When a building is clicked from the layout
                onBuildingClick={(b) => setSelectedBuildingId(b.id)}
                // Enable dragging ONLY if Edit Mode is active
                onBuildingMove={isEditMode ? handleLocalMove : null}
            />

            {/* Top Overlay: Header / Resources */}
            <div className="capital-overlay-top" style={{
                position: 'absolute',
                top: '70px',
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
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem', textShadow: '0 2px 4px black', display: 'flex', alignItems: 'center' }}>
                    {t('nav_city') || 'Stad'}
                    {isEditMode && (
                        <>
                            <span style={{ fontSize: '0.7em', color: '#e74c3c', marginLeft: '10px', background: 'white', padding: '0 4px', borderRadius: '4px', marginRight: '10px' }}>🛠️ ADMIN</span>
                            <button onClick={handleExportCoords} style={{ fontSize: '0.7rem', cursor: 'pointer', padding: '2px 5px' }}>💾 Export Coords</button>
                        </>
                    )}
                </div>
                <div style={{ display: 'flex', gap: '15px', fontWeight: '500' }}>
                    <span title="Goud">🪙 {formatNumber(stats.gold)}</span>
                    <span title="Hout">🌲 {formatNumber(resources.wood)}</span>
                    <span title="Steen">🪨 {formatNumber(resources.stone)}</span>
                </div>
            </div>

            {/* Bottom Overlay: Actions - REMOVED as per request */}
            {/* The construction now happens INSIDE the Town Hall */}

            {/* Building Modal Overlay */}
            {selectedBuilding && (
                <BuildingModal
                    building={{
                        ...selectedBuilding,
                        // Dynamically add header image based on type or ID
                        headerImage: (() => {
                            const type = selectedBuilding.type || selectedBuilding.id;
                            if (type === 'town_hall') return `./assets/city/town_hall_${selectedBuilding.level || 1}.png`;
                            if (type === 'tavern') return './assets/city/tavern.png';
                            if (type === 'library') return './assets/city/library.png';
                            if (type === 'market') return './assets/city/market.png';
                            if (type === 'house') return './assets/city/house.png';
                            return null;
                        })()
                    }}
                    onClose={() => setSelectedBuildingId(null)}
                    onUpgrade={upgradeBuilding}
                >
                    {renderBuildingContent()}
                </BuildingModal>
            )}

        </div>
    );
};

export default CapitalView;
