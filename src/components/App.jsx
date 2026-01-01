import React, { useState, useEffect } from 'react';
import * as GameLogic from '../logic/gameLogic';
import BottomNav from './layout/BottomNav';
import CityView from './views/CityView';
import TavernView from './views/TavernView';
import AdventureView from './views/AdventureView';
import AddTaskModal from './AddTaskModal';
import SettingsModal from './SettingsModal';
import AuthModal from './AuthModal';
import DailyWelcome from './DailyWelcome';
import { useGame } from '../hooks/useGame';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

function App() {
    const { t } = useLanguage();
    const { playerName, updatePlayerName } = useAuth();
    // === STATE ===
    const [activeTab, setActiveTab] = useState('city');
    const [showSettings, setShowSettings] = useState(false);
    const [showAddTaskModal, setShowAddTaskModal] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [isHeaderCompact, setIsHeaderCompact] = useState(false);
    const [selectedQuest, setSelectedQuest] = useState(null);
    const [useRomanNumerals, setUseRomanNumerals] = useState(false);

    // === HOOK ===
    const { stats, heroes, habits, notifications, actions, combatLog, saveStatus, isLoggedIn, showWelcome } = useGame();

    // Scroll listener
    useEffect(() => {
        const handleScroll = () => {
            const scrollPos = window.scrollY || document.documentElement.scrollTop;
            setIsHeaderCompact(prev => {
                if (!prev && scrollPos > 80) return true;
                if (prev && scrollPos < 40) return false;
                return prev;
            });
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        // Check for logout message (persisted across reload)
        const logoutMsg = localStorage.getItem('logout_message');
        if (logoutMsg) {
            setTimeout(() => actions.notify(logoutMsg, "info"), 500);
            localStorage.removeItem('logout_message');
        }

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Helper Wrappers for UI logic mixing with Game logic
    const handleIncrement = (id, e) => {
        e.stopPropagation();
        const habit = habits.find(h => h.id === id);
        if (habit.type === 'todo') return;
        actions.incrementHabit(id);
    };

    const handleDelete = (id, force = false) => {
        if (force === true || confirm(t('habit_delete_confirm'))) {
            actions.deleteHabit(id);
        }
    };

    const formatNumber = (num) => {
        if (useRomanNumerals) {
            return GameLogic.toRoman(num);
        }
        return num;
    };

    // Import/Export Handlers
    const handleExport = () => {
        const gameData = actions.getExportData();
        const data = { ...gameData, player_name: playerName };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `forum-emergo-backup-${GameLogic.getTodayString()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleImport = (file) => {
        if (!confirm(t('confirm') + "?")) return; // "Confirm?"
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.player_name) {
                    updatePlayerName(data.player_name);
                }
                actions.importData(data);
            } catch (err) { console.error(err); alert("Error!"); }
        };
        reader.readAsText(file);
    };

    // Derived State
    const score = GameLogic.getScore(stats);
    const rank = GameLogic.getCityRank(stats);

    const handleLoginSuccess = (email) => {
        setShowAuthModal(false);
        setShowSettings(false);
        actions.notify(t('login_success') + ` ${email}`, "success");
    };



    return (
        <div className="wrapper">
            {showWelcome && <DailyWelcome onDismiss={actions.dismissWelcome} />}
            {showSettings && <SettingsModal
                onClose={() => setShowSettings(false)}
                onExport={handleExport}
                onImport={handleImport}
                useRomanNumerals={useRomanNumerals}
                toggleRomanNumerals={() => setUseRomanNumerals(prev => !prev)}
                onLogin={() => {
                    // Start login flow: show auth modal, keep settings open in background (it will be closed on success)
                    setShowAuthModal(true);
                }}
            />}

            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                onLoginSuccess={handleLoginSuccess}
            />

            {showAddTaskModal && (
                <AddTaskModal
                    onClose={() => setShowAddTaskModal(false)}
                    onAdd={actions.addHabit}
                />
            )}

            <button className="fab" onClick={() => setShowAddTaskModal(true)} title={t('habit_new')}>+</button>

            <div className={`hero-placeholder ${isHeaderCompact ? 'compact' : ''}`} />
            <div className={`hero-banner ${isHeaderCompact ? 'compact' : ''}`}>
                <div className="hero-overlay header-content">
                    <h1>Forum Emergo</h1>
                    <div className="subtitle">{t('subtitle')}</div>
                </div>
            </div>

            <div className="app-container">
                {activeTab === 'city' && (
                    <CityView
                        habits={habits}
                        stats={stats}
                        rank={rank}
                        score={score}
                        onToggleHabit={actions.toggleHabit}
                        onIncrementHabit={handleIncrement}
                        onDecrementHabit={actions.decrementHabit}
                        onAddHabit={actions.addHabit}
                        onDeleteHabit={handleDelete}
                        onUpdateHabit={actions.updateHabit}
                        formatNumber={formatNumber}
                    />
                )}

                {activeTab === 'tavern' && (
                    <TavernView
                        heroes={heroes}
                        gold={stats.gold}
                        onRecruit={actions.recruitHero}
                        onHeal={actions.healHero}
                        formatNumber={formatNumber}
                    />
                )}

                {activeTab === 'adventure' && (
                    <AdventureView
                        heroes={heroes}
                        selectedQuest={selectedQuest}
                        onSelectQuest={setSelectedQuest}
                        onGoAdventure={actions.goAdventure}
                        onFightBoss={actions.fightBoss}
                        formatNumber={formatNumber}
                        combatLog={combatLog}
                    />
                )}

                <div className="toast-container">
                    {notifications.map(n => {
                        let text = "";
                        if (typeof n.msg === 'string') {
                            text = n.msg;
                        } else if (n.msg && n.msg.key) {
                            text = t(n.msg.key, n.msg.args);
                        }
                        return <div key={n.id} className={`toast ${n.type}`}>{text}</div>;
                    })}
                </div>
            </div>

            <BottomNav
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onProfileClick={() => setShowSettings(true)}
                stats={stats}
                formatNumber={formatNumber}
                saveStatus={saveStatus}
                isLoggedIn={isLoggedIn}
            />
        </div>
    );
}

export default App;
