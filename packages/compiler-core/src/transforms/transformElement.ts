import { createVnodeCall, NodeTypes } from "../ast";
import { CREATE_ELEMENT_VNODE } from "../runtimeHelpers";


export function transformElement(node, context) {
    if (node.type === NodeTypes.ELEMENT) {
        return () => {


            const vnodeTag = `"${node.tag}"`
            const children = node.children
            let vnodeProps;
            let vnodeChildren = children[0];


            node.codegenNode = createVnodeCall(vnodeTag, vnodeProps, vnodeChildren, context);
        }
    }
}