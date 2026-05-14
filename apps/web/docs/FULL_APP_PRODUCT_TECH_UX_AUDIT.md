# FULL APP PRODUCT TECH UX AUDIT

**Data da auditoria:** 2026-05-13  
**Auditor:** Equipe sênior de produto e engenharia (auditoria sintética completa)  
**Escopo:** App real em produção (https://youratpapp.github.io/ATPAPP) + código-fonte + MDs arquiteturais  
**Modo:** Leitura apenas. Nenhuma alteração foi feita.

---

## 1. RESUMO EXECUTIVO

### Atualizacao pos-auditoria - 2026-05-13

- O vazamento do cockpit administrativo em `/locais` foi bloqueado: a gestao completa agora renderiza apenas em rota administrativa.
- A Home foi ajustada para separar prioridades de jogador e prioridades profissionais; pendencias administrativas deixam de alimentar a fila principal do Player App.
- As acoes profissionais da Home agora apontam para rotas canonicas de Gestao, reforcando a fronteira entre descoberta/player e operacao.
- O risco tecnico de `PlacesPage.tsx` continuar concentrando muita orquestracao permanece; a correcao atual resolveu o vazamento de experiencia, nao a decomposicao estrutural completa.

O ATP é um produto com arquitetura conceitual bem pensada e documentação de produto excepcionalmente detalhada. Os MDs demonstram uma visão clara, madura e alinhada com o que um SaaS esportivo premium precisa ser. Porém, há uma distância significativa entre o que os MDs descrevem como "pronto" e o que o código e o app real entregam.

O produto tem valor real e fundamentos sólidos. A separação de contextos (Player App, Management OS, Competition OS) funciona na navegação principal. O design system tem tokens consistentes. A feature set é genuinamente rica. Mas existem problemas estruturais críticos que impedem o produto de parecer premium e vendável no estado atual:

1. **PlacesPage.tsx com 5.757 linhas é o maior risco técnico do produto.** Ela é simultaneamente a página de descoberta pública (`/locais`) e o sistema completo de gestão administrativa de todos os módulos (Agenda, Academia, CRM, Financeiro, Cantina, Equipe, Ajustes). Essa duplicidade cria bugs reais visíveis ao usuário.

2. **O painel de administração completo vaza para dentro da descoberta pública.** Quando o usuário tem acesso admin a um local, o card na tela `/locais` renderiza inline o cockpit completo de gestão — incluindo dados financeiros, exportação CSV, seletor de plano e métricas operacionais. Isso é um bug funcional, não só visual.

3. **A Home Page mistura conteúdo de papéis diferentes sem separação clara.** As "8 pendências" mostradas no topo da Home incluem ações de organizador de torneio (aprovar inscrições), ações de dono de local (solicitações de sócio, lista de espera) e ações de jogador — tudo misturado num único contador urgente.

4. **TournamentPage.tsx com 5.919 linhas** repete o mesmo padrão god-component de PlacesPage.

5. **App.css com 11.597 linhas** é um CSS monolítico que impede manutenção e escalabilidade.

O produto está a 2–3 ciclos de execução focados de ser genuinamente vendável como SaaS premium. Os fundamentos existem. A visão existe. O gap é de execução e separação técnica.

---

## 2. ANÁLISE GLOBAL

### O que funciona bem

- **Estrutura de navegação global**: A separação em grupos (Jogar, Organizar, Operar, Conta) funciona. O label de contexto (Player App, Competition OS, Management OS) no nav é uma boa ideia bem implementada.
- **Eventos Hub** (`/eventos`): A separação Jogando / Organizando / Descobrir está implementada e funcional. É um dos fluxos mais limpos do app.
- **Gestão Hub** (`/gestao`): O checklist de implantação com % de progresso e quick actions semânticas está bem pensado. A fila do dia com pendências por módulo é o padrão correto.
- **Design tokens**: `theme.css` está bem definido — cores, tipografia, espaçamento, sombras e raios são consistentes e alinhados aos princípios premium documentados.
- **Separação de rotas**: `/gestao`, `/locais`, `/eventos`, `/ranking`, `/perfil` estão corretamente separadas no `App.tsx`.
- **Workspace Access Summary**: O `loadWorkspaceAccessSummary` é elegante — carrega dados async e determina quais grupos de nav aparecem sem bloquear o boot.
- **Perfil**: Limpo, bem estruturado, com XP/nível/conquistas sem exagero decorativo.
- **Ligas/Torneios**: A separação entre organizador e jogador dentro do Competition OS está progredindo bem.

### O que está fundamentalmente errado

- **PlacesPage.tsx faz tudo ao mesmo tempo**: É a descoberta de locais E o admin de todo módulo de gestão. Isso não é refatoração pendente — é a causa raiz de múltiplos bugs.
- **A Home Page não sabe o papel do usuário**: Ela coleta ações de organizador, de dono de local e de jogador e exibe tudo como um único número urgente sem contexto de papel.
- **O admin vaza para o público**: Quando há acesso admin, o card de local em `/locais` vira um painel de gestão completo — com analytics, CSV, plano, fila operacional — dentro da página de descoberta pública.
- **URLs usam UUIDs raw**: As rotas `/gestao/:placeId/:module` usam UUIDs como parâmetro de caminho. Não são shareáveis, não são debugáveis e causam erros confusos quando testados com slugs textuais.

---

## 3. CONFRONTO: MDs vs APP REAL vs CÓDIGO

### O que os MDs dizem estar "concluído" e a realidade

| Task (MD) | Status no MD | Realidade no App/Código |
|---|---|---|
| PlaceAdminShell refinado para workspace compacto | [x] concluído | Shell tem 132 linhas — é apenas um header com tabs. Todo o conteúdo real ainda está em PlacesPage.tsx (5.757 linhas). |
| `EntityActionRow` em CRM e recebíveis | [x] concluído | Implementado, mas convive com o PlacesPage monolítico sem separação real. |
| Agenda não duplica subvisões | [x] concluído | Não verificável sem dados reais; a lógica existe no código. |
| `/gestao` com quick actions semânticas | [x] concluído | Funcionando. Setup checklist com progresso visível e ações nomeadas. |
| Locais separa descoberta por intenção | [x] concluído | Funcionando — Encontrar jogadores / Reservar quadra / Entrar em aula está correto. |
| Admin vaza para descoberta pública | Nunca documentado como problema | **Bug crítico ativo**: `isManagementCockpit = Boolean(staffRole)` faz o card de local em `/locais` renderizar todo o admin inline quando usuário tem acesso. |
| Home Page como Player App task-first | [x] concluído | Parcialmente. O painel superior está task-first, mas "Prioridades de hoje" mistura papéis: organizer actions + owner actions + player actions num único bloco urgente. |
| Competition OS visual refinado | [>] prioridade atual | Estrutura melhorou (separação Jogando/Organizando/Descobrir), mas os cards de torneio em "Organizando agora" são apenas artigos sem ação por item. |
| VISUAL-03 validação com dados reais | [!] bloqueado | Confirmado bloqueado — o ambiente de produção tem dados seed completos, o ambiente local não tem `.env`. A validação no ambiente real é possível agora e deve ser feita. |

### Divergências críticas entre MDs e realidade

**MD diz**: "gestão não é uma variação de locais. Gestão é um sistema próprio."  
**Código real**: `PlaceAdminPage` é literalmente `<PlacesPage adminPlaceId={placeId} .../>`. Gestão é uma variação de Locais no nível mais fundamental do código.

**MD diz**: "sidebar idêntica para Player App e Management OS é antipadrão proibido."  
**Realidade**: No mobile, o bottom nav muda classe (`is-management`) e cor visual quando em `/gestao`. No desktop, a sidebar é a mesma para ambos os contextos — apenas os itens mudam.

**MD diz**: "quick action que não abre a subvisão onde a tarefa termina não está pronta."  
**Realidade no /locais**: As quick actions em cards de local (Chamar espera, Ver agenda, Criar reserva) navegam corretamente via `buildPlaceAdminPath`. Isso está correto. Mas elas aparecem no card dentro de `/locais`, não em `/gestao`, criando duplicidade de ponto de entrada.

---

## 4. ANÁLISE POR PERSONA

### 4.1 Jogador comum

**Como entro no app e sei o que fazer?**  
A Home abre com "8 pendências para resolver" e "Resolve agora" como CTA primário. Para um jogador puro (sem papel de organizador ou dono), isso seria potencialmente limpo. Mas com o usuário demo (Escalao Admin), as "pendências" são mistura de tarefas administrativas, o que quebra completamente a proposta de Player App.

**Como vejo minha próxima partida?**  
A seção "Central do jogador > Competição > Minhas partidas" existe mas mostra estado vazio ("Entre em torneios e ligas para jogar"), porque o usuário demo é organizador, não jogador. Isso não é bug — é dado, mas demonstra que o produto não tem dados de jogador puro no seed demo, o que dificulta validação real da experiência.

**Como encontro torneios para jogar?**  
`/eventos/torneios` > "Entrar por código" está disponível. A lista de torneios que "estou jogando" está vazia. O fluxo de descoberta pública de torneios está em "Descobrir > Entrar em torneio", mas o CTA abre uma busca sem resultado útil imediato.

**Gestão aparece indevidamente?**  
Sim e não. O item "Gestão" no nav aparece porque o usuário demo tem acesso a locais. Para um jogador puro sem acesso admin, o item não deveria aparecer — e a lógica de `hasManagement` no `workspace-access.ts` está correta. O problema é que o demo user tem múltiplos papéis simultâneos.

**Avaliação**: Para um jogador puro, a experiência funcionaria razoavelmente. O risco real é um usuário com qualquer papel admin ver uma Home que parece dashboard de gestão, não Player App.

---

### 4.2 Organizador de torneios/ligas

**Como diferencio torneios que jogo de torneios que organizo?**  
Muito bem resolvido. O hub `/eventos` separa explicitamente "Jogando", "Organizando" e "Descobrir". A seção "Organizando agora" mostra torneios/ligas ativos com status. As rotas `/eventos/torneios?view=organizing` e `/eventos/ligas?view=organizing` existem.

**Como vejo pendências?**  
No hub `/eventos`, a fila de "Organizando agora" mostra cards de competição com status, mas SEM ação por item. Os artigos são passivos — não têm botão "Aprovar inscrições" ou "Ver partidas pendentes" inline. O usuário precisa clicar no card e navegar internamente.

**Como crio um torneio?**  
Via "Descobrir > Organizar evento", que abre o contexto de criação. Isso está semanticamente correto.

**Avaliação**: O fluxo de separação está bem pensado e implementado. O ponto fraco é que a fila de "Organizando agora" é visual (mostra itens) mas não é operacional (não tem ação por item). Deveria ter pelo menos uma ação primária por torneio/liga.

---

### 4.3 Professor autônomo

**Como entro na minha gestão leve?**  
Via `/gestao`, que detecta papel `coach` e mostra "Minha operação de aulas" com foco em aulas de hoje, turmas e alunos. Esse gate existe no código (`COACH_PRIORITY_MODULES = ["academy"]`).

**O sistema parece leve ou parece ERP de academia?**  
Parcialmente leve. O hub `/gestao` com papel `coach` prioriza Academia. Mas o local ainda aparece com todas as métricas operacionais (pendências, reservas hoje, etc.) mesmo para professor. O card do local em `/gestao` para um coach deveria ser significativamente mais simples.

**Como controlo mensalidade?**  
Através da Academia > Alunos, onde `EntityActionRow` expõe "marcar pago" como ação contextual. Funcional, mas o fluxo depende de navegar dentro do local → Academia → Alunos.

**Avaliação**: A detecção por papel `coach` existe e funciona. A experiência ainda não está completamente calibrada para professor autônomo — o card do local em `/gestao` ainda mostra informações voltadas para gestão completa.

---

### 4.4 Academia / clube completo

**Como entendo pendências do dia?**  
Em `/gestao`, a "Fila do dia" mostra pendências agregadas (Lista de espera, Academia, Clientes/CRM, Financeiro) com CTAs. Os locais em "Workspaces" têm quick actions contextuais (Chamar espera, Ver agenda, Criar reserva). Isso está funcionando bem.

**Como acesso módulos?**  
Via `buildPlaceAdminPath(p.id, "dashboard")` que navega para `/gestao/:uuid/:module`. A partir daí, `PlaceAdminShell` renderiza as tabs: Painel, Agenda, Academia, Clientes, Financeiro + overflow "Mais".

**Como publico página pública?**  
Via "Pagina publica" no card do local → `PlacePublicPage`. O botão existe nos cards de local tanto em `/gestao` quanto em `/locais`.

**Onde está a Cantina, Equipe, Ajustes?**  
No overflow "Mais" do `PlaceAdminShell`. O limite de 5 tabs primárias foi implementado corretamente.

**Avaliação**: Para uma academia completa, a estrutura está funcional. O Painel operacional com fila de trabalho e sinais de suporte está bem implementado. O problema é que tudo isso vive dentro de PlacesPage, tornando qualquer evolução perigosa e lenta.

---

### 4.5 Recepção / operador

**Como vejo aulas de hoje e pendências sem navegar demais?**  
A entrada de recepção em `/gestao` usa `FRONTDESK_PRIORITY_MODULES = ["bookings", "academy"]`, priorizando Agenda e Academia. Existe lógica para mostrar CTAs proporcionais ao papel.

**Como registro pagamento?**  
Não há um fluxo de caixa rápido disponível na primeira tela. O operador precisa navegar: local → Financeiro → Recebíveis → lembrar/marcar pago. Não há atalho de "Registrar pagamento agora" na entrada de recepção.

**Avaliação**: A diferenciação de papel existe mas a entrada de recepção não tem um fluxo de "registrar pagamento rápido" ou "confirmar check-in" diretamente disponível sem navegar por módulos.

---

### 4.6 Gestor financeiro

**O financeiro parece relatório ou ferramenta de ação?**  
O módulo Financeiro usa `EntityActionRow` em recebíveis (valor, status, "Enviar lembrete" como ação primária). A faixa semântica "Cobrança recorrente" aparece apenas quando há pendências. Isso está alinhado com os princípios do produto.

**Como separo mensalidade de aluno, sócio e reservas?**  
Via subvisões: Recebíveis / Cobranças / Despesas / Pacotes. A separação existe semanticamente mas o acesso é por tab dentro do módulo Financeiro.

**Avaliação**: O módulo Financeiro é um dos mais maduros em termos de UX task-first. O risco é que ele vive dentro de PlacesPage, então qualquer bug em qualquer outro módulo pode impactar o Financeiro.

---

## 5. ANÁLISE POR FLUXO

### 5.1 Fluxo: Descoberta de local e reserva de quadra

**Caminho**: `/locais` → "Reservar quadra" → filtros → resultado → click no card → `/locais/:placeId`

**Funcionando**: A separação por intenção (Encontrar jogadores / Reservar quadra / Entrar em aula) está implementada. O formulário de busca por quadra livre (cidade, data, hora, duração) existe e filtra resultados.

**Problema crítico**: Quando o usuário tem acesso admin ao local encontrado, o card em `/locais` renderiza o **painel completo de gestão inline**, incluindo: tabs de módulo (Painel, Agenda, Academia, Clientes, Financeiro), fila de trabalho com itens operacionais, analytics detalhados (R$ 11.604 receita mensal prevista, taxa de confirmação, % de presença), exportação CSV, e seletor de plano. Tudo isso aparece na página de **descoberta pública**.

Isso acontece porque em `PlacesPage.tsx` linha 3691: `const isManagementCockpit = Boolean(staffRole)`. Qualquer usuário com papel no local (staffRole definido) transforma o card de descoberta num cockpit de admin. A variável `isPublicDiscoveryCard` é falsa para esses usuários, liberando toda a renderização administrativa.

**Impacto**: Um usuário que gerencia 3 academias e acessa `/locais` para reservar uma quadra vê 3 painéis de gestão completos inline. Não consegue usar `/locais` como player.

---

### 5.2 Fluxo: Gestão de local — acesso via `/gestao/:placeId/:module`

**Caminho**: `/gestao` → click "Abrir operação" → `/gestao/:uuid/painel`

**Funcionando**: `buildPlaceAdminPath(p.id, "dashboard")` gera a URL com UUID real. `PlaceAdminPage` recebe o UUID via params. `usePlaceAdminRouteSync` encontra o local pelo UUID. O módulo correto é ativado.

**Problema**: Tecnicamente, `PlaceAdminPage` é:
```tsx
const { module, placeId } = useParams();
return <PlacesPage adminPlaceId={placeId} adminModule={...} user={user} profile={profile} />;
```

Não existe uma página separada de admin. A mesma PlacesPage que serve `/locais` serve `/gestao/:id/:module`. O estado de admin, descoberta, mapas de recursos e formulários coexistem no mesmo componente.

**URLs com UUID raw**: As URLs de gestão ficam como `/gestao/3f8a-abc1.../agenda`. Não são shareáveis entre humanos e não são debugáveis facilmente.

---

### 5.3 Fluxo: Tournament — ver, jogar, organizar

**Caminho A (jogador)**: `/eventos` → "Torneios que jogo" → lista vazia (demo user é organizador) → "Entrar por código"  
**Caminho B (organizador)**: `/eventos` → "Organizando agora" → card do torneio (passivo) → navegar para `/eventos/:tournamentId/jogos`

**Problema B**: O card de torneio em "Organizando agora" é um `<article>` passivo. Não tem botão "Ver inscrições" ou "Lançar resultado" inline. O usuário precisa clicar no card para ir para a página do torneio, sem saber o que vai encontrar.

**TournamentPage com 5.919 linhas**: Mesmo padrão de PlacesPage — um único componente gerenciando toda a experiência de torneio para jogador e organizador simultaneamente.

---

### 5.4 Fluxo: Home Page como Player App

**O que aparece**:
- Hero: "8 pendências para resolver" (inclui ações de organizador e dono de local)
- "Próximas ações do jogador": Pendência / Agenda / Clube
- "Atalhos rápidos": Competir / Jogar / Perfil
- "Central do jogador": Quadras reservadas, Competição (vazia), Academia (vazia), Financeiro (vazio)
- **"Prioridades de hoje"**: 2 inscrições pendentes (Open ADT), 4 inscrições pendentes (Prime Cup), 3 solicitações de sócio (ADT), 2 solicitações de sócio (Arena), 3 solicitações de sócio (Clube Racket), 2/1 itens de lista de espera
- "Atualizações recentes": avisos de torneios
- "Organização": cards de torneios/ligas organizados
- "Próximos eventos públicos": eventos visíveis

**Problema crítico**: A seção "Prioridades de hoje" e o contador de "8 pendências" no hero são compostos de:
- Ações de **organizador de torneio**: aprovar/rejeitar inscrições de torneios
- Ações de **dono de local**: ativar planos de sócio, gerenciar lista de espera
- Essas ações NÃO são "pendências do jogador" — são tarefas operacionais

Um usuário que é dono de 3 academias e organiza 5 torneios vê uma Home com dezenas de "pendências urgentes" que são tarefas de gestão, não de jogador. A proposta de "Player App task-first" é diretamente contradita pela mistura de papéis no acumulador de urgências.

---

## 6. ANÁLISE POR TELA

### `/inicio` — Home

| Critério | Avaliação |
|---|---|
| Primeira viewport responde "o que faço agora?" | Parcialmente — mas o "agora" mistura papéis |
| Gestão não aparece como tarefa do jogador | ❌ "Prioridades de hoje" inclui tarefas de gestão |
| Seção Organização separada | ✅ Existe abaixo do fold, separada |
| Empty states calmos | ✅ Competição, Academia, Financeiro mostram mensagens claras |
| Mobile-first | Não testado em viewport móvel real |

### `/gestao` — Hub de Gestão

| Critério | Avaliação |
|---|---|
| Fila do dia com pendências reais | ✅ Funcionando — Lista de espera, Academia, Clientes/CRM, Financeiro |
| Setup checklist com progresso | ✅ 57% para Arena Pantanal Tennis, com próximo passo acionável |
| Quick actions semânticas por local | ✅ "Chamar espera", "Ver agenda", "Criar reserva" com destino correto |
| Locais em rows operacionais | ✅ Cada local tem pendências, reservas hoje e ações rápidas |
| Aparência de workspace premium | Parcialmente — ainda tem aspectos de dashboard |

### `/locais` — Descoberta Pública

| Critério | Avaliação |
|---|---|
| Separação por intenção | ✅ Três intenções claras com contadores |
| Filtros de busca | ✅ Formulário de quadra livre com cidade/data/hora |
| Card de local para player | ✅ Ação primária contextual + "Mais" para secundárias |
| **Admin não vaza para descoberta** | ❌ FALHA CRÍTICA — card renderiza cockpit de admin inline |
| Resultado direto de quadra livre | ✅ Lista de quadras filtradas sem abrir ficha completa |

### `/eventos` — Hub de Competições

| Critério | Avaliação |
|---|---|
| Separação Jogando / Organizando / Descobrir | ✅ Implementada e clara |
| Organizador vê fila primeiro | ✅ "Organizando agora" aparece no topo |
| Cards de "Organizando agora" são acionáveis | ❌ São passivos — sem ação por item |
| Jogador comum não vê CTA administrativo | ✅ Criação de torneio está em "Descobrir" |
| Estado vazio para "Jogando" | ✅ Mensagem clara com CTAs de descoberta |

### `/eventos/torneios` — Lista de Torneios

| Critério | Avaliação |
|---|---|
| Filtros disponíveis | ✅ Busca, UF, cidade, status, visibilidade, ordenação |
| Estado vazio útil | ✅ "Entre por código ou acompanhe torneios públicos" |
| Para organizador: acesso à criação | Acessível via query `?view=organizing` |
| Filtros em linha ou drawer | Em linha, todos visíveis — pode ser excessivo no mobile |

### `/ranking` — Ranking

Não foi possível capturar o conteúdo completo nesta auditoria (o ranking retornou muito conteúdo). Pela estrutura do código (`RankingPage.tsx` com 581 linhas), é um dos componentes mais contidos do app.

### `/perfil` — Perfil

| Critério | Avaliação |
|---|---|
| Dados pessoais claros | ✅ Nome, cidade, contato, nascimento |
| Nível/XP/conquistas | ✅ Implementado de forma discreta |
| Configurações de notificação | ✅ Preferências de WhatsApp com antecedência |
| Aviso sobre feature futura | ✅ "Engine de notificações futura" declarado honestamente |
| Saída de conta disponível | ✅ Botão "Sair da conta" presente |

---

## 7. ANÁLISE DE FRONTEND

### 7.1 God Components — O maior risco técnico

| Arquivo | Linhas | Problema |
|---|---|---|
| `PlacesPage.tsx` | **5.757** | Faz tudo: descoberta pública + admin completo de todos os módulos |
| `TournamentPage.tsx` | **5.919** | Gerencia toda a experiência de torneio |
| `App.css` | **11.597** | CSS monolítico sem separação por módulo |
| `HomePage.tsx` | 1.994 | Ainda grande — mistura de papéis no acumulador |
| `LeagueDetailsPage.tsx` | 2.428 | Aceitável mas ainda extenso |
| `ProfilePage.tsx` | 1.219 | OK |
| `EventsHubPage.tsx` | 356 | ✅ Contido |

**PlacesPage.tsx é fundamentalmente o maior tech debt do produto.** Ela mantém estado para:
- Todos os locais do usuário
- Todos os modos de admin de todos os módulos de todos os locais (`bookingViewByPlace`, `academyViewByPlace`, `canteenViewByPlace`, `clientsViewByPlace`, `financeViewByPlace`, `managementModuleByPlace`, etc.)
- Formulários de criação de reserva, professor, turma, produto, venda, despesa, plano de sócio, contato CRM, etc.
- Filtros de descoberta pública (quadras livres, turmas, chamadas de jogo)
- Estado de abertura de chat, lista de espera, match aberto

Isso significa que toda vez que qualquer parte da gestão é tocada, há risco de regressão em qualquer outro módulo.

### 7.2 Arquitetura de Componentes

**O que está correto:**
- `PlaceAdminShell` existe como shell separado (132 linhas)
- Módulos isolados existem: `PlaceAcademyStudentsModule`, `PlaceFinanceReceivablesModule`, etc.
- `EntityDrawer`, `ResponsiveFilterSheet`, `SetupWizard`, `BottomNav` são componentes genuinamente reutilizáveis
- `usePlaceAdminRouteSync` e `usePlaceAdminResourceState` são hooks bem definidos

**O problema:** Esses componentes e hooks são chamados **dentro de PlacesPage.tsx**, que ainda é o orquestrador mestre. Os módulos isolados reduzem o JSX visível em PlacesPage, mas todo o estado, handlers e lógica de negócio permanecem no componente pai.

### 7.3 CSS e Design System

**Pontos fortes:**
- `theme.css` com tokens bem definidos (cores, tipografia, espaçamento, sombras, raios)
- Inter como fonte padrão — excelente escolha para interfaces operacionais
- Paleta verde/navy/off-white alinhada com a identidade esportiva
- Status tokens definidos (`--color-status-open-bg`, `--color-status-live-bg`, etc.)

**Pontos fracos:**
- `App.css` com 11.597 linhas é intratável. Não há como rastrear onde um estilo específico está definido
- Ausência de CSS Modules ou styled-components — tudo é CSS global
- Classes como `.place-admin-*`, `.bottom-nav-*`, `.hub-*`, `.competition-*` coexistem num único arquivo
- Alta probabilidade de colisões de estilo ao adicionar novos componentes

### 7.4 Roteamento

**Correto:** Lazy loading com `React.lazy` + `Suspense` em todas as páginas. Tratamento de erro de chunk (`LazyChunkBoundary`). Redirecionamentos de rotas legadas (`/ligas/:id` → `/eventos/ligas/:id`). Recuperação de última rota via sessionStorage.

**Preocupante:** HashRouter em uso (`/#/inicio`). Isso é um choice técnico legítimo para deploy em GitHub Pages (sem server-side routing), mas limita SEO e compartilhamento de links. Para URLs de torneio/liga shareáveis, o hash é visível e menos elegante.

---

## 8. ANÁLISE DE BACKEND / DADOS / PERMISSÕES

### 8.1 Modelo de Permissões

**O que existe:**
- `app_user_product_entitlements` — entitlements por usuário
- `app_user_can_create_place()` — RPC que valida permissão antes de criar local
- `app_create_place(...)` — RPC centralizada com validação de plano
- `policy places_owner_insert` — exige `app_user_can_create_place()`
- `placeResourceAccess()` — função que deriva acesso por plano + papel
- `placeManagementModules()` — lista módulos acessíveis pelo papel atual

**O que falta:**
- Não há tela admin/comercial para conceder e auditar entitlements (mencionado nos MDs como pendente)
- Não há guard de plano granular em cada módulo interno — se o URL de admin é conhecido, o acesso pode ser tentado diretamente
- A detecção de `staffRole` em PlacesPage acontece no frontend, não como RLS server-side

### 8.2 Dependência de Dados Mockados

O ambiente de produção parece ter dados seed reais (Escalao Admin com 3 locais, vários torneios, ligas). O ambiente local não tem `.env`/Supabase (VISUAL-03 bloqueado). Isso significa que todo refinamento visual desde 2026-05-13 foi feito sem validação em dados reais variados — estado vazio, estado cheio, estado com erro.

O `DEMO_STATE_QA_CHECKLIST.md` documenta os estados necessários mas eles não foram sistematicamente validados.

### 8.3 Multitenant

O modelo multitenant é correto por design — cada local tem seu `id` (UUID), o acesso é derivado por local, e o workspace do admin é isolado por `adminPlaceId`. Porém, como tudo está em PlacesPage, o estado de múltiplos locais coexiste em memória simultaneamente (`bookingViewByPlace`, `academyViewByPlace` são `Record<string, View>`). Isso pode causar leaks de estado entre locais.

### 8.4 Segurança de Rotas

**Risco real identificado:** A rota `/gestao/:placeId/:module` é acessível por qualquer usuário autenticado. O frontend exibe "Você não tem acesso administrativo a este local" quando `places.find((item) => item.id === adminPlaceId)` retorna vazio (porque o backend não carregou esse local no array do usuário). Mas isso é **validação client-side**, não server-side. Se o backend retornar dados via RLS, a validação client-side é secundária — é mais defense in depth.

---

## 9. ANÁLISE DE MOBILE

### 9.1 O que foi testado

O browser conectado estava em viewport 1920x863 (desktop largo). O código CSS foi analisado para entender o comportamento mobile.

### 9.2 Estrutura de Nav Mobile

O bottom nav (`is-management` class em `/gestao`) implementa:
- Grupos horizontais em desktop, scroll horizontal no mobile
- Distinção visual (fundo escuro/verde) quando em contexto de gestão
- Labels "Player App", "Competition OS", "Management OS" visíveis

**Problema potencial**: Com grupos (Jogar, Organizar, Operar, Conta) e múltiplos itens por grupo, o bottom nav pode ficar extenso no mobile. A label do grupo (`Jogar`, `Operar`) ocupa espaço adicional. Em 360px, isso pode ser problemático.

### 9.3 Padrões Mobile Implementados

- `ResponsiveFilterSheet`: filtros em linha no desktop, bottom sheet no mobile ✅
- `EntityDrawer`: funciona como bottom sheet no mobile ✅
- `--bottom-nav-height: 68px`: padding correto para safe area ✅
- Rows operacionais em vez de grids para mobile ✅

### 9.4 O que provavelmente ainda está ruim no mobile (não validado com data real)

- PlacesPage com admin cockpit inline em `/locais` — no mobile isso seria catastrófico, com múltiplos painéis de gestão empilhados numa tela pequena
- TournamentPage com 5.919 linhas — alta probabilidade de estados não testados em mobile
- Tabelas de analytics no painel de local — não têm alternativa mobile definida no código visto

---

## 10. PROBLEMAS CRÍTICOS (P0 — devem ser resolvidos antes de qualquer venda)

### P0-01: Admin cockpit vaza para a página pública de descoberta `/locais`

**Severidade:** Crítica — UX e segurança de dados  
**Local no código:** `PlacesPage.tsx`, linha 3691: `const isManagementCockpit = Boolean(staffRole)`  
**Sintoma:** Usuário com papel admin vê, em `/locais`, o painel completo de gestão (analytics, CSV export, dados financeiros, fila operacional) inline nos cards de local  
**Causa raiz:** PlacesPage não distingue adequadamente entre modo discovery e modo admin para usuários com ambos os papéis  
**Impacto:** Impossível usar `/locais` como player quando se tem papel admin. Dados internos (receita, inadimplência, métricas) aparecem numa página pública.  

---

### P0-02: Home Page mistura papéis — "pendências urgentes" são tarefas administrativas

**Severidade:** Alta — viola o princípio central de Player App  
**Local no código:** `HomePage.tsx`, `buildOrganizerPriorityItems` e `loadOperationalActions`  
**Sintoma:** "8 pendências para resolver" inclui inscrições de torneio para aprovar, solicitações de sócio para ativar, itens de lista de espera de local — nenhuma dessas é uma ação de jogador  
**Causa raiz:** `buildPriorityItems` agrega ações de todos os papéis do usuário sem separação de contexto  
**Impacto:** Um dono de academia com 3 locais e 5 torneios vê uma Home completamente dominada por tarefas de gestão  

---

### P0-03: PlacesPage.tsx com 5.757 linhas é intratável e causa todos os outros problemas

**Severidade:** Crítica — risco de manutenção e evolução  
**Impacto:** Qualquer mudança em qualquer módulo (Cantina, CRM, Financeiro, Agenda, Academia) pode causar regressão em qualquer outro módulo. A separação intencionada entre discovery e admin é impossível enquanto PlacesPage existir como está.  

---

### P0-04: TournamentPage.tsx com 5.919 linhas — mesmo padrão, mesmo risco

**Severidade:** Alta  
**Impacto:** Competition OS não pode ser refinado com segurança enquanto toda a lógica estiver em um único componente.  

---

### P0-05: App.css com 11.597 linhas — impossível manter

**Severidade:** Alta  
**Impacto:** Qualquer adição de CSS tem alto risco de conflito. Não há como isolar estilos por feature ou fazer feature flags visuais.

---

### P0-06: Cards de "Organizando agora" são passivos — sem ação por item

**Severidade:** Média — bloqueia proposta de valor do Competition OS  
**Local:** `EventsHubPage.tsx`, seção "Organizando agora"  
**Sintoma:** Torneios e ligas aparecem como artigos informativos sem CTA primário por item (ex: "Ver inscrições", "Lançar resultado")  
**Impacto:** Organizador precisa navegar para dentro do torneio para qualquer ação — a "fila operacional" é apenas informativa  

---

## 11. QUICK WINS (podem ser feitos sem refatoração estrutural)

### QW-01: Separar isManagementCockpit de isAdminRoute

No `PlacesPage`, adicionar condição: `const isManagementCockpit = Boolean(staffRole) && isAdminRoute`. Isso faz com que o cockpit de admin só apareça quando a rota é explicitamente de admin (`/gestao/:id/:module`), não quando o usuário está em `/locais`.

**Impacto:** Resolve P0-01 completamente. Risco baixo — é uma mudança de uma linha.

---

### QW-02: Separar acumulador de urgências da Home por papel

Na função `buildPriorityItems`, filtrar ações de organizador e dono de local para uma seção separada ("Prioridades de gestão") em vez de misturá-las com o contador urgente do Player App.

**Impacto:** Resolve P0-02. A Home para um usuário multi-papel passa a fazer sentido.

---

### QW-03: Adicionar CTA primário nos cards de "Organizando agora"

Em `EventsHubPage.tsx`, os artigos de torneio/liga em "Organizando agora" devem ter pelo menos um botão "Abrir" ou "Ver pendências" que navegue para a página do evento.

**Impacto:** Resolve P0-06. A seção passa de visual para operacional.

---

### QW-04: Separar App.css em arquivos por domínio

Dividir em: `theme.css` (já existe), `nav.css`, `home.css`, `management.css`, `competition.css`, `places.css`, `forms.css`, `components.css`.

**Impacto:** Não resolve P0-03 mas reduz significativamente o risco de CSS colisão durante a refatoração.

---

### QW-05: Tornar URLs de gestão legíveis por humanos

Se os locais tiverem slugs (ex: `adt-dourados`), usar slugs nas rotas de admin em vez de UUIDs raw. Se não tiverem, adicionar campo `slug` à tabela de locais.

**Impacto:** Melhora shareabilidade, debugabilidade e percepção de qualidade.

---

### QW-06: Card de torneio em "Organizando agora" com badge de pendências

Adicionar badge com contador de inscrições pendentes ou resultados pendentes diretamente no card, sem precisar abrir o torneio.

**Impacto:** Organiza o visual de fila operacional do Competition OS.

---

## 12. MUDANÇAS ESTRUTURAIS NECESSÁRIAS

### E-01: Extrair PlaceAdminPage como componente separado real

**O que fazer:** Criar `src/pages/PlaceAdminPage.tsx` que importe os módulos de admin (hoje em PlacesPage) sem importar a descoberta pública. PlacesPage passa a ser apenas descoberta.

**Benefício:** Resolve P0-01 estruturalmente. Elimina o antipadrão fundamental do produto.

**Estimativa de complexidade:** Alta. PlacesPage tem muitos handlers e estado compartilhado. A extração exige mapear cuidadosamente o que pertence a cada contexto.

---

### E-02: Extrair Admin State para Context ou Zustand store

**O que fazer:** Mover `bookingViewByPlace`, `academyViewByPlace`, `managementModuleByPlace`, e todos os outros mapas de estado por local para um Context ou Zustand store compartilhado.

**Benefício:** PlacesPage e PlaceAdminPage podem acessar o mesmo estado sem prop drilling. Reduz o tamanho de ambos os componentes significativamente.

---

### E-03: Refatorar HomePage para separar acumuladores por papel

**O que fazer:** Criar funções separadas: `buildPlayerPriorityItems` (apenas ações de jogador), `buildOrganizerPriorityItems` (ações de organizador), `buildOperatorPriorityItems` (ações de dono/gestor). Exibir cada grupo com seu próprio contexto visual.

**Benefício:** Home Page deixa de parecer dashboard de gestão para usuários multi-papel.

---

### E-04: Extrair TournamentPage em camadas menores

**O que fazer:** Criar componentes `TournamentPlayerView`, `TournamentOrganizerView`, `TournamentShell`. TournamentPage passa a ser apenas o roteador que decide qual view renderizar.

**Benefício:** Competition OS fica manutenível. Refinamentos de UX podem ser feitos sem risco de regressão entre modos.

---

### E-05: Modularizar App.css

Ver QW-04. Isso deve ser feito antes de qualquer nova feature de CSS para evitar colisões crescentes.

---

## 13. TASKS NOVAS RECOMENDADAS

### AUDIT-FIX-01: Corrigir vazamento de admin em /locais (P0 - Quick Win)

- Mudar `const isManagementCockpit = Boolean(staffRole)` para `const isManagementCockpit = Boolean(staffRole) && isAdminRoute`
- Validar que em `/locais`, cards de locais que o usuário gerencia mostram apenas "Abrir gestão" como secondary action, não o cockpit completo
- Critério: usuário admin em `/locais` vê discovery card limpo com ação "Abrir gestão", não painel de admin inline

### AUDIT-FIX-02: Corrigir Home para separar papéis no acumulador de urgências (P0 - Médio)

- Criar função `buildPlayerOnlyPriorities` que exclui ações de organizador e de dono de local
- Mover ações de organizer e owner para seção separada "Gestão" na Home, não no bloco hero urgente
- Critério: usuário com múltiplos papéis vê "0 pendências de jogador" (ou ações reais de jogador) no hero, não tarefas de admin

### AUDIT-FIX-03: Adicionar CTA primário em cards de "Organizando agora" (Quick Win)

- Cada card de torneio/liga em EventsHubPage deve ter botão "Abrir" que navega para a página da competição
- Idealmente, adicionar badge com número de pendências (inscrições, resultados)
- Critério: organizador pode acessar cada competição diretamente do hub sem precisar procurar

### AUDIT-REFACTOR-01: Extrair PlaceAdminPage (Estrutural - Alta prioridade)

- Criar `src/pages/PlaceAdminPage.tsx` real, separado de PlacesPage
- PlacesPage passa a servir apenas `/locais` (descoberta pública)
- PlaceAdminPage serve `/gestao/:placeId/:module` com todo o admin
- Critério: lint e build passando, `/locais` não renderiza nenhum componente de admin

### AUDIT-REFACTOR-02: Extrair estado de admin para Context/Store (Estrutural)

- Dependência de AUDIT-REFACTOR-01
- Criar `PlaceAdminContext` ou Zustand store com todo o estado de módulos de admin
- Critério: PlaceAdminPage tem menos de 500 linhas após extração

### AUDIT-CSS-01: Modularizar App.css (Estrutural)

- Separar App.css em arquivos por domínio
- Usar CSS Modules ou pelo menos arquivos separados importados no `index.css`
- Critério: nenhum arquivo CSS tem mais de 800 linhas

### AUDIT-VISUAL-01: Validar telas críticas com dados reais em todos os estados

- Usar o ambiente de produção (dados reais existem no demo)
- Capturar screenshots em 390px, 430px, 1366px
- Verificar especialmente: `/locais` com admin (pós fix), Home com único papel, Gestão com local sem pendências
- Critério: todos os estados do `DEMO_STATE_QA_CHECKLIST.md` validados

### AUDIT-MOBILE-01: Testar bottom nav em 360px

- Verificar se os grupos (Jogar + Organizar + Operar + Conta) cabem confortavelmente
- Verificar alvo de toque mínimo 44px
- Verificar label de grupo vs. labels de itens em tela estreita

### AUDIT-PERF-01: Avaliar impacto de carregamento de PlacesPage

- PlacesPage com 5.757 linhas carrega todos os handlers de todos os módulos na memória
- Medir tempo de carregamento inicial e re-renders ao trocar de módulo
- Identificar se lazy loading de módulos individuais seria viável

---

## 14. PRIORIDADES

| # | Task | Impacto | Esforço | Prioridade |
|---|---|---|---|---|
| 1 | AUDIT-FIX-01: Corrigir vazamento admin em /locais | Crítico | Baixo | P0 imediato |
| 2 | AUDIT-FIX-02: Separar papéis no acumulador Home | Alto | Médio | P0 |
| 3 | AUDIT-FIX-03: CTA em cards de "Organizando agora" | Médio | Baixo | P0 |
| 4 | AUDIT-REFACTOR-01: Extrair PlaceAdminPage real | Crítico | Alto | P1 |
| 5 | AUDIT-CSS-01: Modularizar App.css | Alto | Médio | P1 |
| 6 | AUDIT-VISUAL-01: Validar com dados reais | Alto | Médio | P1 |
| 7 | AUDIT-REFACTOR-02: Extrair estado para Context | Alto | Alto | P2 |
| 8 | AUDIT-MOBILE-01: Testar bottom nav 360px | Médio | Baixo | P2 |
| 9 | QW-05: URLs legíveis com slugs | Baixo | Médio | P3 |
| 10 | AUDIT-PERF-01: Avaliar impacto de carregamento | Médio | Médio | P3 |

---

## 15. RISCOS

### R1 — Refatoração de PlacesPage pode quebrar qualquer módulo (CRÍTICO)

PlacesPage tem tantos handlers e estados interdependentes que uma extração mal executada pode quebrar: criação de reserva, criação de professor, criação de turma, cadastro de produto, venda de cantina, CRM, financeiro, equipe, e configurações simultaneamente. Requer extração incremental com testes a cada passo.

### R2 — CSS monolítico com colisões não detectadas (ALTO)

11.597 linhas de CSS global significa que qualquer novo estilo pode sobrescrever silenciosamente um estilo existente. Bugs de CSS são especialmente difíceis de rastrear sem CSS Modules.

### R3 — Estado de admin vaza entre locais diferentes (MÉDIO)

`bookingViewByPlace[placeId]`, `academyViewByPlace[placeId]` etc. são armazenados por place ID. Se o estado não for limpo corretamente ao trocar de local, pode haver leak de estado (ex: visualização de "turmas" do local A persistindo ao abrir o local B).

### R4 — Validação visual apenas em estado vazio (MÉDIO)

VISUAL-03 está bloqueado localmente. Refinamentos foram feitos sem validação em dados cheios. O ambiente de produção tem dados mas as telas não foram capturadas sistematicamente.

### R5 — Posicionamento de produto não é visível para o usuário (MÉDIO)

Player App, Management OS e Competition OS são conceitos da documentação interna, não do produto em si. O usuário não sabe que está usando um "SaaS esportivo operacional". A proposta de valor não está visível na interface.

### R6 — Demo user tem múltiplos papéis — invalida testes de persona (MÉDIO)

O usuário demo (escalao@gmail.com) é simultaneamente jogador, organizador de 5 torneios/ligas e dono de 3 academias. Isso torna impossível validar a experiência de jogador puro ou professor autônomo puro neste ambiente.

---

## 16. PRÓXIMOS PASSOS

### Semana 1 — Correções P0 (sem refatoração estrutural)

1. Executar AUDIT-FIX-01 (1 linha de código, impacto crítico)
2. Executar AUDIT-FIX-03 (CTAs em cards de organização)
3. Executar AUDIT-FIX-02 (separar acumulador de Home por papel)
4. Capturar screenshots de validação pós-fix em produção

### Semana 2 — Quick Wins visuais e CSS

1. Executar AUDIT-CSS-01 (modularizar CSS em arquivos por domínio)
2. Executar AUDIT-VISUAL-01 (validação em todos os estados com dados reais)
3. Executar AUDIT-MOBILE-01 (bottom nav em 360px)

### Semana 3-4 — Estrutural: PlaceAdminPage

1. Executar AUDIT-REFACTOR-01 (extração de PlaceAdminPage)
2. Extração incremental com verificação de lint/build a cada passo
3. Mover handlers de admin para PlaceAdminPage
4. PlacesPage retorna ao papel de discovery apenas

### Semana 5-6 — Estrutural: Estado e Competition OS

1. Executar AUDIT-REFACTOR-02 (Context/Store para estado admin)
2. Refinar Competition OS com TournamentPage e LeagueDetailsPage menores
3. Começar COMP-VISUAL-01 (refinamento premium do Competition OS)

---

## 17. CONCLUSÃO

O ATP tem uma visão de produto excepcionalmente clara e documentação de arquitetura que poucos produtos de tamanho similar possuem. Os MDs são de alta qualidade e o pensamento de produto é genuinamente premium.

O gap está entre a documentação e a implementação. Os três problemas que mais impedem o produto de parecer SaaS premium são:

1. **PlacesPage.tsx como god component** — é a raiz de todos os outros problemas técnicos e de UX. Enquanto ela existir assim, nenhuma separação de Player App, Management OS e Competition OS é real no código.

2. **Admin vaza para descoberta pública** — é o bug mais visível e impactante para qualquer usuário que tenha papel admin e tente usar o app como jogador.

3. **Home Page que não sabe qual papel o usuário está usando agora** — bloqueia a proposta de "Player App task-first".

Os três têm soluções conhecidas, técnicas e relativamente diretas. O produto está a poucos ciclos de execução disciplinada de ser genuinamente vendável como SaaS esportivo premium.

---

*Este relatório foi gerado com base em: navegação real do app em produção (https://youratpapp.github.io/ATPAPP), leitura do código-fonte completo e leitura de todos os MDs arquiteturais. Nenhuma alteração foi feita ao código ou documentação existente durante esta auditoria.*
