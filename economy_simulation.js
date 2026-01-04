
// ==============================================================================
// FORUM EMERGO - ECONOMY SIMULATION PLAYGROUND
// ==============================================================================
// Run this script locally using: node economy_simulation.js
// 
// INSTRUCTIONS:
// 1. Modify the CONSTANTS in the section below to tune the economy.
// 2. Run the script to see the 365-day projection.
// 3. When satisfied, report the new values to the developer to update the game.
// ==============================================================================

// --- CONFIGURATION SECTION (TUNE THESE!) ---

// 1. Starting State
const START_GOLD = 500;
const TASKS_PER_DAY = 10; // Number of tasks user completes daily

// 2. Task Rewards
const BASE_TASK_GOLD = 5; // Gold per task at Town Hall Level 1
// Multipliers per Town Hall Level (1-5)
const TOWN_HALL_MULTIPLIERS = {
    1: 1,      // Reward: 5g
    2: 10,     // Reward: 50g
    3: 100,    // Reward: 500g
    4: 1000,   // Reward: 5,000g
    5: 10000   // Reward: 50,000g
};

// 3. Building Upgrade Costs
const UPGRADE_COSTS = {
    // Current Level -> Cost to reach next level
    town_hall: { 1: 0, 2: 1000, 3: 50000, 4: 500000, 5: 10000000 },
    house: { 1: 0, 2: 750, 3: 5000, 4: 75000, 5: 1500000 },
    tavern: { 1: 250, 2: 5000, 3: 25000, 4: 100000, 5: 500000 }, // Lvl 1 is Unlock Cost
    library: { 1: 250, 2: 5000, 3: 25000, 4: 100000, 5: 500000 }, // Lvl 1 is Unlock Cost
    market: { 1: 250, 2: 10000, 3: 50000, 4: 250000, 5: 1000000 } // Lvl 1 is Unlock Cost
};

// 4. House Costs (Dynamic)
// Cost for 1st house (Level 1) = HOUSE_BASE_COST * 1
// Cost for 2nd house (Level 1) = HOUSE_BASE_COST * 2
const HOUSE_BASE_COST = 100;

// 5. Population per House Level
const POPULATION_PER_LEVEL = {
    1: 200,      // Tent
    2: 1000,     // Houten Huis
    3: 5000,     // Stenen Domus
    4: 30000,    // Insula
    5: 200000    // Villa Complex
};

// 6. Research (Passive Income)
const RESEARCH_TYPES = {
    tax: {
        baseCost: 250,
        costMult: 1.2,
        percPerLevel: 0.01 // 1% tax per level
    },
    interest: {
        baseCost: 1000,
        costMult: 1.3,
        percPerLevel: 0.001, // 0.1% interest per level
        hardCap: 200000 // Max interest per day
    }
};

// Research Caps based on Library Level
const RESEARCH_CAPS = {
    1: { tax: 6, interest: 4 },
    2: { tax: 12, interest: 8 },
    3: { tax: 18, interest: 12 },
    4: { tax: 24, interest: 16 },
    5: { tax: 30, interest: 20 }
};

// 7. Tavern Hero Caps
const TAVERN_CAPS = {
    1: 1,
    2: 2,
    3: 4,
    4: 7,
    5: 10
};
const HERO_COST = 100;

// ==============================================================================
// SIMULATION LOGIC (DO NOT TOUCH BELOW unless changing mechanics)
// ==============================================================================

// Initial State
let stats = { gold: START_GOLD };
let buildings = [
    { id: "town_hall", type: "town_hall", level: 1 },
    { id: "tavern", type: "tavern", level: 0 },
    { id: "library", type: "library", level: 0 },
    { id: "market", type: "market", level: 0 },
    { id: "house_1", type: "house", level: 0 },
    { id: "house_2", type: "house", level: 0 },
    { id: "house_3", type: "house", level: 0 },
    { id: "house_4", type: "house", level: 0 },
    { id: "house_5", type: "house", level: 0 }
];
let research = { tax: 0, interest: 0 };
let heroes = [];

