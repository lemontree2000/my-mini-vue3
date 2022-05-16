const Fragment = Symbol("Fragment");
const Text = Symbol("Text");
function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        key: props === null || props === void 0 ? void 0 : props.key,
        children,
        component: null,
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

const extend = Object.assign;
const isObject = (val) => {
    return val !== null && typeof val === 'object';
};
const hasChanged = (val, newVal) => {
    return !Object.is(val, newVal);
};
const hasOwn = (val, key) => {
    return Object.prototype.hasOwnProperty.call(val, key);
};
const EMPTY_OBJ = {};
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

let activeEffect;
let shouldTrack;
class ReactiveEffect {
    constructor(fn, scheduler) {
        this.deps = [];
        this.active = true;
        this._fn = fn;
        this.scheduler = scheduler;
    }
    run() {
        // 如果stop了则不需要收集依赖了
        if (!this.active) {
            return this._fn();
        }
        activeEffect = this;
        // shouldTrack 控制只有 _fn 里面使用obj.value 才会触发get 搜集依赖
        shouldTrack = true;
        const result = this._fn();
        shouldTrack = false;
        return result;
    }
    stop() {
        // 防止重复清空
        if (this.active) {
            cleanupEffect(this);
            this.onStop && this.onStop();
            this.active = false;
        }
    }
}
function cleanupEffect(effect) {
    effect.deps.forEach((dep) => {
        dep.delete(effect);
    });
}
// { target: {key: [activeEffect] } }
const targetMap = new Map();
function track(target, key) {
    if (!isTracking())
        return;
    let depsMap = targetMap.get(target);
    if (!depsMap) {
        depsMap = new Map();
        targetMap.set(target, depsMap);
    }
    let dep = depsMap.get(key);
    if (!dep) {
        dep = new Set();
        depsMap.set(key, dep);
    }
    trackEffect(dep);
}
function trackEffect(dep) {
    if (dep.has(activeEffect))
        return;
    dep.add(activeEffect);
    activeEffect.deps.push(dep);
}
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
function effect(fn, options = {}) {
    const _effect = new ReactiveEffect(fn, options.scheduler);
    _effect.run();
    const runner = _effect.run.bind(_effect);
    extend(_effect, options);
    runner.effect = _effect;
    return runner;
}
function isTracking() {
    // 没有使用effect 则没有activeEffect
    // 触发track 但是不一定要收集, shouldTrack 控制是否搜集
    return shouldTrack && activeEffect !== undefined;
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
        if (!isReadonly) {
            // 搜集依赖
            track(target, key);
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
    $slots: (i) => i.slots,
    $props: (i) => i.props
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

class RefImpl {
    constructor(value) {
        this.__isRef__ = true;
        this._innerValue = convertValue(value);
        this._rawValue = value;
        this.dep = new Set();
    }
    get value() {
        if (isTracking()) {
            trackEffect(this.dep);
        }
        return this._innerValue;
    }
    set value(newVal) {
        if (hasChanged(this._rawValue, newVal)) {
            this._innerValue = convertValue(newVal);
            this._rawValue = newVal;
            triggerEffect(this.dep);
        }
    }
}
function convertValue(val) {
    return isObject(val) ? reactivity(val) : val;
}
function ref(value) {
    return new RefImpl(value);
}
function isRef(ref) {
    return !!ref.__isRef__;
}
function unRef(ref) {
    return isRef(ref) ? ref.value : ref;
}
function proxyRefs(raw) {
    return new Proxy(raw, {
        get(target, key) {
            return unRef(Reflect.get(target, key));
        },
        set(target, key, value) {
            if (isRef(target[key]) && !isRef(value)) {
                return target[key].value = value;
            }
            else {
                return Reflect.set(target, key, value);
            }
        }
    });
}

function createComponentInstance(vnode, parent) {
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
        instance.setupState = proxyRefs(setupResult);
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

// import { render } from "./renderer";
function createAppApi(render) {
    return function createApp(rootComponent) {
        return {
            mount(rootContainer) {
                const vnode = createVNode(rootComponent);
                render(vnode, rootContainer, null);
            }
        };
    };
}

const queue = [];
let isFlushPending = false;
const p = Promise.resolve();
function nextTick(fn) {
    return fn ? p.then(fn) : p;
}
function queueJobs(job) {
    if (!queue.includes(job)) {
        queue.push(job);
    }
    queueflush();
}
function queueflush() {
    if (!isFlushPending) {
        isFlushPending = true;
    }
    else {
        return;
    }
    nextTick(flushJobs);
}
function flushJobs() {
    isFlushPending = false;
    let job;
    while (job = queue.shift()) {
        job && job();
    }
}

function shouldUpdateComponent(prevVNode, nextVNode) {
    const { props: prevProps } = prevVNode;
    const { props: nextProps } = nextVNode;
    for (const key in nextProps) {
        if (nextProps[key] !== prevProps[key]) {
            return true;
        }
    }
    return false;
}

function createRenderer(options) {
    const { createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert, remove: hostRemove, setElementText: hostSetElementText } = options;
    function render(vnode, container, currentComponent) {
        // patch
        patch(null, vnode, container, currentComponent, null);
    }
    // n1 ->新 n2 =>旧
    function patch(n1, n2, container, currentComponent, anchor) {
        //  判断是否是element 还是 component
        const { shapeFlag, type } = n2;
        switch (type) {
            case Fragment:
                processFragment(n1, n2, container, currentComponent, anchor);
                break;
            case Text:
                processText(n1, n2, container);
                break;
            default:
                if (shapeFlag & 1 /* ELEMENT */) {
                    processElement(n1, n2, container, currentComponent, anchor);
                }
                else if (shapeFlag & 2 /* STATEFULL_COMPONENT */) {
                    processComponent(n1, n2, container, currentComponent, anchor);
                }
                break;
        }
    }
    function processComponent(n1, n2, container, currentComponent, anchor) {
        if (!n1) {
            mountComponent(n2, container, currentComponent, anchor);
        }
        else {
            updateComponent(n1, n2);
        }
    }
    function updateComponent(n1, n2) {
        const instance = n2.component = n1.component;
        if (shouldUpdateComponent(n1, n2)) {
            instance.next = n2;
            instance.update();
        }
        else {
            n2.el = n1.el;
            n2.vnode = n2;
        }
    }
    function mountComponent(initinalVnode, container, currentComponent, anchor) {
        const instance = initinalVnode.component = createComponentInstance(initinalVnode, currentComponent);
        setupComponent(instance);
        setupRenderEffect(instance, initinalVnode, container, anchor);
    }
    function processElement(n1, n2, container, currentComponent, anchor) {
        if (!n1) {
            mountElement(n2, container, currentComponent, anchor);
        }
        else {
            patchElement(n1, n2, container, currentComponent, anchor);
        }
    }
    function patchElement(n1, n2, container, parentComponent, anchor) {
        const newProps = n2.props || EMPTY_OBJ;
        const oldProps = n1.props || EMPTY_OBJ;
        const el = n2.el = n1.el;
        patchProps(el, oldProps, newProps);
        patchChildren(n1, n2, el, parentComponent, anchor);
    }
    function patchChildren(n1, n2, container, parentComponent, anchor) {
        const { shapeFlag } = n2;
        const prevShapeFlag = n1.shapeFlag;
        const c1 = n1.children;
        const c2 = n2.children; // 新
        // 新的是文本
        if (shapeFlag & 4 /* TEXT_CHILDREN */) {
            // 旧的事数组
            if (prevShapeFlag & 8 /* ARRAY_CHILDREN */) {
                // 1. 把老的children 清空
                unmountChildren(c1);
            }
            if (c1 !== c2) {
                hostSetElementText(container, c2);
            }
        }
        else {
            if (prevShapeFlag & 4 /* TEXT_CHILDREN */) {
                hostSetElementText(container, '');
                mountChildren(c2, container, parentComponent, anchor);
            }
            else {
                // array diff  array
                patchKeyedChildren(c1, c2, container, parentComponent, anchor);
            }
        }
    }
    function isSomeVNodeType(n1, n2) {
        return n1.type === n2.type && n1.key === n2.key;
    }
    function patchKeyedChildren(c1, c2, container, parentComponent, parentAnchor) {
        let i = 0;
        let e1 = c1.length - 1;
        let l2 = c2.length;
        let e2 = l2 - 1;
        // e1 代表旧节点的尾部, e2 代表新节点的尾部
        // 左侧对比 
        while (i <= e1 && i <= e2) {
            const n1 = c1[i];
            const n2 = c2[i];
            if (isSomeVNodeType(n1, n2)) {
                patch(n1, n2, container, parentComponent, parentAnchor);
            }
            else {
                break;
            }
            i++;
        }
        // 此时的i 代表不同节点开始位置ab -> abd 这时候的i则为2
        // 右侧对比
        while (i <= e1 && i <= e2) {
            const n1 = c1[e1];
            const n2 = c2[e2];
            if (isSomeVNodeType(n1, n2)) {
                patch(n1, n2, container, parentComponent, parentAnchor);
            }
            else {
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
                    patch(null, c2[i], container, parentComponent, anchor);
                    i++;
                }
            }
        }
        else if (i > e2) {
            while (i <= e1) {
                hostRemove(c1[i].el);
                i++;
            }
        }
        else {
            // 中间对比
            let s1 = i;
            let s2 = i;
            const toBePatched = e2 - s2 + 1; // 需要更新的新节点数量
            // 建立新的节点key和index的映射表
            const keyToNewIndexMap = new Map();
            const newIndexToOldIndexMap = new Array(toBePatched);
            let moved = false;
            let maxNewIndexSoFar = 0;
            for (let i = 0; i < toBePatched; i++) {
                newIndexToOldIndexMap[i] = 0;
            }
            for (let i = s2; i <= e2; i++) {
                const nextChild = c2[i];
                keyToNewIndexMap.set(nextChild.key, i);
            }
            // 去旧节点里面找相同的和不同的 
            let newIndex;
            let patched = 0;
            for (let i = s1; i <= e1; i++) {
                const prevChild = c1[i];
                if (patched >= toBePatched) {
                    hostRemove(prevChild.el);
                    continue;
                }
                if (prevChild.key != null) {
                    newIndex = keyToNewIndexMap.get(prevChild.key);
                }
                else {
                    // 没有key则循环用旧的节点去新的childre里面对比
                    for (let j = s2; j <= e2; j++) {
                        if (isSomeVNodeType(prevChild, c2[j])) {
                            // 找到了
                            newIndex = j;
                            break;
                        }
                    }
                }
                // 如果到这里还没找到，那代表 旧的节点在新的children里面不存在
                if (newIndex === undefined) {
                    hostRemove(prevChild.el);
                }
                else {
                    if (newIndex >= maxNewIndexSoFar) {
                        maxNewIndexSoFar = newIndex;
                    }
                    else {
                        moved = true;
                    }
                    // 获取需要更新元素中的索引 这里加1处理了
                    newIndexToOldIndexMap[newIndex - s2] = i + 1;
                    patch(prevChild, c2[newIndex], container, parentComponent, null);
                    patched++;
                }
            }
            // 获取最长子序列 ，是一个所以的数组 [1,2]
            const increasingNewIndexSequence = moved ? getSequence(newIndexToOldIndexMap) : [];
            let j = increasingNewIndexSequence.length - 1;
            //查找也更新的节点是否在最长子序列中，在则不需要处理， 不在则移动位置
            for (let i = toBePatched; i >= 0; i--) {
                const nextIndex = i + s2;
                const nextChild = c2[nextIndex];
                const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : null;
                if (newIndexToOldIndexMap[i] === 0) {
                    patch(null, nextChild, container, parentComponent, anchor);
                }
                else if (moved) {
                    if (j < 0 || i !== increasingNewIndexSequence[j]) {
                        console.log('移动位置');
                        hostInsert(nextChild.el, container, anchor);
                    }
                    else {
                        j--;
                    }
                }
            }
        }
        console.log(i);
    }
    function unmountChildren(children) {
        for (let i = 0; i < children.length; i++) {
            const el = children[i].el;
            hostRemove(el);
        }
    }
    function patchProps(el, oldProps, newProps) {
        if (oldProps !== newProps) {
            for (const key in newProps) {
                const prevProp = oldProps[key];
                const nextProp = newProps[key];
                if (prevProp !== nextProp) {
                    hostPatchProp(el, key, prevProp, nextProp);
                }
            }
            if (oldProps !== EMPTY_OBJ) {
                for (const key in oldProps) {
                    if (!(key in newProps)) {
                        hostPatchProp(el, key, oldProps[key], null);
                    }
                }
            }
        }
    }
    function mountElement(vnode, container, currentComponent, anchor) {
        const el = vnode.el = hostCreateElement(vnode.type);
        const props = vnode.props;
        for (const key in props) {
            let val = props[key];
            hostPatchProp(el, key, null, val);
        }
        const { shapeFlag } = vnode;
        if (shapeFlag & 4 /* TEXT_CHILDREN */) {
            el.textContent = vnode.children;
        }
        else if (Array.isArray(vnode.children)) {
            mountChildren(vnode.children, el, currentComponent, anchor);
        }
        hostInsert(el, container, anchor);
    }
    function mountChildren(children, container, currentComponent, anchor) {
        children.forEach((v) => {
            patch(null, v, container, currentComponent, anchor);
        });
    }
    function processFragment(n1, n2, container, currentComponent, anchor) {
        mountChildren(n2.children, container, currentComponent, anchor);
    }
    function processText(n1, n2, container) {
        const { children } = n2;
        const textNode = n2.el = document.createTextNode(children);
        container.appendChild(textNode);
    }
    function setupRenderEffect(instance, initinalVnode, container, anchor) {
        instance.update = effect(() => {
            if (!instance.isMounted) {
                const { proxy } = instance;
                const subTree = instance.subTree = instance.render.call(proxy);
                patch(null, subTree, container, instance, anchor);
                initinalVnode.el = subTree.el;
                instance.isMounted = true;
            }
            else {
                const { next, vnode } = instance;
                if (next) {
                    next.el = vnode.el;
                    updateComponentPreRender(instance, next);
                }
                const { proxy } = instance;
                const preSubtree = instance.subTree;
                const nextSubTree = instance.subTree = instance.render.call(proxy);
                patch(preSubtree, nextSubTree, container, instance, anchor);
            }
        }, {
            scheduler() {
                console.log('scheduler');
                queueJobs(instance.update);
            }
        });
    }
    function updateComponentPreRender(instance, nextVNode) {
        instance.vnode = nextVNode;
        instance.next = null;
        instance.props = nextVNode.props;
    }
    return {
        createApp: createAppApi(render)
    };
}
function getSequence(arr) {
    const p = arr.slice();
    const result = [0];
    let i, j, u, v, c;
    const len = arr.length;
    for (i = 0; i < len; i++) {
        const arrI = arr[i];
        if (arrI !== 0) {
            j = result[result.length - 1];
            if (arr[j] < arrI) {
                p[i] = j;
                result.push(i);
                continue;
            }
            u = 0;
            v = result.length - 1;
            while (u < v) {
                c = (u + v) >> 1;
                if (arr[result[c]] < arrI) {
                    u = c + 1;
                }
                else {
                    v = c;
                }
            }
            if (arrI < arr[result[u]]) {
                if (u > 0) {
                    p[i] = result[u - 1];
                }
                result[u] = i;
            }
        }
    }
    u = result.length;
    v = result[u - 1];
    while (u-- > 0) {
        result[u] = v;
        v = p[v];
    }
    return result;
}

function createElement(type) {
    return document.createElement(type);
}
function patchProp(el, key, prevVal, nextVal) {
    if (Array.isArray(nextVal) && key === 'class') {
        nextVal = nextVal.join(' ');
    }
    const isOn = (key) => /^on[A-Z]/g.test(key);
    if (isOn(key)) {
        const eventName = key.slice(2).toLowerCase();
        el.addEventListener(eventName, nextVal);
    }
    else {
        if (nextVal === undefined || nextVal === null) {
            el.removeAttribute(key);
        }
        else {
            el.setAttribute(key, nextVal);
        }
    }
}
function insert(child, parent, anchor) {
    parent.insertBefore(child, anchor || null);
}
function remove(el) {
    const parent = el.parentNode;
    if (parent) {
        parent.removeChild(el);
    }
}
function setElementText(el, text) {
    el.textContent = text;
}
const renderer = createRenderer({
    createElement,
    patchProp,
    insert,
    remove,
    setElementText
});
function createApp(...args) {
    return renderer.createApp(...args);
}

export { createApp, createRenderer, createTextVNode, effect, getCurrentInstance, h, inject, nextTick, provider, proxyRefs, ref, renderSlots };
