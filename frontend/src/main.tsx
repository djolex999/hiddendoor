import { lazy, StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";

import { App } from "./App";
import { installTraceGuards } from "./panic";
import "./styles.css";

installTraceGuards();

const root = document.getElementById("root");
if (!root) throw new Error("Missing #root element");

// Which cover this build is (see src/covers/index.ts). Recipes unless
// VITE_COVER=homework. The comparison is written inline so Vite drops the
// teen stub from a recipes build entirely.
const HomeworkCover =
  import.meta.env.VITE_COVER === "homework"
    ? lazy(() =>
        import("./covers/homework/HomeworkCover").then((m) => ({ default: m.HomeworkCover })),
      )
    : null;

createRoot(root).render(
  <StrictMode>
    {HomeworkCover ? (
      <Suspense fallback={null}>
        <HomeworkCover />
      </Suspense>
    ) : (
      <App />
    )}
  </StrictMode>,
);
