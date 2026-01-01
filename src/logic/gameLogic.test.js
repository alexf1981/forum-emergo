import { describe, it, expect } from 'vitest';
import * as GameLogic from './gameLogic';

describe('City Rank Logic', () => {
    it('should determine correct rank based on score', () => {
        expect(GameLogic.getCityRank({ gold: 199 })).toBe("rank_0");
        expect(GameLogic.getCityRank({ gold: 200 })).toBe("rank_1");
        expect(GameLogic.getCityRank({ gold: 499 })).toBe("rank_1");
        expect(GameLogic.getCityRank({ gold: 500 })).toBe("rank_2");
        expect(GameLogic.getCityRank({ gold: 2500 })).toBe("rank_4");
    });
});

describe('Battle Logic', () => {
    it('should return a valid result object', () => {
        const hero = { str: 5, lvl: 1, items: [], hp: 20, maxHp: 20, xp: 80 };
        const quest = { id: 'test', level: 1, risk: 2, reward: 50, xp: 30 };

        const result = GameLogic.calculateBattleResult(hero, quest);

        expect(result).toHaveProperty('success');
        expect(typeof result.success).toBe('boolean');
        expect(result).toHaveProperty('hp');

        if (result.success) {
            expect(result).toHaveProperty('earnedXp');
            expect(result).toHaveProperty('earnedGold');
        } else {
            expect(result).toHaveProperty('dmgTaken');
        }
    });
});

describe('Habit Logic', () => {
    it('should create new habits', () => {
        let habits = [];
        habits = GameLogic.createHabit(habits, "Gym", "virtue", false);
        expect(habits).toHaveLength(1);
        expect(habits[0].text).toBe("Gym");
        expect(habits[0].type).toBe("virtue");
        expect(habits[0].bucket).toBe(false);

        habits = GameLogic.createHabit(habits, "Task", "todo", true);
        expect(habits).toHaveLength(2);
        expect(habits[1].bucket).toBe(true);
    });

    it('should update habits', () => {
        let habits = [{ id: 1, text: "Old", bucket: false }];
        habits = GameLogic.updateHabit(habits, 1, { text: "New" });
        expect(habits[0].text).toBe("New");
    });

    it('should delete habits', () => {
        let habits = [{ id: 1 }, { id: 2 }];
        habits = GameLogic.deleteHabit(habits, 1);
        expect(habits).toHaveLength(1);
        expect(habits[0].id).toBe(2);
    });

    it('should toggle habits correctly (Virtue)', () => {
        const initialStats = { gold: 100, army: 10 };
        const habits = [{ id: 1, type: 'virtue', history: [] }];
        const date = "2025-01-01";

        // Toggle ON
        const r1 = GameLogic.processHabitToggle(habits, initialStats, 1, date);
        expect(r1.newStats.gold).toBe(110); // +10
        expect(r1.newHabits[0].history).toContain(date);

        // Toggle OFF (Undo)
        const r2 = GameLogic.processHabitToggle(r1.newHabits, r1.newStats, 1, date);
        expect(r2.newStats.gold).toBe(100); // Refunded
        expect(r2.newHabits[0].history).not.toContain(date);
    });

    it('should toggle habits correctly (Vice)', () => {
        const initialStats = { gold: 100, army: 10 };
        const habits = [{ id: 1, type: 'vice', history: [] }];
        const date = "2025-01-01";

        // Toggle ON (Penalty)
        const r1 = GameLogic.processHabitToggle(habits, initialStats, 1, date);
        expect(r1.newStats.gold).toBe(80); // -20

        // Toggle OFF (Undo Penalty)
        const r2 = GameLogic.processHabitToggle(r1.newHabits, r1.newStats, 1, date);
        expect(r2.newStats.gold).toBe(100);
    });
});
