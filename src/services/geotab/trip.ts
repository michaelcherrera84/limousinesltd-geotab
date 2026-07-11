import { getApi } from '@/auth/api.ts';
import type { Device, Trip } from '@/services/geotab/types.ts';

interface GeotabTrip {
    getById(id: string): Promise<Trip>;
    getPrevious(currentTrip: Trip): Promise<Trip | undefined>;
    getByDateRange(fromDate: Date, toDate: Date): Promise<Trip[]>;
    getByDriverAndDateRange(driverId: string, fromDate: Date, toDate: Date): Promise<Trip[]>;
    getByDriverDateRangeAndDevice(driverId: string, fromDate: Date, toDate: Date, deviceId: string): Promise<Trip[]>;
}

export const geotabTrip: GeotabTrip = {
    async getById(id: string): Promise<Trip> {
        const api = getApi();
        try {
            const [trip] = (await api.call('Get', {
                typeName: 'Trip',
                search: { id },
            })) as Trip[];

            return trip;
        } catch (error) {
            console.error('Error fetching trip:', error);
            throw error;
        }
    },

    async getPrevious(currentTrip: Trip): Promise<Trip | undefined> {
        const api = getApi();
        try {
            const trips = (await api.call('Get', {
                typeName: 'Trip',
                search: {
                    fromDate: new Date(new Date(currentTrip.start).getTime() - 48 * 60 * 60 * 1000),
                    toDate: currentTrip.stop,
                    deviceSearch: {
                        id: (currentTrip.device as Device).id,
                    },
                },
            })) as Trip[];

            return trips.find((trip) => trip.nextTripStart === currentTrip.start);
        } catch (error) {
            console.error('Error fetching trip:', error);
            throw error;
        }
    },

    async getByDateRange(fromDate: Date, toDate: Date): Promise<Trip[]> {
        const api = getApi();
        try {
            return (await api.call('Get', {
                typeName: 'Trip',
                search: {
                    fromDate: fromDate.toISOString(),
                    toDate: toDate.toISOString(),
                    includeOverlappedTrips: true,
                },
            })) as Trip[];
        } catch (error) {
            console.error('Error fetching trips:', error);
            throw error;
        }
    },

    async getByDriverAndDateRange(driverId: string, fromDate: Date, toDate: Date): Promise<Trip[]> {
        const api = getApi();
        try {
            const trips = (await api.call('Get', {
                typeName: 'Trip',
                search: {
                    fromDate: fromDate.toISOString(),
                    toDate: toDate.toISOString(),
                    userSearch: {
                        id: driverId,
                    },
                    includeOverlappedTrips: true,
                },
            })) as Trip[];

            trips.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

            return trips;
        } catch (error) {
            console.error('Error fetching trips:', error);
            throw error;
        }
    },

    async getByDriverDateRangeAndDevice(
        driverId: string,
        fromDate: Date,
        toDate: Date,
        deviceId: string,
    ): Promise<Trip[]> {
        const api = getApi();
        try {
            return (await api.call('Get', {
                typeName: 'Trip',
                search: {
                    fromDate: fromDate.toISOString(),
                    toDate: toDate.toISOString(),
                    userSearch: {
                        id: driverId,
                    },
                    deviceSearch: {
                        id: deviceId,
                    },
                    includeOverlappedTrips: true,
                },
            })) as Trip[];
        } catch (error) {
            console.error('Error fetching trips:', error);
            throw error;
        }
    },
};
