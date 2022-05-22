
export function generate(ast) {
    const context = createCodegenContent();
    const { push } = context

    push('return ')

    const functionName = 'render';

    const args = ["_ctx", "_cache"]

    const signature = args.join(', ')

    push(`function ${functionName}(${signature}){`);
    push('return ')

    genNode(ast.codegenNode, context);
    push('}')
    return {
        code: context.code
    }

}

function genNode(node, context) {
    const { push } = context
    push(`'${node.content}'`)
}

function createCodegenContent() {
    const context = {
        code: "",
        push(source) {
            console.log('source>>', source)
            context.code += source
            console.log('context------', context.code)
        }
    }
    return context;
}

