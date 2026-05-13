# Separacao dos modulos de gestao do local

## Objetivo

Reduzir o acoplamento do `PlacesPage.tsx` e transformar a gestao do local em modulos profissionais, cada um com sua propria tela operacional, componentes e regras de apresentacao.

## Separacao criada

- `src/lib/place-management.ts`
  - Regras de acesso por plano.
  - Lista de modulos disponiveis por perfil.
  - Labels e descricoes dos modulos.
  - Helper de pluralizacao.

- `src/components/place/PlaceManagementCockpit.tsx`
  - Navegacao principal da gestao.
  - Proximo passo de implantacao.
  - Contexto do modulo atual.
  - Contadores de pendencias por area.

- `src/components/place/AcademyWorkspaceShell.tsx`
  - Casca da central da academia.
  - Abas internas: Hoje, Turmas, Alunos, Pendencias e Recursos.
  - Texto de contexto por visao.

- `src/components/place/BookingWorkspaceShell.tsx`
  - Central da agenda.
  - Abas internas: Hoje, Reservas, Calendario, Nova, Espera e Recursos.

- `src/components/place/FinanceWorkspaceShell.tsx`
  - Central financeira.
  - Abas internas: Resumo, Recebiveis e Despesas.

- `src/components/place/CanteenWorkspaceShell.tsx`
  - Central da cantina.
  - Abas internas: Hoje, Venda, Estoque e Produtos.

- `src/components/place/ClientsWorkspaceShell.tsx`
  - Central de clientes.
  - Abas internas: Resumo, Socios, Leads e Pendencias.

- `src/components/place/TeamWorkspaceShell.tsx`
  - Central da equipe.
  - Abas internas: Resumo, Equipe, Convites e Papeis.

- `src/components/place/SettingsWorkspaceShell.tsx`
  - Central de configuracao.
  - Abas internas: Resumo, Checklist, Plano e Estrutura.

- `src/components/place/PlaceWorkspaceShell.tsx`
  - Casca compartilhada para todas as centrais.
  - Padroniza titulo, descricao contextual, abas e area de conteudo.
  - Remove duplicacao visual entre academia, agenda, clientes, financeiro, cantina, equipe e configuracoes.

- `src/components/place/PlaceWorkspaceUi.tsx`
  - Componentes compartilhados para cards, listas, metricas e linhas de acao.
  - Uso aplicado em Clientes, Equipe, Configuracoes, Financeiro e Cantina.
  - Base para reduzir os blocos repetidos ainda presentes em Agenda e Academia.

## Proxima ordem de extracao

1. `AcademyManagementPanel`
   - Extrair todo o conteudo da academia.
   - Separar subcomponentes: `AcademyTodayView`, `AcademyClassesView`, `AcademyStudentsView`, `AcademyRequestsView`, `AcademyResourcesView`.

2. `BookingsManagementPanel`
   - Agenda do dia.
   - Reservas pendentes.
   - Bloqueios de quadra.
   - Lista de espera.
   - Calendario por quadra.

3. `ClientsManagementPanel`
   - Socios.
   - Leads.
   - Interessados em aulas.
   - Acoes de relacionamento.

4. `FinanceManagementPanel`
   - Recebiveis.
   - Mensalidades.
   - Lembretes.
   - Despesas.

5. `CanteenManagementPanel`
   - Produtos.
   - Estoque.
   - Vendas rapidas.
   - Caixa do dia.

6. `TeamSettingsPanel`
   - Equipe.
   - Convites.
   - Configuracoes do local.
   - Checklist de implantacao.

7. `PlaceManagementSharedUi`
   - Continuar a troca dos blocos repetidos de `academy-workspace-card`, `academy-workspace-row` e `academy-workspace-metrics` por `WorkspaceCard`, `WorkspaceRow`, `WorkspaceList` e `WorkspaceMetrics`.
   - Reduzir o tamanho de `PlacesPage.tsx` sem mudar comportamento.

## Estado atual por area

- Agenda: separada por visao, com dia, reservas, calendario, nova reserva, espera e recursos.
- Academia: separada por visao, com alunos filtraveis, pendencias, recursos e turmas.
- Clientes: separada por visao, com socios, leads e pendencias de atendimento.
- Financeiro: separado por visao, com resumo, recebiveis e despesas.
- Cantina: separada por visao, com venda, estoque, produtos e caixa do dia.
- Equipe: separada por visao, com equipe ativa, convites e papeis.
- Configuracoes: separada por visao, com prontidao, checklist, plano e estrutura.
- Base visual: centrais usam `PlaceWorkspaceShell` compartilhado.
- UI compartilhada: Clientes, Equipe, Configuracoes, Financeiro e Cantina ja usam `PlaceWorkspaceUi`.

## Regra para proximas evolucoes

Toda nova funcionalidade de gestao deve entrar no painel do seu dominio. A pagina `PlacesPage.tsx` deve ficar responsavel por carregar dados, manter estados compartilhados e coordenar handlers ate que os hooks de dominio sejam extraidos.
