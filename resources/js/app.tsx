import { createInertiaApp } from '@inertiajs/react';
import type { ComponentType } from 'react';
import { hydrateRoot } from 'react-dom/client';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    resolve: (name) => {
        const pages = import.meta.glob<{
            default: ComponentType;
        }>('./pages/**/*.tsx');
        const page = pages[`./pages/${name}.tsx`];

        if (!page) {
            throw new Error(`Page not found: ${name}`);
        }

        return page().then((module) => module.default);
    },
    setup({ el, App, props }) {
        if (typeof window === 'undefined') {
            return <App {...props} />;
        }

        return hydrateRoot(el, <App {...props} />);
    },
    title: (title) => (title ? `${title} - ${appName}` : appName),
    progress: {
        color: '#4B5563',
    },
});
