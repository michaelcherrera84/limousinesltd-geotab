import GeotabApi from 'mg-api-js';
import { loadSession, saveSession } from './session';
import { setApi } from './api';

let connected = false;

/**
 * Establishes a connection with the Geotab API. The method supports three modes
 * of connection: using an existing session, embedded mode for MyGeotab,
 * or a developer mode requiring manual login. On successful connection,
 * it sets the API instance for further use and saves the associated session details.
 *
 * @return {Promise<void>} A promise that resolves when the connection process completes successfully.
 */
export async function geotabConnect(): Promise<void> {
    if (connected) return;
    connected = true;

    const isEmbedded = window.self !== window.top;

    // -----------------------------
    // 1. IF SESSION EXISTS (DEV or reload)
    // -----------------------------
    const existing = loadSession();

    if (existing) {
        const api = new GeotabApi({
            credentials: {
                database: existing.database,
                userName: existing.userName,
                sessionId: existing.sessionId,
            },

            path: existing.server,
        });

        setApi(api);
        return;
    }

    // -----------------------------
    // 2. EMBEDDED MODE (MyGeotab)
    // -----------------------------
    if (isEmbedded) {
        const session = await waitForGeotabMessage();
        const api = new GeotabApi({
            credentials: session.session,
            path: session.server,
        });

        setApi(api);

        saveSession({
            database: session.session.database,
            userName: session.session.userName,
            sessionId: session.session.sessionId,
            server: session.server,
        });

        return;
    }

    throw new Error('No session found');
}

/**
 * Listens for a message event of type 'GEOTAB_SESSION' and resolves with the event data when received.
 *
 * @return {Promise<any>} A promise that resolves with the data of the 'GEOTAB_SESSION' message event.
 */
function waitForGeotabMessage(): Promise<any> {
    return new Promise((resolve) => {
        const handler = (event: MessageEvent) => {
            if (event.data?.type === 'GEOTAB_SESSION') {
                window.removeEventListener('message', handler);
                resolve(event.data);
            }
        };

        window.addEventListener('message', handler);
    });
}
