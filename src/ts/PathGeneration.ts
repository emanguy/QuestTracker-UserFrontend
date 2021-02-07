
export const baseURL = import.meta.env.BASE_URL;

export function produceApiPath(path: string): string {
    return `${import.meta.env.VITE_APP_SCHEME}://${import.meta.env.VITE_APP_BACKEND_HOSTNAME_AND_PORT}${import.meta.env.VITE_APP_BACKEND_API_ROOT_PATH}/${path}`;
}

export function produceListenerPath(path: string): string {
    return `${import.meta.env.VITE_APP_SCHEME}://${import.meta.env.VITE_APP_BACKEND_UPDATE_HOSTNAME_AND_PORT}${import.meta.env.VITE_APP_BACKEND_UPDATE_ROOT_PATH}/${path}`;
}
