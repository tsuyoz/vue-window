import {WindowStore} from "@/components/window/window-store"
import {InjectionKey} from "@vue/composition-api"

export class WindowManagerState {
    windowStores: WindowStore[] = []
}

export interface WindowManagerStore {
    state: WindowManagerState
    addWindowStore: (windowStore: WindowStore) => void
    removeWindowStore: (id: string) => void
    getWindowStore: (id: string) => WindowStore | undefined
    getNextWindowId: () => string
    getNextZIndex: () => number
    getCurrentZIndex: () => number
}

export const windowManagerStoreKey: InjectionKey<WindowManagerStore> = Symbol("windowManagerStoreKey")
