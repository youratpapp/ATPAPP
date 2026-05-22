# Work SaaS V5 Acceptance QA Matrix - 2026-05-22

Status: matriz de aceite e QA para validar implementacao futura.

Regra: uma sprint nao passa apenas por build/lint. Ela passa quando a persona conclui o trabalho com clareza.

## 1. Viewports Obrigatorios

| Viewport | Uso |
| --- | --- |
| mobile 390px | Android compacto |
| mobile 430px | mobile maior |
| desktop 1366px | notebook comum |
| desktop wide | monitor grande |

## 2. Checks Globais

Em toda tela:

- console sem erro;
- network sem erro inesperado;
- rota antiga preservada;
- permissao preservada;
- modo ativo claro;
- unidade/competicao ativa clara;
- CTA primario visivel;
- configuracao rara fora da rotina;
- relatorio fora da operacao diaria;
- estado vazio orienta proximo passo;
- mobile sem web esmagado;
- desktop usa largura de forma util.

## 3. QA Jogador Puro

### Cenario 1: Reservar Quadra

Passos:

1. login seed jogador sem staff;
2. abrir Inicio;
3. ir para Jogar;
4. reservar quadra;
5. escolher horario livre;
6. confirmar/pagar stub;
7. abrir Minha Rotina.

Esperado:

- nao aparece Trabalho;
- reserva aparece em Minha Rotina;
- pagamentos pessoais nao abrem Receita;
- sucesso tem proximo passo.

### Cenario 2: Competir

Passos:

1. abrir Competir;
2. entrar em torneio/liga;
3. ver proximo jogo/classificacao.

Esperado:

- nao aparece organizacao;
- nao aparece gerar jogos;
- contexto jogador claro.

## 4. QA Aluno

Passos:

1. login aluno matriculado;
2. abrir Inicio;
3. verificar proxima aula;
4. abrir Minha Rotina > Aulas;
5. verificar pagamento pessoal;
6. avisar falta se permitido.

Esperado:

- aula visivel sem procurar em Trabalho;
- professor/turma/quadra claros;
- pagamento pessoal separado.

## 5. QA Professor

Passos:

1. login professor;
2. trocar para Trabalho;
3. mobile 390;
4. ver Hoje;
5. abrir proxima aula;
6. verificar alunos/turma/quadra;
7. chamada aparece apenas se configuracao ligada;
8. registrar observacao/progresso.

Esperado:

- nao ve Receita/POS/Admin;
- agenda por hora cheia;
- nao cai em ERP.

## 6. QA Recepcao

Passos:

1. login frontdesk;
2. abrir Trabalho;
3. ver reservas do dia;
4. criar nova reserva;
5. editar reserva;
6. cancelar reserva;
7. enviar WhatsApp troca/cancelamento;
8. buscar pessoa.

Esperado:

- CTA Nova reserva claro;
- horario ocupado nao cria reserva;
- WhatsApp profissional;
- configuracao de quadras/regras fora da rotina.

## 7. QA Financeiro

Passos:

1. login finance;
2. abrir Trabalho;
3. cair em Receber;
4. filtrar vencidos;
5. enviar lembrete;
6. marcar pago;
7. ver em Pagos;
8. criar despesa;
9. abrir Resumo.

Esperado:

- nao ve aulas/POS como rotina;
- modal de pagamento unico;
- receita local separada de pagamentos pessoais.

## 8. QA Caixa

Passos:

1. login cashier;
2. abrir Trabalho mobile;
3. cair em Vender;
4. selecionar produto;
5. finalizar venda;
6. ver vendas do dia;
7. abrir estoque baixo.

Esperado:

- venda em poucos toques;
- nao ve financeiro amplo;
- produtos so se autorizado.

## 9. QA Gestor Unidade

Passos:

1. login manager/owner;
2. abrir Trabalho desktop;
3. selecionar unidade;
4. ver bloqueios por dominio;
5. abrir maior bloqueio;
6. resolver;
7. abrir relatorio;
8. abrir Admin.

Esperado:

