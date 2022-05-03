import { isProxy, isReadonly, shallowReadonly } from "../reactivity"

describe('shallowReadonly', () => {
    it('should not make nono-reactive properties reactive', () => {
        const props = shallowReadonly({ n: { foo: 1 } })

        expect(isReadonly(props)).toBe(true)
        expect(isProxy(props)).toBe(true)
        expect(isReadonly(props.n)).toBe(false)
    })

    it('should warn call when  set', () => {
        console.warn = jest.fn();

        const wrapper = shallowReadonly({ num: 1 })
        wrapper.num = 2;
        expect(console.warn).toBeCalled()
    })
})