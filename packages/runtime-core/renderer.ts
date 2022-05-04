import { isObject } from "../shared/index"
import { createComponentInstance, setupComponent } from "./component"


export function render(vnode, container) {
    // patch
    patch(vnode, container)
}

function patch(vnode: any, container: any) {
    // TODO: 判断是否是element 还是 component
    console.log(vnode.type)
    if (typeof vnode.type === 'string') {
        processElement(vnode, container)
    } else if (isObject(vnode.type)) {
        processComponent(vnode, container)
    }
}

function processComponent(vnode: any, container: any) {
    mountComponent(vnode, container)
}

function mountComponent(vnode: any, container) {
    const instance = createComponentInstance(vnode);
    setupComponent(instance);
    setupRenderEffect(instance, vnode, container)
}

function setupRenderEffect(instance: any, vnode, container) {
    const { proxy } = instance;
    const subTree = instance.render.call(proxy);
    patch(subTree, container)
    vnode.el = subTree.el;
}

function processElement(vnode: any, container: any) {
    mountElement(vnode, container)
}

function mountElement(vnode: any, container: any) {
    const el = vnode.el = document.createElement(vnode.type)

    const props = vnode.props

    for (const key in props) {
        let val = props[key]
        if (Array.isArray(val) && key === 'class') {
            val = val.join(' ')
        }
        el.setAttribute(key, val)
    }
    if (typeof vnode.children === 'string') {
        el.textContent = vnode.children
    } else if (Array.isArray(vnode.children)) {
        mountChildren(vnode, el)
    }

    container.appendChild(el)
}

function mountChildren(vnode: any, container: any) {
    vnode.children.forEach((v) => {
        patch(v, container)
    })
}

