export const extend = Object.assign;

export const isObject = (val) => {
    return val !== null && typeof val === 'object'
}

export const hasChanged = (val, newVal) => {
    return !Object.is(val, newVal)
}

export const hasOwn = (val: any, key: any) => {
    return Object.prototype.hasOwnProperty.call(val, key)
}

export const EMPTY_OBJ = {}

export const camelize = (str: string) => {
    return str.replace(/-(\w)/g, (_, c: string) => {
        return c ? c.toUpperCase() : ''
    })
}

export const toHandlerKey = (str: string) => {
    return str ? 'on' + capitalize(str) : ''
}

const capitalize = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
}