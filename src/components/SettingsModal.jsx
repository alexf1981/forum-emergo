import React, { useState } from 'react';
import Icons from './Icons';
import UnifiedModal from './layout/UnifiedModal';
import UnifiedLanguageSelector from './common/UnifiedLanguageSelector';
import { useAuth } from '../context/AuthContext';
import { signOut } from '../services/auth';
import AdminDashboard from './AdminDashboard';

import { useLanguage } from '../context/LanguageContext';

// IMPORTS needed for Reset Logic
import { DataService } from '../services/dataService';
import * as GameLogic from '../logic/gameLogic';

// Unified Components
import UnifiedButton from './common/UnifiedButton';
import UnifiedCard from './common/UnifiedCard';
import UnifiedInput from './common/UnifiedInput';
import UnifiedText from './common/UnifiedText';

const SettingsModal = ({ onClose, useRomanNumerals, toggleRomanNumerals, onLogin, onLocalLogout, actions }) => {
    const { user, playerName, updatePlayerName } = useAuth();
    const [localPlayerName, setLocalPlayerName] = useState(playerName || '');

    // Keep local input in sync if context updates
    React.useEffect(() => {
        setLocalPlayerName(playerName || '');
    }, [playerName]);

    const { language, changeLanguage, t } = useLanguage();
    const [showAdmin, setShowAdmin] = useState(false);

    // Simple admin check
    const ADMINS = ['alexfitie1981@gmail.com', 'olivierfitie2015@gmail.com'];
    const isAdmin = user?.email && ADMINS.includes(user.email);

    if (showAdmin) {
        return <AdminDashboard onClose={() => setShowAdmin(false)} actions={actions} />;
    }

    const handleLogout = async () => {
        const email = user?.email; // Capture email before it's gone
        try {
            const logoutPromise = signOut();
            const timeoutPromise = new Promise(resolve => setTimeout(resolve, 2000));
            await Promise.race([logoutPromise, timeoutPromise]);
        } catch (error) {
            console.error("Logout error:", error);
        }

        const backup = window.localStorage.getItem('romehabits_backup');
        const debugLogs = window.localStorage.getItem('emergo_debug_log');
        window.localStorage.clear();

        if (debugLogs) window.localStorage.setItem('emergo_debug_log', debugLogs);
        if (backup && backup !== 'null') window.localStorage.setItem('romehabits', backup);

        window.localStorage.removeItem('has_visited');
        if (email) window.localStorage.setItem('logout_message', `Uitgelogd als ${email}`);
        window.location.reload();
    };

    const handleResetAccount = async () => {
        if (!window.confirm(t('msg_confirm_reset'))) return;

        const now = Date.now();
        const defaultHabits = [
            { id: now + 1, text: t('habit_walk_10k'), type: 'virtue', completed: false, history: GameLogic.generateRandomHistory(), recurring: false },
            { id: now + 3, text: t('habit_hobby'), type: 'virtue', completed: false, history: [], recurring: true },
            { id: now + 4, text: t('habit_sleep_late'), type: 'vice', completed: false, history: [], recurring: false },
            { id: now + 5, text: t('habit_smoke'), type: 'vice', completed: false, history: [], recurring: true },
            { id: now + 7, text: t('habit_taxes'), type: 'todo', completed: false, history: [], recurring: false }
        ];

        const resetData = {
            romestats: { gold: 200, know: 0, pop: 100 },
            romeheroes: [],
            romehabits: defaultHabits,
            romebuildings: GameLogic.INITIAL_BUILDINGS,
            romeresources: {},
            romeresearch: {},
            romeloginhistory: [],
            romelastwelcome: GameLogic.getTodayString()
        };

        if (user) {
            try {
                await DataService.saveGameData(user.id, resetData);
                window.localStorage.setItem('romestats', JSON.stringify(resetData.romestats));
                window.localStorage.setItem('romeheroes', JSON.stringify(resetData.romeheroes));
                window.localStorage.setItem('romehabits', JSON.stringify(resetData.romehabits));
                window.localStorage.setItem('romebuildings', JSON.stringify(resetData.romebuildings));
                window.localStorage.setItem('romeresources', JSON.stringify(resetData.romeresources));
                window.localStorage.setItem('romeresearch', JSON.stringify(resetData.romeresearch));
                window.localStorage.setItem('romeloginhistory', JSON.stringify(resetData.romeloginhistory));
                window.localStorage.setItem('trigger_onboarding', 'true');
                window.location.reload();
            } catch (error) {
                console.error("Reset Failed:", error);
                alert("Reset failed: " + error.message);
            }
        } else {
            const debugLogs = window.localStorage.getItem('emergo_debug_log');
            window.localStorage.clear();
            if (debugLogs) window.localStorage.setItem('emergo_debug_log', debugLogs);
            window.location.reload();
        }
    };

    return (
        <UnifiedModal isOpen={true} onClose={onClose} title={t('settings_title')}>
            <div style={{ gap: '15px', padding: '10px 0', display: 'flex', flexDirection: 'column' }}>

                {/* PLAYER & LOGIN STATUS */}
                <UnifiedCard variant="papyrus" padding="15px">
                    <div style={{ marginBottom: '15px' }}>
                        <UnifiedInput
                            label={t('player_name')}
                            type="text"
                            value={localPlayerName}
                            onChange={(e) => setLocalPlayerName(e.target.value)}
                            onBlur={() => updatePlayerName(localPlayerName)}
                            placeholder={t('player_name')}
                            fullWidth
                        />
                    </div>

                    {user ? (
                        <div style={{ borderTop: '1px solid #d4c5a3', paddingTop: '15px' }}>
                            <UnifiedText variant="caption">{t('cloud_desc_user')} <strong>{user.email}</strong></UnifiedText>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                {isAdmin && (
                                    <UnifiedButton
                                        onClick={() => setShowAdmin(true)}
                                        variant="secondary"
                                        fullWidth
                                        style={{ backgroundColor: '#8e44ad', borderColor: '#6c3483' }}
                                    >
                                        <Icons.Crown /> Admin
                                    </UnifiedButton>
                                )}
                                <UnifiedButton
                                    onClick={handleLogout}
                                    variant="danger"
                                    fullWidth
                                >
                                    {t('logout')}
                                </UnifiedButton>
                            </div>
                        </div>
                    ) : (
                        <div style={{ borderTop: '1px solid #d4c5a3', paddingTop: '15px' }}>
                            <UnifiedText variant="body" style={{ marginBottom: '5px' }}>
                                {t('logged_in_as')}: <strong>{t('local_login_status')}</strong>
                            </UnifiedText>

                            <div style={{
                                backgroundColor: 'rgba(243, 156, 18, 0.1)',
                                border: '1px solid #f39c12',
                                color: '#d35400',
                                padding: '8px',
                                borderRadius: '4px',
                                fontSize: '0.85rem',
                                marginBottom: '15px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <Icons.CloudOffline />
                                <span style={{ flex: 1 }}>{t('welcome_local_desc')}</span>
                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <UnifiedButton onClick={onLogin} variant="primary" style={{ flex: 2 }}>
                                    {t('login_btn')} / {t('register_btn')}
                                </UnifiedButton>
                                <UnifiedButton
                                    onClick={onLocalLogout}
                                    variant="secondary"
                                    style={{ flex: 1 }}
                                >
                                    {t('logout')}
                                </UnifiedButton>
                            </div>
                        </div>
                    )}
                </UnifiedCard>

                {/* DISPLAY SETTINGS */}
                <UnifiedCard variant="papyrus" padding="15px">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <UnifiedText variant="h2" style={{ fontSize: '1rem', margin: 0 }}>{t('lbl_language')}</UnifiedText>
                        <UnifiedLanguageSelector style={{ gap: '10px' }} />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderTop: '1px solid #d4c5a3' }}>
                        <UnifiedText variant="body" style={{ margin: 0 }}>{t('roman_nums')}</UnifiedText>
                        <input
                            type="checkbox"
                            checked={useRomanNumerals}
                            onChange={toggleRomanNumerals}
                            style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#8E1600' }}
                        />
                    </div>
                </UnifiedCard>

                {/* DELETE ACCOUNT (DANGER ZONE) */}
                <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'center' }}>
                    <UnifiedButton
                        onClick={handleResetAccount}
                        variant="danger"
                        size="sm"
                        style={{ backgroundColor: 'transparent', color: '#c0392b', border: 'none', boxShadow: 'none' }}
                        icon={<Icons.Trash />}
                    >
                        <span style={{ textDecoration: 'underline' }}>{t('reset_account_btn')}</span>
                    </UnifiedButton>
                </div>
            </div>
        </UnifiedModal>
    );
};

export default SettingsModal;
