import { ShapeFlags } from "../shared/ShapeFlags";

export function initSlots(instance, children) {
    const { vnode } = instance
    if (vnode.shapeFlag & ShapeFlags.SLOT_CHILDREN) {
        normalizeObjectSlots(children, instance);
    }
}

function normalizeObjectSlots(children: any, instance: any) {
    const slots = {};
    for (const key in children) {
        const value = children[key];
        slots[key] = (props) => normalizeSlotValue(value(props));
    }
    instance.slots = slots;
}

function normalizeSlotValue(value: any): any {
    return Array.isArray(value) ? value : [value];
}
