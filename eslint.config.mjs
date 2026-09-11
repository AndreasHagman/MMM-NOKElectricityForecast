import js from "@eslint/js";
import globals from "globals";

export default [
	js.configs.recommended,
	{
		files: ["**/*.js"],
		languageOptions: {
			ecmaVersion: "latest",
			sourceType: "script",
			globals: {
				...globals.browser,
				...globals.node,
				// Globals provided by MagicMirror's core at runtime
				Log: "readonly",
				MM: "readonly",
				Module: "readonly",
				config: "readonly",
				moment: "readonly",
				// Provided by the bundled d3.min.js
				d3: "readonly"
			}
		},
		rules: {
			"no-unused-vars": "warn"
		}
	},
	{
		ignores: ["node_modules/**", "d3.min.js"]
	}
];
