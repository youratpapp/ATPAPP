# Profile And Plan Access Model

Fonte principal: `CURRENT_PRODUCT_STATE.md`, `FRONTEND_UX_REARCHITECTURE.md`, `SCREEN_RESPONSIBILITIES.md`.

Data: 2026-05-13

## Objetivo

Definir quem ve o que, por que ve e qual entrada operacional cada perfil deve receber.

Este arquivo existe para impedir que o app volte a parecer "todas as ferramentas para todo mundo".

## Principio central

```text
Usuario nao navega por modulo tecnico. Usuario navega por intencao, perfil e permissao.
```

O produto deve separar:

- jogar;
- organizar;
- operar;
- configurar;
- publicar;
- analisar.

## Regra de exposicao de ferramentas

Antes de mostrar qualquer botao, menu, atalho ou formulario, validar:

- `Free Player`: pode consumir/participar, mas nao deve criar operacao profissional de local.
- `Competition Organizer`: pode criar e operar competicoes, mas nao deve receber ferramentas de academia/clube por padrao.
- `Coach Solo`: pode operar aulas, alunos, agenda e mensalidades simples.
- `Academy/Club`: pode criar e operar local conforme plano e permissao.
- `Staff`: ve apenas rotinas permitidas pelo papel no local.

Regra pratica:

```text
Se a acao cria ou configura uma operacao profissional, ela nao pertence ao Player App generico. Ela deve viver em contexto de gestao/onboarding e exigir plano/permissao.
```

Guardrail atual:

- Criacao profissional de local usa `app_user_product_entitlements`.
- A UI consulta `app_user_can_create_place()` antes de mostrar `Cadastrar local`.
- A criacao deve passar por `app_create_place(...)`, que valida plano, usuario e organizacao.
- A policy `places_owner_insert` tambem exige `app_user_can_create_place()`, bloqueando insert direto de Free Player.
- Ainda falta uma tela comercial/admin para conceder e auditar entitlements; por enquanto seed/demo concede acesso ao owner demo.

## Contextos do produto

### Player App

Para quem:

- usuario comum;
- jogador;
- aluno;
- cliente de academia;
- participante de torneio/liga.

Entrada:

- `/inicio`.

Pode ver:

- proximas partidas;
- reservas;
- aulas;
- pagamentos pessoais;
- torneios/ligas que joga;
- ranking;
- locais publicos;
- perfil.

Nao deve ver:

- `Gestao`;
- CRM;
- cantina;
- equipe;
- financeiro administrativo;
- configuracao de academia;
- relatorios de local.

Regra:

```text
Se o usuario nao tem papel operacional, Gestao nao deve ser uma opcao principal.
```

### Competition Management

Para quem:

- organizador de torneio;
- organizador de liga;
- jogador que contratou plano de organizacao;
- staff de evento.

Entrada:

- `/gestao` deve abrir uma area de "Organizar competicoes" quando este for o unico contexto operacional.
- `/eventos` deve separar "Jogando", "Organizando" e "Descobrir".

Pode ver:

- competicoes organizadas;
- inscricoes;
- classes/categorias;
- partidas;
- resultados;
- jogadores;
- ranking da competicao;
- publicacao;
- configuracao do evento;
- fila operacional da competicao.

Nao deve ver por padrao:

- agenda de quadras de academia;
- CRM de local;
- cantina;
- financeiro completo de academia;
- equipe operacional de academia;
- modulos empresariais irrelevantes.

Regra:

```text
Organizar competicao nao implica operar academia.
```

### Professor Autonomo

Para quem:

- professor que atende em condominio;
- professor com poucas quadras parceiras;
- professor sem recepcao/equipe;
- profissional que precisa gerir agenda, alunos e mensalidades simples.

Entrada:

- `/gestao` deve abrir "Minha operacao de aulas" quando este for o unico contexto operacional.

Pode ver:

