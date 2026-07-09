import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/')({ component: LandingPage });

function LandingPage() {
    return (
        <div className="flex w-full h-screen flex-col p-16">
            <header className="flex h-32 flex-col items-center justify-center gap-4">
                <h1 className="text-xl font-bold">Welcome to the Limousines LTD Add-in</h1>
                <p>
                    This landing page is for development only. Geotab add-in items will be accessed directly via their
                    individual urls.
                </p>
            </header>
            <main className="flex flex-col items-center h-full justify-center">
                <Link to="/reports" className="btn-primary w-fit px-4! shadow-md">
                    Custom Reports
                </Link>
            </main>
        </div>
    );
}
