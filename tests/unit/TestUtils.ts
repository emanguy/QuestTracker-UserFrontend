/**
 * Returns a promise that resolves after a certain amount of time
 */
export function timeout(time: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, time);
    });
}