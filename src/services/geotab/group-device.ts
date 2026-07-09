import { getApi } from '@/auth/api.ts';
import { type Device, type Group } from '@/services/geotab/types.ts';

type GroupDevice = {
    id: string;
    from: string;
    to: string;
    group: Partial<Group>;
    linkedEntity: Partial<Device>;
};

interface GeotabGroupDevice {
    getByDateRangeAndDevice(fromDate: string, toDate: string, deviceId: string): Promise<GroupDevice>;
}

export const geotabGroupDevice: GeotabGroupDevice = {
    async getByDateRangeAndDevice(fromDate: string, toDate: string, deviceId: string): Promise<GroupDevice> {
        const api = getApi();
        try {
            const groupDevices = (await api.call('Get', {
                typeName: 'GroupDevice',
                search: {
                    fromDate,
                    toDate,
                    deviceSearch: {
                        id: deviceId,
                    },
                },
            })) as GroupDevice[];

            const [filteredGroupDevices] = groupDevices.filter(
                (groupDevice) => groupDevice.from === fromDate && groupDevice.to === toDate,
            );
            return filteredGroupDevices;
        } catch (error) {
            console.error('Error fetching group device:', error);
            throw error;
        }
    },
};
