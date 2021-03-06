import { extend, isObject } from "../shared/index";
import { track, trigger } from "./effect";
import { ReactiveFlags, reactivity, readonly } from "./reactivity";

export function createGetter(isReadonly = false, shallow = false) {
    return function get(target, key) {

        if (key == ReactiveFlags.IS_REACTIVE) {
            return !isReadonly
        } else if (key == ReactiveFlags.IS_READONLY) {
            return isReadonly
        }
        const res = Reflect.get(target, key);

        if (shallow) {
            return res
        }

        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactivity(res)
        }

        if (!isReadonly) {
            // 搜集依赖
            track(target, key);
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

export const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
    get: createGetter(true, true),
});