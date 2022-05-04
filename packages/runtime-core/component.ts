import { shallowReadonly } from "../reactivity/reactivity";
import { emit } from "./componentEmit";
import { initProps } from "./componentProps";
import { publicComponentHandlers } from "./ComponentPublicInstance";

export function createComponentInstance(vnode: any) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        el: null,
        props: {},
        emit: () => { }
    }

    component.emit = emit.bind(null, component) as any;

    return component;
}

export function setupComponent(instance: any) {
    initProps(instance, instance.vnode.props)
    // TODO: initSlots
    setupStatefulComponent(instance);
}

function setupStatefulComponent(instance: any) {
    const Component = instance.type;

    instance.proxy = new Proxy({ _: instance }, publicComponentHandlers)
    const { setup } = Component
    if (setup) {
        // function or object
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit,
        });

        handleSetupResult(instance, setupResult)
    }
}

function handleSetupResult(instance, setupResult: any) {
    if (typeof setupResult === 'object') {
        instance.setupState = setupResult;
    }
    finishComponentSetup(instance);
}

function finishComponentSetup(instance: any) {
    const Component = instance.type;
    instance.render = Component.render;
}