// Helpers
function getUpgradeCost(type, currentLevel) {
    const nextLevel = currentLevel + 1;

    // Check Max Level
    if (nextLevel > 5) return Infinity;

    // Check Town Hall Cap (Building level cannot exceed Town Hall level)
    if (type !== 'town_hall') {
        const th = buildings.find(b => b.type === 'town_hall');
        if (th && nextLevel > th.level) return Infinity;
    }

    // Special: House Level 1 Dynamic Cost
    if (type === 'house' && currentLevel === 0) {
        const count = buildings.filter(b => b.type === 'house' && b.level > 0).length;
        return HOUSE_BASE_COST * (count + 1);
    }

    // Standard Lookups
    if (UPGRADE_COSTS[type] && UPGRADE_COSTS[type][nextLevel]) {
        return UPGRADE_COSTS[type][nextLevel];
    }
    return Infinity;
}

function getResearchCost(type, currentLevel) {
    const r = RESEARCH_TYPES[type];
    return Math.floor(r.baseCost * Math.pow(r.costMult, currentLevel));
}

function getPopulation() {
    return buildings.reduce((sum, b) => {
        if (b.type === 'house') return sum + (POPULATION_PER_LEVEL[b.level] || 0);
        return sum;
    }, 0);
}

// --- MAIN LOOP 365 DAYS ---

console.log("Starting Simulation...");
// Define widths: Dag(4), Goud(9), Taken(6), Rente(6), Tax(6), Gebouwen(38), Helden(7), Onderzoek(20), Gekocht(30)
const P = (s, w) => String(s).padEnd(w);
const PNum = (s, w) => String(s).padStart(w);

// Header
console.log(`| ${P("Dag", 3)} | ${P("Goud", 9)} | ${P("Taken", 6)} | ${P("Rente", 5)} | ${P("Tax", 5)} | ${P("Gebouwen", 38)} | ${P("Helden", 6)} | ${P("Onderzoek", 19)} | ${P("Gekocht", 30)} |`);
console.log(`|${"-".repeat(5)}|${"-".repeat(11)}|${"-".repeat(8)}|${"-".repeat(7)}|${"-".repeat(7)}|${"-".repeat(40)}|${"-".repeat(8)}|${"-".repeat(21)}|${"-".repeat(32)}|`);

