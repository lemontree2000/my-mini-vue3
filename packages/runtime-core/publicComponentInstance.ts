
const publicPropertiesMap = {
    $el: (i) => i.vnode.el
}

export const publicComponentHandlers = {
    get({ _: instance }, key) {
        const { setupState } = instance
        if (key in setupState) {
            return setupState[key];
        }
        const getter = publicPropertiesMap[key]
        if (getter) {
            return getter(instance);
        }
    }

}