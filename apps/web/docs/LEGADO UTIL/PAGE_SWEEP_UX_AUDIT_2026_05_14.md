# Page Sweep UX Audit - 2026-05-14

Fonte: `CURRENT_PRODUCT_STATE.md`, `FULL_APP_PRODUCT_TECH_UX_AUDIT.md`, `SCREEN_RESPONSIBILITIES.md`, `PREMIUM_UX_VISUAL_LANGUAGE.md`, `COMPONENT_GRAMMAR.md` e screenshots autenticados em `web/docs/screenshots/visual-03-2026-05-14-local-final/` e `web/docs/screenshots/page-sweep-2026-05-14-roles/`.

## Criterios Permanentes

- Player App nao deve receber tarefas de operacao como pendencia principal.
- Management OS deve resolver operacao diaria por filas, rows e subvisoes executaveis.
- Competition OS deve separar jogar e organizar, com acao primaria por item.
- A mesma rota precisa ser auditada por papel: Admin/PRO, staff/professor e Player puro podem ter visibilidades diferentes.
- Contexto publico nao deve vazar CRM, financeiro, setup, cantina ou cockpit.
- Cards so devem existir para entidades ou resumos; tarefas operacionais devem virar rows.
- Compromisso confirmado e informacao passiva entram em agenda/feed, nao em pendencia.
- Mobile nao pode ser desktop empilhado; filtro e detalhe devem ir para sheet/drawer quando couber.

## Varredura por Pagina

## Perfis de Varredura

| Perfil QA | Login | O que deve revelar |
|---|---|---|
| Admin/PRO multi-papel | `escalao@gmail.com` | Vazamento de operacao no Player App, excesso de ferramentas, Management OS completo e Competition OS de organizador. |
| Player puro | `jogador001@demo.atp.local` | Experiencia limpa de jogar, sem Gestao, sem financeiro operacional, sem setup e sem CTAs de admin. |
| Staff/Professor | `prof.renato@demo.atp.local` | Gestao limitada, agenda/aulas/alunos sem CRM/cantina pesada como prioridade. |

Regra: nenhuma varredura esta completa se apenas o Admin/PRO foi testado. O Admin encontra problemas de excesso; o Player encontra problemas de vazamento; o Professor encontra problemas de permissao e rotina operacional leve.

