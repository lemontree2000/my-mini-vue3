const extend = Object.assign;
const isObject = (val) => {
    return val !== null && typeof val === 'object';
};
const hasOwn = (val, key) => {
    return Object.prototype.hasOwnProperty.call(val, key);
};
const camelize = (str) => {
    return str.replace(/-(\w)/g, (_, c) => {
        return c ? c.toUpperCase() : '';
    });
};
const toHandlerKey = (str) => {
    return str ? 'on' + capitalize(str) : '';
};
const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};

// { target: {key: [activeEffect] } }
const targetMap = new Map();
function trigger(target, key) {
    const depsMap = targetMap.get(target);
    const dep = depsMap.get(key);
    triggerEffect(dep);
}
function triggerEffect(dep) {
    dep.forEach(reactivityEffect => {
        if (!reactivityEffect.scheduler) {
            reactivityEffect.run();
        }
        else {
            reactivityEffect.scheduler();
        }
    });
}

function createGetter(isReadonly = false, shallow = false) {
    return function get(target, key) {
        if (key == ReactiveFlags.IS_REACTIVE) {
            return !isReadonly;
        }
        else if (key == ReactiveFlags.IS_READONLY) {
            return isReadonly;
        }
        const res = Reflect.get(target, key);
        if (shallow) {
            return res;
        }
        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactivity(res);
        }
        return res;
    };
}
function createSetter() {
    return function set(target, key, value) {
        const res = Reflect.set(target, key, value);
        // 触发依赖
        trigger(target, key);
        return res;
    };
}
const mutableHandlers = {
    get: createGetter(),
    set: createSetter(),
};
const readonlyHandlers = {
    get: createGetter(true),
    set(target, key, value) {
        console.warn(`key: ${key} set failed because target is readonly`, target);
        return true;
    },
};
const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
    get: createGetter(true, true),
});

var ReactiveFlags;
(function (ReactiveFlags) {
    ReactiveFlags["IS_REACTIVE"] = "__isReactivity__";
    ReactiveFlags["IS_READONLY"] = "__isReadOnly__";
})(ReactiveFlags || (ReactiveFlags = {}));
function reactivity(raw) {
    return createReactivityObject(raw, mutableHandlers);
}
function readonly(raw) {
    return createReactivityObject(raw, readonlyHandlers);
}
function shallowReadonly(raw) {
    return createReactivityObject(raw, shallowReadonlyHandlers);
}
function createReactivityObject(raw, baseHandlers) {
    if (!isObject(raw)) {
        console.warn(`raw: ${raw} is not an object`, raw);
        return;
    }
    return new Proxy(raw, baseHandlers);
}

function emit(instance, event, ...args) {
    console.log('emit:', event);
    const { props } = instance;
    const handlerName = toHandlerKey(camelize(event));
    const handler = props[handlerName];
    handler && handler(...args);
}

function initProps(instance, rawProps) {
    instance.props = rawProps || {};
    // attrs
}

const publicPropertiesMap = {
    $el: (i) => i.vnode.el,
    $slots: (i) => i.slots
};
const publicComponentHandlers = {
    get({ _: instance }, key) {
        const { setupState, props } = instance;
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            return props[key];
        }
        const getter = publicPropertiesMap[key];
        if (getter) {
            return getter(instance);
        }
    }
};

function initSlots(instance, children) {
    const { vnode } = instance;
    if (vnode.shapeFlag & 16 /* SLOT_CHILDREN */) {
        normalizeObjectSlots(children, instance);
    }
}
function normalizeObjectSlots(children, instance) {
    const slots = {};
    for (const key in children) {
        const value = children[key];
        slots[key] = (props) => normalizeSlotValue(value(props));
    }
    instance.slots = slots;
}
function normalizeSlotValue(value) {
    return Array.isArray(value) ? value : [value];
}

function createComponentInstance(vnode, parent) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        providers: parent ? parent.providers : {},
        el: null,
        parent,
        props: {},
        slots: {},
        emit: () => { }
    };
    component.emit = emit.bind(null, component);
    return component;
}
function setupComponent(instance) {
    initProps(instance, instance.vnode.props);
    initSlots(instance, instance.vnode.children);
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    const Component = instance.type;
    instance.proxy = new Proxy({ _: instance }, publicComponentHandlers);
    const { setup } = Component;
    if (setup) {
        setCurrentInstance(instance);
        // function or object
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit,
        });
        setCurrentInstance(null);
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    if (typeof setupResult === 'object') {
        instance.setupState = setupResult;
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const Component = instance.type;
    instance.render = Component.render;
}
let currentInstance = null;
function getCurrentInstance() {
    return currentInstance;
}
function setCurrentInstance(instance) {
    currentInstance = instance;
}

