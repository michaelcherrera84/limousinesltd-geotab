import ReactDOM from 'react-dom/client';
import { RouterProvider, createRouter, createHashHistory } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';

const hashHistory = createHashHistory();

const router = createRouter({
    routeTree,
    history: hashHistory,
    defaultPreload: 'intent',
    scrollRestoration: true,
});

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}

async function startApp() {
    const rootElement = document.getElementById('app')!;

    if (!rootElement.innerHTML) {
        const root = ReactDOM.createRoot(rootElement);
        root.render(<RouterProvider router={router} />);
    }
}

void startApp();
