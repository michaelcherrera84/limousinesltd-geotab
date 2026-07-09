import { getApi } from '@/auth/api.ts';
import type { ZoneType } from '@/services/geotab/types.ts';

interface GeotabZoneType {
    getById(id: string): Promise<ZoneType>;
}

export const geotabZoneType: GeotabZoneType = {
    async getById(id: string): Promise<ZoneType> {
        const api = getApi();
        try {
            const [zoneType] = (await api.call('Get', {
                typeName: 'ZoneType',
                search: { id },
            })) as ZoneType[];
            return zoneType;
        } catch (error) {
            console.error('Error fetching zone type:', error);
            throw error;
        }
    },
};
