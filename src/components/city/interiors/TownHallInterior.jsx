import React from 'react';
import * as GameLogic from '../../../logic/gameLogic';

const TownHallInterior = ({ onClose, buildings, buildBuilding, resources, stats }) => {

    // Helper to check if a specific type can be built (is there an empty slot?)
    const canBuild = (type) => {
        return buildings.some(b => b.type === type && b.level === 0);
    };

    // Helper to check if already built (for uniques)
    const isBuilt = (type) => {
        if (type === 'house') return false; // Houses are never "fully built" until all slots taken
        return buildings.some(b => b.type === type && b.level > 0);
    };

    const getHouseStatus = () => {
        const total = buildings.filter(b => b.type === 'house').length;
        const built = buildings.filter(b => b.type === 'house' && b.level > 0).length;
        return `${built}/${total} gebouwd`;
    };

    const handleBuild = (type) => {
        if (canBuild(type)) {
            buildBuilding(type);
            // Optional: Close modal or show success?
            // onClose(); 
        } else {
            alert('Geen ruimte meer of al gebouwd!');
        }
    };

    const BuildingOption = ({ type, name, cost, imagePath }) => {
        const available = canBuild(type);
        const built = isBuilt(type);

        let statusText;
        let isCompleted;

        if (type === 'house') {
            const hasSpace = canBuild('house');
            isCompleted = !hasSpace;
            statusText = isCompleted ? 'Voltooid' : `Kosten: ${cost}`;
        } else {
            isCompleted = built;
            statusText = isCompleted ? 'Voltooid' : `Kosten: ${cost}`;
        }

        return (
            <div style={{
                display: 'flex',
                flexWrap: 'wrap', // Allow wrapping on small screens
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '10px',
                padding: '15px',
                background: 'rgba(255, 255, 255, 0.6)', // Lighter background for readability
                marginBottom: '10px',
                borderRadius: '8px',
                border: '1px solid rgba(139, 69, 19, 0.3)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: '1 1 auto' }}>
                    <img
                        src={imagePath}
                        alt={name}
                        style={{
                            width: '50px',
                            height: 'auto',
                            filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.5))'
                        }}
                    />
                    <div>
                        <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#000' }}>
                            {name} {type === 'house' && <span style={{ fontSize: '0.8rem', color: '#333' }}>({getHouseStatus()})</span>}
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#000', fontWeight: '500' }}>
                            {statusText}
                        </div>
                    </div>
                </div>
                <button
                    className="btn primary-btn-bounce"
                    onClick={() => handleBuild(type)}
                    disabled={isCompleted || !available}
                    style={{
                        padding: '8px 16px',
                        background: '#27ae60', // Always green
                        opacity: (isCompleted || !available) ? 0.5 : 1, // Grayed out if completed or not available
                        cursor: (isCompleted || !available) ? 'not-allowed' : 'pointer',
                        border: 'none',
                        color: 'white',
                        fontWeight: 'bold',
                        boxShadow: (isCompleted || !available) ? 'none' : '0 4px 0 #219150',
                        flex: '0 0 auto', // Don't shrink
                        marginLeft: 'auto' // Push to right if space permits
                    }}
                >
                    {isCompleted ? 'Voltooid' : 'Bouwen'}
                </button>
            </div>
        );
    };

    return (
        <div style={{ padding: '20px', color: '#3e2723' }}>
            {/* Header line only, no text */}
            <div style={{
                borderBottom: '2px solid #8b4513',
                marginBottom: '20px',
                paddingBottom: '10px'
            }}></div>

            <p style={{ marginBottom: '20px', fontStyle: 'italic', fontWeight: 'bold' }}>
                Heer, hier kunt u opdrachten geven tot de uitbreiding van onze glorieuze stad.
            </p>

            <div className="building-options">
                <BuildingOption
                    type="house"
                    name="Woonhuis"
                    cost={`${GameLogic.BUILDING_COSTS.house} Goud`}
                    imagePath="./assets/city/house.png"
                />
                <BuildingOption
                    type="tavern"
                    name="Taverne"
                    cost={`${GameLogic.BUILDING_COSTS.tavern} Goud`}
                    imagePath="./assets/city/tavern.png"
                />
                <BuildingOption
                    type="library"
                    name="Bibliotheek"
                    cost={`${GameLogic.BUILDING_COSTS.library} Goud`}
                    imagePath="./assets/city/library.png"
                />
                <BuildingOption
                    type="market"
                    name="Markt"
                    cost={`${GameLogic.BUILDING_COSTS.market} Goud`}
                    imagePath="./assets/city/market.png"
                />
            </div>
        </div>
    );
};

export default TownHallInterior;
