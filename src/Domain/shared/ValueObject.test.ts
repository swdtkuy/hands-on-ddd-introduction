import { ValueObject } from "./ValueObject";

class TestValue extends ValueObject<string, "TestValue"> {
    constructor(value: string) {
        super(value);
    }

    protected validate(_value: string): void {}
}

describe("ValueObject", () => {
    test("value should return the stored value", () => {
        expect(new TestValue("hello").value).toBe("hello");
    });

    test("equals should return true for objects with the same value", () => {
        const a = new TestValue("hello");
        const b = new TestValue("hello");
        expect(a.equals(b)).toBe(true);
    });

    test("equals should return false for objects with different values", () => {
        const a = new TestValue("hello");
        const b = new TestValue("world");
        expect(a.equals(b)).toBe(false);
    });
});
