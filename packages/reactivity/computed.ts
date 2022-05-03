import { ReactiveEffect } from "./effect";

class ComputedRefImpl {
    private _getter: any;
    private _dirty = true;
    private _value: any;
    private _effect: ReactiveEffect;
    constructor(getter) {
        this._getter = getter;
        // 因为依赖了reactivity 但没有effect 及 activeEffect 所以 depsMap没有收集依赖
        this._effect = new ReactiveEffect(getter, () => {
            if (!this._dirty) {
                // scheduler 每次set后会执行
                this._dirty = true;
            }
        })
    }
    get value() {
        if (this._dirty) {
            // 调用 effect.run 产生activeEffect, 则会触发track搜集依赖
            this._value = this._effect.run()
            this._dirty = false;
        }
        return this._value
    }
}

export function computed(getter) {
    return new ComputedRefImpl(getter);
}