export * from './runtime-dom'

import { baseCompile } from './compiler-core/src'
import * as runtimeCore from './runtime-core'
import { registerRuntimeCompiler } from './runtime-core'
function complieToFunction(template: string) {
    const { code } = baseCompile(template)
    const render = new Function("Vue", code)(runtimeCore);
    return render;
}


registerRuntimeCompiler(complieToFunction)