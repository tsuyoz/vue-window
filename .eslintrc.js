const isProductionEnv = process.env.NODE_ENV === "production"

module.exports = {
    root: true,
    env: {
        node: true,
    },
    extends: [
        "plugin:vue/essential",
        "@vue/airbnb",
        "@vue/typescript/recommended",
    ],
    parser: "vue-eslint-parser",
    parserOptions: {
        parser: "@typescript-eslint/parser",
        ecmaVersion: 2020,
    },
    rules: {
        "no-console": isProductionEnv ? "warn" : "off",
        "no-debugger": isProductionEnv ? "warn" : "off",
        // ダブルコーテーションを強制
        "quotes": ["error", "double"],
        // セミコロンなし
        "semi": ["error", "never"],
        // インデント
        "indent": ["error", 4, { SwitchCase: 1 }],

        // {}の内側にスペースを入れるか
        "object-curly-spacing": "off",
        // {}の前後に改行を矯正するか
        "object-curly-newline": "off",
        // オブジェクトのプロパティを必ず1つずつ改行するように強制するか
        "object-property-newline": "off",
        // export defaultを強制するか
        "import/prefer-default-export": "off",
        // 行の末尾の空白を許可するか
        "no-trailing-spaces": "off",
        // クラスメンバー同士の間に行を強制するか
        "lines-between-class-members": "off",
        // ブロック内のパディングを強制するか
        "padded-blocks": "off",
        // アロー関数の開始行の次の行がreturnだった場合､ {}を禁止するか
        "arrow-body-style": "off",
        // アロー関数に()を強制するか
        "arrow-parens": "off",
        // アンダースコアで始まる名前を禁止するか
        "no-underscore-dangle": "off",
        // else内でのreturnを禁止するか
        "no-else-return": "off",
        // ++, -- を禁止するか
        "no-plusplus": "off",
        // for-in for-of with labeled を禁止するか
        "no-restricted-syntax": "off",
        // continueを禁止するか
        "no-continue": "off",
        // パラメータへの再代入を禁止するか(props: パラメータ内のプロパティへの代入を禁止するか)
        "no-param-reassign": ["error", { "props": false }],
        // 分割代入を強制するか
        "prefer-destructuring": "off", //["error", {"object": true, "array": false}],
        // インポート
        "import/named": "off",
        //
        "max-classes-per-file": "off",
        // 無関係なインポートを禁止するか
        "import/no-extraneous-dependencies": "off",
        // anyの使用を許可するか
        "@typescript-eslint/no-explicit-any": "off",
        // requireの使用を禁止するか
        "@typescript-eslint/no-var-requires": "off",
        // @ts-ignoreの使用を禁止するか
        "@typescript-eslint/ban-ts-ignore": "off",
        // キャメルケースを禁止するか
        "@typescript-eslint/camelcase": "off",

        // メンバー区切り文字
        "@typescript-eslint/member-delimiter-style": ["error", {
            // 複数行の場合
            multiline: {
                delimiter: "none",
                requireLast: false,
            },
            // 単一行の場合
            singleline: {
                delimiter: "comma",
                requireLast: false,
            },
        }],
    },
}
