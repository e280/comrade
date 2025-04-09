
// this will call functions on the web worker

import {Cluster} from "../cluster.js"
import {DemoSchematic} from "./types.js"

const cluster = await Cluster.setup<DemoSchematic>({
	workerUrl: new URL("./math.worker.js", import.meta.url),
	setupMainFns: () => ({}),
})

const result = await cluster.remote.sum(1, 2)

console.log(result)

