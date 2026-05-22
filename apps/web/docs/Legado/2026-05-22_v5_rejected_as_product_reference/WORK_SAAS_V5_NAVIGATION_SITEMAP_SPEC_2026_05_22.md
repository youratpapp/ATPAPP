# Work SaaS V5 Navigation Sitemap Spec - 2026-05-22

Status: mapa de navegacao alvo para SaaS web, mobile trabalho e Player App.

Regra: sitemap alvo nao exige quebrar rotas atuais. A implementacao deve preservar aliases e wrappers.

## 1. Principios

1. Menu principal e dominio, nao acao.
2. Acoes ficam no contexto do objeto.
3. Configuracao e relatorio nao competem com rotina.
4. Mobile trabalho nao replica desktop.
5. Player nao mostra ferramentas de trabalho no conteudo.
6. Unidade ativa e modo ativo precisam ser visiveis.

## 2. SaaS Web Trabalho - Sitemap Alvo

```text
Trabalho
  Hoje
  Convites e acessos pendentes

Organizacao
  Unidades
  Visao consolidada
  Padroes da organizacao

Operacao
  Calendario
    Dia
    Semana
    Camadas
    Conflitos
  Reservas
    Lista
    Nova reserva
    Lista de espera
    Reagendamentos
  Aulas
    Hoje
    Turmas
    Alunos
    Reposicoes
    Agenda professor
  Loja/POS
    Vender
    Vendas do dia
    Estoque
    Produtos

Pessoas
  Todas as pessoas
  Leads
  Clientes ativos
  Alunos
  Socios
  Staff/Professores
  Timeline/Atendimentos

Receita
  Receber
  Pagos
  Despesas
  Planos e pacotes
  Resumo

Competicoes
  Torneios
  Ligas
  Publicacao
  Staff de eventos

Relatorios
  Operacao
  Ocupacao
  Receita
  Pessoas
  Aulas
  POS
  Competicoes

Administracao
  Equipe
  Permissoes
  Recursos
  Regras
  Dados publicos
  Publicacao do local
  Integracoes futuras
  Avancado
```

## 3. Web Sidebar Por Papel

### Owner / Manager

Mostra:

- Trabalho > Hoje
- Organizacao se multiunidade
- Operacao: Calendario, Reservas, Aulas, Loja/POS se plano permitir
- Pessoas
- Receita
- Competicoes se organiza
- Relatorios
- Administracao

Nao mostra:

- nada proibido por plano/permissao.

### Professor

Mostra:

- Trabalho > Hoje
- Operacao > Calendario/Aulas
- Pessoas > Alunos vinculados
- Conta

Nao mostra:

- Receita;
- Loja/POS;
- Equipe;
- Ajustes;
- Relatorios executivos.

### Recepcao

Mostra:

- Trabalho > Hoje
- Operacao > Calendario, Reservas, Aulas
- Pessoas > Todas/Leads/Clientes
- Conta

Nao mostra:

- Administracao estrutural;
- Receita ampla, salvo permissao extra;
- POS, salvo permissao extra.

### Financeiro

Mostra:

- Trabalho > Hoje
- Receita > Receber, Pagos, Despesas, Planos/Pacotes, Resumo
- Pessoas consulta limitada se necessario para cobranca
- Conta

Nao mostra:

- Aulas como rotina;
- Reservas como rotina;
- POS como rotina;
- Equipe/Ajustes.

### Caixa

Mostra:

- Trabalho > Hoje
- Loja/POS > Vender, Hoje, Estoque, Produtos
- Conta

Nao mostra:

- Receita ampla;
- Aulas;
- Reservas;
- Admin.

### Organizador Independente

Mostra:

- Trabalho > Hoje
- Competicoes > Torneios, Ligas, Publicacao
- Relatorios de competicao se houver
- Conta

Nao mostra:

- Unidades/quadras/receita de local se nao possui local.

### Scorekeeper / Check-in / Media

Mostra somente contexto da competicao:

- Hoje do evento;
- jogos/resultados ou inscritos/check-in ou publicacao;
- chat/avisos;
- perfil.

## 4. Mobile Trabalho Sitemap

### Professor

```text
Hoje
Agenda
Turmas
Alunos
Perfil
```

