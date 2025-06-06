
import {endpoint, Messenger, PostableConduit, Tap} from "@e280/renraku"

import {getSelf} from "./compat.js"
import {HostShell} from "./shells.js"
import {ErrorTap} from "./error-tap.js"
import {MinistryFns, Schematic, SetupWork} from "./types.js"

/**
 * create a web worker
 */
export async function worker<S extends Schematic>(
		setupWork: SetupWork<S>,
		options: {timeout?: number, tap?: Tap} = {},
	) {

	const messenger = new Messenger<MinistryFns<S>>({
		tap: options.tap ?? new ErrorTap(),
		timeout: options.timeout ?? Infinity,
		conduit: new PostableConduit(await getSelf()),
		getLocalEndpoint: (remote, rig) => endpoint({
			fns: setupWork(
				new HostShell(remote.host),
				rig,
			)
		}),
	})

	await messenger.remote.meta.ready()
	return messenger.remote.host
}

