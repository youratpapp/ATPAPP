# User Activity Test Plan

Fonte: `CURRENT_PRODUCT_STATE.md`, `EXECUTION_QUEUE.md`, `SCREEN_RESPONSIBILITIES.md`, `COMPONENT_GRAMMAR.md`, `PROFILE_PLAN_ACCESS_MODEL.md`, `TASK_DISCOVERY_ONBOARDING.md`, `ACADEMY_MODULE_FUNCTION_MAP.md`, `AGENDA_MODULE_FUNCTION_MAP.md`, `DEMO_STATE_QA_CHECKLIST.md`, `SEED_QA_REALISTIC_POPULATE_PLAN.md` e leitura do codigo em `web/src`.

Escopo desta rodada: plano de testes manuais por atividade real. Nao implementar nada durante a execucao destes testes.

## Regra de execucao

As atividades abaixo nao sao tutoriais de cliques. Elas descrevem situacoes reais, objetivo e resultado esperado para medir discoverability.

O co-worker deve tentar encontrar o caminho pela propria UI. Quando a atividade citar uma area como Agenda, Academia, Eventos ou Financeiro, isso deve ser usado como contexto de dominio, nao como passo obrigatorio. O caminho real percorrido, desvios, retornos e duvidas devem ser registrados no relatorio.

## Matriz de perfis

| Perfil | Areas disponiveis | Funcoes principais | Funcoes que nao deve ver | Observacoes |
|---|---|---|---|---|
| Jogador comum | Inicio, Competir, Locais, Ranking, Perfil | proximas acoes, reserva, espera, aulas pessoais, torneios/ligas que joga, ranking, perfil | Gestao, CRM, cantina, equipe, financeiro administrativo, setup de local | Validar com `jogador001@demo.atp.local`; se `/gestao` for digitado, deve explicar ausencia de permissao. |
| Organizador de torneios/ligas | Eventos, Organizar, Competition OS, Perfil | criar/operar torneio/liga, inscricoes, jogadores, partidas, resultados, comunicacao, publicacao | Agenda/Academia/CRM/Cantina de local por padrao | Validar que organizar competicao nao concede operacao de academia. |
| Professor/autonomo/coach | Gestao leve, Academia, agenda/aulas, alunos, Perfil | aulas de hoje, chamada, turmas, alunos, reposicoes, mensalidades simples, disponibilidade | cantina, equipe extensa, CRM pesado, financeiro completo sem permissao | Papel local `coach` deve priorizar Academia e nao abrir ERP completo. |
| Academia/clube administrador | Gestao, Agenda, Academia, Clientes, Financeiro, Cantina, Equipe, Ajustes, pagina publica | operacao diaria completa, setup, regras, equipe, cobranca, reservas, aulas, CRM, POS | nada fora do plano/permissao | Validar com local `club_pro`/`multi_unit` e usuario owner/manager. |
| Recepcao/front desk | Gestao, Agenda, Academia | confirmar/cancelar reserva, criar reserva, lista de espera, chamada/ausencia/encaixe conforme permissao | financeiro completo, equipe, ajustes sensiveis, cantina se nao liberada | Papel `frontdesk` deve resolver balcao sem ver configuracao empresarial. |
| Financeiro | Gestao, Financeiro, Clientes/Recebiveis, parte financeira de Academia | cobrar, enviar lembrete, marcar pago, despesas, resumo financeiro, diferenciar origem | chamada, configuracao de torneio, equipe sem permissao | No modelo atual, financeiro completo aparece para owner/manager em plano com `finance`. |
| Cantina/POS | Gestao, Cantina | venda rapida, produtos, estoque baixo, caixa do dia | academia/financeiro completo/equipe sem permissao | No codigo atual, cantina segue `canManageFinance`; testar se isso e aceitavel por produto. |
| Admin/superusuario | Perfil/plano global, criacao de locais/competicoes se entitlement permite | validar guardrails, criar local, criar competicao, conferir acesso | operacao alheia sem vinculo explicito | `platform_admin` existe no seed/entitlement, mas tela administrativa global dedicada nao foi confirmada no codigo. |

## Mapa resumido de rotas e modulos

- Player App: `/inicio`, `/locais`, `/locais/:placeId`, `/eventos`, `/eventos/torneios`, `/eventos/ligas`, `/ranking`, `/perfil`.
- Management OS: `/gestao`, `/gestao/:placeId/painel`, `/gestao/:placeId/agenda`, `/gestao/:placeId/academia`, `/gestao/:placeId/clientes`, `/gestao/:placeId/financeiro`, `/gestao/:placeId/cantina`, `/gestao/:placeId/equipe`, `/gestao/:placeId/ajustes`.
- Agenda: `hoje`, `reservas`, `calendario`, `nova-reserva`, `espera`, `quadras`.
- Academia: `hoje`, `grade`, `alunos`, `pendencias`, `professores`, `configuracao`.
- Clientes: `resumo`, `socios`, `leads`, `rotina`, `pendencias`.
- Financeiro: `resumo`, `recebiveis`, `planos`, `despesas`.
- Cantina: `hoje`, `vender`, `estoque`, `produtos`.
- Equipe: `resumo`, `equipe`, `convites`, `papeis`.
- Ajustes: `resumo`, `checklist`, `plano`, `estrutura`.
- Competition OS torneio: `/eventos/:tournamentId/jogos`, `/classificacao`, `/organizacao`, `/jogadores`, `/chat`.
- Competition OS liga: `/eventos/ligas/:leagueId` com tabs `visao`, `jogadores`, `partidas`, `chat`.

## Usuario A - Jogador puro

### ACT-A-01 - Entender a proxima acao ao abrir o app
Perfil: Jogador.
Situacao real: Voce abriu o app de manha para saber se tem algo pendente hoje.
Objetivo: Entender rapidamente se deve jogar, pagar, confirmar algo ou apenas acompanhar.
Pre-condicoes: Login de jogador puro, sem papel em local e sem competicao organizada.
Atividade: Entre em `/inicio` e tente decidir sua proxima acao sem abrir menu lateral.
Resultado esperado: A primeira viewport mostra prioridades pessoais, agenda/feed e nenhuma tarefa administrativa.
Criterio de sucesso: Em menos de 30 segundos o jogador sabe o que fazer ou percebe que nao ha pendencia.
O que observar: Se Gestao aparece; se pendencia passiva vira urgencia; se o texto separa jogador de area profissional.
Risco UX: Alto.
Prioridade: P0.

### ACT-A-02 - Procurar quadra livre por intencao
Perfil: Jogador.
Situacao real: Voce quer jogar hoje as 18h por 1 hora.
Objetivo: Encontrar uma quadra livre e solicitar reserva.
Pre-condicoes: Existem locais com quadras e regras de reserva.
Atividade: Va a Locais, escolha a intencao de reservar quadra, filtre cidade/data/hora/duracao e tente reservar uma quadra.
Resultado esperado: O resultado primario e uma quadra/horario livre acionavel, nao uma ficha generica de academia.
Criterio de sucesso: O jogador consegue solicitar reserva sem entender estrutura interna do local.
O que observar: Se aparecem preco, confirmacao necessaria, quadra, horario e CTA claro.
Risco UX: Alto.
Prioridade: P0.

### ACT-A-03 - Entrar em lista de espera quando nao ha vaga
Perfil: Jogador.
Situacao real: O horario desejado esta ocupado, mas voce quer ser avisado se liberar.
Objetivo: Entrar na lista de espera correta.
Pre-condicoes: Horario ocupado ou sem disponibilidade direta.
Atividade: Busque um horario disputado e tente entrar na espera.
Resultado esperado: A espera fica vinculada a quadra/data/horario e aparece como estado pessoal.
Criterio de sucesso: O app explica se voce esta aguardando vaga ou convite.
O que observar: Se a espera parece uma reserva confirmada; se ha feedback persistente.
Risco UX: Medio.
Prioridade: P1.

