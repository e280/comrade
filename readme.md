
<div align="center"><img alt="" width="512" src="./assets/comrade.avif"/></div>

<br/>

# ☭ COMRADE

## *WEB-WORKERS OF THE WORLD UNITE!*
- async function calls are magically scheduled across available web workers
- it's *bidirectional!* you call worker functions — and worker functions call you
- works in browsers and node
- thread communication powered by [renraku](https://github.com/chase-moskal/renraku)

### *INSTALL COMRADE!*
```sh
npm i @e280/comrade
```

### *MAKE YOUR SCHEMATIC TYPE!*
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

### *MAKE YOUR WORKER!*
```ts
// worker.ts

import Comrade from "@e280/comrade"
import {MySchematic} from "./schematic.js"

const host = await Comrade.worker<MySchematic>((host, rig) => ({
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
  > await Comrade.worker<MySchematic>((host, rig) => ({
  >   async add(a, b) {
  > 
  >     // we can call the host functions
  >     await host.mul(2, 3) // 6
  > 
  >     return a + b
  >   },
  > })
  > ```

### *MAKE YOUR CLUSTER!*
```ts
// cluster.ts

import Comrade from "@e280/comrade"
import {MySchematic} from "./schematic.js"

const cluster = await Comrade.cluster<MySchematic>({

  // relative url to your worker module
  workerUrl: new URL("./worker.js", import.meta.url),

  // functions on the main thread, workers can call these
  setupHost: (work, rig) => ({
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

## *NOW LETS GET MORE ORGANIZED!*

### *SPLIT FUNCTIONS INTO SEPARATE FILES!*

```ts
// work.ts
export const setupWork = Comrade.work<MySchematic>((host, rig) => {
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
export const setupHost = Comrade.host<MySchematic>((work, rig) => {
  async mul(a: number, b: number) {
    return a * b
  },
  async div(a: number, b: number) {
    return a / b
  },
})
```

### *NOW IT'S EASY TO SETUP MOCKS!*

```ts
// mocks.ts
export const {work, host} = Comrade.mocks<MySchematic>({})
await work.add(2, 3) // 5
await host.mul(2, 3) // 6
```

<br/>

## *TUNE THE CALLS!*
this advancedness is brought to you by [renraku](https://github.com/chase-moskal/renraku)

### *TRANSFERABLES AREN'T COPIED!*
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
await Comrade.worker<MySchematic>((host, rig) => ({
  async coolAction() {
    const data = new Uint8Array([0xDE, 0xAD, 0xBE, 0xEF])

    // set transferables for this response
    rig.transfer = [data] // <-- will be transferred, not copied

    return {hello: "world", data}
  },
}))
```

### *NOTIFICATIONS GET NO RESPONSE!*
you can also make a call a *notification*, which means no response will be sent back (just shouting into the void)

```ts
import {tune} from "@e280/comrade"

await cluster.work.goodbye[tune]({notify: true})({
  lol: "whatever",
})
```

