# Deep Product Sweep Fix Queue

Data: 2026-05-24

Fonte: `DEEP_PRODUCT_SWEEP_2026_05_24.md` e artefatos em `artifacts/deep-product-sweep-2026-05-24-*`.

Objetivo: transformar os achados da varredura em correcoes executaveis, com foco em fluxo real, SaaS web compacto, detalhe lateral, controles funcionais e ausencia de erro no console.

## Regra De Execucao

Executar em ordem, sem pedir autorizacao entre itens. Se um item encontrar bloqueio tecnico:

1. corrigir o menor suporte necessario;
2. validar com build e, quando possivel, screenshot/auditoria;
3. documentar o desvio;
4. continuar a fila.

## SWEEP-FIX-01 - Financeiro: cobranca sem RPC incompatível

Status: concluido em 2026-05-24.

Problema:

- A tela de recebiveis chama `app_create_payment_reminder_for_participant` para alvos que nao sao inscricoes/participantes.
- A acao `Cobrar`, `Cobrar planos` e `Cobrar alunos` gera 400 e polui console.

Comportamento alvo:

- Recebivel de inscricao/participante pode usar a RPC de participante.
- Mensalidade, contrato, matricula, aula avulsa, reserva e plano nao devem chamar essa RPC.
- A interface deve explicar que esses recebiveis usam cobranca manual/WhatsApp ate existir automacao especifica.
- A baixa manual `Pagar` deve continuar funcionando.

Arquivos provaveis:

- `src/pages/PlacesPage.tsx`
- `src/components/place/PlaceFinanceReceivablesModule.tsx`
- `src/lib/payments.ts` se for necessario criar helper.

Critérios de aceite:

- Clique em `Enviar lembrete` em recebivel de academia/plano nao gera 400.
- Batch de planos/alunos nao gera chamadas invalidas.
- Usuario recebe feedback claro.
- Build passa.

Implementado:

- `PlacesPage.tsx` agora valida `targetType` antes de chamar `app_create_payment_reminder_for_participant`.
- `PlaceFinanceReceivablesModule.tsx` desabilita lembrete/batch quando o tipo ainda nao e suportado pela RPC.
- Recebiveis sem suporte recebem texto orientando WhatsApp/Cliente 360 e baixa manual.

Validacao:

- `npm.cmd run build` passou.
- Varredura filtrada `work-financeiro-recebiveis` nao registrou `400`, erro de console ou `app_create_payment_reminder_for_participant`.

## SWEEP-FIX-02 - Agenda: tabs roteaveis e funcionais

Status: concluido em 2026-05-24.

Problema:

- `Dia`, `Semana`, `Lista`, `Remarcacoes`, `Canceladas` e `Conflitos` parecem tabs, mas nao deixam estado auditavel/compartilhavel na URL.

Comportamento alvo:

- Cada tab atualiza `modo` na query string:
  - `modo=dia`
  - `modo=semana`
  - `modo=lista`
  - `modo=remarcacoes`
  - `modo=canceladas`
  - `modo=conflitos`
- `Semana` mostra uma quadra por vez.
- `Lista` mostra tabela compacta.
- `Remarcacoes`, `Canceladas` e `Conflitos` mostram filas focadas.

Arquivos provaveis:

- `src/components/place/PlaceBookingCalendarModule.tsx`
- CSS em `src/App.css` se houver ajuste visual imediato.

Critérios de aceite:

- Ao clicar em cada tab, a URL muda e o conteudo muda.
- Reload preserva a tab.
- Nenhum tab fica com aparencia ativa sem trocar estado.

Implementado:

- `PlaceBookingCalendarModule.tsx` sincroniza as tabs com `modo` na URL e restaura o estado no reload.
- `Semana` continua limitada a uma quadra por vez.

Validacao:

- Varredura filtrada confirmou mudanca de URL para `modo=dia`, `modo=semana`, `modo=lista`, `modo=remarcacoes`, `modo=canceladas` e `modo=conflitos`.

## SWEEP-FIX-03 - Titulos semanticos e contrato de pagina

Status: concluido em 2026-05-24.

Problema:

- Rotas internas de Trabalho e Competition OS possuem titulo visual, mas muitas nao possuem `h1`.

Comportamento alvo:

- Toda pagina principal de trabalho deve ter `h1` real.
- O visual permanece compacto.
- A semantica nao vira texto escondido usado como remendo quando ja houver titulo visual claro.

Arquivos provaveis:

