import { NodeTypes } from "./ast"

export function baseParse(content: string) {
    const context = createParseContext(content)
    return createRoot(parseChildren(context))
}


function parseChildren(context) {
    const nodes: any[] = []
    let node;
    if (context.source.startsWith("{{")) {
        node = parseInterpolation(context)
    }
    nodes.push(node)
    return nodes

}


function createParseContext(content: string) {
    return {
        source: content
    }
}

function createRoot(children) {
    return {
        children
    }
}

function parseInterpolation(context) {
    const openDelimiter = '{{'
    const closeDelimiter = '}}'

    const closeIndex = context.source.indexOf(
        closeDelimiter,
        openDelimiter.length
    );

    advanceBy(context, openDelimiter.length)

    const rawContnetLength = closeIndex - openDelimiter.length;

    const rawContent = context.source.slice(0, rawContnetLength)

    const content = rawContent.trim();
    
    context.source = advanceBy(
        context,
        rawContnetLength + closeDelimiter.length
    )

    return {
        type: NodeTypes.INTERPOLATION,
        content: {
            type: NodeTypes.SIMPLE_EXPRESSION,
            content
        }
    }
}

function advanceBy(context: any, length) {
    context.source = context.source.slice(length)
}
