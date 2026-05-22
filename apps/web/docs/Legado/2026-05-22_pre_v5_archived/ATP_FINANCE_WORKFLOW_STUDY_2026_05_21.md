# ATP Finance Workflow Study - 2026-05-21

## Objetivo

Estudar a area `Financeiro` do Management OS com base no codigo real, sem redesenhar backend, sem misturar pagamentos pessoais com financeiro do local e sem transformar o app em ERP generico.

A pergunta principal da area deve ser:

> O que precisa ser cobrado, baixado, conferido ou registrado agora?

## Arquivos e superficies analisadas

- `src/components/place/FinanceWorkspaceShell.tsx`
- `src/components/place/PlaceFinanceReceivablesModule.tsx`
- `src/components/place/PlaceFinancePaidModule.tsx`
- `src/components/place/PlaceFinanceExpensesModule.tsx`
- `src/components/place/PlaceFinancePackagesModule.tsx`
- `src/components/place/PlaceMembershipModule.tsx`
- `src/pages/PlacesPage.tsx`
- `src/pages/ManagementHubPage.tsx`
- `src/pages/HomePage.tsx`
- `src/components/BottomNav.tsx`
- `src/lib/place-admin-navigation.ts`
- `src/lib/place-management.ts`
- `src/lib/place-admin-data.ts`

## Diagnostico executivo

O Financeiro esta funcional, mas ainda mistura tres naturezas diferentes na mesma percepcao de tela:

1. Rotina diaria: cobrar, lembrar, marcar pago, registrar despesa.
2. Conferencia/historico: pagos, resumo, saldo operacional.
3. Configuracao/oferta: planos de socio, turmas mensais, pacotes, creditos e passes.

A estrutura atual tem bons componentes, mas a hierarquia ainda faz o usuario pensar em abas/modulos antes de pensar no trabalho real. O default correto e `Recebiveis`, mas o topo da tela ainda fala "aba Recebiveis", "aba Despesas" e mostra resumo fixo em todas as visoes. Isso cria a mesma sensacao de submenu interno que ja corrigimos em Reservas, Aulas e Clientes.

## Fronteiras corretas

### Financeiro do local

Deve conter:

- recebiveis do local;
- mensalidades de socio;
- mensalidades de academia;
- aulas avulsas e reposicoes cobradas;
- reservas de quadra com pagamento vinculado;
- baixa manual;
- lembretes de cobranca;
- despesas;
- pagos;
- resumo financeiro;
- planos e pacotes vendaveis.

### Pagamentos pessoais

Devem permanecer no Player App, principalmente em `/agenda?tipo=pagamentos`.

O jogador/aluno/socio deve ver:

- sua mensalidade;
- seu pacote;
- sua reserva;
- seu historico pessoal.

Ele nao deve ver:

- recebiveis do local;
- despesas;
- receita;
- clientes inadimplentes;
- planos de outros socios.

### Caixa / Cantina

Deve continuar separado em `Cantina`.

Financeiro pode resumir receita de POS quando o modulo existe, mas nao deve operar venda rapida nem estoque.

### Clientes

Clientes deve ficar com relacionamento e atendimento.

Socio, plano, recorrencia e mensalidade pertencem ao Financeiro. A decisao ja foi aplicada na rodada anterior.

## Personas e tarefas

### Financeiro

Missao primaria:

- abrir trabalho;
- ver vencidos e recebiveis de hoje;
- cobrar;
- marcar pago;
- revisar pagos;
- registrar despesa;
- consultar resumo.

Primeira tela ideal:

- `Financeiro > Receber`.

CTA primario:

- `Marcar pago` ou `Enviar lembrete`, conforme status.

Nao deve ver como foco:

- aulas do dia;
- cantina/venda rapida;
- equipe;
- ajustes estruturais;
- perfil pessoal.

### Gestor owner/manager

Missao primaria:

- entender se existe problema financeiro;
- abrir maior bloqueio;
- cobrar ou delegar;
- revisar receita/despesas;
- ajustar planos quando necessario.

Primeira tela ideal:

- em `Trabalho Hoje`, card de financeiro mostra pendencia critica;
- ao entrar em Financeiro, cai em `Receber`.

CTA primario:

- `Cobrar pendentes`.

### Recepcao

Pode precisar ver contexto de pagamento para uma reserva ou atendimento, mas nao deve operar financeiro amplo.

Recepcao nao deve ter acesso a:

- despesas;
- resumo financeiro;
- planos;
- recebiveis amplos do local.

### Caixa

Opera venda rapida na Cantina.

Financeiro pode receber o consolidado, mas caixa nao deve cair no Financeiro.

### Jogador / aluno / socio