- `src/pages/PlacesPage.tsx`
- componentes de workspace de area.
- `src/App.css`.

Critérios de aceite:

- Auditoria reduz `sem-h1` nas rotas de trabalho.
- Nao aumenta a altura do topo.

Implementado:

- `ManagementShell` ganhou `h1` auditavel em modo compacto.
- `PlaceBookingCalendarModule` usa `h1` real no titulo principal de Agenda/Reservas.

Validacao:

- `npm.cmd run build` passou apos a alteracao.

## SWEEP-FIX-04 - Agenda: grade compacta final e detalhe lateral consistente

Status: concluido em 2026-05-24.

Problema:

- Celulas ainda repetem informacao demais.
- Alguns horarios/quadras cortam em desktop.
- Edicao inline pode quebrar o layout da grade.

Comportamento alvo:

- Celula mostra nome + status curto, sem repetir horario quando a linha ja indica horario.
- Detalhe lateral e o unico lugar para editar, cancelar, WhatsApp, pagar e historico.
- Grade se ajusta para 6 a 8 quadras com scroll horizontal apenas dentro da grade, sem cortar cabecalho ou coluna de hora.
- Status visual por pagamento: pago, pendente, cancelada, bloqueio, aula.

Arquivos provaveis:

- `src/components/place/PlaceBookingCalendarModule.tsx`
- `src/App.css`

Critérios de aceite:

- Nenhuma edicao aparece espremida dentro da celula.
- A ultima quadra nao fica cortada em 1366.
- Detalhe lateral permanece fixo ao lado quando ha espaco.

Implementado:

- Celulas da agenda receberam `aria-label` contextual sem poluir o texto visual.
- Colunas da grade foram compactadas para acomodar mais quadras antes de exigir scroll.
- Texto de celulas foi travado em uma linha com ellipsis para preservar o ritmo horario.

Validacao:

- Varredura filtrada reduziu o escopo restante para achados medios de texto/click/labels, sem erro de console.

## SWEEP-FIX-05 - Academia: Turmas/Alunos/Pendencias como SaaS de lista + detalhe

Status: concluido em 2026-05-24.

Problema:

- Turmas e alunos ainda misturam resumo, fila e lista.
- Alguns detalhes abrem em modal sobreposto pesado.
- Pendencias aparecem como blocos repetidos.

Comportamento alvo:

- Turmas: tabela compacta, filtros, linha selecionada, detalhe lateral.
- Alunos: tabela compacta, filtros, Cliente/Aluno 360 lateral.
- Pendencias: fila operacional propria, com CTA contextual e `aria-label` por pessoa.
- Resumos de “aulas hoje” ficam em Inicio/Hoje, nao repetidos dentro de Turmas/Alunos.

Arquivos provaveis:

- `src/components/place/PlaceAcademyResourcesModule.tsx`
- `src/components/place/PlaceClientRelationshipModule.tsx`
- `src/App.css`

Critérios de aceite:

- Abrir turma/aluno nao cobre a tela inteira no desktop.
- Listas ficam compactas e alinhadas.
- Acoes repetidas possuem contexto.

Implementado:

- Alunos agora abre detalhe em painel lateral `Aluno 360`, sem modal sobreposto no desktop.
- Turmas e alunos tiveram colunas compactadas para nao invadir o painel lateral.
- Pendencias recebeu `aria-label` contextual nas acoes repetidas de ativar/aprovar/pagar/WhatsApp/recusar/reposicao.
- A tabela de alunos prioriza nome, status, plano/turma e proximo passo; telefone fica no detalhe lateral para manter a lista legivel.

Validacao:

- `npm.cmd run build` passou.
- Varredura filtrada `work-academia-turmas`, `work-academia-alunos` e `work-academia-pendencias` nao registrou erro de console.
- Screenshots atualizados em `artifacts/deep-product-sweep-2026-05-24/desktop-1366-work-academia-*.png`.

## SWEEP-FIX-06 - Clientes: Cliente 360 como destino unico de relacionamento

Status: concluido em 2026-05-24.

Problema:

- Existem varias listas que parecem clientes: Clientes, Academia/Alunos e Financeiro.
- Acoes de WhatsApp/retorno repetem label sem contexto.

Comportamento alvo:

- `Clientes` centraliza pessoa e vinculos com a academia.
- Drawer Cliente 360 mostra dados pessoais, planos, turmas, reservas, pagamentos, historico e proximos passos.
- Listas especializadas podem existir, mas apontam para o Cliente 360.
- Acoes curtas visualmente, com `aria-label` contextual.

