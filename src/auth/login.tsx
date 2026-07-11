import { type SyntheticEvent, useState } from 'react';
import GeotabApi from 'mg-api-js';
import { setApi } from '@/auth/api.ts';

function LoginPage() {
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [database, setDatabase] = useState('');
    const [server, setServer] = useState('my.geotab.com');

    /**
     * Asynchronous function to handle the login process when a form is submitted.
     *
     * This function prevents the default form submission behavior,
     * initializes a Geotab API instance with user-provided credentials,
     * performs authentication, and updates the application state with the API instance.
     *
     * @param {SyntheticEvent} e - The form submission event.
     */
    const handleLogin = async (e: SyntheticEvent) => {
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
    };

    return (
        <div className="flex h-screen w-screen items-center justify-center">
            <div className="flex flex-col items-center gap-4 rounded p-12 shadow-lg shadow-gray-400">
                <h1 className="py-2 text-2xl font-light">Login</h1>
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
                    <button type="submit" className="btn-primary mt-3">
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    );
}

export default LoginPage;
