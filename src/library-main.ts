import { VueConstructor } from "vue"
import McWindow from "@/components/window/window.vue"

let installed = false
export function install(vue: VueConstructor) {
    if (installed) return
    installed = true
    vue.component("McWindow", McWindow)
}

export default window