Arquivos provaveis:

- `src/components/place/PlaceClientRelationshipModule.tsx`
- `src/components/place/PlaceAcademyResourcesModule.tsx`
- `src/components/place/PlaceFinanceReceivablesModule.tsx`
- `src/App.css`

Critérios de aceite:

- Cliente clicado abre um resumo coerente do relacionamento.
- Nao ha duplicidade conceitual sem explicacao entre Aluno/Cliente/Financeiro.

Implementado:

- Cliente 360 centraliza dados pessoais, vinculo de socio/aluno/CRM, metodo de pagamento, turmas, reservas, pagamentos, pacotes e historico de relacionamento.
- O padrao de tela foi mantido como lista compacta + detalhe lateral, alinhado ao novo contrato SaaS.

Validacao:

- Varredura filtrada `work-clientes-ativos` nao registrou erro de console.
- Screenshot atualizado em `artifacts/deep-product-sweep-2026-05-24/desktop-1366-work-clientes-ativos.png`.

## SWEEP-FIX-07 - Financeiro: listas compactas e detalhe lateral

Status: concluido em 2026-05-24.

Problema:

- Planos/pacotes exibem muitas acoes por linha.
- Acoes como consumir/pausar competem com leitura financeira.

Comportamento alvo:

- Tabela compacta por linha.
- Drawer lateral do recebivel/plano/pacote concentra acoes.
- Modal provisorio de pagamento aparece onde houver pagamento, com valor e botao `Pagar`.
- Futuro webhook/edge function entra no mesmo contrato sem mudar UX.

Arquivos provaveis:

- `src/components/place/PlaceFinanceReceivablesModule.tsx`
- `src/components/place/PlaceMembershipModule.tsx`
- `src/components/place/PlaceCreditPackageModule.tsx`
- `src/App.css`

Critérios de aceite:

- Linhas financeiras nao parecem painel mobile esticado.
- Botao `Pagar` atualiza estado local e persiste apos refresh quando a RPC suportar o alvo.

Implementado:

- Recebiveis seguem padrao de console financeiro com KPIs, filtros, tabela compacta e detalhe lateral.
- Alvos sem suporte de lembrete automatico nao chamam RPC incompativel.
- Despesas receberam `aria-label` contextual no cancelamento para reduzir ambiguidade de acoes repetidas.

Validacao:

- `npm.cmd run build` passou.
- Varredura filtrada `work-financeiro-recebiveis`, `work-financeiro-pagos` e `work-financeiro-despesas` nao registrou erro de console.

## SWEEP-FIX-08 - Labels acessiveis e copy publica

Status: concluido em 2026-05-24.

Problema:

- Labels duplicados como `Livre`, `WhatsApp`, `Aprovar`, `Seguir`, `Quero jogar` sao aceitaveis visualmente em listas, mas pobres para QA e acessibilidade.
- Algumas copys parecem instrucao interna.

Comportamento alvo:

- Texto visual pode continuar curto.
- `aria-label` informa contexto: pessoa, horario, status, entidade.
- Copys publicas usam linguagem direta ao usuario, nao descricao tecnica interna.

Arquivos provaveis:

- componentes de agenda, clientes, academia, player e ranking.

Critérios de aceite:

- Auditoria reduz `labels-duplicados` onde a duplicidade era acao.
- Nao polui visual.

Implementado:

- Agenda recebeu `aria-label` contextual para slots livres e ocupados.
- Pendencias da academia recebeu `aria-label` contextual em acoes repetidas.
- Despesas recebeu `aria-label` contextual no cancelamento.
- O texto visual permaneceu curto e operacional.

Validacao:

- Build passou apos as alteracoes.
- A varredura restante aponta achados medios de alvo pequeno/labels visuais repetidos em listas densas, sem regressao funcional ou erro de console.

## SWEEP-FIX-09 - Follow-up rigoroso: agenda, financeiro e competicoes

Status: concluido em 2026-05-24.

Motivo:

- A rodada posterior de screenshots mostrou que algumas areas ainda mantinham densidade, componentes ou semantica aquem do padrao SaaS compacto definido.
- Agenda precisava exibir mais quadras no primeiro plano com detalhe lateral consistente.
- Planos/pacotes financeiros ainda pareciam uma pilha de cards de mobile esticado.
- Competition OS tinha hero sem `h1` e a area de torneio repetia botoes genericos de WhatsApp.

