
import {endpoint, Messenger, PostableConduit, Tap} from "@e280/renraku"

import {getSelf} from "./compat.js"
import {HostShell} from "./shells.js"
import {defaultTap} from "./default-tap.js"
import {MinistryFns, Schematic, SetupWork} from "./types.js"

/**
 * create a web worker
 */
export async function worker<S extends Schematic>(
		setupWork: SetupWork<S>,
		options: {timeout?: number, tap?: Tap} = {},
	) {

	const tap = options.tap ?? defaultTap

	const messenger = new Messenger<MinistryFns<S>>({
		tap,
		timeout: options.timeout ?? Infinity,
		conduit: new PostableConduit(await getSelf()),
		getLocalEndpoint: (remote, rig) => endpoint({
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

