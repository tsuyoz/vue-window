import Vue from "vue"
import VueCompositionApi from "@vue/composition-api"
import TestApp from "@/_test_/test-app.vue"

Vue.config.productionTip = false

// Composition Apiの有効化
Vue.use(VueCompositionApi)

new Vue({
    render: (h) => h(TestApp),
}).$mount("#app")
