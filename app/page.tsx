import { CredentialsGuide } from "@/components/app/credentials-guide"
import { LearnSection } from "@/components/app/learn-section"
import { PassBuilder } from "@/components/app/pass-builder"
import { StudioTabs } from "@/components/app/studio-tabs"
import { readAppConfig } from "@/lib/config"
import { isDemoAvailable } from "@/lib/wallet/credentials"

// As variáveis de ambiente são lidas a cada requisição, não no build.
export const dynamic = "force-dynamic"

export default function Home() {
  const config = readAppConfig()

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 py-10 sm:px-6 sm:py-14">
      <header className="flex flex-col gap-3 text-center">
        <p className="text-sm font-medium text-muted-foreground">{config.appName}</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          Emita passes para o Google Wallet
        </h1>
        <p className="mx-auto max-w-[60ch] text-muted-foreground text-pretty">
          Entenda a integração, crie as suas credenciais e gere o botão Adicionar ao Google Wallet para
          carteirinhas, ingressos, cartões de fidelidade, cupons e vales-presente.
        </p>
      </header>

      <StudioTabs
        learn={<LearnSection />}
        guide={<CredentialsGuide />}
        builder={<PassBuilder defaults={config.defaults} demoAvailable={isDemoAvailable()} />}
      />
    </main>
  )
}
