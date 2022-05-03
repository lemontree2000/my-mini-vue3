import { isProxy, isReactive, reactivity } from '../reactivity'

describe('reactivity', () => {
    it('happy path', () => {
        const original = { count: 1 };
        const observable = reactivity(original)

        expect(observable).not.toBe(original)
        expect(observable.count).toBe(1)
        expect(isReactive(observable)).toBe(true)
        expect(isReactive(original)).toBe(false)
    })

    it('nested reactive', () => {
        const original = {
            nested: {
                foo: 1
            },
            array: [
                { bar: 2 }
            ]
        }

        const observable = reactivity(original)

        expect(isReactive(observable)).toBe(true)
        expect(isReactive(observable.nested)).toBe(true)
        expect(isReactive(observable.array)).toBe(true)
        expect(isReactive(observable.array[0])).toBe(true)
        expect(isProxy(observable)).toBe(true)
    })
})