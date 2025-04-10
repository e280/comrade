
import {AsFns, Fns, JsonRpc, Remote, Rig, DeferPromise} from "renraku"

/** a schematic requires devs to define functionality on both sides */
export type Schematic = {
	workerFns: Fns
	mainFns: Fns
}

/** keeps your schematic honest */
export type AsSchematic<S extends Schematic> = S

export type SetupFns<F extends Fns, R extends Fns> = (remote: Remote<R>, rig: Rig) => F
export type SetupMainFns<S extends Schematic> = SetupFns<S["mainFns"], S["workerFns"]>
export type SetupWorkerFns<S extends Schematic> = SetupFns<S["workerFns"], S["mainFns"]>

/** options for the workers pool */
export type Options<S extends Schematic> = {
	workerUrl: string | URL
	setupMainFns: SetupMainFns<S>
	label?: string
	timeout?: number
	workerCount?: number
}

/** internal systemic functionality that lives on the main thread */
export type MetaFns = AsFns<{
	ready(): Promise<void>
}>

/** internal systemic functions plus the user's own */
export type MinistryFns<S extends Schematic> = {
	metaFns: MetaFns
	mainFns: S["mainFns"]
}

export type Task = {
	request: JsonRpc.Request
	transfer: Transferable[] | undefined
	prom: DeferPromise<JsonRpc.Response | null>
}

