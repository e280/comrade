
import {LoggerTap, Tap} from "@e280/renraku"

export class ErrorTap extends LoggerTap implements Tap {
	request: Tap["request"] = async() => {}
}

