
import { describe, it, expect } from 'vitest';
import * as GameLogic from './gameLogic';

/**
 * MISSION SIMULATION TESTS
 * 
 * This file simulates the "Happy Path" for all 5 main quests types in a CLI-like fashion.
 * It uses purely the GameLogic functions, decoupling the simulation from the React UI.
 * 
 * Scenarios:
 * 1. Introspection (Instant)
 * 2. Login Streak (7 Days)
 * 3. Virtue Streak (3 Days)
 * 4. Vice Resistance (3 Days)
 * 5. Daily Productivity (5 Tasks in 24h)
 */

describe('Full Mission Simulation (CLI Style)', () => {

    // Helper to create a fresh "Clean Slate" state
    const createNewState = () => {
        // Use the centralized logic, passing identity for translation
        const state = GameLogic.getInitialState((s) => s);

        return {
            ...state,
            habits: [], // Start empty for controlled testing, map 'romehabits' to 'habits' 
            romehabits: [],
            romeloginhistory: [],
            stats: state.romestats, // Map to test expectation names if needed or refactor tests
            quests: state.romequests,
            heroes: [
                { id: 'h1', name: 'Maximus', status: 'IDLE', lvl: 1, xp: 0 }
            ]
        };
    };

    // --- SCENARIO 1: INTROSPECTION ---
    it('Scenario 1: Completes "Introspection" (Instant Quest)', () => {
        let state = createNewState();
        const questId = 'introspection';

        // 1. Verify Start Conditions
        expect(state.stats.gold).toBe(200); // Default start gold

        // 2. Start Quest
        const startResult = GameLogic.startQuest(state.quests, state.heroes, state.stats, questId, ['h1']);
        expect(startResult.success).toBe(true);

        // Update State
        state.quests = startResult.newQuests;
        state.heroes = startResult.newHeroes;

        // 3. Verify Hero Status (Instant quest does not lock for long, but logically checks out)
        const activeQuest = state.quests.find(q => q.templateId === questId);
        expect(activeQuest).toBeDefined();

        // 4. Complete Quest
        const completeResult = GameLogic.completeQuest(state.quests, state.heroes, state.stats, activeQuest.id);
        expect(completeResult.success).toBe(true);

        // 5. Verify Rewards
        expect(completeResult.newStats.gold).toBe(250); // 200 + 50
        expect(completeResult.newHeroes[0].xp).toBe(50); // XP Reward

        console.log("✅ Scenario 1: Introspection passed.");
    });


    // --- SCENARIO 2: LOGIN STREAK ---
    it('Scenario 2: Completes "De Trouwe Wacht" (7 Day Login Streak)', () => {
        let state = createNewState();
        const questId = 'login_streak';

        // 1. Start Quest
        const startResult = GameLogic.startQuest(state.quests, state.heroes, state.stats, questId, ['h1']);
        expect(startResult.success).toBe(true);
        state.quests = startResult.newQuests;
        state.heroes = startResult.newHeroes;

        // Verify Hero is Locked (Duration > 0)
        expect(state.heroes[0].status).toBe('QUESTING');

        // 2. Simulate Time Travel (Build 7 Day Streak)
        // We inject 7 consecutive dates into loginHistory
        const today = new Date();
        const history = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            history.push(d.toISOString().split('T')[0]);
        }
        state.loginHistory = history;

        // 3. Check Progress Logic
        const streak = GameLogic.getLoginStreak(state.loginHistory);
        expect(streak).toBe(7);

        // 4. Attempt Completion
        const target = 7;
        expect(streak).toBeGreaterThanOrEqual(target);

        const activeQuest = state.quests[0];
        const completeResult = GameLogic.completeQuest(state.quests, state.heroes, state.stats, activeQuest.id);

        // 5. Verify Rewards & Hero Unlock
        expect(completeResult.success).toBe(true);
        expect(completeResult.newStats.gold).toBe(450); // 200 + 250
        expect(completeResult.newHeroes[0].status).toBe('IDLE');

        console.log("✅ Scenario 2: Login Streak passed.");
    });


    // --- SCENARIO 3: VIRTUE STREAK ---
    it('Scenario 3: Completes "De Deugdzame Burger" (3 Day Virtue Streak)', () => {
        let state = createNewState();
        const questId = 'virtue_streak';

        // 1. Setup Habit
        state.habits = GameLogic.createHabit(state.habits, "Meditation", "virtue");
        const habitId = state.habits[0].id;

        // 2. Start Quest
        const startResult = GameLogic.startQuest(state.quests, state.heroes, state.stats, questId, ['h1']);
        state.quests = startResult.newQuests;
        state.heroes = startResult.newHeroes;

        // 3. Simulate 3 Days of Completion
        const d1 = new Date();
        const d2 = new Date(); d2.setDate(d2.getDate() - 1);
        const d3 = new Date(); d3.setDate(d3.getDate() - 2);

        const history = [
            d1.toISOString().split('T')[0],
            d2.toISOString().split('T')[0],
            d3.toISOString().split('T')[0]
        ];

        // Hack logic: Update pure state
        state.habits[0].history = history;

        // 4. Check Progress
        const streak = GameLogic.getVirtueStreak(state.habits);
        expect(streak).toBe(3);

        // 5. Complete
        const activeQuest = state.quests[0];
        const completeResult = GameLogic.completeQuest(state.quests, state.heroes, state.stats, activeQuest.id);

        expect(completeResult.success).toBe(true);
        expect(completeResult.newStats.gold).toBe(400); // 200 + 200

        console.log("✅ Scenario 3: Virtue Streak passed.");
    });


    // --- SCENARIO 4: VICE RESISTANCE ---
    it('Scenario 4: Completes "De Verleiding Weerstaan" (3 Day Vice Resistance)', () => {
        let state = createNewState();
        const questId = 'vice_resistance';

        // Prerequisites: Vice must exist > 3 days
        const oldDate = new Date();
        oldDate.setDate(oldDate.getDate() - 10);

        state.habits = [{
            id: 'vice1',
            text: 'Smoking',
            type: 'vice',
            createdAt: oldDate.toISOString(),
            history: [] // Clean history!
        }];

        // 1. Start Quest
        const startResult = GameLogic.startQuest(state.quests, state.heroes, state.stats, questId, ['h1']);
        state.quests = startResult.newQuests;
        state.heroes = startResult.newHeroes;

        // 2. Simulate 3 "Green Days" (Logins without vice)
        const d1 = new Date();
        const d2 = new Date(); d2.setDate(d2.getDate() - 1);
        const d3 = new Date(); d3.setDate(d3.getDate() - 2);

        state.loginHistory = [
            d1.toISOString().split('T')[0],
            d2.toISOString().split('T')[0],
            d3.toISOString().split('T')[0]
        ];

        // 3. Check Progress
        const resistance = GameLogic.getViceResistanceStreak(state.habits, state.loginHistory);
        expect(resistance).toBe(3);

        // 4. Complete
        const activeQuest = state.quests[0];
        const completeResult = GameLogic.completeQuest(state.quests, state.heroes, state.stats, activeQuest.id);

        expect(completeResult.success).toBe(true);
        expect(completeResult.newStats.gold).toBe(300); // 200 + 100

        console.log("✅ Scenario 4: Vice Resistance passed.");
    });


    // --- SCENARIO 5: DAILY PRODUCTIVITY ---
    it('Scenario 5: Completes "Dagelijkse Daadkracht" (5 Tasks in 24h)', () => {
        let state = createNewState();
        const questId = 'daily_productivity';

        // 1. Start Quest
        const startResult = GameLogic.startQuest(state.quests, state.heroes, state.stats, questId, ['h1']);
        state.quests = startResult.newQuests;
        state.heroes = startResult.newHeroes;

        const activeQuest = state.quests[0];
        const startTime = activeQuest.startTime;

        // 2. Simulate 5 Tasks Completed Today
        const todayStr = new Date().toISOString().split('T')[0];

        // Create 5 habits done today
        state.habits = [
            { id: 1, type: 'virtue', history: [todayStr] },
            { id: 2, type: 'todo', history: [todayStr] },
            { id: 3, type: 'virtue', history: [todayStr] },
            { id: 4, type: 'virtue', history: [todayStr] },
            { id: 5, type: 'todo', history: [todayStr] }
        ];

        // 3. Check Progress
        const count = GameLogic.get24hTaskCount(state.habits, startTime);
        expect(count).toBe(5);

        // 4. Complete
        const completeResult = GameLogic.completeQuest(state.quests, state.heroes, state.stats, activeQuest.id);

        expect(completeResult.success).toBe(true);
        expect(completeResult.newStats.gold).toBe(250); // 200 + 50

        console.log("✅ Scenario 5: Productivity passed.");
    });


    // --- ADDITIONAL: VERIFY INITIAL STATE ---
    it('Verify Initial State Cleanliness', () => {
        const state = GameLogic.getInitialState((s) => s);

        // Should have 200 gold
        expect(state.romestats.gold).toBe(200);

        // Should have 0 heroes
        expect(state.romeheroes.length).toBe(0);

        // Should have 0 quests
        expect(state.romequests.length).toBe(0);

        // Should have default buildings
        expect(state.romebuildings.length).toBeGreaterThan(0);

        console.log("✅ Initial State Verified.");
    });

});
