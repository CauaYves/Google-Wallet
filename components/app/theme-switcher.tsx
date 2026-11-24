"use client"

import { MonitorIcon } from "@phosphor-icons/react"
import { useTheme } from "next-themes"
import * as React from "react"
import { MoonIcon, SunIcon } from "@/components/mosaico/theme-toggle"

const OPTIONS = [
  { value: "light", label: "Claro", icon: <SunIcon className="size-4" /> },
  { value: "dark", label: "Escuro", icon: <MoonIcon className="size-4" /> },
  { value: "system", label: "Sistema", icon: <MonitorIcon className="size-4" /> },
] as const

const subscribe = () => () => {}

/**
 * Escolha de tema com três opções: claro, escuro ou o do sistema. São botões de rádio
 * nativos, então funcionam com teclado e leitor de tela sem código extra.
 */
export function ThemeSwitcher() {
  const { theme, resolvedTheme, setTheme } = useTheme()
  // O tema só é conhecido no navegador. Até a hidratação nenhuma opção aparece marcada.
  const hydrated = React.useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  )
  const current = hydrated ? theme : undefined

  return (
    <fieldset className="flex items-center rounded-full bg-muted p-1">
      <legend className="sr-only">Tema da página</legend>
      {OPTIONS.map((option) => {
        const title =
          option.value === "system" && hydrated
            ? `Sistema (agora ${resolvedTheme === "dark" ? "escuro" : "claro"})`
            : option.label
        return (
          <label
            key={option.value}
            title={title}
            className="flex size-8 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground has-checked:bg-background has-checked:text-foreground has-checked:shadow-xs has-focus-visible:ring-3 has-focus-visible:ring-ring/50 dark:has-checked:bg-input/60"
          >
            <input
              type="radio"
              name="tema"
              value={option.value}
              checked={current === option.value}
              onChange={() => setTheme(option.value)}
              className="sr-only"
            />
            {option.icon}
            <span className="sr-only">{title}</span>
          </label>
        )
      })}
    </fieldset>
  )
}
