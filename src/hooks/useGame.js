import { useState, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import * as GameLogic from '../logic/gameLogic';
import { useAuth } from '../context/AuthContext';
import { DataService } from '../services/dataService';

export function useGame() {
    // === STATE ===
    const [stats, setStats] = useLocalStorage('romestats', { gold: 200, army: 10, know: 0, pop: 100 });
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

    const log = (msg) => setCombatLog(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 20));

    // === ACTIONS: HABITS ===
    const toggleHabit = (id) => {
        const { newHabits, newStats, notifications: newNotifs } = GameLogic.processHabitToggle(habits, stats, id, GameLogic.getTodayString());
        setHabits(newHabits);
        setStats(newStats);
        newNotifs.forEach(n => notify(n.msg, n.type));
    };

    const incrementHabit = (id) => {
        // Logic copied from App.jsx
        setHabits(prev => prev.map(h => {
            if (h.id === id) {
                const type = h.type || 'virtue';
                const today = GameLogic.getTodayString();
                if (type === 'vice') {
                    setStats(s => ({ ...s, gold: Math.max(0, s.gold - 20), army: Math.max(0, (s.army || 0) - 5) }));
                    notify("De verleiding won... (-20 Goud)", "error");
                } else {
                    setStats(s => ({ ...s, gold: s.gold + 10, army: (s.army || 0) + 1 }));
                }
                return { ...h, completed: true, history: [...h.history, today] };
            }
            return h;
        }));
    };

    const addHabit = (text, type, bucket) => {
        setHabits(GameLogic.createHabit(habits, text, type, bucket));
        notify("Nieuwe taak toegevoegd!", "success");
    };

    const deleteHabit = (id) => {
        setHabits(GameLogic.deleteHabit(habits, id));
    };

    const updateHabit = (id, newText, newBucket) => {
        setHabits(GameLogic.updateHabit(habits, id, { text: newText, bucket: newBucket }));
    };

    // === ACTIONS: HEROES ===
    const recruitHero = () => {
        if (stats.gold < 100) { notify("Niet genoeg goud! (Nodig: 100)", "error"); return; }
        const name = GameLogic.HERO_NAMES[Math.floor(Math.random() * GameLogic.HERO_NAMES.length)];
        const newHero = { id: Date.now(), name, lvl: 1, xp: 0, hp: 20, maxHp: 20, str: Math.floor(Math.random() * 3) + 3, items: [] };
        setStats(s => ({ ...s, gold: s.gold - 100 }));
        setHeroes([...heroes, newHero]);
        notify(`${name} is gerekruteerd!`, "success");
    };

    const healHero = (id) => {
        if (stats.gold < 10) return;
        setStats(s => ({ ...s, gold: s.gold - 10 }));
        setHeroes(prev => prev.map(h => h.id === id ? { ...h, hp: h.maxHp } : h));
        log("Held is verzorgd.");
    };

    const goAdventure = (heroId, questId) => {
        const hero = heroes.find(h => h.id === heroId);
        const quest = GameLogic.QUESTS.find(q => q.id === questId);
        if (!quest) { notify("Selecteer eerst een missie type!", "warning"); return; }
        if (hero.hp <= 5) { notify(`${hero.name} is te gewond!`, "error"); return; }

        log(`⚔️ ${hero.name} vertrekt: ${quest.name}...`);

        // Async result handling in hook? Ideally UI shouldn't wait, but we use setTimeout for effect
        setTimeout(() => {
            const result = GameLogic.calculateBattleResult(hero, quest);
            if (result.success) {
                log(`✅ WINST! +${result.earnedXp} XP, +${result.earnedGold} Goud${result.lootMsg}`);
                if (result.lootMsg) notify(result.lootMsg.replace(' | ', ''), "success");
                setHeroes(prev => prev.map(h => {
                    if (h.id !== heroId) return h;
                    if (result.leveledUp) {
                        log(`🆙 ${h.name} is nu level ${result.newLvl}! (+2 Str)`);
                        notify(`${h.name} Level Up!`, "success");
                    }
                    return { ...h, xp: result.newXp, lvl: result.newLvl, str: result.newStr, hp: result.hp, items: result.newItems };
                }));
                setStats(s => ({ ...s, gold: s.gold + result.earnedGold }));
            } else {
                log(`❌ NEDERLAAG! ${hero.name} vlucht... (-${result.dmgTaken} HP)`);
                setHeroes(prev => prev.map(h => h.id === heroId ? { ...h, hp: result.hp } : h));
                notify("Nederlaag...", "error");
            }
        }, 500);
    };

    const fightBoss = () => {
        const totalStr = heroes.reduce((acc, h) => acc + h.str + h.items.reduce((s, i) => s + i.bonus, 0) + h.lvl, 0);
        log(`🐲 HYDRA GEVECHT! Totale Kracht: ${totalStr} vs 250`);
        if (totalStr > 250) {
            log(`🏆 OVERWINNING! DE HYDRA IS VERSLAGEN!`);
            notify("FORUM EMERGO IS EEUWIG!", "success");
            setStats(s => ({ ...s, gold: s.gold + 50000 }));
        } else {
            log(`💀 Je legioen is te zwak!`);
            notify("Legioen te zwak...", "error");
        }
    };

    // === EXPORT / IMPORT ===
    // These manipulate state directly, so they belong here
    const importData = (data) => {
        if (data.romestats) {
            setStats(data.romestats);
            setHabits(data.romehabits);
            setHeroes(data.romeheroes);
            notify("Kronieken hersteld!", "success");
        }
    };

    const getExportData = () => ({ romestats: stats, romehabits: habits, romeheroes: heroes });


    // === SYNC WITH SUPABASE ===
    const { user } = useAuth();
    const [saveStatus, setSaveStatus] = useState('idle'); // 'idle', 'saving', 'saved', 'error'

    // 1. Initial Load from Cloud when user logs in
    useEffect(() => {
        const syncFromCloud = async () => {
            if (user) {
                setSaveStatus('loading');
                const cloudData = await DataService.loadGameData(user.id);
                if (cloudData && cloudData.romestats) {
                    console.log("Syncing from Cloud...", cloudData);
                    setStats(cloudData.romestats);
                    setHabits(cloudData.romehabits);
                    setHeroes(cloudData.romeheroes);
                }
                setSaveStatus('saved');
            }
        };
        syncFromCloud();
    }, [user]);

    // 2. Auto-save to cloud when state changes (debounced)
    useEffect(() => {
        if (user) {
            setSaveStatus('pending');
            const dataToSave = {
                romestats: stats,
                romehabits: habits,
                romeheroes: heroes
            };

            // Reduced timeout to 1000ms to persist faster
            const timeoutId = setTimeout(async () => {
                setSaveStatus('saving');
                const success = await DataService.saveGameData(user.id, dataToSave);
                setSaveStatus(success ? 'saved' : 'error');
            }, 1000);

            return () => clearTimeout(timeoutId);
        }
    }, [stats, habits, heroes, user]);


    return {
        // State
        stats,
        heroes,
        habits,
        notifications,
        combatLog,
        saveStatus, // Export status
        // Actions
        actions: {
            toggleHabit,
            incrementHabit,
            addHabit,
            deleteHabit,
            updateHabit,
            recruitHero,
            healHero,
            goAdventure,
            fightBoss,
            importData,
            getExportData,
            notify // Expose notify for App usage
        },
        isLoggedIn: !!user
    };
}
