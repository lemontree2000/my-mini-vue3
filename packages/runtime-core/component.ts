import { shallowReadonly } from "../reactivity/reactivity"
import { emit } from "./componentEmit";
import { initProps } from "./componentProps";
import { publicComponentHandlers } from "./ComponentPublicInstance";
import { initSlots } from "./componentSlots";
import { proxyRefs } from '../reactivity'

export function createComponentInstance(vnode: any, parent) {
    const component = {
        vnode,
        type: vnode.type,
        isMounted: false,
        subTree: {},
        next: null,
        setupState: {},
        providers: parent ? parent.providers : {},
        el: null,
        parent,
        props: {},
        slots: {},
        emit: () => { }
    }

    component.emit = emit.bind(null, component) as any;

    return component;
}

export function setupComponent(instance: any) {
    initProps(instance, instance.vnode.props)
    initSlots(instance, instance.vnode.children);
    setupStatefulComponent(instance);
}

function setupStatefulComponent(instance: any) {
    const Component = instance.type;

    instance.proxy = new Proxy({ _: instance }, publicComponentHandlers)
    const { setup } = Component
    if (setup) {

        setCurrentInstance(instance)
        // function or object
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit,
        });
        setCurrentInstance(null)


        handleSetupResult(instance, setupResult)
    }
}

function handleSetupResult(instance, setupResult: any) {
    if (typeof setupResult === 'object') {
        instance.setupState = proxyRefs(setupResult);
    }
    finishComponentSetup(instance);
}

function finishComponentSetup(instance: any) {
    const Component = instance.type;
    instance.render = Component.render;
}
let currentInstance = null

export function getCurrentInstance() {
    return currentInstance
}

function setCurrentInstance(instance) {
    currentInstance = instance
}