Ve pagamento pessoal em Agenda/Perfil.

Nao entra no Financeiro do local.

## Estrutura atual encontrada

### Rotas atuais

- `/gestao/:placeId/financeiro?visao=recebiveis`
- `/gestao/:placeId/financeiro?visao=pagos`
- `/gestao/:placeId/financeiro?visao=despesas`
- `/gestao/:placeId/financeiro?visao=planos`
- `/gestao/:placeId/financeiro?visao=resumo`

Aliases preservados:

- `finance` -> `financeiro`
- `receivables` -> `recebiveis`
- `paid` -> `pagos`
- `expenses` -> `despesas`
- `packages` e `pacotes` -> `planos`
- `overview` -> `resumo`

### Permissao atual

Em `placeResourceAccess`:

- `canManageFinance = features.finance && (canManagePlace || staffRole === "finance")`.

Portanto:

- owner e manager podem acessar financeiro;
- papel `finance` pode acessar financeiro sem cair na gestao completa;
- frontdesk, coach e cashier nao devem ver financeiro amplo.

### Navegacao atual

Mobile para papel financeiro:

- `Receber`
- `Pagos`
- `Despesas`
- `Resumo`
- `Perfil`

Gestor mobile:

- `Hoje`
- `Agenda`
- `Aulas`
- `Financeiro`
- `Mais`

Desktop:

- sidebar mostra `Financeiro` como item de modulo, e as visoes internas aparecem dentro da propria pagina.

## Fontes de dados do financeiro

### Recebiveis gerados

O codigo compoe `financeReceivables` a partir de:

- `place_membership`;
- `academy_student_contract`;
- `academy_enrollment`;
- `academy_lesson_request`;
- `court_booking` derivado de pagamentos existentes;
- pagamentos stub ja registrados em `paymentsByTarget`.

### Status usados

- `open`;
- `paid`;
- `pending_approval`.

### Origem usada para contexto

- `membership`;
- `academy`;
- `lesson`;
- `booking`;
- `other`.

### Datas de vencimento

Hoje sao derivadas por regra fixa:

- socio: dia 05 do periodo;
- academia: dia 06 do periodo;
- outros: dia 01 do periodo;
- fallback por data do item.

Isso e suficiente como stub operacional, mas no futuro deve vir de regra configuravel por plano/turma/contrato.

## Problemas encontrados

### FIN-P01 - Financeiro ainda tem submenu interno forte

`FinanceWorkspaceShell` renderiza todas as abas internas:

- Recebiveis;
- Pagos;
- Despesas;
- Planos;
- Resumo.

Isso faz sentido como arquitetura tecnica, mas visualmente compete com a navegacao principal. Depois das correcoes em Reservas, Aulas e Clientes, o Financeiro virou uma das poucas areas ainda com "menu dentro do menu".

Risco:

- gestor e financeiro nao sabem se devem trocar area pelo menu principal ou pela aba interna;
- mobile pode parecer ter tiers demais;
- futuras decisoes podem recolocar setup raro na rotina diaria.

Direcao:

- preservar rotas;
- esconder a tabbar interna em telas onde a navegacao principal ja escolheu a visao;
- oferecer CTAs contextuais para ir a `Pagos`, `Despesas`, `Planos` e `Resumo`.

### FIN-P02 - Resumo fixo aparece antes de qualquer visao

`finance-routine-summary` aparece dentro de `FinanceWorkspaceShell` antes de todas as visoes.

Ele ajuda em `Receber`, mas fica estranho em:

- `Pagos`, porque ainda fala em "Receber" e "Baixas";
- `Despesas`, porque ocupa a primeira dobra antes do formulario;
- `Planos`, porque fala em aba e cobranca diaria;
- `Resumo`, porque duplica o proprio resumo.

Direcao:

- em `Receber`: mostrar cards de vencidos, hoje, total em aberto e CTA de lote;
- em `Pagos`: mostrar total pago e filtros;
- em `Despesas`: mostrar lancamento rapido e despesas recentes;
- em `Planos`: mostrar ofertas/recorrencia e avisar que e configuracao/oferta, nao cobranca diaria;
- em `Resumo`: mostrar relatorio consolidado.

### FIN-P03 - `Planos` esta grande demais

`PlaceFinancePackagesModule` hoje mistura:

- planos de socio;
- turmas da academia;
- aulas avulsas;
- mapa de ofertas;
- saude de creditos;
- creditos e passes;
- vendas de credito.

Alem disso, depois da separacao de Clientes, `PlaceMembershipModule` tambem aparece em Financeiro > Planos, criando possivel duplicidade com o card `Planos de socio`.

Direcao:

