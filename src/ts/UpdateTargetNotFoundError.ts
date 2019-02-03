export default class UpdateTargetNotFoundError extends Error {
    target?: string;

    constructor(message: string, target?: string) {
        super(message);
        this.target = target;
    }
}