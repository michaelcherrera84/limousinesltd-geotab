import ReactDOM from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';

const router = createRouter({
    routeTree,
    basepath: "/limousinesltd-geotab",
    defaultPreload: 'intent',
    scrollRestoration: true,
});

console.log("basepath:", router.options.basepath);
console.log("location:", window.location.pathname);

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
