import { createFileRoute, Link } from '@tanstack/react-router';
import { PiVan } from 'react-icons/pi';
import { GoTable } from 'react-icons/go';
import { ChevronRightIcon } from 'lucide-react';
import { useEffect } from 'react';
import { geotabConnect } from '#/auth/geotab-connect.ts';

export const Route = createFileRoute('/reports/')({
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
    useEffect(() => {
        const checkSession = async () => {
            try {
                await geotabConnect();
            } catch (error) {
                console.error('Error connecting to Geotab:', error);
                return (
                    <div>Error Loading Add-in</div>
                )
            }
        };
        void checkSession();
    }, []);

    return (
        <section className="flex w-full flex-col">
            <header className="flex h-28 items-center border-b border-b-(--border-primary) p-6">
                <h1 className="text-[1.75rem] leading-9 font-extralight">Limousines LTD Reports</h1>
            </header>
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
                    <div
                        className="flex min-h-34.5 max-w-140 min-w-[288px] flex-col justify-between gap-4 rounded-lg
                            border border-(--border-primary) p-4"
                    >
                        <div className="flex h-8 items-center gap-2 p-1">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#ebf6ff]">
                                <GoTable size={16} />
                            </div>
                            <Link to="/reports/trip-details-report" className="flex items-center gap-2">
                                <h3 className="text-sm font-medium">Trip Details</h3>
                                <ChevronRightIcon size={16} />
                            </Link>
                        </div>
                        <div className="flex flex-col">
                            <div>
                                <p className="text-xs leading-6 text-[#4e677e]">
                                    Detailed trips report including the driver, trip categorization, visited zones,
                                    distance, time, and Quickbooks customer name.
                                </p>
                            </div>
                            <div className="flex h-12 items-end">
                                <div className="flex w-full justify-end">
                                    <div
                                        className="flex h-5.5 items-center justify-center rounded-full bg-[#f2f5f7] px-2
                                            text-xs leading-4"
                                    >
                                        Trips
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </section>
    );
}
