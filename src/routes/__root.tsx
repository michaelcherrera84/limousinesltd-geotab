import '../styles.css';
import { Outlet, createRootRoute, HeadContent } from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';
import { TanStackDevtools } from '@tanstack/react-devtools';
import LoginPage from '@/auth/login.tsx';
import { useGeotabApi } from '#/auth/useGeotabApi.tsx';
import Header from '#/components/header.tsx';

export const Route = createRootRoute({
    component: RootComponent,
});

function RootComponent() {
    const hasApi = useGeotabApi();

    if (!hasApi) return <LoginPage />;

    return (
        <>
            <HeadContent />
            <Header />
            <Outlet />
            <TanStackDevtools
                config={{
                    position: 'bottom-right',
                }}
                plugins={[
                    {
                        name: 'TanStack Router',
                        render: <TanStackRouterDevtoolsPanel />,
                    },
                ]}
            />
        </>
    );
}