### ACT-A-04 - Procurar aula/turma com vaga
Perfil: Jogador/aluno potencial.
Situacao real: Voce quer entrar em uma aula de tenis intermediaria duas vezes por semana.
Objetivo: Encontrar turma compativel e solicitar entrada.
Pre-condicoes: Existem turmas com vaga e turmas cheias.
Atividade: Em Locais, escolha entrar em aula, filtre cidade/dia/periodo/nivel e tente iniciar solicitacao.
Resultado esperado: Resultado mostra turma, academia, professor, horario, vagas e CTA claro.
Criterio de sucesso: O usuario entende se esta solicitando matricula, aula avulsa ou contato.
O que observar: Confusao entre aula avulsa, reposicao e matricula mensal.
Risco UX: Alto.
Prioridade: P1.

### ACT-A-05 - Criar chamada de jogo
Perfil: Jogador.
Situacao real: Voce quer encontrar parceiro/adversario para amanha.
Objetivo: Criar uma chamada de jogo ou entrar em uma existente.
Pre-condicoes: Funcao de open match populada no seed.
Atividade: Em Locais/Encontrar jogadores, filtre cidade/data/periodo/nivel e tente participar ou criar chamada.
Resultado esperado: Chamada nao exige escolher academia/quadra quando a intencao e encontrar jogador primeiro.
Criterio de sucesso: O jogador entende se esta combinando jogo ou reservando quadra.
O que observar: Se a tela mistura reserva de quadra com chamada social.
Risco UX: Medio.
Prioridade: P1.

### ACT-A-06 - Procurar torneio e se inscrever
Perfil: Jogador.
Situacao real: Voce viu um torneio aberto e quer se inscrever.
Objetivo: Encontrar torneio, escolher categoria/classe e concluir solicitacao.
Pre-condicoes: Torneio publico com inscricoes abertas.
Atividade: Em Eventos/Torneios, busque torneios abertos e tente se inscrever.
Resultado esperado: Inscricao mostra status pendente/aprovado e valor quando aplicavel.
Criterio de sucesso: O jogador entende o que falta depois de enviar inscricao.
O que observar: Se o fluxo confunde participante com organizador.
Risco UX: Alto.
Prioridade: P0.

### ACT-A-07 - Procurar liga e solicitar entrada
Perfil: Jogador.
Situacao real: Voce quer entrar em uma liga ativa ou por link.
Objetivo: Solicitar entrada e acompanhar status.
Pre-condicoes: Liga publica ou link de entrada valido.
Atividade: Em Eventos/Ligas ou link de inscricao, tente solicitar entrada.
Resultado esperado: O app informa se precisa aprovacao e se ha taxa.
Criterio de sucesso: O status da solicitacao fica encontravel depois.
O que observar: Se jogador ve ferramentas de dono da liga.
Risco UX: Medio.
Prioridade: P1.

### ACT-A-08 - Acompanhar minha partida e lancar resultado permitido
Perfil: Jogador.
Situacao real: Voce terminou uma partida e precisa enviar o resultado.
Objetivo: Abrir a partida certa e lancar resultado se permitido.
Pre-condicoes: Jogador participa de torneio/liga com partida pendente.
Atividade: Use Inicio ou Eventos para achar a partida e tente registrar resultado.
Resultado esperado: A acao aparece apenas quando o jogador pode agir; confirmacao fica clara.
Criterio de sucesso: O jogador nao precisa procurar em Organizacao/Jogadores.
O que observar: Se resultado, confirmacao e chat estao no contexto da partida.
Risco UX: Alto.
Prioridade: P0.

### ACT-A-09 - Ver ranking e historico pessoal
Perfil: Jogador.
Situacao real: Voce quer comparar sua posicao e ver historico.
Objetivo: Encontrar ranking e dados pessoais sem entrar em area admin.
Pre-condicoes: Dados de ranking/perfil existem.
Atividade: Abra Ranking e Perfil; procure partidas, reservas, aulas e conquistas.
Resultado esperado: Ranking e perfil parecem leitura de jogador, nao relatorio operacional.
Criterio de sucesso: O usuario entende filtros e historico sem suporte.
O que observar: Densidade mobile, termos tecnicos, filtros escondidos.
Risco UX: Medio.
Prioridade: P2.

### ACT-A-10 - Tentar acessar Gestao manualmente sem permissao
Perfil: Jogador.
Situacao real: Voce recebeu um link de gestao por engano.
Objetivo: Validar que o app bloqueia contexto operacional.
Pre-condicoes: Usuario sem local acessivel.
Atividade: Digite `/gestao` e depois uma rota de gestao conhecida se tiver link.
Resultado esperado: O app explica ausencia de permissao e sugere Inicio/Locais, sem Management OS no nav.
Criterio de sucesso: Nenhuma ferramenta profissional aparece.
O que observar: Vazamento de menu, contexto visual errado, erro 404 confuso.
Risco UX: Alto.
Prioridade: P0.

## Usuario B - Organizador

### ACT-B-01 - Separar competicoes que jogo das que organizo
Perfil: Organizador.
Situacao real: Voce tambem joga, mas hoje precisa operar um evento.
Objetivo: Identificar rapidamente o que esta jogando e o que esta organizando.
Pre-condicoes: Usuario com torneios/ligas organizados e inscricoes como jogador.
Atividade: Abra Eventos e percorra Jogando, Organizando e Descobrir.
Resultado esperado: Organizando mostra rows com proxima acao; Jogando mostra compromissos pessoais.
Criterio de sucesso: Nao ha confusao entre papel de atleta e operador.
O que observar: Se CTA de criar evento compete com partidas pessoais.
Risco UX: Alto.
Prioridade: P0.

### ACT-B-02 - Criar torneio inicial
Perfil: Organizador.
Situacao real: Voce vai abrir um torneio no fim do mes.
Objetivo: Criar torneio com dados essenciais.
Pre-condicoes: Entitlement de organizador.
Atividade: Em Eventos, encontre a acao de criar torneio e avance pelo setup.
Resultado esperado: Criacao usa fluxo guiado e deixa claro o que falta para publicar.
Criterio de sucesso: O organizador salva rascunho sem configurar jogos manualmente.
O que observar: Se campos obrigatorios sao claros; se mobile fica pesado.
Risco UX: Medio.
Prioridade: P1.

### ACT-B-03 - Criar liga inicial
Perfil: Organizador.
Situacao real: Voce quer criar uma liga mensal com classes.
Objetivo: Criar liga e entender regras principais.
Pre-condicoes: Entitlement de organizador.
Atividade: Em Eventos/Ligas, crie liga e configure formato basico.
Resultado esperado: O setup diferencia liga de torneio e mostra classes/temporada.
Criterio de sucesso: Usuario entende como jogadores entram e quando rodada sera gerada.
O que observar: Termos tecnicos, excesso de configuracao, defaults.
Risco UX: Medio.
Prioridade: P1.

### ACT-B-04 - Aprovar/rejeitar inscricoes de torneio
Perfil: Organizador/check-in.
Situacao real: Inscricoes chegaram durante a noite.
Objetivo: Aprovar, rejeitar ou colocar em espera.
Pre-condicoes: Torneio com inscricoes pendentes.
Atividade: Abra o torneio a partir da fila e resolva inscricoes.
Resultado esperado: A aba correta mostra status, categoria, contato e acoes.
Criterio de sucesso: A aprovacao cria vinculo real de participante.
O que observar: Se pagamentos aparecem como prioridade quando faltam.
Risco UX: Alto.
Prioridade: P0.

