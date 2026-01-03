const LOG_DAYS = [1, 7, 30, 90, 180, 270, 365];

// --- CONSTANTS ---
const MAX_DAYS = 365;
const DAILY_TASKS = 10;
const BASE_TASK_GOLD = 15; // Increased from 10

const HOUSES_MAX = 10;
const HOUSE_LEVEL_MAX = 5;
const POPULATION = { 0: 0, 1: 100, 2: 500, 3: 2500, 4: 15000, 5: 100000 };
// Tweak House Costs: Cheaper Lvl 2/3 to encourage mid-game pop
const HOUSE_COSTS = { 1: 100, 2: 750, 3: 5000, 4: 75000, 5: 1500000 };

const TAX_RESEARCH_MAX = 30;
const TAX_PER_LEVEL = 0.01; // 1%
// Tweak Tax: Cheaper start, slightly lower mult to keep end game reachable
const TAX_BASE_COST = 250;
const TAX_COST_MULT = 1.2;

const INTEREST_RESEARCH_MAX = 20;
const INTEREST_PER_LEVEL = 0.001; // 0.1%
const INTEREST_MAX_DAILY = 200000;
const INTEREST_BASE_COST = 1000;
const INTEREST_COST_MULT = 1.3;

const TOWN_HALL_MAX = 5;
// Tweak TH: More aggressive multipliers (Design Doc values), Cheaper Lvl 2
const TOWN_HALL_COSTS = { 1: 0, 2: 2500, 3: 50000, 4: 500000, 5: 10000000 };
const TOWN_HALL_MULT = { 1: 1, 2: 5, 3: 25, 4: 100, 5: 500 }; // Active Task Multiplier

// --- STATE ---
let state = {
    day: 0,
    gold: 0,
    totalEarned: 0,
    houses: Array(HOUSES_MAX).fill(0), // levels
    taxLevel: 0,
    interestLevel: 0,
    townHallLevel: 1
};

// --- SIMULATION ---
console.log("Day | Gold | Inc/Day | Pop | Tax% | TH Lvl | Upgrades");
console.log("-".repeat(80));

for (let day = 1; day <= MAX_DAYS; day++) {
    state.day = day;

    // 1. Calculate Daily Income (Start of day)
    const activeIncome = DAILY_TASKS * BASE_TASK_GOLD * TOWN_HALL_MULT[state.townHallLevel];

    const population = state.houses.reduce((sum, lvl) => sum + POPULATION[lvl], 0);
    const taxRate = state.taxLevel * TAX_PER_LEVEL;
    // Cap tax rate at 30%? User said 30 levels of 1%, so 30% max.
    const passiveIncomeTax = population * 1 * taxRate; // 1g per capita

    const interestRate = state.interestLevel * INTEREST_PER_LEVEL;
    let passiveIncomeInterest = state.gold * interestRate;
    if (passiveIncomeInterest > INTEREST_MAX_DAILY) passiveIncomeInterest = INTEREST_MAX_DAILY;

    const dailyIncome = activeIncome + passiveIncomeTax + passiveIncomeInterest;

    state.gold += dailyIncome;
    state.totalEarned += dailyIncome;

    // 2. Buy Upgrades (Greedy Strategy)
    // Priority: Town Hall > Tax > Houses > Interest
    let bought = [];

    // Buy Town Hall?
    if (state.townHallLevel < TOWN_HALL_MAX) {
        let cost = TOWN_HALL_COSTS[state.townHallLevel + 1];
        if (state.gold >= cost) {
            state.gold -= cost;
            state.townHallLevel++;
            bought.push(`TH ${state.townHallLevel}`);
        }
    }

    // Buy Tax Research?
    if (state.taxLevel < TAX_RESEARCH_MAX) {
        let cost = Math.floor(TAX_BASE_COST * Math.pow(TAX_COST_MULT, state.taxLevel));
        if (state.gold >= cost) {
            state.gold -= cost;
            state.taxLevel++;
            bought.push(`Tax ${state.taxLevel}`);
        }
    }

    // Buy Houses? (Cheapest first)
    // Find cheapest upgrade
    for (let i = 0; i < HOUSES_MAX; i++) {
        let lvl = state.houses[i];
        if (lvl < HOUSE_LEVEL_MAX) {
            let cost = HOUSE_COSTS[lvl + 1];
            if (state.gold >= cost) {
                state.gold -= cost;
                state.houses[i]++;
                bought.push(`H${i + 1} L${state.houses[i]}`);
                // Only buy one house per day to be realistic? Or loop?
                // Let's loop but break if broke.
            }
        }
    }

    // Buy Interest Research?
    if (state.interestLevel < INTEREST_RESEARCH_MAX) {
        let cost = Math.floor(INTEREST_BASE_COST * Math.pow(INTEREST_COST_MULT, state.interestLevel));
        if (state.gold >= cost) {
            state.gold -= cost;
            state.interestLevel++;
            bought.push(`Int ${state.interestLevel}`);
        }
    }

    // Log
    if (LOG_DAYS.includes(day) || day === MAX_DAYS) {
        console.log(`${day.toString().padEnd(3)} | ${Math.floor(state.gold).toString().padEnd(10)} | ${Math.floor(dailyIncome).toString().padEnd(8)} | ${population.toString().padEnd(7)} | ${(taxRate * 100).toFixed(0)}%   | ${state.townHallLevel}      | ${bought.length > 0 ? bought[0] + '...' : ''}`);
    }
}

console.log("-".repeat(80));
console.log("FINAL STATS:");
console.log(`Gold: ${Math.floor(state.gold)}`);
console.log(`Population: ${state.houses.reduce((sum, lvl) => sum + POPULATION[lvl], 0)}`);
console.log(`Tax Rate: ${state.taxLevel}%`);
console.log(`Town Hall: ${state.townHallLevel}`);
