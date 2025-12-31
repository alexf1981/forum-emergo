import React, { useState, useEffect } from 'react';
import * as GameLogic from '../logic/gameLogic';
import Icons from './Icons';
import CityVisual from './CityVisual';
import AddTaskModal from './AddTaskModal';
import SettingsModal from './SettingsModal';

function App() {
    // === STATE ===
    const [activeTab, setActiveTab] = useState('city');
    const [showSettings, setShowSettings] = useState(false);
    const [showAddTaskModal, setShowAddTaskModal] = useState(false);
    const [editingHabitId, setEditingHabitId] = useState(null);
    const [isHeaderCompact, setIsHeaderCompact] = useState(false);

    const [stats, setStats] = useState(() => {
        const saved = localStorage.getItem('romestats');
        return saved ? JSON.parse(saved) : { gold: 200, army: 10, know: 0, pop: 100 };
    });

    const [habits, setHabits] = useState(() => {
        const saved = localStorage.getItem('romehabits');
        const initial = [
            { id: 1, text: "Ochtendgymnastiek", completed: false, history: [] },
            { id: 2, text: "Latijn studeren", completed: false, history: [] }
        ];
        if (!saved) return initial;
        const parsed = JSON.parse(saved);
        return parsed.map(h => ({ ...h, history: Array.isArray(h.history) ? h.history : [] }));
    });

    const [heroes, setHeroes] = useState(() => {
        const saved = localStorage.getItem('romeheroes');
        let loaded = saved ? JSON.parse(saved) : [];
        return loaded.map(h => ({ ...h, items: h.items || [], maxHp: h.maxHp || 20 }));
    });

    const [combatLog, setCombatLog] = useState([]);
    const [selectedQuest, setSelectedQuest] = useState(null);
    const [notifications, setNotifications] = useState([]);

    // Persistence
    useEffect(() => {
        localStorage.setItem('romestats', JSON.stringify(stats));
        localStorage.setItem('romeheroes', JSON.stringify(heroes));
        localStorage.setItem('romehabits', JSON.stringify(habits));
    }, [stats, habits, heroes]);

    // Scroll listener for shrinking header
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
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Helpers
    const log = (msg) => setCombatLog(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 20));
    const notify = (msg, type = 'info') => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, msg, type }]);
        setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 3000);
    };

    // === ACTIONS: CITY ===
    const toggleHabit = (id) => {
        const { newHabits, newStats, notifications: newNotifs } = GameLogic.processHabitToggle(habits, stats, id, GameLogic.getTodayString());
        setHabits(newHabits);
        setStats(newStats);
        newNotifs.forEach(n => notify(n.msg, n.type));
    };

    const incrementHabit = (id, e) => {
        e.stopPropagation();
        const habit = habits.find(h => h.id === id);
        if (habit.type === 'todo') return;

        const { newHabits, newStats, notifications: newNotifs } = GameLogic.processHabitToggle(habits, stats, id, GameLogic.getTodayString());
        // Since processHabitToggle is a toggle, and we want to increment (add another hit for today),
        // we might need a specific logic if we want to support multiple counts per day in the logic layer.
        // For now, keeping the original logic:
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
    };

    const deleteHabit = (id) => {
        if (confirm('Zeker weten dat je deze activiteit wilt verwijderen?')) {
            setHabits(GameLogic.deleteHabit(habits, id));
        }
    };

    const saveHabitEdit = (id, newText, newBucket) => {
        setHabits(GameLogic.updateHabit(habits, id, { text: newText, bucket: newBucket }));
        setEditingHabitId(null);
    };

    // === ACTIONS: RPG ===
    const recruitHero = () => {
        if (stats.gold < 100) { notify("Niet genoeg goud! (Nodig: 100)", "error"); return; }
        const name = GameLogic.HERO_NAMES[Math.floor(Math.random() * GameLogic.HERO_NAMES.length)];
        const newHero = { id: Date.now(), name, lvl: 1, xp: 0, hp: 20, maxHp: 20, str: Math.floor(Math.random() * 3) + 3, items: [] };
        setStats(s => ({ ...s, gold: s.gold - 100 }));
        setHeroes([...heroes, newHero]);
        notify(`${name} is gerekruteerd!`, "success");
    };

    const goAdventure = (heroId, questId) => {
        const hero = heroes.find(h => h.id === heroId);
        const quest = GameLogic.QUESTS.find(q => q.id === questId);
        if (!quest) { notify("Selecteer eerst een missie type!", "warning"); return; }
        if (hero.hp <= 5) { notify(`${hero.name} is te gewond!`, "error"); return; }

        log(`⚔️ ${hero.name} vertrekt: ${quest.name}...`);
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

    const healHero = (id) => {
        if (stats.gold < 10) return;
        setStats(s => ({ ...s, gold: s.gold - 10 }));
        setHeroes(prev => prev.map(h => h.id === id ? { ...h, hp: h.maxHp } : h));
        log("Held is verzorgd.");
    };

    const handleExport = () => {
        const data = { romestats: stats, romehabits: habits, romeheroes: heroes };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `forum-emergo-backup-${GameLogic.getTodayString()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        notify("Kronieken opgeslagen!", "success");
    };

    const handleImport = (file) => {
        if (!confirm("Overschrijven?")) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.romestats) {
                    setStats(data.romestats);
                    setHabits(data.romehabits);
                    setHeroes(data.romeheroes);
                    notify("Kronieken hersteld!", "success");
                }
            } catch (err) { notify("Fout bij lezen!", "error"); }
        };
        reader.readAsText(file);
    };

    const score = GameLogic.getScore(stats);
    const rank = GameLogic.getCityRank(stats);

    return (
        <div className="wrapper">
            {showSettings && <SettingsModal onClose={() => setShowSettings(false)} onExport={handleExport} onImport={handleImport} />}
            {showAddTaskModal && (
                <AddTaskModal
                    onClose={() => setShowAddTaskModal(false)}
                    onAdd={(text, type, bucket) => {
                        addHabit(text, type, bucket);
                        notify("Nieuwe taak toegevoegd!", "success");
                    }}
                />
            )}

            <button className="fab" onClick={() => setShowAddTaskModal(true)} title="Nieuwe taak">+</button>

            <div className={`hero-placeholder ${isHeaderCompact ? 'compact' : ''}`} />
            <div className={`hero-banner ${isHeaderCompact ? 'compact' : ''}`}>
                <div className="hero-overlay header-content">
                    <h1>Forum Emergo</h1>
                    <div className="subtitle">Bouw je imperium, verover de wereld</div>
                </div>
            </div>

            <div className="app-container">
                {activeTab === 'city' && (
                    <div className="city-dashboard">
                        <div className="main-grid">
                            <aside>
                                <div className="card">
                                    <div className="card-title"><h3>Stad Status</h3></div>
                                    <CityVisual rank={rank} score={score} />
                                    <div className="stat-row"><span className="resource gold"><Icons.Coin /> Goud</span><span>{stats.gold}</span></div>
                                    <div className="stat-row"><span className="resource army"><Icons.Sword /> Leger</span><span>{stats.army}</span></div>
                                </div>
                            </aside>

                            <main className="city-dashboard-content" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', flexGrow: 1 }}>
                                <div className="city-columns-container">
                                    {['virtue', 'vice', 'todo'].map(colType => {
                                        const colTitle = colType === 'virtue' ? 'Virtutes' : colType === 'vice' ? 'Barbaria' : 'Mandata';
                                        const colColor = colType === 'virtue' ? '#4caf50' : colType === 'vice' ? '#ff4444' : '#2196f3';

                                        return (
                                            <div className="city-col" key={colType}>
                                                <div className="city-col-header" style={{ color: colColor, borderColor: colColor }}>{colTitle}</div>
                                                <div className="city-col-content">
                                                    {habits.filter(h => (h.type || 'virtue') === colType).sort((a, b) => {
                                                        const today = GameLogic.getTodayString();
                                                        const aDone = a.history.includes(today);
                                                        const bDone = b.history.includes(today);
                                                        if (a.bucket && aDone && (!b.bucket || !bDone)) return 1;
                                                        if (b.bucket && bDone && (!a.bucket || !aDone)) return -1;
                                                        return 0;
                                                    }).map(h => {
                                                        const today = GameLogic.getTodayString();
                                                        const dailyCount = h.history.filter(d => d === today).length;
                                                        const isDone = dailyCount > 0;
                                                        const isDoneOneTime = h.bucket && isDone;

                                                        if (editingHabitId === h.id) {
                                                            return (
                                                                <div key={h.id} className="habit-item compact editing" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                                                                    <input type="text" defaultValue={h.text} id={`edit-text-${h.id}`} style={{ width: '100%', padding: '4px', marginBottom: '4px' }} />
                                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                        <label style={{ fontSize: '0.8rem' }}><input type="checkbox" defaultChecked={h.bucket} id={`edit-bucket-${h.id}`} /> Eenmalig?</label>
                                                                        <div style={{ display: 'flex', gap: '4px' }}>
                                                                            <button className="btn-icon" onClick={() => saveHabitEdit(h.id, document.getElementById(`edit-text-${h.id}`).value, document.getElementById(`edit-bucket-${h.id}`).checked)}><Icons.Save /></button>
                                                                            <button className="btn-icon" onClick={() => setEditingHabitId(null)}><Icons.X /></button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        }

                                                        return (
                                                            <div key={h.id} className={`habit-item compact ${isDoneOneTime ? 'completed' : ''}`}
                                                                style={{ borderLeft: `3px solid ${colColor}`, opacity: isDoneOneTime ? 0.5 : 1 }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                                                                    <div className={`habit-checkbox compact ${isDone ? 'checked' : ''}`} style={{ borderColor: colColor }} onClick={() => toggleHabit(h.id)}>
                                                                        {isDone && (colType === 'vice' ? <span style={{ color: colColor, fontWeight: 'bold' }}>X</span> : <Icons.Check style={{ width: 14, height: 14 }} />)}
                                                                    </div>
                                                                    <span className="habit-text" style={isDone && colType === 'todo' ? { textDecoration: 'line-through', color: '#888' } : {}}>
                                                                        {h.text}
                                                                        {!h.bucket && dailyCount > 1 && <span style={{ marginLeft: '4px', color: 'var(--color-gold)', fontWeight: 'bold' }}>x{dailyCount}</span>}
                                                                        {colType === 'vice' && dailyCount > 0 && <span style={{ marginLeft: '4px', color: '#ff4444', fontWeight: 'bold' }}>(-20g)</span>}
                                                                    </span>
                                                                </div>

                                                                <div className="habit-controls" style={{ display: 'flex', gap: '2px' }}>
                                                                    <button className="btn-icon small" onClick={() => setEditingHabitId(h.id)} title="Pas aan"><Icons.Edit /></button>
                                                                    <button className="btn-icon small" onClick={() => deleteHabit(h.id)} title="Verwijder"><Icons.Trash /></button>
                                                                    {!h.bucket && (
                                                                        <button className="btn-icon" style={{ borderColor: colColor, color: colColor, marginLeft: '4px' }} onClick={(e) => incrementHabit(h.id, e)}>+</button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </main>
                        </div>
                    </div>
                )}

                {activeTab === 'tavern' && (
                    <div>
                        <div className="tavern-bg">
                            <h2>De Vergulde Gladius</h2>
                            <p>Recruteer helden voor je legioen</p>
                            <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
                                <button className="btn" onClick={recruitHero}>Nieuwe Held Rekruteren (100g)</button>
                            </div>
                            <div className="heroes-grid" style={{ marginTop: '20px' }}>
                                {heroes.map(h => (
                                    <div key={h.id} className="card hero-card">
                                        <div className="card-title">{h.name} <span style={{ fontSize: '0.8em', color: '#aaa' }}>Lvl {h.lvl}</span></div>
                                        <div>XP: {h.xp} / {h.lvl * 100}</div>
                                        <div>HP: {h.hp} / {h.maxHp}</div>
                                        <div>Kracht: {h.str}</div>
                                        {h.hp < h.maxHp && <button className="btn-icon" onClick={() => healHero(h.id)}>❤️ Genees (10g)</button>}
                                        {h.items.length > 0 && (
                                            <div className="inventory">
                                                {h.items.map((i, idx) => <span key={idx} title={`${i.name} (+${i.bonus})`}>{i.icon}</span>)}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'adventure' && (
                    <div>
                        <h2>Campagne Kaart</h2>
                        <div className="adventure-grid">
                            <div className="card">
                                <h3>Missies</h3>
                                {GameLogic.QUESTS.map(q => (
                                    <div key={q.id}
                                        className={`quest-item ${selectedQuest === q.id ? 'selected' : ''}`}
                                        onClick={() => setSelectedQuest(q.id)}>
                                        <h4>{q.name} (Lvl {q.level})</h4>
                                        <p>{q.desc}</p>
                                        <small>Risico: {q.risk} | Beloning: {q.reward}g</small>
                                    </div>
                                ))}
                            </div>
                            <div className="card">
                                <h3>Selecteer Held</h3>
                                {heroes.map(h => (
                                    <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px', borderRadius: '4px', background: h.hp <= 5 ? '#fdd' : '#eee', marginBottom: '5px' }}>
                                        <span>{h.name} (Str: {h.str})</span>
                                        <button className="btn" disabled={h.hp <= 5 || !selectedQuest} onClick={() => goAdventure(h.id, selectedQuest)}>Stuur op pad</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="card" style={{ marginTop: '20px', borderColor: '#d32f2f' }}>
                            <h3 style={{ color: '#d32f2f' }}>Eindbaas: De Hydra</h3>
                            <p>Verzamel een sterk legioen om het beest te verslaan.</p>
                            <button className="btn" style={{ background: '#d32f2f', color: 'white' }} onClick={fightBoss}>VECHT TEGEN DE HYDRA</button>
                        </div>
                    </div>
                )}

                <div className="toast-container">
                    {notifications.map(n => (
                        <div key={n.id} className={`toast ${n.type}`}>{n.msg}</div>
                    ))}
                </div>
            </div>

            <div className="bottom-nav">
                <div className="bottom-nav-content">
                    <div className="nav-item stat-item edge-item">
                        <div className="nav-icon">
                            <img src="./assets/nav_gold.jpg" alt="Goud" />
                            <span className="nav-value">{stats.gold}</span>
                        </div>
                    </div>

                    <div className="nav-group-center">
                        {[
                            { id: 'city', label: 'Plichten', icon: <img src="./assets/nav_plichten.jpg" alt="Plichten" /> },
                            { id: 'tavern', label: 'Taverne', icon: <img src="./assets/nav_tavern.jpg" alt="Taverne" /> },
                            { id: 'adventure', label: 'Quests', icon: <img src="./assets/nav_quests.jpg" alt="Quests" /> }
                        ].map(item => {
                            const navOrder = ['city', 'tavern', 'adventure'];
                            const activeIdx = navOrder.indexOf(activeTab);
                            const itemIdx = navOrder.indexOf(item.id);
                            const diff = (itemIdx - activeIdx + 3) % 3;

                            let role = 'center';
                            if (diff === 1) role = 'right';
                            if (diff === 2) role = 'left';

                            return (
                                <button
                                    key={item.id}
                                    className={`nav-item ${activeTab === item.id ? 'active' : ''} role-${role}`}
                                    onClick={() => setActiveTab(item.id)}
                                    title={item.label}
                                >
                                    <div className={`nav-icon ${role === 'center' ? 'large' : ''}`}>
                                        {item.icon}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    <button className="nav-item edge-item" onClick={(e) => { e.stopPropagation(); setShowSettings(true); }} title="Profiel">
                        <div className="nav-icon"><img src="./assets/nav_profile.jpg" alt="Profiel" /></div>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default App;
