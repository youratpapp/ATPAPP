# Work SaaS V5 Implementation Queue - 2026-05-22

Status: queue proposta. Nao executar antes de validacao do manual V5.

Regra: cada sprint deve preservar funcao existente, rota antiga, permissao e QA por persona.

## 0. Sprint Packet Obrigatorio

Cada item precisa abrir com:

```text
ID:
Objetivo:
Persona primaria:
Personas secundarias:
Superficie:
Rotas afetadas:
Rotas preservadas:
Arquivos provaveis:
Dados/RPCs:
Permissoes:
Estados:
Mobile:
Desktop:
Nao alterar:
Criterios de aceite:
QA:
Rollback:
Docs a atualizar:
```

## 1. Fase A - Fundacao De SaaS

### V5-A01 - Taxonomia Final E Aliases

Objetivo: congelar labels, rotas e destinos sem alterar backend.

Entregas:

- mapa antigo -> novo;
- aliases/wrappers preservados;
- labels consistentes: Calendario, Reservas, Aulas, Pessoas, Receita, Loja/POS, Competicoes, Relatorios, Administracao.

Aceite:

- nenhuma rota publica quebra;
- nenhum menu mostra grupo vazio;
- docs e codigo usam mesma nomenclatura visivel.

### V5-A02 - Shell Web Trabalho SaaS

Objetivo: criar estrutura web profissional com topbar, organizacao/unidade, breadcrumb, sidebar por dominio e area de pagina.

Aceite:

- multiunidade entende unidade ativa;
- sidebar nao parece mobile adaptado;
- pagina nao repete contexto desnecessario;
- desktop 1366 e wide confortaveis.

### V5-A03 - Shell Mobile Trabalho Operacional

Objetivo: mobile trabalho deixa de renderizar mini web.

Aceite:

- professor, recepcao, financeiro, caixa, gestor e organizador tem primeira dobra propria;
- CTA principal aparece em 390px;
- acoes complexas oferecem "abrir no web".

## 2. Fase B - Operacao Do Local

### V5-B01 - Calendario Operacional First-Class

Objetivo: calendario como mapa de tempo do local.

Inclui:

- hora cheia;
- camadas;
- filtros por unidade/quadra/professor/status;
- professor day view;
- detalhe de slot.

Aceite:

- Reservas nao exibe filtros de professor/turma como foco;
- Quadra 6+ nao quebra layout;
- calendario serve reservas e aulas sem confundir.

### V5-B02 - Reservas Como Ciclo De Vida

Objetivo: reserva da criacao ao pagamento/reagendamento/cancelamento.

Inclui:

- CTA Nova reserva;
- detail drawer/sheet;
- editar admin;
- WhatsApp profissional;
- link seguro de reagendamento;
- pagamento stub.

Aceite:

- horario ocupado nao oferece criar reserva;
- acao de WhatsApp nao substitui regra de reserva;
- reserva paga/pendente/cancelada clara.

### V5-B03 - Aulas Professor-First

Objetivo: aulas organizadas por dia, turma, aluno e reposicao.

Inclui:

- chamada opcional default off;
- professor mobile sem ERP;
- aluno detail responsivo;
- reposicoes como fila clara;
- professores fora de Aulas e dentro de Pessoas/Equipe.

Aceite:

- professor sabe sua proxima aula em 10 segundos;
- gestor ainda configura turmas no web;
- 77 pendencias viram fila explicada e clicavel.

### V5-B04 - Pessoas Unificadas

Objetivo: substituir mentalmente Clientes por Pessoas.

Inclui:

- Leads;
- Clientes ativos;
- Alunos;
- Socios;
- Staff;
- timeline;
- acoes contextuais.

Aceite:

- leads e clientes ativos separados;
- recepcao encontra pessoa rapido;
- aluno/socio nao se perde entre modulos.

## 3. Fase C - Receita, POS E Admin

### V5-C01 - Receita E Modal Unico De Pagamento

Objetivo: dinheiro do local em Receita e pagamentos pessoais fora dela.

Inclui:

