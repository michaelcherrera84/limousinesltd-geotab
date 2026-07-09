export interface GeotabSession {
    server: string;
    database: string;
    sessionId: string;
    userName: string;
}

const KEY = 'geotab-session';

/**
 * Saves the given session object to local storage.
 *
 * @param {GeotabSession} session - The session object to be saved.
 * @return {void} This function does not return a value.
 */
export function saveSession(session: GeotabSession): void {
    localStorage.setItem(KEY, JSON.stringify(session));
}

/**
 * Loads a Geotab session from local storage.
 *
 * This method retrieves the session data stored in the browser's local storage under a specific key.
 * If the session data is invalid or cannot be parsed, it removes the invalid data and returns null.
 *
 * @return {GeotabSession | null} The parsed Geotab session object if it exists and is valid; otherwise, null.
 */
export function loadSession(): GeotabSession | null {
    const raw = localStorage.getItem(KEY);

    if (!raw) return null;

    try {
        return JSON.parse(raw);
    } catch {
        localStorage.removeItem(KEY);
        return null;
    }
}

/**
 * Clears the current user session by removing the session data from local storage.
 *
 * @return {void} This method does not return a value.
 */
export function clearSession(): void {
    localStorage.removeItem(KEY);
}
