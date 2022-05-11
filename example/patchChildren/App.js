import { h } from '../../lib/my-mini-vue.esm.js'
import ArrayToText from './ArrayToText.js'
import TextToText from './TextToText.js'
import TextToArray from './TextToArray.js'
// import ArrayToArray from './ArrayToArray.js'

export const App = {
    render() {
        return h(
            "div",
            { id: 'test', class: ['red'] },
            [
                h('p', { class: ['red', 'green'], }, 'Hi'),
                // h(ArrayToText),
                // h(TextToText),
                h(TextToArray),
                // h(ArrayToText),
            ]
        )

    },
    setup() {
        return {
            msg: 'my mini vu2e'
        }
    }
}