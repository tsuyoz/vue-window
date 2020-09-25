import {computed, defineComponent, onMounted, onUnmounted, provide, reactive, ref, SetupContext, toRefs} from "@vue/composition-api"
import {WindowManagerStore} from "@/components/window/window-manager-store"
import {useWindowManger} from "@/components/window/window-manager-hook"
import {WindowState, WindowStore, windowStoreKey} from "@/components/window/window-store"
import {Subject} from "rxjs"

interface Props {
    /**
     * windowのID
     */
    id: string
    /**
     * ウィンドウタイトル
     */
    windowTitle: string
    /**
     * 境界セレクタ
     */
    boundarySelector: string
    /**
     * 初期幅(style)
     */
    initWidth: string
    /**
     * 初期高さ(style)
     */
    initHeight: string
    /**
     * 初期横開始位置(style)
     */
    initLeft: string
    /**
     * 初期縦開始位置(style)
     */
    initTop: string
    /**
     * 初期センタリング
     */
    initCentered: boolean
    /**
     * 初期最大化
     */
    initMaximize: boolean
    /**
     * zIndex
     */
    zIndex?: number
    /**
     * 閉じることができるか
     */
    allowClose: boolean
    /**
     * 最大化できるか
     */
    allowMaximize: boolean
    /**
     * 最小化できるか
     */
    allowMinimize: boolean
    /**
     * ウィンドウをドラッグできるか
     */
    allowDrag: boolean
    /**
     * ウィンドウをリサイズできるか
     */
    allowResize: boolean
}

interface WindowRect {
    /**
     * 幅(px)
     */
    width: number
    /**
     * 高さ(px)
     */
    height: number
    /**
     * 左位置(px)
     */
    left: number
    /**
     * 上位置(px)
     */
    top: number
}

interface WindowStyle {
    width: string
    height: string
    left: string
    top: string
    zIndex: number
}

interface Rect {
    /**
     * 幅(px)
     */
    width: number
    /**
     * 高さ(px)
     */
    height: number
    /**
     * 左位置(px)
     */
    left: number
    /**
     * 上位置(px)
     */
    top: number
    /**
     * 右位置(px)
     */
    right: number
    /**
     * 下位置(px)
     */
    bottom: number
    /**
     * ボーダーを除く幅(px)
     */
    clientWidth: number
    /**
     * ボーダーを除く高さ(px)
     */
    clientHeight: number
    /**
     * ボーダーを除く左位置(px)
     */
    clientLeft: number
    /**
     * ボーダーを除く上位置(px)
     */
    clientTop: number
    /**
     * ボーダーを除く右位置(px)
     */
    clientRight: number
    /**
     * ボーダーを除く下位置(px)
     */
    clietnBottom: number
}

type ResizeHandle = "t" | "b" | "l" | "r" | "tl" | "tr" | "br" | "bl"

class ResizeAction {
    updateLeft = false
    updateTop = false
    updateWidth = false
    updateHeight = false
}

class State {
    /**
     * 有効なウィンドウか
     * Propsに不正な値が渡された場合はfalseになる
     */
    validWindow = true
    /**
     * 初期化済
     */
    initialized = false
    /**
     * 最大化中
     */
    maximized = false
    /**
     * 最小化中
     */
    minimized = false
    /**
     * ドラッグ中
     */
    dragging = false
    /**
     * リサイズ中
     */
    resizing = false
    /**
     * リサイズアクション
     */
    resizeAction = new ResizeAction()
    /**
     * ウィンドウ表示位置・サイズ
     * 位置はdocumentを起点とする座標
     */
    windowRect: WindowRect = {width: 0, height: 0, left: 0, top: 0}
    /**
     * 最大化直前のwindow表示位置・サイズ
     */
    beforeMaximizeWindowRect: WindowRect = {width: 0, height: 0, left: 0, top: 0}
    /**
     * ウィンドウ表示位置・サイズstyle
     * 位置はoffsetParentを起点とする座標
     */
    windowStyle: WindowStyle = {width: "", height: "", left: "", top: "", zIndex: 1}
    /**
     * 境界エレメント
     */
    boundaryElement!: HTMLElement
    /**
     * offsetParentエレメント(座標の起点となるエレメント)
     */
    offsetParentElement!: HTMLElement
    /**
     * offsetParentエレメントがbodyかどうか(bodyの場合はleft, topは0になる)
     */
    offsetParentIsBody = false
    /**
     * ウィンドウをドラッグした際のクリック位置からウィンドウの左端までの幅
     */
    dragOffsetX = 0
    /**
     * ウィンドウをドラッグした際のクリック位置からウィンドウの左端までの高さ
     */
    dragOffsetY = 0
    /**
     * 最小の幅
     */
    minWidth = 150
    /**
     * 最小の高さ
     * 初期化時にタイトルバーの高さがセットされる
     */
    minHeight = 50
}

