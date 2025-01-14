import globals from "globals";

export default [{
    languageOptions: {
        globals: {
            ...globals.browser,
            ...globals.jasmine,
            ...globals.amd,
            ...globals.node,
            proj4: true,
            gtag: true,
        },
    },

    rules: {
        "no-bitwise": 2,
        curly: [2, "all"],
        eqeqeq: 2,
        "no-eq-null": 2,
        "guard-for-in": 2,
        "no-extend-native": 2,
        "no-use-before-define": 2,
        complexity: [2, 15],
        "no-caller": 2,
        "no-irregular-whitespace": 2,
        "no-undef": 2,
        "no-unused-vars": 2,
        "space-return-throw-case": 0,

        "keyword-spacing": [2, {
            after: true,
        }],

        "space-before-blocks": [2, "always"],
        "wrap-iife": 2,

        "space-before-function-paren": [2, {
            anonymous: "always",
            named: "never",
        }],

        "no-empty": 2,
        "array-bracket-spacing": [2, "never"],
        "space-in-parens": [2, "never"],
        "comma-style": [2, "last"],
        "space-unary-ops": 0,
        "space-infix-ops": 2,
        "no-with": 2,

        indent: [2, 4, {
            SwitchCase: 1,
        }],

        "no-mixed-spaces-and-tabs": 2,
        "no-trailing-spaces": 2,
        "comma-dangle": [2, "never"],
        "brace-style": 2,
        "eol-last": 2,
        "new-cap": 2,
        "dot-notation": 2,
        "no-multi-str": 2,

        "key-spacing": [2, {
            afterColon: true,
        }],

        "one-var": [2, "never"],
        quotes: [2, "single"],
    },
}];