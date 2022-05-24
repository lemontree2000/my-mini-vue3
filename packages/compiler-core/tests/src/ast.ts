import { CREATE_ELEMENT_VNODE } from "./runtimeHelpers";

export enum NodeTypes {
    INTERPOLATION,
    SIMPLE_EXPRESSION,
    ELEMENT,
    TEXT,
    ROOT,
    COMPOUND_EXPRESSION
}

export function createVnodeCall(tag, props, children, context) {
    context.helper(CREATE_ELEMENT_VNODE);
    return {
        type: NodeTypes.ELEMENT,
        tag,
        props,
        children
    }
}