- unidade ativa clara;
- rotina antes de setup;
- relatorio separado;
- admin fora da primeira dobra.

## 10. QA Multiunidade

Passos:

1. login owner com mais de uma unidade;
2. abrir Trabalho;
3. ver lista consolidada;
4. trocar unidade;
5. confirmar que sidebar/rotas/dados mudam;
6. voltar para consolidado.

Esperado:

- nao mistura dados de unidades;
- unidade ativa sempre visivel;
- mobile mostra resumo, nao tudo.

## 11. QA Organizador

Passos:

1. login organizer sem local;
2. abrir Trabalho;
3. ver Competicoes;
4. criar torneio/liga ou abrir existente;
5. resolver fase atual.

Esperado:

- nao precisa de local se produto permitir;
- nao cai em descoberta publica;
- Player Competir continua separado.

## 12. QA Torneio E2E

Passos:

1. criar torneio;
2. configurar basico/classes;
3. abrir inscricoes;
4. criar/receber inscricoes;
5. marcar pagamentos;
6. encerrar inscricoes;
7. gerar jogos;
8. publicar;
9. lancar resultados como admin/scorekeeper;
10. testar resultado por jogador;
11. finalizar;
12. publicar final.

Esperado:

- cada fase tem CTA;
- staff ve apenas o permitido;
- acoes perigosas em avancado.

## 13. QA Liga E2E

Passos:

1. criar liga;
2. configurar classes/regras;
3. abrir participantes;
4. aprovar inscricoes;
5. gerar rodada;
6. participante ve adversario;
7. jogador informa resultado;
8. owner confirma/resolve;
9. gerar proxima rodada;
10. finalizar temporada.

Esperado:

- owner e participante separados;
- rodada ativa domina primeira dobra;
- historico nao compete.

## 14. QA Pessoas

Passos:

1. criar lead;
2. registrar contato;
3. enviar WhatsApp;
4. converter lead;
5. matricular aluno ou associar plano;
6. abrir pessoa como aluno/socio;
7. verificar timeline.

Esperado:

- Leads e Clientes ativos separados;
- pessoa nao fica duplicada mentalmente;
- acoes contextuais claras.

## 15. QA Receita/Pagamento Stub

Passos:

1. gerar valor por reserva;
2. gerar valor por mensalidade;
3. gerar valor por inscricao;
4. abrir modal;
5. marcar pago;
6. verificar objeto;
7. verificar Receita > Pagos.

Esperado:

- mesmo modal;
- origem clara;
- pagador claro;
- pagamento aparece no ledger certo.

## 16. QA Regressao De Rotas

Rotas obrigatorias:

- `/inicio`
- `/locais`
- `/locais/:placeId`
- `/locais/:placeId/admin`
- `/gestao`
- `/gestao/:placeId`
- `/gestao/:placeId/:module`
- `/agenda`
- `/minhas-reservas`
- `/minhas-partidas`
- `/minhas-aulas`
- `/meus-pagamentos`
- `/eventos`
- `/eventos/torneios`
- `/eventos/ligas`
- `/eventos/:tournamentId/jogos`
- `/eventos/:tournamentId/classificacao`
- `/eventos/:tournamentId/organizacao`
- `/eventos/:tournamentId/jogadores`
- `/eventos/:tournamentId/chat`
- `/eventos/ligas/:leagueId`
- `/inscricao/:tournamentId`
- `/join/:tournamentId`
- `/t/:tournamentId`
- `/reservas/alteracao/:token`

Esperado:

- todas abrem ou redirecionam para wrapper correto;
- query params importantes preservados;
- links publicos continuam funcionando.

## 17. Bugs Que Devem Ser Bloqueantes

- dois menus com os mesmos itens na mesma dobra;
- botao branco sem contraste;
- texto sobreposto;
- calendario quebrando coluna sem necessidade;
- modal sem responsividade;
- CTA para acao impossivel;
- funcao diaria escondida em Mais;
- setup raro como card principal;
- admin vazando para jogador;
- financeiro pessoal misturado com Receita;
- console error em acao primaria.

