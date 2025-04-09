
import {AsSchematic} from "../parts/types.js"

export type DemoSchematic = AsSchematic<{

	// functions that live on the web worker.
	// the cluster can call these.
	workerFns: {
		add(a: number, b: number): Promise<number>
	}

	// functions that live on the main thread.
	// the worker can call these.
	clusterFns: {
		mul(a: number, b: number): Promise<number>
	}
}>

