import { getCurrentInstance, h, nextTick, ref } from '../../lib/my-mini-vue.esm.js'
export const App = {
    render() {
        console.log(this)
        const button = h("button", { onClick: this.update }, "update");
        const p = h("p", {}, "count:" + this.count)
        return h(
            "div",
            { id: 'test', class: ['red'] },
            [
                button,
                p
            ]
        )

    },
    setup() {
        const count = ref(0)
        const instance = getCurrentInstance()
        const update = async () => {
            for (let i = 0; i < 100; i++) {
                count.value = i
            }

            // nextTick(() => {
            //     console.log(instance.vnode.el.innerHTML)
            // })
            await nextTick();
            console.log(instance.vnode.el.innerHTML)

        }
        return {
            msg: 'my mini vu2e',
            count,
            update,
        }
    }
}