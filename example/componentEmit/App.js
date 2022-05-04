import { h } from '../../lib/my-mini-vue.esm.js'
import { Foo } from './Foo.js'
export const App = {
    name: "app",
    render() {
        return h(
            "div",
            {},
            [
                h('div', { class: ['red', 'green'], }, 'Hi'),
                h(Foo, {
                    onAdd(a, b) { console.log('onAdd', a, b) },
                    onAddLog() { console.log('onAddLog') }
                })
            ]
        )

    },
    setup() {
        return {
            msg: 'my mini vu2e'
        }
    }
}