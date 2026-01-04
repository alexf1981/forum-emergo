import React, { useState } from 'react';
import CityLayout from '../city/CityLayout';
import { useLanguage } from '../../context/LanguageContext';
import BuildingModal from '../city/BuildingModal';
import TavernInterior from '../city/interiors/TavernInterior';
import TownHallInterior from '../city/interiors/TownHallInterior';
import LibraryInterior from '../city/interiors/LibraryInterior';
import HouseInterior from '../city/interiors/HouseInterior';
import * as GameLogic from '../../logic/gameLogic';

const CapitalView = ({ stats, heroes, actions, formatNumber, buildings, resources, research }) => {
    const { t } = useLanguage();

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
                    buildBuilding={actions.buildBuilding}
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
                    buildings={buildings}
                />
            );
        }
        if (type === 'library') {
            return (
                <LibraryInterior
                    research={research}
                    doResearch={actions.doResearch}
                    stats={stats}
                    buildings={buildings}
                />
            );
        }
        if (type === 'house') {
            return (
                <HouseInterior
                    building={selectedBuilding} // Needs specific building data for Level
                    buildings={buildings}
                    stats={stats}
                />
            );
        }
        return (
            <div style={{ textAlign: 'center', padding: '20px' }}>
                <p>{t('msg_under_construction')}</p>
                <div style={{ margin: '20px 0', opacity: 0.5 }}>🚧 🔨 🏗️</div>
                <button className="btn" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                    {t('btn_upgrade_soon')}
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

    // Calculate derived stats for display
    const population = GameLogic.getCityPopulation(buildings);
    const passiveIncome = GameLogic.getDailyPassiveIncome(stats, population, research || {});

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
                    {/* {t('nav_city') || 'Stad'} REMOVED as per request */}
                    {isEditMode && (
                        <>
                            <span style={{ fontSize: '0.7em', color: '#e74c3c', marginLeft: '10px', background: 'white', padding: '0 4px', borderRadius: '4px', marginRight: '10px' }}>🛠️ ADMIN</span>
                            <button onClick={handleExportCoords} style={{ fontSize: '0.7rem', cursor: 'pointer', padding: '2px 5px' }}>💾 Export Coords</button>
                        </>
                    )}
                </div>
                <div style={{ display: 'flex', gap: '15px', fontWeight: '500' }}>
                    {/* Gold Removed as per request */}
                    <span title="Bevolking">👥 {formatNumber(population)}</span>
                    {/* Tax */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} title="Dagelijkse Belasting">
                        <span style={{ fontSize: '1.0rem' }}>🏛️</span>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1 }}>
                            <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#2ecc71' }}>+{formatNumber(passiveIncome.taxIncome)}</span>
                            <span style={{ fontSize: '0.6rem', opacity: 0.8 }}>Tax/Dag</span>
                        </div>
                    </div>

                    {/* Interest */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} title="Dagelijkse Rente">
                        <span style={{ fontSize: '1.0rem' }}>📈</span>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1 }}>
                            <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#3498db' }}>+{formatNumber(passiveIncome.interestIncome)}</span>
                            <span style={{ fontSize: '0.6rem', opacity: 0.8 }}>Rente/Dag</span>
                        </div>
                    </div>
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
                    onUpgrade={actions.upgradeBuilding}
                    formatNumber={formatNumber}
                    playerGold={stats.gold}
                    buildings={buildings}
                >
                    {renderBuildingContent()}
                </BuildingModal>
            )}

        </div>
    );
};

export default CapitalView;