const Fragment = Symbol("Fragment");
const Text = Symbol("Text");
function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        shapeFlag: getShapeFlag(type)
    };
    // children
    if (typeof children === "string") {
        vnode.shapeFlag |= 4 /* TEXT_CHILDREN */;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlag |= 8 /* ARRAY_CHILDREN */;
    }
    if (vnode.shapeFlag & 2 /* STATEFULL_COMPONENT */) {
        if (typeof children === "object") {
            vnode.shapeFlag |= 16 /* SLOT_CHILDREN */;
        }
    }
    return vnode;
}
function createTextVNode(text) {
    return createVNode(Text, {}, text);
}
function getShapeFlag(type) {
    return typeof type === 'string'
        ? 1 /* ELEMENT */
        : 2 /* STATEFULL_COMPONENT */;
}

function render(vnode, container, currentComponent) {
    // patch
    patch(vnode, container, currentComponent);
}
function patch(vnode, container, currentComponent) {
    //  判断是否是element 还是 component
    const { shapeFlag, type } = vnode;
    switch (type) {
        case Fragment:
            processFragment(vnode, container, currentComponent);
            break;
        case Text:
            processText(vnode, container);
            break;
        default:
            if (shapeFlag & 1 /* ELEMENT */) {
                processElement(vnode, container, currentComponent);
            }
            else if (shapeFlag & 2 /* STATEFULL_COMPONENT */) {
                processComponent(vnode, container, currentComponent);
            }
            break;
    }
}
function processComponent(vnode, container, currentComponent) {
    mountComponent(vnode, container, currentComponent);
}
function mountComponent(initinalVnode, container, currentComponent) {
    const instance = createComponentInstance(initinalVnode, currentComponent);
    setupComponent(instance);
    setupRenderEffect(instance, initinalVnode, container);
}
function setupRenderEffect(instance, initinalVnode, container) {
    const { proxy } = instance;
    const subTree = instance.render.call(proxy);
    patch(subTree, container, instance);
    initinalVnode.el = subTree.el;
}
function processElement(vnode, container, currentComponent) {
    mountElement(vnode, container, currentComponent);
}
function mountElement(vnode, container, currentComponent) {
    const el = vnode.el = document.createElement(vnode.type);
    const props = vnode.props;
    for (const key in props) {
        let val = props[key];
        if (Array.isArray(val) && key === 'class') {
            val = val.join(' ');
        }
        const isOn = (key) => /^on[A-Z]/g.test(key);
        if (isOn(key)) {
            const eventName = key.slice(2).toLowerCase();
            el.addEventListener(eventName, val);
        }
        else {
            el.setAttribute(key, val);
        }
    }
    const { shapeFlag } = vnode;
    if (shapeFlag & 4 /* TEXT_CHILDREN */) {
        el.textContent = vnode.children;
    }
    else if (Array.isArray(vnode.children)) {
        mountChildren(vnode, el, currentComponent);
    }
    container.appendChild(el);
}
function mountChildren(vnode, container, currentComponent) {
    vnode.children.forEach((v) => {
        patch(v, container, currentComponent);
    });
}
function processFragment(vnode, container, currentComponent) {
    mountChildren(vnode, container, currentComponent);
}
function processText(vnode, container) {
    const { children } = vnode;
    const textNode = vnode.el = document.createTextNode(children);
    container.appendChild(textNode);
}

function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            const vnode = createVNode(rootComponent);
            render(vnode, rootContainer);
        }
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

function renderSlots(slots, name, props) {
    const slot = slots[name];
    if (slot) {
        if (typeof slot === 'function') {
            return createVNode(Fragment, {}, slot(props));
        }
    }
}

function provider(key, value) {
    const currentInstance = getCurrentInstance();
    // 存值
    if (currentInstance) {
        let { providers } = currentInstance;
        const parentProviders = currentInstance.parent.providers;
        // 只有首次才执行
        if (parentProviders === providers) {
            // 原型链
            providers = currentInstance.providers = Object.create(parentProviders);
        }
        providers[key] = value;
    }
}
function inject(key, defaultValue) {
    // 取值 
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        const parentProviders = currentInstance.parent.providers;
        if (key in parentProviders) {
            return parentProviders[key];
        }
        else if (defaultValue) {
            if (typeof defaultValue === 'function') {
                return defaultValue();
            }
            return defaultValue;
        }
    }
}

export { createApp, createTextVNode, getCurrentInstance, h, inject, provider, renderSlots };
