import {InjectionKey} from "@vue/composition-api"
import {Observable} from "rxjs"

export class WindowState {
    id = ""
    windowTitle = ""
}

export interface WindowStore {
    state: WindowState
    closeWindow: () => void
    selectWindow: () => void
    bringToFront: () => void
    maximizeWindow: () => void
    unmaximizeWindow: () => void
    minimizeWindow: () => void
    unminimizeWindow: () => void
    $onWindowResize: Observable<unknown>
}

export const windowStoreKey: InjectionKey<WindowStore> = Symbol("windowStoreKey")
