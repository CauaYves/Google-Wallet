import { expect, it } from "vitest"
import { createRateLimiter } from "@/lib/rate-limit"

it("bloqueia depois do limite e libera quando a janela vira", () => {
  let now = 0
  const allow = createRateLimiter(2, 1000, () => now)
  expect(allow("a")).toBe(true)
  expect(allow("a")).toBe(true)
  expect(allow("a")).toBe(false)
  expect(allow("b")).toBe(true)
  now = 1001
  expect(allow("a")).toBe(true)
})
