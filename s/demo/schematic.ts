
import {AsSchematic} from "../parts/types.js"

export type MySchematic = AsSchematic<{

	// functions on worker. the main thread can call these.
	workerFns: {
		add(a: number, b: number): Promise<number>
	}

	// functions on main thread. the worker can call these.
	mainFns: {
		mul(a: number, b: number): Promise<number>
	}
}>

