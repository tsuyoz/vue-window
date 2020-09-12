import Vue from "vue"
import VueCompositionApi from "@vue/composition-api"
import App from "@/App.vue"
import "@/styles/common.scss"

Vue.config.productionTip = false

// Composition Apiの有効化
Vue.use(VueCompositionApi)

new Vue({
    render: (h) => h(App),
}).$mount("#app")
