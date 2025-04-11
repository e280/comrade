
import {AsFns, Fns, JsonRpc, Remote, Rig, DeferPromise} from "renraku"

/** a schematic requires devs to define functionality on both sides */
export type Schematic = {
	work: Fns
	host: Fns
}

/** keeps your schematic honest */
export type AsSchematic<S extends Schematic> = S

export type Setup<F extends Fns, R extends Fns> = (remote: Remote<R>, rig: Rig) => F
export type SetupWork<S extends Schematic> = Setup<S["work"], S["host"]>
export type SetupHost<S extends Schematic> = Setup<S["host"], S["work"]>

export type ThreadOptions<S extends Schematic> = {
	label: string
	workerUrl: string | URL
	setupHost: SetupHost<S>
	timeout?: number
}

/** options for the worker cluster */
export type ClusterOptions<S extends Schematic> = {
	workerUrl: string | URL
	setupHost: SetupHost<S>
	label?: string
	workerCount?: number
	timeout?: number
}

/** internal systemic functionality that lives on the main thread */
export type Meta = AsFns<{
	ready(): Promise<void>
}>

/** internal systemic functions plus the user's own */
export type MinistryFns<S extends Schematic> = {
	meta: Meta
	host: S["host"]
}

export type Task = {
	request: JsonRpc.Request
	transfer: Transferable[] | undefined
	prom: DeferPromise<JsonRpc.Response | null>
}

export type Work<S extends Schematic> = S["work"]
export type Host<S extends Schematic> = S["host"]

export type Mocks<S extends Schematic> = {
	work: Remote<S["work"]>
	host: Remote<S["host"]>
}

