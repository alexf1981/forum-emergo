import { useState, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import * as GameLogic from '../logic/gameLogic';
import { useAuth } from '../context/AuthContext';
import { DataService } from '../services/dataService';

export function useGame() {
    // === STATE ===
    const [stats, setStats] = useLocalStorage('romestats', { gold: 200, know: 0, pop: 100 });
    const [heroes, setHeroes] = useLocalStorage('romeheroes', []); // We handle init logic in default val context if needed, but [] is safe fallback
    const [habits, setHabits] = useLocalStorage('romehabits', [
        { id: 1, text: "Ochtendgymnastiek", completed: false, history: [] },
        { id: 2, text: "Latijn studeren", completed: false, history: [] }
    ]);

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
    const toggleHabit = (id, silent = false) => {
        const { newHabits, newStats, notifications: newNotifs } = GameLogic.processHabitToggle(habits, stats, id, GameLogic.getTodayString());
        setHabits(newHabits);
        setStats(newStats);
        if (!silent) {
            newNotifs.forEach(n => notify(n.msg, n.type));
        }
    };

    const incrementHabit = (id) => {
        const habit = habits.find(h => h.id === id);
        if (!habit) return;

        const type = habit.type || 'virtue';
        const today = GameLogic.getTodayString();

        // Update Stats
        setStats(s => {
            let newGold = s.gold;
            if (type === 'vice') {
                newGold = Math.max(0, s.gold - 20);
            } else if (type === 'todo') {
                newGold = s.gold + 50;
            } else {
                newGold = s.gold + 10;
            }
            return { ...s, gold: newGold };
        });

        // Notify
        if (type === 'vice') {
            notify({ key: 'msg_habit_vice_penalty' }, "error");
        } else if (type === 'todo') {
            notify({ key: 'msg_habit_todo_reward' }, "mandatum");
        } else {
            notify({ key: 'msg_habit_virtue_reward' }, "success");
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
        setStats(s => {
            let newGold = s.gold;
            if (type === 'vice') {
                newGold += 20; // Refund penalty
            } else if (type === 'todo') {
                newGold = Math.max(0, newGold - 50); // Refund reward
            } else {
                newGold = Math.max(0, newGold - 10); // Refund reward
            }
            return { ...s, gold: newGold };
        });
    };
    const addHabit = (text, type, bucket) => {
        setHabits(GameLogic.createHabit(habits, text, type, bucket));
        notify({ key: 'msg_added_task' }, "success");
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

    // === ACTIONS: HEROES ===
    const recruitHero = () => {
        if (stats.gold < 100) { notify({ key: 'msg_recruit_fail_gold' }, "error"); return; }
        const name = GameLogic.HERO_NAMES[Math.floor(Math.random() * GameLogic.HERO_NAMES.length)];
        const newHero = { id: Date.now(), name, lvl: 1, xp: 0, hp: 20, maxHp: 20, str: Math.floor(Math.random() * 3) + 3, items: [] };
        setStats(s => ({ ...s, gold: s.gold - 100 }));
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

    const goAdventure = (heroId, questId) => {
        const hero = heroes.find(h => h.id === heroId);
        const quest = GameLogic.QUESTS.find(q => q.id === questId);
        if (!quest) { notify({ key: 'msg_select_mission' }, "warning"); return; }
        if (hero.hp <= 5) { notify({ key: 'msg_hero_wounded', args: { name: hero.name } }, "error"); return; }

        if (hero.hp <= 5) { notify({ key: 'msg_hero_wounded', args: { name: hero.name } }, "error"); return; }

        // Use translated quest name in args? Or pass quest object? 
        // We can pass simple quest name, but if quest name is translated dynamically in view it's better.
        // But QUEST names are in translations.js? No, they are in gameLogic.js as "name" property (Dutch).
        // I should probably translate quest name too. `quest_${quest.id}` is the key.
        log({ key: 'msg_hero_depart', args: { name: hero.name, quest: quest.id } }); // Pass quest ID to resolve translation

        // Async result handling in hook? Ideally UI shouldn't wait, but we use setTimeout for effect
        setTimeout(() => {
            const result = GameLogic.calculateBattleResult(hero, quest);
            if (result.success) {
                log({
                    key: 'msg_win',
                    args: {
                        xp: result.earnedXp,
                        gold: result.earnedGold,
                        loot: result.lootMsg // This is a nested message object {key, args}
                    }
                });
                if (result.lootMsg) notify(result.lootMsg, "success"); // lootMsg is already { key, args } from gameLogic
                setHeroes(prev => prev.map(h => {
                    if (h.id !== heroId) return h;
                    if (result.leveledUp) {
                        log({ key: 'msg_levelup', args: { name: h.name, lvl: result.newLvl } });
                        notify({ key: 'msg_levelup_toast', args: { name: h.name } }, "success");
                    }
                    return { ...h, xp: result.newXp, lvl: result.newLvl, str: result.newStr, hp: result.hp, items: result.newItems };
                }));
                setStats(s => ({ ...s, gold: s.gold + result.earnedGold }));
            } else {
                log({ key: 'msg_loss', args: { name: hero.name, dmg: result.dmgTaken } });
                setHeroes(prev => prev.map(h => h.id === heroId ? { ...h, hp: result.hp } : h));
                notify({ key: 'msg_defeat_title' }, "error");
            }
        }, 500);
    };

    const fightBoss = () => {
        const totalStr = heroes.reduce((acc, h) => acc + h.str + h.items.reduce((s, i) => s + i.bonus, 0) + h.lvl, 0);
        log({ key: 'msg_hydra_fight', args: { str: totalStr } });
        if (totalStr > 250) {
            log({ key: 'msg_hydra_win' });
            notify({ key: 'msg_hydra_win_toast' }, "success");
            setStats(s => ({ ...s, gold: s.gold + 50000 }));
        } else {
            log({ key: 'msg_hydra_fail' });
            notify({ key: 'msg_hydra_fail_toast' }, "error");
        }
    };

    // === EXPORT / IMPORT ===
    // These manipulate state directly, so they belong here
    const importData = (data) => {
        if (data.romestats) {
            setStats(data.romestats);
            setHabits(data.romehabits);
            setHeroes(data.romeheroes);
            notify({ key: 'msg_restored' }, "success");
        }
    };

    const getExportData = () => ({ romestats: stats, romehabits: habits, romeheroes: heroes });


    // === SYNC WITH SUPABASE ===
    const { user } = useAuth();
    const [saveStatus, setSaveStatus] = useState('idle'); // 'idle', 'saving', 'saved', 'error'
    const [isCloudSynchronized, setIsCloudSynchronized] = useState(false);

    // 1. Initial Load from Cloud when user logs in
    useEffect(() => {
        const syncFromCloud = async () => {
            if (user) {
                // Reset sync status because we are loading new user data
                // We do NOT want to auto-save local stale data over this new user's cloud data
                setIsCloudSynchronized(false);
                setSaveStatus('loading');

                try {
                    const cloudData = await DataService.loadGameData(user.id);
                    if (cloudData && cloudData.romestats) {
                        setStats(cloudData.romestats);
                        setHabits(cloudData.romehabits);
                        setHeroes(cloudData.romeheroes);
                    }
                    setSaveStatus('saved');
                } catch (error) {
                    console.error("Sync error:", error);
                    setSaveStatus('error');
                    notify("Kon niet synchroniseren met de cloud", "error"); // "Could not sync with cloud"
                } finally {
                    // Whether success or fail, we attempted sync.
                    // If fail, we arguably might not want to overwrite cloud with local, but 
                    // usually we let user continue. For safety, let's say we are synchronized 
                    // so valid local changes can eventually be saved.
                    setIsCloudSynchronized(true);
                }
            } else {
                // No user? No sync needed, but we are "synchronized" with local (noop)
                setIsCloudSynchronized(false);
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
                romeheroes: heroes
            };

            // Reduced timeout to 200ms to persist faster and feel snappier
            const timeoutId = setTimeout(async () => {
                setSaveStatus('saving');
                const success = await DataService.saveGameData(user.id, dataToSave);
                setSaveStatus(success ? 'saved' : 'error');
            }, 200);

            return () => clearTimeout(timeoutId);
        }
    }, [stats, habits, heroes, user, isCloudSynchronized]);

    // === DAILY WELCOME ===
    const [showWelcome, setShowWelcome] = useState(false);

    useEffect(() => {
        const lastDate = localStorage.getItem('rome_last_welcome');
        const today = GameLogic.getTodayString();
        if (lastDate !== today) {
            setShowWelcome(true);
        }
    }, []);

    const dismissWelcome = () => {
        const today = GameLogic.getTodayString();
        localStorage.setItem('rome_last_welcome', today);
        setShowWelcome(false);
        setHabits(prev => GameLogic.resetDailyHabits(prev));
    };

    return {
        // State
        stats,
        heroes,
        habits,
        notifications,
        combatLog,
        saveStatus, // Export status
        showWelcome, // NEW
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
            goAdventure,
            fightBoss,
            importData,
            getExportData,
            notify,
            dismissWelcome // NEW
        },
        isLoggedIn: !!user
    };
}
