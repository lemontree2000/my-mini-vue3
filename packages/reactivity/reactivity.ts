import { isObject } from "../shared/index";
import { mutableHandlers, readonlyHandlers, shallowReadonlyHandlers } from "./baseHandlers";

export enum ReactiveFlags {
    IS_REACTIVE = '__isReactivity__',
    IS_READONLY = '__isReadOnly__'
}

export function reactivity(raw) {
    return createReactivityObject(raw, mutableHandlers)
}

export function readonly(raw) {
    return createReactivityObject(raw, readonlyHandlers)
}

export function isReactive(obj) {
    return !!obj[ReactiveFlags.IS_REACTIVE]
}

export function isReadonly(obj) {
    return !!obj[ReactiveFlags.IS_READONLY]
}

export function isProxy(obj) {
    return isReactive(obj) || isReadonly(obj);
}

export function shallowReadonly(raw) {
    return createReactivityObject(raw, shallowReadonlyHandlers)
}

function createReactivityObject(raw: any, baseHandlers) {
    if (!isObject(raw)) {
        console.warn(`raw: ${raw} is not an object`, raw)
        return
    }
    return new Proxy(raw, baseHandlers);
}
