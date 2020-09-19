module.exports = {
    css: {
        extract: false,
    },
    configureWebpack: {
        externals: {
            "@vue/composition-api": "@vue/composition-api",
            rxjs: "rxjs",
        },
    },
}
