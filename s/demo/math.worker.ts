
//
// this is a web worker
//

import {MathFns} from "./fns.js"
import {endpoint, fns, Messenger} from "renraku"

// setting up the renraku messenger with the fns
const messenger = new Messenger<CommissarFns>({
	timeout: 120_000,
	remotePortal: new Messenger.MessagePortal(self),
	getLocalEndpoint: (_remote, _rig) => endpoint(fns<MathFns>({
		async sum(a, b) {
			return a + b
		},
	})),
})

// signal to commisar that we're done loading
await messenger.remote.ready()

