import { computed } from "../computed"
import { reactivity } from "../reactivity"

describe('computed', () => {

    it('happy path', () => {
        const user = reactivity({
            age: 30,
        })

        const age = computed(() => {
            return user.age
        })

        expect(age.value).toBe(30);

    })

    it('should compute lazily', () => {
        const value = reactivity({
            foo: 3,
        })

        const getter = jest.fn(() => {
            return value.foo
        });

        const fooRef = computed(getter)

        expect(getter).not.toHaveBeenCalled()

        expect(fooRef.value).toBe(3)

        expect(getter).toBeCalledTimes(1);

        fooRef.value;

        expect(getter).toBeCalledTimes(1);

        value.foo = 29;

        expect(fooRef.value).toBe(29)

        expect(getter).toBeCalledTimes(2);

        value.foo;
        expect(getter).toBeCalledTimes(2)

    })
})