- agenda de aulas;
- alunos;
- turmas;
- chamadas;
- faltas e reposicoes;
- mensalidades simples;
- quadras utilizadas;
- disponibilidade;
- perfil publico do professor;
- torneios/ligas se o plano permitir.

Nao precisa ver:

- cantina;
- equipe extensa;
- CRM pesado;
- relatorios empresariais complexos;
- configuracao multiunidade;
- financeiro completo de clube.

Regra:

```text
Professor precisa de operacao leve, nao ERP de academia.
```

### Academia / Clube

Para quem:

- dono;
- gerente;
- recepcao;
- coordenador de aulas;
- financeiro;
- operador com permissao por modulo.

Entrada:

- `/gestao`.

Pode ver conforme permissao/plano:

- agenda;
- quadras;
- reservas;
- aulas;
- alunos;
- professores;
- CRM;
- financeiro;
- mensalidades;
- cantina;
- equipe;
- permissoes;
- relatorios;
- publicacao;
- torneios e ligas.

Regra:

```text
Academia ve Management OS completo, mas cada pessoa da equipe ve apenas sua rotina.
```

## Tipos de plano

### Free Player

Inclui:

- Player App;
- descoberta;
- inscricoes;
- reservas/partidas pessoais;
- ranking pessoal.

Nao inclui:

- Gestao;
- criacao profissional de torneios;
- operacao de local.

### Competition Organizer

Inclui:

- criacao de torneios/ligas;
- inscricoes;
- chave/tabela;
- resultados;
- ranking;
- publicacao;
- comunicacao basica;
- agenda de partidas do evento.

Nao inclui:

- CRM de academia;
- cantina;
- folha/equipe de local;
- financeiro operacional completo de academia.

### Coach Solo

Inclui:

- alunos;
- turmas;
- agenda;
- mensalidades simples;
- chamada;
- reposicoes;
- quadras utilizadas;
- perfil publico do professor.

Adicionais opcionais:

- competicoes;
- pagamentos online;
- relatorios simples.

Nao inclui por padrao:

- cantina;
- equipe com multiplos papeis;
- multiunidade;
- CRM avancado.

### Academy Starter

Inclui:

- quadras;
- reservas;
- aulas;
- professores;
- alunos;
- publicacao;
- financeiro basico.

Nao inclui por padrao:

- cantina;
- CRM avancado;
- relatorios avancados;
- permissoes granulares extensas.

### Academy Pro

Inclui:

- todos os modulos de academia;
- CRM;
- financeiro completo;
- cantina;
- equipe/permissoes;
- relatorios;
- competicoes;
- publicacao;
- integracoes.

## Papeis operacionais

### Owner

Ve:

- tudo que o plano permite.

Pode:

- configurar plano;
- gerenciar equipe;
- acessar financeiro;
- publicar;
- alterar regras.

### Manager

Ve:

- operacao diaria;
- agenda;
- clientes;
- academia;
- financeiro se permitido;
- relatorios operacionais.

Nao deve:

- alterar plano/permissoes estruturais sem permissao.

### Front Desk

Ve:

- agenda;
- reservas;
- lista de espera;
- check-in;
- cadastro rapido;
- pagamentos simples.

Nao ve:

- configuracao profunda;
- relatorios sensiveis;
- equipe/permissoes.

### Coach

Ve:

- minhas aulas;
- meus alunos;
- chamada;
- faltas/reposicoes;
- evolucao;
- disponibilidade.

Nao ve:

- financeiro completo;
- cantina;
- CRM geral;
- equipe.

Status:

- [feito] `/gestao` usa o papel `coach` como gate seguro para uma entrada leve de professor.
- [feito] Professor ve `Minha operacao de aulas` com aulas de hoje, turmas e alunos.
- [feito] Atalhos do professor levam apenas para o modulo Academia, sem cantina/equipe/financeiro completo.
- [feito] Fila agregada da Gestao filtra pendencias por modulo acessivel antes de mostrar ao usuario.
- [feito] Rows internas de locais para professor priorizam `Abrir aulas` e `Alunos`, sem expor pagina publica/setup completo como caminho principal.
- [feito] Recepcao tem entrada proporcional com `Abrir agenda` e `Aulas`; gestor/dono mantem `Abrir operacao` e pagina publica.

