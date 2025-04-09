
// create a web worker cluster, and call functions on it

import {Cluster} from "../cluster.js"
import {DemoSchematic} from "./types.js"

const cluster = await Cluster.setup<DemoSchematic>({
	workerUrl: new URL("./math.worker.js", import.meta.url),
	setupClusterFns: () => ({
		async mul(a: number, b: number) {
			return a * b
		},
	}),
})

const result = await cluster.remote.add(1, 2)

console.log(result)

