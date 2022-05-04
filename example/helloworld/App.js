import { h } from '../../lib/my-mini-vue.esm.js'
window.componentV = null
export const App = {
    render() {
        window.componentV = this;
        return h(
            "div",
            { id: 'test', class: ['red'] },
            [
                h('p', { class: ['red', 'green'], }, 'Hi'),
                h('p', { class: 'red', }, this.msg),
            ]
        )

    },
    setup() {
        return {
            msg: 'my mini vu2e'
        }
    }
}