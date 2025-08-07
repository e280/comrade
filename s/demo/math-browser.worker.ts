
// this is a web worker

import {setupMathWork} from "./math.js"
import {MySchematic} from "./schematic.js"
import {Comrade} from "../index.browser.js"

await Comrade.worker<MySchematic>(setupMathWork)

