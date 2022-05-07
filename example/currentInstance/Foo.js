import { h, getCurrentInstance } from '../../lib/my-mini-vue.esm.js'

export const Foo = {
    render() {
        return h('div', {}, "foo: " + this.title)
    },
    setup(props) {
        const instance = getCurrentInstance()
        console.log(instance)
        console.log(props)
        // props.title = 'xxxx'
    }
}