### ACT-B-05 - Convidar equipe de torneio por usuario encontrado
Perfil: Organizador owner.
Situacao real: Voce precisa convidar alguem para operar placar.
Objetivo: Buscar usuario por email/nome, selecionar e enviar convite.
Pre-condicoes: Usuario candidato existe.
Atividade: Em Organizacao do torneio, procure equipe, busque uma pessoa e convide com papel.
Resultado esperado: O card mostra nome do convidado, papel e status pendente; convidado precisa aceitar.
Criterio de sucesso: Torneio nao aparece para convidado antes de aceitar.
O que observar: Se aparece email onde deveria aparecer nome; se convite vira acesso imediato.
Risco UX: Alto.
Prioridade: P0.

### ACT-B-06 - Gerar chave/partidas com participantes suficientes
Perfil: Organizador owner.
Situacao real: Inscricoes fecharam e voce precisa gerar jogos.
Objetivo: Gerar partidas para uma classe.
Pre-condicoes: Classe com participantes aprovados e dados consistentes.
Atividade: No torneio, va a organizacao/jogos e gere as partidas.
Resultado esperado: Chave ou grupos aparecem com jogadores reais, sem BYE incoerente.
Criterio de sucesso: Partidas geradas persistem e podem ser operadas.
O que observar: BYE, quantidade de jogadores, horarios/quadras, mensagens de erro silenciosas.
Risco UX: Alto.
Prioridade: P0.

### ACT-B-07 - Resetar sorteio e partidas
Perfil: Organizador owner.
Situacao real: Voce percebeu erro no sorteio e quer refazer mantendo participantes.
Objetivo: Resetar apenas sorteio/partidas/agenda.
Pre-condicoes: Torneio com chave gerada.
Atividade: Use reset de sorteio/partidas e confirme.
Resultado esperado: Partidas somem, participantes permanecem e feedback e claro.
Criterio de sucesso: Regerar chave depois funciona sem dados fantasmas.
O que observar: Botao inativo, falta de persistencia, perda de participantes.
Risco UX: Alto.
Prioridade: P0.

### ACT-B-08 - Operar resultados pendentes
Perfil: Organizador/placar.
Situacao real: Um jogador enviou resultado e outro ainda nao confirmou.
Objetivo: Resolver resultado pendente ou conflito.
Pre-condicoes: Torneio ou liga com submission pendente/conflitante.
Atividade: Abra fila de jogos e resolva resultado.
Resultado esperado: A fila mostra `Resolver`/`Intervir`; ranking/classificacao atualiza quando aplicavel.
Criterio de sucesso: Operador nao precisa editar JSON ou navegar por configuracao.
O que observar: Permissao por papel scorekeeper/organizer.
Risco UX: Alto.
Prioridade: P0.

### ACT-B-09 - Publicar aviso e fixar mensagem
Perfil: Organizador/midia.
Situacao real: Voce precisa avisar sobre atraso das quadras.
Objetivo: Enviar comunicado para participantes.
Pre-condicoes: Torneio/liga com chat/comunicacao.
Atividade: Use Chat/Comunicacao para postar e fixar aviso.
Resultado esperado: Participantes veem aviso; quem nao tem permissao nao publica.
Criterio de sucesso: Papel media consegue comunicar sem editar jogos.
O que observar: Discoverability, texto do papel, notificacao.
Risco UX: Medio.
Prioridade: P1.

### ACT-B-10 - Operar rodada de liga
Perfil: Dono de liga.
Situacao real: A rodada atual esta terminando e ha resultados pendentes.
Objetivo: Revisar rodada, gerar proxima ou resolver pendencias.
Pre-condicoes: Liga ativa com rounds e partidas.
Atividade: Abra liga ativa e siga a proxima acao sugerida.
Resultado esperado: Painel de foco operacional mostra pendencias, rodada e CTA.
Criterio de sucesso: Dono entende se deve aprovar inscricao, resolver resultado ou gerar rodada.
O que observar: Se `Visao` repete dados ou esconde operacao.
Risco UX: Alto.
Prioridade: P0.

### ACT-B-11 - Jogador registra disponibilidade na sala da liga
Perfil: Jogador participante de liga.
Situacao real: Voce precisa sugerir horarios para a partida.
Objetivo: Registrar disponibilidade no matchroom.
Pre-condicoes: Partida de liga com usuario como participante.
Atividade: Abra sua partida de liga e registre opcoes de horario.
Resultado esperado: Disponibilidade fica salva e visivel para adversario/organizador.
Criterio de sucesso: Nao participantes nao conseguem registrar.
O que observar: Se a sala separa disponibilidade, resultado e chat.
Risco UX: Medio.
Prioridade: P1.

### ACT-B-12 - Compartilhar/publicar competicao
Perfil: Organizador.
Situacao real: Voce quer divulgar a inscricao.
Objetivo: Encontrar link publico/convite e copiar/publicar.
Pre-condicoes: Torneio/liga configurado.
Atividade: Procure publicacao/link nas areas de torneio e liga.
Resultado esperado: Link e status de publicacao ficam claros sem misturar com jogos.
Criterio de sucesso: O organizador consegue explicar o link para participantes.
O que observar: CTA secundario, texto de status, mobile.
Risco UX: Medio.
Prioridade: P1.

## Usuario C - Academia/Admin completo

### ACT-C-01 - Abrir Gestao como rotina de manha
Perfil: Academia/Admin.
Situacao real: O admin abre o sistema pela primeira vez no dia.
Objetivo: Ver pendencias reais do dia sem setup desnecessario.
Pre-condicoes: Local completo, com reservas, aulas, financeiro e pendencias recentes.
Atividade: Entre em Gestao e abra o local principal.
Resultado esperado: A fila prioriza confirmar reservas, chamada, pendencias de aula, cobrancas e estoque baixo.
Criterio de sucesso: Em um minuto o admin sabe o que atacar primeiro.
O que observar: Se setup aparece apesar do local estar completo.
Risco UX: Alto.
Prioridade: P0.

### ACT-C-02 - Confirmar reserva pendente
Perfil: Admin/Recepcao.
Situacao real: Uma reserva chegou ontem a noite para hoje.
Objetivo: Confirmar ou cancelar a reserva.
Pre-condicoes: Reserva `pending` recente.
Atividade: Abra Agenda/Reservas ou fila de Agenda e confirme.
Resultado esperado: Status muda e a reserva aparece na agenda/calendario.
Criterio de sucesso: Acao persiste e feedback e claro.
O que observar: Se pagamento e reserva se confundem.
Risco UX: Alto.
Prioridade: P0.

### ACT-C-03 - Criar reserva rapida no balcao
Perfil: Admin/Recepcao.
Situacao real: Cliente ligou pedindo quadra hoje por 1 hora.
Objetivo: Encontrar disponibilidade e criar reserva.
Pre-condicoes: Quadras e regras cadastradas.
Atividade: Use Agenda/Nova reserva para buscar data/hora/duracao e criar.
Resultado esperado: Apenas horarios validos aparecem; bloqueios/aulas sao respeitados.
Criterio de sucesso: Reserva entra no calendario correto.
O que observar: Campos sem placeholder, horarios quebrados, conflito silencioso.
Risco UX: Alto.
Prioridade: P0.

### ACT-C-04 - Bloquear horario de quadra
Perfil: Admin/Recepcao.
Situacao real: Uma quadra entrara em manutencao.
Objetivo: Criar bloqueio visivel no calendario.
Pre-condicoes: Quadra disponivel.
Atividade: Crie bloqueio em Agenda/Nova reserva ou Calendario.
Resultado esperado: Bloqueio aparece como ocupacao e pode ser liberado.
Criterio de sucesso: Jogador nao consegue reservar o horario bloqueado.
O que observar: Diferenca entre bloqueio de reserva e horario aberto de academia.
Risco UX: Medio.
Prioridade: P1.

