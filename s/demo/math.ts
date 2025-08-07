
import {AsSchematic, SetupHost, SetupWork} from "../parts/types.js"

export type MathSchematic = AsSchematic<{

	// functions on worker. the main thread can call these.
	work: {
		add(a: number, b: number): Promise<number>
	}

	// functions on main thread. the worker can call these.
	host: {
		mul(a: number, b: number): Promise<number>
	}
}>

export const setupWork: SetupWork<MathSchematic> = shell => ({
	async add(a, b) {
		await shell.host.mul(2, 3)
		return a + b
	},
})

export const setupHost: SetupHost<MathSchematic> = _shell => ({
	async mul(a: number, b: number) {
		return a * b
	},
})

