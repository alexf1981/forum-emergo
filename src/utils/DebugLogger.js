export class DebugLogger {
    static LOG_KEY = 'emergo_debug_log';
    static MAX_LINES = 500;

    static log(category, message) {
        try {
            const timestamp = new Date().toISOString().split('T')[1].slice(0, -1); // HH:MM:SS.mmm
            const logLine = `[${timestamp}] [${category}] ${message}`;

            // Get existing logs
            const existing = DebugLogger.getLogs();
            existing.unshift(logLine); // Add to top

            // Trim
            if (existing.length > DebugLogger.MAX_LINES) {
                existing.length = DebugLogger.MAX_LINES;
            }

            // Save
            localStorage.setItem(DebugLogger.LOG_KEY, JSON.stringify(existing));

            // Also console for dev convenience
            console.log(`%c${category}`, 'color: #e67e22; font-weight: bold', message);
        } catch (e) {
            console.error("Logger Failed", e);
        }
    }

    static getLogs() {
        try {
            const item = localStorage.getItem(DebugLogger.LOG_KEY);
            return item ? JSON.parse(item) : [];
        } catch (e) {
            return ["Error reading logs"];
        }
    }

    static clear() {
        localStorage.removeItem(DebugLogger.LOG_KEY);
    }
}
