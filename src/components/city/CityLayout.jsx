import React, { useState, useEffect, useRef } from 'react';
import CityBuilding from './CityBuilding';

const CityLayout = ({ buildings, onBuildingClick, onBuildingMove }) => {
    // Camera Pan State
    const [panX, setPanX] = useState(0);
    const [isPanning, setIsPanning] = useState(false);

    // Refs for drag logic
    const panStart = useRef(null);
    const currentPan = useRef(0);

    // Refs for dimensions & constraints
    const wrapperRef = useRef(null);
    const containerRef = useRef(null);
    const maxPanX = useRef(0);

    // Calculate constraints on start
    const handlePanStart = (clientX) => {
        if (wrapperRef.current && containerRef.current) {
            const wrapperW = wrapperRef.current.offsetWidth;
            const containerW = containerRef.current.offsetWidth;
            // Max allowed deviation from center is half the overflow amount
            const overflow = containerW - wrapperW;
            maxPanX.current = overflow > 0 ? overflow / 2 : 0;
        }

        setIsPanning(true);
        panStart.current = clientX;
        currentPan.current = panX;
    };

    const handlePanMove = (clientX) => {
        if (!isPanning) return;

        const delta = clientX - panStart.current;
        let newPan = currentPan.current + delta;

        // Clamp the pan value
        const limit = maxPanX.current;
        if (newPan > limit) newPan = limit;
        if (newPan < -limit) newPan = -limit;

        setPanX(newPan);
    };

    const handlePanEnd = () => {
        setIsPanning(false);
    };

    // Effect for window listeners to handle drag outside container
    useEffect(() => {
        if (!isPanning) return;

        const onMove = (e) => handlePanMove(e.clientX || (e.touches && e.touches[0].clientX));
        const onUp = () => handlePanEnd();

        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
        window.addEventListener('touchmove', onMove);
        window.addEventListener('touchend', onUp);

        return () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
            window.removeEventListener('touchmove', onMove);
            window.removeEventListener('touchend', onUp);
        };
    }, [isPanning]);


    return (
        <div
            ref={wrapperRef}
            className="city-layout-wrapper"
            style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                overflow: 'hidden',
                backgroundColor: '#000',
                cursor: isPanning ? 'grabbing' : 'grab'
            }}
            onMouseDown={(e) => handlePanStart(e.clientX)}
            onTouchStart={(e) => handlePanStart(e.touches[0].clientX)}
        >
            <style>{`
                .city-map-container {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    /* Combine centering (-50%) with pan offset (px) */
                    transform: translate(calc(-50% + ${panX}px), -50%);
                    aspect-ratio: 16/9;
                    transition: transform 0.1s ease-out;
                }
                
                /* Case 1: Screen is wider than 16:9 -> Fit Width, Crop Top/Bottom */
                /* No panning needed/possible in X direction here usually */
                @media (min-aspect-ratio: 16/9) {
                    .city-map-container {
                        width: 100%;
                        height: auto;
                    }
                }

                /* Case 2: Screen is taller than 16:9 -> Fit Height, Crop Left/Right */
                /* Panning allowed here */
                @media (max-aspect-ratio: 16/9) {
                    .city-map-container {
                        width: auto;
                        height: 100%;
                    }
                }
            `}</style>

            {/* The Map Container - Maintains 16:9 and Scales to Cover */}
            <div
                ref={containerRef}
                className="city-map-container"
            >
                {/* Background Image */}
                <div style={{
                    width: '100%',
                    height: '100%',
                    backgroundImage: 'url("./assets/city/background.png")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    zIndex: 0
                }} />

                {/* Buildings Layer - Coords are relative to THIS container */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 1,
                    cursor: 'crosshair'
                }} onClick={(e) => {
                    // Only trigger click if we didn't pan significantly (threshold 5px)
                    if (Math.abs(panX - currentPan.current) < 5) {
                        // Debug Mode: Click to get coordinates (if enabled via logic / prop, currently just hidden behind console)
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = ((e.clientX - rect.left) / rect.width) * 100;
                        const y = ((e.clientY - rect.top) / rect.height) * 100;

                        const coordString = `x: ${Math.round(x)}, y: ${Math.round(y)}`;

                        if (e.target === e.currentTarget) {
                            // Optional: alert(`Coords: ${coordString}`);
                        }
                    }
                }}>
                    {buildings.map(building => (
                        <CityBuilding
                            key={building.id}
                            building={building}
                            onClick={(b) => {
                                // Prevent building click if panning
                                if (Math.abs(panX - currentPan.current) < 5) {
                                    onBuildingClick(b);
                                }
                            }}
                            onMove={onBuildingMove}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CityLayout;