export default defineComponent({
    props: {
        id: {type: String, required: false, default: ""},
        windowTitle: {type: String, required: false, default: ""},
        boundarySelector: {type: String, required: false, default: "body"},
        initWidth: {type: String, required: false, default: "500px"},
        initHeight: {type: String, required: false, default: "300px"},
        initLeft: {type: String, required: false, default: "0"},
        initTop: {type: String, required: false, default: "0"},
        initCentered: {type: Boolean, required: false, default: false},
        initMaximize: {type: Boolean, required: false, default: false},
        zIndex: {type: Number, required: false},
        allowClose: {type: Boolean, required: false, default: true},
        allowMaximize: {type: Boolean, required: false, default: true},
        allowMinimize: {type: Boolean, required: false, default: true},
        allowDrag: {type: Boolean, required: false, default: true},
        allowResize: {type: Boolean, required: false, default: true},
    },
    setup(props: Props, context: SetupContext) {

        const state = reactive(new State())

        // windowStore用のstateを定義
        const windowState = reactive(new WindowState())
        windowState.windowTitle = props.windowTitle

        // リサイズ通知用のSubjectの生成
        const onWindowResizeSubject = new Subject()

        // windowManagerをinject
        // 上位のコンポーネントでwindowManagerがセットアップされていない場合はundefinedとなる
        const windowManager: WindowManagerStore | undefined = useWindowManger()

        // 現在ウィンドウをドラッグできるか
        const draggable = computed(() => {
            if (!props.allowDrag) return false
            return !state.maximized && !state.minimized
        })

        // 現在ウィンドウをリサイズできるか
        const resizable = computed(() => {
            if (!props.allowResize) return false
            return !state.maximized && !state.minimized
        })

        // 現在ウィンドウを最大化できるか
        const maximazable = computed(() => {
            if (!props.allowMaximize) return false
            return !state.maximized
        })

        // 現在ウィンドウの最大化から戻せるか
        const unmaximazable = computed(() => {
            if (!props.allowMaximize) return false
            return state.maximized
        })

        // 現在ウィンドウを最小化できるか
        const minimazable = computed(() => {
            if (!props.allowMinimize) return false
            return !state.minimized
        })

        // 現在ウィンドウを最小化から戻せるか
        const unminimazable = computed(() => {
            if (!props.allowMinimize) return false
            return state.minimized
        })

        // DOM取得用refを定義
        const windowRef = ref<HTMLElement>()
        const titleBarRef = ref<HTMLElement>()

        // ウィンドウstyleにpropsの値をセット
        state.windowStyle = {
            width: props.initWidth,
            height: props.initHeight,
            left: props.initLeft,
            top: props.initTop,
            zIndex: 1,
        }

        /**
         * DOM要素のdocumentを起点とする絶対座標とサイズを返します
         * @param element
         */
        const getAbsoluteRect = (element: HTMLElement): Rect => {
            const rect = element.getBoundingClientRect()
            const offsetX = window.pageXOffset
            const offsetY = window.pageYOffset

            const width = rect.width
            const height = rect.height
            const left = rect.left + offsetX
            const top = rect.top + offsetY

            const clientWidth = element.clientWidth
            const clientHeight = element.clientHeight
            const clientLeft = left + element.clientLeft
            const clientTop = top + element.clientTop

            return {
                width,
                height,
                left,
                top,
                right: left + width,
                bottom: top + height,
                clientWidth,
                clientHeight,
                clientLeft,
                clientTop,
                clientRight: clientLeft + clientWidth,
                clietnBottom: clientTop + clientHeight,
            }
        }

        const updateWindowRectStyle = (positionOnly?: boolean): void => {
            let offsetLeft = 0
            let offsetTop = 0

            if (!state.offsetParentIsBody) {
                const offsetParentRect = getAbsoluteRect(state.offsetParentElement)
                offsetLeft = offsetParentRect.clientLeft
                offsetTop = offsetParentRect.clientTop
            }

            // 座標をセット
            state.windowStyle.left = `${state.windowRect.left - offsetLeft}px`
            state.windowStyle.top = `${state.windowRect.top - offsetTop}px`

            // 座標のみ更新する場合は終了
            if (positionOnly) return

            // 幅・高さをセット
            state.windowStyle.width = `${state.windowRect.width}px`
            state.windowStyle.height = `${state.windowRect.height}px`
        }

        const updateWindowRect = (windowRect: WindowRect, centered?: boolean): void => {
            // 境界の座標を取得
            const boundaryRect = getAbsoluteRect(state.boundaryElement)

            let {width, height, left, top} = windowRect

            // 幅が境界より大きい場合は境界の幅をセットする
            if (width > boundaryRect.clientWidth) width = boundaryRect.clientWidth

            // 幅が最小幅より小さい場合は最小幅をセットする
            if (width < state.minWidth) width = state.minWidth

            // 高さが境界より大きい場合は境界の高さをセットする
            if (height > boundaryRect.clientHeight) height = boundaryRect.clientHeight

            // 高さが最小幅より小さい場合は最小高さをセットする
            if (height < state.minHeight) height = state.minHeight

            if (centered) { // 中央揃え
                if (width > boundaryRect.clientWidth) { // 幅が境界エリアの幅より大きい場合は0にセット
                    left = 0
                } else {
                    left = (boundaryRect.clientWidth - width) / 2
                }

                if (height > boundaryRect.clientHeight) { // 高さが境界エリアの高さより大きい場合は0にセット
                    top = 0
                } else {
                    top = (boundaryRect.clientHeight - height) / 2
                }
            } else {
                const right = left + width
                const bottom = top + height

                // 右位置が境界外の場合は､左位置をずらす
                if (right > boundaryRect.clientRight) {
                    left -= (right - boundaryRect.clientRight)
                }

                // 左位置が境界外の場合は､左位置を境界の開始位置にセット
                if (left < boundaryRect.clientLeft) {
                    left = boundaryRect.clientLeft
                }

                // 下位置が境界外の場合は､上位置をずらす
                if (bottom > boundaryRect.clietnBottom) {
                    top -= (bottom - boundaryRect.clietnBottom)
                }

                // 上位置が境界外の場合は､上位置を境界の開始位置にセット
                if (top < boundaryRect.clientTop) {
                    top = boundaryRect.clientTop
                }
            }

            state.windowRect = {width, height, left, top}

            updateWindowRectStyle()
        }

        const bringToFront = (): void => {
            if (windowManager && state.windowStyle.zIndex < windowManager.getCurrentZIndex()) {
                state.windowStyle.zIndex = windowManager.getNextZIndex()
            }
        }

        const setMaximizeWindowRect = (): void => {
            const boundaryRect = getAbsoluteRect(state.boundaryElement)

            state.windowRect = {
                width: boundaryRect.clientWidth,
                height: boundaryRect.clientHeight,
                left: boundaryRect.clientLeft,
                top: boundaryRect.clientTop,
            }

            updateWindowRectStyle()
        }

        const doMaximizeWindow = (initialize: boolean): void => {
            // 最大化できない場合は終了
            if (!maximazable.value) return

            // 現在のウィンドウ表示位置・サイズを退避
            state.beforeMaximizeWindowRect = {...state.windowRect}

            setMaximizeWindowRect()
            state.maximized = true

            // 初期処理でない場合
            if (!initialize) {
                bringToFront()
                onWindowResizeSubject.next()
            }
        }

        const maximizeWindow = (): void => {
            doMaximizeWindow(false)
        }

        const unmaximizeWindow = (): void => {
            if (!unmaximazable.value) return

            updateWindowRect(state.beforeMaximizeWindowRect)
            bringToFront()
            state.maximized = false
            onWindowResizeSubject.next()
        }

        const minimizeWindow = (): void => {
            if (!minimazable.value) return
            state.minimized = true
        }

        const unminimizeWindow = (): void => {
            if (!unminimazable.value) return
            updateWindowRect(state.windowRect)
            bringToFront()
            state.minimized = false
            onWindowResizeSubject.next()
        }

        const closeWindow = (): void => {
            context.emit("close-window")
            state.validWindow = false
            if (windowManager) {
                windowManager.removeWindowStore(windowState.id)
            }
        }

        const onClickWindow = (): void => {
            bringToFront()
        }

        const selectWindow = (): void => {
            if (state.minimized && unminimazable.value) {
                unminimizeWindow()
            } else {
                bringToFront()
            }
        }

        // ウィンドウ移動処理
        const dragMove = (event: MouseEvent): void => {
            if (!state.dragging) return

            const boundaryRect = getAbsoluteRect(state.boundaryElement)

            const mouseX = event.pageX
            const mouseY = event.pageY

            let top = mouseY - state.dragOffsetY

            if (top < boundaryRect.clientTop) top = boundaryRect.clientTop

            if (top + state.windowRect.height > boundaryRect.clietnBottom) {
                top = boundaryRect.clietnBottom - state.windowRect.height
            }

            let left = mouseX - state.dragOffsetX

            if (left < boundaryRect.clientLeft) left = boundaryRect.clientLeft

            if (left + state.windowRect.width > boundaryRect.clientRight) {
                left = boundaryRect.clientRight - state.windowRect.width
            }

            state.windowRect.top = top
            state.windowRect.left = left

            updateWindowRectStyle(true)
        }

        const endDrag = (): void => {
            state.dragging = false
            document.removeEventListener("mousemove", dragMove)
            document.removeEventListener("mouseup", endDrag)
        }

        const startDrag = (event: MouseEvent): void => {
            if (!draggable.value) return

            bringToFront()
            state.dragging = true

            state.dragOffsetX = event.pageX - state.windowRect.left
            state.dragOffsetY = event.pageY - state.windowRect.top

            document.addEventListener("mousemove", dragMove)
            document.addEventListener("mouseup", endDrag)
        }

        // リサイズ処理
        const resizeMove = (event: MouseEvent): void => {
            if (!state.resizing) return

            const boundaryRect = getAbsoluteRect(state.boundaryElement)

            let mouseX = event.pageX
            let mouseY = event.pageY

            if (mouseX < boundaryRect.clientLeft) mouseX = boundaryRect.clientLeft
            if (mouseX > boundaryRect.clientRight) mouseX = boundaryRect.clientRight
            if (mouseY < boundaryRect.clientTop) mouseY = boundaryRect.clientTop
            if (mouseY > boundaryRect.clietnBottom) mouseY = boundaryRect.clietnBottom

            let {width, height, left, top} = state.windowRect

            if (state.resizeAction.updateLeft) {
                const _width = width + (left - mouseX)
                if (_width >= state.minWidth) {
                    width = _width
                    left = mouseX
                } else {
                    left += (width - state.minWidth)
                    width = state.minWidth
                }
            }

            if (state.resizeAction.updateTop) {
                const _height = height + (top - mouseY)
                if (_height >= state.minHeight) {
                    height = _height
                    top = mouseY
                } else {
                    top += (height - state.minHeight)
                    height = state.minHeight
                }
            }

            if (state.resizeAction.updateWidth) {
                width = mouseX - state.windowRect.left
                if (width < state.minWidth) width = state.minWidth
            }

            if (state.resizeAction.updateHeight) {
                height = mouseY - state.windowRect.top
                if (height < state.minHeight) height = state.minHeight
            }

            state.windowRect = {width, height, left, top}
            updateWindowRectStyle()
            onWindowResizeSubject.next()
        }

        const endResize = (): void => {
            state.resizing = false
            document.removeEventListener("mousemove", resizeMove)
            document.removeEventListener("mouseup", endResize)
        }

        const startResize = (resizeHandle: ResizeHandle): void => {
            if (!resizable.value) return

            bringToFront()

            state.resizing = true
            state.resizeAction = new ResizeAction()

            switch (resizeHandle) {
                case "t":
                    state.resizeAction.updateTop = true
                    break
                case "b":
                    state.resizeAction.updateHeight = true
                    break
                case "l":
                    state.resizeAction.updateLeft = true
                    break
                case "r":
                    state.resizeAction.updateWidth = true
                    break
                case "tl":
                    state.resizeAction.updateTop = true
                    state.resizeAction.updateLeft = true
                    break
                case "tr":
                    state.resizeAction.updateTop = true
                    state.resizeAction.updateWidth = true
                    break
                case "bl":
                    state.resizeAction.updateHeight = true
                    state.resizeAction.updateLeft = true
                    break
                case "br":
                    state.resizeAction.updateHeight = true
                    state.resizeAction.updateWidth = true
                    break
                default:
                    break
            }

            document.addEventListener("mousemove", resizeMove)
            document.addEventListener("mouseup", endResize)
        }

        const onResizeWindow = (): void => {
            if (state.maximized) {
                setMaximizeWindowRect()
            } else if (!state.minimized) {
                updateWindowRect(state.windowRect)
            }
            onWindowResizeSubject.next()
        }

        const windowStore: WindowStore = {
            state: windowState,
            closeWindow, selectWindow, bringToFront,
            maximizeWindow, unmaximizeWindow,
            minimizeWindow, unminimizeWindow,
            $onWindowResize: onWindowResizeSubject.asObservable(),
        }

        provide(windowStoreKey, windowStore)

        onMounted(() => {
            const windowElement = windowRef.value

            if (!windowElement) {
                state.validWindow = false
                return
            }

            // 境界エレメントを取得
            const boundaryElement = windowElement.closest(props.boundarySelector)

            // 取得できなければ終了
            if (boundaryElement == null) {
                state.validWindow = false
                return
            }

            state.boundaryElement = boundaryElement as HTMLElement

            // offsetParentエレメントを取得
            const offsetParentElement = windowElement.offsetParent

            // 取得できなければ終了
            if (offsetParentElement == null) {
                state.validWindow = false
                return
            }

            state.offsetParentElement = offsetParentElement as HTMLElement

            if (offsetParentElement.tagName.toUpperCase() === "BODY") {
                state.offsetParentIsBody = true
            }

            // タイトルバーエレメントを取得
            const titleBarElement = titleBarRef.value

            if (titleBarElement) {
                const titleBarRect = getAbsoluteRect(titleBarElement)
                // タイトルバーの高さを最小の高さにセット
                state.minHeight = titleBarRect.height
            }

            // propsの値をセットした状態で一旦座標をセット
            const windowRect = getAbsoluteRect(windowElement)
            updateWindowRect(windowRect, props.initCentered)

            // 初期で最大化する場合
            if (props.initMaximize) {
                doMaximizeWindow(true)
            }

            // ウィンドウのリサイズ時処理をセット
            window.addEventListener("resize", onResizeWindow)

            // id
            if (!props.id && windowManager) {
                windowState.id = windowManager.getNextWindowId()
            } else {
                windowState.id = props.id
            }

            // zIndex
            if (props.zIndex === undefined) {
                if (windowManager) {
                    state.windowStyle.zIndex = windowManager.getNextZIndex()
                }
            } else {
                state.windowStyle.zIndex = props.zIndex
            }

            // windowMamangerが存在する場合はウィンドウストアを追加
            if (windowManager) {
                windowManager.addWindowStore(windowStore)
            }

            state.initialized = true
        })

        onUnmounted(() => {
            window.removeEventListener("resize", onResizeWindow)

            if (windowManager) {
                windowManager.removeWindowStore(windowState.id)
            }
        })

        return {
            ...toRefs(state), windowRef, titleBarRef,
            draggable, resizable, maximazable, unmaximazable, minimazable, unminimazable,
            startDrag, startResize,
            maximizeWindow, unmaximizeWindow, minimizeWindow, closeWindow, onClickWindow,
        }
    },
})
