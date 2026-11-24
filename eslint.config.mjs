import { FlatCompat } from "@eslint/eslintrc"

const compat = new FlatCompat({ baseDirectory: import.meta.dirname })

const config = [
  {
    // components/mosaico, hooks/mosaico e lib/mosaico vêm do registry do Mosaico (shadcn add).
    ignores: [".next/**", "node_modules/**", "next-env.d.ts", "components/mosaico/**", "hooks/mosaico/**", "lib/mosaico/**", ".claude/**"],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
]

export default config
