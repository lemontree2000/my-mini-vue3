import { h, createTextVNode } from '../../lib/my-mini-vue.esm.js'
import { Foo } from './Foo.js'
export const App = {
    name: "app",
    render() {
        const app = h('div', {}, 'app')
        // 
        // const foo = h(Foo, {}, h('div', {}, 'hh`'))
        // const foo = h(Foo, {}, [h('div', {}, 'slot1'), h('p', {}, 'slot2')])
        const foo = h(Foo, {}, {
            header: (props) => h('div', {}, 'slot1' + props.age),
            footer: (props) => h('p', {}, 'slot2' + props.age),
            other: (props) => h('div', {}, [h('h4', {}, 'textNode'), createTextVNode('hhhhh')])
        })
        return h("div", {}, [app, foo])

    },
    setup() {
        return {
            msg: 'my mini vu2e'
        }
    }
}