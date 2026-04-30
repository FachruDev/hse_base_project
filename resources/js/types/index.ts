import type { Auth } from './auth';

export type * from './auth';

export type PageProps<T extends Record<string, unknown> = Record<string, unknown>> = T & {
    auth: Auth;
    name: string;
};
