import { h, ref } from '../../lib/my-mini-vue.esm.js'

const nextChildren = [h('div', {}, 'c'), h('div', {}, 'b')]
const prevChildren = "text"
export default {
    name: "ArrayToText",
    setup() {
        const isChange = ref(false);
        window.isChange = isChange
        return {
            isChange
        }
    },
    render() {
        const self = this;
        return self.isChange === true ? h('div', {}, nextChildren) : h('div', {}, prevChildren)
    }

}