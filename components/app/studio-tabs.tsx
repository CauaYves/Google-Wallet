"use client"

import { ArrowRightIcon } from "@phosphor-icons/react"
import * as React from "react"
import { Button } from "@/components/mosaico/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/mosaico/tabs"

export type StudioTab = "entenda" | "credenciais" | "criar"

type StudioState = {
  tab: StudioTab
  setTab: (tab: StudioTab) => void
  goTo: (tab: StudioTab) => void
  anchorRef: React.RefObject<HTMLDivElement | null>
}

const StudioContext = React.createContext<StudioState | null>(null)

function useStudio(): StudioState {
  const state = React.useContext(StudioContext)
  if (!state) throw new Error("Use este componente dentro de StudioProvider.")
  return state
}

/** Guarda a etapa aberta. Envolve a página para que o topo também consiga trocar de etapa. */
export function StudioProvider({ children }: { children: React.ReactNode }) {
  const [tab, setTab] = React.useState<StudioTab>("entenda")
  const anchorRef = React.useRef<HTMLDivElement | null>(null)

  const goTo = React.useCallback((next: StudioTab) => {
    setTab(next)
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    anchorRef.current?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" })
  }, [])

  const state = React.useMemo(() => ({ tab, setTab, goTo, anchorRef }), [tab, goTo])
  return <StudioContext.Provider value={state}>{children}</StudioContext.Provider>
}

type StudioTabsProps = {
  learn: React.ReactNode
  guide: React.ReactNode
  builder: React.ReactNode
}

const STEPS: { value: StudioTab; label: string }[] = [
  { value: "entenda", label: "Entenda" },
  { value: "credenciais", label: "Credenciais" },
  { value: "criar", label: "Criar passe" },
]

/** As três etapas da página: entender, preparar as credenciais e criar o passe. */
export function StudioTabs({ learn, guide, builder }: StudioTabsProps) {
  const { tab, setTab, anchorRef } = useStudio()

  return (
    <div ref={anchorRef} className="scroll-mt-4">
      <Tabs value={tab} onValueChange={(value) => setTab(value as StudioTab)} className="gap-8 sm:gap-10">
        <TabsList
          aria-label="Etapas"
          className="w-full group-data-horizontal/tabs:h-11 sm:w-fit"
        >
          {STEPS.map((step, index) => (
            <TabsTrigger key={step.value} value={step.value} className="px-2 sm:px-5">
              <span className="tabular-nums opacity-60">{index + 1}</span>
              {step.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {/* keepMounted: trocar de etapa não apaga o que já foi preenchido no passe. */}
        <TabsContent value="entenda" keepMounted>
          {learn}
        </TabsContent>
        <TabsContent value="credenciais" keepMounted>
          {guide}
        </TabsContent>
        <TabsContent value="criar" keepMounted>
          {builder}
        </TabsContent>
      </Tabs>
    </div>
  )
}

type GoToTabButtonProps = Omit<React.ComponentProps<typeof Button>, "onClick"> & {
  tab: StudioTab
  /** false tira a seta, para botões que não são o passo seguinte. */
  arrow?: boolean
}

/** Botão que leva a outra etapa. Funciona em qualquer lugar dentro de StudioProvider. */
export function GoToTabButton({ tab, arrow = true, children, ...props }: GoToTabButtonProps) {
  const { goTo } = useStudio()
  return (
    <Button {...props} onClick={() => goTo(tab)}>
      {children}
      {arrow && <ArrowRightIcon data-icon="inline-end" />}
    </Button>
  )
}
