import { InfoIcon } from "@phosphor-icons/react/dist/ssr"
import type * as React from "react"
import { GoToTabButton } from "@/components/app/studio-tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/mosaico/alert"

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-primary underline underline-offset-4"
    >
      {children}
    </a>
  )
}

const STEPS: { title: string; body: React.ReactNode }[] = [
  {
    title: "Crie a conta de emissor e anote o issuer ID",
    body: (
      <>
        <p>
          Acesse o{" "}
          <ExternalLink href="https://pay.google.com/business/console">Google Pay &amp; Wallet Console</ExternalLink>{" "}
          com uma conta Google e preencha os dados da empresa. No menu, abra <strong>Google Wallet API</strong>.
        </p>
        <p>
          O <strong>issuer ID</strong> (ID do emissor) aparece no topo dessa página. É um número longo, como{" "}
          <code>3388000000012345678</code>. Ele identifica a sua empresa e é o prefixo de todos os IDs de classe e
          de objeto.
        </p>
      </>
    ),
  },
  {
    title: "Crie um projeto no Google Cloud",
    body: (
      <p>
        No <ExternalLink href="https://console.cloud.google.com/projectcreate">Google Cloud Console</ExternalLink>,
        crie um projeto (ou escolha um existente). Ele serve só para hospedar a API e a conta de serviço: não é
        preciso ativar faturamento para usar o Google Wallet.
      </p>
    ),
  },
  {
    title: "Habilite a Google Wallet API",
    body: (
      <p>
        Com o projeto selecionado, abra{" "}
        <ExternalLink href="https://console.cloud.google.com/apis/library/walletobjects.googleapis.com">
          APIs e serviços › Biblioteca › Google Wallet API
        </ExternalLink>{" "}
        e clique em <strong>Ativar</strong>.
      </p>
    ),
  },
  {
    title: "Crie a conta de serviço e baixe a chave",
    body: (
      <>
        <p>
          Em{" "}
          <ExternalLink href="https://console.cloud.google.com/iam-admin/serviceaccounts">
            IAM e administrador › Contas de serviço
          </ExternalLink>
          , clique em <strong>Criar conta de serviço</strong>. Dê um nome (ex.: <code>wallet-emissor</code>) e
          conclua. Não é preciso atribuir papéis no Cloud.
        </p>
        <p>
          Abra a conta criada, vá em <strong>Chaves › Adicionar chave › Criar nova chave</strong> e escolha{" "}
          <strong>JSON</strong>. O navegador baixa um arquivo com <code>client_email</code> e{" "}
          <code>private_key</code>. Esse arquivo é uma senha: guarde em local seguro e nunca coloque no Git.
        </p>
      </>
    ),
  },
  {
    title: "Autorize a conta de serviço no console do Wallet",
    body: (
      <p>
        Volte ao Google Pay &amp; Wallet Console, abra <strong>Usuários</strong> e clique em{" "}
        <strong>Convidar um usuário</strong>. Cole o e-mail da conta de serviço (o <code>client_email</code> do
        JSON) e dê o acesso <strong>Desenvolvedor</strong>. Sem este passo a API responde com erro 403.
      </p>
    ),
  },
  {
    title: "Entenda o modo demo e a publicação",
    body: (
      <>
        <p>
          Toda conta de emissor começa em <strong>modo de demonstração</strong>. Nele os passes funcionam, mas só
          podem ser salvos pela conta que administra o console e pelas contas de teste cadastradas em{" "}
          <strong>Google Wallet API › Configurar contas de teste</strong>. O passe mostra o aviso de teste.
        </p>
        <p>
          Para emitir a qualquer pessoa, preencha o perfil da empresa e peça o{" "}
          <strong>acesso de publicação</strong> na mesma página. O Google analisa o pedido e, depois de aprovar,
          revisa as classes que você criar.
        </p>
      </>
    ),
  },
]

export function CredentialsGuide() {
  return (
    <div className="flex flex-col gap-10 text-base">
      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
          Seis passos até as suas credenciais
        </h2>
        <p className="max-w-[66ch] text-muted-foreground">
          Para emitir passes em nome da sua empresa você precisa de duas coisas: o <strong>issuer ID</strong> e a{" "}
          <strong>chave de uma conta de serviço</strong> autorizada. O processo é gratuito e leva cerca de 15
          minutos.
        </p>
      </section>

      <Alert className="max-w-3xl">
        <InfoIcon />
        <AlertTitle>Só quer ver funcionando?</AlertTitle>
        <AlertDescription>
          Pule esta etapa e use as credenciais de demonstração na etapa 3, quando estiverem disponíveis neste
          servidor.
        </AlertDescription>
      </Alert>

      <ol className="flex max-w-3xl flex-col">
        {STEPS.map((step, index) => (
          <li key={step.title} className="group grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-4 sm:gap-x-6">
            <div className="flex flex-col items-center">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-highlight font-heading text-base font-semibold text-highlight-foreground tabular-nums">
                {index + 1}
              </span>
              {/* O trilho liga um passo ao seguinte e some no último. */}
              <span aria-hidden="true" className="w-px flex-1 bg-border group-last:hidden" />
            </div>
            <div className="flex flex-col gap-3 pb-10 group-last:pb-0">
              <h3 className="pt-1 font-heading text-lg leading-snug font-semibold">{step.title}</h3>
              <div className="flex flex-col gap-3 text-muted-foreground [&_code]:rounded-sm [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em] [&_code]:break-words [&_code]:text-foreground [&_strong]:font-medium [&_strong]:text-foreground">
                {step.body}
              </div>
            </div>
          </li>
        ))}
      </ol>

      <p className="max-w-[66ch] text-sm text-muted-foreground">
        A referência oficial está em{" "}
        <ExternalLink href="https://developers.google.com/wallet/generic/getting-started/onboarding-guide">
          developers.google.com/wallet
        </ExternalLink>
        .
      </p>

      <div>
        <GoToTabButton tab="criar">Tenho as credenciais, criar o passe</GoToTabButton>
      </div>
    </div>
  )
}
