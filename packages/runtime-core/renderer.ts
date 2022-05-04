import { isObject } from "../shared/index"
import { ShapeFlags } from "../shared/ShapeFlags"
import { createComponentInstance, setupComponent } from "./component"


export function render(vnode, container) {
    // patch
    patch(vnode, container)
}

function patch(vnode: any, container: any) {
    //  判断是否是element 还是 component
    const { shapeFlag } = vnode
    if (shapeFlag & ShapeFlags.ELEMENT) {
        processElement(vnode, container)
    } else if (shapeFlag & ShapeFlags.STATEFULL_COMPONENT) {
        processComponent(vnode, container)
    }
}

function processComponent(vnode: any, container: any) {
    mountComponent(vnode, container)
}

function mountComponent(initinalVnode: any, container) {
    const instance = createComponentInstance(initinalVnode);
    setupComponent(instance);
    setupRenderEffect(instance, initinalVnode, container)
}

function setupRenderEffect(instance: any, initinalVnode, container) {
    const { proxy } = instance;
    const subTree = instance.render.call(proxy);
    patch(subTree, container)
    initinalVnode.el = subTree.el;
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
    const { shapeFlag } = vnode;
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
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

