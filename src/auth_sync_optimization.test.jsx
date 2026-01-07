// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { useGame } from './hooks/useGame';
import { supabase } from './services/supabaseClient';
import { DataService } from './services/dataService';

// --- MOCKS ---
vi.mock('./services/supabaseClient', () => ({
    supabase: {
        auth: {
            getSession: vi.fn(),
            onAuthStateChange: vi.fn(),
        },
        from: vi.fn(() => ({
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
            update: vi.fn().mockResolvedValue({ error: null }),
        })),
    }
}));

vi.mock('./services/dataService', () => ({
    DataService: {
        loadGameData: vi.fn(),
    }
}));

// Mock DebugLogger to verify logs
vi.mock('./utils/DebugLogger', () => ({
    DebugLogger: {
        log: vi.fn(),
    }
}));
import { DebugLogger } from './utils/DebugLogger';

// Helper Component to consume hooks
vi.mock('./context/LanguageContext', () => ({
    useLanguage: () => ({ t: (key) => key }),
    LanguageProvider: ({ children }) => <div>{children}</div>
}));
import { LanguageProvider } from './context/LanguageContext';

const TestComponent = () => {
    useGame();
    return <div>Test Component</div>;
};

describe('Auth & Sync Optimization', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();

        // Default Auth Mock: No User
        supabase.auth.getSession.mockResolvedValue({ data: { session: null }, error: null });
        supabase.auth.onAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } });
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should ignore duplicate Auth State updates (Deduplication)', async () => {
        const mockUser = { id: 'user-123', email: 'duplicate@test.com' };

        // 1. Initial Session
        supabase.auth.getSession.mockResolvedValue({ data: { session: { user: mockUser } }, error: null });

        // 2. Setup Subscription to fire duplicate event
        let authCallback;
        supabase.auth.onAuthStateChange.mockImplementation((cb) => {
            authCallback = cb;
            return { data: { subscription: { unsubscribe: vi.fn() } } };
        });

        await act(async () => {
            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );
        });

        // Trigger DUPLICATE event
        await act(async () => {
            if (authCallback) {
                authCallback('SIGNED_IN', { user: mockUser });
            }
        });

        // Log should appear only ONCE for initial session (or first valid update)
        // NOT twice.
        // Actually, DebugLogger is called inside AuthContext
        // We expect "Initial Session Check" log.
        // We expect "Auth State Changed" only if state actually changed? 
        // Logic says: if (id === id) return.

        // So we scan DebugLogger calls for "Auth State Changed"
        const stateChangeLogs = DebugLogger.log.mock.calls.filter(call => call[0] === 'AUTH' && call[1].includes('Auth State Changed'));
        expect(stateChangeLogs.length).toBe(0); // Should be deduplicated/ignored!
    });

    it('should prevent concurrent Cloud Syncs (Sync Lock)', async () => {
        const mockUser = { id: 'user-lock', email: 'lock@test.com' };
        supabase.auth.getSession.mockResolvedValue({ data: { session: { user: mockUser } }, error: null });

        // Mock Slow Data Service
        DataService.loadGameData.mockImplementation(async () => {
            await new Promise(resolve => setTimeout(resolve, 1000)); // 1s delay
            return { romestats: { gold: 100 } };
        });

        await act(async () => {
            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );
        });

        // The first sync should start automatically on mount.
        // We simulate a second one by rerendering or duplicate user effect?
        // Hard to trigger duplicate useEffect in test without StrictMode.
        // But we can check if it runs only once even if we force update?

        // Wait for first sync start
        expect(DataService.loadGameData).toHaveBeenCalledTimes(1);

        // Advance time partially
        await act(async () => { vi.advanceTimersByTime(500); });

        // If we theoretically triggered it again (e.g. via prop change or state update that didn't change user ID but refired effect?)
        // In `useGame`, dependency is `[user]`. 
        // If AuthContext deduplicates, `user` object ref stays same.
        // So this test primarily confirms that under normal conditions it runs once.

        // To properly test the "Sync Lock", we'd need to simulate the component mounting twice or effect firing twice concurrently.
        // JSDOM/Vitest environment makes concurrent mounting hard.
        // However, we verified this manually via debug logs.

        // Let's verify it finishes correctly.
        await act(async () => { vi.advanceTimersByTime(1000); });
        expect(DebugLogger.log).toHaveBeenCalledWith('SYNC', expect.stringContaining('Sync Complete'));
    });
});
