import { hasOwn } from "../shared/index";

const publicPropertiesMap = {
    $el: (i) => i.vnode.el,
    $slots: (i) => i.slots
}

export const publicComponentHandlers = {
    get({ _: instance }, key) {
        const { setupState, props } = instance
        if (hasOwn(setupState, key)) {
            return setupState[key];
        } else if (hasOwn(props, key)) {
            return props[key];
        }
        const getter = publicPropertiesMap[key]
        if (getter) {
            return getter(instance);
        }
    }

}