Comportamento alvo:

- Agenda web usa grade mais compacta, com colunas cabendo melhor antes de scroll horizontal e detalhe lateral preservado.
- Financeiro/planos vira console: resumo, tabela compacta e detalhe lateral, sem uma pilha de acoes competindo com a leitura.
- Competition OS tem hierarquia semantica correta e acoes nomeadas por contexto: resumo, convite, publicacao e placar.
- Toasts e fechamentos usam alvos clicaveis confortaveis.

Arquivos alterados:

- `src/App.css`
- `src/pages/EventsHubPage.tsx`
- `src/pages/TournamentPage.tsx`
- `src/components/ToastProvider.tsx`
- `src/components/place/PlaceFinancePackagesModule.tsx`

Validacao:

- `npm.cmd run build` passou.
- Varredura focada de Agenda gerou screenshot em `artifacts/deep-product-sweep-2026-05-24-followup-agenda-compact/`.
- Varredura focada de Financeiro/Planos e Admin Publico gerou screenshots em `artifacts/deep-product-sweep-2026-05-24-followup-finance-packages-2/`.
- Varredura focada de `competition-os` e `tournament-organizacao` passou com `0 achados` em `artifacts/deep-product-sweep-2026-05-24-followup-competition-fixes/`.

Itens que guiaram as varreduras posteriores:

- Continuar procurando telas antigas que ainda usem modal central grande onde o contrato atual pede lista/tabela + detalhe lateral.
- Revisar detalhes de Liga e torneio jogador para reduzir labels visuais repetidos quando a duplicidade atrapalhar a leitura.

## SWEEP-FIX-10 - Follow-up rigoroso: planos/socios e CRM leads

Status: concluido em 2026-05-24.

Problema:

- `Financeiro > Planos` ainda carregava abaixo do console novo uma area antiga de planos e socios com cards longos e varias acoes por linha.
- `Clientes > Leads` usava uma lista de cards com tres botoes repetidos em massa (`Registrar retorno`, `WhatsApp`, `Historico`), criando ruido visual e de auditoria.
- Drawers do CRM herdavam rodape claro em algumas situacoes, destoando do Management OS.

Comportamento alvo:

- Planos e socios seguem console compacto com tabela e painel lateral de detalhe.
- Acoes de socio (`Ativar`, `Pagar`, `Lembrar`, `Cancelar`) ficam no detalhe lateral do socio selecionado.
- Leads viram lista de triagem: a linha inteira abre o relacionamento; WhatsApp, historico e registro ficam no drawer.
- Inputs numericos vazios nao aparecem como uma sequencia de controles `0`.
- Drawers no Management OS mantem fundo dark e rodape consistente.

Arquivos alterados:

- `src/components/place/PlaceMembershipModule.tsx`
- `src/components/place/PlaceCrmContactRow.tsx`
- `src/components/place/PlaceFinancePackagesModule.tsx`
- `src/App.css`

Validacao:

- `npm.cmd run build` passou.
- Varredura focada de `work-financeiro-planos` e `work-clientes-leads` passou com `0 achados` em `artifacts/deep-product-sweep-2026-05-24-followup-membership-crm-4/`.

## SWEEP-FIX-11 - Follow-up rigoroso: agenda, turmas e clientes ativos

Status: concluido em 2026-05-24.

Problema:

- Varredura ampliada do nucleo web de trabalho encontrou 5 achados residuais em `Agenda`, `Academia > Turmas` e `Clientes > Clientes ativos`.
- Agenda ainda repetia `Livre` em dezenas de celulas, poluindo a leitura e a auditoria.
- Alguns filtros e controles ficavam estreitos demais para o texto.
- Turmas e Cliente 360 precisavam manter alvo clicavel confortavel e proporcao lateral consistente.

Comportamento alvo:

- Agenda usa o eixo de horas e colunas como calendario real; celula livre vira affordance visual discreta, nao texto repetido.
- Detalhe de agenda permanece em painel lateral com botao de fechar confortavel.
- Filtros usam labels curtos sem perda de significado.
- Turmas e clientes ativos preservam lista/tabela compacta com detalhe lateral, sem alvos menores que o minimo de uso.

Arquivos alterados:

- `src/components/place/PlaceBookingCalendarModule.tsx`
- `src/components/place/PlaceAcademyClassesModule.tsx`
- `src/App.css`

Validacao:

