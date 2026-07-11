import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import DateSelection from '@/components/trip-details-report/date-selection.tsx';
import AssetSelection from '@/components/trip-details-report/asset-selection.tsx';
import DriverSelection from '@/components/trip-details-report/driver-selection.tsx';
import CategorySelection from '@/components/trip-details-report/category-selection.tsx';
import ReportTable from '@/components/trip-details-report/report-table.tsx';
import { geotabTrip } from '@/services/geotab/trip.ts';
import { geotabDevice } from '@/services/geotab/device.ts';
import { geotabDriver } from '@/services/geotab/driver.ts';
import { geotabTripCategorization } from '@/services/geotab/trip-categorization.ts';
import { geotabTripAnnotation } from '@/services/geotab/trip-annotation.ts';
import { geotabAddress } from '@/services/geotab/address.ts';
import type { Device, Coordinate, Zone, ZoneType } from '@/services/geotab/types.ts';
import { geotabZone } from '@/services/geotab/zone.ts';
import { geotabZoneType } from '@/services/geotab/zone-type.ts';
import { ChevronLeft } from 'lucide-react';
import { type Data } from '@/components/trip-details-report/report-types.ts';
import { formatDuration } from '@/utils/duration.ts';

export const Route = createFileRoute('/trip-details-report')({
    head: () => ({
        meta: [
            { title: 'Reports | Trip Details Report' },
            {
                name: 'Trip Details Report',
                content:
                    'Detailed trips report including the driver, trip categorization, visited zones, distance, time,' +
                    ' and Quickbooks customer name.',
            },
        ],
    }),
    component: TripDetailsReport,
});

