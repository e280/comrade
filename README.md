
<div align="center"><img alt="" width="512" src="./assets/comrade.avif"/></div>

<br/>

# 🤖 Comrade
- comrade aims to be the best web worker library for typescript
- bidirectional by default — you can call worker functions, and they can call you
- clusters can magically schedule async calls across web workers
- seamless browser and node compatibility
- async rpc powered by [renraku](https://github.com/e280/renraku)
- a project for https://e280.org/

<br/>

## Web-workers of the world unite!

### Install comrade
```sh
npm i @e280/comrade
```

### Make your schematic type
your `Schematic` tells comrade about your functions
```ts
// schematic.ts

import {AsSchematic} from "@e280/comrade"

export type MySchematic = AsSchematic<{

  // functions on the worker. main thread can call these.
  work: {
    add(a: number, b: number): Promise<number>
    sub(a: number, b: number): Promise<number>
  }

  // functions on main thread. workers can call these.
  host: {
    mul(a: number, b: number): Promise<number>
    div(a: number, b: number): Promise<number>
  }
}>
```

> 💁 ***note*** — *arbitrary nesting is fine, actually*  
> ```ts
> export type MySchematic = AsSchematic<{
>   work: {
>     add(a: number, b: number): Promise<number>
>     nesty: {
>       is: {
>         besty(a: number, b: number): Promise<number>
>       }
>     }
>   }
> }>
> ```
> ```ts
> await work.add(2, 3) // 5
> await work.nesty.is.besty(2, 3) // 5
> ```

### Make your worker
```ts
// worker.ts

import {Comrade} from "@e280/comrade"
import {MySchematic} from "./schematic.js"

await Comrade.worker<MySchematic>(shell => ({
  async add(a, b) {
    return a + b
  },
  async sub(a, b) {
    return a - b
  },
}))
```

> 💁 ***terminology***  
> - the `shell` gives you access to the other side's functionality
>   ```ts
>   async add(a, b) {
> 
>     // calling the host (from the worker)
>     await shell.host.mul(2, 3)
> 
>     return a + b
>   },
>   ```
> - the `shell.transfer` lets you mark transferables for your returns (for zero-copy transfers)
>   ```ts
>   async getNiceBytes(a, b) {
>     const bytes = new Uint8Array([0xB0, 0x0B, 0x13, 0x5])
> 
>     shell.transfer = [bytes]
> 
>     return bytes
>   },
>   ```

> 😱 ***bundler warning***  
> you're probably going to have to bundle your worker module, especially since for some reason the spec/browser people never finished importmap support in workers, so a bundler is required to resolve dependencies in workers 🤷

### Do the work
so, now you have a choice — you can either spin up a single worker, or you can spin up a cluster of workers.
- **spin up a single worker thread**
  ```ts
  // thread.ts

  import {Comrade} from "@e280/comrade"
  import {MySchematic} from "./schematic.js"

  const thread = await Comrade.thread<MySchematic>({

    // relative url to your worker module
    workerUrl: new URL("./worker.js", import.meta.url),

    // functions on the main thread, workers can call these
    setupHost: shell => ({
      async mul(a: number, b: number) {
        return a * b
      },
      async div(a: number, b: number) {
        return a / b
      },
    }),
  })

  // calling worker functions
  await thread.work.add(2, 3) // 5
  await thread.work.sub(3, 2) // 1

  // terminate the workers when you're all done
  thread.terminate()
  ```
- **spin up a cluster of workers**
  ```ts
  // cluster.ts

  import {Comrade} from "@e280/comrade"
  import {MySchematic} from "./schematic.js"

  const cluster = await Comrade.cluster<MySchematic>({

    // relative url to your worker module
    workerUrl: new URL("./worker.js", import.meta.url),

    // functions on the main thread, workers can call these
    setupHost: shell => ({
      async mul(a: number, b: number) {
        return a * b
      },
      async div(a: number, b: number) {
        return a / b
      },
    }),
  })

  // calling a worker functions
  await cluster.work.add(2, 3) // 5
  await cluster.work.sub(3, 2) // 1

  // terminate the workers when you're all done
  cluster.terminate()
  ```
  - each call is a queued task, and tasks are round-robin distributed across the worker pool
  - your work must be *stateless* — when you call a work function, you don't know which worker will respond
  - the number of workers in the pool will be your hardware concurrency minus one (eg, on an eight-core cpu, we expect 7 workers in the pool)

<br/>

## Now let's get more organized
the helpers `host` and `work` help you export functions from separate files.

```ts
// work.ts
export const setupWork = Comrade.work<MySchematic>(shell => {
  async add(a, b) {
    return a + b
  },
  async sub(a, b) {
    return a - b
  },
})
```

```ts
// host.ts
export const setupHost = Comrade.host<MySchematic>(shell => {
  async mul(a: number, b: number) {
    return a * b
  },
  async div(a: number, b: number) {
    return a / b
  },
})
```

use these in your workers, threads, or clusters
```ts
await Comrade.worker<MySchematic>(setupWork)
```
```ts
const thread = await Comrade.thread<MySchematic>({workerUrl, setupHost})
```
```ts
const cluster = await Comrade.cluster<MySchematic>({workerUrl, setupHost})
```

### Mocks — fake it 'till you make it
for testing purposes, you can skip the whole worker/thread/cluster situation and create a mock setup like this
```ts
// mocks.ts
import {setupWork} from "./work.js"
import {setupHost} from "./host.js"

export const {work, host} = Comrade.mocks<MySchematic>({setupWork, setupHost})

await work.add(2, 3) // 5
await host.mul(2, 3) // 6
```

### Logging
by default, comrade uses an `ErrorTap` which logs errors to the console.

if you want more verbose noisy logging (logging every request):
- pass a logger tap to `Comrade.thread`
    ```ts
    import {LoggerTap} from "@e280/comrade"

    const thread = await Comrade.thread<MySchematic>({
      workerUrl,
      setupHost,
      tap: new LoggerTap(), // 👈 passing in a logger tap
    })
    ```
- pass a logger tap to `Comrade.cluster`
    ```ts
    const cluster = await Comrade.cluster<MySchematic>({
      workerUrl,
      setupHost,
      tap: new LoggerTap(), // 👈 passing in a logger tap
    })
    ```
- pass a logger tap to `Comrade.mocks`
    ```ts
    const {host, work} = await Comrade.mocks<MySchematic>({
      setupHost,
      setupWork,
      tap: new LoggerTap(), // 👈 passing in a logger tap
    })
    ```

if you want silence (not even errors), provide a dud tap:
```ts
import {DudTap} from "@e280/comrade"

const thread = await Comrade.thread<MySchematic>({
  workerUrl,
  setupHost,
  tap: new DudTap(), // 👈 dud tap does nothing, total silence
})
```

<br/>

## Tune the calls
this advancedness is brought to you by [renraku](https://github.com/e280/renraku)

### Transferables aren't copied
you can provide an array of transferables on any api call

```ts
import {tune} from "@e280/comrade"

// some example data
const buffer = new Uint8Array([0xDE, 0xAD, 0xBE, 0xEF]).buffer

  //                      🤫                😲
  //                      👇                👇
await cluster.work.hello[tune]({transfer: [buffer]})({
  lol: "whatever",
  buffer, // <-- this gets transfered speedy-fastly, not copied (we like this)
})
```

that's good for outgoing requests, but now you also need to set transferables for your responses, which is done like this

```ts
await Comrade.worker<MySchematic>(shell => ({
  async coolAction() {
    const buffer = new Uint8Array([0xDE, 0xAD, 0xBE, 0xEF]).buffer

    // set transferables for this response
    shell.transfer = [buffer] // <-- will be transferred, not copied

    return {hello: "world", buffer}
  },
}))
```

### Notifications get no response
you can also make a call a *notification*, which means no response will be sent back (just shouting into the void)

```ts
import {tune} from "@e280/comrade"

  //                               🫢
  //                               👇
await cluster.work.goodbye[tune]({notify: true})({
  lol: "whatever",
})
```

<br/>

## 💖 Made with open source love
build with us at https://e280.org/ but only if you're cool

