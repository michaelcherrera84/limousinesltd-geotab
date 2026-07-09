import { useEffect, useState } from 'react';
import type { Ticket, Data } from '@/components/trip-details-report/report-types.ts';
import SuggestedPay from '#/components/trip-details-report/suggested-pay.tsx';
import { CloseButton, Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { FaXmark } from 'react-icons/fa6';

interface ReportTableProps {
    data: Data[];
}

function msToHHMM(ms: number) {
    // 1. Convert total milliseconds to total minutes and round it
    const totalMinutes = Math.round(ms / 60000);

    // 2. Calculate remaining hours and minutes
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    // 3. Pad numbers with leading zeros to ensure a string length of 2
    const hh = String(hours).padStart(2, '0');
    const mm = String(minutes).padStart(2, '0');

    return `${hh}:${mm}`;
}

function ReportTable({ data }: ReportTableProps) {
    const [totalDistance, setTotalDistance] = useState<number>(0);
    const [totalDrivingDuration, setTotalDrivingDuration] = useState<number>(0);
    const [totalStopDuration, setTotalStopDuration] = useState<number>(0);
    const [totalDuration, setTotalDuration] = useState<number>(0);
    const [totalTrips, setTotalTrips] = useState<number>(0);
    const [suggestedTickets, setSuggestedTickets] = useState<Ticket[]>([]);
    const [openTicketDialog, setOpenTicketDialog] = useState<boolean>(false);

    useEffect(() => {
        if (!data.length) return;

        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            row.date = new Date(row.start).toLocaleDateString();

            row.drivingDuration = new Date(row.stop).getTime() - new Date(row.start).getTime();

            const isLastRow = i === data.length - 1;
            if (!isLastRow) row.stopDuration = new Date(data[i + 1].start).getTime() - new Date(row.stop).getTime();
            else row.stopDuration = 0;
        }

        setTotalTrips(data.length);
        setTotalDistance(data.reduce((acc: number, row: any) => acc + row.distance, 0));
        setTotalDrivingDuration(data.reduce((acc: number, row: any) => acc + row.drivingDuration, 0));
        setTotalStopDuration(data.reduce((acc: number, row: any) => acc + row.stopDuration, 0));
        setTotalDuration(
            data.reduce((acc: number, row: any) => acc + row.drivingDuration, 0) +
                data.reduce((acc: number, row: any) => acc + row.stopDuration, 0),
        );
    }, [data]);

    function startNewTicket(row: Data, ticketType: string, note: string): Ticket {
        return {
            driver: row.driverName,
            locations: [row.startLocation, row.endLocation],
            duration: row.drivingDuration,
            suggestedTime: '',
            time: '',
            distance: row.distance,
            customer: [row.customer],
            type: [ticketType.toUpperCase()],
            notes: [note],
        };
    }

    const handleViewSuggestedTickets = () => {
        const ticketTrips = data.filter(
            (row: Data) => row.category === 'Business' || row.annotation.split(',')[0].toLowerCase() === 'c',
        );

        const tickets: Ticket[] = [];

        const ticketTypes = ['shed', 'vrep', 'dc', 'p/uc', 'ap', 'tr', 'hc', 'ahc', 'oos', 'oosh', 'c'];
        const paidTypes = ['dc', 'p/uc', 'ap', 'tr', 'hc', 'ahc', 'oos', 'oosh'];
        for (let i = 0; i < ticketTrips.length; i++) {
            const row = ticketTrips[i];
            const ticketType = ticketTypes.find((type) => row.annotation.toLowerCase().startsWith(type + ',')) ?? '';
            const note = row.annotation.slice(row.annotation.indexOf(',') + 1).trim();

            if (i === 0) {
                tickets.push(startNewTicket(row, ticketType, note));
            } else {
                const previousRow = ticketTrips[i - 1];
                const lastTicket = tickets[tickets.length - 1];
                if (
                    previousRow.stopDuration < 1000 * 60 * 30 ||
                    previousRow.locationType.includes('Customer') ||
                    previousRow.locationType.includes('Business') ||
                    previousRow.locationType.includes('Funeral Home')
                ) {
                    if (row.endLocation !== previousRow.endLocation) lastTicket.locations.push(row.endLocation);
                    lastTicket.duration += row.drivingDuration + previousRow.stopDuration;
                    lastTicket.distance += row.distance;
                    lastTicket.customer.push(row.customer);
                    lastTicket.type.push(ticketType.toUpperCase());
                    lastTicket.notes.push(note);
                } else {
                    tickets.push(startNewTicket(row, ticketType, note));
                }
            }
        }

        // Remove the last ticket if it's a partial ticket ending at a customer location'
        const lastTicketTrip = ticketTrips[ticketTrips.length - 1];
        if (
            lastTicketTrip.locationType.includes('Customer') ||
            lastTicketTrip.locationType.includes('Business') ||
            lastTicketTrip.locationType.includes('Funeral Home')
        ) {
            tickets.pop();
            alert(
                'It appears that the current selection may contains a partial ticket ending at a customer' +
                    '  or business location. This ticket will not be included in the suggested tickets. Please extend' +
                    ' the date range to the full ticket.',
            );
        }

        for (let ticket of tickets) {
            ticket.time = msToHHMM(ticket.duration);
            ticket.duration = Math.max(ticket.duration, 1000 * 60 * 120);
            ticket.suggestedTime = msToHHMM(ticket.duration);
        }

        let ticketContainsType = false;
        for (let ticket of tickets) {
            for (let type of ticket.type) {
                if (paidTypes.includes(type.toLowerCase())) {
                    ticketContainsType = true;
                    break;
                }
            }
            if (!ticketContainsType) {
                alert(
                    'One or more tickets does not appear to contain a paid ticket type.' +
                        ' Please review the tickets to confirm their accuracy.',
                );
                break;
            }
        }

        setSuggestedTickets(tickets);
        setOpenTicketDialog(true);
    };

    if (!data.length) return null;

    return (
        <div>
            <div className="flex flex-col gap-10 py-6">
                <div className="flex items-end gap-8">
                    <div className="w-fit overflow-hidden rounded border border-(--border-primary)">
                        <table>
                            <thead className="rounded text-center text-sm font-medium">
                                <tr
                                    className="divide-x divide-(--border-primary) [&>th]:border-b
                                        [&>th]:border-(--border-primary) [&>th]:px-4 [&>th]:py-3 [&>th]:font-normal"
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
                                    <td>{msToHHMM(totalDrivingDuration)}</td>
                                    <td>Total Stop Duration</td>
                                    <td className="text-right">{msToHHMM(totalStopDuration)}</td>
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
                                        {msToHHMM(totalDuration)}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <button className="btn-primary shadow" onClick={handleViewSuggestedTickets}>
                        View Suggested Pay
                    </button>
                </div>
                <div className="w-fit overflow-hidden rounded border border-(--border-primary)">
                    <table>
                        <thead className="rounded text-center text-sm font-medium">
                            <tr
                                className="divide-x divide-(--border-primary) [&>th]:border-b
                                    [&>th]:border-(--border-primary) [&>th]:px-4 [&>th]:py-3 [&>th]:font-normal"
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
                                    <td className="text-right">{msToHHMM(row.drivingDuration)}</td>
                                    <td className="text-right">{msToHHMM(row.stopDuration)}</td>
                                    <td>{row.category}</td>
                                    <td>{row.annotation !== ',' && row.annotation}</td>
                                    <td>{row.customer}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {openTicketDialog && <div className="fixed inset-0 z-40 bg-black/30" />}
            <Dialog
                as="div"
                className="absolute top-1/2 left-1/2 z-50 -translate-1/2"
                open={openTicketDialog}
                onClose={() => setOpenTicketDialog(false)}
            >
                <DialogPanel
                    className="flex flex-col gap-10 rounded bg-white p-12 text-2xl font-light shadow-xl shadow-gray-500"
                >
                    <div className="flex items-center justify-between">
                        <DialogTitle>Driver Tickets</DialogTitle>
                        <CloseButton
                            onClick={() => setOpenTicketDialog(false)}
                            className="rounded-full p-2 hover:bg-gray-200"
                        >
                            <FaXmark size={20} />
                        </CloseButton>
                    </div>
                    <SuggestedPay suggestedTickets={suggestedTickets} />
                </DialogPanel>
            </Dialog>
        </div>
    );
}

export default ReportTable;
