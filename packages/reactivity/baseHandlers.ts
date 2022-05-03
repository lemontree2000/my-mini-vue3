import { track, trigger } from "./effect";
import { ReactiveFlags } from "./reactivity";

export function createGetter(isReadonly = false) {
    return function get(target, key) {
        const res = Reflect.get(target, key);
        if (!isReadonly) {
            // 搜集依赖
            track(target, key);
        }
        if (key == ReactiveFlags.IS_REACTIVE) {
            return !isReadonly
        } else if (key == ReactiveFlags.IS_READONLY) {
            return isReadonly
        }
        return res
    }
}

export function createSetter() {
    return function set(target, key, value) {
        const res = Reflect.set(target, key, value)
        // 触发依赖
        trigger(target, key)

        return res
    }
}

export const mutableHandlers = {
    get: createGetter(),
    set: createSetter(),
}

export const readonlyHandlers = {
    get: createGetter(true),
    set(target, key, value) {
        console.warn(`key: ${key} set failed because target is readonly`, target)
        return true
    },
}