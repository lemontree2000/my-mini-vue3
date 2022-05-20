import { NodeTypes } from "./ast"

enum TagType {
    START,
    END
}

export function baseParse(content: string) {
    const context = createParseContext(content)
    return createRoot(parseChildren(context))
}


function parseChildren(context) {
    const nodes: any[] = []
    let node;
    const s = context.source;
    if (s.startsWith("{{")) {
        node = parseInterpolation(context)
    } else if (s[0] === '<') {
        if (/[a-z]/i.test(s[1])) {
            console.log('parse Element')
            node = parseElement(context)
        }
    }
    if (!node) {
        node = parseText(context);
    }
    nodes.push(node)
    return nodes

}

function parseText(context: any) {
    const content = parseTextData(context, context.source.length)

    advanceBy(context, content.length)

    console.log('>>', context.source)
    return {
        type: NodeTypes.TEXT,
        content
    }
}

function parseTextData(context: any, length) {
    return context.source.slice(0, length);
}

function parseElement(context: any) {
    const element = parseTag(context, TagType.START);

    return element
}


function parseTag(context: any, type: TagType) {
    const match: any = /^<\/?([a-z]*)/i.exec(context.source);
    const tag = match[1];
    advanceBy(context, match[0].length);
    advanceBy(context, 1);
    if (type === TagType.END) return;
    return {
        type: NodeTypes.ELEMENT,
        tag
    };
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

    const rawContent = parseTextData(context, rawContnetLength)

    const content = rawContent.trim();

    context.source = advanceBy(
        context,
        closeDelimiter.length
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
