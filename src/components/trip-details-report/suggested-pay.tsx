import type { Ticket } from '@/components/trip-details-report/report-types.ts';

interface SuggestedPayProps {
    suggestedTickets: Ticket[];
}

function SuggestedPay({ suggestedTickets }: SuggestedPayProps) {
    if (!suggestedTickets.length) return null;
    return (
        <div>
            <div className="w-fit overflow-hidden rounded border border-(--border-primary)">
                <table>
                    <thead className="rounded text-center text-sm font-medium">
                        <tr
                            className="divide-x divide-(--border-primary) [&>th]:border-b
                                [&>th]:border-(--border-primary) [&>th]:px-4 [&>th]:py-3 [&>th]:font-normal"
                        >
                            <th>Ticket</th>
                            <th>Driver</th>
                            <th>Locations</th>
                            <th className="text-nowrap">Hours *</th>
                            <th>Distance</th>
                            <th>Type</th>
                            <th>Customer</th>
                            <th>Notes</th>
                        </tr>
                    </thead>
                    <tbody className="text-left text-xs">
                        {suggestedTickets.map((ticket, index) => {
                            return (
                                <tr
                                    key={index}
                                    className="divide-x divide-(--border-primary) odd:bg-gray-100 [&>td]:border-b
                                        [&>td]:border-(--border-primary) [&>td]:px-4 [&>td]:py-2 last:[&>td]:rounded-b
                                        last:[&>td]:border-b-0"
                                >
                                    <td className="text-center">{index + 1}</td>
                                    <td>{ticket.driver}</td>
                                    <td>
                                        {ticket.locations.map((location, i) => (
                                            <p key={i} className="text-nowrap">{location}</p>
                                        ))}
                                    </td>
                                    <td>{`${ticket.suggestedTime} (${ticket.time})`}</td>
                                    <td>{Math.round(ticket.distance * 0.621371 * 10) / 10} mi</td>
                                    <td>
                                        {ticket.type.map((type, i) => (
                                            <p key={i}>{type}</p>
                                        ))}
                                    </td>
                                    <td>
                                        {ticket.customer.map((customer, i) => (
                                            <p key={i}>{customer}</p>
                                        ))}
                                    </td>
                                    <td className="min-w-56">{ticket.notes.filter(Boolean).join(', ')}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <p className="max-w-2xl p-1 text-[10px] leading-tight">
                * Ticket hours are adjusted for a 2 hour minimum when tickets are more than 30 minutes apart. This
                adjustment does not account for hours claimed for duties that are not tracked in Geotab. The actual
                duration of each ticket in included in parenthesis for convenience.
            </p>
        </div>
    );
}

export default SuggestedPay;
