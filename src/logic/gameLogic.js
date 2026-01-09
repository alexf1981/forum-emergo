
// --- RPG CONSTANTS ---
export const HERO_NAMES = ["Lucius", "Titus", "Marcus", "Aurelius", "Flavius", "Maximus", "Octavius", "Casius", "Valerius", "Felix"];

// Items Database
// Items Database - REMOVED per user request
export const ITEMS = [];

// Quest Templates
export const QUEST_TEMPLATES = [
    {
        id: 'introspection',
        type: 'instant',
        name: 'quest_introspection_name',
        desc: 'quest_introspection_desc',
        flavor: 'quest_introspection_flavor',
        requirements: { heroCount: 1 },
        rewards: { gold: 50, xp: 50 },
        isTutorial: true
    },
    {
        id: 'login_streak',
        // Type 'passive' implies it auto-updates based on state, no "Start" button needed strictly speaking, 
        // but for this game loop we might want to "Start" it to track it? 
        // User asked for missions, let's keep them as quests you can complete.
        type: 'achievement',
        name: 'quest_login_streak_name',
        desc: 'quest_login_streak_desc',
        flavor: 'quest_login_streak_flavor',
        requirements: { heroCount: 1 },
        rewards: { gold: 250, xp: 250 },
        target: 7, // 7 Days
        durationDays: 7
    },
    {
        id: 'virtue_streak',
        type: 'achievement',
        name: 'quest_virtue_streak_name',
        desc: 'quest_virtue_streak_desc',
        flavor: 'quest_virtue_streak_flavor',
        requirements: { heroCount: 1 },
        rewards: { gold: 200, xp: 100 },
        target: 3, // 3 Days
        durationDays: 3
    },
    {
        id: 'vice_resistance',
        type: 'achievement',
        name: 'quest_vice_resistance_name',
        desc: 'quest_vice_resistance_desc',
        flavor: 'quest_vice_resistance_flavor',
        requirements: { heroCount: 1 },
        rewards: { gold: 100, xp: 200 },
        target: 3, // 3 Days
        durationDays: 3
    },
    {
        id: 'daily_productivity',
        type: 'achievement',
        name: 'quest_daily_productivity_name',
        desc: 'quest_daily_productivity_desc',
        flavor: 'quest_daily_productivity_flavor',
        requirements: { heroCount: 1 },
        rewards: { gold: 50, xp: 50 },
        target: 5, // 5 Tasks in 24h
        durationDays: 1 // 1 Day (24h)
    }
];

