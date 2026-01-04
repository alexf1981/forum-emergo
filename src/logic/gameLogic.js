
// --- RPG CONSTANTS ---
export const HERO_NAMES = ["Lucius", "Titus", "Marcus", "Aurelius", "Flavius", "Maximus", "Octavius", "Casius", "Valerius", "Felix"];

// Items Database
export const ITEMS = [
    { id: 'glad_bronze', name: 'Bronzen Gladius', type: 'weapon', bonus: 2, icon: '🗡️', rarity: 'common' },
    { id: 'arm_leather', name: 'Leren Borstplaat', type: 'armor', bonus: 2, icon: '🛡️', rarity: 'common' },
    { id: 'glad_iron', name: 'IJzeren Gladius', type: 'weapon', bonus: 4, icon: '⚔️', rarity: 'uncommon' },
    { id: 'arm_chain', name: 'Maliënkolder', type: 'armor', bonus: 4, icon: '🛡️', rarity: 'uncommon' },
    { id: 'spear_legion', name: 'Legioenspeer', type: 'weapon', bonus: 6, icon: '🔱', rarity: 'rare' },
    { id: 'shield_scutum', name: 'Scutum Schild', type: 'armor', bonus: 6, icon: '🛡️', rarity: 'rare' },
    { id: 'sword_legend', name: 'Zwaard van Mars', type: 'weapon', bonus: 10, icon: '🔥', rarity: 'legendary' }
];

// Quest Types
export const QUESTS = [
    { id: 'patrol', name: 'Stadspatrouille', level: 1, risk: 4, reward: 25, xp: 20, desc: 'Verjaag dronkenlappen en dieven.' },
    { id: 'bandits', name: 'Bandietenkamp', level: 3, risk: 12, reward: 60, xp: 50, desc: 'Val een kamp in het bos aan.' },
    { id: 'ruins', name: 'Vervloekte Ruïnes', level: 5, risk: 25, reward: 150, xp: 120, desc: 'Verken duistere kerkers voor schatten.' }
];

export const ENEMY_TYPES = [
    { name: "Straatschoffie", str: 2 },
    { name: "Wolvenroedel", str: 5 },
    { name: "Gallische Krijger", str: 8 },
    { name: "Deserteur", str: 10 },
    { name: "Oude Minotaurus", str: 15 }
];

// --- HELPERS ---
export const getTodayString = () => new Date().toISOString().split('T')[0];

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
    // Calculate Powers
    const itemBonus = hero.items.reduce((sum, item) => sum + item.bonus, 0);
    const totalHeroStr = hero.str + itemBonus + hero.lvl;

    const performance = totalHeroStr * (0.8 + randomFn() * 0.4);
    const difficulty = quest.risk * (0.8 + randomFn() * 0.4);

    if (performance >= difficulty) {
        // WIN
        const earnedXp = quest.xp;
        let earnedGold = quest.reward;
        const dmgTaken = Math.floor(randomFn() * 3);

        let lootMsg = "";
        let newItems = [...hero.items];

        // Loot Logic: 35% chance
        if (randomFn() < 0.35) {
            const possibleItems = ITEMS.filter(i =>
                (quest.level <= 1 && i.rarity === 'common') ||
                (quest.level >= 3 && i.rarity === 'uncommon') ||
                (quest.level >= 5)
            );
            if (possibleItems.length > 0) {
                const foundItem = possibleItems[Math.floor(randomFn() * possibleItems.length)];

                // Smart Inventory Management
                const existingItemIndex = newItems.findIndex(i => i.type === foundItem.type);
                if (existingItemIndex !== -1) {
                    const existingItem = newItems[existingItemIndex];
                    if (foundItem.bonus > existingItem.bonus) {
                        newItems[existingItemIndex] = foundItem; // Upgrade
                        lootMsg = { key: 'msg_loot_upgrade', args: { item: foundItem.name, oldItem: existingItem.name } };
                    } else {
                        earnedGold += 10;
                        lootMsg = { key: 'msg_loot_sell', args: {} };
                    }
                } else {
                    newItems.push(foundItem); // New slot
                    lootMsg = { key: 'msg_loot_found', args: { item: foundItem.name } };
                }
            }
        }

        // Level Up Logic
        let newXp = hero.xp + earnedXp;
        let newLvl = hero.lvl;
        let newStr = hero.str;
        let leveledUp = false;

        if (newXp >= newLvl * 100) {
            newXp -= newLvl * 100;
            newLvl++;
            newStr += 2;
            leveledUp = true;
        }

        return {
            success: true,
            earnedXp,
            earnedGold,
            dmgTaken,
            lootMsg, // Now an object or null
            newItems,
            newXp,
            newLvl,
            newStr,
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
        history: []
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
        if (h.type === 'virtue' || h.type === 'vice' || !h.type) {
            // Keep history, but ensure completed is false for visual state if used elsewhere
            return { ...h, completed: false };
        }
        return h;
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
    tavern: 2500,  // Unlock Cost
    library: 5000,
    market: 10000,
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
    town_hall: { 2: 2500, 3: 50000, 4: 500000, 5: 10000000 },
    house: { 2: 750, 3: 5000, 4: 75000, 5: 1500000 },
    tavern: { 2: 5000, 3: 25000, 4: 100000, 5: 500000 },
    library: { 2: 5000, 3: 25000, 4: 100000, 5: 500000 },
    market: { 2: 10000, 3: 50000, 4: 250000, 5: 1000000 }
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
        costMult: 1.2,
        desc: "Verhoogt belastinginkomsten met 1% per niveau."
    },
    interest: {
        id: 'interest',
        name: 'Bankieren',
        maxLevel: 20,
        baseCost: 1000,
        costMult: 1.3,
        desc: "Ontvang dagelijks 0.1% rente over je goudvoorraad."
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

export const getBuildingBenefit = (type, level) => {
    if (level === 0) return "-";

    switch (type) {
        case 'town_hall':
            const mult = TOWN_HALL_MULTIPLIERS[level] || 1;
            const reward = BASE_TASK_GOLD * mult;
            return `Taakbeloning: ${reward}g`;
        case 'house':
            const pop = POPULATION_PER_LEVEL[level] || 0;
            return `Bevolking: ${pop}`;
        case 'library':
            const caps = RESEARCH_CAPS[level];
            if (!caps) return "Geen onderzoek";
            return `Max Tax: ${caps.tax} / Bank: ${caps.interest}`;
        case 'market':
            if (level === 1) return "Handel Vrijgespeeld";
            return "Betere prijzen";
        case 'tavern':
            const heroCap = TAVERN_CAPS[level] || 0;
            return `Max ${heroCap} held(en)`;
        default:
            return "Onbekend effect";
    }
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


export const getBuildingName = (type, level) => {
    if (type === 'house') {
        return HOUSE_LEVELS[level]?.name || `Woonhuis ${level}`;
    }
    const baseNames = {
        town_hall: "Stadhuis",
        library: "Bibliotheek",
        market: "Markt",
        tavern: "Taverne",
        house: "Woonhuis"
    };
    const base = baseNames[type] || type;

    // Roman numerals for levels
    const romans = ["", "I", "II", "III", "IV", "V"];
    return `${base} ${romans[level] || level}`;
};
