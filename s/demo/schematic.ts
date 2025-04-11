
import {AsSchematic} from "../parts/types.js"

export type MySchematic = AsSchematic<{

	// functions on worker. the main thread can call these.
	work: {
		add(a: number, b: number): Promise<number>
	}

	// functions on main thread. the worker can call these.
	host: {
		mul(a: number, b: number): Promise<number>
	}
}>

