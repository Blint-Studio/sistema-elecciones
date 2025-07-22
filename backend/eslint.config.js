module.exports = [
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      globals: {
        process: "readonly",
        console: "readonly",
        test: "readonly",
        expect: "readonly",
        describe: "readonly",
        it: "readonly",
        afterAll: "readonly",
      },
    },
    rules: {
      semi: "error",
      "no-unused-vars": "warn",
      "no-undef": "error",
    },
  },
];