import React, { useState, useEffect } from 'react';
import * as GameLogic from '../logic/gameLogic';
import BottomNav from './layout/BottomNav';
import HeroBanner from './layout/HeroBanner';
import CityView from './views/CityView';
// import TavernView from './views/TavernView'; // Deprecated
import CapitalView from './views/CapitalView'; // New City Builder View
import AdventureView from './views/AdventureView';
import AddTaskModal from './AddTaskModal';
import SettingsModal from './SettingsModal';
import AuthModal from './AuthModal';
import DailyWelcome from './DailyWelcome';
import WelcomeModal from './WelcomeModal';
import OnboardingModal from './OnboardingModal';
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
    const [authInitialMode, setAuthInitialMode] = useState('login'); // 'login' or 'register'
    const [showFirstVisitModal, setShowFirstVisitModal] = useState(false);
    const [isHeaderCompact, setIsHeaderCompact] = useState(false);
    const [selectedQuest, setSelectedQuest] = useState(null);
    const [useRomanNumerals, setUseRomanNumerals] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(false);

    // === HOOK ===
    const { stats, heroes, habits, notifications, actions, combatLog, saveStatus, isLoggedIn, showWelcome, lastWelcomeDate, isNewUser, isCloudSynchronized, buildings, resources, research, loginHistory } = useGame();

    // Scroll listener & First Visit Check
    useEffect(() => {
        const handleScroll = () => {
            // ...
            const scrollPos = window.scrollY || document.documentElement.scrollTop;
            setIsHeaderCompact(prev => {
                if (!prev && scrollPos > 80) return true;
                if (prev && scrollPos < 40) return false;
                return prev;
            });
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        // Check for logout message
        const logoutMsg = localStorage.getItem('logout_message');
        if (logoutMsg) {
            setTimeout(() => actions.notify(logoutMsg, "info"), 500);
            localStorage.removeItem('logout_message');
        }

        // Check for First Visit
        const hasVisited = localStorage.getItem('has_visited');
        if (!hasVisited) {
            // No history? Show Welcome!
            setShowFirstVisitModal(true);
        }

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // === SEEDING FOR NEW CLOUD USERS ===
    useEffect(() => {
        // If we are a new user (cloud confirmed no data) and local habits are empty, seed defaults
        if (isNewUser && isCloudSynchronized && habits.length === 0) {
            const newHabits = [
                { id: Date.now() + 1, text: t('habit_walk_10k'), type: 'virtue', completed: false, history: [], recurring: false },
                { id: Date.now() + 3, text: t('habit_hobby'), type: 'virtue', completed: false, history: [], recurring: true },
                { id: Date.now() + 4, text: t('habit_sleep_late'), type: 'vice', completed: false, history: [], recurring: false },
                { id: Date.now() + 5, text: t('habit_smoke'), type: 'vice', completed: false, history: [], recurring: true },
                { id: Date.now() + 7, text: t('habit_taxes'), type: 'todo', completed: false, history: [], recurring: false }
            ];
            actions.replaceHabits(newHabits, true);
            actions.notify(t('msg_enjoy_rome'), "success");
            setShowOnboarding(true);
        }
    }, [isNewUser, isCloudSynchronized, habits, actions, t]);

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
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
        }
        return num;
    };

    // Import/Export Handlers


    const [authFromStart, setAuthFromStart] = useState(false);

    // Derived State
    const score = GameLogic.getScore(stats);
    const rank = GameLogic.getCityRank(stats);

    const handleLoginSuccess = (email) => {
        setShowAuthModal(false);
        setShowSettings(false);
        setAuthFromStart(false);

        // If we came from start page, we can now mark as visited
        if (!localStorage.getItem('has_visited')) {
            localStorage.setItem('has_visited', 'true');
        }

        actions.notify(t('login_success') + ` ${email}`, "success");
    };

    const handleAuthClose = () => {
        setShowAuthModal(false);
        // If we were in the start flow, go back to start page
        if (authFromStart) {
            setShowFirstVisitModal(true);
            setAuthFromStart(false); // Reset this so if we play local later it handles correctly? Or just fine. 
            // Actually if we go back to start, we are reset.
        }
    };

    const handleLocalLogout = () => {
        setShowSettings(false);
        // Clear flag so Welcome appears
        localStorage.removeItem('has_visited');
        setShowFirstVisitModal(true);
        // Clean up other state if needed (like Daily Welcome)
        actions.dismissWelcome();
    };

    return (
        <div className="wrapper">
            {showOnboarding && <OnboardingModal onClose={() => setShowOnboarding(false)} />}
            {/* First Visit Modal - Highest Priority */}
            {showFirstVisitModal && (
                <WelcomeModal
                    hasLocalData={habits.length > 0}
                    onLogin={() => {
                        // Don't mark visited yet
                        setShowFirstVisitModal(false);
                        setAuthInitialMode('login');
                        setAuthFromStart(true);
                        setShowAuthModal(true);
                    }}
                    onRegister={() => {
                        // Don't mark visited yet
                        setShowFirstVisitModal(false);
                        // Dismiss daily welcome for new registrations logic handled later? 
                        // Actually if we register, we eventually login/confirm.
                        actions.dismissWelcome(); // Suppress Ave Keizer for registration flow
                        setAuthInitialMode('register');
                        setAuthFromStart(true);
                        setShowAuthModal(true);
                    }}
                    onPlayLocal={() => {
                        localStorage.setItem('has_visited', 'true');
                        setShowFirstVisitModal(false);
                        // Dismiss daily welcome for local play (start fresh)
                        actions.dismissWelcome();
                        actions.notify(t('msg_enjoy_rome'), "success");

                        // Only seed defaults if no local data exists
                        if (habits.length === 0) {
                            const newHabits = [
                                { id: Date.now() + 1, text: t('habit_walk_10k'), type: 'virtue', completed: false, history: [], recurring: false },
                                { id: Date.now() + 3, text: t('habit_hobby'), type: 'virtue', completed: false, history: [], recurring: true },
                                { id: Date.now() + 4, text: t('habit_sleep_late'), type: 'vice', completed: false, history: [], recurring: false },
                                { id: Date.now() + 5, text: t('habit_smoke'), type: 'vice', completed: false, history: [], recurring: true },
                                { id: Date.now() + 7, text: t('habit_taxes'), type: 'todo', completed: false, history: [], recurring: false }
                            ];
                            actions.replaceHabits(newHabits, true);
                            setShowOnboarding(true);
                        }
                        // We already notified "Enjoy Rome" above
                    }}
                />
            )}

            {showWelcome && !showFirstVisitModal && !showAuthModal && (
                <DailyWelcome
                    onDismiss={actions.dismissWelcome}
                    habits={habits}
                    stats={stats}
                    buildings={buildings}
                    research={research}
                    lastWelcomeDate={lastWelcomeDate}
                    formatNumber={formatNumber}
                />
            )}
            {showSettings && <SettingsModal
                onClose={() => setShowSettings(false)}
                useRomanNumerals={useRomanNumerals}
                toggleRomanNumerals={() => setUseRomanNumerals(prev => !prev)}
                onLogin={() => {
                    setAuthInitialMode('login');
                    setAuthFromStart(false); // Normal login from settings
                    setShowAuthModal(true);
                }}
                onLocalLogout={handleLocalLogout}
                actions={actions}
            />}

            <AuthModal
                isOpen={showAuthModal}
                onClose={handleAuthClose}
                onLoginSuccess={handleLoginSuccess}
                initialMode={authInitialMode}
                closeOnOverlayClick={!authFromStart}
            />

            {showAddTaskModal && (
                <AddTaskModal
                    onClose={() => setShowAddTaskModal(false)}
                    onAdd={actions.addHabit}
                />
            )}

            {activeTab === 'city' && (
                <button className="fab" onClick={() => setShowAddTaskModal(true)} title={t('habit_new')}>+</button>
            )}

            <div className={`hero-placeholder ${isHeaderCompact || activeTab === 'tavern' ? 'compact' : ''}`} />
            <HeroBanner isCompact={isHeaderCompact || activeTab === 'tavern'} />

            <div className="app-container">
                {activeTab === 'city' && (
                    <CityView
                        habits={habits}
                        stats={stats}
                        buildings={buildings} // Passed for population calculation
                        rank="rank_1" // TODO: derive from stats
                        score={0}     // TODO: derive
                        onToggleHabit={actions.toggleHabit}
                        onIncrementHabit={actions.incrementHabit}
                        onDecrementHabit={actions.decrementHabit}
                        onAddHabit={actions.addHabit}
                        onDeleteHabit={actions.deleteHabit}
                        onUpdateHabit={actions.updateHabit}
                        onMoveHabit={actions.moveHabit} // NEW
                        onNotify={actions.notify} // NEW
                        formatNumber={formatNumber}
                        loginHistory={loginHistory} // NEW: For calendar visualization
                    />
                )}

                {activeTab === 'tavern' && (
                    <CapitalView
                        stats={stats}
                        heroes={heroes}
                        actions={actions}
                        buildings={buildings}
                        resources={resources}
                        formatNumber={formatNumber}
                        research={research}
                    />
                )}

                {activeTab === 'adventure' && (
                    <AdventureView />
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
