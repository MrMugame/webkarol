import { lezer } from "@lezer/generator/rollup"
import { plugin, Mode } from "vite-plugin-markdown"

export default {
    plugins: [lezer(), plugin({mode: Mode.HTML})]
}