### Finance

Ve:

- recebiveis;
- despesas;
- mensalidades;
- vendas;
- caixa;
- relatorios.

Nao precisa ver:

- agenda detalhada;
- chat;
- configuracao esportiva.

### Competition Staff

Ve:

- competicoes atribuidas;
- inscricoes;
- partidas;
- resultados;
- publicacao;
- jogadores.

Nao ve:

- gestao de academia sem vinculo.

## Regras de visibilidade

### Regra 1 - Entrada de Gestao e contextual

Se o usuario tem apenas plano de competicao:

```text
Gestao -> Organizar competicoes
```

Se o usuario e professor solo:

```text
Gestao -> Minha agenda e alunos
```

Se o usuario tem academia:

```text
Gestao -> Central operacional da academia
```

Se o usuario e apenas jogador:

```text
Gestao nao aparece.
```

Status:

- [feito] `/eventos` nao mostra mais roteiro grande de organizador para jogador comum; `Organizar evento` permanece como opcao contextual em `Descobrir`.

### Regra 2 - Modulo so aparece se houver permissao e utilidade

Nao basta o backend permitir. O modulo precisa fazer sentido para:

- plano;
- papel;
- local/unidade;
- estado de setup.

### Regra 3 - Configuracao nao e descoberta

Cadastrar quadra/professor/turma deve aparecer como tarefa semanticamente clara:

- "Cadastrar quadra";
- "Cadastrar professor";
- "Criar turma";
- "Abrir reservas";
- "Publicar pagina".

Nao como:

- "Agenda > Recursos";
- "Academia > Recursos";
- "Ajustes > Configurar".

### Regra 4 - Setup vem antes de modulo vazio

Quando o modulo depende de base operacional:

- sem quadra: sugerir cadastrar quadra;
- sem professor: sugerir cadastrar professor;
- sem turma: sugerir criar turma;
- sem pagina publicada: sugerir publicar pagina.

### Regra 5 - Plano explica ausencia

Se uma ferramenta nao aparece por plano, nao esconder de forma confusa. Mostrar upgrade somente quando:

- usuario esta em contexto relacionado;
- beneficio e claro;
- nao bloqueia tarefa basica.

## Cadastro de professor: dados adequados

Campo minimo:

- nome;
- telefone;
- email;
- modalidade;
- tipo de vinculo;
- permissao de acesso;
- disponibilidade base.

Campos operacionais recomendados:

- cor/identificacao na agenda;
- turmas vinculadas;
- quadras preferenciais;
- valor/hora ou comissao;
- pode receber aula avulsa;
- aceita reposicao;
- bio curta/publica;
- foto opcional.

Campos avancados, nao obrigatorios no primeiro cadastro:

- documentos;
- dados bancarios;
- contrato;
- certificacoes;
- redes sociais;
- regras de repasse;
- bloqueios recorrentes.

Regra UX:

```text
Cadastro inicial do professor deve liberar agenda. Dados financeiros/publicos entram depois.
```

## Cadastro de quadra: dados adequados

Campo minimo:

- nome da quadra;
- modalidade;
- ativa/inativa;
- preco base ou sem preco;
- disponibilidade inicial.

Campos operacionais recomendados:

- tipo de piso;
- cobertura;
- iluminacao;
- duracao padrao;
- politica de cancelamento;
- intervalo entre reservas;
- janela de antecedencia.

Campos avancados:

- precos por horario;
- bloqueios recorrentes;
- integracao de acesso;
- manutencao;
- regras por plano de socio.

Regra UX:

```text
Cadastrar quadra deve ser uma quick action visivel no setup, nao uma configuracao escondida.
```

## Decisao de produto

O proximo salto de qualidade nao e adicionar novas features.

E fazer cada usuario sentir:

```text
Este sistema foi feito para meu trabalho especifico.
```
