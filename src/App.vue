<template>
    <div id="app">
        <window window-title="TESTAAAAAA" boundary-selector="#app"
                init-width="80%" init-height="80%">
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
#app {
    width: 100%;
    height: 100%;
}
</style>