| Area | Rota/Subfluxo | Status | Achado | Acao |
|---|---|---:|---|---|
| Player App | `/inicio` primeira viewport | Corrigido | Reserva confirmada e espera passiva podiam aparecer como "pendencia", criando ansiedade falsa. | `HomePage` agora prioriza apenas reserva pendente, convite de espera e acoes realmente acionaveis. |
| Player App | `/inicio` Area profissional | Monitorar | Separacao existe, mas usuario multi-papel ainda ve um bloco profissional relativamente pesado no Player App. | Manter como area secundaria; proxima rodada deve avaliar se precisa colapsar em row unica. |
| Player App | `/inicio` listas secundarias | Conforme | Recortes curtos reduzem scroll e mantem acesso completo por notificacoes/rotas especificas. | Sem mudanca nesta rodada. |
| Locais | `/locais` descoberta | Corrigido com risco tecnico | A separacao jogador/gestao foi aplicada e a entrada padrao agora e neutra: o usuario escolhe `Encontrar jogadores`, `Reservar quadra` ou `Entrar em aula` antes de ver filtros/listas. | Manter auditoria recorrente; qualquer novo admin inline em `/locais` e regressao P0. |
| Locais | Encontrar jogadores | Monitorar | Fluxo foi separado de reserva/aula, mas precisa continuar sendo "chamada de jogo", nao busca generica de local. | Validar com dados de cidade grande e filtros ativos. |
| Locais | Reservar quadra | Corrigido | Resultado completo da busca agora retorna cards diretos por quadra livre; faltava CTA explicito no card. | Cards mostram superficie tratada, preco, status de confirmacao e CTA `Solicitar esta quadra`; antes da busca, a tela orienta filtros em vez de listar academias genericas. |
| Locais | Entrar em aula | Corrigido | Busca otimizada podia retornar zero mesmo com turmas carregadas no estado local. | Fallback local agora tambem roda quando a RPC retorna vazia; antes da busca, a tela orienta filtros em vez de listar academias genericas. |
| Local publico | `/locais/:id` | Conforme com risco mobile | Pagina publica deve vender o local e permitir reserva/aula sem expor gestao. | Validar mobile em 360/390/430 quando dados/API estiverem estaveis. |
| Gestao Hub | `/gestao` | Conforme | Entrada propria de Management OS existe e nao depende mais da pagina publica como cockpit. | Sem mudanca nesta rodada. |
| Gestao Hub | `/gestao` digitado por Player puro | Corrigido | Player puro acessando URL direta ganhava contexto visual `Management OS` no nav e texto de setup operacional. | `BottomNav` so mostra `Gestao`/contexto Management quando `access.hasManagement` e verdadeiro; `ManagementHubPage` agora diferencia Player sem permissao de operador sem local. |
| Gestao Local | `/gestao/:placeId/:module` topo e primeira dobra | Corrigido | A rota administrativa ainda renderizava cabecalho/listagem publica de `Locais`, incluindo titulo `Reservar quadra` e card completo do local antes do workspace. | Gestao local agora oculta a camada publica nessa rota, mantem apenas o workspace operacional e usa topo `Management OS` com acoes discretas para central/pagina publica. |
| Gestao Local | Navegacao de modulos | Corrigido | O shell limitava artificialmente em 5 modulos e jogava o restante em `Mais`, mesmo com espaco; o menu abria dentro do bloco e criava scroll interno. | `PlaceAdminShell` agora mostra todos os modulos disponiveis em barra horizontal adaptativa/rolavel, sem dropdown `Mais`. |
| Gestao Local | Agenda | Conforme recente | Duplicidades de Hoje/Reservas/Calendario/Nova reserva/Espera/Quadras foram corrigidas no sprint anterior. | Manter como referencia: subvisao ativa renderiza dentro da Central de agenda. |
| Gestao Local | Agenda > Calendario | Monitorar | Deve mostrar reserva, bloqueio, turma fixa, aula avulsa/reposicao e falta avisada com filtros por tipo, professor, turma, aluno e quadra. | Revalidar com screenshots quando erros 500 de dados forem resolvidos. |
| Gestao Local | Agenda > Quadras/Regras | Monitorar | Regras com dias numericos eram falha grave; interface deve usar dias semanticos e horarios em slots praticos. | Ja ajustado; manter como criterio de regressao visual. |
| Gestao Local | Academia > Professores | Conforme | `Cadastrar professor` precisa terminar onde o cadastro acontece, sem mandar para aba sem formulario. | Fluxo corrigido anteriormente; qualquer CTA deve apontar para `Academia > Professores`. |
| Gestao Local | Academia > Turmas/Alunos | Monitorar | Deve resolver chamada, vaga, reposicao, aluno e mensalidade sem virar ERP pesado. | Proxima auditoria deve capturar subvisoes cheias. |
| Gestao Local | Clientes/CRM | Monitorar | Follow-up e cobranca por intencao existem; risco e excesso de filas parecidas. | Usar rows e no maximo uma acao primaria por contato. |
| Gestao Local | Financeiro | Monitorar | Deve responder "quem cobrar agora" antes de relatorio. | Evitar KPI/relatorio como primeira coisa em mobile. |
| Gestao Local | Cantina | Monitorar | Deve ser venda/estoque rapido, nao painel administrativo denso. | Revalidar com produto, estoque baixo e venda recente. |
| Competition OS | `/eventos` hub | Conforme | Hub separa Jogando, Organizando e Descobrir. | Sem mudanca nesta rodada. |
| Competition OS | Organizando | Conforme com risco | Rows operacionais existem; precisa manter uma acao primaria por torneio/liga. | Proxima varredura deve testar torneio com inscricao, jogo pendente e resultado conflitante. |
| Competition OS | Jogando | Monitorar | Seed demo ainda e forte em organizador e fraco em jogador puro. | Criar/validar demo de jogador comum para screenshot real. |
| Ranking | `/ranking` | Monitorar | Deve ser experiencia de jogador, nao tabela fria. | Validar densidade, filtros e mobile na proxima rodada visual. |
| Perfil | `/perfil` | Monitorar | Deve separar historico esportivo, dados pessoais e configuracao. | Revalidar se links de assets 404 nao voltarem. |
| Auth | `/auth` | Monitorar tecnico | Console ja mostrou 500 "Database error querying schema" quando seed/auth estava inconsistente. | Nao e falha visual, mas bloqueia experiencia e deve virar criterio de QA de seed. |