`Hoje`:

- proxima aula;
- aulas restantes;
- reposicoes/avisos.

`Agenda`:

- dia por hora cheia;
- turma, quadra e alunos.

### Recepcao

```text
Hoje
Reservas
Pessoas
Aulas
Mais
```

`Hoje`:

- reservas do dia;
- lista de espera relevante;
- atendimento pendente.

`Mais`:

- trocar unidade;
- abrir web;
- perfil;
- admin permitido.

### Financeiro

```text
Receber
Pagos
Despesas
Resumo
Perfil
```

### Caixa

```text
Vender
Hoje
Estoque
Produtos
Perfil
```

### Gestor

```text
Hoje
Calendario
Aulas
Receita
Mais
```

### Organizador

```text
Hoje
Torneios
Ligas
Avisos
Perfil
```

## 5. Player App Sitemap

```text
Inicio
Jogar
Competir
Minha Rotina
Perfil
```

### Inicio

- proxima acao pessoal;
- cards simples.

### Jogar

- reservar quadra;
- encontrar jogo;
- encontrar aulas;
- locais.

### Competir

- torneios;
- ligas;
- ranking;
- meus jogos.

### Minha Rotina

- tudo;
- reservas;
- partidas;
- aulas;
- pagamentos pessoais;
- historico.

### Perfil

- dados pessoais;
- preferencias;
- conta;
- entrada para Trabalho apenas via seletor global, se profissional.

## 6. Mapa De Rotas Alvo E Compatibilidade

| Rota atual | Uso atual | Rota/area alvo | Preservar como |
| --- | --- | --- | --- |
| `/gestao` | trabalho hoje | `/trabalho` | alias/wrapper |
| `/gestao/:placeId` | admin local | `/trabalho/unidades/:placeId` | alias/wrapper |
| `/gestao/:placeId/agenda` | bookings/calendario | `/trabalho/unidades/:placeId/calendario` ou reservas | alias com query |
| `/gestao/:placeId/academia` | aulas | `/trabalho/unidades/:placeId/aulas` | alias |
| `/gestao/:placeId/pessoas` | clientes | `/trabalho/unidades/:placeId/pessoas` | alias |
| `/gestao/:placeId/receita` | financeiro | `/trabalho/unidades/:placeId/receita` | alias |
| `/gestao/:placeId/cantina` | POS | `/trabalho/unidades/:placeId/pos` | alias |
| `/gestao/:placeId/equipe` | team | `/trabalho/unidades/:placeId/admin/equipe` | alias |
| `/gestao/:placeId/ajustes` | settings | `/trabalho/unidades/:placeId/admin` | alias |
| `/locais/:placeId/admin` | legado admin | target de unidade | wrapper |
| `/eventos` | player competir | manter Player | rota atual |
| `/eventos?modo=organizing` | organizador | `/trabalho/competicoes` | alias |
| `/eventos/:id/organizacao` | torneio admin | tournament cockpit | rota preservada |
| `/eventos/ligas/:id` | liga participante/owner | split por modo | rota preservada |
| `/agenda` | rotina pessoal | Player Minha Rotina | rota atual |
| `/minhas-*` | aliases pessoais | Player Minha Rotina filtrada | alias |

## 7. Regras De Exibicao

### Nao Mostrar Grupo Se

- nao ha permissao;
- plano nao inclui;
- nao existe funcao ativa;
- e irrelevante para o papel principal.

### Nao Esconder Em Mais Se

- e tarefa diaria;
- e principal para o papel;
- e alerta urgente.

### Pode Ir Para Mais Se

- troca unidade;
- abrir web;
- perfil;
- configuracao permitida;
- relatorio permitido;
- suporte.

## 8. Regras De Nomes

| Evitar | Usar |
| --- | --- |
| Fluxo | Reservar, Cobrar, Lancar resultado |
| Clientes como guarda-chuva total | Pessoas |
| Financeiro pessoal/local misturado | Minha Rotina Pagamentos vs Receita |
| Agenda ambiguo no Trabalho | Calendario operacional |
| Aulas com professores/admin | Aulas para turmas/alunos; Equipe para professores |
| Trabalho dentro do Player como card | seletor global Jogador/Trabalho |

