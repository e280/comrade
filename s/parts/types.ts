
import {DeferPromise} from "@benev/slate"
import {Fns, JsonRpc, Remote, Rig} from "renraku"

export type AsFns<F extends Fns> = F
export type SetupFns<F extends Fns, R extends Fns> = (remote: Remote<R>, rig: Rig) => F

/** a schematic requires devs to define functionality on both sides */
export type Schematic = {
	workerFns: Fns
	clusterFns: Fns
}

/** keeps your schematic honest */
export type AsSchematic<S extends Schematic> = S

/** options for the cluster */
export type Options<S extends Schematic> = {
	workerUrl: string | URL
	setupClusterFns: SetupFns<S["clusterFns"], S["workerFns"]>
	label?: string
	workerCount?: number
}

/** internal systemic functionality that lives on the main thread */
export type MetaFns = AsFns<{
	ready(): Promise<void>
}>

/** internal systemic functions plus the user's own */
export type MinistryFns<S extends Schematic> = {
	metaFns: MetaFns
	clusterFns: S["clusterFns"]
}

export type Task = {
	request: JsonRpc.Request
	transfer: Transferable[] | undefined
	prom: DeferPromise<JsonRpc.Response | null>
}