### ACT-C-05 - Promover lista de espera para reserva
Perfil: Admin/Recepcao.
Situacao real: Um horario liberou e existe fila de espera.
Objetivo: Convidar ou converter espera em reserva.
Pre-condicoes: Waitlist com horario livre/promotable.
Atividade: Abra Agenda/Espera e promova o primeiro da fila.
Resultado esperado: Status muda para convidado/booked e reserva e criada quando aplicavel.
Criterio de sucesso: Nao cria conflito com reserva existente.
O que observar: Acao primaria, status operacional, WhatsApp como secundario.
Risco UX: Alto.
Prioridade: P1.

### ACT-C-06 - Ver calendario por quadra com aulas, reservas e faltas
Perfil: Admin.
Situacao real: O gestor quer entender ocupacao do dia.
Objetivo: Ver mapa diario por quadra.
Pre-condicoes: Reservas, turmas, bloqueios, drop-ins e ausencias.
Atividade: Abra Agenda/Calendario e use filtros por tipo/quadra/professor/turma/aluno.
Resultado esperado: O calendario combina reservas, bloqueios, aulas fixas, reposicoes e ausencias.
Criterio de sucesso: Sem duplicidade e sem dados escondidos.
O que observar: Scroll, legenda, mobile, conflito de cores.
Risco UX: Alto.
Prioridade: P1.

### ACT-C-07 - Fazer chamada de aula do dia
Perfil: Admin/Professor.
Situacao real: A aula vai comecar e a chamada precisa ser feita rapido.
Objetivo: Marcar presenca, falta e ausencia avisada.
Pre-condicoes: Aula de hoje com alunos ativos.
Atividade: Abra Academia/Hoje, escolha aula e faca chamada no drawer.
Resultado esperado: Chamada e uma tarefa curta, sem wizard.
Criterio de sucesso: Presenca/falta persistem e aula fecha sem rolar pagina infinita.
O que observar: Se alunos aparecem, se faltas avisadas e reposicoes estao no contexto.
Risco UX: Alto.
Prioridade: P0.

### ACT-C-08 - Editar turma pela Grade
Perfil: Admin/Gestor.
Situacao real: Turma mudara de quadra e mensalidade.
Objetivo: Editar dados, mensalidade e status no drawer.
Pre-condicoes: Turma existente com alunos.
Atividade: Abra Academia/Grade, busque turma, abra drawer, edite quadra/horario/mensalidade.
Resultado esperado: Dados salvam e row reflete mudanca.
Criterio de sucesso: Nao ha formulario repetido por turma na lista.
O que observar: Permissao financeira para mensalidade.
Risco UX: Alto.
Prioridade: P0.

### ACT-C-09 - Matricular aluno com login e plano semanal
Perfil: Admin/Secretaria.
Situacao real: Novo aluno quer plano 2x por semana.
Objetivo: Criar contrato/aluno vinculado a usuario e selecionar horarios.
Pre-condicoes: Usuario/email existe ou convite/login opcional suportado.
Atividade: A partir da Grade/Turma ou Alunos, matricule aluno em um ou mais horarios conforme plano.
Resultado esperado: Contrato semanal, mensalidade e matriculas por turma ficam vinculados.
Criterio de sucesso: Aluno aparece no drawer, na turma, no financeiro e no Player App.
O que observar: Se permite selecionar um ou dois dias quando turma se repete.
Risco UX: Alto.
Prioridade: P0.

### ACT-C-10 - Matricular aluno sem login
Perfil: Admin/Secretaria.
Situacao real: Responsavel nao quer criar login agora.
Objetivo: Registrar aluno operacional sem perder possibilidade de vincular depois.
Pre-condicoes: Fluxo sem login permitido.
Atividade: Cadastre aluno sem email/login e valide como aparece nas turmas e cobrancas.
Resultado esperado: Registro fica claro como nao vinculado e nao simula notificacao.
Criterio de sucesso: Posterior vinculacao por email e encontravel.
O que observar: Se app promete notificacao sem user_id.
Risco UX: Medio.
Prioridade: P1.

### ACT-C-11 - Cobrar mensalidade e marcar pago
Perfil: Admin/Financeiro.
Situacao real: Um aluno esta inadimplente.
Objetivo: Enviar lembrete/cobranca e marcar pago quando receber.
Pre-condicoes: Pagamento `academy_student_contract` pendente.
Atividade: Use Academia/Alunos ou Financeiro/Recebiveis para enviar lembrete e marcar pago.
Resultado esperado: A origem da cobranca aparece como mensalidade de aluno/contrato.
Criterio de sucesso: Status atualiza em financeiro e no drawer do aluno.
O que observar: Se cobrança de socio/reserva/aula avulsa se mistura.
Risco UX: Alto.
Prioridade: P0.

### ACT-C-12 - Registrar evolucao do aluno
Perfil: Professor/Admin.
Situacao real: Professor quer registrar foco tecnico apos aula.
Objetivo: Criar nota de evolucao com nivel/foco/observacao.
Pre-condicoes: Aluno ativo.
Atividade: Abra Academia/Alunos, selecione aluno e registre evolucao.
Resultado esperado: Nota fica no historico do aluno.
Criterio de sucesso: Professor pode registrar sem ver financeiro completo.
O que observar: Permissao do coach, clareza de campos.
Risco UX: Medio.
Prioridade: P1.

### ACT-C-13 - Registrar ausencia avisada e gerar credito
Perfil: Secretaria/Admin.
Situacao real: Aluno avisou falta dentro do prazo configurado.
Objetivo: Registrar ausencia e gerar credito de reposicao quando regra permitir.
Pre-condicoes: Regra de antecedencia configurada.
Atividade: No aluno ou aula, registre ausencia avisada para data futura dentro e fora do prazo.
Resultado esperado: Dentro do prazo gera credito; fora do prazo explica bloqueio/regra.
Criterio de sucesso: Credito fica rastreavel pela ausencia.
O que observar: Termos: ausencia avisada, reposicao aberta, solicitacao de reposicao.
Risco UX: Alto.
Prioridade: P0.

### ACT-C-14 - Aprovar aula avulsa/drop-in
Perfil: Secretaria/Admin.
Situacao real: Um jogador quer fazer aula pontual hoje.
Objetivo: Aprovar ou recusar aula avulsa e tratar pagamento.
Pre-condicoes: Solicitação `drop_in` pendente.
Atividade: Abra Academia/Pendencias e aprove/recuse; se aplicavel, marque pagamento.
Resultado esperado: Drop-in nao vira reposicao e aparece no calendario/aula.
Criterio de sucesso: Pagamento `academy_lesson_request` fica coerente.
O que observar: WhatsApp secundario, acao primaria correta.
Risco UX: Alto.
Prioridade: P0.

### ACT-C-15 - Usar credito de reposicao
Perfil: Secretaria/Admin.
Situacao real: Aluno tem credito aberto e quer encaixar em outra turma.
Objetivo: Buscar horario compatível e agendar reposicao.
Pre-condicoes: Credito `open` real.
Atividade: Em Academia/Pendencias, selecione credito e busque encaixe.
Resultado esperado: Credito vira usado/agendado e fica vinculado a turma/data.
Criterio de sucesso: Nao perde diferenca entre credito aberto e solicitacao.
O que observar: Se busca de encaixe nao polui fila principal.
Risco UX: Alto.
Prioridade: P0.

