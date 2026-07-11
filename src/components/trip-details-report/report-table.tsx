import { useEffect, useState } from 'react';
import type { Data } from '@/components/trip-details-report/report-types.ts';
import { addDurations, formatDurationString, sumDurations } from '@/utils/duration.ts';

interface ReportTableProps {
    data: Data[];
}

function ReportTable({ data }: ReportTableProps) {
    const [totalDistance, setTotalDistance] = useState<number>(0);
    const [totalDrivingDuration, setTotalDrivingDuration] = useState<string>('');
    const [totalStopDuration, setTotalStopDuration] = useState<string>('');
    const [totalDuration, setTotalDuration] = useState<string>('');
    const [totalTrips, setTotalTrips] = useState<number>(0);

    /**
     * Calculates and updates various statistics based on the provided data.
     */
    useEffect(() => {
        if (!data.length) return;

        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            row.date = new Date(row.start).toLocaleDateString();
            row.drivingDuration = formatDurationString(row.drivingDuration);
        }

        const totalDrivingDuration = sumDurations(data.map((trip) => trip.drivingDuration));
        const totalStopDuration = sumDurations(data.map((trip) => trip.stopDuration));

        setTotalTrips(data.length);
        setTotalDistance(data.reduce((acc, row) => acc + row.distance, 0));
        setTotalDrivingDuration(totalDrivingDuration);
        setTotalStopDuration(totalStopDuration);
        setTotalDuration(addDurations(totalDrivingDuration, totalStopDuration));
    }, [data]);

    if (!data.length) return null;

    return (
        <div>
            <div className="flex flex-col gap-10 py-6">
                <div className="w-fit overflow-hidden rounded border border-(--border-primary)">
                    <table>
                        <thead className="rounded text-center text-sm bg-(--button-primary)/30">
                            <tr
                                className="divide-x divide-(--border-primary) [&>th]:border-b
                                    [&>th]:border-(--border-primary) [&>th]:px-4 [&>th]:py-3 [&>th]:font-medium"
                            >
                                <th colSpan={4}>Trips Summary</th>
                            </tr>
                        </thead>
                        <tbody className="text-left text-xs">
                            <tr
                                className="divide-x divide-(--border-primary) odd:bg-gray-100 [&>td]:border-b
                                    [&>td]:border-(--border-primary) [&>td]:px-4 [&>td]:py-2 last:[&>td]:rounded-b
                                    last:[&>td]:border-b-0"
                            >
                                <td>Total Trips</td>
                                <td>{totalTrips}</td>
                                <td>Total Distance</td>
                                <td className="text-right">{Math.round(totalDistance * 0.621371 * 10) / 10} mi</td>
                            </tr>
                            <tr
                                className="divide-x divide-(--border-primary) odd:bg-gray-100 [&>td]:border-b
                                    [&>td]:border-(--border-primary) [&>td]:px-4 [&>td]:py-2 last:[&>td]:rounded-b
                                    last:[&>td]:border-b-0"
                            >
                                <td>Total Driving Duration</td>
                                <td>{totalDrivingDuration}</td>
                                <td>Total Stop Duration</td>
                                <td className="text-right">{totalStopDuration}</td>
                            </tr>
                            <tr
                                className="divide-x divide-(--border-primary) odd:bg-gray-100 [&>td]:border-b
                                    [&>td]:border-(--border-primary) [&>td]:px-4 [&>td]:py-2 last:[&>td]:rounded-b
                                    last:[&>td]:border-b-0"
                            >
                                <td colSpan={2} className="text-center font-medium">
                                    Total Duration
                                </td>
                                <td colSpan={2} className="text-center font-medium">
                                    {totalDuration}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="w-fit overflow-hidden rounded border border-(--border-primary)">
                    <table>
                        <thead className="rounded text-center text-sm bg-(--button-primary)/30">
                            <tr
                                className="divide-x divide-(--border-primary) [&>th]:border-b
                                    [&>th]:border-(--border-primary) [&>th]:px-4 [&>th]:py-3 [&>th]:font-medium"
                            >
                                <th>Date</th>
                                <th>Driver</th>
                                <th>Start Location</th>
                                <th>End Location</th>
                                <th>Distance</th>
                                <th>Driving Duration</th>
                                <th>Stop Duration</th>
                                <th>Category</th>
                                <th>Annotation</th>
                                <th>QuickBooks Customer</th>
                            </tr>
                        </thead>
                        <tbody className="text-left text-xs">
                            {data.map((row) => (
                                <tr
                                    key={row.id}
                                    className="divide-x divide-(--border-primary) odd:bg-gray-100 [&>td]:border-b
                                        [&>td]:border-(--border-primary) [&>td]:px-4 [&>td]:py-2 last:[&>td]:rounded-b
                                        last:[&>td]:border-b-0"
                                >
                                    <td>{row.date}</td>
                                    <td>{row.driverName}</td>
                                    <td>{row.startLocation}</td>
                                    <td>{row.endLocation}</td>
                                    <td className="text-right">{Math.round(row.distance * 0.621371 * 10) / 10} mi</td>
                                    <td className="text-right">{row.drivingDuration}</td>
                                    <td className="text-right">{row.stopDuration}</td>
                                    <td>{row.category}</td>
                                    <td>{row.annotation !== ',' && row.annotation}</td>
                                    <td>{row.customer}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default ReportTable;
