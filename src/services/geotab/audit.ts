import { getApi } from '@/auth/api.ts';
import { type Audit } from '@/services/geotab/types.ts'

interface GeotabAudit {
    getByNameUserAndDate(name: string, userName: string, fromDate: string): Promise<Audit[]>;
}

export const geotabAudit: GeotabAudit = {
    async getByNameUserAndDate(name: string, userName: string, fromDate: string): Promise<Audit[]> {
        const api = getApi();
        try {
            return (await api.call('Get', {
                typeName: 'Audit',
                search: {
                    name,
                    userName,
                    fromDate,
                },
            })) as Audit[];
        } catch (error) {
            console.error('Error fetching audit:', error);
            throw error;
        }
    },
};
