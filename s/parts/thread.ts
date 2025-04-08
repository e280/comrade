
import {Schematic} from "../types.js"
import {MessagePortal, Messenger} from "renraku"

export class Thread<S extends Schematic> {
	constructor(
		public worker: Worker,
		public portal: MessagePortal,
		public messenger: Messenger<S["comradeFns"]>,
	) {}

	get remote() {
		return this.messenger.remote
	}

	dispose() {
		this.worker.terminate()
		this.messenger.dispose()
	}
}

