import ReactDOM from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';
import { geotabConnect } from '@/auth/geotab-connect.ts';

const router = createRouter({
    routeTree,
    defaultPreload: 'intent',
    scrollRestoration: true,
});

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}

async function startApp() {
    await geotabConnect();

    const rootElement = document.getElementById('app')!;

    if (!rootElement.innerHTML) {
        const root = ReactDOM.createRoot(rootElement);
        root.render(<RouterProvider router={router} />);
    }
}

void startApp();
