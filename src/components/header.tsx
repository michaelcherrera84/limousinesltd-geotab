import { useLocation } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import title from 'title';

function Header() {
    const location = useLocation();
    const [pageTitle, setPageTitle] = useState('');

    useEffect(() => {
        let path = location.pathname.split('/').at(-1);
        let pageTitle = path?.split('-').join(' ');
        if (pageTitle) {
            setPageTitle('Limousines Ltd Reports - ' + title(pageTitle));
        } else {
            setPageTitle('Limousines Ltd Reports');
        }
    }, [location.pathname]);

    return (
        <header className="flex h-28 items-center border-b border-b-(--border-primary) p-6">
            <h1 className="text-[1.75rem] leading-9 font-extralight">{pageTitle}</h1>
        </header>
    );
}

export default Header;