- `Planos` deve virar uma superficie de ofertas/configuracao comercial:
  - Socios;
  - Turmas/mensalidades;
  - Pacotes/creditos;
  - Aulas avulsas;
- a gestao de socios deve ser uma secao clara, nao duplicada;
- cards informativos podem ficar compactos, mas formulario/gestao deve ser um unico lugar.

### FIN-P04 - `Recebiveis` mistura cobranca e validacao

Recebiveis inclui status `pending_approval`.

Isso e util, mas o CTA padrao ainda e `Marcar pago` para todos. Para itens aguardando aprovacao, a acao pode ser interpretada como baixa financeira sem validar cadastro/contrato.

Direcao:

- status `pending_approval` deve ter microcopy clara:
  - "Cadastro/contrato aguardando validacao";
  - "Validar antes de cobrar", quando aplicavel;
- CTA primario pode continuar sendo financeiro apenas se o fluxo atual permitir, mas o texto deve evitar ambiguidade.

### FIN-P05 - Pagos e historico ainda sao pobres

`Pagos` lista pagamentos pagos, mas falta:

- filtro por origem;
- total pago no recorte;
- separacao por socio, academia, reserva, aula;
- estado vazio orientativo.

Direcao:

- manter como historico/conferencia, nao rotina diaria;
- adicionar cards compactos de totais e filtros por origem.

### FIN-P06 - Despesas e simples, mas correta

`Despesas` tem formulario e lista recente.

Pontos de atencao:

- acao destrutiva `Cancelar` aparece por linha, mas faz sentido;
- nao ha categorias guiadas;
- nao ha total do periodo no topo.

Direcao:

- manter no Financeiro;
- nao mover para Ajustes;
- adicionar resumo do periodo antes da lista;
- manter form enxuto.

### FIN-P07 - Financeiro legacy ainda renderiza blocos empilhados

Quando nao esta no cockpit de gestao, `showFinanceOverview`, `showFinanceReceivables`, `showFinancePackages` e `showFinanceExpenses` podem renderizar blocos sequenciais.

Isso preserva compatibilidade, mas e uma area de risco para duplicidade visual.

Direcao:

- preservar enquanto existirem rotas legadas;
- evitar criar novas funcoes nesse fallback;
- concentrar melhoria no workspace moderno.

## Arquitetura alvo

### Financeiro / Receber

Pergunta:

- Quem precisa pagar ou ser cobrado agora?

Primeira dobra:

- total vencido;
- vencem hoje;
- total em aberto;
- CTA `Cobrar vencidos`;
- CTA `Marcar pago` por linha.

Conteudo:

- filtros: `Todos`, `Vencidos`, `Hoje`, `Socios`, `Alunos`, `Reservas`, `Aulas avulsas`;
- lista priorizada por vencido > hoje > proximo > sem data;
- status claro para `pending_approval`.

Estado vazio:

- "Nenhum recebivel em aberto agora. Quando houver mensalidade, reserva ou aula pendente, ela aparecera aqui para cobranca e baixa."

### Financeiro / Pagos

Pergunta:

- O que ja foi pago e precisa ser conferido?

Primeira dobra:

- total pago no periodo;
- quantidade de pagamentos;
- filtros por origem.

Conteudo:

- historico por origem;
- data/periodo;
- valor;
- referencia.

Estado vazio:

- "Nenhum pagamento registrado neste periodo. Baixas feitas em Receber aparecerao aqui."

### Financeiro / Despesas

Pergunta:

- Que saida precisa ser registrada ou conferida?

Primeira dobra:

- formulario curto de nova despesa;
- total de despesas do periodo;
- despesas recentes.

Conteudo:

- categoria;
- descricao;
- valor;
- data;
- cancelar lancamento quando permitido.

Estado vazio:

- "Sem despesas recentes. Registre uma despesa quando houver uma saida operacional do local."

### Financeiro / Planos

Pergunta:

- O que o local vende de forma recorrente ou por pacote?

Primeira dobra:

- planos de socio;
- turmas mensais;
- pacotes/creditos;
- receita mensal prevista.

Conteudo:

- planos de socio e socios;
- turmas/mensalidades;
- pacotes de credito;
- vendas de credito.

Regra:

- nao deve ser a primeira tela do financeiro;
- e configuracao/oferta, nao cobranca diaria;
- nao deve ficar em Clientes.

### Financeiro / Resumo

Pergunta:

- Como esta o resultado financeiro do periodo?

Primeira dobra:

- receita recebida;
- em aberto;
- despesas;
- saldo operacional.

Conteudo:

- cards de leitura;
- sem formularios;
- sem acoes destrutivas.

## Navegacao recomendada

### Mobile - papel financeiro

Manter:

