import { getApi } from '@/auth/api.ts';
import { geotabAddress } from '@/services/geotab/address.ts';
import { type Coordinate, type Zone } from '@/services/geotab/types.ts';

interface GeotabZone {
    getById(id: string): Promise<Zone>;
    getByCoordinate(coordinate: Coordinate): Promise<Zone | undefined>;
    getAll(): Promise<Zone[]>;
}

export const geotabZone: GeotabZone = {
    async getById(id: string): Promise<Zone> {
        const api = getApi();
        try {
            const [zone] = (await api.call('Get', {
                typeName: 'Zone',
                search: { id },
            })) as Zone[];
            return zone;
        } catch (error) {
            console.error('Error fetching zone:', error);
            throw error;
        }
    },

    async getByCoordinate(coordinate: Coordinate): Promise<Zone | undefined> {
        try {
            const [address] = await geotabAddress.getAddresses(coordinate);
            if (!address.zones) return undefined;
            const [zone] = address.zones as Zone[];
            return zone;
        } catch (error) {
            console.error('Error fetching zone:', error);
            throw error;
        }
    },

    async getAll(): Promise<Zone[]> {
        const api = getApi();
        try {
            return (await api.call('Get', {
                typeName: 'Zone',
            })) as Zone[];
        } catch (error) {
            console.error('Error fetching zones:', error);
            throw error;
        }
    },
};
