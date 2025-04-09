
import {AsSchematic} from "../parts/types.js"

export type DemoSchematic = AsSchematic<{
	mainFns: {}
	workerFns: {
		sum(a: number, b: number): Promise<number>
	}
}>

