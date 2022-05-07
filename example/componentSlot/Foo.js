import { h, renderSlots } from '../../lib/my-mini-vue.esm.js'

export const Foo = {
    render() {
        console.log(this.$slots);
        const foo = h('p', {}, "foo")
        const age = 11;
        return h('div', {}, [
            renderSlots(this.$slots, 'header', { age }),
            foo,
            renderSlots(this.$slots, 'footer', { age }),
            renderSlots(this.$slots, 'other', { age })
        ])
        // return h('div', {}, [foo, renderSlots(this.$slots)])
    },
    setup() {
        return {}
    }
}