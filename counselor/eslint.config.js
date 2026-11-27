import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

// Nothing may persist on the device: no web storage, no cookies, no service
// worker. Anything stored there could be found by someone checking her phone.
const STORAGE_MESSAGE = "Nothing may be stored on the device. Keep state in memory only.";

export default tseslint.config(
  { ignores: ["dist"] },
  js.configs.recommended,
  ...tseslint.configs.strict,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: { globals: globals.browser },
    plugins: { "react-hooks": reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "no-restricted-globals": [
        "error",
        { name: "localStorage", message: STORAGE_MESSAGE },
        { name: "sessionStorage", message: STORAGE_MESSAGE },
        { name: "indexedDB", message: STORAGE_MESSAGE },
        { name: "caches", message: STORAGE_MESSAGE },
      ],
      "no-restricted-properties": [
        "error",
        { object: "window", property: "localStorage", message: STORAGE_MESSAGE },
        { object: "window", property: "sessionStorage", message: STORAGE_MESSAGE },
        { object: "window", property: "indexedDB", message: STORAGE_MESSAGE },
        { object: "globalThis", property: "localStorage", message: STORAGE_MESSAGE },
        { object: "document", property: "cookie", message: STORAGE_MESSAGE },
        { object: "navigator", property: "serviceWorker", message: STORAGE_MESSAGE },
      ],
      // Bodies come from strangers. React escapes text; never bypass that.
      "no-restricted-syntax": [
        "error",
        {
          selector: "JSXAttribute[name.name='dangerouslySetInnerHTML']",
          message: "Render user text as text, never as HTML.",
        },
      ],
    },
  },
);
