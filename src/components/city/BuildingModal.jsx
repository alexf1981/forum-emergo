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
            zIndex: 100, // Above everything
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.4)', // Dim background slightly
            animation: 'fadeIn 0.2s ease-out'
        }} onClick={onClose}>

            {/* Modal Content - Floating Page */}
            <div className="modal-content" style={{
                position: 'relative',
                width: '90%',
                maxWidth: '600px',
                // Overrides specific to this building view if needed, but keeping base modal-content style
                padding: '0',
                overflow: 'hidden',
                animation: 'slideUp 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28)'
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
                            top: '5px',
                            right: '5px',
                            background: 'rgba(0,0,0,0.5)',
                            border: '1px solid #fff',
                            borderRadius: '50%',
                            width: '24px',
                            height: '24px',
                            color: '#fff',
                            fontSize: '1rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            lineHeight: 1
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
                <div className="modal-body" style={{ padding: '20px' }}>
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
