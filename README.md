# vue-window

## Install
```
npm install @tsuyoz/vue-window
```
and this component depends below
```
npm install @vue/composition-api rxjs
```
## Quick Start
```
import Vue from "vue"
import VueCompositionApi from "@vue/composition-api"
import VueWindow from "@tsuyoz/vue-window"

Vue.use(VueCompositionApi)
Vue.use(VueWindow)

new Vue({
    setup() {
      createWindowManager(1) // invoke createWindowManager
    },
    render: h => h(App),
}).$mount("#app")
```

### Demo
https://codesandbox.io/s/vue-window-z6fu4?file=/src/main.js   
   
This document is currently being prepared! 