export const INSPIRATION_HABITS = {
    health: [
        { text: "habit_health_water", type: "virtue" },
        { text: "habit_health_walk", type: "virtue" },
        { text: "habit_health_sugar", type: "virtue" },
        { text: "habit_health_sleep", type: "virtue" },
        { text: "habit_health_fruit", type: "virtue" },
        { text: "habit_health_alcohol", type: "virtue" },
        { text: "habit_health_sport", type: "virtue" },
        { text: "habit_health_stairs", type: "virtue" },
        { text: "habit_health_cold_shower", type: "virtue" },
        { text: "habit_health_floss", type: "virtue" },
        { text: "habit_health_cooking", type: "virtue" },
        { text: "habit_health_snacks", type: "virtue" },
        { text: "habit_health_standing", type: "virtue" },
        { text: "habit_health_meds", type: "virtue" },
        { text: "habit_health_candy", type: "vice" },
        { text: "habit_health_smoke", type: "vice" },
        { text: "habit_health_night_owl", type: "vice" },
        { text: "habit_health_snooze", type: "vice" },
        { text: "habit_health_nail_biting", type: "vice" }
    ],
    productivity: [
        { text: "habit_prod_inbox", type: "virtue" },
        { text: "habit_prod_deep_work", type: "virtue" },
        { text: "habit_prod_plan_tomorrow", type: "virtue" },
        { text: "habit_prod_clean_desk", type: "virtue" },
        { text: "habit_prod_finance", type: "virtue" },
        { text: "habit_prod_email_batch", type: "virtue" },
        { text: "habit_prod_learn", type: "virtue" },
        { text: "habit_prod_pomodoro", type: "virtue" },
        { text: "habit_prod_weekly_review", type: "virtue" },
        { text: "habit_prod_backups", type: "virtue" },
        { text: "habit_prod_organize_notes", type: "virtue" },
        { text: "habit_prod_social_media", type: "vice" },
        { text: "habit_prod_procrastinate", type: "vice" },
        { text: "habit_prod_late", type: "vice" },
        { text: "habit_prod_doomscrolling", type: "vice" },
        { text: "habit_prod_multitask", type: "vice" }
    ],
    mindset: [
        { text: "habit_mind_gratitude", type: "virtue" },
        { text: "habit_mind_meditation", type: "virtue" },
        { text: "habit_mind_read_10", type: "virtue" },
        { text: "habit_mind_journal", type: "virtue" },
        { text: "habit_mind_compliment", type: "virtue" },
        { text: "habit_mind_call_friend", type: "virtue" },
        { text: "habit_mind_no_news", type: "virtue" },
        { text: "habit_mind_nature_walk", type: "virtue" },
        { text: "habit_mind_visualization", type: "virtue" },
        { text: "habit_mind_breathing", type: "virtue" },
        { text: "habit_mind_complain", type: "vice" },
        { text: "habit_mind_gossip", type: "vice" },
        { text: "habit_mind_negative_self", type: "vice" },
        { text: "habit_mind_road_rage", type: "vice" }
    ],
    sociaal: [
        { text: "habit_social_call_friend", type: "virtue" },
        { text: "habit_social_date_night", type: "virtue" },
        { text: "habit_social_play_kids", type: "virtue" },
        { text: "habit_social_card", type: "virtue" },
        { text: "habit_social_network", type: "virtue" },
        { text: "habit_social_volunteer", type: "virtue" },
        { text: "habit_social_listen", type: "virtue" },
        { text: "habit_social_phone_dinner", type: "virtue" },
        { text: "habit_social_cancel", type: "vice" },
        { text: "habit_social_isolate", type: "vice" },
        { text: "habit_social_argue", type: "vice" },
        { text: "habit_social_scroll_talk", type: "vice" }
    ],
    creativiteit: [
        { text: "habit_creat_instrument", type: "virtue" },
        { text: "habit_creat_draw", type: "virtue" },
        { text: "habit_creat_write", type: "virtue" },
        { text: "habit_creat_brainstorm", type: "virtue" },
        { text: "habit_creat_fix", type: "virtue" },
        { text: "habit_creat_craft", type: "virtue" },
        { text: "habit_creat_cook_new", type: "virtue" },
        { text: "habit_creat_learn_lang", type: "virtue" },
        { text: "habit_creat_code", type: "virtue" },
        { text: "habit_creat_consume", type: "vice" },
        { text: "habit_creat_clutter", type: "vice" },
        { text: "habit_creat_give_up", type: "vice" }
    ],
    huishouden: [
        { text: "habit_home_bed", type: "virtue" },
        { text: "habit_home_plants", type: "virtue" },
        { text: "habit_home_tidy_10", type: "virtue" },
        { text: "habit_home_laundry", type: "virtue" },
        { text: "habit_home_vacuum", type: "virtue" },
        { text: "habit_home_dishes_out", type: "virtue" },
        { text: "habit_home_fridge", type: "virtue" },
        { text: "habit_home_trash", type: "virtue" },
        { text: "habit_home_clothes_chair", type: "virtue" },
        { text: "habit_home_dishes_dirty", type: "vice" },
        { text: "habit_home_procrast_clean", type: "vice" },
        { text: "habit_home_lights", type: "vice" }
    ],
    financien: [
        { text: "habit_fin_check_expenses", type: "virtue" },
        { text: "habit_fin_save", type: "virtue" },
        { text: "habit_fin_no_spend", type: "virtue" },
        { text: "habit_fin_lunch", type: "virtue" },
        { text: "habit_fin_subs", type: "virtue" },
        { text: "habit_fin_invest", type: "virtue" },
        { text: "habit_fin_pay_bills", type: "virtue" },
        { text: "habit_fin_impulse_buy", type: "vice" },
        { text: "habit_fin_gambling", type: "vice" },
        { text: "habit_fin_overdraft", type: "vice" },
        { text: "habit_fin_expensive_coffee", type: "vice" }
    ]
};

// --- HELPERS ---
export const getTodayString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const generateRandomHistory = () => {
    const history = [];
    const today = new Date();
    // Start from yesterday (i=1) to avoid overriding today's state
    for (let i = 1; i < 28; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);

        // Force Local Time Formatting to match HabitItem.jsx
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const dateStr = `${y}-${m}-${day}`;

        // 33% Done, 33% Fail (!), 33% No Data (Skip)
        const rand = Math.random();
        if (rand > 0.66) {
            history.push(dateStr); // Green
        } else if (rand > 0.33) {
            history.push(`!${dateStr}`); // Red
        }
        // else skip -> "No Data" (Grey)
    }
    return history;
};

