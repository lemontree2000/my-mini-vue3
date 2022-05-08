import { createRenderer } from '../runtime-core'

function createElement(type) {
    return document.createElement(type)
}

function patchProp(el, key, val) {
    if (Array.isArray(val) && key === 'class') {
        val = val.join(' ')
    }
    const isOn = (key) => /^on[A-Z]/g.test(key)
    if (isOn(key)) {
        const eventName = key.slice(2).toLowerCase();
        el.addEventListener(eventName, val)
    } else {
        el.setAttribute(key, val)
    }
}

function insert(el, parent) {
    parent.appendChild(el)
}

const renderer: any = createRenderer({
    createElement,
    patchProp,
    insert
})

export function createApp(...args) {
    return renderer.createApp(...args)
}

export * from '../runtime-core/index'
