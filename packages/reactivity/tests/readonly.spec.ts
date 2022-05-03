import { isProxy, isReadonly, readonly } from "../reactivity";

describe('readonly', () => {
    it('should make nested values readonly', () => {
        const original = {
            num: 1,
            bar: { baz: 2 },
            array: [
                { bar: 2 }
            ]
        }
        const wrapper = readonly(original);
        expect(wrapper).not.toBe(original);
        expect(wrapper.num).toBe(1);
        expect(isReadonly(wrapper)).toBe(true)
        
        expect(isReadonly(wrapper.bar)).toBe(true)
        expect(isReadonly(wrapper.array)).toBe(true)
        expect(isReadonly(wrapper.array[0])).toBe(true)

        expect(isProxy(wrapper)).toBe(true)

        expect(isReadonly(original)).toBe(false)
    })

    it('should warn call when  set', () => {
        console.warn = jest.fn();

        const wrapper = readonly({ num: 1 })
        wrapper.num = 2;
        expect(console.warn).toBeCalled()
    })
})