import { createRenderer } from '../runtime-core'

function createElement(type) {
    return document.createElement(type)
}

function patchProp(el, key, prevVal, nextVal) {
    if (Array.isArray(nextVal) && key === 'class') {
        nextVal = nextVal.join(' ')
    }
    const isOn = (key) => /^on[A-Z]/g.test(key)
    if (isOn(key)) {
        const eventName = key.slice(2).toLowerCase();
        el.addEventListener(eventName, nextVal)
    } else {
        if (nextVal === undefined || nextVal === null) {
            el.removeAttribute(key)
        } else {
            el.setAttribute(key, nextVal)
        }
    }
}

function insert(child, parent, anchor) {
    parent.insertBefore(child, anchor || null)
}

function remove(el) {
    const parent = el.parentNode
    if (parent) {
        parent.removeChild(el)
    }
}


function setElementText(el, text) {
    el.textContent = text
}

const renderer: any = createRenderer({
    createElement,
    patchProp,
    insert,
    remove,
    setElementText
})

export function createApp(...args) {
    return renderer.createApp(...args)
}

export * from '../runtime-core/index'
