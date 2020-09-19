<template>
    <div id="app">
        <window window-title="TESTAAAAAA" boundary-selector="#app">
            HELLO!
        </window>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/composition-api"
import Window from "@/components/window/window.vue"
import { createWindowManager } from "@/components/window/window-manager-hook"

export default defineComponent({
    components: {
        Window,
    },
    setup() {
        createWindowManager()
        return {}
    },
})
</script>

<style lang="scss">
body {
    //box-sizing: border-box;
}
#app {
    width:800px;
    height: 600px;
    border: solid 1px #444;
    //position: relative;
}
</style>