export const getInitialState = (t = (s) => s) => {
    const now = Date.now();
    const defaultHabits = [
        { id: now + 1, text: t('habit_walk_10k'), type: 'virtue', completed: false, history: generateRandomHistory(), recurring: false },
        { id: now + 3, text: t('habit_hobby'), type: 'virtue', completed: false, history: [], recurring: true },
        { id: now + 4, text: t('habit_sleep_late'), type: 'vice', completed: false, history: [], recurring: false },
        { id: now + 5, text: t('habit_smoke'), type: 'vice', completed: false, history: [], recurring: true },
        { id: now + 7, text: t('habit_taxes'), type: 'todo', completed: false, history: [], recurring: false }
    ];

    return {
        romestats: { gold: 200, know: 0, pop: 100 },
        romeheroes: [],
        romehabits: defaultHabits,
        romebuildings: INITIAL_BUILDINGS,
        romeresources: {},
        romeresearch: {},
        romeloginhistory: [],
        romequests: [],
        romelastwelcome: getTodayString()
    };
};


// --- PURE LOGIC ---

export function getScore(stats) {
    return stats.gold + (stats.knowledge || 0) * 3;
}

export function getCityRank(stats) {
    const s = getScore(stats);
    if (s < 200) return "rank_0";
    if (s < 500) return "rank_1";
    if (s < 1000) return "rank_2";
    if (s < 2500) return "rank_3";
    return "rank_4";
}

export function calculateBattleResult(hero, quest, randomFn = Math.random) {
    // Calculate Power based on Level only (Items/Str removed)
    // Base power 10 + Level
    const totalPower = 10 + hero.lvl;

    const performance = totalPower * (0.8 + randomFn() * 0.4);
    const difficulty = quest.risk * (0.8 + randomFn() * 0.4);

    if (performance >= difficulty) {
        // WIN
        const earnedXp = quest.xp;
        let earnedGold = quest.reward;
        const dmgTaken = Math.floor(randomFn() * 3);

        // Loot Logic Removed

        // Level Up Logic
        let newXp = hero.xp + earnedXp;
        let newLvl = hero.lvl;
        let leveledUp = false;

        if (newXp >= newLvl * 100) {
            newXp -= newLvl * 100;
            newLvl++;
            leveledUp = true;
        }

        return {
            success: true,
            earnedXp,
            earnedGold,
            dmgTaken,
            lootMsg: null,
            newXp,
            newLvl,
            leveledUp,
            hp: Math.max(0, hero.hp - dmgTaken)
        };
    } else {
        // LOSS
        const dmgTaken = Math.floor(quest.risk * 0.6);
        return {
            success: false,
            dmgTaken,
            hp: Math.max(0, hero.hp - dmgTaken)
        };
    }
}


export function toRoman(num) {
    if (typeof num !== 'number') return num;
    if (num <= 0) return num;

    const lookup = { M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1 };
    let roman = '';
    for (let i in lookup) {
        while (num >= lookup[i]) {
            roman += i;
            num -= lookup[i];
        }
    }
    return roman;
}

// --- HABIT MANAGEMENT (Pure Functions) ---

export function createHabit(habits, text, type, isOneTime) {
    if (!text) return habits;
    const newHabit = {
        id: Date.now() + Math.random(),
        text,
        type: type || 'virtue',
        bucket: !!isOneTime,
        completed: false,
        history: [],
        createdAt: new Date().toISOString()
    };
    return [...habits, newHabit];
}

export function deleteHabit(habits, id) {
    return habits.filter(h => h.id !== id);
}

export function updateHabit(habits, id, updates) {
    return habits.map(h => h.id === id ? { ...h, ...updates } : h);
}

export function reorderHabits(habits, activeId, overId, position = 'below') {
    const activeIndex = habits.findIndex(h => h.id === activeId);
    const overIndex = habits.findIndex(h => h.id === overId);

    if (activeIndex === -1 || overIndex === -1) {
        return habits;
    }

    // Create copy
    const newHabits = [...habits];

    // Remove active item
    const [movedHabit] = newHabits.splice(activeIndex, 1);

    // Adjust overIndex because of removal
    // If active was before over, over shifts down by 1
    let adjustedOverIndex = overIndex;
    if (activeIndex < overIndex) {
        adjustedOverIndex -= 1;
    }

    // Determine insertion index
    let insertIndex = adjustedOverIndex;
    if (position === 'below') {
        insertIndex += 1;
    }

    // Insert
    newHabits.splice(insertIndex, 0, movedHabit);

    return newHabits;
}

