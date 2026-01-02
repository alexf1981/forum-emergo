import React from 'react';
import CityBuilding from './CityBuilding';

const CityLayout = ({ buildings, onBuildingClick }) => {
    return (
        <div className="city-layout-wrapper" style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            overflow: 'hidden',
            backgroundColor: '#000'
        }}>
            <style>{`
                .city-map-container {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    aspect-ratio: 16/9;
                }
                
                /* Case 1: Screen is wider than 16:9 -> Fit Width, Crop Top/Bottom */
                @media (min-aspect-ratio: 16/9) {
                    .city-map-container {
                        width: 100%;
                        height: auto;
                    }
                }

                /* Case 2: Screen is taller than 16:9 -> Fit Height, Crop Left/Right */
                @media (max-aspect-ratio: 16/9) {
                    .city-map-container {
                        width: auto;
                        height: 100%;
                    }
                }
            `}</style>

            {/* The Map Container - Maintains 16:9 and Scales to Cover */}
            <div className="city-map-container">
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
                    zIndex: 1
                }}>
                    {buildings.map(building => (
                        <CityBuilding
                            key={building.id}
                            building={building}
                            onClick={onBuildingClick}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CityLayout;
