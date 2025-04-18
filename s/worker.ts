
import {endpoint, Messenger} from "renraku"

import {getSelf} from "./parts/compat.js"
import {HostShell} from "./parts/shells.js"
import {MinistryFns, Schematic, SetupWork} from "./parts/types.js"

/**
 * create a web worker
 */
export async function worker<S extends Schematic>(
		setupWork: SetupWork<S>,
		options: {timeout?: number} = {}
	) {

	const messenger = new Messenger<MinistryFns<S>>({
		timeout: options.timeout ?? Infinity,
		getLocalEndpoint: (remote, rig) => endpoint(setupWork(new HostShell(remote.host), rig))
	})

	messenger.attach(await getSelf())

	await messenger.remote.meta.ready()
	return messenger.remote.host
}

