/**
 * Thrown when assertNotNullOrUndefined fails.
 */
export class ArgumentDoesNotExistError extends Error {
    constructor(message: string, public realValue: any) {
        super(message);
    }
}

/**
 * Assert that the passed value is not null, throwing an error otherwise
 *
 * @param value The value that we assume is not null
 * @return Value, asserted as non-null
 */
export function assertExists<T>(value: T|null|undefined): T {
    if (value === null || value === undefined) {
        throw new ArgumentDoesNotExistError('Expected value to exist, but did not!', value);
    }

    return value;
}