export function processHabitToggle(habits, stats, id, dateString) {
    let notifications = [];
    let newStats = { ...stats };

    const newHabits = habits.map(h => {
        if (h.id === id) {
            const type = h.type || 'virtue';
            const dailyCount = h.history.filter(d => d === dateString).length;
            const isActive = dailyCount > 0;
            let newHistory = [...h.history];

            if (isActive) {
                // RESET (Undo for today)
                if (type === 'vice') {
                    // Undo Penalty (Refund)
                    newStats.gold += (20 * dailyCount);
                } else if (type === 'todo') {
                    // Undo Reward
                    newStats.gold = Math.max(0, newStats.gold - 50);
                } else {
                    // Virtue: Undo Reward
                    newStats.gold = Math.max(0, newStats.gold - (10 * dailyCount));
                }
                newHistory = newHistory.filter(d => d !== dateString);
            } else {
                // ACTIVATE
                if (type === 'vice') {
                    // Penalty
                    newStats.gold = Math.max(0, newStats.gold - 20);
                    notifications.push({ msg: { key: 'msg_habit_vice_penalty' }, type: "error" });
                } else if (type === 'todo') {
                    // High Reward
                    newStats.gold += 50;
                    notifications.push({ msg: { key: 'msg_habit_todo_reward' }, type: "mandatum" });
                } else {
                    // Virtue
                    newStats.gold += 10;
                    notifications.push({ msg: { key: 'msg_habit_virtue_reward' }, type: "success" });
                }
                newHistory.push(dateString);
            }
            return { ...h, completed: !isActive, history: newHistory };
        }
        return h;
    });

    return { newHabits, newStats, notifications };
}

export function resetDailyHabits(habits) {
    const today = getTodayString();

    // First, remove Mandata (todo) tasks that are completed.
    // They are one-time challenges for that day.
    const remainingHabits = habits.filter(h => {
        if (h.type === 'todo' && h.completed) {
            return false; // Remove!
        }
        return true;
    });

    // Reset daily state for recurring habits
    return remainingHabits.map(h => {
        // Clear history for TODAY to ensure counts reset to 0
        const newHistory = (h.history || []).filter(date => date !== today);

        if (h.type === 'virtue' || h.type === 'vice' || !h.type) {
            // Keep history (minus today), ensure completed is false for visual state
            return { ...h, completed: false, history: newHistory };
        }
        return { ...h, history: newHistory };
    });
}

// ==============================================================================
// CITY & BUILDINGS LOGIC
// ==============================================================================

export const INITIAL_RESOURCES = {};

export const INITIAL_BUILDINGS = [
    { id: "town_hall", type: "town_hall", x: 53, y: 47, name: "Stadhuis", level: 1 },
    { id: "tavern", type: "tavern", x: 40, y: 64, name: "Taverne", level: 0 },
    { id: "library", type: "library", x: 67, y: 51, name: "Bibliotheek", level: 0 },
    { id: "market", type: "market", x: 76, y: 71, name: "Markt", level: 0 },
    { id: "house_1", type: "house", x: 72, y: 42, name: "Woonhuis", level: 0 },
    { id: "house_2", type: "house", x: 9, y: 73, name: "Woonhuis", level: 0 },
    { id: "house_3", type: "house", x: 87, y: 63, name: "Woonhuis", level: 0 },
    { id: "house_4", type: "house", x: 34, y: 42, name: "Woonhuis", level: 0 },
    { id: "house_5", type: "house", x: 21, y: 48, name: "Woonhuis", level: 0 }
];

export const buildBuilding = (buildings, type) => {
    // Find first unbuilt slot
    const slotIndex = buildings.findIndex(b => b.type === type && b.level === 0);
    if (slotIndex === -1) return { success: false, msg: `Geen ruimte meer voor ${type}!` };

    const newBuildings = [...buildings];
    newBuildings[slotIndex] = { ...newBuildings[slotIndex], level: 1 };

    return { success: true, newBuildings, msg: `${type} gebouwd!` };
};