- Receber;
- Pagos;
- Despesas;
- Resumo;
- Perfil.

`Planos` nao precisa ser bottom nav diario. Deve ser acessivel por:

- CTA em `Resumo`;
- CTA contextual quando existir solicitacao de socio;
- desktop/sidebar;
- rota direta preservada.

### Mobile - gestor

Manter:

- Hoje;
- Agenda;
- Aulas;
- Financeiro;
- Mais.

Ao abrir Financeiro, cair em `Receber`.

### Desktop

Sidebar continua com `Financeiro`.

Dentro da tela, a tabbar interna deve ser substituida por:

- titulo da visao ativa;
- CTAs contextuais pequenos;
- links para outras visoes apenas quando forem proximo passo natural.

## Queue proposta

### FIN-01 - Contrato final do Financeiro

Objetivo:

- congelar responsabilidades de cada visao financeira.

Arquivos provaveis:

- `FinanceWorkspaceShell.tsx`;
- `PlacesPage.tsx`;
- este estudo.

Aceite:

- cada visao responde a uma pergunta unica;
- nenhuma visao mistura financeiro pessoal com financeiro do local.

### FIN-02 - Remover tabbar interna do Financeiro sem quebrar rotas

Objetivo:

- seguir o mesmo padrao aplicado em Reservas, Aulas e Clientes.

Regras:

- preservar `?visao=recebiveis`, `pagos`, `despesas`, `planos`, `resumo`;
- nao esconder `Pagos` e `Despesas` para papel financeiro;
- garantir acesso a `Planos` por CTA/rota.

### FIN-03 - Primeira dobra por visao

Objetivo:

- substituir o resumo fixo por cabecalho contextual.

Por visao:

- Receber: vencidos, hoje, aberto, cobrar/marcar pago;
- Pagos: total pago e filtros;
- Despesas: formulario e total do periodo;
- Planos: ofertas e recorrencia;
- Resumo: consolidado.

### FIN-04 - Reorganizar Planos

Objetivo:

- evitar duplicidade entre `PlaceFinancePackagesModule` e `PlaceMembershipModule`.

Decisao recomendada:

- `PlaceMembershipModule` fica responsavel por planos/socios;
- `PlaceFinancePackagesModule` fica responsavel por turmas, creditos, passes e mapa de ofertas;
- o card informativo `Planos de socio` deve virar resumo compacto ou sair para nao duplicar formulario/lista.

### FIN-05 - Recebiveis com status mais claro

Objetivo:

- diferenciar cobranca aberta de cadastro/contrato aguardando validacao.

Aceite:

- `pending_approval` nao parece pagamento comum;
- CTA e microcopy indicam proximo passo real.

### FIN-06 - Pagos com filtros e totais

Objetivo:

- transformar `Pagos` em conferencia util.

Aceite:

- total pago visivel;
- filtros por origem;
- estado vazio orientativo.

### FIN-07 - Despesas com resumo do periodo

Objetivo:

- manter lancamento rapido, mas adicionar leitura minima.

Aceite:

- total do periodo;
- quantidade de despesas;
- formulario segue acima da lista.

### FIN-08 - QA financeiro por persona

Cenarios:

- papel financeiro acessa Receber, Pagos, Despesas, Resumo;
- gestor abre Financeiro a partir de Trabalho Hoje;
- jogador ve pagamentos pessoais apenas em Agenda;
- recepcao nao ve financeiro amplo;
- caixa fica em Cantina;
- rotas legadas continuam funcionando.

Viewports:

- mobile 390px;
- mobile 430px;
- desktop 1366px;
- desktop amplo.

## Guardrails

- Nao mover financeiro pessoal para Financeiro do local.
- Nao colocar Cantina dentro de Financeiro.
- Nao colocar Clientes dentro de Financeiro.
- Nao deixar Planos competir com Receber como primeira tela.
- Nao remover rotas existentes.
- Nao relaxar permissao de `canManageFinance`.
- Nao criar backend novo para esta rodada.
- Nao duplicar loaders.
- Nao criar ERP generico.

## Conclusao

O Financeiro esta mais maduro que Clientes estava, mas ainda precisa da mesma limpeza de arquitetura de navegacao. A mudanca principal nao e visual: e transformar a tela em fluxo de trabalho.

Prioridade de execucao recomendada:

1. esconder/substituir tabbar interna por navegacao contextual preservando rotas;
2. criar primeira dobra contextual por visao;
3. reduzir duplicidade em `Planos`;
4. melhorar `Recebiveis` para status pendente/aprovacao;
5. fortalecer `Pagos` e `Despesas`;
6. validar por papel financeiro, gestor, jogador, recepcao e caixa.
