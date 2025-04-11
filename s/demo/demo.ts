
// create a pool of web workers, and call functions on it

import {Cluster} from "../cluster.js"
import {MySchematic} from "./schematic.js"

const cluster = await Cluster.make<MySchematic>({
	workerUrl: new URL("./math.worker.js", import.meta.url),
	setupHost: () => ({
		async mul(a: number, b: number) {
			return a * b
		},
	}),
})

const x = await cluster.work.add(2, 3)
console.log(x) // 5

cluster.terminate()

