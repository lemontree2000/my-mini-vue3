const queue: any[] = [];
let isFlushPending = false;


const p = Promise.resolve();
export function nextTick(fn) {
    return fn ? p.then(fn) : p;
}

export function queueJobs(job) {
    if (!queue.includes(job)) {
        queue.push(job);
    }

    queueflush();
}

function queueflush() {
    if (!isFlushPending) {
        isFlushPending = true;
    } else {
        return
    }

    nextTick(flushJobs)
}

function flushJobs() {
    isFlushPending = false;
    let job;
    while (job = queue.shift()) {
        job && job();
    }
}

