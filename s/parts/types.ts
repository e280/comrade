
import {Deferred} from "@e280/stz"
import {HostShell, WorkShell} from "./shells.js"
import {AsFns, Fns, JsonRpc, Remote, Rig} from "@e280/renraku"

/** a schematic requires devs to define functionality on both sides */
export type Schematic = {
	work: Fns
	host: Fns
}

/** keeps your schematic honest */
export type AsSchematic<S extends Schematic> = S

export type SetupWork<S extends Schematic> = (shell: HostShell<S>, rig: Rig) => S["work"]
export type SetupHost<S extends Schematic> = (shell: WorkShell<S>, rig: Rig) => S["host"]

export type ThreadOptions<S extends Schematic> = {
	label: string
	workerUrl: string | URL
	setupHost: SetupHost<S>
	timeout?: number
}

export type ClusterParams<S extends Schematic> = ClusterRequirements<S> & ClusterOptions

export type ClusterRequirements<S extends Schematic> = {
	workerUrl: string | URL
	setupHost: SetupHost<S>
}

export type ClusterOptions = {
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
	prom: Deferred<JsonRpc.Response | null>
}

export type Work<S extends Schematic> = Remote<S["work"]>
export type Host<S extends Schematic> = Remote<S["host"]>

export type Mocks<S extends Schematic> = {
	workShell: WorkShell<S>
	hostShell: HostShell<S>
	work: Work<S>
	host: Host<S>
}

