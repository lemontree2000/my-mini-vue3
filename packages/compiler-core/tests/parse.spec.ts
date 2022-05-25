import { NodeTypes } from "../src/ast"
import { baseParse } from "../src/parse"
import { transform } from "../src/transform"

describe('Parse', () => {

    describe('interpolation', () => {
        test('simple interpolation', () => {
            const ast = baseParse("{{ message }}")

            expect(ast.children[0]).toStrictEqual({
                type: NodeTypes.INTERPOLATION, content: {
                    type: NodeTypes.SIMPLE_EXPRESSION,
                    content: "message"
                }
            })
        })
    })

    describe("element", () => {
        test("simple element div", () => {
            const ast = baseParse("<div></div>")

            expect(ast.children[0]).toStrictEqual({
                type: NodeTypes.ELEMENT,
                tag: "div",
                children: []
            })

        })
    })

    describe("text", () => {
        test("simple text", () => {
            const ast = baseParse("some text")

            expect(ast.children[0]).toStrictEqual({
                type: NodeTypes.TEXT,
                content: "some text"
            })

        })
    })

    describe("hello word", () => {
        test('hello word text tag {{', () => {
            const ast = baseParse("<div>hi, {{message}}</div>");
            expect(ast.children[0]).toStrictEqual({
                type: NodeTypes.ELEMENT,
                tag: "div",
                children: [
                    {
                        type: NodeTypes.TEXT,
                        content: "hi, "
                    },
                    {
                        type: NodeTypes.INTERPOLATION, content: {
                            type: NodeTypes.SIMPLE_EXPRESSION,
                            content: "message"
                        }
                    }
                ]
            })
        })

    });

    describe("Nested Element", () => {
        test('simple Nested ELement', () => {
            const ast = baseParse("<div><p>hi</p>{{message}}</div>");
            expect(ast.children[0]).toStrictEqual({
                type: NodeTypes.ELEMENT,
                tag: "div",
                children: [
                    {
                        type: NodeTypes.ELEMENT,
                        tag: "p",
                        children: [
                            {
                                type: NodeTypes.TEXT,
                                content: "hi"
                            }
                        ]
                    },
                    {
                        type: NodeTypes.INTERPOLATION, content: {
                            type: NodeTypes.SIMPLE_EXPRESSION,
                            content: "message"
                        }
                    }
                ]
            })
        })

        test("should throw error when lack en tag", () => {
            expect(() => {
                baseParse("<div><span></div>")
            }).toThrow('缺失结束标签:span');
        })
    })

    describe("transform", () => {
        test("happy path", () => {
            const ast = baseParse('<div>hi,{{message}}</div>');
            const plugin = (node) => {
                if (node.type === NodeTypes.TEXT) {
                    node.content += 'my-mini-vue'
                }

            }
            transform(ast, {
                nodeTransforms: [plugin]
            });
            const nodeText = ast.children[0].children[0]
            expect(nodeText.content).toBe('hi,my-mini-vue')
        })
    })
})