export const upgradeBuilding = (buildings, id) => {
    return buildings.map(b => b.id === id ? { ...b, level: b.level + 1 } : b);
};

export const moveBuilding = (buildings, id, x, y) => {
    return buildings.map(b => b.id === id ? { ...b, x, y } : b);
};

// --- POPULATION LOGIC ---
export const POPULATION_PER_LEVEL = {
    0: 0,
    1: 200,      // Tent/Hut
    2: 1000,     // Houten Huis
    3: 5000,     // Stenen Domus
    4: 30000,    // Insula
    5: 200000    // Villa Complex
};

export const HOUSE_LEVELS = {
    1: { name: "Tent", desc: "Een eenvoudige schuilplaats." },
    2: { name: "Houten Huis", desc: "Een stevige woning voor een gezin." },
    3: { name: "Stenen Domus", desc: "Een comfortabel huis voor de middenklasse." },
    4: { name: "Insula", desc: "Een appartementencomplex voor velen." },
    5: { name: "Villa Complex", desc: "Een luxueus landgoed voor de elite." }
};

export const getCityPopulation = (buildings) => {
    if (!buildings) return 0;
    return buildings.reduce((total, b) => {
        if (b.type === 'house') {
            return total + (POPULATION_PER_LEVEL[b.level] || 0);
        }
        return total;
    }, 0);
};


// ==============================================================================
// ECONOMY CONSTANTS
// ==============================================================================

export const BASE_TASK_GOLD = 5;

// Building Costs (Level 1)
export const BUILDING_COSTS = {
    house: 100,
    tavern: 100,  // Unlock Cost
    library: 250,
    market: 250,
    town_hall: 0   // Already exists
};

// Helper for dynamic costs (e.g. houses scale with count)
export const getDynamicBuildingCost = (type, buildings) => {
    if (type === 'house') {
        const houseCount = buildings.filter(b => b.type === 'house' && b.level > 0).length;
        // 1st house (count 0) = 100
        // 2nd house (count 1) = 200
        return 100 * (houseCount + 1);
    }
    return BUILDING_COSTS[type] || 0;
};

// Upgrade Costs (Per Level)
export const UPGRADE_COSTS = {
    // Current Level -> Cost to reach next level
    town_hall: { 1: 0, 2: 1000, 3: 50000, 4: 500000, 5: 10000000 },
    house: { 1: 0, 2: 750, 3: 5000, 4: 75000, 5: 1500000 },
    tavern: { 1: 250, 2: 5000, 3: 25000, 4: 100000, 5: 500000 }, // Lvl 1 is Unlock Cost
    library: { 1: 250, 2: 5000, 3: 25000, 4: 100000, 5: 500000 }, // Lvl 1 is Unlock Cost
    market: { 1: 250, 2: 10000, 3: 50000, 4: 250000, 5: 1000000 } // Lvl 1 is Unlock Cost
};

export const TOWN_HALL_MULTIPLIERS = {
    1: 1,
    2: 10,
    3: 100,
    4: 1000,
    5: 10000
};

export const getTownHallLevel = (buildings) => {
    const th = buildings.find(b => b.type === 'town_hall');
    return th ? th.level : 1;
};

export const getActiveMultiplier = (buildings) => {
    const lvl = getTownHallLevel(buildings);
    return TOWN_HALL_MULTIPLIERS[lvl] || 1;
};

export const getGoldReward = (buildings, base = BASE_TASK_GOLD) => {
    return base * getActiveMultiplier(buildings);
};

// --- RESEARCH LOGIC ---

export const RESEARCH_TYPES = {
    tax: {
        id: 'tax',
        name: 'Belastinghervorming',
        maxLevel: 30,
        baseCost: 250,
        costMult: 1.2
    },
    interest: {
        id: 'interest',
        name: 'Bankieren',
        maxLevel: 20,
        baseCost: 1000,
        costMult: 1.3
    }
};

export function getResearchCost(typeId, currentLevel) {
    const r = RESEARCH_TYPES[typeId];
    if (!r) return 999999999;

    // Level 0 -> 1 costs baseCost
    // Level 1 -> 2 costs baseCost * mult^1
    return Math.floor(r.baseCost * Math.pow(r.costMult, currentLevel));
}