- receber;
- pagos;
- despesas;
- planos/pacotes;
- resumo;
- payment stub unico.

Aceite:

- financeiro nao precisa entrar em Aulas/Reservas para cobrar;
- todo ponto com valor abre o mesmo modal;
- ledger reflete pagamento.

### V5-C02 - Loja/POS

Objetivo: caixa vende rapido e web cuida de produtos/estoque.

Aceite:

- cashier mobile inicia em Vender;
- produto/estoque nao bloqueiam venda;
- POS nao vira financeiro amplo.

### V5-C03 - Administracao E Relatorios

Objetivo: separar setup, permissoes, recursos, regras e relatorios da rotina.

Aceite:

- owner encontra tudo;
- usuario sem permissao nao ve atalhos;
- acoes destrutivas ficam em Avancado;
- relatorios nao aparecem como card operacional.

## 4. Fase D - Competition OS

### V5-D01 - Hub Trabalho De Competicoes

Objetivo: organizador ve competicoes por fase e bloqueio.

Aceite:

- `/eventos` continua Player;
- trabalho competicoes nao parece descoberta publica;
- sem local ainda pode organizar se produto permitir.

### V5-D02 - Torneio Operacional Por Fase

Objetivo: cockpit de torneio por rascunho, inscricoes, jogos, andamento e final.

Aceite:

- cada fase tem CTA dominante;
- papel filtra acoes;
- jogador nao ve admin;
- staff nao perde ferramentas.

### V5-D03 - Liga Operacional Por Fase

Objetivo: owner e participante separados.

Aceite:

- participante ve rodada atual, adversario, chat, resultado e ranking;
- owner ve pendencias, participantes, resultados e proxima rodada;
- historico nao compete com rodada ativa.

## 5. Fase E - Player Boundary E QA

### V5-E01 - Player App Boundary

Objetivo: garantir que crescimento do SaaS nao contamine jogador.

Aceite:

- menu Player simples;
- Trabalho nao aparece como card de conteudo;
- agenda pessoal engloba aulas/pagamentos pessoais sem duplicar menu.

### V5-E02 - QA Real Por Persona

Objetivo: validar fluxos reais, nao apenas telas.

Cenarios:

- jogador puro reserva;
- aluno ve aula/pagamento;
- socio reserva com plano;
- competitivo informa resultado;
- professor usa agenda/aula;
- recepcao cria/edita/cancela reserva;
- financeiro cobra/marca pago/despesa;
- caixa vende;
- gestor multiunidade resolve bloqueio;
- torneio do inicio ao fim;
- liga com rodada e resultado;
- organizador independente;
- staff scorekeeper/checkin/media.

Viewports:

- mobile 390;
- mobile 430;
- desktop 1366;
- desktop wide.

## 6. Ordem Recomendada

1. V5-A01
2. V5-A02
3. V5-A03
4. V5-B01
5. V5-B02
6. V5-B03
7. V5-B04
8. V5-C01
9. V5-C02
10. V5-C03
11. V5-D01
12. V5-D02
13. V5-D03
14. V5-E01
15. V5-E02

## 7. Nao Executar Antes De Decidir

Decisoes criticas pendentes:

1. `Pessoas`: entidade unificada real agora ou indice composto sobre dados atuais?
2. `Receita`: label final visivel sera Receita, Financeiro, ou Receita/Financeiro?
3. `Calendario`: sera pagina unificada com camadas ou calendario por dominio com componente compartilhado?
4. `Relatorios`: criar shell agora vazio/gradual ou deixar para fase posterior?
5. `Organizador sem local`: contexto de trabalho pessoal ou organizacao independente?

## 8. Definicao De Done Global

So considerar a migracao concluida quando:

- cada funcao atual tem caminho claro;
- web trabalho parece SaaS completo;
- mobile trabalho parece ferramenta operacional;
- Player App continua simples;
- rotas publicas preservadas;
- permissoes preservadas;
- configuracao e relatorio fora da rotina;
- nenhuma tela tem menu externo + submenu + cards duplicados para a mesma funcao;
- QA real por persona passa.