### ACT-C-16 - Agendar solicitacao de reposicao
Perfil: Secretaria/Admin.
Situacao real: Aluno pediu reposicao para uma data especifica.
Objetivo: Aprovar/recusar e vincular a aula real.
Pre-condicoes: Solicitacao `makeup` pendente.
Atividade: Resolva solicitacao em Pendencias e valide calendario/chamada.
Resultado esperado: Solicitacao vira aprovada/rejeitada sem mexer em creditos errados.
Criterio de sucesso: Vaga e pagamento/cortesia ficam claros.
O que observar: Nomenclatura, status, permissao.
Risco UX: Alto.
Prioridade: P0.

### ACT-C-17 - Cadastrar professor e vincular login
Perfil: Admin/Gestor.
Situacao real: Novo professor entrou na equipe.
Objetivo: Criar professor, telefone/email e vincular login por email.
Pre-condicoes: Usuario professor existe ou convite pendente permitido.
Atividade: Abra Academia/Professores, cadastre e vincule login.
Resultado esperado: Professor aparece com login vinculado ou convite pendente.
Criterio de sucesso: Professor consegue ver suas turmas depois de aceitar/vincular.
O que observar: Se email aparece onde deveria aparecer nome.
Risco UX: Alto.
Prioridade: P0.

### ACT-C-18 - Editar comissao do professor
Perfil: Admin/Financeiro.
Situacao real: Comissao do professor mudou.
Objetivo: Editar comissao sem input aberto em todas as linhas.
Pre-condicoes: Professor cadastrado.
Atividade: Abra drawer do professor e edite comissao.
Resultado esperado: Comissao salva e estimativa aparece como dado.
Criterio de sucesso: Linha da lista continua limpa.
O que observar: Permissao financeira, feedback, historico.
Risco UX: Medio.
Prioridade: P1.

### ACT-C-19 - Criar horario aberto
Perfil: Admin/Gestor.
Situacao real: Academia quer abrir janela semanal que ainda nao e turma.
Objetivo: Criar horario aberto com professor/quadra/dia/horario.
Pre-condicoes: Quadra e professor disponiveis.
Atividade: Abra Academia/Configuracao e crie horario aberto.
Resultado esperado: Horario aparece como janela semanal, diferente de turma.
Criterio de sucesso: Conflitos de professor/quadra sao visiveis.
O que observar: Data como referencia vs recorrencia semanal.
Risco UX: Medio.
Prioridade: P1.

### ACT-C-20 - Transformar horario aberto em turma
Perfil: Admin/Gestor.
Situacao real: Um horario aberto virou turma fixa.
Objetivo: Criar turma a partir do slot.
Pre-condicoes: Slot `open` sem conflito.
Atividade: Em Configuracao, use `Criar turma` no horario aberto.
Resultado esperado: Turma nasce e slot vira `assigned` na mesma transacao.
Criterio de sucesso: Nao ha sucesso parcial.
O que observar: Feedback de erro, campos essenciais, mensalidade.
Risco UX: Alto.
Prioridade: P0.

### ACT-C-21 - Configurar regras de reposicao da academia
Perfil: Admin/Gestor.
Situacao real: A academia exige aviso com 12 horas de antecedencia.
Objetivo: Ver e alterar antecedencia minima e auto credito.
Pre-condicoes: Configuracao existente.
Atividade: Abra Academia/Configuracao e altere regra.
Resultado esperado: Novas ausencias respeitam a regra.
Criterio de sucesso: O texto diferencia configuracao de uso diario.
O que observar: Impacto em fluxos de ausencia.
Risco UX: Medio.
Prioridade: P1.

### ACT-C-22 - Publicar/editar pagina publica do local
Perfil: Admin/Gestor.
Situacao real: O local quer atualizar descricao e capa antes de divulgar.
Objetivo: Editar dados publicos e conferir pagina.
Pre-condicoes: Local administrado.
Atividade: Abra Ajustes/Estrutura e depois Ver pagina publica.
Resultado esperado: Publico ve oferta, reserva/aula e dados do local; nao ve admin.
Criterio de sucesso: Gestao fica secundaria, publica fica limpa.
O que observar: Vazamento de CRM/financeiro/setup em `/locais/:placeId`.
Risco UX: Alto.
Prioridade: P1.

## Usuario D - Professor/Coach

### ACT-D-01 - Abrir gestao leve do professor
Perfil: Professor/Coach.
Situacao real: Professor abre app antes da primeira aula.
Objetivo: Ver suas aulas, alunos e chamada.
Pre-condicoes: Usuario com `place_staff` role `coach` e `place_coaches.user_id`.
Atividade: Entre em Gestao e abra a academia vinculada.
Resultado esperado: O professor cai em Academia/Hoje ou caminho equivalente.
Criterio de sucesso: Nao aparecem cantina, CRM pesado, equipe ou financeiro completo.
O que observar: Se local mostra metricas empresariais demais.
Risco UX: Alto.
Prioridade: P0.

### ACT-D-02 - Fazer chamada da propria turma
Perfil: Professor.
Situacao real: Aula comecou e alunos estao chegando.
Objetivo: Marcar presenca/falta rapidamente.
Pre-condicoes: Turma do professor no dia.
Atividade: Abra aula do dia e marque chamada.
Resultado esperado: Professor ve apenas turmas pertinentes ou consegue filtrar por ele.
Criterio de sucesso: Chamada conclui em poucos cliques.
O que observar: Se professor ve turmas de outros professores sem necessidade.
Risco UX: Alto.
Prioridade: P0.

### ACT-D-03 - Registrar evolucao apos aula
Perfil: Professor.
Situacao real: Professor quer anotar ajuste tecnico do aluno.
Objetivo: Registrar nivel/foco/nota.
Pre-condicoes: Aluno ativo na turma.
Atividade: Abra aluno pelo contexto da turma ou Alunos e registre evolucao.
Resultado esperado: Nota persiste e fica historica.
Criterio de sucesso: Professor nao precisa passar pelo financeiro.
O que observar: Caminho natural aula -> aluno -> evolucao.
Risco UX: Medio.
Prioridade: P1.

### ACT-D-04 - Ver agenda semanal
Perfil: Professor.
Situacao real: Professor quer planejar a semana.
Objetivo: Ver turmas, horarios e quadras.
Pre-condicoes: Professor com varias turmas.
Atividade: Use Academia/Professores ou Agenda/Calendario se disponivel.
Resultado esperado: Agenda do professor e clara e filtrada.
Criterio de sucesso: O professor nao precisa garimpar todas as quadras.
O que observar: Alternancia professor/quadra, mobile.
Risco UX: Medio.
Prioridade: P1.

### ACT-D-05 - Ver alunos de suas turmas
Perfil: Professor.
Situacao real: Professor quer ligar para aluno faltante.
Objetivo: Encontrar aluno e telefone.
Pre-condicoes: Turmas com alunos.
Atividade: Abra Alunos e filtre/busque por turma/professor.
Resultado esperado: Alunos aparecem com status de presenca e contato.
Criterio de sucesso: Nao expõe cobrancas sensiveis se professor nao tem permissao.
O que observar: Permissao financeira, busca e dados pessoais.
Risco UX: Medio.
Prioridade: P1.

### ACT-D-06 - Registrar ausencia avisada recebida pelo professor
Perfil: Professor.
Situacao real: Aluno avisou pelo WhatsApp que faltara.
Objetivo: Registrar ausencia avisada.
Pre-condicoes: Permissao de academia permite ou bloqueia.
Atividade: Tente registrar ausencia no aluno/aula.
Resultado esperado: Se permitido, credito segue regra; se nao, sistema orienta procurar secretaria.
Criterio de sucesso: Nao ha erro tecnico bruto.
O que observar: Limite de papel do professor.
Risco UX: Medio.
Prioridade: P1.