- `npm.cmd run build` passou.
- Varredura focada de `work-agenda-dia`, `work-academia-turmas` e `work-clientes-ativos` passou com `0 achados` em `artifacts/deep-product-sweep-2026-05-24-followup-work-core-4/`.
- Varredura ampliada de 12 rotas principais do SaaS web passou com `0 achados` em `artifacts/deep-product-sweep-2026-05-24-followup-work-core-6/`.

## PLAYER-FIX-01 - Evolucao area jogador web/mobile

Status: concluido em 2026-05-24.

Problema:

- Varredura dedicada da area Jogador encontrou duplicidade de CTAs visuais em `Jogar > Encontrar jogo`, `Competir` mobile e `Ranking`.
- Ranking tinha links de jogador com alvo clicavel pequeno e, apos contextualizar os botoes, a coluna de acao podia cortar o texto no desktop.
- Os problemas nao eram de console/backend: eram de clareza, leitura e contexto de acao.

Comportamento alvo:

- Cada chamada aberta em `Jogar` usa CTA contextual por data/horario: `Entrar dd/mm hh:mm` ou `Confirmado dd/mm hh:mm`.
- `Competir` separa rótulos genericos de ligas: atalhos e discovery usam `Minhas ligas` / `Ver ligas`.
- Ranking usa botoes contextuais por jogador (`Seguir Nome`) e a tabela reserva coluna suficiente para a acao.
- Links de perfil de jogador ganham area clicavel minima confortavel sem alterar o fluxo.

Arquivos alterados:

- `src/pages/PlacesPage.tsx`
- `src/pages/EventsHubPage.tsx`
- `src/pages/RankingPage.tsx`
- `src/App.css`

Validacao:

- `npm.cmd run build` passou.
- Varredura focada de `player-jogar-partidas`, `player-competir` e `player-ranking` passou com `0 achados` em `artifacts/deep-product-sweep-2026-05-24-player-evolution-pass-2/`.
- Varredura ampliada de Home/Jogar/Competir/Torneios/Ligas passou com `0 achados` em `artifacts/deep-product-sweep-2026-05-24-player-evolution-pass-3a/`.
- Varredura ampliada de Agenda/Ranking/Perfil passou com `0 achados` em `artifacts/deep-product-sweep-2026-05-24-player-evolution-pass-3b/`.
- Rechecagem especifica do Ranking apos ajuste visual da coluna passou com `0 achados` em `artifacts/deep-product-sweep-2026-05-24-player-evolution-pass-4-ranking/`.

## PLAYER-FIX-02 - Compactacao estrutural e DNA SaaS na area Jogador

Status: concluido em 2026-05-24.

Problema:

- A area Jogador ainda herdava parte do padrao antigo: heroes grandes demais, paineis de resumo duplicados, cards secundarios ocupando a primeira dobra e paginas de entrada com sensacao de vazio.
- Home mobile sobrepunha estatisticas e texto do hero.
- `Jogar` no desktop abria com hero e muito espaco vazio abaixo, sem uma segunda linha operacional para orientar a proxima acao.
- `Minha rotina` mobile tinha hero e KPIs grandes demais para uma superficie de consulta pessoal.

Comportamento alvo:

- Player App absorve o DNA compacto do SaaS Trabalho: raios menores, blocos mais lineares, menos margem gratuita e primeira dobra orientada por acao.
- Home do jogador remove o painel completo duplicado; rotina detalhada fica na propria `Minha rotina`.
- Hero mobile da Home empilha corretamente texto, CTA e KPIs, sem sobreposicao.
- `Jogar` ganha uma linha operacional compacta abaixo do hero com contadores e CTAs para chamadas abertas, quadras, aulas e locais.
- `Minha rotina` mobile reduz hero/KPIs e deixa abas e resumos aparecerem mais cedo.

Arquivos alterados:

- `src/pages/HomePage.tsx`
- `src/pages/PlacesPage.tsx`
- `src/App.css`

Validacao:

- `npm.cmd run build` passou.
- Varredura focada Home/Competir/Agenda/Jogar/Perfil passou com `0 achados` em `artifacts/deep-product-sweep-2026-05-24-player-ux-compact-pass-3/`.
- Varredura focada Home/Agenda apos compactacao da rotina passou com `0 achados` em `artifacts/deep-product-sweep-2026-05-24-player-ux-compact-pass-5/`.
- Varredura focada de `Jogar` passou com `0 achados` em `artifacts/deep-product-sweep-2026-05-24-player-ux-jogar-pass-1/`.
- Varredura ampla final foi dividida por timeout da rodada unica e passou com `0 achados` em:
  - `artifacts/deep-product-sweep-2026-05-24-player-ux-final-a/`
  - `artifacts/deep-product-sweep-2026-05-24-player-ux-final-b/`

