import React from 'react';

const CityBuilding = ({ building, onClick }) => {
    // Scale factor can be adjusted per building type if needed
    // Using percentages relative to container width (approx 1200px equivalent)
    const getSize = (type) => {
        switch (type) {
            case 'town_hall': return { width: '10%' }; // ~120px
            case 'tavern': return { width: '8.5%' }; // ~100px
            case 'library': return { width: '9%' }; // ~110px
            case 'house': return { width: '8.5%' }; // ~100px (30% smaller than 12%)
            case 'market': return { width: '7.5%' }; // ~90px
            default: return { width: '4%' }; // ~50px
        }
    };

    const size = getSize(building.type);

    // Variation Logic: Deterministic flip based on ID
    // Simple hash of the ID string to decide if we flip or not
    const shouldFlip = building.type === 'house' &&
        building.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 2 !== 0;


    // Defines styles for positioning
    const style = {
        position: 'absolute',
        left: `${building.x}%`,
        top: `${building.y}%`,
        width: size.width, // Apply width to container so children line up
        transform: 'translate(-50%, -50%)', // Center on coordinate
        cursor: 'pointer',
        transition: 'transform 0.2s',
        zIndex: Math.floor(building.y), // Simple depth sorting based on Y pos
    };

    if (building.level === 0) return null; // Invisible if not built

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
                width: '100%' // Ensure inner wrapper fills container
            }}>
                {imageSrc ? (
                    <img
                        src={imageSrc}
                        alt={building.name}
                        style={{
                            width: '100%', // Fill the container width
                            height: 'auto',
                            filter: 'drop-shadow(0px 5px 5px rgba(0,0,0,0.5))',
                            display: 'block',
                            transform: shouldFlip ? 'scaleX(-1)' : 'none' // Flip visual only
                        }}
                    />
                ) : (
                    <div style={{ width: '50px', height: '50px', background: 'red' }}>?</div>
                )}
            </div>
        </div>
    );
};

export default CityBuilding;
