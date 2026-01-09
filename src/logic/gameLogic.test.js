
import { describe, it, expect } from 'vitest';
import { getLoginStreak, getVirtueStreak, getViceResistanceStreak, getDailyTaskCount, getTodayString } from './gameLogic';

describe('Mission Logic', () => {

    describe('getLoginStreak', () => {
        it('returns 0 for empty history', () => {
            expect(getLoginStreak([])).toBe(0);
        });

        it('returns 1 for single login today', () => {
            const today = getTodayString();
            expect(getLoginStreak([today])).toBe(1);
        });

        it('returns 3 for 3 consecutive days', () => {
            const d = new Date();
            const today = d.toISOString().split('T')[0];
            d.setDate(d.getDate() - 1);
            const yesterday = d.toISOString().split('T')[0];
            d.setDate(d.getDate() - 1);
            const dayBefore = d.toISOString().split('T')[0];

            expect(getLoginStreak([today, yesterday, dayBefore])).toBe(3);
        });

        it('returns 0 if skipped a day (broken streak)', () => {
            const d = new Date();
            // Today missing
            d.setDate(d.getDate() - 2); // 2 days ago
            const twoDaysAgo = d.toISOString().split('T')[0];

            // Wait, if I am not logged in today, streak might be valid regarding "current state"? 
            // But usually you calculate streak including today if you just logged in.
            // If I logged in yesterday, streak is technically 1 (yesterday). 
            // My logic breaks streak if diff > 1.
            // Today - 2 Days Ago = 2 days diff. Streak broken.
            expect(getLoginStreak([twoDaysAgo])).toBe(0);
        });

        it('handles duplicate login entries for same day', () => {
            const today = getTodayString();
            expect(getLoginStreak([today, today, today])).toBe(1);
        });
    });

    describe('getVirtueStreak', () => {
        it('calculates streak for best performing virtue', () => {
            const d = new Date();
            const today = d.toISOString().split('T')[0];
            d.setDate(d.getDate() - 1);
            const yesterday = d.toISOString().split('T')[0];

            const habits = [
                { type: 'virtue', history: [today, yesterday] }, // Streak 2
                { type: 'virtue', history: [today] }             // Streak 1
            ];
            expect(getVirtueStreak(habits)).toBe(2);
        });

        it('ignores vices', () => {
            const d = new Date();
            const today = d.toISOString().split('T')[0];
            const habits = [
                { type: 'vice', history: [today, today] }
            ];
            expect(getVirtueStreak(habits)).toBe(0);
        });
    });

    describe('getViceResistanceStreak', () => {
        const today = new Date();
        const strToday = today.toISOString().split('T')[0];

        const d1 = new Date(today); d1.setDate(d1.getDate() - 1);
        const strYesterday = d1.toISOString().split('T')[0];

        const d2 = new Date(today); d2.setDate(d2.getDate() - 2);
        const strDayBefore = d2.toISOString().split('T')[0];

        const loginHistory = [strToday, strYesterday, strDayBefore];

        it('counts resistance correctly on green days', () => {
            // Vice created long ago
            const oldDate = new Date(); oldDate.setDate(oldDate.getDate() - 10);

            const habits = [{
                type: 'vice',
                createdAt: oldDate.toISOString(),
                history: [] // Never done! Resistance = 3 (since 3 login days)
            }];

            expect(getViceResistanceStreak(habits, loginHistory)).toBe(3);
        });

        it('resets streak if vice committed on a login day', () => {
            const oldDate = new Date(); oldDate.setDate(oldDate.getDate() - 10);

            const habits = [{
                type: 'vice',
                createdAt: oldDate.toISOString(),
                history: [strYesterday] // Committed yesterday!
            }];

            // Login History: Today (Clean), Yesterday (Dirty), DayBefore (Clean)
            // Sorted: Today, Yesterday, DayBefore
            // Loop 1: Today -> Clean -> Streak 1
            // Loop 2: Yesterday -> Dirty -> Break!
            // Result: 1
            expect(getViceResistanceStreak(habits, loginHistory)).toBe(1);
        });

        it('ignores new vices (< 3 days old)', () => {
            const habits = [{
                type: 'vice',
                createdAt: new Date().toISOString(), // New
                history: []
            }];
            expect(getViceResistanceStreak(habits, loginHistory)).toBe(0);
        });
    });
});
