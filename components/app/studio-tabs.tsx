"use client"

import { ArrowRightIcon } from "@phosphor-icons/react"
import * as React from "react"
import { Button } from "@/components/mosaico/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/mosaico/tabs"

export type StudioTab = "entenda" | "credenciais" | "criar"

const TabContext = React.createContext<(tab: StudioTab) => void>(() => {})

type StudioTabsProps = {
  learn: React.ReactNode
  guide: React.ReactNode
  builder: React.ReactNode
}

/** As três etapas da página: entender, preparar as credenciais e criar o passe. */
export function StudioTabs({ learn, guide, builder }: StudioTabsProps) {
  const [tab, setTab] = React.useState<StudioTab>("entenda")

  const goTo = React.useCallback((next: StudioTab) => {
    setTab(next)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  return (
    <TabContext.Provider value={goTo}>
      <Tabs value={tab} onValueChange={(value) => setTab(value as StudioTab)} className="gap-8">
        <TabsList className="self-center">
          <TabsTrigger value="entenda">1. Entenda</TabsTrigger>
          <TabsTrigger value="credenciais">2. Credenciais</TabsTrigger>
          <TabsTrigger value="criar">3. Criar passe</TabsTrigger>
        </TabsList>
        <TabsContent value="entenda">{learn}</TabsContent>
        <TabsContent value="credenciais">{guide}</TabsContent>
        <TabsContent value="criar">{builder}</TabsContent>
      </Tabs>
    </TabContext.Provider>
  )
}

type GoToTabButtonProps = Omit<React.ComponentProps<typeof Button>, "onClick"> & { tab: StudioTab }

/** Botão que leva a outra etapa. Funciona em qualquer conteúdo renderizado dentro de StudioTabs. */
export function GoToTabButton({ tab, children, ...props }: GoToTabButtonProps) {
  const goTo = React.useContext(TabContext)
  return (
    <Button {...props} onClick={() => goTo(tab)}>
      {children}
      <ArrowRightIcon data-icon="inline-end" />
    </Button>
  )
}