// Calculate Passive Income (Tax + Interest)
export function getDailyPassiveIncome(stats, population, researchState) {
    // Tax Income
    const taxLvl = researchState.tax || 0;
    const taxRate = taxLvl * 0.01; // 1% per level
    // 1 citizen = 1 gold value. Tax = 1 * taxRate
    const taxIncome = Math.floor(population * taxRate);

    // Interest Income
    const interestLvl = researchState.interest || 0;
    const interestRate = interestLvl * 0.001; // 0.1% per level
    let interestIncome = Math.floor(stats.gold * interestRate);
    if (interestIncome > 200000) interestIncome = 200000; // Cap hardcoded for safety

    return { taxIncome, interestIncome, total: taxIncome + interestIncome };
}

// Research Caps based on Library Level
export const RESEARCH_CAPS = {
    1: { tax: 6, interest: 4 },
    2: { tax: 12, interest: 8 },
    3: { tax: 18, interest: 12 },
    4: { tax: 24, interest: 16 },
    5: { tax: 30, interest: 20 }
};

export function getResearchCap(typeId, libraryLevel) {
    const caps = RESEARCH_CAPS[libraryLevel];
    if (!caps) return 0; // Should not happen if level >= 1
    return caps[typeId] || 999;
}

export function getLibraryLevel(buildings) {
    const lib = buildings.find(b => b.type === 'library');
    return lib ? lib.level : 0;
}



export const calculateTaskGold = (type, townHallLevel) => {
    const mult = TOWN_HALL_MULTIPLIERS[townHallLevel] || 1;
    const base = BASE_TASK_GOLD * mult;

    if (type === 'vice') return -(base * 2); // Vice costs double the reward
    return base; // Virtue & Mandata give 1x reward
};



// Tavern Caps
export const TAVERN_CAPS = {
    1: 1,
    2: 2,
    3: 4,
    4: 7,
    5: 10
};

export function getTavernCap(level) {
    return TAVERN_CAPS[level] || 0;
}

// --- QUEST LOGIC ---

export function checkQuestRequirements(quest, selectedHeroes) {
    if (quest.requirements.heroCount !== undefined) {
        if (selectedHeroes.length !== quest.requirements.heroCount) {
            // Special case for heroCount 0 (e.g. Introspection)
            if (quest.requirements.heroCount === 0 && selectedHeroes.length === 0) return { success: true };
            return { success: false, msg: `Deze missie vereist ${quest.requirements.heroCount} held(en).` };
        }
    }

    if (quest.requirements.minPower) {
        const totalPower = selectedHeroes.reduce((sum, h) => sum + h.str + h.lvl, 0); // Simplified Power Calc
        if (totalPower < quest.requirements.minPower) {
            return { success: false, msg: `Team te zwak (Kracht: ${totalPower}/${quest.requirements.minPower})` };
        }
    }

    if (quest.level) {
        const totalLevel = selectedHeroes.reduce((sum, h) => sum + h.lvl, 0);
        if (totalLevel < quest.level) {
            return { success: false, msg: `Team level te laag (Level: ${totalLevel}/${quest.level})` };
        }
    }

    return { success: true };
}

export function startQuest(quests, heroes, stats, habits, questId, selectedHeroIds) {
    const template = QUEST_TEMPLATES.find(q => q.id === questId);
    if (!template) return { success: false, msg: "Missie niet gevonden." };

    const selectedHeroes = heroes.filter(h => selectedHeroIds.includes(h.id));

    // 1. Validate
    const busyHero = selectedHeroes.find(h => h.status === 'QUESTING');
    if (busyHero) return { success: false, msg: `${busyHero.name} is al op avontuur.` };

    const check = checkQuestRequirements(template, selectedHeroes);
    if (!check.success) return check;

    // 2. Resources (Travel cost? None for now)

    // 3. Target Habit Selection
    let targetHabitId = null;
    let targetHabitText = null;

    if (questId === 'virtue_streak') {
        const virtues = habits.filter(h => h.type === 'virtue');
        if (virtues.length === 0) return { success: false, msg: "Geen deugden gevonden om op te focussen." };
        const target = virtues[Math.floor(Math.random() * virtues.length)];
        targetHabitId = target.id;
        targetHabitText = target.text;
    } else if (questId === 'vice_resistance') {
        const vices = habits.filter(h => h.type === 'vice');
        if (vices.length === 0) return { success: false, msg: "Geen ondeugden gevonden om te weerstaan." };
        const target = vices[Math.floor(Math.random() * vices.length)];
        targetHabitId = target.id;
        targetHabitText = target.text;
    }

    // 4. Update Heroes (Lock them if duration > 0)
    let newHeroes = [...heroes];
    if (template.durationDays > 0) {
        newHeroes = heroes.map(h => selectedHeroIds.includes(h.id) ? { ...h, status: 'QUESTING' } : h);
    }

    // 5. Create Quest Instance
    const newQuest = {
        id: Date.now(),
        templateId: questId,
        heroIds: selectedHeroIds,
        startTime: new Date().toISOString(),
        status: 'active',
        targetHabitId,
        targetHabitText
    };

    return {
        success: true,
        newQuests: [...quests, newQuest],
        newHeroes,
        newStats: stats, // No cost for now
        msg: { key: 'msg_quest_started', args: { quest: template.name } }
    };
}

