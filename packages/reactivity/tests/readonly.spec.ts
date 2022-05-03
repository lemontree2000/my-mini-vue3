import { isReadonly, readonly } from "../reactivity";

describe('readonly', () => {
    it('happy path', () => {
        const original = { num: 1, bar: { baz: 2 } }
        const wrapper = readonly(original);
        expect(wrapper).not.toBe(original);
        expect(wrapper.num).toBe(1);
        expect(isReadonly(wrapper)).toBe(true)
        expect(isReadonly(original)).toBe(false)
    })

    it('warn  when call set', () => {
        console.warn = jest.fn();

        const wrapper = readonly({ num: 1 })
        wrapper.num = 2;
        expect(console.warn).toBeCalled()
    })
})