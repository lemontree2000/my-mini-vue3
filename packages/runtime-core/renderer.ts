import { effect } from "../reactivity"
import { EMPTY_OBJ } from "../shared"
import { ShapeFlags } from "../shared/ShapeFlags"
import { createComponentInstance, setupComponent } from "./component"
import { createAppApi } from "./createApp"
import { Fragment, Text } from "./vnode"

export function createRenderer(options) {

    const {
        createElement: hostCreateElement,
        patchProp: hostPatchProp,
        insert: hostInsert,
        remove: hostRemove,
        setElementText: hostSetElementText
    } = options

    function render(vnode, container, currentComponent) {
        // patch
        patch(null, vnode, container, currentComponent, null)
    }
    // n1 ->新 n2 =>旧
    function patch(n1, n2: any, container: any, currentComponent, anchor) {
        //  判断是否是element 还是 component
        const { shapeFlag, type } = n2
        switch (type) {
            case Fragment:
                processFragment(n1, n2, container, currentComponent, anchor)
                break;
            case Text:
                processText(n1, n2, container)
                break;
            default:
                if (shapeFlag & ShapeFlags.ELEMENT) {
                    processElement(n1, n2, container, currentComponent, anchor)
                } else if (shapeFlag & ShapeFlags.STATEFULL_COMPONENT) {
                    processComponent(n1, n2, container, currentComponent, anchor)
                }
                break;
        }
    }

    function processComponent(n1, n2: any, container: any, currentComponent, anchor) {
        mountComponent(n2, container, currentComponent, anchor)
    }

    function mountComponent(initinalVnode: any, container, currentComponent, anchor) {
        const instance = createComponentInstance(initinalVnode, currentComponent);
        setupComponent(instance);
        setupRenderEffect(instance, initinalVnode, container, anchor);
    }

    function processElement(n1, n2: any, container: any, currentComponent, anchor) {
        if (!n1) {
            mountElement(n2, container, currentComponent, anchor)
        } else {
            patchElement(n1, n2, container, currentComponent, anchor)
        }
    }

    function patchElement(n1: any, n2, container, parentComponent, anchor) {
        const newProps = n1.props || EMPTY_OBJ;
        const oldProps = n2.props || EMPTY_OBJ;
        const el = n2.el = n1.el
        patchProps(el, oldProps, newProps)
        patchChildren(n1, n2, el, parentComponent, anchor)
    }

    function patchChildren(n1: any, n2: any, container: any, parentComponent, anchor) {

        const { shapeFlag } = n2
        const prevShapeFlag = n1.shapeFlag
        const c1 = n1.children;
        const c2 = n2.children; // 新

        // 新的是文本
        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            // 旧的事数组
            if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                // 1. 把老的children 清空
                unmountChildren(c1);
            }
            if (c1 !== c2) {
                hostSetElementText(container, c2)
            }
        } else {
            if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
                hostSetElementText(container, '')
                mountChildren(c2, container, parentComponent, anchor)
            } else {
                // array diff  array
                patchKeyedChildren(c1, c2, container, parentComponent, anchor)
            }
        }
    }

    function isSomeVNodeType(n1, n2) {
        return n1.type === n2.type && n1.key === n2.key
    }
    function patchKeyedChildren(c1, c2, container, parentComponent, parentAnchor) {
        let i = 0;
        let e1 = c1.length - 1;
        let l2 = c2.length;
        let e2 = l2 - 1;
        // 左侧对比 
        while (i <= e1 && i <= e2) {
            const n1 = c1[i];
            const n2 = c2[i];
            if (isSomeVNodeType(n1, n2)) {
                patch(n1, n2, container, parentComponent, parentAnchor)
            } else {
                break;
            }
            i++
        }
        // 此时的i 代表不同节点开始位置ab -> abd 这时候的i则为2

        // 右侧对比
        while (i <= e1 && i <= e2) {
            const n1 = c1[e1];
            const n2 = c2[e2];

            if (isSomeVNodeType(n1, n2)) {
                patch(n1, n2, container, parentComponent, parentAnchor)
            } else {
                break;
            }
            e1--;
            e2--;
        }

        // 此时e1 和 e2 代表 右侧开始不同节点的位置 e1 = 1, e2 = 2;

        // 3. 新的比老的多 创建
        if (i > e1) {
            if (i <= e2) {
                const nextPos = e2 + 1;
                const anchor = nextPos < l2 ? c2[nextPos].el : null;
                while (i <= e2) {
                    patch(null, c2[i], container, parentComponent, anchor)
                    i++
                }
            }
        } else if (i > e2) {
            while (i <= e1) {
                hostRemove(c1[i].el)
                i++
            }
        }
        console.log(i)
    }

    function unmountChildren(children: any) {
        for (let i = 0; i < children.length; i++) {
            const el = children[i].el;
            hostRemove(el)
        }
    }

    function patchProps(el, oldProps, newProps) {
        if (oldProps !== newProps) {
            for (const key in newProps) {
                const prevProp = oldProps[key]
                const nextProp = newProps[key]
                if (prevProp !== nextProp) {
                    hostPatchProp(el, key, prevProp, nextProp)
                }
            }
            if (oldProps !== EMPTY_OBJ) {
                for (const key in oldProps) {
                    if (!(key in newProps)) {
                        hostPatchProp(el, key, oldProps[key], null)
                    }
                }
            }
        }
    }


    function mountElement(vnode: any, container: any, currentComponent, anchor) {
        const el = vnode.el = hostCreateElement(vnode.type)
        const props = vnode.props

        for (const key in props) {
            let val = props[key]
            hostPatchProp(el, key, null, val)

        }
        const { shapeFlag } = vnode;
        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            el.textContent = vnode.children
        } else if (Array.isArray(vnode.children)) {
            mountChildren(vnode.children, el, currentComponent, anchor)
        }

        hostInsert(el, container, anchor)
    }

    function mountChildren(children: any, container: any, currentComponent, anchor) {
        children.forEach((v) => {
            patch(null, v, container, currentComponent, anchor)
        })
    }


    function processFragment(n1, n2: any, container: any, currentComponent, anchor) {
        mountChildren(n2.children, container, currentComponent, anchor)
    }

    function processText(n1, n2: any, container: any) {
        const { children } = n2;
        const textNode = n2.el = document.createTextNode(children)
        container.appendChild(textNode)
    }


    function setupRenderEffect(instance: any, initinalVnode, container, anchor) {
        effect(() => {
            if (!instance.isMounted) {
                const { proxy } = instance;
                const subTree = instance.subTree = instance.render.call(proxy);
                patch(null, subTree, container, instance, anchor)
                initinalVnode.el = subTree.el;
                instance.isMounted = true;
            } else {
                const { proxy } = instance;
                const preSubtree = instance.subTree;
                const nextSubTree = instance.subTree = instance.render.call(proxy);
                patch(preSubtree, nextSubTree, container, instance, anchor)
            }
        })
    }

    return {
        createApp: createAppApi(render)
    }
}