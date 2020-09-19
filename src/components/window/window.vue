<template>
    <div ref="windowRef" v-if="validWindow" v-show="!minimized" @click="onClickWindow"
        :style="windowStyle" class="window" :class="{hidden: !initialized}">

        <div class="drag-handle top" :class="{resizable}"
             @mousedown.stop.prevent="startResize('t')"></div>
        <div class="drag-handle bottom" :class="{resizable}"
             @mousedown.stop.prevent="startResize('b')"></div>
        <div class="drag-handle left" :class="{resizable}"
             @mousedown.stop.prevent="startResize('l')"></div>
        <div class="drag-handle right" :class="{resizable}"
             @mousedown.stop.prevent="startResize('r')"></div>
        <div class="drag-handle top-left" :class="{resizable}"
             @mousedown.stop.prevent="startResize('tl')"></div>
        <div class="drag-handle top-right" :class="{resizable}"
             @mousedown.stop.prevent="startResize('tr')"></div>
        <div class="drag-handle bottom-right" :class="{resizable}"
             @mousedown.stop.prevent="startResize('br')"></div>
        <div class="drag-handle bottom-left" :class="{resizable}"
             @mousedown.stop.prevent="startResize('bl')"></div>

        <div class="window-containar">
            <div class="title-bar" :class="{draggable}" ref="titleBarRef"
                 @mousedown.stop.prevent="startDrag($event)">
                <div class="window-title">{{ windowTitle }}</div>
                <div class="window-buttons">
                    <div class="icon minimize"
                         @click="minimizeWindow" v-if="minimazable"></div>
                    <div class="icon maximize"
                         @click="maximizeWindow" v-if="maximazable"></div>
                    <div class="icon unmaximize"
                         @click="unmaximizeWindow" v-if="unmaximazable"></div>
                    <div class="icon close"
                         @click="closeWindow" v-if="allowClose"></div>
                </div>
            </div>
            <div class="window-content">
                <slot/>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Window from "./window"

export default Window
</script>

<style lang="scss" scoped>
$window-backgrond-color: #ffffff;
$window-border-color: #cccccc;
$window-title-bar-color: #f6f6f6;

.window {
    position: absolute;
    border: solid 1px $window-border-color;
    color: rgba(0, 0, 0, 0.87);
    background: $window-backgrond-color;
    box-sizing: border-box;
    transition: box-shadow 200ms cubic-bezier(0, 0, 0.2, 1);
    box-shadow: 0 3px 1px -2px rgba(0, 0, 0, 0.2),
    0 2px 2px 0 rgba(0, 0, 0, 0.14),
    0 1px 5px 0 rgba(0, 0, 0, 0.12);
}

.window:active {
    box-shadow: 0 5px 5px -3px rgba(0, 0, 0, 0.2),
    0 8px 10px 1px rgba(0, 0, 0, 0.14),
    0 3px 14px 2px rgba(0, 0, 0, 0.12);
}

.window-containar {
    width: 100%;
    height: 100%;
    overflow: hidden;
}

.title-bar {
    width: 100%;
    height: 46px;
    padding: 10px;
    background: $window-title-bar-color;
    border-bottom: solid 1px $window-border-color;
    overflow: hidden;
    box-sizing: border-box;
}

.title-bar.draggable {
    cursor: move;
}

.window-title {
    width: 100%;
    overflow: hidden;
    white-space: nowrap;
}

.window-buttons {
    background: $window-title-bar-color;
    text-align: right;
    position: absolute;
    right: 10px;
    top: 10px;
}

.window-content {
    width: 100%;
    height: calc(100% - 46px);
    padding: 10px;
    overflow: scroll;
    box-sizing: border-box;
}

.drag-handle {
    position: absolute;
}

.drag-handle.top {
    width: 100%;
    height: 2px;
    left: -1px;
    top: -1px;
}

.drag-handle.top.resizable {
    cursor: ns-resize;
}

.drag-handle.bottom {
    width: 100%;
    height: 2px;
    bottom: -1px;
    left: -1px;
}

.drag-handle.bottom.resizable {
    cursor: ns-resize;
}

.drag-handle.left {
    width: 2px;
    height: 100%;
    left: -1px;
    top: -1px;
}

.drag-handle.left.resizable {
    cursor: ew-resize;
}

.drag-handle.right {
    width: 2px;
    height: 100%;
    right: -1px;
    top: -1px;
}

.drag-handle.right.resizable {
    cursor: ew-resize;
}

.drag-handle.top-left {
    width: 15px;
    height: 15px;
    left: -1px;
    top: -1px;
}

.drag-handle.top-left.resizable {
    cursor: nwse-resize;
}

.drag-handle.top-right {
    width: 15px;
    height: 15px;
    right: -1px;
    top: -1px;
}

.drag-handle.top-right.resizable {
    cursor: nesw-resize;
}

.drag-handle.bottom-left {
    width: 15px;
    height: 15px;
    left: -1px;
    bottom: -1px;
}

.drag-handle.bottom-left.resizable {
    cursor: nesw-resize;
}

.drag-handle.bottom-right {
    width: 15px;
    height: 15px;
    right: -1px;
    bottom: -1px;
}

.drag-handle.bottom-right.resizable {
    cursor: nwse-resize;
}

.hidden {
    opacity: 0;
}

$icon-color: #888888;

.icon {
    color: $icon-color;
    cursor: pointer;
    position: relative;
    display: inline-block;
    width: 20px;
    height: 20px;
    margin-top: 2px;
    margin-left: 10px;
}

.icon.close:before {
    content: "";
    position: absolute;
    top: 9px;
    left: 0;
    width: 20px;
    height: 2px;
    background-color: $icon-color;
    -webkit-transform: rotate(-45deg);
    transform: rotate(-45deg);
}

.icon.close:after {
    content: "";
    position: absolute;
    top: 9px;
    left: 0;
    width: 20px;
    height: 2px;
    background-color: $icon-color;
    -webkit-transform: rotate(45deg);
    transform: rotate(45deg);
}

.icon.maximize:before {
    content: "";
    position: absolute;
    top: 1px;
    left: 1px;
    box-sizing: border-box;
    width: 18px;
    height: 18px;
    border: solid 2px $icon-color;
    border-radius: 2px;
}

.icon.unmaximize:before {
    content: "";
    position: absolute;
    top: 1px;
    left: 4px;
    box-sizing: border-box;
    width: 15px;
    height: 15px;
    border: solid 2px $icon-color;
    border-radius: 2px;
}

.icon.unmaximize:after {
    content: "";
    position: absolute;
    top: 4px;
    left: 1px;
    box-sizing: border-box;
    width: 15px;
    height: 15px;
    border: solid 2px $icon-color;
    background-color: $window-title-bar-color;
    border-radius: 2px;
}

.icon.minimize:before {
    content: "";
    position: absolute;
    top: 9px;
    left: 1px;
    width: 18px;
    height: 2px;
    background-color: $icon-color;
}
</style>
