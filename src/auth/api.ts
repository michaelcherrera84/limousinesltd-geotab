import GeotabApi from 'mg-api-js';

let api: GeotabApi<Partial<GeotabApi.Options> | undefined> | null = null;

/**
 * Sets the API instance to be used.
 *
 * @param {GeotabApi<Partial<GeotabApi.Options> | undefined>} newApi - The new API instance to set.
 * @return {void} Does not return a value.
 */
export function setApi(newApi: GeotabApi<Partial<GeotabApi.Options> | undefined>): void {
    api = newApi;
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
