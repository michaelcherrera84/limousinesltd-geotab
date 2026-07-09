import { createFileRoute } from '@tanstack/react-router';
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
import { geotabZoneType } from '#/services/geotab/zone-type.ts';

export const Route = createFileRoute('/reports/trip-details-report')({
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
    const [selectedTrips, setSelectedTrips] = useState<any[]>([]);
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);

    const handleGenerateReport = async () => {
        setIsGeneratingReport(true);
        try {
            let driverIds = selectedDrivers;
            if (selectedDrivers.includes('All Transfer')) {
                const drivers = await geotabDriver.getTransfer();
                driverIds = drivers.map((driver) => driver.id);
            }

            let assetIds = selectedAssets;
            if (selectedAssets.includes('All Transfer')) {
                const assets = await geotabDevice.getAllTransfer();
                assetIds = assets.map((asset) => asset.id);
            }

            const driversTrips = await Promise.all(
                driverIds.map(async (driverId) => {
                    const trips = await geotabTrip.getByDriverAndDateRange(driverId, dateRange[0], dateRange[1]);
                    const driver = await geotabDriver.getById(driverId);

                    return trips.map((trip, index) => ({
                        ...trip,
                        driverName:
                            driver?.firstName && driver.lastName
                                ? driver.firstName + ' ' + driver.lastName
                                : 'Unknown Driver',
                        startPoint: index > 0 ? trips[index - 1].stopPoint : undefined,
                    }));
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

            const categories = (
                await Promise.all(tripsByDriverAndAsset.map((trip) => geotabTripCategorization.getByTrip(trip)))
            ).filter((category): category is string => category !== undefined);

            const tripsWithCategory = tripsByDriverAndAsset.map((trip, index) => ({
                ...trip,
                category: categories[index] ?? '',
            }));

            const tripsByCategory = selectedCategories.includes('All')
                ? tripsWithCategory
                : tripsWithCategory.filter((trip) => selectedCategories.includes(trip.category));

            const annotations = await Promise.all(
                tripsByCategory.map(async (trip) => {
                    const annotation = await geotabTripAnnotation.getByTrip(trip);
                    return annotation?.text ?? '';
                }),
            );

            const selectedTrips = tripsByCategory.map((trip, index) => ({
                ...trip,
                annotation: annotations[index],
            }));

            const previous = await geotabTrip.getPrevious(selectedTrips[0]);
            selectedTrips[0].startPoint = previous?.stopPoint;

            const startLocations = await Promise.all(
                selectedTrips.map(async (trip) => {
                    if (!trip.startPoint) return '';
                    const [address] = await geotabAddress.getAddresses(trip.startPoint as Coordinate);

                    if (!address) return '';
                    if (address.zones?.length) {
                        const zone = await geotabZone.getById((address.zones[0] as Zone).id);
                        return zone?.name ?? address.formattedAddress ?? '';
                    }

                    return address.formattedAddress ?? '';
                }),
            );

            const tripsWithStartLocation = selectedTrips.map((trip, index) => ({
                ...trip,
                startLocation: startLocations[index],
            }));

            const endLocations = await Promise.all(
                tripsWithStartLocation.map(async (trip) => {
                    if (!trip.stopPoint) return { text: '', customer: '', locationType: [] };
                    const [address] = await geotabAddress.getAddresses(trip.stopPoint as Coordinate);

                    if (!address) return { text: '', customer: '', locationType: [] };
                    if (address.zones?.length) {
                        const zone = await geotabZone.getById((address.zones[0] as Zone).id);
                        const zoneTypes: ZoneType[] = (zone?.zoneTypes as ZoneType[]) ?? [];
                        const locationTypes = await Promise.all(
                            zoneTypes.map(async (zoneType) => {
                                const type = await geotabZoneType.getById(
                                    zoneType.id ?? (zoneType as unknown as string),
                                );
                                return type?.name ?? '';
                            }),
                        );

                        return {
                            text: zone?.name ?? address.formattedAddress ?? '',
                            customer: zone.comment ?? '',
                            locationType: locationTypes,
                        };
                    }

                    return { text: address.formattedAddress ?? '', customer: '', locationType: [] };
                }),
            );

            const tripsWithEndLocation = tripsWithStartLocation.map((trip, index) => ({
                ...trip,
                endLocation: endLocations[index].text,
                customer: endLocations[index].customer,
                locationType: endLocations[index].locationType,
            }));

            setSelectedTrips(tripsWithEndLocation);
        } catch (error) {
            alert('An error occurred while generating the report.');
        }
        setIsGeneratingReport(false);
    };

    return (
        <section className="flex w-full flex-col">
            <header className="flex h-28 items-center p-6">
                <h1 className="text-[1.75rem] leading-9 font-extralight">
                    Limousines LTD Reports - Trip Details Report
                </h1>
            </header>
            <main className="w-fit border-t border-(--border-primary) overflow-scroll">
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
                        className="btn-primary px-4! shadow text-nowrap"
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
