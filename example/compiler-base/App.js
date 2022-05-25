import { ref } from '../../lib/my-mini-vue.esm.js'
export const App = {
    template: '<div>hi {{msg}}{{count}}</div>',
    setup() {
        const count = window.count = ref(1);
        return {
            msg: 'my mini vu2e',
            count,
        }
    }
}