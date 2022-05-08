import { isObject } from "../shared/index"
import { ShapeFlags } from "../shared/ShapeFlags"
import { createComponentInstance, setupComponent } from "./component"
import { createAppApi } from "./createApp"
import { Fragment, Text } from "./vnode"

export function createRenderer(options) {

    const { createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert } = options

    function render(vnode, container, currentComponent) {
        // patch
        patch(vnode, container, currentComponent)
    }

    function patch(vnode: any, container: any, currentComponent) {
        //  判断是否是element 还是 component
        const { shapeFlag, type } = vnode
        switch (type) {
            case Fragment:
                processFragment(vnode, container, currentComponent)
                break;
            case Text:
                processText(vnode, container)
                break;
            default:
                if (shapeFlag & ShapeFlags.ELEMENT) {
                    processElement(vnode, container, currentComponent)
                } else if (shapeFlag & ShapeFlags.STATEFULL_COMPONENT) {
                    processComponent(vnode, container, currentComponent)
                }
                break;
        }
    }

    function processComponent(vnode: any, container: any, currentComponent) {
        mountComponent(vnode, container, currentComponent)
    }

    function mountComponent(initinalVnode: any, container, currentComponent) {
        const instance = createComponentInstance(initinalVnode, currentComponent);
        setupComponent(instance);
        setupRenderEffect(instance, initinalVnode, container)
    }

    function setupRenderEffect(instance: any, initinalVnode, container) {
        const { proxy } = instance;
        const subTree = instance.render.call(proxy);
        patch(subTree, container, instance)
        initinalVnode.el = subTree.el;
    }

    function processElement(vnode: any, container: any, currentComponent) {
        mountElement(vnode, container, currentComponent)
    }

    function mountElement(vnode: any, container: any, currentComponent) {
        const el = vnode.el = hostCreateElement(vnode.type)
        // const el = vnode.el = document.createElement(vnode.type)

        const props = vnode.props

        for (const key in props) {
            let val = props[key]
            hostPatchProp(el, key, val)

        }
        const { shapeFlag } = vnode;
        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            el.textContent = vnode.children
        } else if (Array.isArray(vnode.children)) {
            mountChildren(vnode, el, currentComponent)
        }

        hostInsert(el, container)
    }

    function mountChildren(vnode: any, container: any, currentComponent) {
        vnode.children.forEach((v) => {
            patch(v, container, currentComponent)
        })
    }


    function processFragment(vnode: any, container: any, currentComponent) {
        mountChildren(vnode, container, currentComponent)
    }

    function processText(vnode: any, container: any) {
        const { children } = vnode;
        const textNode = vnode.el = document.createTextNode(children)
        container.appendChild(textNode)
    }

    return {
        createApp: createAppApi(render)
    }
}