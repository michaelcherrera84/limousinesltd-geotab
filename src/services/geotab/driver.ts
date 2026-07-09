import { getApi } from '@/auth/api';
import { geotabGroup } from '@/services/geotab/group.ts';
import { type Driver } from '@/services/geotab/types.ts';

interface GeotabDriver {
    getById(id: string): Promise<Driver>;
    getByName(name: string): Promise<Driver>;
    getAll(): Promise<Driver[]>;
    getTransfer(): Promise<Driver[]>;
}

export const geotabDriver: GeotabDriver = {
    async getById(id: string): Promise<Driver> {
        const api = getApi();
        try {
            const [driver] = (await api.call('Get', {
                typeName: 'User',
                search: { id, driver: true },
            })) as Driver[];

            return driver;
        } catch (error) {
            console.error('Error fetching driver:', error);
            throw error;
        }
    },

    async getByName(name: string): Promise<Driver> {
        const api = getApi();
        try {
            const [driver] = (await api.call('Get', {
                typeName: 'User',
                search: { name, driver: true },
            })) as Driver[];

            return driver;
        } catch (error) {
            console.error('Error fetching driver:', error);
            throw error;
        }
    },

    async getAll(): Promise<Driver[]> {
        const api = getApi();
        try {
            return (await api.call('Get', {
                typeName: 'User',
                search: { driver: true },
            })) as Driver[];
        } catch (error) {
            console.error('Error fetching drivers:', error);
            throw error;
        }
    },

    async getTransfer(): Promise<Driver[]> {
        const api = getApi();
        try {
            const transferGroup = await geotabGroup.getByName('Transfer');
            return (await api.call('Get', {
                typeName: 'User',
                search: { driverGroups: [{ id: transferGroup.id }] },
            })) as Driver[];
        } catch (error) {
            console.error('Error fetching drivers:', error);
            throw error;
        }
    },
};
