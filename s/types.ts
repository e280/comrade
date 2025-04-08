
import {Fns, Remote, Rig} from "renraku"

export type AsFns<F extends Fns> = F

export type SetupFns<F extends Fns, R extends Fns> = (remote: Remote<R>, rig: Rig, event: MessageEvent) => F

/** user provided functions on both sides */
export type Schematic = {
	comradeFns: Fns
	commissarFns: Fns
}

/** internal systemic functionality that lives on the main thread */
export type ApparatchikFns = AsFns<{
	ready(): Promise<void>
}>

/** internal systemic functions plus the user's own */
export type MinistryFns<S extends Schematic> = {
	apparatchik: ApparatchikFns
	commissar: S["commissarFns"]
}

