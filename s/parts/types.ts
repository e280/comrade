
import {Deferred} from "@e280/stz"
import {AsFns, Fns, JsonRpc, Remote, Tap} from "@e280/renraku"

import {HostShell, WorkShell} from "./shells.js"

/** a schematic requires devs to define functionality on both sides */
export type Schematic = {
	work: Fns
	host: Fns
}

/** keeps your schematic honest */
export type AsSchematic<S extends Schematic> = S

export type SetupWork<S extends Schematic> = (shell: HostShell<S>) => S["work"]
export type SetupHost<S extends Schematic> = (shell: WorkShell<S>) => S["host"]

export type WorkerOpts = {
	tap?: Tap
	timeout?: number
}

export type ThreadOptions<S extends Schematic> = {
	workerUrl: string | URL
	setupHost: SetupHost<S>
	label?: string
	tap?: Tap
	timeout?: number
}

export type ClusterOptions<S extends Schematic> = {
	workerUrl: string | URL
	setupHost: SetupHost<S>
	tap?: Tap
	label?: string
	timeout?: number
	workerCount?: number
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

