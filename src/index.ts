import Vue, { PluginObject } from "vue"
import VueWindow from "./components/window/window.vue"

declare global {
    interface Window {
        Vue: Vue | undefined
    }
}

interface Option {
    componentName?: string
}

export const plugin: PluginObject<Option> = {
    install(vue: typeof Vue, options?: Option): void {
        const componentName = options?.componentName ?? "mc-window"
        vue.component(componentName, VueWindow)
    },
}

if (window.Vue) {
    Vue.use(plugin.install)
}

export * from "./components/window/window-manager-hook"
export * from "./components/window/window-manager-store"
export * from "./components/window/window-store"
// export default Window
export default plugin
