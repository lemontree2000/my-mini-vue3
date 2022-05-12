import { h, ref } from '../../lib/my-mini-vue.esm.js'


// 1.左侧对比
// (a b) c
// (a b) d e
// // const nextChildren = [
// //     h('div', { key: 'A' }, 'A'),
// //     h('div', { key: 'B' }, 'B'),
// //     h('div', { key: 'D' }, 'D'),
// //     h('div', { key: 'E' }, 'E'),
// // ]
// // const prevChildren = [
// //     h('div', { key: 'A' }, 'A'),
// //     h('div', { key: 'B' }, 'B'),
// //     h('div', { key: 'C' }, 'C'),
// ]
// 2.右侧对比
// a( b c) 
// d e(b c)
// const nextChildren = [
//     h('div', { key: 'A' }, 'A'),
//     h('div', { key: 'B' }, 'B'),
//     h('div', { key: 'C' }, 'C'),
// ]
// const prevChildren = [
//     h('div', { key: 'D' }, 'D'),
//     h('div', { key: 'E' }, 'E'),
//     h('div', { key: 'B' }, 'B'),
//     h('div', { key: 'C' }, 'C'),
// ]
// 3.新的比旧的长
// ( a b ) 
// (a b ) c
const nextChildren = [
    h('div', { key: 'A' }, 'A'),
    h('div', { key: 'B' }, 'B'),
    h('div', { key: 'C' }, 'C'),
]
const prevChildren = [
    h('div', { key: 'A' }, 'A'),
    h('div', { key: 'B' }, 'B'),
]


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