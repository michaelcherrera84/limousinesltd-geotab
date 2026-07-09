import { getApi } from '@/auth/api.ts';
import { type Device, type Trip } from '@/services/geotab/types.ts';

type TripAnnotation = {
    id: string;
    dateTime: string;
    device: Device;
    text: string;
}

interface GeotabTripAnnotation {
    getById(id: string): Promise<TripAnnotation>;
    getByTrip(trip: Trip): Promise<TripAnnotation>;
}

export const geotabTripAnnotation: GeotabTripAnnotation = {
    async getById(id: string): Promise<TripAnnotation> {
        const api = getApi();
        try {
            const [annotation] = (await api.call('Get', {
                typeName: 'TripAnnotation',
                search: { id },
            })) as TripAnnotation[];

            return annotation;
        } catch (error) {
            console.error('Error fetching trip annotation:', error);
            throw error;
        }
    },

    async getByTrip(trip: Trip): Promise<TripAnnotation> {
        const api = getApi();
        const { start, stop, device } = trip;

        try {
            const [annotation] = (await  api.call('Get', {
                typeName: 'TripAnnotation',
                search: {
                    fromDate: start,
                    toDate: stop,
                    deviceSearch: {
                        id: (device as Device).id
                    }
                }
            })) as TripAnnotation[];

            return annotation;
        } catch (error) {
            console.error('Error fetching trip annotation:', error);
            throw error;
        }
    }
}