export function completeQuest(quests, heroes, stats, questInstanceId) {
    const quest = quests.find(q => q.id === questInstanceId);
    if (!quest) return { success: false, msg: "Missie niet gevonden." };

    const template = QUEST_TEMPLATES.find(t => t.id === quest.templateId);

    // Calculate Rewards
    let rewardGold = template.rewards.gold || 0;
    let rewardXp = template.rewards.xp || 0;

    // Update Heroes: Free them + Give XP
    const newHeroes = heroes.map(h => {
        if (quest.heroIds.includes(h.id)) {
            // Gain XP
            let newXp = h.xp + rewardXp;
            let newLvl = h.lvl;

            // Level Up?
            if (newXp >= newLvl * 100) {
                newXp -= newLvl * 100;
                newLvl++;
            }

            return { ...h, status: 'IDLE', xp: newXp, lvl: newLvl };
        }
        return h;
    });

    // Update Quest Status
    const newQuests = quests.map(q => q.id === questInstanceId ? { ...q, status: 'completed', completed: true, completedTime: new Date().toISOString() } : q);

    // Update Stats
    const newStats = { ...stats, gold: stats.gold + rewardGold };

    return {
        success: true,
        newQuests,
        newHeroes,
        newStats,
        msg: { key: 'msg_quest_completed', args: { gold: rewardGold } }
    };
}




// --- ACHIEVEMENT LOGIC HELPERS ---

/**
 * Calculates the current login streak based on login history.
 * @param {Array<string>} loginHistory - Array of date strings (YYYY-MM-DD)
 * @returns {number} Current streak in days
 */
export function getLoginStreak(loginHistory) {
    if (!loginHistory || loginHistory.length === 0) return 0;

    // Sort descending
    const sorted = [...loginHistory].sort((a, b) => new Date(b) - new Date(a));
    const today = getTodayString();

    // Check if today is logged. If not, maybe yesterday was?
    // If user hasn't logged in today yet (which is impossible if this code runs, but for robustness), 
    // the streak continues from yesterday.
    let streak = 0;

    // Unique dates set to avoid double counting same day multiple logins
    const uniqueDates = Array.from(new Set(sorted));

    // If the most recent login is NOT today and NOT yesterday, streak is broken -> 0
    // Wait, if I login today, uniqueDates[0] is today.
    // If I didn't login today, uniqueDates[0] might be yesterday.

    const lastLogin = uniqueDates[0];
    const dLast = new Date(lastLogin);
    const dToday = new Date(today);

    const diffTime = Math.abs(dToday - dLast);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 1) {
        // Gap of more than 1 day (e.g. Last login 2 days ago)
        // Check if logic runs ON login? Assuming yes.
        // If I run this function NOW, and I am logged in, today SHOULD be in history.
        // If not (maybe history not updated yet), let's assume loose check.
        return 0; // Streak broken
    }

    // Count consecutive days
    // We start from the most recent date.
    let currentDate = new Date(uniqueDates[0]);
    streak = 1;

    for (let i = 1; i < uniqueDates.length; i++) {
        const prevDate = new Date(uniqueDates[i]);
        const diff = (currentDate - prevDate) / (1000 * 60 * 60 * 24);

        if (Math.round(diff) === 1) {
            streak++;
            currentDate = prevDate;
        } else {
            break;
        }
    }

    return streak;
}

/**
 * Checks for the max consecutive streak of ANY single virtue habit being completed.
 * It counts consecutive days where the habit was completed.
 * IMPORTANT: It only counts days where the user LOGGED IN (Green Days)??
 * Wait, standard streak logic usually implies real days.
 * But user said "Green Days" for Vices. For Virtues, usually it's "3 days in a row".
 * Let's assume absolute days for Virtue to encourage daily play.
 * @param {Array} habits 
 * @returns {number} Max streak found across all virtues
 */
