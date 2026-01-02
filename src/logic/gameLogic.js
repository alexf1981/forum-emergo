
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
    return habits.map(h => {
        if (h.type === 'virtue' || h.type === 'vice' || !h.type) {
            // Keep history, but ensure completed is false for visual state if used elsewhere
            return { ...h, completed: false };
        }
        return h;
    });
}
