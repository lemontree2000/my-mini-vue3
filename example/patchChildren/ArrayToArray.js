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
// 左侧多
// const nextChildren = [
//     h('div', { key: 'A' }, 'A'),
//     h('div', { key: 'B' }, 'B'),
//     h('div', { key: 'C' }, 'C'),
//     h('div', { key: 'D' }, 'D'),
// ]
// const prevChildren = [
//     h('div', { key: 'A' }, 'A'),
//     h('div', { key: 'B' }, 'B'),
// ]
// 右侧多
// const nextChildren = [
//     h('div', { key: 'D' }, 'D'),
//     h('div', { key: 'C' }, 'C'),
//     h('div', { key: 'A' }, 'A'),
//     h('div', { key: 'B' }, 'B'),
// ]
// const prevChildren = [
//     h('div', { key: 'A' }, 'A'),
//     h('div', { key: 'B' }, 'B'),
// ]


// const prevChildren = [
//     h('div', { key: 'A' }, 'A'),
//     h('div', { key: 'B' }, 'B'),
//     h('div', { key: 'C' }, 'C'),
//     h('div', { key: 'D' }, 'D'),
// ]
// const nextChildren = [
//     h('div', { key: 'A' }, 'A'),
//     h('div', { key: 'B' }, 'B'),
// ]

// 5.对比中间的部分
// 删除老的（在老的里面存在，但在新的里面不存在）
// 5.1
// a, b, (c, d), f, g
// a, b, (e, c), f, g
// d 节点在新的里面是没有的， 需要删除
// c 节点props 也发生变化了


// const prevChildren = [
//     h('div', { key: 'A' }, 'A'),
//     h('div', { key: 'B' }, 'B'),
//     h('div', { key: 'C', id: "c-prev" }, 'C'),
//     h('div', { key: 'D' }, 'D'),
//     h('div', { key: 'F' }, 'F'),
//     h('div', { key: 'G' }, 'G'),
// ]

// const nextChildren = [
//     h('div', { key: 'A' }, 'A'),
//     h('div', { key: 'B' }, 'B'),
//     h('div', { key: 'E' }, 'E'),
//     h('div', { key: 'C', id: "c-next" }, 'C'),
//     h('div', { key: 'F' }, 'F'),
//     h('div', { key: 'G' }, 'G'),
// ]

// 5.对比中间的部分
// 删除老的（在老的里面存在，但在新的里面不存在）
// 5.2
// a, b, (c, d, e,n), f, g
// a, b, (c, d), f, g
// e,n 节点在新的里面是没有的， 旧节点大部分都是需删除（优化删除逻辑， 将比对的完要更新的节点后，其它都是不需要的）
// c 节点props 也发生变化了


// const prevChildren = [
//     h('div', { key: 'A' }, 'A'),
//     h('div', { key: 'B' }, 'B'),
//     h('div', { key: 'C', id: "c-prev" }, 'C'),
//     h('div', { key: 'D' }, 'D'),
//     h('div', { key: 'E' }, 'E'),
//     h('div', { key: 'N' }, 'N'),
//     h('div', { key: 'F' }, 'F'),
//     h('div', { key: 'G' }, 'G'),
// ]

// const nextChildren = [
//     h('div', { key: 'A' }, 'A'),
//     h('div', { key: 'B' }, 'B'),
//     h('div', { key: 'D' }, 'D'),
//     h('div', { key: 'C', id: "c-next" }, 'C'),
//     h('div', { key: 'F' }, 'F'),
//     h('div', { key: 'G' }, 'G'),
// ]

// const prevChildren = [
//     h('div', { key: 'A' }, 'A'),
//     h('div', { key: 'B' }, 'B'),
//     h('div', { key: 'C' }, 'C'),
//     h('div', { key: 'D' }, 'D'),
//     h('div', { key: 'E' }, 'E'),
//     h('div', { key: 'F' }, 'F'),
//     h('div', { key: 'G' }, 'G'),
// ]

// const nextChildren = [
//     h('div', { key: 'A' }, 'A'),
//     h('div', { key: 'B' }, 'B'),
//     h('div', { key: 'E' }, 'E'),
//     h('div', { key: 'C' }, 'C'),
//     h('div', { key: 'D' }, 'D'),
//     h('div', { key: 'F' }, 'F'),
//     h('div', { key: 'G' }, 'G'),
// ]

// 复杂例子
// a, b, (c,d,e,z),f,g
// a, b, (d,c,y,z),f,g

// const prevChildren = [
//     h('div', { key: 'A' }, 'A'),
//     h('div', { key: 'B' }, 'B'),
//     h('div', { key: 'C' }, 'C'),
//     h('div', { key: 'D' }, 'D'),
//     h('div', { key: 'E' }, 'E'),
//     h('div', { key: 'Z' }, 'Z'),
//     h('div', { key: 'F' }, 'F'),
//     h('div', { key: 'G' }, 'G'),
// ]

// const nextChildren = [
//     h('div', { key: 'A' }, 'A'),
//     h('div', { key: 'B' }, 'B'),
//     h('div', { key: 'D' }, 'D'),
//     h('div', { key: 'C' }, 'C'),
//     h('div', { key: 'Y' }, 'Y'),
//     h('div', { key: 'E' }, 'E'),
//     h('div', { key: 'F' }, 'F'),
//     h('div', { key: 'G' }, 'G'),
// ]

// fix c 节点移动不应该新建
const prevChildren = [
    h('div', { key: 'A' }, 'A'),
    h('div', {}, 'C'),
    h('div', { key: 'B' }, 'B'),
    h('div', { key: 'D' }, 'D'),
]

const nextChildren = [
    h('div', { key: 'A' }, 'A'),
    h('div', { key: 'B' }, 'B'),
    h('div', {}, 'C'),
    h('div', { key: 'D' }, 'D'),
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