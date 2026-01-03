import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import Icons from '../Icons';

const BuildingModal = ({ building, onClose, onUpgrade, children }) => {
    const { t } = useLanguage();

    return (
        <div className="building-modal-overlay" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 3000, // Significantly higher to ensure it's above hero bar (often 1000-2000)
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)', // Slightly darker
            backdropFilter: 'blur(2px)', // Nice effect
            padding: '20px', // Ensure 20px gap from all screen edges
            paddingTop: '80px', // Extra visual breathing room from top (and avoids notch/browser bars)
            animation: 'fadeIn 0.2s ease-out'
        }} onClick={onClose}>

            {/* Modal Content - Floating Page */}
            <div className="modal-content" style={{
                position: 'relative',
                width: '100%',
                maxWidth: '600px',
                maxHeight: '100%', // Use flex parent limits (padding handles the max height implicitly)
                display: 'flex',
                flexDirection: 'column',
                padding: '0',
                overflow: 'hidden',
                animation: 'slideUp 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28)',
                background: '#f4e4bc',
                borderRadius: '8px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.5)' // Floating shadow
            }} onClick={(e) => e.stopPropagation()}>

                {/* Optional Header Image Banner */}
                {building.headerImage ? (
                    <div style={{
                        width: '100%',
                        height: '100px', // Reduced height
                        backgroundImage: `url("${building.headerImage}")`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        position: 'relative',
                        borderBottom: '4px solid #5d4037'
                    }}>
                        {/* Title Overlay on Image */}
                        <div style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            background: 'rgba(0,0,0,0.6)',
                            color: '#f1c40f',
                            padding: '5px 15px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <h2 style={{ margin: 0, fontFamily: 'Trajan Pro, serif', fontSize: '1.2rem', textShadow: '2px 2px 0px #000' }}>
                                {building.name} <span style={{ fontSize: '0.6em', color: '#ddd' }}>(Lvl {building.level})</span>
                            </h2>
                            <button
                                onClick={() => onUpgrade(building.id)}
                                disabled={building.level >= 5}
                                style={{
                                    background: building.level >= 5 ? '#7f8c8d' : '#27ae60',
                                    border: '1px solid #fff',
                                    color: 'white',
                                    borderRadius: '4px',
                                    padding: '4px 8px',
                                    fontSize: '0.8rem',
                                    fontWeight: 'bold',
                                    cursor: building.level >= 5 ? 'default' : 'pointer',
                                    boxShadow: building.level >= 5 ? 'none' : '0 2px 5px rgba(0,0,0,0.5)',
                                    marginLeft: 'auto',
                                    marginRight: '30px', // Space for the X close button
                                    opacity: building.level >= 5 ? 0.7 : 1
                                }}
                            >
                                {building.level >= 5 ? 'Max Level' : '⬆️ Upgrade'}
                            </button>
                        </div>
                        {/* Close X inside banner */}
                        <button onClick={onClose} style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            background: 'rgba(0,0,0,0.6)',
                            border: '2px solid #fff',
                            borderRadius: '50%',
                            width: '32px', // Larger for touch
                            height: '32px',
                            color: '#fff',
                            fontSize: '1.2rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            lineHeight: 1,
                            zIndex: 10
                        }}>×</button>
                    </div>
                ) : (
                    /* Standard Header (only if no image) */
                    <div className="modal-header" style={{ borderBottom: '2px solid #8d6e63' }}>
                        <h2 style={{ margin: 0, color: '#5d4037' }}>
                            {building.name} <span style={{ fontSize: '0.6em', color: '#8d6e63' }}>(Lvl {building.level})</span>
                        </h2>
                        <button className="btn-icon" onClick={onClose} style={{ color: '#5d4037' }}><Icons.X /></button>
                    </div>
                )}

                {/* Body */}
                <div className="modal-body" style={{
                    padding: '20px',
                    overflowY: 'auto',
                    overscrollBehavior: 'contain' // Prevent background scroll
                }}>
                    {children}
                </div>

            </div>

            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            `}</style>
        </div>
    );
};

export default BuildingModal;
