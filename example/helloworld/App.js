import { h } from '../../lib/my-mini-vue.esm.js'
export const App = {
    render() {
        return h(
            "div",
            { id: 'test', class: ['red'] },
            [
                h('p', { class: ['red', 'green'], }, 'Hi'),
                h('p', {
                    class: 'red',
                    onClick: () => {
                        console.log('onClick')
                    },
                    onMousedown() {
                        console.log('onMousedown')
                    }
                }, this.msg),
            ]
        )

    },
    setup() {
        return {
            msg: 'my mini vu2e'
        }
    }
}