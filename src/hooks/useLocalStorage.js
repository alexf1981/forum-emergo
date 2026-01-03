import { useState, useEffect } from 'react';

/**
 * A hook that syncs state to localStorage.
 * @param {string} key The localStorage key
 * @param {any} initialValue The initial value if key doesn't exist
 * @returns [storedValue, setValue]
 */
export function useLocalStorage(key, initialValue) {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            if (item === "undefined" || item === null) return initialValue;
            return JSON.parse(item);
        } catch (error) {
            console.error(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    });

    useEffect(() => {
        try {
            window.localStorage.setItem(key, JSON.stringify(storedValue));
        } catch (error) {
            console.error(error);
        }
    }, [key, storedValue]);

    return [storedValue, setStoredValue];
}