## Correcoes Aplicadas Nesta Rodada

- `HomePage` deixou de transformar reserva confirmada em pendencia do jogador.
- `HomePage` deixou de transformar lista de espera passiva em pendencia; somente convite liberado vira prioridade para jogador.
- `PlacesPage` deixou a busca de quadras mais acionavel: cards diretos exibem superficie formatada, preco, confirmacao e CTA de reserva.
- `PlacesPage` passou a aplicar fallback local quando a busca otimizada de aulas retorna vazia, evitando falso "nenhuma turma".
- `PlacesPage` passou a abrir `/locais` em estado neutro de intencao, sem assumir que o usuario quer reservar quadra e sem listar academias antes do filtro escolhido.
- `PlacesPage` deixou de listar academias genericas em `Reservar quadra`/`Entrar em aula` antes da busca; esses fluxos agora aguardam filtro e devolvem quadra/turma acionavel.
- `BottomNav` deixou de revelar Management OS para Player puro que acessa `/gestao` manualmente.
- `ManagementHubPage` passou a mostrar mensagem de acesso correta para Player puro, com retorno ao inicio e exploracao publica como acoes, em vez de setup profissional.
- `PlacesPage` removeu a camada publica de descoberta dentro de `/gestao/:placeId/:module`; a gestao local nao deve mais exibir `Reservar quadra`, card publico, ficha de academia ou CTA duplicado antes do workspace.
- `PlaceAdminShell` removeu o overflow artificial `Mais`; modulos aparecem em linha adaptativa/rolavel, evitando dropdown preso no card.
- `placeProductFeatures` passou a manter `Agenda` tambem no plano `academy`, porque academia precisa de agenda operacional mesmo quando reserva publica avulsa nao for o foco comercial.
- `FULL_APP_PRODUCT_TECH_UX_AUDIT.md` foi atualizado para nao manter diagnostico antigo como se ainda estivesse ativo.

## Riscos Que Continuam

- `PlacesPage` ainda concentra descoberta, reserva, aula e gestao em arquivo muito grande; mesmo com UX separada, regressao por acoplamento segue possivel.
- Os screenshots autenticados ainda registram erros 500 em `place_academy_enrollments` e `app_payments`; isso pode fazer pagina parecer "carregando" ou vazia sem ser problema de layout.
- O seed demo ja oferece Admin/PRO, Player puro e Professor; a varredura deve sempre usar pelo menos esses tres perfis.
- A varredura visual precisa se repetir em 360px, 390px, 430px e desktop sempre que mexer em Home, Locais, Gestao ou Competition OS.

## Checklist de Regressao para Proximos Sprints

- [x] Abrir `/inicio` com usuario jogador puro e confirmar que nao existe tarefa operacional na primeira viewport.
- [x] Abrir `/locais` como admin e confirmar que continua parecendo Player App, nao cockpit.
- [x] Abrir `/locais` como Player puro e confirmar que a primeira tela pede intencao antes de listar quadras/aulas/academias.
- [x] Abrir `/gestao` como Player puro e confirmar que a tela explica ausencia de permissao, sem vender setup operacional como tarefa.
- [x] Buscar quadra por cidade/data/hora e confirmar que o resultado primario e slot/quadra livre acionavel.
- [x] Buscar aula por nivel/cidade/dia e confirmar que o resultado primario e turma com vaga.
- [ ] Abrir `Gestao > Agenda` e confirmar que cada subvisao aparece uma unica vez.
- [ ] Abrir `Gestao > Academia > Professores` pelo CTA `Cadastrar professor` e confirmar que o formulario esta na mesma subvisao.
- [ ] Abrir Competition OS em `Jogando` e `Organizando` com massa real e confirmar que cada row tem acao primaria coerente.
