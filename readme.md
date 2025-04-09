
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

  const main = await worker<MySchematic>(() => ({
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

