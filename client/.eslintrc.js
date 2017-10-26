module.exports = {
  "env": {
    "browser": true,
    "commonjs": true,
    "es6": true,
    "mocha": true,
    "node": true
  },
  "extends": "eslint:recommended",
  "parser": "babel-eslint",
  "parserOptions": {
    "ecmaFeatures": {
      "experimentalObjectRestSpread": true,
      "jsx": true
    },
    "sourceType": "module"
  },
  "plugins": [
    "react",
    "mocha"
  ],
  "rules": {
    "accessor-pairs": "error",
    "array-bracket-spacing": "warn",
    "array-callback-return": "warn",
    "arrow-parens": "warn",
    "arrow-spacing": "warn",
    "block-scoped-var": "error",
    "block-spacing": "warn",
    "brace-style": "warn",
    "camelcase": ["warn", {"properties": "never"}],
    "class-methods-use-this": ["warn", {
      exceptMethods: [
        "render",
        "getInitialState",
        "getDefaultProps",
        "getChildContext",
        "componentWillMount",
        "componentDidMount",
        "componentWillReceiveProps",
        "shouldComponentUpdate",
        "componentWillUpdate",
        "componentDidUpdate",
        "componentWillUnmount",
      ],
    }],
    "comma-dangle": "warn",
    "comma-spacing": "warn",
    "comma-style": "warn",
    "computed-property-spacing": "warn",
    "consistent-this": "error",
    "curly": "warn",
    "default-case": "error",
    "dot-location": "warn",
    "dot-notation": "warn",
    "eol-last": "warn",
    "eqeqeq": "error",
    "func-call-spacing": "warn",
    "func-name-matching": "warn",
    "func-style": "warn",
    "generator-star-spacing": "warn",
    "global-require": "error",
    "guard-for-in": "error",
    "handle-callback-err": "warn",
    "id-blacklist": "warn",
    "id-length": ["warn", { "exceptions": ["i", "j", "k", "_", "x", "y"] }],
    "id-match": "warn",
    "indent": ["warn", 2],
    "react/jsx-uses-react": "error",
    "react/jsx-uses-vars": "error",
    "jsx-quotes": "warn",
    "key-spacing": "warn",
    "keyword-spacing": "warn",
    "line-comment-position": "warn",
    "linebreak-style": [
      "warn",
      "unix"
    ],
    "lines-around-comment": "warn",
    "lines-around-directive": "warn",
    "max-depth": "warn",
    "max-len": ["warn", 120],
    "max-lines": [
      "warn",
      {
        "max": 400,
        "skipComments": true,
        "skipBlankLines": true
      }
    ],
    "max-nested-callbacks": "warn",
    "max-params": ["warn", { "max": 5 }],
    "max-statements": [
      "warn",
      {
        "max": 12
      }
    ],
    "max-statements-per-line": "warn",
    "mocha/no-exclusive-tests": "warn",
    "new-cap": "warn",
    "new-parens": "warn",
    "newline-after-var": "warn",
    "newline-before-return": "warn",
    "newline-per-chained-call": "warn",
    "no-alert": "warn",
    "no-array-constructor": "error",
    "no-bitwise": "error",
    "no-caller": "error",
    "no-catch-shadow": "error",
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "no-continue": "warn",
    "no-div-regex": "warn",
    "no-duplicate-imports": "warn",
    "no-else-return": "warn",
    "no-empty-function": "warn",
    "no-eq-null": "warn",
    "no-eval": "error",
    "no-extend-native": "error",
    "no-extra-bind": "error",
    "no-extra-label": "error",
    "no-extra-parens": ["warn", "functions"],
    "no-floating-decimal": "error",
    "no-implicit-coercion": "error",
    "no-implicit-globals": "error",
    "no-implied-eval": "error",
    "no-iterator": "error",
    "no-label-var": "error",
    "no-labels": "error",
    "no-lone-blocks": "error",
    "no-lonely-if": "error",
    "no-loop-func": "error",
    "no-mixed-operators": "error",
    "no-mixed-requires": "error",
    "no-multi-spaces": "warn",
    "no-multi-str": "error",
    "no-multiple-empty-lines": "warn",
    "no-native-reassign": "error",
    "no-negated-condition": "error",
    "no-negated-in-lhs": "error",
    "no-nested-ternary": "error",
    "no-new": "error",
    "no-new-func": "error",
    "no-new-object": "error",
    "no-new-require": "error",
    "no-new-wrappers": "error",
    "no-octal-escape": "error",
    "no-param-reassign": "error",
    "no-path-concat": "error",
    "no-plusplus": ["error", { "allowForLoopAfterthoughts": true }],
    "no-process-env": "error",
    "no-process-exit": "error",
    "no-proto": "error",
    "no-prototype-builtins": "error",
    "no-restricted-globals": "error",
    "no-restricted-imports": "error",
    "no-restricted-modules": "error",
    "no-restricted-properties": "error",
    "no-restricted-syntax": "error",
    "no-return-await": "error",
    "no-script-url": "error",
    "no-self-compare": "error",
    "no-sequences": "error",
    "no-shadow": "error",
    "no-shadow-restricted-names": "error",
    "no-spaced-func": "error",
    "no-sync": "error",
    "no-tabs": "error",
    "no-template-curly-in-string": "error",
    "no-throw-literal": "error",
    "no-trailing-spaces": "warn",
    "no-undef-init": "error",
    "no-undefined": "error",
    "no-underscore-dangle": "error",
    "no-unmodified-loop-condition": "error",
    "no-unneeded-ternary": "warn",
    "no-unused-expressions": "warn",
    "no-use-before-define": "error",
    "no-useless-call": "error",
    "no-useless-computed-key": "error",
    "no-useless-concat": "error",
    "no-useless-constructor": "error",
    "no-useless-escape": "error",
    "no-useless-rename": "error",
    "no-useless-return": "error",
    "no-var": "error",
    "no-void": "error",
    "no-whitespace-before-property": "warn",
    "no-with": "error",
    "object-curly-spacing": [
      "warn",
      "always"
    ],
    "object-property-newline": "error",
    "object-shorthand": "warn",
    "one-var-declaration-per-line": "error",
    "operator-assignment": "error",
    "operator-linebreak": ["error", "after"],
    "prefer-arrow-callback": "warn",
    "prefer-numeric-literals": "error",
    "prefer-rest-params": "warn",
    "prefer-spread": "warn",
    "prefer-template": "warn",
    "quotes": ["warn", "single", {"avoidEscape": true}],
    "quote-props": ["warn", "as-needed"],
    "radix": "error",
    "rest-spread-spacing": "warn",
    "semi": "warn",
    "semi-spacing": "warn",
    "sort-imports": "off",
    "sort-vars": "warn",
    "space-before-blocks": "warn",
    "space-in-parens": [
      "error",
      "never"
    ],
    "space-infix-ops": "warn",
    "space-unary-ops": "warn",
    "spaced-comment": [
      "warn",
      "always"
    ],
    "strict": "error",
    "symbol-description": "error",
    "template-curly-spacing": "warn",
    "unicode-bom": [
      "warn",
      "never"
    ],
    "vars-on-top": "error",
    "wrap-iife": "error",
    "wrap-regex": "warn",
    "yield-star-spacing": "warn",
    "yoda": "error"
  }
};
