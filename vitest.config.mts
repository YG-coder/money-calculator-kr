import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// 최소 구성: 순수 함수(src/lib) 단위 테스트만 대상으로 한다.
// UI 렌더 테스트는 jsdom·testing-library 가 추가로 필요하므로 이번 범위에서 제외.
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
