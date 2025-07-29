
import {makeEndpoint, Messenger, PostableConduit} from "@e280/renraku"

import {HostShell} from "./shells.js"
import {Compat} from "../compat/types.js"
import {defaultTap} from "./default-tap.js"
import {MinistryFns, Schematic, SetupWork, WorkerOpts} from "./types.js"

/**
 * create a web worker
 */
export async function worker<S extends Schematic>(
		compat: Compat,
		setupWork: SetupWork<S>,
		options: WorkerOpts = {},
	) {

	const tap = options.tap ?? defaultTap

	const messenger = new Messenger<MinistryFns<S>>({
		tap,
		timeout: options.timeout ?? Infinity,
		conduit: new PostableConduit(compat.getSelf()),
		getLocalEndpoint: (remote, rig) => makeEndpoint({
			tap,
			fns: setupWork(
				new HostShell(remote.host),
				rig,
			)
		}),
	})

	await messenger.remote.meta.ready()
	return messenger.remote.host
}

