import { h } from '../../lib/my-mini-vue.esm.js'

export default {
    render() {
        return h('div', {}, "msg: " + this.$props.msg)
    },
    setup(props) {
        console.log(props)
        // props.title = 'xxxx'
    }
}