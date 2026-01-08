import React from 'react';
import ReactDOM from 'react-dom';
import Icons from '../Icons';

const UnifiedModal = ({
    isOpen,
    onClose,
    title,
    subtitle,
    backgroundImage,
    headerContent,
    children,
    showCloseButton = true
}) => {
    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div className="unified-modal-overlay" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 10000,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(2px)',
            padding: '20px', // consistent margin
            animation: 'fadeIn 0.2s ease-out'
        }}>

            <div className="unified-modal-content" style={{
                position: 'relative',
                width: '100%',
                maxWidth: '600px',
                height: 'auto', // Allow shrinking
                maxHeight: '100%',
                display: 'flex',
                flexDirection: 'column',
                padding: '0',
                overflow: 'hidden',
                animation: 'slideUp 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28)',
                backgroundImage: 'url("/assets/papyrus.jpg")', // Papyrus Texture
                backgroundSize: 'cover',
                borderRadius: '8px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                border: '1px solid #d4c5a3'
            }} onClick={(e) => e.stopPropagation()}>

                {/* Combined Header Section */}
                <div style={{
                    width: '100%',
                    height: '85px', // 30% smaller than 120px
                    backgroundImage: `url("${backgroundImage || '/assets/papyrus.jpg'}")`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative',
                    borderBottom: '4px solid #5d4037',
                    flexShrink: 0
                }}>
                    {/* Title Overlay: Full Height, Centered */}
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: 'rgba(0,0,0,0.5)',
                        color: '#f1c40f',
                        padding: '0 60px', // Clear close button area
                        display: 'flex',
                        flexDirection: 'column', // Stack Title and Subtitle
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        <h2 style={{
                            margin: 0,
                            fontFamily: 'Trajan Pro, serif',
                            fontSize: '2.4rem', // 2x larger
                            textShadow: '3px 3px 0px #000',
                            textAlign: 'center',
                            textTransform: 'uppercase', // Uppercase
                            lineHeight: 1
                        }}>
                            {title}
                        </h2>
                        {subtitle && (
                            <div style={{
                                fontFamily: 'Trajan Pro, serif',
                                fontSize: '1rem',
                                color: '#ecf0f1',
                                marginTop: '4px',
                                textShadow: '1px 1px 0px #000',
                                textTransform: 'uppercase',
                                letterSpacing: '1px'
                            }}>
                                {subtitle}
                            </div>
                        )}

                        {/* Header Content (e.g. Upgrade Button) - Absolute Right */}
                        {headerContent && (
                            <div style={{
                                position: 'absolute',
                                right: '60px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                {headerContent}
                            </div>
                        )}
                    </div>

                    {/* Close Button (Top Right) */}
                    {showCloseButton && (
                        <button onClick={onClose} style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            background: 'rgba(0,0,0,0.6)',
                            border: '2px solid #fff',
                            borderRadius: '50%',
                            width: '32px',
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
                    )}
                </div>

                {/* Content Body */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '20px',
                    overscrollBehavior: 'contain'
                }}>
                    {children}
                </div>

            </div>

            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            `}</style>
        </div>,
        document.body
    );
};

export default UnifiedModal;
