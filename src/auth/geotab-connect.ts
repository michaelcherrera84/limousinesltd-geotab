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

    // -----------------------------
    // 3. DEV MODE (manual login)
    // -----------------------------
    const api = await devLoginFlow();

    setApi(api);

    const { credentials } = await api.getSession();

    if (!credentials.sessionId) throw new Error('Failed to get session ID');

    saveSession({
        database: credentials.database,
        userName: credentials.userName,
        sessionId: credentials.sessionId,
        server: import.meta.env.VITE_GEOTAB_SERVER,
    });
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

/**
 * Handles the developer login flow for authenticating with the Geotab API.
 *
 * This method initializes a Geotab API instance using credentials and server details
 * provided through environment variables, performs authentication, and returns
 * the authenticated API instance for further use.
 *
 * @return {Promise<GeotabApi<Partial<GeotabApi.Options>>>} A promise that resolves to an authenticated Geotab API instance.
 */
async function devLoginFlow(): Promise<GeotabApi<Partial<GeotabApi.Options>>> {
    const api = new GeotabApi({
        credentials: {
            database: import.meta.env.VITE_GEOTAB_DATABASE,
            userName: import.meta.env.VITE_GEOTAB_USER,
            password: import.meta.env.VITE_GEOTAB_PASSWORD,
        },
        path: import.meta.env.VITE_GEOTAB_SERVER,
    });

    await api.authenticate();

    return api;
}
