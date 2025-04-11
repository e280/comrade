
<div align="center"><img alt="" width="512" src="./assets/comrade.avif"/></div>

<br/>

# 🤖 Comrade
- comrade aims to be the best web worker library for typescript
- bidirectional by default — you can call worker functions, and they can call you
- clusters can magically schedule async calls across web workers
- seamless browser and node compatibility
- async rpc powered by [renraku](https://github.com/chase-moskal/renraku)
- a project for https://e280.org/

<br/>

## Web-workers of the world unite!

### Install comrade
```sh
npm i @e280/comrade
```

### Make your schematic type
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
- 💁 *note — arbitrary nesting is fine, actually*
  > ```ts
  > export type MySchematic = AsSchematic<{
  >   work: {
  >     add(a: number, b: number): Promise<number>
  >     nesty: {
  >       is: {
  >         besty: {
  >           sub(a: number, b: number): Promise<number>
  >         }
  >       }
  >     }
  >   }
  > }>
  > ```
  > ```ts
  > await work.add(2, 3) // 5
  > await work.nesty.is.besty.sub(3, 2) // 1
  > ```

### Make your worker
```ts
// worker.ts

import {Comrade} from "@e280/comrade"
import {MySchematic} from "./schematic.js"

const host = await Comrade.worker<MySchematic>((shell, rig) => ({
  async add(a, b) {
    return a + b
  },
  async sub(a, b) {
    return a - b
  },
}))

// calling main thread functions
await host.mul(2, 3) // 6
await host.div(6, 2) // 3
```
- 💁 *note — each side can call the other*
  > ```ts
  > await Comrade.worker<MySchematic>((shell, rig) => ({
  >   async add(a, b) {
  > 
  >     // we can call the host functions
  >     await shell.host.mul(2, 3) // 6
  > 
  >     return a + b
  >   },
  > })
  > ```

### Do the work
here's two ways to talk to the worker
- **spin up a single worker thread**
  ```ts
  // thread.ts

  import {Comrade} from "@e280/comrade"
  import {MySchematic} from "./schematic.js"

  const thread = await Comrade.thread<MySchematic>({

    // relative url to your worker module
    workerUrl: new URL("./worker.js", import.meta.url),

    // functions on the main thread, workers can call these
    setupHost: (shell, rig) => ({
      async mul(a: number, b: number) {
        return a * b
      },
      async div(a: number, b: number) {
        return a / b
      },
    }),
  })

  // calling a worker functions
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
    setupHost: (shell, rig) => ({
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

<br/>

## Now let's get more organized
we can split our functions into separate files

```ts
// work.ts
export const setupWork = Comrade.work<MySchematic>((shell, rig) => {
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
export const setupHost = Comrade.host<MySchematic>((shell, rig) => {
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

### Mocks are easy
```ts
// mocks.ts
import {setupWork} from "./work.js"
import {setupHost} from "./host.js"

export const {work, host} = Comrade.mocks<MySchematic>({setupWork, setupHost})

await work.add(2, 3) // 5
await host.mul(2, 3) // 6
```

<br/>

## Tune the calls
this advancedness is brought to you by [renraku](https://github.com/chase-moskal/renraku)

### Transferables aren't copied
you can provide an array of transferables on any api call

```ts
import {tune} from "@e280/comrade"

const data = new Uint8Array([0xDE, 0xAD, 0xBE, 0xEF])

await cluster.work.hello[tune]({transfer: [data]})({
  lol: "whatever",
  data, // <-- this gets transfered speedy-fastly, not copied (we like this)
})
```

that's good for outgoing requests, but now you also need to set transferables for your responses, which is done like this

```ts
await Comrade.worker<MySchematic>((shell, rig) => ({
  async coolAction() {
    const data = new Uint8Array([0xDE, 0xAD, 0xBE, 0xEF])

    // set transferables for this response
    rig.transfer = [data] // <-- will be transferred, not copied

    return {hello: "world", data}
  },
}))
```

### Notifications get no response
you can also make a call a *notification*, which means no response will be sent back (just shouting into the void)

```ts
import {tune} from "@e280/comrade"

await cluster.work.goodbye[tune]({notify: true})({
  lol: "whatever",
})
```

<br/>

## 💖 Made with open source love
build with us at https://e280.org/ but only if you're cool

