import { h } from '../../lib/my-mini-vue.esm.js'

export const Foo = {
    render() {
        const btn = h('button', {
            onClick: this.handleEmitAdd
        }, '按钮')
        const foo = h('p', {}, "foo")
        return h('div', {}, [foo, btn])
    },
    setup(props, { emit }) {
        const handleEmitAdd = () => {
            emit('add', 1, 2)
            emit('add-log')
        }
        return {
            handleEmitAdd
        }
    }
}