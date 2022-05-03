import { extend } from "../shared";

let activeEffect;
let shouldTrack;
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
        // 如果stop了则不需要收集依赖了
        if (!this.active) {
            return this._fn()
        }
        activeEffect = this

        // shouldTrack 控制只有 _fn 里面使用obj.value 才会触发get 搜集依赖
        shouldTrack = true;
        const result = this._fn()
        shouldTrack = false;

        return result
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
    if (!isTracking()) return;

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

    if (dep.has(activeEffect)) return;
    
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

export function effect(fn, options: any = {}) {
    const _effect = new ReactivityEffect(fn, options.scheduler);

    _effect.run();

    const runner: any = _effect.run.bind(_effect);

    extend(_effect, options);

    runner.effect = _effect;

    return runner;
}

export function isTracking() {
    // 没有使用effect 则没有activeEffect
    // 触发track 但是不一定要收集, shouldTrack 控制是否搜集
    return shouldTrack && activeEffect !== undefined
}