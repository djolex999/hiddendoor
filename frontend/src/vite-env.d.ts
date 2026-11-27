interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  /** Which cover to build: "recipes" (default) or "homework" (teen stub). */
  readonly VITE_COVER?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
