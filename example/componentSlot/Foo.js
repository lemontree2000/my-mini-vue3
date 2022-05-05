import { h } from '../../lib/my-mini-vue.esm.js'

export const Foo = {
    render() {
        const foo = h('p', {}, "foo")
        return h('div', {}, [foo])
    },
    setup() {
        return {}
    }
}