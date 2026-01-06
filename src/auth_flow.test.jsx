
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import React from 'react';
import App from './components/App';
import SettingsModal from './components/SettingsModal';

// Mock Modules
vi.mock('./services/supabaseClient', () => ({
    supabase: {
        auth: {
            getSession: vi.fn(),
            onAuthStateChange: vi.fn(),
            signUp: vi.fn(),
            signInWithPassword: vi.fn(),
            signOut: vi.fn(),
            getUser: vi.fn(),
        },
        from: vi.fn(),
    }
}));

// Mock DataService to control "isNewUser" logic
vi.mock('./services/dataService', () => ({
    DataService: {
        loadGameData: vi.fn(),
        saveGameData: vi.fn().mockResolvedValue(true),
    }
}));


// IMPORTANT: We need to mock LocalStorage because useGame uses it
const localStorageMock = (function () {
    let store = {};
    return {
        getItem: function (key) {
            return store[key] || null;
        },
        setItem: function (key, value) {
            store[key] = String(value);
        },
        clear: function () {
            store = {};
        },
        removeItem: function (key) {
            delete store[key];
        }
    };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Suppress console.error for expected failures (like Network Down)
const originalConsoleError = console.error;
beforeEach(() => {
    console.error = vi.fn();
});
afterEach(() => {
    console.error = originalConsoleError;
});

import { supabase } from './services/supabaseClient';
import { DataService } from './services/dataService';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';


describe('Authentication & Data Flow', () => {

    beforeEach(() => {
        vi.useFakeTimers();
        vi.clearAllMocks();
        localStorage.clear();

        // Default Supabase Mocks (No Auth)
        supabase.auth.getSession.mockResolvedValue({ data: { session: null }, error: null });
        supabase.auth.onAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } });

        // Supabase DB Mocks
        const mockSelect = vi.fn().mockReturnThis();
        const mockEq = vi.fn().mockReturnThis();
        const mockSingle = vi.fn().mockResolvedValue({ data: null, error: null });

        supabase.from.mockReturnValue({
            select: mockSelect,
            eq: mockEq,
            single: mockSingle,
            update: vi.fn().mockResolvedValue({ error: null }),
            upsert: vi.fn().mockResolvedValue({ error: null }),
            then: vi.fn().mockResolvedValue({ error: null }),
        });
    });

    afterEach(() => {
        vi.useRealTimers();
        // Clear any timeouts
        vi.clearAllTimers();
    });

    it('Case 1: New Visitor (Local) -> Should get default habits', async () => {
        // No Auth, No Local Data, No "visited" flag

        await act(async () => {
            render(
                <AuthProvider>
                    <LanguageProvider>
                        <App />
                    </LanguageProvider>
                </AuthProvider>
            );
        });

        // The Welcome Modal should be visible
        // We simulate clicking "Play without account" to trigger seeding
        // Use getByRole to distinguish between the label text and the button text
        const playLocalBtn = screen.getByRole('button', { name: "Play without account" });
        fireEvent.click(playLocalBtn);

        // Advance timers to allow seeding effect to run
        await act(async () => { vi.advanceTimersByTime(2000); });

        // Check Local Storage for Defaults
        const habits = JSON.parse(localStorage.getItem('romehabits') || '[]');
        expect(habits.length).toBeGreaterThan(0);
        // Expect NO cloud save
        expect(DataService.saveGameData).not.toHaveBeenCalled();
    });

    it('Case 2: Returning Visitor (Local) -> Should load local data', async () => {
        // Setup existing local data
        // MUST include all required fields to avoid CityView crash (history, etc)
        const existingHabits = [{
            id: 999,
            text: "Existing Local Task",
            type: "virtue",
            completed: false,
            history: [],
            recurring: false
        }];
        localStorage.setItem('romehabits', JSON.stringify(existingHabits));
        // Mark as visited so we usually skip the modal? 
        // App logic: if (!hasVisited && !user) -> show modal.
        // But if we have data, we might want to skip modal manually or set 'rome_has_visited'.
        localStorage.setItem('rome_has_visited', 'true');

        await act(async () => {
            render(
                <AuthProvider>
                    <LanguageProvider>
                        <App />
                    </LanguageProvider>
                </AuthProvider>
            );
        });

        await act(async () => { vi.advanceTimersByTime(2000); });

        const habits = JSON.parse(localStorage.getItem('romehabits') || '[]');
        expect(habits.length).toBe(1);
        expect(habits[0].text).toBe("Existing Local Task");
        // No overwriting with defaults
        expect(DataService.saveGameData).not.toHaveBeenCalled();
    });

    it('Case 3: New Registration (Fresh) -> Should seed defaults and save to cloud', async () => {
        // Mock User Login
        const mockUser = { id: 'user-fresh', email: 'fresh@example.com' };
        supabase.auth.getSession.mockResolvedValue({ data: { session: { user: mockUser } }, error: null });

        // Cloud Empty
        DataService.loadGameData.mockResolvedValue(null);

        await act(async () => {
            render(
                <AuthProvider>
                    <LanguageProvider>
                        <App />
                    </LanguageProvider>
                </AuthProvider>
            );
        });

        await act(async () => { vi.advanceTimersByTime(2000); });

        // Check Local State (Seeded)
        const habits = JSON.parse(localStorage.getItem('romehabits') || '[]');
        expect(habits.length).toBeGreaterThan(0);

        // Check Cloud Save (Seeded Data)
        expect(DataService.saveGameData).toHaveBeenCalledTimes(1);
        const savedData = DataService.saveGameData.mock.calls[0][1];
        expect(savedData.romehabits.length).toBeGreaterThan(0);
    });

    it('Case 4: Migration (Local -> Account) -> Should upload local data to cloud', async () => {
        // Setup Local Data
        const localHabits = [{
            id: 888,
            text: "My Important Task",
            type: "todo",
            completed: false,
            history: [],
            recurring: false
        }];
        localStorage.setItem('romehabits', JSON.stringify(localHabits));

        // IMPORTANT: In migration scenario, we might be on page then login? 
        // Or coming back and logging in immediately. 
        // Logic: Login (User) + Cloud Empty (New Cloud Profile) -> Should keep local habits and save them.

        // Mock User Login
        const mockUser = { id: 'user-migrator', email: 'migrate@example.com' };
        supabase.auth.getSession.mockResolvedValue({ data: { session: { user: mockUser } }, error: null });

        // Cloud Empty (New Account)
        DataService.loadGameData.mockResolvedValue(null);

        await act(async () => {
            render(
                <AuthProvider>
                    <LanguageProvider>
                        <App />
                    </LanguageProvider>
                </AuthProvider>
            );
        });

        await act(async () => { vi.advanceTimersByTime(2000); });

        // Local data should persist (not be overwritten by defaults)
        const habits = JSON.parse(localStorage.getItem('romehabits') || '[]');
        expect(habits.length).toBe(1);
        expect(habits[0].text).toBe("My Important Task");

        // Cloud Save should contain local data
        expect(DataService.saveGameData).toHaveBeenCalledTimes(1);
        const savedData = DataService.saveGameData.mock.calls[0][1];
        expect(savedData.romehabits[0].text).toBe("My Important Task");

    });

    it('Case 5: Logout -> Should clear (sensitive) local storage', async () => {
        // Setup: Logged in
        const mockUser = { id: 'user-logout', email: 'leaver@example.com' };
        supabase.auth.getSession.mockResolvedValue({ data: { session: { user: mockUser } }, error: null });
        DataService.loadGameData.mockResolvedValue(null);

        // Pre-fill sensitive data
        localStorage.setItem('player_name', 'Secret User');
        localStorage.setItem('romehabits', JSON.stringify([{ id: 1, text: "Secret", type: 'virtue' }]));

        // Render SettingsModal directly to test logout logic isolation
        // NOTE: We wrap in providers because SettingsModal uses AuthContext/LanguageContext
        await act(async () => {
            render(
                <AuthProvider>
                    <LanguageProvider>
                        <SettingsModal
                            onClose={vi.fn()}
                            onExport={vi.fn()}
                            onImport={vi.fn()}
                            actions={{}}
                            useRomanNumerals={false}
                            toggleRomanNumerals={vi.fn()}
                            onLogin={vi.fn()}
                        />
                    </LanguageProvider>
                </AuthProvider>
            );
        });

        // Find Logout Button (using translation key logic or partial text)
        // In translations.js: logout: "Logout", "Uitloggen", etc.
        // We are language agnostic or default 'en'? defaults to 'en'.
        const logoutBtn = screen.getByText(/Logout/i);
        fireEvent.click(logoutBtn);

        // Advance timers for async logout (Promise.race)
        await act(async () => { vi.advanceTimersByTime(3000); });

        // Assert Local Storage Cleared
        expect(localStorage.getItem('player_name')).toBeNull();
        expect(localStorage.getItem('romehabits')).toBeNull();
    });

    it('Case 6: Network Error during Load -> Should NOT overwrite cloud with local (Safety)', async () => {
        const mockUser = { id: 'user-error', email: 'error@example.com' };
        supabase.auth.getSession.mockResolvedValue({ data: { session: { user: mockUser } }, error: null });

        // CRITICAL: Mock a failure!
        DataService.loadGameData.mockRejectedValue(new Error("Network Down"));

        // Pre-fill local storage with "Empty" or "Stale" data
        localStorage.setItem('romehabits', '[]');

        await act(async () => {
            render(
                <AuthProvider>
                    <LanguageProvider>
                        <App />
                    </LanguageProvider>
                </AuthProvider>
            );
        });

        // Fast forward time to trigger potential auto-save
        await act(async () => { vi.advanceTimersByTime(2000); });

        // Assert that SAVE was NOT called. 
        // If it WAS called, it means we overwrote the cloud with empty/stale data!
        expect(DataService.saveGameData).not.toHaveBeenCalled();
    });

    it('Case 7: Cloud vs Local Conflict -> Should favor Cloud data', async () => {
        // Setup: User has Cloud Data
        const mockUser = { id: 'user-conflict', email: 'conflict@example.com' };
        supabase.auth.getSession.mockResolvedValue({ data: { session: { user: mockUser } }, error: null });

        // Fix Mock Data for CityView safety: Include complete habit object
        const cloudHabits = [{
            id: 777,
            text: "Cloud Task",
            type: "virtue",
            completed: false,
            history: [],
            recurring: false,
            bucket: false
        }];
        DataService.loadGameData.mockResolvedValue({
            romehabits: cloudHabits,
            romestats: { gold: 500 }
        });

        // Setup: User ALSO has Local Data (different)
        const localHabits = [{
            id: 666,
            text: "Local Task",
            type: "vice",
            completed: false,
            history: [],
            recurring: false,
            bucket: false
        }];
        localStorage.setItem('romehabits', JSON.stringify(localHabits));

        await act(async () => {
            render(
                <AuthProvider>
                    <LanguageProvider>
                        <App />
                    </LanguageProvider>
                </AuthProvider>
            );
        });

        await act(async () => { vi.advanceTimersByTime(2000); });

        // In a conflict, Cloud wins.
        const stored = JSON.parse(localStorage.getItem('romehabits') || '[]');
        const hasCloud = stored.some(h => h.id === 777);
        const hasLocal = stored.some(h => h.id === 666);

        expect(hasCloud).toBe(true);
        expect(hasLocal).toBe(false);
    });

    it('Case 8: Language Sync -> Should switch to Profile Language', async () => {
        const mockUser = { id: 'user-lang', email: 'hola@example.com' };
        supabase.auth.getSession.mockResolvedValue({ data: { session: { user: mockUser } }, error: null });
        DataService.loadGameData.mockResolvedValue(null);

        // Mock Profile with Spanish
        supabase.from.mockReturnValue({
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: { language: 'es' }, error: null }),
            update: vi.fn().mockResolvedValue({ error: null }),
            upsert: vi.fn().mockResolvedValue({ error: null }),
            then: vi.fn().mockResolvedValue({ error: null }),
        });

        // Set Local to English
        localStorage.setItem('rome_language', 'en');

        await act(async () => {
            render(
                <AuthProvider>
                    <LanguageProvider>
                        <App />
                    </LanguageProvider>
                </AuthProvider>
            );
        });

        // Effect runs...
        await act(async () => { vi.advanceTimersByTime(1000); });

        // Expect LocalStorage to be updated to 'es'
        expect(localStorage.getItem('rome_language')).toBe('es');
    });

});

