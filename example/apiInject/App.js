import { h, provider, inject } from '../../lib/my-mini-vue.esm.js'


const Consumer = {
    name: 'consumer',
    setup() {
        const foo = inject("foo")
        const bar = inject("bar")
        return {
            foo,
            bar,
        }
    },
    render() {
        return h('div', {}, `Consumer: -${this.foo} - ${this.bar}`)
    }
}
const Provider2 = {
    name: "provider",
    setup() {
        provider('foo', 'fooTwo')
        const foo = inject('foo')
        const baz = inject('baZ', () => 'defaultBaz')
        return {
            foo,
            baz
        }
    },
    render() {
        return h('div', {}, [h("p", {}, `provider2, -${this.foo} - ${this.baz}`), h(Consumer)])
    }
}




const Provider = {
    name: "provider",
    setup() {
        provider('foo', 'fooval')
        provider('bar', 'barVal')

    },
    render() {
        return h('div', {}, [h("p", {}, "provider"), h(Provider2)])
    }
}

export const App = {
    render() {
        return h(Provider, {})
    },
    setup() {
        return {
            msg: 'my mini vu2e'
        }
    }
}