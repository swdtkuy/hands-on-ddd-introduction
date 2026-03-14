import isEqual from "lodash/isEqual";

export abstract class ValueObject<T, U> {
    // @ts-expect-error
    // Phantom Type to enforce type constraints on subclasses
    private _type: U;
    protected readonly _value: T;

    constructor(value: T) {
        this.validate(value);
        this._value = value;
    }

    protected abstract validate(value: T): void;

    equals(other: ValueObject<T, U>): boolean {
        return isEqual(this._value, other._value);
    }

    get value(): T {
        return this._value;
    }
}