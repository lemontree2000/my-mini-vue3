import { extend } from "../shared";



class ReactivityEffect {
    private _fn: Function;
    public scheduler: Function | undefined;
    deps = [];
    active: boolean = true;
    onStop?: () => void;
    constructor(fn, scheduler?) {
        this._fn = fn;
        this.scheduler = scheduler;
    }
    run() {
        activeEffect = this
        this.active = true;
        return this._fn()
    }

    stop() {
        // 防止重复清空
        if (this.active) {
            cleanupEffect(this);
            this.onStop && this.onStop()
            this.active = false
        }
    }


}

function cleanupEffect(effect) {
    effect.deps.forEach((dep: any) => {
        dep.delete(effect);
    });
}

// { target: {key: [activeEffect] } }
const targetMap = new Map();

export function track(target, key) {
    let depsMap = targetMap.get(target)

    if (!depsMap) {
        depsMap = new Map()
        targetMap.set(target, depsMap)
    }

    let dep = depsMap.get(key)
    if (!dep) {
        dep = new Set();
        depsMap.set(key, dep)
    }
    if (!activeEffect) return;

    // 每次get都会执行track Set 可以去重所以放心add
    dep.add(activeEffect)

    activeEffect.deps.push(dep)
}

export function trigger(target, key) {
    const depsMap = targetMap.get(target)
    const deps = depsMap.get(key)
    deps.forEach(reactivityEffect => {
        if (!reactivityEffect.scheduler) {
            reactivityEffect.run()
        } else {
            reactivityEffect.scheduler();
        }
    })
}

export function stop(runner) {
    runner.effect.stop();
}

let activeEffect;
export function effect(fn, options: any = {}) {
    const _effect = new ReactivityEffect(fn, options.scheduler);

    _effect.run();

    const runner: any = _effect.run.bind(_effect);

    extend(_effect, options);

    runner.effect = _effect;

    return runner;
}