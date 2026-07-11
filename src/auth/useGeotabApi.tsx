import { useEffect, useState } from 'react';
import { hasGeotabApi, subscribeToApi } from './api';

/**
 * A custom hook that checks for the presence of the Geotab API and updates its state reactively.
 *
 * @return {boolean} A boolean indicating whether the Geotab API is available.
 */
export function useGeotabApi(): boolean {
    const [hasApi, setHasApi] = useState(hasGeotabApi());

    useEffect(() => {
        return subscribeToApi(() => {
            setHasApi(hasGeotabApi());
        });
    }, []);

    return hasApi;
}
