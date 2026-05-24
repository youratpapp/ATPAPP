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

Pendencia observada para proxima varredura:

- Continuar procurando telas antigas que ainda usem modal central grande onde o contrato atual pede lista/tabela + detalhe lateral.
- Revisar detalhes de Liga e torneio jogador para reduzir labels visuais repetidos quando a duplicidade atrapalhar a leitura.
