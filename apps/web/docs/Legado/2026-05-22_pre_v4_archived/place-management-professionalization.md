# Evolucao da gestao de locais, clubes e academias

Data: 2026-05-12

## Diagnostico

A tela de locais concentra hoje operacoes muito diferentes no mesmo bloco: reservas de quadra, planos de socio, CRM, cantina, financeiro, professores, turmas, presenca, reposicoes e equipe. Isso entrega funcionalidade, mas cria atrito operacional porque cada perfil precisa garimpar a propria tarefa em uma pagina longa.

O resultado percebido e de sistema improvisado: a secretaria procura reservas ao lado de produto de cantina, o professor cruza financeiro para chegar na chamada, e o gestor nao tem uma visao executiva clara antes de entrar no detalhe.

## Referencias de mercado

Sistemas modernos de clubes e academias tendem a vender uma plataforma integrada, mas organizam a operacao por modulos:

- ClubCore posiciona o produto em torno de membros, reservas, aulas, pagamentos e POS, com foco em reduzir trabalho administrativo e dar experiencia simples para equipe e membros.
- MatchPoint destaca modulos separados para console ao vivo, torneios, check-in por QR, pagamentos e receita.
- Playzen separa reserva de quadra, regras configuraveis, memberships, academia, presenca, billing e POS com catalogo visual.
- ProTime Tennis comunica reservas, clientes, pacotes de aulas e pagamentos como areas do fluxo do clube.
- Paddeo descreve um painel administrativo para reservas, torneios, academia, clientes e caixa, enquanto o jogador usa uma experiencia mais direta no app.

Conclusao: o diferencial nao e esconder funcionalidades; e organizar cada uma no contexto de trabalho certo.

## Principios de UX

1. Separar portal publico de cockpit de gestao.
2. Fazer cada perfil cair no modulo que resolve seu dia.
3. Mostrar resumo executivo antes do detalhe operacional.
4. Evitar listas longas misturadas; cada modulo precisa ter foco, contadores e acoes principais.
5. Preservar o jogador em fluxos simples: reservar, entrar em turma, acompanhar pagamentos e seguir local.
6. Dar para a equipe um sistema de trabalho, nao uma vitrine publica com formularios acoplados.

## Arquitetura proposta

### Portal do local

Usado por jogadores, alunos e visitantes:

- Dados do local e marca
- Seguir local
- Reservar quadra
- Ver turmas disponiveis
- Solicitar encaixe ou aula
- Ver planos de socio
- Entrar em partidas abertas
- Contato e WhatsApp

### Cockpit de gestao

Usado por dono, gerente, recepcao e professor:

- **Painel:** hoje, pendencias, receita, alertas e atalhos.
- **Agenda:** quadras, reservas, bloqueios, recorrencias e lista de espera.
- **Academia:** professores, turmas, matriculas, chamada, faltas, reposicoes e evolucao.
- **Clientes:** socios, leads, interessados, CRM e historico de relacionamento.
- **Financeiro:** mensalidades, pagamentos, lembretes, despesas e relatorios.
- **Cantina:** produtos, estoque, vendas rapidas e fechamento de caixa.
- **Equipe:** convites, permissoes e papeis operacionais.
- **Configuracoes:** plano do local, dados cadastrais, regras e estrutura.

## Fluxos por perfil

### Dono ou gerente

Entrada ideal: Painel.

Prioridades:

- Ver pendencias do dia.
- Confirmar reservas e pagamentos.
- Acompanhar ocupacao, receita e despesas.
- Abrir os modulos conforme necessidade.
- Configurar equipe, precos e planos.

### Recepcao ou secretaria

Entrada ideal: Agenda.

Prioridades:

- Criar e confirmar reservas.
- Receber pagamento.
- Registrar venda da cantina.
- Colocar jogador na lista de espera.
- Ajudar aluno/socio rapidamente.

### Professor

Entrada ideal: Academia.

Prioridades:

- Ver aulas do dia.
- Fazer chamada.
- Registrar falta avisada.
- Gerir reposicoes.
- Registrar evolucao do aluno.

### Jogador ou aluno

Entrada ideal: Portal publico do local.

Prioridades:

- Reservar quadra.
- Entrar em turma.
- Ver sua matricula ou mensalidade.
- Avisar falta.
- Acompanhar partidas abertas.

## O que precisa evoluir

### Navegacao

- Criar uma navegacao de gestao por modulos dentro de cada local.
- No desktop, evoluir para layout com menu lateral ou tabs persistentes.
- No mobile, usar abas horizontais com rolagem e contadores.
- Separar claramente "Ver como jogador" e "Gerenciar".

### Painel

- Consolidar indicadores em cards de decisao.
- Mostrar apenas alertas acionaveis: reservas pendentes, encaixes pendentes, mensalidades pendentes, reposicoes abertas.
- Exibir agenda do dia com proximas reservas/aulas.

### Agenda e quadras

- Manter calendario por dia.
- Dar destaque a reservas pendentes, confirmadas, bloqueios e lista de espera.
- Evoluir para grade por quadra/hora.
- Regras futuras: horario de funcionamento, preco por faixa, janela de cancelamento, limite por socio.

### Academia

- Separar cadastro de professor, disponibilidade, turmas e alunos.
- Criar foco de "aulas de hoje" para professor.
- Melhorar matricula de aluno sem login e convite automatico.
- Evoluir reposicao para fila/creditos com validade.

### Clientes e CRM

- Unificar socio, aluno, lead e contato em uma visao de relacionamento.
- Mostrar origem, interesse, status, proxima acao e historico.
- Permitir conversao de lead em socio/aluno.

### Financeiro

- Separar financeiro de cantina.
- Criar visoes de contas a receber, pagos, pendentes e despesas.
- Consolidar mensalidade de socio e mensalidade de turma.
- Futuro: fechamento mensal, exportacao e repasse.

### Cantina

- Separar venda rapida de cadastro de produto.
- Criar estoque baixo, historico de vendas e cancelamentos.
- Futuro: fechamento de caixa por operador.

### Equipe

- Manter convites pendentes por e-mail.
- Explicar permissoes de cada papel.
- Futuro: disponibilidade, comissao e agenda do professor.

## Plano de acao

1. Criar blueprint documentado em `web/docs/place-management-professionalization.md`.
2. Adicionar cockpit modular na tela atual de locais.
3. Mover os blocos existentes para modulos: Painel, Agenda, Academia, Clientes, Financeiro, Cantina, Equipe e Configuracoes.
4. Preservar a experiencia publica do jogador, sem obrigar jogador a navegar por gestao.
5. Ajustar CSS para mobile, com abas rolaveis e painels mais respirados.
6. Depois, extrair esse cockpit para uma rota propria de gestao.

## Primeiro incremento implementado

O primeiro incremento deve priorizar organizacao sem migrar banco:

- Estado local para modulo ativo por local.
- Navegacao de gestao exibida apenas para equipe/dono.
- Dashboard com resumo e atalhos.
- Condicionais para renderizar cada bloco no modulo correto.
- Estilos de cockpit responsivos.

Isso muda a percepcao imediatamente: o sistema passa a parecer uma ferramenta operacional, nao uma pagina acumulada.
