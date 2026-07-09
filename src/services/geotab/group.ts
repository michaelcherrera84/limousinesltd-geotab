import { getApi } from '@/auth/api.ts';
import { type Group } from '@/services/geotab/types.ts';

interface GeotabGroup {
    getAll(): Promise<Group[]>;
    getByName(name: string): Promise<Group>;
}

export const geotabGroup: GeotabGroup = {
    async getAll(): Promise<Group[]> {
        const api = getApi();
        try {
            return (await api.call('Get', {
                typeName: 'Group',
            })) as Group[];
        } catch (error) {
            console.error('Error fetching groups:', error);
            throw error;
        }
    },

    async getByName(name: string): Promise<Group> {
        const api = getApi();
        try {
            const [group] = (await api.call('Get', {
                typeName: 'Group',
                search: { name },
            })) as Group[];
            return group;
        } catch (error) {
            console.error('Error fetching group:', error);
            throw error;
        }
    },
};
