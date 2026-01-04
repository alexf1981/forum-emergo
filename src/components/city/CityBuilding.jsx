import React, { useState, useEffect, useRef } from 'react';

const CityBuilding = ({ building, onClick, onMove }) => {
    // Scale factor can be adjusted per building type if needed
    // The user requested that "2x pixels = 2x size", so we rely on natural image size (auto)
    // but capped to avoid massive overflows.
    // We also apply the perspective scale.

    const getVerticalShift = () => '-100%'; // Always anchor at bottom

    const translateY = getVerticalShift();

    // Variation Logic: Deterministic flip based on ID
    // House: flips randomly based on ID
    // Market: ALWAYS flip (user request)
    const shouldFlip = building.type === 'market' || (building.type === 'house' &&
        building.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 2 !== 0);


    // Drag & Click Logic
    const [isDragging, setIsDragging] = useState(false);
    const dragStartPos = useRef(null);
    const isPointerDown = useRef(false);

    // Unified Start Logic caused by visual element
    const handlePointerDown = (clientX, clientY, e) => {
        // --- TRANSPARENCY CHECK ---
        // We only proceed if the clicked pixel is opaque.
        // If transparent, we ignore this event and let it bubble/pass-through manually if needed.
        if (e.target.tagName === 'IMG') {
            const img = e.target;
            const canvas = document.createElement('canvas');
            canvas.width = 1;
            canvas.height = 1;
            const ctx = canvas.getContext('2d');

            const rect = img.getBoundingClientRect();
            const x = clientX - rect.left;
            const y = clientY - rect.top;

            // Map to natural dimensions
            const naturalX = (x / rect.width) * img.naturalWidth;
            const naturalY = (y / rect.height) * img.naturalHeight;

            try {
                // Draw 1x1 pixel from the image source location
                ctx.drawImage(img, naturalX, naturalY, 1, 1, 0, 0, 1, 1);
                const pixel = ctx.getImageData(0, 0, 1, 1).data;
                const alpha = pixel[3];

                if (alpha < 10) {
                    // Transparent!
                    // To let the underlying element receive the event, we momentarily hide this one.
                    e.target.style.pointerEvents = 'none';
                    // We also need to hide the parent wrapper potentially if it catches events?
                    // But the event handler is on the wrapper 'div' usually? 
                    // UPDATE: The handler is on the wrapper div. `e.target` is the IMG.
                    // We need to hide the wrapper div to find what's truly under the building.

                    const wrapper = e.currentTarget;
                    const originalPointerEvents = wrapper.style.pointerEvents;
                    wrapper.style.pointerEvents = 'none';

                    // Re-fire event at the same coordinates
                    const elementBelow = document.elementFromPoint(clientX, clientY);

                    // Dispatch
                    if (elementBelow) {
                        const newEvent = new MouseEvent(e.type, {
                            bubbles: true,
                            cancelable: true,
                            view: window,
                            clientX: clientX,
                            clientY: clientY,
                            buttons: e.buttons
                        });
                        elementBelow.dispatchEvent(newEvent);
                    }

                    // Restore
                    wrapper.style.pointerEvents = originalPointerEvents;
                    e.target.style.pointerEvents = 'auto'; // Restore img too just in case

                    return; // Stop processing for this building
                }
            } catch (err) {
                console.warn("Hit test failed (CORS?):", err);
                // Fallback: assume opaque to allow interaction
            }
        }
        // --------------------------

        isPointerDown.current = true;
        dragStartPos.current = { x: clientX, y: clientY };

        // If in Edit Mode, we capture immediately
        if (onMove) {
            setIsDragging(true);
            e.stopPropagation(); // Stop map panning
            // e.preventDefault(); // Optional: prevent selection, but let's be careful with touch scroll
        }
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

    // Specific Type Scaling (User Request: 50% smaller for these types)
    let typeScale = 1.0;
    if (['tavern', 'market', 'library'].includes(building.type)) {
        typeScale = 0.5 * 0.9; // 50% base, then 10% smaller per latest request = 0.45
    } else if (building.type === 'town_hall') {
        typeScale = 1.1; // 10% larger
    }

    const finalScale = perspectiveScale * typeScale;

    const style = {
        position: 'absolute',
        left: `${building.x}%`,
        top: `${building.y}%`,
        // Natural size logic: width/height auto
        // User explicitly requested to allow overflow/no shrinking.
        width: 'auto',
        height: 'auto',
        // maxWidth: '30%', // REMOVED
        // maxHeight: '40%', // REMOVED
        transform: `translate(-50%, ${translateY}) scale(${finalScale})`,
        transformOrigin: 'bottom center',
        cursor: onMove ? (isDragging ? 'grabbing' : 'grab') : 'pointer',
        transition: isDragging ? 'none' : 'transform 0.2s',
        zIndex: isDragging ? 1000 : Math.floor(building.y),
    };

    if (building.level === 0) return null; // Invisible if not built

    // Map type to image file using dynamic levels for ALL types
    const getBuildingImage = (type) => {
        const lvl = building.level || 1;
        // All types now follow standard naming convention: type_level.png
        // Except maybe if file doesn't exist? We assume manual crop succeeded for all.
        switch (type) {
            case 'town_hall': return `./assets/city/town_hall_${lvl}.png`;
            case 'house': return `./assets/city/house_${lvl}.png`;
            case 'tavern': return `./assets/city/tavern_${lvl}.png`;
            case 'library': return `./assets/city/library_${lvl}.png`;
            case 'market': return `./assets/city/market_${lvl}.png`;
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
            title={`${building.name} (Lvl ${building.level})`}
        >
            <div style={{
                position: 'relative',
                transition: 'transform 0.1s',
                display: 'flex',
                justifyContent: 'center'
            }}>
                {imageSrc ? (
                    <img
                        src={imageSrc}
                        alt={building.name}
                        crossOrigin="anonymous" // Required for canvas hit testing of local/external images
                        style={{
                            // Respect natural aspect ratio, but allow full size even if container is constrained
                            maxWidth: 'none',
                            height: 'auto',
                            filter: 'drop-shadow(0px 5px 5px rgba(0,0,0,0.5))',
                            display: 'block',
                            transform: shouldFlip ? 'scaleX(-1)' : 'none'
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