function TripDetailsReport() {
    const [selectedDate, setSelectedDate] = useState<string>('Today');
    const [dateRange, setDateRange] = useState<Date[]>(() => {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setDate(end.getDate() + 1);
        return [start, end];
    });
    const [selectedAssets, setSelectedAssets] = useState<string[]>(['All Transfer']);
    const [selectedDrivers, setSelectedDrivers] = useState<string[]>(['All Transfer']);
    const [selectedCategories, setSelectedCategories] = useState<string[]>(['All']);
    const [selectedTrips, setSelectedTrips] = useState<Data[]>([]);
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);

    /**
     * Resolves and retrieves the location details for a given geographic point.
     *
     * This function uses the provided coordinate point to identify the corresponding address
     * and additional metadata associated with the location, such as zones and zone types. If
     * no point is supplied, or if no address or zone data can be resolved, default values will
     * be returned.
     *
     * @param {Coordinate} [point] - The geographic coordinate (latitude/longitude) to resolve.
     *                               If omitted, default location details will be returned.
     * @returns {Promise<{text: string, customer: string, locationType: string[]}>} A promise that resolves with an object containing:
     * - `text` (string): The location's name (zone name or formatted address), or an empty string if unavailable.
     * - `customer` (string): The zone's comment, or an empty string if unavailable.
     * - `locationType` (string[]): An array of zone type names associated with the location, or an empty array if no zone types are found.
     */
    const resolveLocation = async (
        point?: Coordinate,
    ): Promise<{ text: string; customer: string; locationType: string[] }> => {
        if (!point) return { text: '', customer: '', locationType: [] as string[] };

        const [address] = await geotabAddress.getAddresses(point);
        if (!address) return { text: '', customer: '', locationType: [] as string[] };

        if (!address.zones?.length) return { text: address.formattedAddress ?? '', customer: '', locationType: [] };

        const zone = await geotabZone.getById((address.zones[0] as Zone).id);

        const locationType = await Promise.all(
            ((zone?.zoneTypes as ZoneType[]) ?? []).map(async (type) => {
                const zoneType = await geotabZoneType.getById(type.id ?? (type as unknown as string));
                return zoneType?.name ?? '';
            }),
        );

        return {
            text: zone?.name ?? address.formattedAddress ?? '',
            customer: zone?.comment ?? '',
            locationType,
        };
    };

    /**
     * Generates a report based on selected drivers, assets, categories, and date ranges.
     *
     * This function retrieves trip data, categorizes trips, and annotates them with additional
     * information such as start and end locations and customer details. It supports filtering by
     * drivers, assets, and categories, while also handling special "All Transfer" selections
     * for drivers and assets. The result is an enriched dataset of trips tailored to the user's
     * selections.
     *
     * The process involves:
     * - Fetching drivers and assets based on selection.
     * - Retrieving trips within the specified date range for the selected drivers.
     * - Filtering trips based on selected assets and categories.
     * - Annotating trips with categories and annotations.
     * - Identifying start and end locations, along with customer and location type details.
     * - Preparing the finalized dataset to be used in the report.
     *
     * If no trips are found for the selected filters, the function will display appropriate alerts
     * and terminate early.
     *
     * Note: This function internally handles error scenarios and resets the generating report
     * state (`isGeneratingReport`) upon completion or failure.
     *
     * @async
     * @function
     */
    const handleGenerateReport = async () => {
        setIsGeneratingReport(true);
        try {
            const driverIds = selectedDrivers.includes('All Transfer')
                ? (await geotabDriver.getTransfer()).map((d) => d.id)
                : selectedDrivers;

            const assetIds = selectedAssets.includes('All Transfer')
                ? (await geotabDevice.getAllTransfer()).map((a) => a.id)
                : selectedAssets;

            const driversTrips = await Promise.all(
                driverIds.map(async (driverId) => {
                    const [trips, driver] = await Promise.all([
                        geotabTrip.getByDriverAndDateRange(driverId, dateRange[0], dateRange[1]),
                        geotabDriver.getById(driverId),
                    ]);

                    // This is necessary because be drivers may switch vehicles. The stopDuration coming from Geotab
                    // is based on the vehicle, but a driver could potentially begin a new trip in a new vehicle.
                    // The actual stop time for each trip is the time between one trip's stop and the next trip's start.
                    // The last trip in the list for each driver should not have a stop, because the next start
                    // would be unknown in this list.
                    for (let i = 0; i < trips.length; i++) {
                        const current = trips[i];
                        const next = trips[i + 1];

                        if (!next) {
                            current.stopDuration = '';
                            continue;
                        }

                        const duration = new Date(next.start).getTime() - new Date(current.stop).getTime();
                        current.stopDuration = duration > 0 ? formatDuration(Math.floor(duration / 1000)) : '';
                    }

                    return await Promise.all(
                        trips.map(async (trip, index) => ({
                            ...trip,
                            driverName:
                                driver?.firstName && driver.lastName
                                    ? driver.firstName + ' ' + driver.lastName
                                    : 'Unknown Driver',
                            startPoint:
                                index > 0
                                    ? trips[index - 1].stopPoint
                                    : (await geotabTrip.getPrevious(trips[0]))?.stopPoint,
                        })),
                    );
                }),
            );

            const tripsByDriver = driversTrips.flat();
            if (tripsByDriver.length === 0) {
                alert('No trips found for the selected drivers and date range.');
                setIsGeneratingReport(false);
                return;
            }

            const tripsByDriverAndAsset = tripsByDriver.filter((trip) => assetIds.includes((trip.device as Device).id));
            if (tripsByDriverAndAsset.length === 0) {
                alert('No trips found for the selected assets, drivers, and date range.');
                setIsGeneratingReport(false);
                return;
            }

            const tripsWithCategory = await Promise.all(
                tripsByDriverAndAsset.map(async (trip) => ({
                    ...trip,
                    category: (await geotabTripCategorization.getByTrip(trip)) ?? '',
                })),
            );

            const selectedTrips = selectedCategories.includes('All')
                ? tripsWithCategory
                : tripsWithCategory.filter((trip) => selectedCategories.includes(trip.category));

            const tripsWithAnnotations = await Promise.all(
                selectedTrips.map(async (trip) => ({
                    ...trip,
                    annotation: (await geotabTripAnnotation.getByTrip(trip))?.text ?? '',
                })),
            );

            const previous = await geotabTrip.getPrevious(tripsWithAnnotations[0]);
            tripsWithAnnotations[0].startPoint = previous?.stopPoint;

            const tripsWithStartLocation = await Promise.all(
                tripsWithAnnotations.map(async (trip) => {
                    const location = await resolveLocation(trip.startPoint as Coordinate);
                    return {
                        ...trip,
                        startLocation: location.text,
                    };
                }),
            );

            const tripsWithEndLocation = await Promise.all(
                tripsWithStartLocation.map(async (trip) => {
                    const location = await resolveLocation(trip.stopPoint as Coordinate);
                    return {
                        ...trip,
                        endLocation: location.text,
                        customer: location.customer,
                        locationType: location.locationType,
                    };
                }),
            );

            setSelectedTrips(tripsWithEndLocation);
        } catch (error) {
            alert('An error occurred while generating the report.');
        }
        setIsGeneratingReport(false);
    };

    return (
        <section className="flex w-full flex-col">
            <main className="w-fit border-(--border-primary)">
                <Link
                    to="/"
                    className="mx-6 my-2 flex w-fit items-center rounded-md py-1 pr-3 pl-1 text-(--button-primary)
                        hover:bg-gray-100"
                >
                    <ChevronLeft />
                    Back
                </Link>
                <div className="flex gap-8 p-6">
                    <DateSelection
                        selectedDate={selectedDate}
                        setSelectedDate={setSelectedDate}
                        setDateRange={setDateRange}
                    />
                    <AssetSelection selectedAssets={selectedAssets} setSelectedAssets={setSelectedAssets} />
                    <DriverSelection selectedDrivers={selectedDrivers} setSelectedDrivers={setSelectedDrivers} />
                    <CategorySelection
                        selectedCategories={selectedCategories}
                        setSelectedCategories={setSelectedCategories}
                    />
                    <button
                        className="btn-primary h-fit px-4! text-nowrap shadow"
                        onClick={handleGenerateReport}
                        disabled={isGeneratingReport}
                    >
                        {isGeneratingReport ? 'Generating Report' : 'Generate Report'}
                    </button>
                </div>
                <div className="p-6">
                    <ReportTable data={selectedTrips} />
                </div>
            </main>
        </section>
    );
}
