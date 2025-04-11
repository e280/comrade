
import {Messenger} from "renraku"
import {Schematic} from "./types.js"
import {CompatWorker} from "./compat.js"

export class Thread<S extends Schematic> {
	constructor(
		public worker: CompatWorker,
		public messenger: Messenger<S["work"]>,
	) {}

	terminate() {
		this.worker.terminate()
	}
}

