import GeotabApi from 'mg-api-js';

let api: GeotabApi<Partial<GeotabApi.Options> | undefined> | null = null;
const listeners = new Set<() => void>();

/**
 * Sets the API instance to be used.
 *
 * @param {GeotabApi<Partial<GeotabApi.Options> | undefined>} newApi - The new API instance to set.
 * @return {void} Does not return a value.
 */
export function setApi(newApi: GeotabApi<Partial<GeotabApi.Options> | undefined>): void {
    api = newApi;
    listeners.forEach((listener) => listener());
}

/**
 * Retrieves the initialized API instance.
 * Throws an error if the API is not initialized.
 *
 * @return {GeotabApi<Partial<GeotabApi.Options> | undefined>} The initialized API instance.
 * @throws {Error} If the API has not been initialized.
 */
export function getApi(): GeotabApi<Partial<GeotabApi.Options> | undefined> {
    if (!api) {
        throw new Error('API not initialized');
    }

    return api;
}

/**
 * Checks if the Geotab API instance is available.
 *
 * @return {boolean} Returns true if the Geotab API instance is not null, otherwise false.
 */
export function hasGeotabApi(): boolean {
    if (api === null) {
        const credentials = localStorage.getItem('geotabAPI_credentials');
        const server = localStorage.getItem('geotabAPI_server');
        if (credentials && server) {
            const { database, userName, sessionId } = JSON.parse(credentials);
            const api = new GeotabApi({
                credentials: {
                    database,
                    userName,
                    sessionId,
                },
                path: server,
            });
            setApi(api);
        }
    }

    return api !== null;
}

/**
 * Subscribes a listener function to the API. The listener will be called when the associated event occurs.
 *
 * @param {Function} listener - A callback function to be executed when the event is triggered.
 * @return {() => void} A function to unsubscribe the provided listener.
 */
export function subscribeToApi(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}
