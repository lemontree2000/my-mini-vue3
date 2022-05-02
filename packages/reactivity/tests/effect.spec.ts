import { effect, stop } from "../effect";
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

    it('should return runner when call effect', () => {
        let foo = 10;

        const runner = effect(() => {
            foo++;
            return 'foo'
        });

        expect(foo).toBe(11)

        const r = runner();

        expect(foo).toBe(12)

        expect(r).toBe("foo")
    })

    it('scheduler', () => {
        let dummy;
        let run: any;

        const scheduler = jest.fn(() => {
            run = runner;
        })

        const obj = reactivity({
            foo: 1,
        })

        const runner = effect(() => {
            dummy = obj.foo;
        }, { scheduler })

        expect(scheduler).not.toHaveBeenCalled();
        expect(dummy).toBe(1)

        obj.foo++
        expect(scheduler).toHaveBeenCalledTimes(1);
        expect(dummy).toBe(1);

        run();

        expect(dummy).toBe(2)

    })

    it('stop', () => {
        let dummy;
        const obj = reactivity({ num: 1 })
        const runner = effect(() => {
            dummy = obj.num
        })
        obj.num = 2
        expect(dummy).toBe(2)

        stop(runner)

        obj.num = 3;
        expect(dummy).toBe(2)

        runner();
        // 手动执行runner 可以更新
        expect(dummy).toBe(3)
    })

    it('onStop', () => {
        const obj = reactivity({ num: 1 })

        const onStop = jest.fn()

        let dummy;

        const runner = effect(() => {
            dummy = obj.num
        }, { onStop })

        stop(runner)

        expect(onStop).toBeCalledTimes(1);
    })
})