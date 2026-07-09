import { createFileRoute, useRouter } from '@tanstack/react-router';
import { type FormEvent, useEffect, useState } from 'react';
import { loadSession, saveSession } from '@/auth/session.ts';
import GeotabApi from 'mg-api-js';
import { setApi } from '@/auth/api.ts';

export const Route = createFileRoute('/login')({
    component: LoginPage,
});

function LoginPage() {
    const router = useRouter();
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [database, setDatabase] = useState('');
    const [server, setServer] = useState('my.geotab.com');

    useEffect(() => {
        const session = loadSession();
        if (session) {
            router.navigate({ to: '/reports' });
        }
    }, [router]);

    const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const api = new GeotabApi({
            credentials: {
                database,
                userName,
                password,
            },
            path: server,
        });

        await api.authenticate();

        setApi(api);

        const { credentials } = await api.getSession();

        if (!credentials.sessionId) throw new Error('Failed to get session ID');

        saveSession({
            database: credentials.database,
            userName: credentials.userName,
            sessionId: credentials.sessionId,
            server: server,
        });

        const session = loadSession();
        if (session) {
            await router.navigate({ to: '/reports' });
        } else {
            throw new Error('Failed to save session');
        }
    };

    return (
        <div className="flex h-screen w-screen items-center justify-center">
            <div className="flex flex-col items-center gap-4 shadow-lg rounded shadow-gray-400 p-12">
                <h1 className="font-light text-2xl py-2">Login</h1>
                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                    <div className="flex flex-col items-center gap-2">
                        <label htmlFor="userName">User Name</label>
                        <input
                            type="text"
                            id="userName"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            className="rounded border border-(--border-primary) p-2"
                        />
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="rounded border border-(--border-primary) p-2"
                        />
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <label htmlFor="database">Database</label>
                        <input
                            type="text"
                            id="database"
                            value={database}
                            onChange={(e) => setDatabase(e.target.value)}
                            className="rounded border border-(--border-primary) p-2"
                        />
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <label htmlFor="server">Server</label>
                        <input
                            type="text"
                            id="server"
                            value={server}
                            onChange={(e) => setServer(e.target.value)}
                            className="rounded border border-(--border-primary) p-2"
                        />
                    </div>
                    <button type="submit" className="btn-primary mt-3">Sign In</button>
                </form>
            </div>
        </div>
    );
}
