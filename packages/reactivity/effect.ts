


class ReactivityEffect {
    private _fn: any;

    constructor(fn) {
        this._fn = fn;
    }
    run() {
        activeEffect = this
        this._fn()
    }
}

// { target: {key: activeEffect } }
const targetMap = new Map();

export function track(target, key) {
    let depsMap = targetMap.get(target)

    if (!depsMap) {
        depsMap = new Map()
        targetMap.set(target, depsMap)
    }

    let deps = depsMap.get(key)
    if (!deps) {
        deps = new Set();
        depsMap.set(key, deps)
    }

    deps.add(activeEffect)
}

export function trigger(target, key) {
    const depsMap = targetMap.get(target)
    const deps = depsMap.get(key)
    deps.forEach(reactivityEffect => reactivityEffect.run())
}

let activeEffect;
export function effect(fn) {
    const _effect = new ReactivityEffect(fn);
    _effect.run();
}