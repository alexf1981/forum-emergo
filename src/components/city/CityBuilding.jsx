import React, { useState, useEffect, useRef } from 'react';

const CityBuilding = ({ building, onClick, onMove }) => {
    // Scale factor can be adjusted per building type if needed
    // Using percentages relative to container width (approx 1200px equivalent)
    const getSize = (type, level) => {
        switch (type) {
            case 'town_hall':
                // Level specific sizing
                if (level === 1) return { width: '10%' }; // 50% of 20%
                if (level === 2) return { width: '15%' }; // slightly smaller than 16% as requested
                return { width: '20%' };
            case 'tavern': return { width: '13%' };
            case 'library': return { width: '13.5%' };
            case 'house': return { width: '8.5%' };
            case 'market': return { width: '7.5%' };
            default: return { width: '4%' };
        }
    };

    const size = getSize(building.type, building.level);

    // Vertical shift logic for specific buildings
    const getVerticalShift = (type, level) => {
        if (type === 'town_hall') {
            if (level === 1) return '-35%'; // Level 1 moved further down (standard is -50%, so -35% pushes it down relative to anchor)
            return '-65%'; // Higher levels shift up
        }
        return '-50%'; // Default center
    };

    const translateY = getVerticalShift(building.type, building.level);

    // Variation Logic: Deterministic flip based on ID
    // Simple hash of the ID string to decide if we flip or not
    const shouldFlip = building.type === 'house' &&
        building.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 2 !== 0;


    // Drag & Click Logic
    const [isDragging, setIsDragging] = useState(false);
    const dragStartPos = useRef(null);
    const isPointerDown = useRef(false);

    // Unified Start Logic caused by visual element
    const handlePointerDown = (clientX, clientY, e) => {
        isPointerDown.current = true;
        dragStartPos.current = { x: clientX, y: clientY };

        // If in Edit Mode, we capture immediately
        if (onMove) {
            setIsDragging(true);
            e.stopPropagation(); // Stop map panning
            // e.preventDefault(); // Optional: prevent selection, but let's be careful with touch scroll
        }
        // In Normal Mode, we let it bubble so Map can Pan, 
        // BUT we still track start pos to detect our own "Click" on release.
    };

    useEffect(() => {
        if (!isPointerDown.current && !isDragging) return;

        const handleMoveEvent = (clientX, clientY) => {
            if (!onMove || !isDragging) return; // Only move calculation if in Edit Mode

            const container = document.querySelector('.city-map-container');
            if (!container) return;

            const rect = container.getBoundingClientRect();

            // Calculate percentage positions
            let newX = ((clientX - rect.left) / rect.width) * 100;
            let newY = ((clientY - rect.top) / rect.height) * 100;

            // Clamp
            newX = Math.max(0, Math.min(100, newX));
            newY = Math.max(0, Math.min(100, newY));

            onMove(building.id, newX, newY);
        };

        const handleUpEvent = (clientX, clientY) => {
            // Calculate distance
            let wasClick = false;
            if (dragStartPos.current) {
                const dist = Math.hypot(clientX - dragStartPos.current.x, clientY - dragStartPos.current.y);
                // If moved less than 10px, it's a click
                if (dist < 10) wasClick = true;
            }

            if (wasClick) {
                if (onClick) onClick(building);
            }

            // Reset
            setIsDragging(false);
            isPointerDown.current = false;
            dragStartPos.current = null;
        };

        const onMouseMove = (e) => handleMoveEvent(e.clientX, e.clientY);
        const onMouseUp = (e) => handleUpEvent(e.clientX, e.clientY);

        const onTouchMove = (e) => {
            if (isDragging) e.preventDefault(); // Block scroll only if dragging
            const t = e.touches[0];
            handleMoveEvent(t.clientX, t.clientY);
        };
        const onTouchEnd = (e) => {
            // Touch end doesn't have coords, use last known? 
            // Or just trust if it was a short tap. 
            // For simple click detection on touch, we can use changedTouches if needed, 
            // but effectively if we haven't 'moved' significantly...
            // Standard click might be better for touch fallback, but let's try using the start pos.
            // Actually, handleUp needs clientX/Y to check distance.
            const t = e.changedTouches[0];
            handleUpEvent(t.clientX, t.clientY);
        };

        // Attach to window to catch release outside element
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
        window.addEventListener('touchmove', onTouchMove, { passive: false });
        window.addEventListener('touchend', onTouchEnd);

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('touchend', onTouchEnd);
        };
    }, [isDragging, onMove, building, onClick]);

    // Use specific handlers for element
    const onMouseDown = (e) => handlePointerDown(e.clientX, e.clientY, e);
    const onTouchStart = (e) => {
        const t = e.touches[0];
        handlePointerDown(t.clientX, t.clientY, e);
    };


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
        transform: `translate(-50%, ${translateY}) scale(${perspectiveScale})`, // Apply scaling here
        transformOrigin: 'bottom center', // Scale from the feet
        cursor: onMove ? (isDragging ? 'grabbing' : 'grab') : 'pointer',
        transition: isDragging ? 'none' : 'transform 0.2s',
        zIndex: isDragging ? 1000 : Math.floor(building.y),
    };

    if (building.level === 0) return null; // Invisible if not built

    // Map type to image file
    const getBuildingImage = (type) => {
        switch (type) {
            case 'town_hall': return `./assets/city/town_hall_${building.level || 1}.png`;
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
            onMouseDown={onMouseDown}
            onTouchStart={onTouchStart}
            // onClick logic is handled in onMouseUp now
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
