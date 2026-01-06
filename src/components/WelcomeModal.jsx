import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import HeroBanner from './layout/HeroBanner';
import '../../css/components.css';
import { translations } from '../locales/translations';
import Flag from './layout/Flag';

const VIDEO_FILES = [
    './assets/city/Introduction.mp4',
    './assets/city/Introduction_II.mp4',
    './assets/city/Introduction_III.mp4'
];

const WelcomeModal = ({ onLogin, onRegister, onPlayLocal, hasLocalData }) => {
    // Import everything we need from LanguageContext
    const { t, changeLanguage, language } = useLanguage();

    const [currentVideo, setCurrentVideo] = useState(null);
    const [isVideoVisible, setIsVideoVisible] = useState(false);
    const videoRef = useRef(null);

    useEffect(() => {
        let timeoutId;

        const playRandomVideo = () => {
            const randomVideo = VIDEO_FILES[Math.floor(Math.random() * VIDEO_FILES.length)];
            setCurrentVideo(randomVideo);
            // Small delay to allow source update before fading in
            setTimeout(() => setIsVideoVisible(true), 100);
        };

        // Initial delay of 5 seconds
        timeoutId = setTimeout(() => {
            playRandomVideo();
        }, 5000);

        return () => clearTimeout(timeoutId);
    }, []);

    const handleVideoEnded = () => {
        setIsVideoVisible(false); // Fade out

        // Wait for fade out (2s) + 15s delay = 17s total before next video
        setTimeout(() => {
            const randomVideo = VIDEO_FILES[Math.floor(Math.random() * VIDEO_FILES.length)];
            setCurrentVideo(randomVideo);
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.currentTime = 0;
                    videoRef.current.play().catch(e => console.log("Auto-play prevented", e));
                    setIsVideoVisible(true);
                }
            }, 100);
        }, 17000);
    };

    return (
        <div className="modal-overlay" style={{
            zIndex: 3000,
            backgroundImage: 'url("./assets/city_capital.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)', // Fallback / Tint
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            {/* Shared Hero Banner (Fixed Position inherited from CSS class) */}
            <HeroBanner style={{ zIndex: 3001 }} />

            <div className="modal-content" style={{ maxWidth: '500px', textAlign: 'center', padding: '0', overflow: 'hidden', marginTop: '120px' }}>
                <div style={{ padding: '20px' }}> {/* Reduced padding */}
                    <p style={{ fontStyle: 'italic', marginBottom: '15px', fontSize: '1.2em', color: '#555' }}>
                        "{t('welcome_text')}"
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}> {/* Reduced gap */}
                        <div style={{ padding: '10px', borderRadius: '8px' }}>
                            <p style={{ marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9em' }}>{t('welcome_has_account')}</p>
                            <button className="btn full-width" onClick={onLogin}>{t('login_btn')}</button>
                        </div>

                        <div style={{ padding: '10px', borderRadius: '8px' }}>
                            <p style={{ marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9em' }}>{t('welcome_no_account')}</p>
                            <button className="btn full-width" onClick={onRegister}>{t('register_btn')}</button>
                        </div>

                        <div style={{ padding: '10px', borderRadius: '8px' }}>
                            <p style={{ marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9em' }}>{t('welcome_play_local')}</p>
                            <button className="btn full-width" onClick={onPlayLocal}>
                                {hasLocalData ? t('welcome_play_local_continue') : t('welcome_play_local_new')}
                            </button>
                            <p style={{ fontSize: '0.8em', color: '#666', marginTop: '5px' }}>
                                {t('welcome_local_desc')}
                            </p>

                        </div>
                    </div>

                    {/* Language Switcher */}
                    <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '15px' }}>
                        {Object.keys(translations).map(langKey => (
                            <button
                                key={langKey}
                                onClick={() => changeLanguage(langKey)}
                                style={{
                                    background: 'none',
                                    border: language === langKey ? '2px solid var(--color-gold)' : '2px solid transparent',
                                    borderRadius: '6px', // Rounded rectangle
                                    width: '48px', // Rectangular width
                                    height: '32px', // Rectangular height
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    padding: '0',
                                    overflow: 'hidden',
                                    transition: 'transform 0.2s',
                                    transform: language === langKey ? 'scale(1.2)' : 'scale(1)',
                                    boxShadow: language === langKey ? '0 0 10px rgba(255, 215, 0, 0.5)' : 'none'
                                }}
                                title={translations[langKey].name}
                            >
                                <Flag code={langKey} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            {/* Introduction Video for Wide Screens */}
            {currentVideo && (
                <video
                    ref={videoRef}
                    className="welcome-video"
                    src={currentVideo}
                    autoPlay
                    muted
                    playsInline
                    onEnded={handleVideoEnded}
                    style={{
                        position: 'fixed',
                        bottom: '20px',
                        right: '20px',
                        width: '300px',
                        borderRadius: '8px',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
                        border: '2px solid var(--color-gold, #C5A059)',
                        zIndex: 10000,
                        display: 'none', // Hidden by default, shown via CSS for wide screens
                        transition: 'opacity 2s ease-in-out',
                        opacity: isVideoVisible ? 1 : 0
                    }}
                />
            )}
        </div>
    );
};

export default WelcomeModal;
