import { createFileRoute } from '@tanstack/react-router';
import { PiVan } from 'react-icons/pi';
import { GoTable } from 'react-icons/go';
import ReportCard from '#/components/report-card.tsx';

export const Route = createFileRoute('/')({
    head: () => ({
        meta: [
            { title: 'Limousines LTD Reports' },
            {
                name: 'Limousines LTD Reports',
                content: 'Custom reports for Limousines LTD.',
            },
        ],
    }),
    component: ReportsDashboard,
});

function ReportsDashboard() {
    return (
        <section className="flex w-full flex-col">
            <main className="p-6">
                <div>
                    <button
                        className="flex h-8 min-w-24 items-center justify-center gap-3 rounded-full
                            bg-(--button-primary) px-4 py-1 text-xs text-white"
                    >
                        <PiVan size={16} />
                        Trips
                        <b>1</b>
                    </button>
                </div>
                <div className="grid grid-cols-3 gap-4 py-6">
                    <ReportCard
                        title="Trip Details"
                        icon={<GoTable size={16} />}
                        link="/trip-details-report"
                        description="Detailed trips report including the driver, trip categorization, visited zones, distance, time, and Quickbooks customer name."
                        tags={['Trips']}
                    />
                    <ReportCard
                        title="Suggested Pay"
                        link="/suggested-pay-report"
                        description="Driver ticket estimation report that calculates the recommended hours and mileage for a driver's tickets over a selected date range."
                        tags={['Trips', 'Accounting']}
                    />
                </div>
            </main>
        </section>
    );
}
