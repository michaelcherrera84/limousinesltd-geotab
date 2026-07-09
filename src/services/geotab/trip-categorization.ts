import { geotabGroupDevice } from '@/services/geotab/group-device.ts';
import { type Trip } from '@/services/geotab/types.ts';

type Device = {
    id: string;
};

interface GeotabTripCategorization {
    getByTrip(trip: Trip): Promise<string>;
}

export const geotabTripCategorization: GeotabTripCategorization = {
    async getByTrip(trip: Trip): Promise<string> {
        try {
            const { start, stop, device } = trip;

            const groupDevice = await geotabGroupDevice.getByDateRangeAndDevice(start, stop, (device as Device).id);
            if (!groupDevice) {
                return 'Uncategorized';
            }

            if (groupDevice.group.id?.includes('Business')) return 'Business';
            if (groupDevice.group.id?.includes('Personal')) return 'Personal';
            return 'Uncategorized';
        } catch (error) {
            console.error('Error fetching trip categorization:', error);
            throw error;
        }
    },
};

// function parseComment(comment: string) {
//     const activeFrom = comment.match(/ActiveFrom:\s([^,]+)/)?.[1];
//     const activeTo = comment.match(/ActiveTo:\s([^,]+)/)?.[1];
//     const name = comment.match(/Name:\s([^)]+)/)?.[1] || '';
//     return { activeFrom, activeTo, name };
// }
