import { isReactive, reactivity } from '../reactivity'

describe('reactivity', () => {
    it('happy path', () => {
        const original = { count: 1 };
        const observable = reactivity(original)

        expect(observable).not.toBe(original)
        expect(observable.count).toBe(1)
        expect(isReactive(observable)).toBe(true)
        expect(isReactive(original)).toBe(false)
    })
})