### ACT-D-07 - Ajustar disponibilidade
Perfil: Professor.
Situacao real: Professor mudou disponibilidade semanal.
Objetivo: Registrar disponibilidade ou solicitar ajuste.
Pre-condicoes: Disponibilidade/slots configurados.
Atividade: Procure onde ajustar agenda do professor.
Resultado esperado: Acao existe no contexto de Professores/Configuracao ou fica claramente indisponivel para o papel.
Criterio de sucesso: Professor entende se pode editar ou pedir admin.
O que observar: Funcao escondida, permissao.
Risco UX: Medio.
Prioridade: P2.

### ACT-D-08 - Validar convite de equipe/professor
Perfil: Professor convidado.
Situacao real: Professor recebeu convite e precisa aceitar.
Objetivo: Aceitar convite e ganhar acesso certo.
Pre-condicoes: Convite pendente para email do professor.
Atividade: Logue como professor convidado e aceite se houver notificacao.
Resultado esperado: Depois de aceitar, local/turmas aparecem; antes disso nao.
Criterio de sucesso: Convite nao concede acesso invisivel sem aceite.
O que observar: Notificacao, nome do local, papel.
Risco UX: Alto.
Prioridade: P1.

### ACT-D-09 - Professor sem permissao tenta acessar financeiro
Perfil: Professor.
Situacao real: Professor clica em link de financeiro recebido por engano.
Objetivo: Validar bloqueio amigavel.
Pre-condicoes: Role coach sem `canManagePlace`.
Atividade: Digite rota Financeiro do local.
Resultado esperado: Redireciona para modulo permitido ou mostra sem permissao.
Criterio de sucesso: Sem vazamento de valores/lista de cobrancas.
O que observar: Guardrail de rota.
Risco UX: Alto.
Prioridade: P0.

### ACT-D-10 - Coach solo sem local completo
Perfil: Professor autonomo.
Situacao real: Coach autonomo quer organizar alunos/aulas simples.
Objetivo: Ver se a experiencia e leve.
Pre-condicoes: Usuario `coach_solo`.
Atividade: Abra Gestao e siga a proxima acao.
Resultado esperado: Deve oferecer operacao de aulas, nao criar ERP completo.
Criterio de sucesso: Sem cantina, equipe e CRM pesado como tarefas nobres.
O que observar: Funcionalidade documentada; confirmar se implementada no codigo/UI.
Risco UX: Medio.
Prioridade: P2.

## Outros perfis

### ACT-R-01 - Recepcao resolve fila da manha
Perfil: Recepcao/front desk.
Situacao real: Ha reservas pendentes, espera e aulas do dia.
Objetivo: Limpar fila operacional sem entrar em ajustes.
Pre-condicoes: Role `frontdesk`.
Atividade: Abra Gestao e execute as tres primeiras tarefas sugeridas.
Resultado esperado: Agenda e Academia aparecem; financeiro/equipe completos nao.
Criterio de sucesso: A recepcao resolve sem caçar modulo.
O que observar: Ordem das tarefas, permissao, excesso de scroll.
Risco UX: Alto.
Prioridade: P0.

### ACT-R-02 - Recepcao cria reserva para cliente por telefone
Perfil: Recepcao.
Situacao real: Cliente ligou para reservar quadra amanha.
Objetivo: Criar reserva sem acessar pagina publica.
Pre-condicoes: Role `frontdesk`, quadra livre.
Atividade: Use Agenda/Nova reserva.
Resultado esperado: Reserva entra como pendente/confirmada conforme regra.
Criterio de sucesso: Recepcao nao precisa sair para Locais.
O que observar: Campos claros e placeholders.
Risco UX: Alto.
Prioridade: P0.

### ACT-R-03 - Recepcao cancela reserva
Perfil: Recepcao.
Situacao real: Cliente cancelou reserva confirmada.
Objetivo: Cancelar/liberar horario.
Pre-condicoes: Reserva futura confirmada.
Atividade: Localize reserva e cancele.
Resultado esperado: Horario libera e waitlist fica acionavel se existir.
Criterio de sucesso: Nao cancela serie inteira por engano.
O que observar: Confirmacao e linguagem.
Risco UX: Medio.
Prioridade: P1.

### ACT-R-04 - Recepcao faz check-in de aula
Perfil: Recepcao.
Situacao real: Aluno chegou antes do professor.
Objetivo: Marcar presenca/check-in.
Pre-condicoes: Aula do dia e aluno ativo.
Atividade: Use Academia/Hoje ou Alunos para marcar presenca.
Resultado esperado: Check-in aparece na chamada.
Criterio de sucesso: Acao e rapida e nao exige drawer profundo demais.
O que observar: Duplicidade entre check-in e chamada.
Risco UX: Medio.
Prioridade: P1.

### ACT-R-05 - Recepcao agenda reposicao pelo balcao
Perfil: Recepcao.
Situacao real: Aluno pediu reposicao presencialmente.
Objetivo: Usar credito aberto e encaixar horario.
Pre-condicoes: Aluno com credito aberto.
Atividade: Abra Pendencias/Alunos e agende.
Resultado esperado: Credito usado/agendado e calendario atualizado.
Criterio de sucesso: Encaixe e ferramenta, nao bloco permanente.
O que observar: Se precisa saber termo tecnico.
Risco UX: Alto.
Prioridade: P0.

### ACT-R-06 - Recepcao aprova aula avulsa recente
Perfil: Recepcao.
Situacao real: Um jogador pediu uma aula avulsa para hoje cedo.
Objetivo: Aprovar a aula, confirmar turma/horario e orientar pagamento.
Pre-condicoes: Aula avulsa/drop-in pendente recente.
Atividade: Abra Academia/Pendencias e resolva a aula avulsa.
Resultado esperado: Aula avulsa continua separada de reposicao e aparece no contexto da aula.
Criterio de sucesso: Recepcao entende se precisa cobrar, aprovar ou chamar WhatsApp.
O que observar: Se WhatsApp compete com Aprovar/Marcar pago.
Risco UX: Alto.
Prioridade: P0.

### ACT-R-07 - Recepcao encontra aluno por telefone
Perfil: Recepcao.
Situacao real: Aluno ligou e informou apenas telefone.
Objetivo: Encontrar cadastro, turmas, pagamentos e reposicoes.
Pre-condicoes: Aluno com telefone e contrato.
Atividade: Use Academia/Alunos e busca.
Resultado esperado: Busca acha aluno e drawer agrega contrato/matriculas.
Criterio de sucesso: Recepcao nao precisa procurar turma por turma.
O que observar: Placeholder em campo de busca e filtros claros.
Risco UX: Medio.
Prioridade: P1.

### ACT-R-08 - Recepcao confirma pagamento de reserva
Perfil: Recepcao.
Situacao real: Jogador pagou no balcao antes de entrar na quadra.
Objetivo: Marcar pagamento relacionado a reserva.
Pre-condicoes: Reserva com pagamento pendente.
Atividade: Localize a reserva e tente marcar pago ou navegar para recebivel.
Resultado esperado: Origem da cobranca continua sendo reserva de quadra.
Criterio de sucesso: Recepcao nao precisa abrir financeiro completo se nao tiver permissao.
O que observar: Se a permissao bloqueia sem alternativa operacional.
Risco UX: Medio.
Prioridade: P1.

### ACT-R-09 - Recepcao consulta ocupacao do proximo horario
Perfil: Recepcao.
Situacao real: Cliente no balcao pergunta se tem quadra livre em 30 minutos.
Objetivo: Responder rapido olhando agenda/calendario.
Pre-condicoes: Agenda populada.
Atividade: Abra Agenda/Calendario ou Hoje e procure o proximo horario livre.
Resultado esperado: A visualizacao deixa claro ocupado/livre por quadra.
Criterio de sucesso: Resposta em menos de 1 minuto.
O que observar: Filtros, legenda, densidade mobile.
Risco UX: Medio.
Prioridade: P1.

