import { getCurrentInstance } from "./component";

export function provider(key, value) {
    const currentInstance: any = getCurrentInstance()
    // 存值

    if (currentInstance) {
        let { providers } = currentInstance
        const parentProviders = currentInstance.parent.providers
        // 只有首次才执行
        if (parentProviders === providers) {
            // 原型链
            providers = currentInstance.providers = Object.create(parentProviders)
        }
        providers[key] = value
    }
}


export function inject(key, defaultValue) {
    // 取值 
    const currentInstance: any = getCurrentInstance();
    if (currentInstance) {
        const parentProviders = currentInstance.parent.providers;
        if (key in parentProviders) {
            return parentProviders[key]
        } else if (defaultValue) {
            if (typeof defaultValue === 'function') {
                return defaultValue()
            }
            return defaultValue
        }
    }
}