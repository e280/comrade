
import {mock, Remote, Rig} from "renraku"
import {Schematic, SetupMainFns, SetupWorkerFns} from "./types.js"

export function setupWorkerFns<S extends Schematic>(fn: SetupWorkerFns<S>) {
	return fn
}

export function setupMainFns<S extends Schematic>(fn: SetupMainFns<S>) {
	return fn
}

export function mockSetup<S extends Schematic>(options: {
		setupMainFns: SetupMainFns<S>
		setupWorkerFns: SetupWorkerFns<S>
	}) {

	const {setupWorkerFns, setupMainFns} = options

	let main!: Remote<S["mainFns"]>
	let worker!: Remote<S["workerFns"]>

	main = mock(setupMainFns(worker, new Rig()))
	worker = mock(setupWorkerFns(main, new Rig()))

	return {main, worker}
}