for (let day = 1; day <= 365; day++) {

    // 1. CALCULATE INCOME

    // Active: Tasks
    const thLevel = buildings.find(b => b.type === 'town_hall').level;
    const taskReward = BASE_TASK_GOLD * (TOWN_HALL_MULTIPLIERS[thLevel] || 1);
    const activeIncome = TASKS_PER_DAY * taskReward;

    // Passive: Tax
    const pop = getPopulation();
    const taxRate = (research.tax || 0) * RESEARCH_TYPES.tax.percPerLevel;
    const taxIncome = Math.floor(pop * taxRate);

    // Passive: Interest
    const interestRate = (research.interest || 0) * RESEARCH_TYPES.interest.percPerLevel;
    let interestIncome = Math.floor(stats.gold * interestRate);
    if (interestIncome > RESEARCH_TYPES.interest.hardCap) interestIncome = RESEARCH_TYPES.interest.hardCap;

    const totalIncome = activeIncome + taxIncome + interestIncome;
    stats.gold += totalIncome;

    // 2. SPENDING STRATEGY (GREEDY)
    // Buy the most important thing we can afford, repeat until broke.
    let purchased = true;
    let dailyPurchases = [];

    while (purchased) {
        purchased = false;

        // A. Town Hall 
        const th = buildings.find(b => b.type === 'town_hall');
        const costTH = getUpgradeCost('town_hall', th.level);
        if (stats.gold >= costTH) {
            stats.gold -= costTH;
            th.level++;
            dailyPurchases.push(`TH Lvl ${th.level} (-${costTH})`);
            purchased = true;
            continue;
        }

        // B. Houses
        const houses = buildings.filter(b => b.type === 'house');
        let bestHouse = null;
        let minHouseCost = Infinity;
        for (let h of houses) {
            const cost = getUpgradeCost('house', h.level);
            if (cost < minHouseCost) { minHouseCost = cost; bestHouse = h; }
        }
        if (bestHouse && stats.gold >= minHouseCost) {
            stats.gold -= minHouseCost;
            bestHouse.level++;
            dailyPurchases.push(`Huis Lvl ${bestHouse.level} (-${minHouseCost})`);
            purchased = true;
            continue;
        }

        // C. Library 
        const lib = buildings.find(b => b.type === 'library');
        const costLib = getUpgradeCost('library', lib.level);
        if (stats.gold >= costLib) {
            stats.gold -= costLib;
            lib.level++;
            dailyPurchases.push(`Lib Lvl ${lib.level} (-${costLib})`);
            purchased = true;
            continue;
        }

        // D. Research
        const libLevel = lib.level;
        if (libLevel > 0) {
            const caps = RESEARCH_CAPS[libLevel];

            const costTax = getResearchCost('tax', research.tax);
            if (research.tax < caps.tax && stats.gold >= costTax) {
                stats.gold -= costTax;
                research.tax++;
                dailyPurchases.push(`Tax ${research.tax} (-${costTax})`);
                purchased = true;
                continue;
            }

            const costInt = getResearchCost('interest', research.interest);
            if (research.interest < caps.interest && stats.gold >= costInt) {
                stats.gold -= costInt;
                research.interest++;
                dailyPurchases.push(`Int ${research.interest} (-${costInt})`);
                purchased = true;
                continue;
            }
        }

        // E. Tavern & Heroes
        const tav = buildings.find(b => b.type === 'tavern');
        const costTav = getUpgradeCost('tavern', tav.level);
        if (stats.gold >= costTav) {
            stats.gold -= costTav;
            tav.level++;
            dailyPurchases.push(`Tav Lvl ${tav.level} (-${costTav})`);
            purchased = true;
            continue;
        }

        const heroCap = TAVERN_CAPS[tav.level] || 0;
        if (heroes.length < heroCap && heroes.length < 10 && stats.gold >= HERO_COST) {
            stats.gold -= HERO_COST;
            heroes.push({ id: Date.now() });
            dailyPurchases.push(`Held (${heroes.length}) (-${HERO_COST})`);
            purchased = true;
            continue;
        }

        // F. Market
        const mkt = buildings.find(b => b.type === 'market');
        const costMkt = getUpgradeCost('market', mkt.level);
        if (stats.gold >= costMkt) {
            stats.gold -= costMkt;
            mkt.level++;
            dailyPurchases.push(`Mkt Lvl ${mkt.level} (-${costMkt})`);
            purchased = true;
            continue;
        }
    }

    // 3. LOGGING
    const thL = buildings.find(b => b.type === 'town_hall').level;
    const tavL = buildings.find(b => b.type === 'tavern').level;
    const libL = buildings.find(b => b.type === 'library').level;
    const mktL = buildings.find(b => b.type === 'market').level;
    const houseLvls = buildings.filter(b => b.type === 'house').map(b => b.level);
    const houseStr = `[${houseLvls.join(',')}]`;
    const buildStr = `TH:${thL} Tav:${tavL} Lib:${libL} Mkt:${mktL} H:${houseStr}`;
    const researchStr = `Tax:${research.tax} Int:${research.interest}`;

    // Format purchases: Multi-line
    const rows = Math.max(1, dailyPurchases.length);
    for (let i = 0; i < rows; i++) {
        const purchase = dailyPurchases[i] || "";
        // Truncate purchase if too long for 30 chars?
        let purchaseDisplay = purchase;
        if (purchaseDisplay.length > 30) purchaseDisplay = purchaseDisplay.substring(0, 27) + "...";

        if (i === 0) {
            console.log(`| ${PNum(day, 3)} | ${PNum(stats.gold, 9)} | ${PNum(activeIncome, 6)} | ${PNum(interestIncome, 5)} | ${PNum(taxIncome, 5)} | ${P(buildStr, 38)} | ${PNum(heroes.length, 6)} | ${P(researchStr, 19)} | ${P(purchaseDisplay, 30)} |`);
        } else {
            console.log(`| ${P("", 3)} | ${P("", 9)} | ${P("", 6)} | ${P("", 5)} | ${P("", 5)} | ${P("", 38)} | ${P("", 6)} | ${P("", 19)} | ${P(purchaseDisplay, 30)} |`);
        }
    }
    // Separator line for readability between days? Optional, maybe only if multi-line
    if (rows > 1) {
        console.log(`|${"-".repeat(5)}|${"-".repeat(11)}|${"-".repeat(8)}|${"-".repeat(7)}|${"-".repeat(7)}|${"-".repeat(40)}|${"-".repeat(8)}|${"-".repeat(21)}|${"-".repeat(32)}|`);
    } else {
        // Just to keep grid tight? No separator line for single rows to save space, 
        // or maybe simple separator everywhere? User asked for "one item per line", didn't ask for grid lines.
        // Let's leave it without extra grid lines unless it's a new day block.
    }
}
