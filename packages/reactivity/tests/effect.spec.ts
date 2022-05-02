import { effect } from "../effect";
import { reactivity } from "../reactivity";

describe('effect', () => {

    it('happy path', () => {
        const user = reactivity({
            name: 'edward',
            age: 28
        })

        let nextAge;

        effect(() => {
            nextAge = user.age + 1
        })

        expect(nextAge).toBe(29)

        user.age++
        expect(nextAge).toBe(30)
    })
})