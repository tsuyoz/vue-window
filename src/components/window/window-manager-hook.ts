import {
    WindowManagerState,
    WindowManagerStore,
    windowManagerStoreKey,
} from "@/components/window/window-manager-store"
import {inject, provide, reactive} from "@vue/composition-api"
import {WindowStore} from "@/components/window/window-store"

class State {
    nextWindowId = 1
    nextZIndex = 1
    currentZIndex = -1
}

export const createWindowManager = (startZIndex?: number): WindowManagerStore => {
    const state = reactive(new State())

    const windosManagerState = reactive(new WindowManagerState())

    if (startZIndex !== undefined) {
        state.nextZIndex = startZIndex
    }

    const addWindowStore = (windowStore: WindowStore): void => {
        windosManagerState.windowStores.push(windowStore)
    }

    const removeWindowStore = (id: string): void => {
        const windowStore = windosManagerState.windowStores.find(ws => ws.state.id === id)
        if (!windowStore) return

        const index = windosManagerState.windowStores.indexOf(windowStore)
        if (index >= 0) windosManagerState.windowStores.splice(index, 1)

    }

    const getWindowStore = (id: string): WindowStore | undefined => {
        return windosManagerState.windowStores.find(ws => ws.state.id === id)
    }

    const getNextWindowId = (): string => {
        const windowId = state.nextWindowId++
        return windowId.toString()
    }

    const getNextZIndex = (): number => {
        const nextZIndex = state.nextZIndex
        state.nextZIndex += 1
        state.currentZIndex = nextZIndex
        return nextZIndex
    }

    const getCurrentZIndex = (): number => {
        return state.currentZIndex
    }

    const windowManager: WindowManagerStore = {
        state: windosManagerState,
        addWindowStore, removeWindowStore, getWindowStore, getNextWindowId,
        getNextZIndex, getCurrentZIndex,
    }

    provide(windowManagerStoreKey, windowManager)

    return windowManager
}

export const useWindowManger = (): WindowManagerStore | undefined => {
    return inject(windowManagerStoreKey)
}