## PLAYER-FIX-03 - Separacao rigida Player/Trabalho em competicoes e local publico

Status: concluido em 2026-05-24.

Problema:

- A auditoria de fluxos internos do jogador encontrou vazamento de cockpit operacional quando um usuario admin abria `#/eventos/:id/jogos` ou liga pelo caminho do Player App.
- A pagina publica do local ainda carregava ferramentas de gestao/publicacao (`Gestao`, widget/publicacao) dentro da experiencia do jogador.
- A regua de intencoes do local publico era visualmente parecida com cards e gerava `texto-cortado-em-controle`, alem de ocupar espaco demais para uma navegacao secundaria.

Comportamento alvo:

- Player App nunca mostra operacao de owner/staff por inferencia de usuario logado; a operacao so aparece em rota/parametro explicitamente de Trabalho (`organizacao`, `mode=work` ou equivalente).
- A pagina publica do local e 100% orientada ao jogador: reservar, aulas, jogos, planos e contato.
- A regua de intencoes do local publico vira navegacao compacta de uma linha, sem card alto, sem pseudo-elemento que gere overflow e sem labels administrativos.
- O cockpit operacional continua acessivel e validado no modo Trabalho.

Arquivos alterados:

- `src/pages/TournamentPage.tsx`
- `src/pages/LeagueDetailsPage.tsx`
- `src/pages/PlacePublicPage.tsx`
- `src/App.css`
- `scripts/deep-product-sweep.mjs`

Validacao:

- `npm.cmd run build` passou.
- Varredura de competicoes internas do jogador passou com `0 achados` em `artifacts/deep-product-sweep-2026-05-24-player-internals-pass-2/`.
- Guarda de cockpit em Trabalho passou com `0 achados` em `artifacts/deep-product-sweep-2026-05-24-player-internals-work-guard/`.
- Varredura de fluxos publicos do local e inscricao passou com `0 achados` em `artifacts/deep-product-sweep-2026-05-24-player-public-flows-pass-8/`.
- Rechecagem final Player foi dividida por tempo e passou com `0 achados` em:
  - `artifacts/deep-product-sweep-2026-05-24-player-final-core-a/`
  - `artifacts/deep-product-sweep-2026-05-24-player-final-core-b/`
  - `artifacts/deep-product-sweep-2026-05-24-player-final-core-c1/`
  - `artifacts/deep-product-sweep-2026-05-24-player-final-core-c2/`

## PLAYER-FIX-04 - Paridade de largura web entre Home e demais paginas do jogador

Status: concluido em 2026-05-25.

Problema:

- A Home do jogador ocupava corretamente a area util do desktop, mas `Jogar`, `Competir`, `Minha rotina`, `Perfil`, `Ranking`, local publico e detalhes de competicao ainda herdavam containers antigos mais estreitos.
- A diferenca vinha do contrato global `--player-content-max-width: 1040px` e `--competition-content-max-width: 1120px`, enquanto a Home tinha excecoes especificas de largura.

Comportamento alvo:

- Player App e Competition Player usam o mesmo contrato de largura util no desktop: ate `1560px`, respeitando sidebar e viewport.
- Header, conteudo e blocos principais ocupam a mesma largura visual da Home.
- Mobile nao recebe alargamento artificial.
- Wrappers internos antigos nao podem limitar a pagina a 760/1040/1120px quando a superficie pede largura total.

Arquivos alterados:

- `src/styles/theme.css`
- `src/App.css`

Validacao:

- `npm.cmd run build` passou.
- Varredura de Home/Jogar/Competir/Agenda/Ranking/Perfil em `desktop-1366`, `desktop-wide` e `mobile-430` passou com `0 achados` em `artifacts/deep-product-sweep-2026-05-25-player-width-parity-1/`.
- Varredura de local publico/inscricao em `desktop-1366`, `desktop-wide` e `mobile-430` passou com `0 achados` em `artifacts/deep-product-sweep-2026-05-25-player-width-parity-2a/`.
- Varredura de torneio/liga em `desktop-1366`, `desktop-wide` e `mobile-430` passou com `0 achados` em `artifacts/deep-product-sweep-2026-05-25-player-width-parity-2b/`.
