import typescript from '@rollup/plugin-typescript'
import pkg from './package.json'

export default {
    input: "./packages/index.ts",
    output: [
        {
            format: 'cjs',
            file: pkg.main
        },
        {
            format: 'es',
            file: pkg.module
        },
    ],
    plugins: [typescript()]
}