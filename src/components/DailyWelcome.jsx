import React from 'react';

const DailyWelcome = ({ onDismiss }) => {
    return (
        <div
            onClick={onDismiss}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                backgroundImage: 'url("./assets/daily_welcome.jpg")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
            }}
        >
            <div style={{
                background: 'rgba(0, 0, 0, 0.6)',
                padding: '2rem',
                borderRadius: '8px',
                textAlign: 'center',
                color: 'white',
                maxWidth: '80%',
                border: '2px solid var(--color-gold, #C5A059)'
            }}>
                <h1 style={{
                    color: 'var(--color-gold, #C5A059)',
                    fontFamily: 'var(--font-heading, serif)',
                    marginBottom: '1rem',
                    textTransform: 'uppercase',
                    fontSize: 'clamp(1.5rem, 5vw, 3rem)'
                }}>
                    Ave Keizer
                </h1>
                <p style={{
                    fontSize: '1.2rem',
                    fontStyle: 'italic'
                }}>
                    Een nieuwe dag in uw rijk.
                </p>
                <div style={{ marginTop: '2rem', fontSize: '0.9rem', opacity: 0.8 }}>
                    (Klik om te beginnen)
                </div>
            </div>
        </div>
    );
};

export default DailyWelcome;
