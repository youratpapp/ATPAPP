# Personas Operacionais

Fonte principal: `product-architecture-ux-audit.md`.

Data: 2026-05-13

## Objetivo

Garantir que cada ferramenta tenha dono de fluxo. Uma funcionalidade sem persona clara tende a virar botao escondido ou bloco embolado.

## Jogador casual

Objetivo:

- achar quadra;
- entrar em jogo;
- confirmar agenda;
- pagar/acompanhar compromissos.

Acoes frequentes:

- reservar;
- entrar em jogo aberto;
- confirmar presenca;
- compartilhar com amigos.

Risco cognitivo:

- informacao administrativa demais.

Regra de design:

- mobile-first, uma decisao por vez, CTAs claros.

## Jogador competitivo

Objetivo:

- competir;
- acompanhar partidas;
- ver ranking;
- registrar ou conferir resultado.

Acoes frequentes:

- inscrever em torneio/liga;
- ver minhas partidas;
- confirmar presenca;
- acompanhar ranking.

Risco:

- proxima partida duplicada ou escondida em resumo geral.

Regra:

- contexto por classe/rodada sempre visivel.

## Recepcao/frontdesk

Objetivo:

- resolver operacao diaria rapidamente.

Acoes frequentes:

- confirmar reserva;
- criar reserva;
- promover lista de espera;
- registrar pagamento;
- avisar cliente.

Risco:

- tela com relatorio e configuracao antes da fila.

Regra:

- fila de trabalho primeiro, detalhe em drawer.

## Professor

Objetivo:

- dar aula e registrar presenca/evolucao.

Acoes frequentes:

- ver turmas do dia;
- marcar presenca/falta;
- consultar aluno;
- registrar reposicao ou observacao.

Risco:

- financeiro e CRM poluindo chamada.

Regra:

- foco em turma, aluno, chamada e evolucao.

## Gestor/dono do clube

Objetivo:

- entender saude operacional, receita, equipe e crescimento.

Acoes frequentes:

- ver indicadores;
- resolver gargalos;
- configurar oferta;
- acompanhar financeiro;
- publicar links.

Risco:

- painel bonito que nao resolve rotina.

Regra:

- dashboard explica; fila resolve.

## Financeiro/admin

Objetivo:

- controlar recebiveis, despesas, pacotes e cobrancas.

Acoes frequentes:

- filtrar vencidos;
- enviar lembrete;
- registrar pagamento;
- exportar relatorio;
- acompanhar pacotes/creditos.

Risco:

- cliente/aluno duplicado em varios lugares sem fonte clara.

Regra:

- status financeiro unico, com atalhos contextuais.

## Organizador de torneio

Objetivo:

- operar evento sem confusao no dia.

Acoes frequentes:

- selecionar classe;
- confirmar presenca;
- lancar resultado;
- consultar agenda por quadra;
- publicar chave/podio.

Risco:

- misturar resumo geral, classe e minhas partidas.

Regra:

- recorte ativo antes do resumo; publicacao agrupada.

## Organizador de liga

Objetivo:

- manter temporada em movimento.

Acoes frequentes:

- acompanhar rodada;
- confirmar resultados;
- atualizar classificacao;
- comunicar jogadores.

Risco:

- liga parecer produto separado do torneio.

Regra:

- usar CompetitionShell e linguagem comum.
