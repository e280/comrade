
// this is a web worker

import {setupWork} from "./math.js"
import {MathSchematic} from "./math.js"
import {Comrade} from "../index.node.js"

await Comrade.worker<MathSchematic>(setupWork)

