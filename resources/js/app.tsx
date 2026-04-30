import { createInertiaApp } from '@inertiajs/react';
import type { ComponentType } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { ThemeProvider } from '@/components/theme-provider';

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
            return (
                <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
                    <App {...props} />
                </ThemeProvider>
            );
        }

        return hydrateRoot(
            el,
            <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
                <App {...props} />
            </ThemeProvider>,
        );
    },
    title: (title) => (title ? `${title} - ${appName}` : appName),
    progress: {
        color: '#4B5563',
    },
});
