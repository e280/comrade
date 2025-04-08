
import {Thread} from "./thread.js"
import {Schematic} from "../types.js"
import {BasePortal, PortalChannel, JsonRpc} from "renraku"

export type MessageListener = (event: MessageEvent) => void

export class KremlinPortal<S extends Schematic> implements BasePortal {
	constructor(private threads: Thread<S>[]) {}

	channel: PortalChannel = {
		addEventListener: (e: "message", listener: MessageListener) => {
			for (const thread of this.threads)
				thread.portal.channel.addEventListener(e, listener)
		},
		removeEventListener: (e: "message", listener: MessageListener) => {
			for (const thread of this.threads)
				thread.portal.channel.removeEventListener(e, listener)
		},
	}

	sendRequest(message: JsonRpc.Requestish, transfer: Transferable[] | undefined, done: Promise<JsonRpc.Respondish | null>) {
		const thread = this.#pickRandomThread()
		thread.portal.sendRequest(message, transfer)
	}

	sendResponse(message: JsonRpc.Respondish, transfer: Transferable[] | undefined, portal: BasePortal) {
		if (portal === this) throw new Error("cursed loop")
		portal.sendResponse(message, transfer, portal)
	}

	#pickRandomThread() {
		return this.threads.at(
			Math.floor(Math.random() * this.threads.length)
		)!
	}
}