### ACT-R-10 - Recepcao tenta acessar Equipe/Ajustes
Perfil: Recepcao.
Situacao real: Recepcionista recebeu link de ajustes por engano.
Objetivo: Validar bloqueio de area sensivel.
Pre-condicoes: Role `frontdesk`.
Atividade: Tente abrir Equipe e Ajustes por menu/URL.
Resultado esperado: Modulos nao aparecem ou redirecionam para area permitida.
Criterio de sucesso: Sem edicao de equipe, plano ou estrutura publica.
O que observar: Vazamento de botoes sensiveis.
Risco UX: Alto.
Prioridade: P0.

### ACT-F-01 - Financeiro ver recebiveis por origem
Perfil: Financeiro.
Situacao real: Financeiro quer cobrar hoje.
Objetivo: Ver quem deve e a origem da divida.
Pre-condicoes: Recebiveis de reserva, mensalidade, socio, aula avulsa e competicao.
Atividade: Abra Financeiro/Recebiveis e filtre/observe origens.
Resultado esperado: Origem e valor ficam claros e acionaveis.
Criterio de sucesso: Nao vira relatorio antes de acao.
O que observar: Diferenciacao de `academy_student_contract`, `court_booking`, `place_membership`, `academy_lesson_request`.
Risco UX: Alto.
Prioridade: P0.

### ACT-F-02 - Financeiro envia lembrete em lote
Perfil: Financeiro.
Situacao real: Existem mensalidades vencidas.
Objetivo: Enviar lembretes sem acionar itens pagos.
Pre-condicoes: Recebiveis pendentes e pagos.
Atividade: Use lembrete individual e/ou em lote.
Resultado esperado: Lembretes ficam registrados e nao duplicam pagamento.
Criterio de sucesso: Canal/status aparecem.
O que observar: WhatsApp/email/manual, permissao.
Risco UX: Medio.
Prioridade: P1.

### ACT-F-03 - Financeiro marca pagamento manual
Perfil: Financeiro.
Situacao real: Aluno pagou no Pix fora do sistema.
Objetivo: Marcar como pago manualmente.
Pre-condicoes: Recebivel pendente.
Atividade: Marque pago e confirme status em aluno/financeiro.
Resultado esperado: Provider manual ou equivalente nao simula pagamento online.
Criterio de sucesso: Atualizacao propaga para o contexto de origem.
O que observar: Auditoria e data de pagamento.
Risco UX: Alto.
Prioridade: P0.

### ACT-F-04 - Financeiro registra despesa
Perfil: Financeiro.
Situacao real: Compra de bolas e manutencao de quadra.
Objetivo: Registrar despesa operacional.
Pre-condicoes: Permissao financeira.
Atividade: Abra Financeiro/Despesas e registre uma despesa.
Resultado esperado: Despesa aparece no resumo.
Criterio de sucesso: Campos essenciais claros.
O que observar: Categoria, data, valor, mobile.
Risco UX: Medio.
Prioridade: P1.

### ACT-F-05 - Financeiro cobra aula avulsa
Perfil: Financeiro.
Situacao real: Aula avulsa foi aprovada, mas ainda nao paga.
Objetivo: Cobrar e marcar aula avulsa paga.
Pre-condicoes: `academy_lesson_request` com pagamento pendente.
Atividade: Encontre a cobranca em Financeiro/Recebiveis ou Academia/Pendencias.
Resultado esperado: Origem aparece como aula avulsa/drop-in.
Criterio de sucesso: Nao mistura com mensalidade ou reposicao com cortesia.
O que observar: Valor, status, acoes financeiras por permissao.
Risco UX: Alto.
Prioridade: P0.

### ACT-F-06 - Financeiro cobra socio/plano
Perfil: Financeiro.
Situacao real: Socio mensal esta pendente.
Objetivo: Cobrar socio sem confundir com aluno da academia.
Pre-condicoes: `place_membership` pendente.
Atividade: Abra Financeiro/Recebiveis e Clientes/Socios.
Resultado esperado: Socio, aluno e reserva aparecem como origens distintas.
Criterio de sucesso: Lembrete correto e status sincronizado.
O que observar: Duplicidade entre Clientes e Financeiro.
Risco UX: Medio.
Prioridade: P1.

### ACT-F-07 - Financeiro confere resumo do dia
Perfil: Financeiro/Gestor.
Situacao real: Fechamento parcial do dia.
Objetivo: Ver entradas, despesas e pendencias sem perder acoes.
Pre-condicoes: Vendas, pagamentos e despesas populados.
Atividade: Abra Financeiro/Resumo e compare com Recebiveis/Despesas.
Resultado esperado: Resumo apoia decisao, mas acoes continuam nos recebiveis.
Criterio de sucesso: Nao ha KPI protagonista sem caminho de acao.
O que observar: Dashboard feeling vs task-first.
Risco UX: Medio.
Prioridade: P1.

### ACT-F-08 - Usuario sem financeiro tenta marcar pago
Perfil: Professor/Recepcao sem permissao financeira.
Situacao real: Usuario ve aluno inadimplente, mas nao deveria operar caixa.
Objetivo: Validar ocultacao/bloqueio de acao financeira.
Pre-condicoes: Perfil sem `canManageFinance`.
Atividade: Abra Alunos/Recebiveis por link ou UI e tente marcar pago.
Resultado esperado: Acao nao aparece ou bloqueia com mensagem clara.
Criterio de sucesso: Sem mutacao financeira indevida.
O que observar: Vazamento de valores e botoes.
Risco UX: Alto.
Prioridade: P0.

### ACT-POS-01 - Vender produto da cantina
Perfil: Cantina/POS.
Situacao real: Cliente comprou agua e grip.
Objetivo: Registrar venda rapidamente.
Pre-condicoes: Produtos cadastrados em estoque.
Atividade: Abra Cantina/Vender e registre venda.
Resultado esperado: Venda entra no caixa do dia e reduz estoque quando aplicavel.
Criterio de sucesso: Operador conclui sem entrar em financeiro completo.
O que observar: Acao primaria, busca de produto, troco/quantidade.
Risco UX: Medio.
Prioridade: P1.

### ACT-POS-02 - Cadastrar produto
Perfil: Cantina/Admin.
Situacao real: Chegou novo produto.
Objetivo: Criar produto com preco e estoque.
Pre-condicoes: Permissao de cantina.
Atividade: Abra Cantina/Produtos e cadastre.
Resultado esperado: Produto aparece em venda e estoque.
Criterio de sucesso: Cadastro nao compete com venda rapida.
O que observar: Formulario progressivo, placeholder.
Risco UX: Medio.
Prioridade: P2.

### ACT-POS-03 - Repor estoque baixo
Perfil: Cantina/Admin.
Situacao real: Itens estao acabando antes do pico.
Objetivo: Identificar e atualizar estoque baixo.
Pre-condicoes: Produtos com estoque <= limite.
Atividade: Abra Cantina/Estoque e atualize.
Resultado esperado: Itens baixos aparecem como prioridade.
Criterio de sucesso: Estoque baixo nao se perde em catalogo.
O que observar: Permissao e feedback.
Risco UX: Medio.
Prioridade: P1.

### ACT-POS-04 - Ver caixa do dia
Perfil: Cantina/POS.
Situacao real: Operador quer conferir vendas recentes antes de trocar turno.
Objetivo: Ver resumo do dia e vendas recentes.
Pre-condicoes: Vendas registradas no dia.
Atividade: Abra Cantina/Hoje.
Resultado esperado: Caixa e vendas recentes aparecem sem virar financeiro completo.
Criterio de sucesso: Operador entende total, itens e horario.
O que observar: Se dados financeiros sensiveis demais aparecem.
Risco UX: Medio.
Prioridade: P1.

