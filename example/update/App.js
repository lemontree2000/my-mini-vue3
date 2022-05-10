import { h, ref } from '../../lib/my-mini-vue.esm.js'
export const App = {
    render() {
        return h(
            "div",
            { id: 'root', ...this.props },
            [
                h('div', {}, `Hi count:${this.count}`),
                h('button', { onClick: this.onChangePropsDemo1 }, `onChangePropsDemo1-值改变了-修改`),
                h('button', { onClick: this.onChangePropsDemo2 }, `onChangePropsDemo1-值变成了undefined-删除`),
                h('button', { onClick: this.onChangePropsDemo3 }, `onChangePropsDemo1-key在新的黎明没有-删除`),
            ]
        )

    },
    setup() {
        const count = ref(0)

        const onClick = () => {
            count.value++
        }

        const props = ref({
            foo: "foo",
            bar: "bar",
        })

        const onChangePropsDemo1 = () => {
            props.value.foo = "new-foo"
        }
        const onChangePropsDemo2 = () => {
            props.value.foo = undefined
        }
        const onChangePropsDemo3 = () => {
            props.value = {
                foo: "ffo"
            }
        }
        return {
            count,
            props,
            onClick,
            onChangePropsDemo1,
            onChangePropsDemo2,
            onChangePropsDemo3
        }
    }
}