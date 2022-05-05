import { h } from '../../lib/my-mini-vue.esm.js'
import { Foo } from './Foo.js'
export const App = {
    name: "app",
    render() {
        const app = h('div', {}, 'app')
        const foo = h(Foo)
        return h("div", {}, [app, foo])

    },
    setup() {
        return {
            msg: 'my mini vu2e'
        }
    }
}