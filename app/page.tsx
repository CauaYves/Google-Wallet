import { WalletIcon } from "@phosphor-icons/react/dist/ssr"
import { CredentialsGuide } from "@/components/app/credentials-guide"
import { LearnSection } from "@/components/app/learn-section"
import { PassBuilder } from "@/components/app/pass-builder"
import { PassFan } from "@/components/app/pass-fan"
import { GoToTabButton, StudioProvider, StudioTabs } from "@/components/app/studio-tabs"
import { ThemeSwitcher } from "@/components/app/theme-switcher"
import { readAppConfig } from "@/lib/config"
import { isDemoAvailable } from "@/lib/wallet/credentials"

// As variáveis de ambiente são lidas a cada requisição, não no build.
export const dynamic = "force-dynamic"

export default function Home() {
  const config = readAppConfig()

  return (
    <StudioProvider>
      <div className="mx-auto flex min-h-svh w-full max-w-6xl flex-col px-4 sm:px-8">
        <header className="flex items-center justify-between gap-4 py-4 sm:py-6">
          <p className="flex min-w-0 items-center gap-2 font-heading text-base font-semibold tracking-tight">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <WalletIcon weight="fill" className="size-4.5" />
            </span>
            <span className="truncate">{config.appName}</span>
          </p>
          <ThemeSwitcher />
        </header>

        <main className="flex flex-col gap-12 pb-16 sm:gap-16">
          <section className="grid items-center gap-x-10 gap-y-12 pt-6 sm:pt-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <div className="flex flex-col items-start gap-5">
              <h1 className="font-heading text-[clamp(2.4rem,7vw,4.25rem)] leading-[1.02] font-semibold tracking-[-0.03em] text-balance">
                O seu passe, salvo na carteira do Android
              </h1>
              <p className="max-w-[58ch] text-base text-pretty text-muted-foreground sm:text-lg">
                O Google Wallet é a carteira digital do Android. Além de cartões de pagamento, ele guarda
                ingressos, carteirinhas, cartões de fidelidade, cupons e vales-presente, que a pessoa salva
                com um toque no botão Adicionar ao Google Wallet. Aqui você entende como isso funciona,
                prepara as credenciais e gera esse botão para o seu passe.
              </p>
              <div className="flex flex-wrap gap-3 pt-1">
                <GoToTabButton tab="criar" size="lg">
                  Criar um passe
                </GoToTabButton>
                <GoToTabButton tab="entenda" size="lg" variant="outline" arrow={false}>
                  Entender primeiro
                </GoToTabButton>
              </div>
            </div>
            <PassFan className="py-4 lg:py-0" />
          </section>

          <StudioTabs
            learn={<LearnSection />}
            guide={<CredentialsGuide />}
            builder={<PassBuilder defaults={config.defaults} demoAvailable={isDemoAvailable()} />}
          />
        </main>

        <footer className="mt-auto border-t py-6 text-sm text-muted-foreground">
          <p className="max-w-[70ch]">
            Projeto de demonstração, sem vínculo com o Google. Google Wallet é uma marca do Google LLC.
          </p>
        </footer>
      </div>
    </StudioProvider>
  )
}
