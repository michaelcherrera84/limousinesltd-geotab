import { createBrowserHistory, createRouter as createTanStackRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';

const basepath = import.meta.env.PROD ? '/limousinesltd-geotab' : '/';

export function getRouter() {
    const router = createTanStackRouter({
        routeTree,
        history: createBrowserHistory(),
        basepath: basepath,
        scrollRestoration: true,
        defaultPreload: 'intent',
        defaultPreloadStaleTime: 0,
    });

    return router;
}

declare module '@tanstack/react-router' {
    interface Register {
        router: ReturnType<typeof getRouter>;
    }
}
