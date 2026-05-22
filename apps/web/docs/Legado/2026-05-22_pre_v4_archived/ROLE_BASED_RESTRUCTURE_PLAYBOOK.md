# Role Based Restructure Playbook

Data: 2026-05-15

Fonte: `WHOLE_APP_ROLE_DESIGN_AUDIT_2026_05_14.md`, `CURRENT_PRODUCT_STATE.md`, `SCREEN_RESPONSIBILITIES.md`, `COMPONENT_GRAMMAR.md`, `MOBILE_FRICTION_REPORT.md`, `PROFILE_PLAN_ACCESS_MODEL.md`, screenshots locais em `web/docs/screenshots/whole-app-role-audit-2026-05-14/` e referencias de mercado.

## Objetivo

Guiar a reestruturacao do app inteiro para que cada papel veja somente o que precisa, com menos carga cognitiva, menos empilhamento mobile e mais fluidez operacional.

O app deve continuar poderoso por dentro, mas simples por fora.

## Regra Central

```text
A interface nao deve mostrar a estrutura interna do sistema. Ela deve mostrar a proxima tarefa obvia para aquele usuario naquele contexto.
```

## Experiencias Principais

### Player App

Para jogador comum.

Deve responder:

- o que tenho para fazer agora?
- onde posso jogar?
- onde posso reservar?
- em qual evento/liga posso entrar?
- qual e meu proximo jogo/compromisso?
- como esta meu perfil esportivo?

Nao deve mostrar:

- cockpit de gestao;
- KPIs administrativos;
- CRM;
- cantina;
- financeiro de local;
- configuracao de academia;
- filas operacionais de organizador;
- dados de planos/mensalidades se o jogador nao e aluno/socio.

### Competition OS

Para organizadores e jogadores dentro de competicoes.

Deve separar:

- jogador acompanhando competicao;
- organizador configurando/setup;
- organizador operando inscricoes, jogos, resultados e publicacao.

### Management OS

Para academia/clube, recepcao, professor, financeiro e gestor.

Deve responder:

- qual fila precisa ser limpa agora?
- quais aulas/reservas acontecem hoje?
- quem precisa ser cobrado?
- qual aluno/cliente precisa de acao?
- qual configuracao estrutural esta incompleta?

Nao deve parecer Player App.

## Matriz De Relacao Do Usuario

| Relacao | Superficie principal | O que ve primeiro | O que nao deve ver |
|---|---|---|---|
| Jogador puro | Player App | proximo compromisso e acoes de jogar/reservar/competir | gestao, CRM, financeiro de local, cantina |
| Aluno de academia | Player App + area de aluno | aulas, reposicoes, mensalidade propria, historico | operacao da academia inteira |
| Socio/mensalista | Player App + beneficios | reservas, plano proprio, pagamentos proprios | cobrancas de terceiros, setup |
| Professor | Coach Mode | aulas hoje, turmas, alunos, chamada, agenda | cantina, CRM pesado, financeiro completo |
| Recepcao | Management OS leve | agenda, check-in, pendencias do dia | configuracao avancada, relatorios financeiros amplos |
| Financeiro | Finance Workspace | recebiveis, lembretes, marcar pago, despesas | chamada de aula, setup de quadra como prioridade |
| Organizador | Competition OS | inscricoes, jogos, resultados, publicacao | gestao de academia se nao houver local |
| Gestor | Management OS completo | fila operacional + modulos do local | dados sem permissao/plano |

## Regras De Composicao

1. Uma tela mobile tem uma pergunta principal.
2. Primeira dobra tem no maximo uma acao primaria.
3. Tabs/subnav aparecem antes de resumo/KPIs.
4. Card grande e para entidade relevante ou conversao; rotina diaria e row.
5. Filtros complexos ficam em bottom sheet.
6. Edicao curta fica em drawer/sheet.
7. Setup raro/complexo vira wizard.
8. Operacao recorrente nunca vira wizard.
9. Informacao passiva nao deve parecer pendencia.
10. Conteudo sem plano/permissao nao deve aparecer como modulo ativo.
11. Zeros sem valor operacional devem sumir ou colapsar.
12. Todo estado vazio explica proxima acao.

## Regras De Design

### Player App

- branco/off-white limpo;
- nav simples;
- menos bordas;
- textos curtos;
- cards com imagem apenas para local/evento quando ajuda reconhecimento;
- sticky CTA em inscricao, reserva e confirmacao;
- sheets para filtros e escolhas;
- rows para historico/listas.

### Management OS

- denso, mas organizado;
- subnav e fila antes de metricas;
- rows e tabelas;
- drawers para detalhe;
- KPIs como suporte, nao abertura;
- visual mais utilitario.

### Competition OS

- diferenciar public event, player competition e organizer operation;
- evento publico com imagem/status/tabs/CTA;
- setup em wizard;
- operacao em rows/filas.

## Checklist Antes De Implementar Qualquer Area

Responder:

- Qual papel usa esta tela?
- Qual intencao ele tem aqui?
- Esta informacao ajuda a decidir agora?
- Existe acao primaria clara?
- Alguma coisa e detalhe e deveria ir para drawer/sheet?
- Algum KPI esta aparecendo antes da fila?
- Algum dado de gestor aparece para jogador?
- Algum formulario complexo deveria virar setup wizard?
- Mobile vira empilhamento?
- O estado vazio e acionavel?

## Checklist De Conclusao De Cada Task

- mobile 390px validado;
- desktop validado quando a area for operacional;
- nenhuma funcao existente removida;
- permissoes/plano preservados;
- sem slice silencioso;
- sem acao falsa sem backend;
- MDs atualizados;
- se houver codigo: lint/build.

