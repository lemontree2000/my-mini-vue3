import { h } from '../../lib/my-mini-vue.esm.js'

export const Foo = {
    render() {
        return h('div', {}, "foo: " + this.title)
    },
    setup(props) {
        console.log(props)
        // props.title = 'xxxx'
    }
}