export function getVirtueStreak(habits) {
    let maxStreak = 0;

    const virtues = habits.filter(h => h.type === 'virtue');

    virtues.forEach(v => {
        // History contains dates 'YYYY-MM-DD' when completed.
        // Sort and count consecutive.
        if (!v.history || v.history.length === 0) return;

        const sorted = [...v.history].sort((a, b) => new Date(b) - new Date(a));
        let currentStreak = 1;
        let currentDate = new Date(sorted[0]);

        for (let i = 1; i < sorted.length; i++) {
            const prev = new Date(sorted[i]);
            const diff = (currentDate - prev) / (1000 * 60 * 60 * 24);

            if (Math.round(diff) === 1) {
                currentStreak++;
                currentDate = prev;
            } else {
                break;
            }
        }
        if (currentStreak > maxStreak) maxStreak = currentStreak;
    });

    return maxStreak;
}

/**
 * Checks for Vice Resistance.
 * Rule: A vice older than 3 days.
 * AND: In the last 3 "Green Days" (days user logged in), the vice was NOT DONE.
 * @param {Array} habits 
 * @param {Array} loginHistory 
 * @returns {number} Max resistance streak (capped at checking window, or just boolean effectively)
 * Actually return number of "Clean Green Days" in a row from now backwards.
 */
export function getViceResistanceStreak(habits, loginHistory) {
    if (!habits || !loginHistory) return 0;
    const vices = habits.filter(h => h.type === 'vice');
    if (vices.length === 0) return 0;

    let maxResistance = 0;
    // ensure unique sorted descending
    const sortedLogin = [...new Set(loginHistory)].sort((a, b) => new Date(b) - new Date(a));

    // If today is not in login history yet (edge case), add it essentially for calculation? 
    // Or assume called after login.

    vices.forEach(v => {
        // 1. Check Age (Must exist > 3 days)
        // Fallback to today if createdAt missing
        const created = v.createdAt ? new Date(v.createdAt) : new Date();
        const ageMsg = (new Date() - created) / (1000 * 60 * 60 * 24);
        if (ageMsg < 3) return; // Too new

        // 2. Check recent login days
        // We look effectively at the last N login days.
        let resistanceStreak = 0;

        for (let dateStr of sortedLogin) {
            // Is vice completed on this day?
            // Vice history contains date if DONE.
            if (v.history && v.history.includes(dateStr)) {
                // Relapse! Streak ends.
                break;
            } else {
                // Clean day!
                resistanceStreak++;
            }
        }
        if (resistanceStreak > maxResistance) maxResistance = resistanceStreak;
    });

    return maxResistance;
}

/**
 * Count tasks completed within the 24h window of the quest (Start Date + Next Date).
 * Since we don't have timestamps, we accept tasks from the start date and the day after.
 * @param {Array} habits 
 * @param {string} startTimeISO 
 * @returns {number} Total tasks completed in the window
 */
export function get24hTaskCount(habits, startTimeISO) {
    if (!startTimeISO) return 0;

    const startDate = new Date(startTimeISO);
    const startStr = startDate.toISOString().split('T')[0];

    // Next day
    const nextDate = new Date(startDate);
    nextDate.setDate(nextDate.getDate() + 1);
    const nextStr = nextDate.toISOString().split('T')[0];

    let count = 0;
    habits.forEach(h => {
        if (h.history) {
            // Count any entry that matches start date or next date
            // Note: History entries might have '!' prefix for red days, but we want COMPLETED tasks.
            // Usually history stores just date string for completion? 
            // processHabitToggle pushes `dateString`.
            // generateRandomHistory pushes `dateString` or `!dateString`.
            // We assume 'virtue' or 'todo'.

            // Logic: Count occurrences of startStr OR nextStr in history
            const doneOnStart = h.history.includes(startStr);
            const doneOnNext = h.history.includes(nextStr);

            if (doneOnStart) count++;
            if (doneOnNext) count++;
        }
    });
    return count;
}

/**
 * Generates regular quests (daily rotation)
 * Picks 2 random achievement quests from the pool
 */
export const generateDailyQuests = () => {
    // Pool of rotating missions (exclude tutorial 'introspection')
    const pool = ['login_streak', 'virtue_streak', 'vice_resistance', 'daily_productivity'];

    // Shuffle and pick 2
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 2);
};
