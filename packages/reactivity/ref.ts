import { hasChanged, isObject } from "../shared";
import { isTracking, trackEffect, triggerEffect } from "./effect";
import { reactivity } from "./reactivity";

class RefImpl {
    private _innerValue: any;
    private _rawValue: any;
    public dep;
    constructor(value) {
        this._innerValue = convertValue(value);
        this._rawValue = value;
        this.dep = new Set();
    }

    get value() {
        if (isTracking()) {
            trackEffect(this.dep)
        }
        return this._innerValue;
    }
    set value(newVal: any) {
        if (hasChanged(this._rawValue, newVal)) {
            this._innerValue = convertValue(newVal);
            this._rawValue = newVal;
            triggerEffect(this.dep);
        }
    }


}

function convertValue(val: any) {
    return isObject(val) ? reactivity(val) : val;
}

export function ref(value) {
    return new RefImpl(value);
}