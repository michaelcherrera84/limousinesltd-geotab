import { getApi } from '@/auth/api.ts';
import type { ReverseGeocodeAddress, Coordinate } from '@/services/geotab/types.ts';


export interface Address {
    getAddresses(coordinate: Coordinate): Promise<ReverseGeocodeAddress[]>;
}

export const geotabAddress: Address = {
    async getAddresses(coordinate: Coordinate) {
        const api = getApi();
        try {
            return (await api.call('GetAddresses', {
                coordinates: [coordinate],
            })) as ReverseGeocodeAddress[];
        } catch (error) {
            console.error('Error fetching addresses:', error);
            throw error;
        }
    },
};
