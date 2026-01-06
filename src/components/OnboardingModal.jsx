import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import '../../css/components.css';

const OnboardingModal = ({ onClose, setActiveTab }) => {
    const { t } = useLanguage();
    const { playerName, updatePlayerName } = useAuth();
    const [step, setStep] = useState(0);
    const [rect, setRect] = useState(null);
    const [secondaryRect, setSecondaryRect] = useState(null);
    const [tempName, setTempName] = useState(playerName);

    // Only update tempName if playerName changes (e.g. initial load)
    useEffect(() => {
        setTempName(playerName);
    }, [playerName]);

    // Steps Configuration
    const steps = React.useMemo(() => [
        // 0: Welcome
        {
            key: 'welcome',
            text: t('onboarding_welcome_text'),
            title: t('onboarding_welcome_title'),
            target: null,
            action: () => { }
        },
        // 1: Tasks Nav (Focus op takenpagina)
        {
            key: 'tasks_nav',
            text: t('onboarding_step2_text'),
            target: '#nav-btn-city',
            action: () => setActiveTab('city')
        },
        // 2: Virtue (Virtutes)
        {
            key: 'virtue',
            text: t('onboarding_step3_text'),
            target: '#city-col-virtue',
            action: () => setActiveTab('city')
        },
        // 3: Vice (Barbaria)
        {
            key: 'vice',
            text: t('onboarding_step4_text'),
            target: '#city-col-vice',
            action: () => { }
        },
        // 4: Mandata (Todo)
        {
            key: 'mandata',
            text: t('onboarding_step5_text'),
            target: '#city-col-todo',
            action: () => { }
        },
        // 5: One-time (Standaard eenmalig)
        {
            key: 'onetime',
            text: t('onboarding_step6_text'),
            // Focus on the whole habit...
            target: '.habit-item[data-recurring="false"]',
            fallbackTarget: '.habit-item[data-type="virtue"]',
            // ...but Circle the checkbox
            secondaryTarget: '.habit-checkbox',
            action: () => { }
        },
        // 6: Recurring (Standaard herhalend)
        {
            key: 'recurring',
            text: t('onboarding_step7_text'),
            target: '.habit-item[data-recurring="true"]',
            fallbackTarget: '.habit-item[data-type="vice"]', // Vices are often recurring
            // Circle the controls
            secondaryTarget: '.recurring-controls',
            action: () => { }
        },
        // 7: Menu
        {
            key: 'menu',
            text: t('onboarding_step8_text'),

            // Target the Walk 10k habit (First Virtue, Non-Recurring)
            target: '#city-col-virtue .habit-item[data-recurring="false"]',
            fallbackTarget: '.habit-item',

            secondaryTarget: '.onboarding-target-menu',
            action: () => {
                // Force open menu if closed
                const item = document.querySelector('#city-col-virtue .habit-item[data-recurring="false"]') || document.querySelector('.habit-item');
                if (item) {
                    const existingMenu = item.querySelector('.habit-menu-dropdown');
                    if (!existingMenu) {
                        const btn = item.querySelector('.onboarding-target-menu');
                        if (btn) btn.click();
                    }
                }
            },
            onExit: () => {
                // Force close menu if open
                const item = document.querySelector('#city-col-virtue .habit-item[data-recurring="false"]') || document.querySelector('.habit-item');
                if (item) {
                    const existingMenu = item.querySelector('.habit-menu-dropdown');
                    if (existingMenu) {
                        const btn = item.querySelector('.onboarding-target-menu');
                        if (btn) btn.click();
                    }
                }
            }
        },
        // 8: City Nav (Stadpagina)
        {
            key: 'city_nav',
            text: t('onboarding_step9_text'),
            target: '#nav-btn-tavern',
            action: () => { }
        },
        // 9: Town Hall (Switch and Focus)
        {
            key: 'town_hall',
            text: t('onboarding_step10_text'),
            target: '#building-town_hall',
            action: () => setActiveTab('tavern')
        },
        // 10: Name
        {
            key: 'name',
            title: t('onboarding_name_title'),
            text: t('onboarding_name_text'),
            target: null, // Modal center
            action: () => { }
        }
    ], [t, setActiveTab]);

    const currentStepConfig = steps[step];

    // Effect: Handle Step Changes (Action + Scroll + Rect)
    useEffect(() => {
        // 1. Run Action (Switch Tab, Click Buttons)
        if (currentStepConfig.action) {
            currentStepConfig.action();
        }

        // 2. Wait for render (short delay) then find target
        const timer = setTimeout(() => {
            if (currentStepConfig.target) {
                let col = document.querySelector(currentStepConfig.target);
                if (!col && currentStepConfig.fallbackTarget) {
                    col = document.querySelector(currentStepConfig.fallbackTarget);
                }

                if (col) {
                    col.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });

                    // Update Rects
                    const updateRect = () => {
                        let r = col.getBoundingClientRect();

                        // UNION with Dropdown if it exists (for Step 7)
                        const dropdown = col.querySelector('.habit-menu-dropdown');
                        if (dropdown) {
                            const dr = dropdown.getBoundingClientRect();
                            // Calculate Union React
                            const top = Math.min(r.top, dr.top);
                            const left = Math.min(r.left, dr.left);
                            const bottom = Math.max(r.bottom, dr.bottom);
                            const right = Math.max(r.right, dr.right);
                            r = {
                                top, left, width: right - left, height: bottom - top
                            };
                        }

                        setRect({ top: r.top, left: r.left, width: r.width, height: r.height });

                        // Secondary Target Logic
                        if (currentStepConfig.secondaryTarget) {
                            const sec = col.querySelector(currentStepConfig.secondaryTarget);
                            if (sec) {
                                const sr = sec.getBoundingClientRect();
                                setSecondaryRect({ top: sr.top, left: sr.left, width: sr.width, height: sr.height });
                            } else {
                                setSecondaryRect(null);
                            }
                        } else {
                            setSecondaryRect(null);
                        }
                    };

                    updateRect();
                    setTimeout(updateRect, 300); // Check again after scroll/render
                    setTimeout(updateRect, 600);
                } else {
                    setRect(null);
                    setSecondaryRect(null);
                }
            } else {
                setRect(null); // No target (welcome/name)
                setSecondaryRect(null);
            }
        }, 300); // 300ms delay to allow Tab switch to render

        // Cleanup: Run onExit if defined
        return () => {
            clearTimeout(timer);
            if (currentStepConfig.onExit) {
                currentStepConfig.onExit();
            }
        };
    }, [step, currentStepConfig]);

    const handleNext = () => {
        if (step < steps.length - 1) {
            setStep(prev => prev + 1);
        } else {
            handleFinish();
        }
    };

    const handleSkip = () => {
        setStep(10); // Go to Name Step (Index 10)
    };

    const handleFinish = () => {
        if (tempName.trim()) {
            updatePlayerName(tempName);
        }
        onClose();
    };

    // Spotlight Components (The 4 divs)
    const Spotlight = ({ r }) => {
        if (!r) return <div className="modal-overlay" style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)', zIndex: 9999 }} />;

        const blurStyle = {
            position: 'fixed',
            backgroundColor: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(5px)',
            zIndex: 9999,
            transition: 'all 0.3s ease-out'
        };

        return (
            <>
                {/* Top */}
                <div style={{ ...blurStyle, top: 0, left: 0, right: 0, height: r.top }} />
                {/* Bottom */}
                <div style={{ ...blurStyle, top: r.top + r.height, left: 0, right: 0, bottom: 0 }} />
                {/* Left */}
                <div style={{ ...blurStyle, top: r.top, left: 0, width: r.left, height: r.height }} />
                {/* Right */}
                <div style={{ ...blurStyle, top: r.top, left: r.left + r.width, right: 0, height: r.height }} />

                {/* The Hole Border (Optional Glow) */}
                <div style={{
                    position: 'fixed',
                    top: r.top - 5, left: r.left - 5, width: r.width + 10, height: r.height + 10,
                    borderRadius: '4px',
                    boxShadow: '0 0 0 2px rgba(212, 175, 55, 0.8), 0 0 20px rgba(0,0,0,0.5)', // Gold outline
                    zIndex: 9999,
                    pointerEvents: 'none',
                    transition: 'all 0.3s ease-out'
                }} />
            </>
        );
    };

    const RedCircle = ({ r }) => {
        if (!r) return null;
        return (
            <div style={{
                position: 'fixed',
                top: r.top - 5,
                left: r.left - 5,
                width: r.width + 10,
                height: r.height + 10,
                borderRadius: '20px', // More distinct "marker" shape
                border: '3px solid #e74c3c',
                boxShadow: '0 0 15px rgba(231, 76, 60, 0.6)',
                zIndex: 10000,
                pointerEvents: 'none',
                animation: 'pulse-red 2s infinite'
            }}>
                <style>{`
                    @keyframes pulse-red {
                        0% { transform: scale(1); opacity: 1; }
                        50% { transform: scale(1.05); opacity: 0.8; }
                        100% { transform: scale(1); opacity: 1; }
                    }
                `}</style>
            </div>
        );
    };

    // Modal Positioning
    // If rect exists, we try to position away from it. 
    // Defaults to bottom-center for most things, or center-center for Welcome/Name.
    const isCenter = step === 0 || step === 10 || !rect;

    // If not center, usually put it at the bottom, unless target is at the bottom?
    // Let's stick to a fixed position (e.g. bottom center) if target is high, or top center if target is low.
    const modalStyle = isCenter ? {
        top: '50%', left: '50%', transform: 'translate(-50%, -50%)'
    } : (rect && rect.top > window.innerHeight / 2) ? {
        // Target is in bottom half -> Place Modal at Top
        top: '20%', left: '50%', transform: 'translate(-50%, -50%)'
    } : {
        // Target is in top half -> Place Modal at Bottom
        bottom: '100px', left: '50%', transform: 'translate(-50%, 0)'
    };

    return (
        <>
            <Spotlight r={rect} />
            <RedCircle r={secondaryRect} />

            <div className="onboarding-modal-card" style={{
                position: 'fixed',
                background: '#fdfbf7', // Parchment Base
                backgroundImage: 'url("/assets/papyrus.jpg")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                padding: '1.5rem',
                borderRadius: '8px',
                maxWidth: '90%',
                width: '400px',
                textAlign: 'center',
                boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                border: '4px double #D4AF37',
                zIndex: 10000,
                ...modalStyle,
                transition: 'all 0.3s'
            }}>
                {currentStepConfig.title && <h2 style={{ color: '#8E1600', marginBottom: '1rem', marginTop: 0, borderBottom: '2px solid #D4AF37', paddingBottom: '10px', display: 'inline-block' }}>{currentStepConfig.title}</h2>}

                <p style={{ lineHeight: '1.5', marginBottom: '1.5rem', color: '#333', fontSize: '1.05rem' }}>
                    {currentStepConfig.text}
                </p>

                {step === 10 && (
                    <div style={{ marginBottom: '1.5rem' }}>
                        <input
                            type="text"
                            value={tempName}
                            onChange={(e) => setTempName(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px',
                                fontSize: '1rem',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                textAlign: 'center'
                            }}
                        />
                    </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                    {step === 0 && (
                        <button
                            className="btn-text"
                            onClick={handleSkip}
                            style={{ color: '#666', marginRight: 'auto', fontSize: '0.9rem', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                        >
                            {t('btn_skip_tour')}
                        </button>
                    )}

                    <button
                        className="btn-primary"
                        onClick={handleNext}
                        style={{
                            background: '#8E1600', // Roman Red
                            color: 'white',
                            border: '2px solid #5a0e00',
                            padding: '10px 20px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontFamily: 'Trajan Pro, serif',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            fontWeight: 'bold',
                            flexGrow: step === 0 ? 0 : 1
                        }}
                    >
                        {step === 10 ? t('btn_finish') : t('btn_next')}
                    </button>
                </div>

                {/* Dots indicator */}
                {step < 10 && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '5px', marginTop: '15px' }}>
                        {steps.slice(0, 10).map((_, i) => (
                            <div key={i} style={{
                                width: '8px', height: '8px', borderRadius: '50%',
                                background: i === step ? '#8E1600' : '#ccc',
                                transition: 'background 0.3s'
                            }} />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};

export default OnboardingModal;
