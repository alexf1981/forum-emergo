import React from 'react';

const CityBuilding = ({ building, onClick }) => {
    // Defines styles for positioning
    const style = {
        position: 'absolute',
        left: `${building.x}%`,
        top: `${building.y}%`,
        transform: 'translate(-50%, -50%)', // Center on coordinate
        cursor: 'pointer',
        transition: 'transform 0.2s',
        zIndex: Math.floor(building.y), // Simple depth sorting based on Y pos
    };

    if (building.level === 0) return null; // Invisible if not built

    // Placeholder visuals for now using colors/text until we have assets
    // TODO: Replace with Real Images
    // Map type to image file
    const getBuildingImage = (type) => {
        switch (type) {
            case 'town_hall': return './assets/city/town_hall.png';
            case 'tavern': return './assets/city/tavern.png';
            case 'library': return './assets/city/library.png';
            case 'house': return './assets/city/house.png';
            case 'market': return './assets/city/market.png';
            default: return null;
        }
    };

    const imageSrc = getBuildingImage(building.type);

    // Scale factor can be adjusted per building type if needed
    const getSize = (type) => {
        switch (type) {
            case 'town_hall': return { width: '120px' };
            case 'tavern': return { width: '100px' };
            case 'library': return { width: '110px' };
            case 'house': return { width: '70px' };
            case 'market': return { width: '90px' };
            default: return { width: '50px' };
        }
    };

    const size = getSize(building.type);

    return (
        <div
            className="city-building"
            style={style}
            onClick={() => onClick(building)}
            title={`${building.name} (Lvl ${building.level})`}
        >
            <div style={{
                position: 'relative',
                transition: 'transform 0.1s',
            }}>
                {imageSrc ? (
                    <img
                        src={imageSrc}
                        alt={building.name}
                        style={{
                            width: size.width,
                            height: 'auto',
                            filter: 'drop-shadow(0px 5px 5px rgba(0,0,0,0.5))',
                            display: 'block'
                        }}
                    />
                ) : (
                    <div style={{ width: '50px', height: '50px', background: 'red' }}>?</div>
                )}

                {/* Level Badge */}
                <div style={{
                    position: 'absolute',
                    top: '-5px',
                    right: '-5px',
                    background: '#e74c3c',
                    color: 'white',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                    border: '2px solid white',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}>
                    {building.level}
                </div>
            </div>

            <div style={{
                position: 'absolute',
                bottom: '-20px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(0,0,0,0.0)', // Transparent now
                textShadow: '0 1px 2px black',
                color: 'white',
                padding: '2px 4px',
                fontSize: '0.7rem',
                whiteSpace: 'nowrap',
                pointerEvents: 'none'
            }}>
                {building.name}
            </div>
        </div>
    );
};

export default CityBuilding;
