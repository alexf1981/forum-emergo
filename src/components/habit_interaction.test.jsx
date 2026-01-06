
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import React from 'react';
import HabitItem from './HabitItem';

describe('HabitItem History Interaction', () => {
    // ... setup ...

    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(today);
        vi.clearAllMocks();
        // Stub global prompt to avoid crash
        vi.stubGlobal('prompt', vi.fn(() => '1'));
    });

    afterEach(() => {
        cleanup(); // Explicit cleanup
        vi.useRealTimers();
        vi.unstubAllGlobals();
    });
    const mockSetCompletion = vi.fn();
    const mockToggle = vi.fn();
    const mockEdit = vi.fn();
    const mockDelete = vi.fn();
    const mockPlaySfx = vi.fn();
    const mockCheckLevelUp = vi.fn();

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Create a past date for history testing
    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - 5);
    const pastDateStr = pastDate.toISOString().split('T')[0];

    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(today);
        vi.clearAllMocks();
        // Stub global prompt to avoid crash
        vi.stubGlobal('prompt', vi.fn(() => '1'));
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllGlobals();
    });

    const defaultSettings = {
        soundEnabled: true,
        theme: 'light'
    };

    const renderHabit = (history = [], loginHistory = [], type = 'virtue', isRecurring = false) => {
        const habit = {
            id: 'h1',
            text: 'Test Habit',
            type: type,
            frequency: isRecurring ? 'daily' : 'once',
            history: history,
            bucket: 'misc', // Ensure isRecurring fallback is false
            recurring: isRecurring // Explicitly set recurrence
        };

        return render(
            <HabitItem
                habit={habit}
                colType={type}
                onToggle={mockToggle}
                onSetCompletion={mockSetCompletion}
                onEdit={mockEdit}
                onDelete={mockDelete}
                settings={defaultSettings}
                checkLevelUp={mockCheckLevelUp}
                playSfx={mockPlaySfx}
                loginHistory={loginHistory}
                t={(k) => k}
            />
        );
    };

    const openMenu = () => {
        // Handle responsive: multiple menu buttons might be rendered
        const menuBtns = screen.getAllByTitle('Menu');
        // Click the last one found (often the desktop/visible one in list)
        fireEvent.click(menuBtns[menuBtns.length - 1]);
    };

    const getCell = (dateStr) => {
        const cells = screen.getAllByTitle(dateStr);
        return cells[0];
    };

    it('cycles Grey -> Green -> Red -> Grey', () => {
        renderHabit([], []);
        openMenu();
        const targetCell = getCell(pastDateStr);

        fireEvent.click(targetCell);
        expect(mockSetCompletion).toHaveBeenCalledWith('h1', pastDateStr, 1);
    });

    it('cycles Green -> Red', () => {
        renderHabit([pastDateStr], []);
        openMenu();
        const targetCell = getCell(pastDateStr);

        fireEvent.click(targetCell);
        expect(mockSetCompletion).toHaveBeenCalledWith('h1', pastDateStr, 0);
    });

    it('cycles Red -> Grey (Exempt)', () => {
        renderHabit([`!${pastDateStr}`], []);
        openMenu();
        const targetCell = getCell(pastDateStr);

        fireEvent.click(targetCell);
        expect(mockSetCompletion).toHaveBeenCalledWith('h1', pastDateStr, -1);
    });

    it('cycles Red (Implicit) -> Grey (Exempt)', () => {
        renderHabit([], [pastDateStr]);
        openMenu();
        const targetCell = getCell(pastDateStr);

        fireEvent.click(targetCell);
        expect(mockSetCompletion).toHaveBeenCalledWith('h1', pastDateStr, -1);
    });

    it('cycles Exempt -> Green', () => {
        renderHabit([`-${pastDateStr}`], []);
        openMenu();
        const targetCell = getCell(pastDateStr);

        fireEvent.click(targetCell);
        expect(mockSetCompletion).toHaveBeenCalledWith('h1', pastDateStr, 1);
    });

    it('prevents editing Today', () => {
        renderHabit([], []);
        openMenu();
        const todayCell = getCell(todayStr);

        fireEvent.click(todayCell);
        expect(mockSetCompletion).not.toHaveBeenCalled();
    });

    it('calculates success rate correctly (ignoring Grey days)', () => {
        // Setup dates:
        // 1. pastDate (5 days ago)
        // 2. anotherDate (6 days ago)
        const anotherDate = new Date(today);
        anotherDate.setDate(today.getDate() - 6);
        const anotherDateStr = anotherDate.toISOString().split('T')[0];

        // Scenario:
        // - pastDate: Green (Done)
        // - anotherDate: Red (Logged In but not Done)
        // - All other days (26): Grey (No login, no history, so ignored)
        // - Total Valid: 2. Success: 1 (pastDate). Rate: 50%.

        renderHabit([pastDateStr], [anotherDateStr, pastDateStr]);
        openMenu();

        // Check for text "success_rate_4w: 50%" (as t returns key)
        // getByText throws if not found, so simply calling it is sufficient assertion for existence
        screen.getByText(/success_rate_4w/);
        screen.getByText('50%');
    });
});
