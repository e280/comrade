
<div align="center"><img alt="" width="512" src="./assets/comrade.avif"/></div>

# ☭ COMRADE

### *WEB-WORKERS OF THE WORLD UNITE!*
- web worker pooling and dispatch
- function calls are automatically distributed across the available web workers
- when all workers are busy, work is queued up, and will get done eventually
- it's *bidirectional!* you can call worker functions, and worker functions can call you
- thread communication powered by [renraku](https://github.com/chase-moskal/renraku)

### let's do it
- **install comrade**
  ```sh
  npm install @e280/comrade
  ```
- **make your `schematic.ts`**
  ```ts
  import {AsSchematic} from "@e280/comrade"

  export type MySchematic = AsSchematic<{

    // functions on the worker. main thread can call these.
    workerFns: {
      add(a: number, b: number): Promise<number>
    }

    // functions on main thread. workers can call these.
    mainFns: {
      mul(a: number, b: number): Promise<number>
    }
  }>
  ```
- **make your `worker.ts`**
  ```ts
  import {worker} from "@e280/comrade"
  import type {MySchematic} from "./schematic.js"

  const main = await worker<MySchematic>((main, rig) => ({
    async add(a, b) {
      return a + b
    },
  }))

  // calling a main thread function
  const x = await main.mul(2, 3)
  console.log(x) // 6
  ```
- **make your `workers.ts`**
  ```ts
  import {Workers} from "@e280/comrade"
  import {MySchematic} from "./schematic.js"

  const workers = await Workers.setup<MySchematic>({

    // relative url to your worker module
    workerUrl: new URL("./worker.js", import.meta.url),

    // functions on the main thread, workers can call these
    setupMainFns: () => ({
      async mul(a: number, b: number) {
        return a * b
      },
    }),
  })

  // calling a worker function
  const x = await workers.remote.add(2, 3)
  console.log(x) // 5

  // terminate the workers when you're all done
  workers.terminate()
  ```

#### nesty is besty
- you can in fact do arbitrary nesting of your functions
  ```ts
  const main = await worker<MySchematic>((main, rig) => ({

    math: {
      async add(a, b) {
        return a + b
      },
      async mul(a, b) {
        return a * b
      },
    },

    incredi: {
      wow: {
        async hello(a, b) {
          return "hello world!"
        },
      },
    },
  }))

  // elsewhere.js
  await workers.remote.math.add(2, 3) // 5
  await workers.remote.incredi.wow.hello() // "hello world!"
  ```

### tuning calls
- this advancedness is brought to you by [renraku](https://github.com/chase-moskal/renraku)

#### hmm, *transferables,* you say?
- you can provide an array of transferables on any api call
  ```ts
  import {tune} from "@e280/comrade"

  const data = new Uint8Array([0xDE, 0xAD, 0xBE, 0xEF])

  await workers.remote.hello[tune]({transfer: [data]})({
    lol: "whatever",
    data, // <-- this gets transfered speedy-fastly, not copied (we like this)
  })
  ```
- that's good for outgoing requests, but now you also need to set transferables for your responses, which is done like this
  ```ts
  await worker<MySchematic>((main, rig) => ({
    async coolAction(a, b) {
      const data = new Uint8Array([0xDE, 0xAD, 0xBE, 0xEF])

      // set transferables for this response
      rig.transfer = [data] // <-- will be transferred, not copied

      return {hello: "world", data}
    },
  }))
  ```

#### notifications
- you can also make a call a *notification*, which means no response will be sent back (just shouting into the void)
  ```ts
  import {tune} from "@e280/comrade"

  await workers.remote.goodbye[tune]({notify: true})({
    lol: "whatever",
  })
  ```

