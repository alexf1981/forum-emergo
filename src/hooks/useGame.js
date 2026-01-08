import { useState, useEffect, useRef } from 'react';
import { DebugLogger } from '../utils/DebugLogger';
import { useLocalStorage } from './useLocalStorage';
import * as GameLogic from '../logic/gameLogic';
import { useAuth } from '../context/AuthContext';
import { DataService } from '../services/dataService';
import { useLanguage } from '../context/LanguageContext';

export function useGame() {
    // === STATE ===
    const [stats, setStats] = useLocalStorage('romestats', { gold: 200, know: 0, pop: 100 });
    const [heroes, setHeroes] = useLocalStorage('romeheroes', []); // We handle init logic in default val context if needed, but [] is safe fallback
    const [habits, setHabits] = useLocalStorage('romehabits', []);
    const [quests, setQuests] = useLocalStorage('romequests', []); // New: Quests State
    const [lastWelcomeDate, setLastWelcomeDate] = useLocalStorage('rome_last_welcome', '');
    const [buildings, setBuildings] = useLocalStorage('romebuildings', GameLogic.INITIAL_BUILDINGS);
    const [resources, setResources] = useLocalStorage('romeresources', GameLogic.INITIAL_RESOURCES);
    const [research, setResearch] = useLocalStorage('romeresearch', {});
    const [loginHistory, setLoginHistory] = useLocalStorage('romeloginhistory', []); // New: Track days logged in

    const { t } = useLanguage();

    // Notifications State (Local UI state, not persisted)
    const [notifications, setNotifications] = useState([]);
    const [combatLog, setCombatLog] = useState([]);

    // === HELPERS ===
    const notify = (msg, type = 'info') => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, msg, type }]);
        setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 3000);
    };

    const log = (msg) => setCombatLog(prev => [{ id: Date.now() + Math.random(), time: new Date(), msg }, ...prev].slice(0, 20));

    // === ACTIONS: HABITS ===


    const incrementHabit = (id) => {
        const habit = habits.find(h => h.id === id);
        if (!habit) return;

        const today = GameLogic.getTodayString();
        // Prevent toggling if already done today
        // Note: Logic allows multiple completions if strict bucket not set? 
        // Assuming current logic is "one click per day" check:
        // Original code didn't check duplicates here but toggleHabit did?
        // Let's assume we proceed.

        // 1. Calculate Rewards Logic
        const type = habit.type || 'virtue';

        const townHall = buildings.find(b => b.type === 'town_hall');
        const thLevel = townHall ? townHall.level : 1;
        const goldChange = GameLogic.calculateTaskGold(type, thLevel);

        // 2. Update Stats using the calculated value
        setStats(s => {
            let newGold = s.gold + goldChange;
            if (newGold < 0) newGold = 0; // Prevent negative from vice
            return { ...s, gold: newGold };
        });

        // 3. Notify using the same calculated value
        const absGold = Math.abs(goldChange);
        if (type === 'vice') {
            notify({ key: 'msg_habit_vice_penalty', args: { gold: absGold } }, "error");
        } else if (type === 'todo') {
            notify({ key: 'msg_habit_todo_reward', args: { gold: absGold } }, "mandatum");
        } else {
            notify({ key: 'msg_habit_virtue_reward', args: { gold: absGold } }, "success");
        }

        // Update Habits
        setHabits(prev => prev.map(h =>
            h.id === id ? { ...h, completed: true, history: [...h.history, today] } : h
        ));
    };

    const decrementHabit = (id) => {
        const h = habits.find(h => h.id === id);
        if (!h) return;

        const today = GameLogic.getTodayString();
        const idx = h.history.lastIndexOf(today);

        // Can't decrement if not done today (floor at 0)
        if (idx === -1) return;

        // Valid decrement
        const newHistory = [...h.history];
        newHistory.splice(idx, 1);

        setHabits(prev => prev.map(hab => hab.id === id ? { ...hab, history: newHistory } : hab));

        const type = h.type || 'virtue';


        // Calculate amount to refund/deduct based on current level
        // Note: This might be slightly inaccurate if level changed since completion, 
        // but acceptable for MVP simplicity.
        const townHall = buildings.find(b => b.type === 'town_hall');
        const thLevel = townHall ? townHall.level : 1;
        const goldAmount = GameLogic.calculateTaskGold(type, thLevel);

        setStats(s => ({ ...s, gold: s.gold - goldAmount })); // Reverse the operation
    };

    const toggleHabit = (id) => {
        const habit = habits.find(h => h.id === id);
        if (!habit) return;

        const today = GameLogic.getTodayString();
        // Check if ALREADY done today (last entry is today)
        // We use lastIndexOf because history can have multiple entries
        const idx = habit.history.lastIndexOf(today);

        if (idx !== -1) {
            // Already done today -> UNDO (Decrement)
            decrementHabit(id);
        } else {
            // Not done today -> DO (Increment)
            incrementHabit(id);
        }
    };

    const addHabit = (text, type, bucket) => {
        setHabits(GameLogic.createHabit(habits, text, type, bucket));

        // Notify based on type
        if (type === 'virtue') {
            notify({ key: 'msg_added_virtue' }, "success");
        } else if (type === 'vice') {
            notify({ key: 'msg_added_vice' }, "error");
        } else {
            notify({ key: 'msg_added_task' }, "success");
        }
    };

    const deleteHabit = (id) => {
        setHabits(GameLogic.deleteHabit(habits, id));
    };

    const updateHabit = (id, newText, newBucket) => {
        setHabits(GameLogic.updateHabit(habits, id, { text: newText, bucket: newBucket }));
    };

    const moveHabit = (activeId, overId, position) => {
        setHabits(GameLogic.reorderHabits(habits, activeId, overId, position));
    };

    const replaceHabits = (newHabits, silent = false) => {
        setHabits(newHabits);
        if (!silent) notify({ key: 'msg_restored' }, "success");
    };

    const setHabitCompletion = (id, date, count) => {
        const habit = habits.find(h => h.id === id);
        if (!habit) return;

        // 1. Sanitize count
        const validCount = Math.max(0, parseInt(count) || 0);

        // 1. Remove ANY existing entries for this date ('2023...', '!2023...', '-2023...')
        const otherDates = habit.history.filter(d => d !== date && d !== `!${date}` && d !== `-${date}`);
        let newHistory = [...otherDates];

        // 2. Add New State
        if (count === null) {
            // Reset to Default: Do nothing (just removed)
        } else if (count === -1) {
            // Explicit Grey (Exempt): Add marker
            newHistory.push(`-${date}`);
        } else if (count === 0) {
            // Explicit Red: Add marker
            newHistory.push(`!${date}`);
        } else {
            // Explicit Green: Add completions
            const validCount = Math.max(1, parseInt(count)); // Ensure at least 1 if positive
            const newEntries = Array(validCount).fill(date);
            newHistory = [...newHistory, ...newEntries];
        }

        // 4. Update Habit
        setHabits(prev => prev.map(h =>
            h.id === id ? { ...h, history: newHistory } : h
        ));

        // Note: We deliberately do NOT update loginHistory here anymore.
        // This ensures other habits remain Grey (Unknown) for that day.

        notify({ key: 'msg_history_updated' }, "success");
    };

    // === ACTIONS: HEROES ===
    const recruitHero = () => {
        // 1. Global Max Check (10)
        if (heroes.length >= 10) {
            notify({ key: 'msg_max_heroes' }, "error");
            return;
        }

        // 2. Tavern Level Cap Check
        const tavern = buildings.find(b => b.type === 'tavern');
        const tavernLevel = tavern ? tavern.level : 0;
        const currentCap = GameLogic.getTavernCap(tavernLevel);

        if (heroes.length >= currentCap) {
            notify({ key: 'msg_tavern_upgrade_required', args: { cap: currentCap } }, "error");
            return;
        }

        // 3. Cost Check (First Hero Free!)
        const isFirstHero = heroes.length === 0;
        const cost = isFirstHero ? 0 : 100;

        if (stats.gold < cost) { notify({ key: 'msg_recruit_fail_gold' }, "error"); return; }

        const name = GameLogic.HERO_NAMES[Math.floor(Math.random() * GameLogic.HERO_NAMES.length)];
        const newHero = {
            id: Date.now(),
            name,
            lvl: 1,
            xp: 0,
            hp: 20,
            maxHp: 20,
            str: Math.floor(Math.random() * 3) + 3,
            items: [],
            status: 'IDLE'
        };

        setStats(s => ({ ...s, gold: s.gold - cost }));
        setHeroes([...heroes, newHero]);
        notify({ key: 'msg_recruit_success', args: { name } }, "success");
    };

    const healHero = (id) => {
        if (stats.gold < 10) return;
        setStats(s => ({ ...s, gold: s.gold - 10 }));
        setHeroes(prev => prev.map(h => h.id === id ? { ...h, hp: h.maxHp } : h));
        notify({ key: 'msg_heal_success' }, "success");
        log({ key: 'msg_heal_success' });
    };

    // === ACTIONS: QUESTS ===
    const startQuest = (questId, heroIds) => {
        const result = GameLogic.startQuest(quests, heroes, stats, questId, heroIds);
        if (result.success) {
            setQuests(result.newQuests);
            setHeroes(result.newHeroes);
            setStats(result.newStats);
            notify({ msg: result.msg }, "success");
        } else {
            notify({ msg: result.msg }, "error");
        }
    };

    const completeQuest = (questInstanceId) => {
        const result = GameLogic.completeQuest(quests, heroes, stats, questInstanceId);
        if (result.success) {
            setQuests(result.newQuests);
            setHeroes(result.newHeroes);
            setStats(result.newStats);
            notify({ msg: result.msg }, "success");
        } else {
            notify({ msg: result.msg }, "error");
        }
    };



    // === ACTIONS: CITY ===
    const buildBuilding = (type) => {
        // 1. Cost Check
        const cost = GameLogic.getDynamicBuildingCost(type, buildings);
        if (stats.gold < cost) {
            notify({ key: 'msg_not_enough_gold', args: { cost } }, "error");
            return;
        }

        const result = GameLogic.buildBuilding(buildings, type);
        if (result.success) {
            setBuildings(result.newBuildings);
            setStats(s => ({ ...s, gold: s.gold - cost }));
            notify({ key: 'msg_building_built', args: { building: t(`building_${type}`), cost } }, "success");
        } else {
            notify({ key: 'msg_no_space', args: { building: t(`building_${type}`) } }, "error");
        }
    };

    const upgradeBuilding = (id) => {
        const building = buildings.find(b => b.id === id);
        if (!building) return;

        const type = building.type || building.id; // type fallback
        const nextLevel = (building.level || 0) + 1;

        // Lookup cost in Upgrade Table depending on type
        // Town Hall and House have specific tables. Others use generic formula or TBD.
        // For now, let's look for explicitly defined costs first.
        let cost = 0;
        if (GameLogic.UPGRADE_COSTS[type] && GameLogic.UPGRADE_COSTS[type][nextLevel]) {
            cost = GameLogic.UPGRADE_COSTS[type][nextLevel];
        } else {
            // Fallback or "Max Level" check
            if (nextLevel > 5) {
                notify({ key: 'msg_building_max_level' }, "info");
                return;
            }
            // Generic fallback if not defined?
            notify({ key: 'msg_no_upgrade_cost' }, "error");
            return;
        }

        // TOWN HALL LEVEL CAP CHECK
        if (type !== 'town_hall') {
            const townHallLevel = GameLogic.getTownHallLevel(buildings);
            if (nextLevel > townHallLevel) {
                notify({ key: 'msg_townhall_required' }, "error");
                return;
            }
        }

        if (stats.gold < cost) {
            notify({ key: 'msg_not_enough_gold', args: { cost } }, "error");
            return;
        }

        setBuildings(prev => GameLogic.upgradeBuilding(prev, id));
        setStats(s => ({ ...s, gold: s.gold - cost }));
        notify({ key: 'msg_building_upgraded', args: { level: nextLevel, cost } }, "success");
    };

    const moveBuilding = (id, x, y) => {
        setBuildings(prev => GameLogic.moveBuilding(prev, id, x, y));
    };

    // === ACTIONS: RESEARCH ===
    const doResearch = (typeId) => {
        const currentLevel = research[typeId] || 0;
        const cost = GameLogic.getResearchCost(typeId, currentLevel);
        const rType = GameLogic.RESEARCH_TYPES[typeId];

        // Global Max Level Check
        if (currentLevel >= rType.maxLevel) {
            notify({ key: 'msg_research_max_level' }, "info");
            return;
        }

        // Library Cap Check
        const libLevel = GameLogic.getLibraryLevel(buildings);
        const cap = GameLogic.getResearchCap(typeId, libLevel);
        if (currentLevel >= cap) {
            notify({ key: 'msg_library_required', args: { level: libLevel + 1 } }, "error");
            return;
        }

        if (stats.gold < cost) {
            notify({ key: 'msg_not_enough_gold', args: { cost } }, "error");
            return;
        }

        setStats(s => ({ ...s, gold: s.gold - cost }));
        setResearch(prev => ({ ...prev, [typeId]: currentLevel + 1 }));
        notify({ key: 'msg_research_complete', args: { research: t(`research_${typeId}`), level: currentLevel + 1 } }, "success");
    };

    // === ADMIN ACTIONS ===
    const adminSetGold = (amount) => {
        setStats(prev => ({ ...prev, gold: parseInt(amount, 10) }));
        notify({ key: 'msg_admin_gold_set', args: { amount } }, "success");
    };

    const adminResetCity = () => {
        setBuildings(GameLogic.INITIAL_BUILDINGS);
        setResearch({});
        setHeroes([]); // Clear heroes
        setLocalBuildings(GameLogic.INITIAL_BUILDINGS);
        // Stats reset usually optional or kept? User said "Stad ontruimen", implying buildings/units gone.
        // Assuming we keep Gold/Pop/Happiness or should reset? 
        // Providing full reset as per previous context:
        // setStats({ gold: 500, population: 0, happiness: 100 }); 
        // But let's stick to just clearing the "Board" (Buildings + Units) + Research
        notify({ key: 'msg_admin_reset' }, "success");
    };


    // === EXPORT / IMPORT ===
    // These manipulate state directly, so they belong here
    const importData = (data) => {
        if (data.romestats) {
            setStats(data.romestats);
            setHabits(data.romehabits);
            setHeroes(data.romeheroes);
            if (data.romebuildings) setBuildings(data.romebuildings);
            if (data.romeresources) setResources(data.romeresources);
            if (data.romeloginhistory) setLoginHistory(data.romeloginhistory);
            notify({ key: 'msg_restored' }, "success");
        }
    };

    const getExportData = () => ({
        romestats: stats,
        romehabits: habits,
        romeheroes: heroes,
        romebuildings: buildings,
        romeresources: resources,
        romeloginhistory: loginHistory
    });


    // === SYNC WITH SUPABASE ===
    const { user } = useAuth();
    const [saveStatus, setSaveStatus] = useState('idle'); // 'idle', 'saving', 'saved', 'error'
    const [isCloudSynchronized, setIsCloudSynchronized] = useState(false);
    const [isNewUser, setIsNewUser] = useState(false);


    // 1. Initial Load from Cloud when user logs in
    const syncInProgress = useRef(null);

    useEffect(() => {
        const syncFromCloud = async () => {
            // Prevent concurrent syncs for the same user (e.g. StrictMode double-fire)
            if (user && syncInProgress.current === user.id) {
                DebugLogger.log('SYNC', `Skipping Duplicate Sync for: ${user.email}`);
                return;
            }

            if (user) {
                syncInProgress.current = user.id;
                DebugLogger.log('SYNC', `Starting Sync for User: ${user.email}`);
                // Reset sync status because we are loading new user data
                // We do NOT want to auto-save local stale data over this new user's cloud data
                setIsCloudSynchronized(false);
                setIsNewUser(false);
                setSaveStatus('loading');

                try {
                    const cloudData = await DataService.loadGameData(user.id);
                    if (cloudData && cloudData.romestats) {
                        DebugLogger.log('SYNC', 'Cloud Data Found & Loaded');
                        setStats(cloudData.romestats);
                        setHabits(cloudData.romehabits);
                        setHeroes(cloudData.romeheroes);
                        if (cloudData.romelastwelcome) {
                            // Smart Sync: Don't overwrite if local is already "Today" (just dismissed) and cloud is old
                            const today = GameLogic.getTodayString();
                            let localVal = '';
                            try {
                                localVal = JSON.parse(window.localStorage.getItem('rome_last_welcome'));
                            } catch (e) { }

                            if (localVal !== today || cloudData.romelastwelcome === today) {
                                setLastWelcomeDate(cloudData.romelastwelcome);
                            } else {
                                DebugLogger.log('SYNC', 'Skipped Stale Welcome Date (Local is Today)');
                            }
                        }
                        if (cloudData.romebuildings) setBuildings(cloudData.romebuildings);
                        if (cloudData.romeresources) setResources(cloudData.romeresources);
                        if (cloudData.romeresearch) setResearch(cloudData.romeresearch);
                        if (cloudData.romeloginhistory) setLoginHistory(cloudData.romeloginhistory);
                        if (cloudData.romequests) setQuests(cloudData.romequests);
                        setIsNewUser(false);
                    } else {
                        // Valid load but no data found -> New User (or wiped)
                        DebugLogger.log('SYNC', 'No Cloud Data Found (New User)');
                        setIsNewUser(true);
                    }
                    setSaveStatus('saved');
                    // Sync success!
                    setIsCloudSynchronized(true);
                    DebugLogger.log('SYNC', 'Sync Complete. isCloudSynchronized = true');
                } catch (error) {
                    console.error("Sync error:", error);
                    setSaveStatus('error');
                    // Sync failed! Do NOT assume synchronized.
                    setIsCloudSynchronized(false);
                    DebugLogger.log('SYNC', `Sync Failed: ${error.message}`);
                    notify({ key: 'msg_sync_error' }, "error");
                } finally {
                    // Release lock
                    if (user && syncInProgress.current === user.id) {
                        syncInProgress.current = null;
                    }
                    // Finally block no longer sets isCloudSynchronized blindly.
                }
            } else {
                // No user? No sync needed, but we are "synchronized" with local (noop)
                DebugLogger.log('SYNC', 'No User. Running in Local Mode.');
                setIsCloudSynchronized(false);
                setIsNewUser(false);
            }
        };
        syncFromCloud();
    }, [user]);

    // 2. Auto-save to cloud when state changes (debounced)
    useEffect(() => {
        // CRITICAL FIX: Do NOT save if we haven't finished loading cloud data yet.
        // This prevents local stale data from overwriting fresh cloud data on startup.
        if (user && isCloudSynchronized) {
            setSaveStatus('pending');
            const dataToSave = {
                romestats: stats,
                romehabits: habits,
                romeheroes: heroes,
                romelastwelcome: lastWelcomeDate,
                romebuildings: buildings,
                romeresources: resources,
                romeresearch: research,
                romeloginhistory: loginHistory,
                romequests: quests
            };

            // Reduced timeout to 200ms to persist faster and feel snappier
            const timeoutId = setTimeout(async () => {
                setSaveStatus('saving');
                const success = await DataService.saveGameData(user.id, dataToSave);
                setSaveStatus(success ? 'saved' : 'error');
            }, 200);

            return () => clearTimeout(timeoutId);
        }
    }, [stats, habits, heroes, lastWelcomeDate, buildings, resources, research, loginHistory, user, isCloudSynchronized]);

    // === DAILY WELCOME ===
    const [showWelcome, setShowWelcome] = useState(false);

    useEffect(() => {
        const today = GameLogic.getTodayString();
        // Check state instead of localStorage
        if (lastWelcomeDate !== today) {
            setShowWelcome(true);
        } else {
            setShowWelcome(false);
        }

        // --- NEW: UPDATE LOGIN HISTORY ---
        // Always ensure 'today' is in login history if we are running
        if (!loginHistory.includes(today)) {
            setLoginHistory(prev => [...prev, today]);
        }
    }, [lastWelcomeDate, loginHistory]);

    const dismissWelcome = () => {
        const today = GameLogic.getTodayString();

        // Calculate Passive Income
        const population = GameLogic.getCityPopulation(buildings);
        const income = GameLogic.getDailyPassiveIncome(stats, population, research);

        if (income.total > 0) {
            setStats(s => ({ ...s, gold: s.gold + income.total }));
            // Notification is now shown in the DailyWelcome modal
        }

        setLastWelcomeDate(today); // Updates state -> trigger save
        setShowWelcome(false);
        setHabits(prev => GameLogic.resetDailyHabits(prev));
    };

    return {
        // State
        stats,
        heroes,
        habits,
        buildings, // NEW
        resources, // NEW
        research, // NEW
        loginHistory, // NEW
        notifications,
        combatLog,
        saveStatus, // Export status
        showWelcome, // NEW
        lastWelcomeDate, // NEW
        // Actions
        actions: {
            toggleHabit,
            incrementHabit,
            decrementHabit,
            addHabit,
            deleteHabit,
            updateHabit,
            moveHabit, // NEW
            recruitHero,
            healHero,

            importData,
            getExportData,
            notify,
            dismissWelcome, // NEW
            replaceHabits,
            setHabitCompletion, // NEW

            // Quests
            startQuest,
            completeQuest,

            // City
            buildBuilding,
            upgradeBuilding,
            moveBuilding,

            // Research
            doResearch,

            // Admin
            adminSetGold,
            adminResetCity
        },
        isLoggedIn: !!user,
        isNewUser, // NEW
        isCloudSynchronized, // Exposed for checks if needed
        quests // NEW
    };
}
