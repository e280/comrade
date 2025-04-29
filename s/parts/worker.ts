
import {endpoint, Messenger, PostableConduit} from "renraku"

import {getSelf} from "./compat.js"
import {HostShell} from "./shells.js"
import {MinistryFns, Schematic, SetupWork} from "./types.js"

/**
 * create a web worker
 */
export async function worker<S extends Schematic>(
		setupWork: SetupWork<S>,
		options: {timeout?: number} = {},
	) {

	const messenger = new Messenger<MinistryFns<S>>({
		timeout: options.timeout ?? Infinity,
		conduit: new PostableConduit(await getSelf()),
		getLocalEndpoint: (remote, rig) => endpoint(
			setupWork(
				new HostShell(remote.host),
				rig,
			)
		),
	})

	await messenger.remote.meta.ready()
	return messenger.remote.host
}

