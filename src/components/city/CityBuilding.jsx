import React, { useState, useEffect, useRef } from 'react';

const CityBuilding = ({ building, onClick, onMove }) => {
    // Scale factor can be adjusted per building type if needed
    // Using percentages relative to container width (approx 1200px equivalent)
    const getSize = (type) => {
        switch (type) {
            case 'town_hall': return { width: '20%' }; // Doubled from 10%
            case 'tavern': return { width: '13%' }; // +50% from 8.5%
            case 'library': return { width: '13.5%' }; // +50% from 9%
            case 'house': return { width: '8.5%' }; // Reverted to 8.5%
            case 'market': return { width: '7.5%' }; // Unchanged
            default: return { width: '4%' };
        }
    };

    const size = getSize(building.type);

    // Variation Logic: Deterministic flip based on ID
    // Simple hash of the ID string to decide if we flip or not
    const shouldFlip = building.type === 'house' &&
        building.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 2 !== 0;


    // Drag Logic (Dormant if onMove is not passed)
    const [isDragging, setIsDragging] = useState(false);
    const dragStartPos = useRef(null);

    const handleMouseDown = (e) => {
        if (!onMove) return; // Only enable drag if onMove is provided
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
        dragStartPos.current = { x: e.clientX, y: e.clientY };
    };

    useEffect(() => {
        if (!isDragging) return;

        const handleMouseMove = (e) => {
            const container = document.querySelector('.city-map-container');
            if (!container) return;

            const rect = container.getBoundingClientRect();

            // Calculate percentage positions
            let newX = ((e.clientX - rect.left) / rect.width) * 100;
            let newY = ((e.clientY - rect.top) / rect.height) * 100;

            // Clamp
            newX = Math.max(0, Math.min(100, newX));
            newY = Math.max(0, Math.min(100, newY));

            onMove(building.id, newX, newY);
        };

        const handleMouseUp = (e) => {
            setIsDragging(false);

            // Check if it was a Click or a Drag
            // If moved less than 5 pixels, treat as click
            if (dragStartPos.current) {
                const dx = Math.abs(e.clientX - dragStartPos.current.x);
                const dy = Math.abs(e.clientY - dragStartPos.current.y);
                if (dx < 5 && dy < 5 && onClick) {
                    onClick(building);
                }
            }
            dragStartPos.current = null;
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, building.id, onMove, onClick]);


    // Depth Scaling Calculation
    // Y=0 -> Scale 0 (Horizon)
    // Y=50 -> Scale 1 (Normal)
    // Y=100 -> Scale 2 (Foreground)
    const perspectiveScale = Math.max(0.1, building.y / 50);


    // Defines styles for positioning
    const style = {
        position: 'absolute',
        left: `${building.x}%`,
        top: `${building.y}%`,
        width: size.width,
        transform: `translate(-50%, -50%) scale(${perspectiveScale})`, // Apply scaling here
        transformOrigin: 'bottom center', // Scale from the feet
        cursor: onMove ? (isDragging ? 'grabbing' : 'grab') : 'pointer',
        transition: isDragging ? 'none' : 'transform 0.2s',
        zIndex: isDragging ? 1000 : Math.floor(building.y),
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
            onMouseDown={handleMouseDown}
            onClick={(e) => {
                if (!onMove && onClick) onClick(building); // Fallback for normal mode
            }}
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
