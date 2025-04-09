
// create a web worker cluster, and call functions on it

import {Workers} from "../workers.js"
import {MySchematic} from "./schematic.js"

const workers = await Workers.setup<MySchematic>({
	workerUrl: new URL("./math.worker.js", import.meta.url),
	setupMainFns: () => ({
		async mul(a: number, b: number) {
			return a * b
		},
	}),
})

const x = await workers.remote.add(2, 3)
console.log(x) // 5

workers.terminate()

