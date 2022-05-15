import { h, ref } from '../../lib/my-mini-vue.esm.js'
import Child from './Child.js'
export const App = {
    render() {
        return h(
            "div",
            { id: 'test', class: ['red'] },
            [
                h('button', { onClick: this.changeChildProps }, 'change child props'),
                h(Child, { msg: this.msg }),
                h('button', { onClick: this.chagneCount }, 'change self count'),
                h('p', {}, 'count:' + this.count),
            ]
        )

    },
    setup() {
        const msg = ref('123');
        const count = ref(1);
        window.msg = msg;

        const changeChildProps = () => {
            msg.value = '456'
        }

        const chagneCount = () => {
            count.value++
        }
        return {
            msg,
            count,
            chagneCount,
            changeChildProps
        }
    }
}