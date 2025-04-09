
import {Fns, Remote, Rig} from "renraku"

export type AsFns<F extends Fns> = F

export type SetupFns<F extends Fns, R extends Fns> = (remote: Remote<R>, rig: Rig) => F

/** options for the kremlin */
export type CentralPlan<S extends Schematic> = {
	workerUrl: string | URL
	setupMainFns: SetupFns<S["mainFns"], S["workerFns"]>
	label?: string
	workerCount?: number
}

/** user provided functions on both sides */
export type Schematic = {
	mainFns: Fns
	workerFns: Fns
}

export type AsSchematic<S extends Schematic> = S

/** internal systemic functionality that lives on the main thread */
export type ApparatchikFns = AsFns<{
	ready(): Promise<void>
}>

/** internal systemic functions plus the user's own */
export type MinistryFns<S extends Schematic> = {
	apparatchik: ApparatchikFns
	commissar: S["mainFns"]
}

