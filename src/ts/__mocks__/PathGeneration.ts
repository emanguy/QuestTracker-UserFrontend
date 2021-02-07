
export const baseURL = "base-url/";

export function produceApiPath(path: string): string {
    return `http://fake-url/${path}`;
}

export function produceListenerPath(path: string): string {
    return `http://fake-url-2/${path}`;
}
