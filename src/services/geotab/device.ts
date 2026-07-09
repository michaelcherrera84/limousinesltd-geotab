import { getApi } from '@/auth/api.ts';
import { geotabGroup } from '@/services/geotab/group.ts';
import { type Device } from '@/services/geotab/types.ts';

interface GeotabDevice {
    getAll(): Promise<Device[]>;
    getAllTransfer(): Promise<Device[]>;
}

export const geotabDevice: GeotabDevice = {
    async getAllTransfer(): Promise<Device[]> {
        const api = getApi();
        try {
            const transferGroup = await geotabGroup.getByName('Transfer');

            return (await api.call('Get', {
                typeName: 'Device',
                search: {
                    groups: [{ id: transferGroup.id }],
                },
            })) as Device[];
        } catch (error) {
            console.error('Error fetching devices:', error);
            throw error;
        }
    },

    async getAll(): Promise<Device[]> {
        const api = getApi();
        try {
            return await api.call('Get', {
                typeName: 'Device',
            }) as Device[];
        } catch (error) {
            console.error('Error fetching devices:', error);
            throw error;
        }
    }
};
