
// this is a web worker

import {setupMathWork} from "./math.js"
import {Comrade} from "../index.node.js"
import {MySchematic} from "./schematic.js"

await Comrade.worker<MySchematic>(setupMathWork)

