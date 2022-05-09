import { effect } from "../reactivity"
import { ShapeFlags } from "../shared/ShapeFlags"
import { createComponentInstance, setupComponent } from "./component"
import { createAppApi } from "./createApp"
import { Fragment, Text } from "./vnode"

export function createRenderer(options) {

    const { createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert } = options

    function render(vnode, container, currentComponent) {
        // patch
        patch(null, vnode, container, currentComponent)
    }
    // n1 ->新 n2 =>旧
    function patch(n1, n2: any, container: any, currentComponent) {
        //  判断是否是element 还是 component
        const { shapeFlag, type } = n2
        switch (type) {
            case Fragment:
                processFragment(n1, n2, container, currentComponent)
                break;
            case Text:
                processText(n1, n2, container)
                break;
            default:
                if (shapeFlag & ShapeFlags.ELEMENT) {
                    processElement(n1, n2, container, currentComponent)
                } else if (shapeFlag & ShapeFlags.STATEFULL_COMPONENT) {
                    processComponent(n1, n2, container, currentComponent)
                }
                break;
        }
    }

    function processComponent(n1, n2: any, container: any, currentComponent) {
        mountComponent(n2, container, currentComponent)
    }

    function mountComponent(initinalVnode: any, container, currentComponent) {
        const instance = createComponentInstance(initinalVnode, currentComponent);
        setupComponent(instance);
        setupRenderEffect(instance, initinalVnode, container)
    }

    function processElement(n1, n2: any, container: any, currentComponent) {
        if (!n1) {
            mountElement(n2, container, currentComponent)
        } else {
            patchElement(n1, n2, container)
        }
    }

    function patchElement(n1: any, n2, container) {
        console.log('patchElement')
        console.log('n1', n1)
        console.log('n2', n2)
    }

    function mountElement(vnode: any, container: any, currentComponent) {
        const el = vnode.el = hostCreateElement(vnode.type)
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
            patch(null, v, container, currentComponent)
        })
    }


    function processFragment(n1, n2: any, container: any, currentComponent) {
        mountChildren(n2, container, currentComponent)
    }

    function processText(n1, n2: any, container: any) {
        const { children } = n2;
        const textNode = n2.el = document.createTextNode(children)
        container.appendChild(textNode)
    }


    function setupRenderEffect(instance: any, initinalVnode, container) {
        effect(() => {
            if (!instance.isMounted) {
                const { proxy } = instance;
                const subTree = instance.subTree = instance.render.call(proxy);
                patch(null, subTree, container, instance)
                initinalVnode.el = subTree.el;
                instance.isMounted = true;
            } else {
                const { proxy } = instance;
                const preSubtree = instance.subTree;
                const subTree = instance.subTree = instance.render.call(proxy);
                patch(subTree, preSubtree, container, instance)
            }
        })
    }

    return {
        createApp: createAppApi(render)
    }
}