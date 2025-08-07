
import {makeMock, Tap} from "@e280/renraku"

import {worker} from "./parts/worker.js"
import {Compat} from "./compat/types.js"
import {Thread} from "./parts/thread.js"
import {shells} from "./parts/shells.js"
import {Cluster} from "./parts/cluster.js"
import {defaultTap} from "./parts/default-tap.js"
import {ClusterOptions, Mocks, Schematic, SetupHost, SetupWork, ThreadOptions, WorkerOpts} from "./parts/types.js"

export const setupComrade = (compat: Compat) => ({
	thread: <S extends Schematic>(options: ThreadOptions<S>) => Thread.make(compat, options),
	cluster: <S extends Schematic>(options: ClusterOptions<S>) => Cluster.make(compat, options),

	worker: <S extends Schematic>(
		setupWork: SetupWork<S>,
		options: WorkerOpts = {},
	) => worker(compat, setupWork, options),

	work: <S extends Schematic>(fn: SetupWork<S>) => fn,
	host: <S extends Schematic>(fn: SetupHost<S>) => fn,

	mocks<S extends Schematic>(options: {
			tap?: Tap
			setupWork: SetupWork<S>
			setupHost: SetupHost<S>
		}): Mocks<S> {

		const {setupWork, setupHost, tap = defaultTap} = options

		const hostShell = shells.mock.host<S>()
		const workShell = shells.mock.work<S>()

		workShell.work = makeMock({tap, fns: setupWork(hostShell)})
		hostShell.host = makeMock({tap, fns: setupHost(workShell)})

		return {
			workShell,
			hostShell,
			work: workShell.work,
			host: hostShell.host,
		}
	},

	mockWork<S extends Schematic>(setupWork: SetupWork<S>, tap: Tap = defaultTap) {
		const hostShell = shells.mock.host<S>()
		const workShell = shells.mock.work<S>()

		workShell.work = makeMock({tap, fns: setupWork(hostShell)})

		return {
			workShell,
			hostShell,
			work: workShell.work,
			mockHost: (setupHost: SetupHost<S>): Mocks<S> => {
				hostShell.host = makeMock({tap, fns: setupHost(workShell)})
				return {
					workShell,
					hostShell,
					work: workShell.work,
					host: hostShell.host,
				}
			},
		}
	},
})

