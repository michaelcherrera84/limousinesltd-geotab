import { createFileRoute, Link, useRouter } from '@tanstack/react-router';
import { useEffect } from 'react';
import { geotabConnect } from '@/auth/geotab-connect.ts';

export const Route = createFileRoute('/')({ component: LandingPage });

function LandingPage() {
    const router = useRouter();

    useEffect(() => {
        const getSession = async () => {
            try {
                await geotabConnect();
                await router.navigate({ to: '/reports' });
            } catch (error) {
                console.error('Error connecting to Geotab:', error);
                await router.navigate({ to: '/login' });
            }
        };
        void getSession();
    }, []);

    return (
        <div className="flex h-screen w-full flex-col p-16">
            <header className="flex h-32 flex-col items-center justify-center gap-4">
                <h1 className="text-xl font-bold">Welcome to the Limousines LTD Add-in</h1>
                <p>
                    This landing page is for development only. Geotab add-in items will be accessed directly via their
                    individual urls.
                </p>
            </header>
            <main className="flex h-full flex-col items-center justify-center">
                <Link to="/login" className="btn-primary w-fit px-4! shadow-md">
                    Login
                </Link>
            </main>
        </div>
    );
}