### ACT-POS-05 - Produto sem estoque no momento da venda
Perfil: Cantina/POS.
Situacao real: Cliente pede produto que acabou.
Objetivo: Ver se a venda impede ou alerta estoque zerado.
Pre-condicoes: Produto com estoque zero/baixo.
Atividade: Tente vender produto sem estoque.
Resultado esperado: App bloqueia ou avisa claramente.
Criterio de sucesso: Nao cria estoque negativo sem intencao.
O que observar: Feedback e estado de estoque.
Risco UX: Medio.
Prioridade: P1.

### ACT-POS-06 - Usuario sem cantina tenta abrir POS
Perfil: Professor/Recepcao sem permissao.
Situacao real: Usuario acessa link de cantina por engano.
Objetivo: Validar guardrail de modulo.
Pre-condicoes: Papel sem acesso a cantina.
Atividade: Tente abrir `/gestao/:placeId/cantina`.
Resultado esperado: Redireciona ou bloqueia.
Criterio de sucesso: Sem catalogo, estoque ou vendas para usuario indevido.
O que observar: Plano/permissao.
Risco UX: Medio.
Prioridade: P1.

### ACT-E-01 - Convidar membro da equipe do local
Perfil: Admin/Gestor.
Situacao real: Nova recepcionista vai entrar.
Objetivo: Convidar pessoa por email/papel.
Pre-condicoes: Equipe/Ajustes liberados.
Atividade: Abra Equipe/Convites e envie convite.
Resultado esperado: Convite pendente aparece e usuario so acessa apos aceitar/claim.
Criterio de sucesso: Papel define modulos visiveis.
O que observar: Notificacao, status, nome vs email.
Risco UX: Alto.
Prioridade: P0.

### ACT-E-02 - Alterar papel/permissao
Perfil: Admin/Gestor.
Situacao real: Um membro mudou de recepcao para gerente.
Objetivo: Alterar papel e validar menu.
Pre-condicoes: Membro existente.
Atividade: Em Equipe/Papeis, altere ou simule alteracao se disponivel.
Resultado esperado: Menus e acoes mudam conforme papel.
Criterio de sucesso: Sem acesso residual a modulos proibidos.
O que observar: Se funcao esta documentada mas nao confirmada no codigo.
Risco UX: Alto.
Prioridade: P1.

### ACT-E-03 - Plano do local limita modulos
Perfil: Admin/Gestor.
Situacao real: Local no plano `academy` ou `club_basic`.
Objetivo: Ver se modulos aparecem conforme plano.
Pre-condicoes: Locais em planos diferentes.
Atividade: Compare Gestao de locais com planos diferentes.
Resultado esperado: `academy` mantem Agenda e Academia; financeiro/CRM/cantina dependem de plano.
Criterio de sucesso: Modulos indisponiveis nao aparecem ou explicam upgrade.
O que observar: Rota direta para modulo nao permitido.
Risco UX: Alto.
Prioridade: P0.

### ACT-E-04 - Editar estrutura publica do local
Perfil: Admin/Gestor.
Situacao real: Gestor quer atualizar dados publicos.
Objetivo: Editar nome, cidade, descricao, imagens se existirem.
Pre-condicoes: Permissao de ajustes.
Atividade: Abra Ajustes/Estrutura e salve mudanca leve.
Resultado esperado: Pagina publica reflete alteracao.
Criterio de sucesso: Ajuste nao fica apenas informativo.
O que observar: Campos sem cabecalho precisam placeholder.
Risco UX: Medio.
Prioridade: P1.

### ACT-E-05 - Membro aceita convite de local
Perfil: Novo membro da equipe.
Situacao real: Usuario recebeu convite para trabalhar no local.
Objetivo: Aceitar convite e ganhar apenas o papel correto.
Pre-condicoes: Convite pendente para email do usuario.
Atividade: Logue com o convidado, procure notificacao/convite e aceite.
Resultado esperado: Local aparece em Gestao apos aceite.
Criterio de sucesso: Antes do aceite, local nao aparece como operavel.
O que observar: Notificacao, clareza do papel, tempo ate aparecer.
Risco UX: Alto.
Prioridade: P0.

### ACT-E-06 - Cancelar convite pendente
Perfil: Admin/Gestor.
Situacao real: Convite foi enviado para pessoa errada.
Objetivo: Cancelar convite antes de aceitar.
Pre-condicoes: Convite pendente.
Atividade: Abra Equipe/Convites e cancele.
Resultado esperado: Convite some/fica cancelado e usuario nao consegue aceitar.
Criterio de sucesso: Sem acesso residual.
O que observar: Feedback e status.
Risco UX: Medio.
Prioridade: P1.

### ACT-E-07 - Ver checklist de implantacao em local completo
Perfil: Admin/Gestor.
Situacao real: Academia ja esta configurada e nao deve ver demandas falsas.
Objetivo: Confirmar que checklist nao cria ansiedade em local completo.
Pre-condicoes: Local com quadras, regras, professores, turmas, planos e pagina.
Atividade: Abra Gestao e Ajustes/Checklist.
Resultado esperado: Checklist aparece completo, discreto ou ausente como pendencia.
Criterio de sucesso: Operacao diaria vem antes de setup.
O que observar: Se academias completas ainda parecem incompletas.
Risco UX: Medio.
Prioridade: P1.

## Top 10 testes P0

1. ACT-A-01 - Entender a proxima acao ao abrir o app.
2. ACT-A-02 - Procurar quadra livre por intencao.
3. ACT-A-06 - Procurar torneio e se inscrever.
4. ACT-A-08 - Acompanhar minha partida e lancar resultado permitido.
5. ACT-A-10 - Tentar acessar Gestao manualmente sem permissao.
6. ACT-B-04 - Aprovar/rejeitar inscricoes de torneio.
7. ACT-B-06 - Gerar chave/partidas com participantes suficientes.
8. ACT-C-07 - Fazer chamada de aula do dia.
9. ACT-C-09 - Matricular aluno com login e plano semanal.
10. ACT-C-20 - Transformar horario aberto em turma.

## Top 20 testes P1

1. ACT-A-03 - Entrar em lista de espera quando nao ha vaga.
2. ACT-A-04 - Procurar aula/turma com vaga.
3. ACT-A-05 - Criar chamada de jogo.
4. ACT-A-07 - Procurar liga e solicitar entrada.
5. ACT-B-02 - Criar torneio inicial.
6. ACT-B-03 - Criar liga inicial.
7. ACT-B-09 - Publicar aviso e fixar mensagem.
8. ACT-B-11 - Jogador registra disponibilidade na sala da liga.
9. ACT-B-12 - Compartilhar/publicar competicao.
10. ACT-C-05 - Promover lista de espera para reserva.
11. ACT-C-06 - Ver calendario por quadra com aulas, reservas e faltas.
12. ACT-C-10 - Matricular aluno sem login.
13. ACT-C-12 - Registrar evolucao do aluno.
14. ACT-C-18 - Editar comissao do professor.
15. ACT-C-19 - Criar horario aberto.
16. ACT-C-21 - Configurar regras de reposicao da academia.
17. ACT-C-22 - Publicar/editar pagina publica do local.
18. ACT-D-04 - Ver agenda semanal.
19. ACT-F-02 - Financeiro envia lembrete em lote.
20. ACT-E-04 - Editar estrutura publica do local.

## Testes P2 opcionais

- ACT-A-09 - Ver ranking e historico pessoal.
- ACT-D-07 - Ajustar disponibilidade.
- ACT-D-10 - Coach solo sem local completo.
- ACT-POS-02 - Cadastrar produto.
- Validar perfil `platform_admin` caso exista tela operacional propria.
- Validar rotas legadas `/locais/:placeId/admin` e `/t/:tournamentId`.
