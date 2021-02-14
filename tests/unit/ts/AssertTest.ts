import {assertExists, ArgumentDoesNotExistError} from "../../../src/ts/Assertions";

describe('Not null assert', () => {
    it('throws on null', () => {
        expect(() => assertExists(null)).toThrowError(ArgumentDoesNotExistError);
    });

    it('throws on undefined', () => {
        expect(() => assertExists(undefined)).toThrowError(ArgumentDoesNotExistError);
    });

    it('returns on a concrete value', () => {
        expect(assertExists(3)).toBe(3);
    });
});
