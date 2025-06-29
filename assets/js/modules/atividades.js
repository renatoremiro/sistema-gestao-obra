 /* ==========================================================================
   MÓDULO ATIVIDADES - Sistema de Gestão v5.1
   ========================================================================== */

/**
 * Módulo responsável por toda a gestão de atividades do sistema
 * Inclui criação, edição, controle de status, responsáveis e integração com tarefas
 * 
 * FUNCIONALIDADES:
 * - CRUD completo de atividades
 * - Gestão de responsáveis e equipes
 * - Sistema de status automático baseado em prazos
 * - Progresso calculado automaticamente pelas tarefas
 * - Validações de prazos e dependências
 * - Templates de atividades predefinidos
 * - Histórico de mudanças e auditoria
 * - Relatórios e estatísticas
 * - Integração com calendário e agenda
 * 
 * ESTRUTURA DE DADOS:
 * - atividades: por área, com responsáveis, prazos, tarefas
 * - status: verde (em dia), amarelo (atenção), vermelho (atraso)
 * - progresso: calculado automaticamente pelas tarefas
 * - histórico: log de todas as alterações
 * 
 * @author Sistema de Gestão
 * @version 5.1
 */

// ========== EXPORTAÇÃO DO MÓDULO ==========
window.AtividadesModule = (function() {
    'use strict';

    // ========== VARIÁVEIS PRIVADAS ==========
    let dados = null;
    let estadoSistema = null;
    let atividadeCache = new Map();
    let intervalosMonitoramento = new Set();
    let templatesAtividades = new Map();

    // ========== CONSTANTES ==========
    const STATUS_ATIVIDADE = {
        verde: { label: 'Em Dia', icon: '🟢', color: '#10b981', prioridade: 1 },
        amarelo: { label: 'Atenção', icon: '🟡', color: '#f59e0b', prioridade: 2 },
        vermelho: { label: 'Atraso', icon: '🔴', color: '#ef4444', prioridade: 3 }
    };

    const TIPOS_ALTERACAO = {
        'criacao': 'Atividade criada',
        'edicao': 'Atividade editada',
        'status': 'Status alterado',
        'responsaveis': 'Responsáveis alterados',
        'prazo': 'Prazo alterado',
        'progresso': 'Progresso atualizado',
        'exclusao': 'Atividade excluída'
    };

    const AREAS_CORES = {
        'documentacao': '#8b5cf6',
        'planejamento': '#06b6d4',
        'producao': '#ef4444'
    };

    const PRAZO_ALERTAS = {
        critico: { dias: 0, cor: '#ef4444', icone: '🚨' },
        urgente: { dias: 1, cor: '#f59e0b', icone: '⚠️' },
        proximo: { dias: 3, cor: '#f59e0b', icone: '📅' },
        normal: { dias: 7, cor: '#10b981', icone: '✅' }
    };

    // ========== INICIALIZAÇÃO ==========
    function init(dadosGlobais, estadoGlobal) {
        console.log('📋 Inicializando módulo Atividades...');
        
        dados = dadosGlobais;
        estadoSistema = estadoGlobal;
        
        inicializarEstrutura();
        carregarTemplates();
        configurarEventListeners();
        iniciarMonitoramentoPrazos();
        
        console.log('✅ Módulo Atividades inicializado com sucesso');
        
        return {
            // Funções públicas expostas
            criarAtividade,
            editarAtividade,
            excluirAtividade,
            atualizarStatus,
            adicionarResponsavel,
            removerResponsavel,
            calcularProgresso,
            obterEstatisticas,
            renderizarAtividades,
            filtrarAtividades,
            aplicarTemplate,
            exportarAtividades,
            importarAtividades,
            obterHistorico,
            validarAtividade,
            duplicarAtividade,
            marcarConcluida,
            reabrirAtividade
        };
    }

    // ========== ESTRUTURA DE DADOS ==========
    function inicializarEstrutura() {
        if (!dados.areas) {
            dados.areas = {};
        }
        
        if (!dados.historicoAtividades) {
            dados.historicoAtividades = [];
        }
        
        if (!dados.configAtividades) {
            dados.configAtividades = {
                alertasPrazos: true,
                statusAutomatico: true,
                validacaoPrazos: true,
                progressoAutomatico: true
            };
        }
        
        // Garantir estrutura básica das áreas
        Object.values(dados.areas).forEach(area => {
            if (!area.atividades) {
                area.atividades = [];
            }
            
            // Migrar atividades antigas se necessário
            area.atividades.forEach(atividade => {
                garantirEstruturaAtividade(atividade);
            });
        });
    }

    function garantirEstruturaAtividade(atividade) {
        if (!atividade.id) {
            atividade.id = Date.now();
        }
        
        if (!atividade.tarefas) {
            atividade.tarefas = [];
        }
        
        if (!atividade.responsaveis) {
            atividade.responsaveis = [];
        }
        
        if (!atividade.progresso) {
            atividade.progresso = 0;
        }
        
        if (!atividade.dataAdicionado) {
            atividade.dataAdicionado = new Date().toISOString();
        }
        
        if (!atividade.historico) {
            atividade.historico = [];
        }
        
        if (!atividade.configuracoes) {
            atividade.configuracoes = {
                notificarPrazos: true,
                atualizarStatusAuto: true,
                calcularProgressoAuto: true
            };
        }
    }

    // ========== TEMPLATES DE ATIVIDADES ==========
    function carregarTemplates() {
        templatesAtividades.set('as-built', {
            nome: 'As Built Completo',
            descricao: 'Template padrão para levantamento As Built',
            area: 'documentacao',
            tarefas: [
                {
                    descricao: 'Levantamento de Campo',
                    prioridade: 'alta',
                    dependencias: [],
                    subtarefas: [
                        { descricao: 'Medição Térreo' },
                        { descricao: 'Medição 1º Pavimento' },
                        { descricao: 'Medição 2º Pavimento' },
                        { descricao: 'Conferência de Medidas' }
                    ]
                },
                {
                    descricao: 'Desenho Técnico',
                    prioridade: 'alta',
                    dependencias: ['Levantamento de Campo'],
                    subtarefas: [
                        { descricao: 'Plantas Baixas' },
                        { descricao: 'Cortes' },
                        { descricao: 'Fachadas' },
                        { descricao: 'Detalhamentos' }
                    ]
                },
                {
                    descricao: 'Revisão Técnica',
                    prioridade: 'media',
                    dependencias: ['Desenho Técnico'],
                    subtarefas: [
                        { descricao: 'Revisão Interna' },
                        { descricao: 'Correções' },
                        { descricao: 'Aprovação Coordenador' }
                    ]
                },
                {
                    descricao: 'Entrega Final',
                    prioridade: 'alta',
                    dependencias: ['Revisão Técnica'],
                    subtarefas: [
                        { descricao: 'Gerar PDFs' },
                        { descricao: 'Organizar Arquivos' },
                        { descricao: 'Upload no Sistema' },
                        { descricao: 'Notificar Cliente' }
                    ]
                }
            ],
            configuracoes: {
                prazoSugerido: 30, // dias
                responsaveisSugeridos: ['Renato', 'Bruna'],
                observacoes: 'Template completo para levantamento arquitetônico'
            }
        });

        templatesAtividades.set('relatorio-fotografico', {
            nome: 'Relatório Fotográfico',
            descricao: 'Template para relatórios fotográficos mensais',
            area: 'documentacao',
            tarefas: [
                {
                    descricao: 'Planejamento Fotográfico',
                    prioridade: 'media',
                    subtarefas: [
                        { descricao: 'Definir Pontos de Captura' },
                        { descricao: 'Agenda de Visitas' },
                        { descricao: 'Equipamentos Necessários' }
                    ]
                },
                {
                    descricao: 'Captura de Imagens',
                    prioridade: 'alta',
                    dependencias: ['Planejamento Fotográfico'],
                    subtarefas: [
                        { descricao: 'Fotos Externas' },
                        { descricao: 'Fotos Internas' },
                        { descricao: 'Detalhes Específicos' },
                        { descricao: 'Backup das Imagens' }
                    ]
                },
                {
                    descricao: 'Processamento e Entrega',
                    prioridade: 'alta',
                    dependencias: ['Captura de Imagens'],
                    subtarefas: [
                        { descricao: 'Tratamento das Imagens' },
                        { descricao: 'Montagem do Relatório' },
                        { descricao: 'Revisão Final' },
                        { descricao: 'Entrega ao Cliente' }
                    ]
                }
            ],
            configuracoes: {
                prazoSugerido: 15,
                responsaveisSugeridos: ['Bruna'],
                observacoes: 'Relatório mensal de acompanhamento fotográfico'
            }
        });

        templatesAtividades.set('cronograma-planejamento', {
            nome: 'Cronograma de Planejamento',
            descricao: 'Template para atividades de planejamento',
            area: 'planejamento',
            tarefas: [
                {
                    descricao: 'Levantamento de Dados',
                    prioridade: 'alta',
                    subtarefas: [
                        { descricao: 'Análise do Projeto' },
                        { descricao: 'Recursos Disponíveis' },
                        { descricao: 'Marcos do Projeto' }
                    ]
                },
                {
                    descricao: 'Estruturação do Cronograma',
                    prioridade: 'alta',
                    dependencias: ['Levantamento de Dados'],
                    subtarefas: [
                        { descricao: 'Atividades Principais' },
                        { descricao: 'Dependências' },
                        { descricao: 'Recursos e Durações' },
                        { descricao: 'Caminho Crítico' }
                    ]
                },
                {
                    descricao: 'Validação e Aprovação',
                    prioridade: 'media',
                    dependencias: ['Estruturação do Cronograma'],
                    subtarefas: [
                        { descricao: 'Revisão Técnica' },
                        { descricao: 'Apresentação para Equipe' },
                        { descricao: 'Ajustes Necessários' },
                        { descricao: 'Aprovação Final' }
                    ]
                }
            ],
            configuracoes: {
                prazoSugerido: 20,
                responsaveisSugeridos: ['Isabella', 'Lara'],
                observacoes: 'Template para desenvolvimento de cronogramas'
            }
        });

        console.log(`📋 ${templatesAtividades.size} templates de atividades carregados`);
    }

    // ========== CRUD DE ATIVIDADES ==========
    function criarAtividade(areaKey, dadosAtividade) {
        if (!dados.areas[areaKey]) {
            throw new Error(`Área ${areaKey} não encontrada`);
        }

        // Validar dados obrigatórios
        const validacao = validarAtividade(dadosAtividade);
        if (!validacao.valida) {
            throw new Error(`Dados inválidos: ${validacao.erros.join(', ')}`);
        }

        const novaAtividade = {
            id: Date.now(),
            nome: dadosAtividade.nome,
            prazo: dadosAtividade.prazo,
            responsaveis: dadosAtividade.responsaveis || [],
            status: calcularStatusInicial(dadosAtividade.prazo),
            progresso: 0,
            tarefas: [],
            dataAdicionado: new Date().toISOString(),
            criadoPor: estadoSistema.usuarioEmail || 'Sistema',
            historico: [],
            configuracoes: {
                notificarPrazos: true,
                atualizarStatusAuto: true,
                calcularProgressoAuto: true
            }
        };

        // Aplicar dados adicionais se fornecidos
        if (dadosAtividade.descricao) novaAtividade.descricao = dadosAtividade.descricao;
        if (dadosAtividade.prioridade) novaAtividade.prioridade = dadosAtividade.prioridade;
        if (dadosAtividade.categoria) novaAtividade.categoria = dadosAtividade.categoria;
        if (dadosAtividade.observacoes) novaAtividade.observacoes = dadosAtividade.observacoes;

        // Adicionar à área
        dados.areas[areaKey].atividades.push(novaAtividade);

        // Registrar no histórico
        adicionarHistorico(novaAtividade.id, 'criacao', {
            area: areaKey,
            nome: novaAtividade.nome,
            responsaveis: novaAtividade.responsaveis,
            prazo: novaAtividade.prazo
        });

        // Cache da atividade
        atividadeCache.set(novaAtividade.id, {
            atividade: novaAtividade,
            area: areaKey,
            timestamp: Date.now()
        });

        // Salvar dados
        if (window.StateModule && window.StateModule.salvarDados) {
            window.StateModule.salvarDados();
        }

        console.log(`✅ Atividade criada: ${novaAtividade.nome} (ID: ${novaAtividade.id})`);
        
        return novaAtividade;
    }

    function editarAtividade(atividadeId, areaKey, novosDados) {
        const atividade = encontrarAtividade(atividadeId, areaKey);
        if (!atividade) {
            throw new Error('Atividade não encontrada');
        }

        // Validar novos dados
        const dadosCompletos = { ...atividade, ...novosDados };
        const validacao = validarAtividade(dadosCompletos);
        if (!validacao.valida) {
            throw new Error(`Dados inválidos: ${validacao.erros.join(', ')}`);
        }

        // Backup dos dados originais para histórico
        const dadosOriginais = { ...atividade };

        // Aplicar alterações
        const alteracoes = [];
        
        if (novosDados.nome && novosDados.nome !== atividade.nome) {
            atividade.nome = novosDados.nome;
            alteracoes.push(`Nome: "${dadosOriginais.nome}" → "${novosDados.nome}"`);
        }

        if (novosDados.prazo && novosDados.prazo !== atividade.prazo) {
            const statusAnterior = atividade.status;
            atividade.prazo = novosDados.prazo;
            
            // Recalcular status se configurado
            if (atividade.configuracoes.atualizarStatusAuto) {
                atividade.status = calcularStatusPorPrazo(novosDados.prazo);
            }
            
            alteracoes.push(`Prazo: ${formatarData(dadosOriginais.prazo)} → ${formatarData(novosDados.prazo)}`);
            
            if (atividade.status !== statusAnterior) {
                alteracoes.push(`Status: ${STATUS_ATIVIDADE[statusAnterior].label} → ${STATUS_ATIVIDADE[atividade.status].label}`);
            }
        }

        if (novosDados.responsaveis && JSON.stringify(novosDados.responsaveis) !== JSON.stringify(atividade.responsaveis)) {
            atividade.responsaveis = [...novosDados.responsaveis];
            alteracoes.push(`Responsáveis: ${dadosOriginais.responsaveis.join(', ')} → ${novosDados.responsaveis.join(', ')}`);
        }

        if (novosDados.status && novosDados.status !== atividade.status) {
            const statusAnterior = atividade.status;
            atividade.status = novosDados.status;
            alteracoes.push(`Status: ${STATUS_ATIVIDADE[statusAnterior].label} → ${STATUS_ATIVIDADE[novosDados.status].label}`);
        }

        // Campos opcionais
        ['descricao', 'prioridade', 'categoria', 'observacoes'].forEach(campo => {
            if (novosDados[campo] !== undefined && novosDados[campo] !== atividade[campo]) {
                atividade[campo] = novosDados[campo];
                alteracoes.push(`${campo}: "${dadosOriginais[campo] || ''}" → "${novosDados[campo]}"`);
            }
        });

        // Registrar alterações
        atividade.atualizadoEm = new Date().toISOString();
        atividade.atualizadoPor = estadoSistema.usuarioEmail || 'Sistema';

        if (alteracoes.length > 0) {
            adicionarHistorico(atividadeId, 'edicao', {
                alteracoes: alteracoes,
                area: areaKey
            });

            // Atualizar cache
            atividadeCache.set(atividadeId, {
                atividade: atividade,
                area: areaKey,
                timestamp: Date.now()
            });

            // Salvar dados
            if (window.StateModule && window.StateModule.salvarDados) {
                window.StateModule.salvarDados();
            }

            console.log(`✏️ Atividade editada: ${atividade.nome} - ${alteracoes.length} alterações`);
        }

        return atividade;
    }

    function excluirAtividade(atividadeId, areaKey) {
        const atividade = encontrarAtividade(atividadeId, areaKey);
        if (!atividade) {
            throw new Error('Atividade não encontrada');
        }

        // Remover da área
        dados.areas[areaKey].atividades = dados.areas[areaKey].atividades.filter(a => a.id !== atividadeId);

        // Registrar exclusão
        adicionarHistorico(atividadeId, 'exclusao', {
            nome: atividade.nome,
            area: areaKey,
            responsaveis: atividade.responsaveis,
            totalTarefas: atividade.tarefas.length
        });

        // Remover do cache
        atividadeCache.delete(atividadeId);

        // Remover eventos relacionados do calendário
        if (dados.eventos) {
            dados.eventos = dados.eventos.filter(evento => 
                !evento.tarefasRelacionadas || 
                !evento.tarefasRelacionadas.some(tr => tr.atividadeId === atividadeId)
            );
        }

        // Salvar dados
        if (window.StateModule && window.StateModule.salvarDados) {
            window.StateModule.salvarDados();
        }

        console.log(`🗑️ Atividade excluída: ${atividade.nome} (ID: ${atividadeId})`);
        
        return true;
    }

    function duplicarAtividade(atividadeId, areaKey, novoNome = null) {
        const atividadeOriginal = encontrarAtividade(atividadeId, areaKey);
        if (!atividadeOriginal) {
            throw new Error('Atividade não encontrada');
        }

        const novaAtividade = {
            ...atividadeOriginal,
            id: Date.now(),
            nome: novoNome || `${atividadeOriginal.nome} (Cópia)`,
            status: 'verde',
            progresso: 0,
            dataAdicionado: new Date().toISOString(),
            criadoPor: estadoSistema.usuarioEmail || 'Sistema',
            historico: [],
            // Duplicar tarefas
            tarefas: atividadeOriginal.tarefas.map(tarefa => ({
                ...tarefa,
                id: `${Date.now()}_T${Math.random().toString(36).substr(2, 9)}`,
                status: 'pendente',
                subtarefas: tarefa.subtarefas ? tarefa.subtarefas.map(sub => ({
                    ...sub,
                    id: `${Date.now()}_S${Math.random().toString(36).substr(2, 9)}`,
                    status: 'pendente'
                })) : []
            }))
        };

        // Adicionar à área
        dados.areas[areaKey].atividades.push(novaAtividade);

        // Registrar no histórico
        adicionarHistorico(novaAtividade.id, 'criacao', {
            area: areaKey,
            nome: novaAtividade.nome,
            origem: 'duplicacao',
            atividadeOriginal: atividadeOriginal.nome
        });

        // Salvar dados
        if (window.StateModule && window.StateModule.salvarDados) {
            window.StateModule.salvarDados();
        }

        console.log(`📋 Atividade duplicada: ${novaAtividade.nome} (ID: ${novaAtividade.id})`);
        
        return novaAtividade;
    }

    // ========== GESTÃO DE STATUS ==========
    function atualizarStatus(atividadeId, areaKey, novoStatus, motivo = null) {
        const atividade = encontrarAtividade(atividadeId, areaKey);
        if (!atividade) {
            throw new Error('Atividade não encontrada');
        }

        const statusAnterior = atividade.status;
        atividade.status = novoStatus;
        atividade.atualizadoEm = new Date().toISOString();
        atividade.atualizadoPor = estadoSistema.usuarioEmail || 'Sistema';

        // Registrar alteração
        adicionarHistorico(atividadeId, 'status', {
            statusAnterior: statusAnterior,
            statusNovo: novoStatus,
            motivo: motivo,
            area: areaKey
        });

        // Atualizar cache
        atividadeCache.set(atividadeId, {
            atividade: atividade,
            area: areaKey,
            timestamp: Date.now()
        });

        // Salvar dados
        if (window.StateModule && window.StateModule.salvarDados) {
            window.StateModule.salvarDados();
        }

        console.log(`🔄 Status atualizado: ${atividade.nome} → ${STATUS_ATIVIDADE[novoStatus].label}`);
        
        return atividade;
    }

    function calcularStatusInicial(prazo) {
        return calcularStatusPorPrazo(prazo);
    }

    function calcularStatusPorPrazo(prazo) {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const dataPrazo = new Date(prazo);
        dataPrazo.setHours(0, 0, 0, 0);
        const diasRestantes = Math.floor((dataPrazo - hoje) / (1000 * 60 * 60 * 24));

        if (diasRestantes < 0) {
            return 'vermelho'; // Atrasado
        } else if (diasRestantes <= 3) {
            return 'amarelo'; // Atenção
        } else {
            return 'verde'; // Em dia
        }
    }

    function marcarConcluida(atividadeId, areaKey) {
        const atividade = encontrarAtividade(atividadeId, areaKey);
        if (!atividade) {
            throw new Error('Atividade não encontrada');
        }

        atividade.status = 'verde';
        atividade.progresso = 100;
        atividade.concluidaEm = new Date().toISOString();
        atividade.concluidaPor = estadoSistema.usuarioEmail || 'Sistema';

        // Marcar todas as tarefas como concluídas
        if (atividade.tarefas) {
            atividade.tarefas.forEach(tarefa => {
                tarefa.status = 'concluida';
                if (tarefa.subtarefas) {
                    tarefa.subtarefas.forEach(sub => {
                        sub.status = 'concluida';
                    });
                }
            });
        }

        // Registrar conclusão
        adicionarHistorico(atividadeId, 'conclusao', {
            area: areaKey,
            totalTarefas: atividade.tarefas.length
        });

        // Salvar dados
        if (window.StateModule && window.StateModule.salvarDados) {
            window.StateModule.salvarDados();
        }

        console.log(`✅ Atividade concluída: ${atividade.nome}`);
        
        return atividade;
    }

    function reabrirAtividade(atividadeId, areaKey, motivo = null) {
        const atividade = encontrarAtividade(atividadeId, areaKey);
        if (!atividade) {
            throw new Error('Atividade não encontrada');
        }

        atividade.status = calcularStatusPorPrazo(atividade.prazo);
        atividade.progresso = calcularProgresso(atividade);
        atividade.reabiertaEm = new Date().toISOString();
        atividade.reabiertaPor = estadoSistema.usuarioEmail || 'Sistema';

        // Remover marcadores de conclusão
        delete atividade.concluidaEm;
        delete atividade.concluidaPor;

        // Registrar reabertura
        adicionarHistorico(atividadeId, 'reabertura', {
            area: areaKey,
            motivo: motivo
        });

        // Salvar dados
        if (window.StateModule && window.StateModule.salvarDados) {
            window.StateModule.salvarDados();
        }

        console.log(`🔄 Atividade reaberta: ${atividade.nome}`);
        
        return atividade;
    }

    // ========== GESTÃO DE RESPONSÁVEIS ==========
    function adicionarResponsavel(atividadeId, areaKey, nomeResponsavel) {
        const atividade = encontrarAtividade(atividadeId, areaKey);
        if (!atividade) {
            throw new Error('Atividade não encontrada');
        }

        if (!atividade.responsaveis.includes(nomeResponsavel)) {
            atividade.responsaveis.push(nomeResponsavel);
            atividade.atualizadoEm = new Date().toISOString();

            adicionarHistorico(atividadeId, 'responsaveis', {
                acao: 'adicionar',
                responsavel: nomeResponsavel,
                area: areaKey
            });

            // Salvar dados
            if (window.StateModule && window.StateModule.salvarDados) {
                window.StateModule.salvarDados();
            }

            console.log(`👤 Responsável adicionado: ${nomeResponsavel} → ${atividade.nome}`);
        }

        return atividade;
    }

    function removerResponsavel(atividadeId, areaKey, nomeResponsavel) {
        const atividade = encontrarAtividade(atividadeId, areaKey);
        if (!atividade) {
            throw new Error('Atividade não encontrada');
        }

        if (atividade.responsaveis.length <= 1) {
            throw new Error('Não é possível remover o único responsável');
        }

        const index = atividade.responsaveis.indexOf(nomeResponsavel);
        if (index > -1) {
            atividade.responsaveis.splice(index, 1);
            atividade.atualizadoEm = new Date().toISOString();

            adicionarHistorico(atividadeId, 'responsaveis', {
                acao: 'remover',
                responsavel: nomeResponsavel,
                area: areaKey
            });

            // Salvar dados
            if (window.StateModule && window.StateModule.salvarDados) {
                window.StateModule.salvarDados();
            }

            console.log(`❌ Responsável removido: ${nomeResponsavel} ← ${atividade.nome}`);
        }

        return atividade;
    }

    // ========== CÁLCULO DE PROGRESSO ==========
    function calcularProgresso(atividade) {
        if (!atividade.tarefas || atividade.tarefas.length === 0) {
            return atividade.progresso || 0;
        }

        let totalSubtarefas = 0;
        let subtarefasConcluidas = 0;

        atividade.tarefas.forEach(tarefa => {
            if (tarefa.subtarefas && tarefa.subtarefas.length > 0) {
                totalSubtarefas += tarefa.subtarefas.length;
                subtarefasConcluidas += tarefa.subtarefas.filter(st => st.status === 'concluida').length;
            } else {
                totalSubtarefas += 1;
                if (tarefa.status === 'concluida') subtarefasConcluidas += 1;
            }
        });

        const progresso = totalSubtarefas > 0 ? Math.round((subtarefasConcluidas / totalSubtarefas) * 100) : 0;

        // Atualizar progresso na atividade se configurado
        if (atividade.configuracoes && atividade.configuracoes.calcularProgressoAuto) {
            const progressoAnterior = atividade.progresso;
            atividade.progresso = progresso;

            if (progresso !== progressoAnterior) {
                adicionarHistorico(atividade.id, 'progresso', {
                    progressoAnterior: progressoAnterior,
                    progressoNovo: progresso,
                    totalTarefas: totalSubtarefas,
                    tarefasConcluidas: subtarefasConcluidas
                });
            }
        }

        return progresso;
    }

    function atualizarProgressoTodasAtividades() {
        let atualizadas = 0;

        Object.values(dados.areas).forEach(area => {
            area.atividades.forEach(atividade => {
                if (atividade.configuracoes && atividade.configuracoes.calcularProgressoAuto) {
                    const progressoAnterior = atividade.progresso;
                    const progressoNovo = calcularProgresso(atividade);

                    if (progressoAnterior !== progressoNovo) {
                        atualizadas++;
                    }
                }
            });
        });

        if (atualizadas > 0) {
            if (window.StateModule && window.StateModule.salvarDados) {
                window.StateModule.salvarDados();
            }
            console.log(`📊 ${atualizadas} atividades tiveram progresso atualizado`);
        }

        return atualizadas;
    }

    // ========== RENDERIZAÇÃO ==========
    function renderizarAtividades(areaKey, filtros = {}) {
        const area = dados.areas[areaKey];
        if (!area) return '';

        let atividades = [...area.atividades];

        // Aplicar filtros
        if (filtros.status && filtros.status !== 'todos') {
            atividades = atividades.filter(a => a.status === filtros.status);
        }

        if (filtros.responsavel) {
            atividades = atividades.filter(a => a.responsaveis.includes(filtros.responsavel));
        }

        if (filtros.prazo) {
            const hoje = new Date();
            atividades = atividades.filter(a => {
                const diasRestantes = calcularDiasRestantes(a.prazo);
                switch (filtros.prazo) {
                    case 'vencidos': return diasRestantes < 0;
                    case 'hoje': return diasRestantes === 0;
                    case 'semana': return diasRestantes <= 7 && diasRestantes >= 0;
                    case 'mes': return diasRestantes <= 30 && diasRestantes >= 0;
                    default: return true;
                }
            });
        }

        if (filtros.busca) {
            const termo = filtros.busca.toLowerCase();
            atividades = atividades.filter(a => 
                a.nome.toLowerCase().includes(termo) ||
                a.responsaveis.some(r => r.toLowerCase().includes(termo)) ||
                (a.descricao && a.descricao.toLowerCase().includes(termo))
            );
        }

        // Ordenar atividades
        atividades.sort((a, b) => {
            if (filtros.ordenacao === 'prazo') {
                return new Date(a.prazo) - new Date(b.prazo);
            } else if (filtros.ordenacao === 'status') {
                return STATUS_ATIVIDADE[b.status].prioridade - STATUS_ATIVIDADE[a.status].prioridade;
            } else if (filtros.ordenacao === 'progresso') {
                return (b.progresso || 0) - (a.progresso || 0);
            } else {
                // Padrão: mais recentes primeiro
                return new Date(b.dataAdicionado) - new Date(a.dataAdicionado);
            }
        });

        // Renderizar cada atividade
        return atividades.map(atividade => renderizarAtividade(atividade, areaKey)).join('');
    }

    function renderizarAtividade(atividade, areaKey) {
        const diasRestantes = calcularDiasRestantes(atividade.prazo);
        const alertaPrazo = obterAlertaPrazo(diasRestantes);
        const statusConfig = STATUS_ATIVIDADE[atividade.status];
        const foiAdicionadoRecentemente = verificarSeERecente(atividade.dataAdicionado);
        const progresso = calcularProgresso(atividade);

        return `
            <div class="atividade-item" data-atividade-id="${atividade.id}" data-area="${areaKey}">
                <div class="atividade-header">
                    <div class="atividade-info">
                        <span class="status-indicator status-${atividade.status}" title="${statusConfig.label}"></span>
                        <h4 class="atividade-nome">${atividade.nome}</h4>
                        
                        <div class="atividade-badges">
                            ${alertaPrazo.tipo !== 'normal' ? `
                                <span class="badge-prazo badge-${alertaPrazo.tipo}" title="${alertaPrazo.texto}">
                                    ${alertaPrazo.icone} ${alertaPrazo.tipo === 'critico' ? 'CRÍTICO' : alertaPrazo.tipo.toUpperCase()}
                                </span>
                            ` : ''}
                            
                            ${foiAdicionadoRecentemente ? '<span class="badge-novo">NOVO</span>' : ''}
                            
                            ${atividade.prioridade === 'alta' ? '<span class="badge-prioridade">⚡ ALTA</span>' : ''}
                            
                            ${progresso === 100 ? '<span class="badge-concluida">✅ CONCLUÍDA</span>' : ''}
                        </div>
                    </div>
                    
                    <div class="atividade-acoes">
                        <button class="btn btn-primary btn-sm" onclick="gerenciarTarefas(${atividade.id})" title="Gerenciar Tarefas">
                            📋 Tarefas
                        </button>
                        <button class="btn btn-secondary btn-sm" onclick="AtividadesModule.editarAtividade(${atividade.id}, '${areaKey}')" title="Editar">
                            ✏️
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="AtividadesModule.excluirAtividade(${atividade.id}, '${areaKey}')" title="Excluir">
                            🗑️
                        </button>
                        <div class="dropdown-acoes">
                            <button class="btn btn-secondary btn-sm dropdown-toggle" onclick="toggleDropdownAcoes(${atividade.id})">
                                ⋮
                            </button>
                            <div class="dropdown-menu" id="dropdown-${atividade.id}">
                                <a onclick="AtividadesModule.duplicarAtividade(${atividade.id}, '${areaKey}')">📋 Duplicar</a>
                                ${progresso < 100 ? `
                                    <a onclick="AtividadesModule.marcarConcluida(${atividade.id}, '${areaKey}')">✅ Marcar Concluída</a>
                                ` : `
                                    <a onclick="AtividadesModule.reabrirAtividade(${atividade.id}, '${areaKey}')">🔄 Reabrir</a>
                                `}
                                <a onclick="verHistorico(${atividade.id})">📜 Histórico</a>
                                <a onclick="exportarAtividade(${atividade.id}, '${areaKey}')">📥 Exportar</a>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="atividade-detalhes">
                    <div class="atividade-meta">
                        <span class="atividade-prazo">
                            📅 Prazo: ${formatarData(atividade.prazo)} 
                            <span class="prazo-texto" style="color: ${alertaPrazo.cor};">${alertaPrazo.texto}</span>
                        </span>
                        <span class="atividade-responsaveis">
                            👥 ${atividade.responsaveis.join(', ')}
                        </span>
                        ${atividade.categoria ? `
                            <span class="atividade-categoria">
                                🏷️ ${atividade.categoria}
                            </span>
                        ` : ''}
                    </div>
                    
                    ${atividade.descricao ? `
                        <div class="atividade-descricao">
                            ${atividade.descricao}
                        </div>
                    ` : ''}
                </div>
                
                <div class="atividade-progresso">
                    <div class="progresso-controles">
                        <select class="status-select" onchange="AtividadesModule.atualizarStatus(${atividade.id}, '${areaKey}', this.value)" title="Alterar Status">
                            <option value="verde" ${atividade.status === 'verde' ? 'selected' : ''}>🟢 Em Dia</option>
                            <option value="amarelo" ${atividade.status === 'amarelo' ? 'selected' : ''}>🟡 Atenção</option>
                            <option value="vermelho" ${atividade.status === 'vermelho' ? 'selected' : ''}>🔴 Atraso</option>
                        </select>
                    </div>
                    
                    <div class="progresso-visual">
                        <span class="progresso-label">Progresso:</span>
                        <input type="number" value="${progresso}" min="0" max="100" readonly 
                               class="progresso-input" title="Calculado automaticamente pelas tarefas">
                        <span class="progresso-percent">%</span>
                        <div class="progresso-barra">
                            <div class="progresso-fill" style="width: ${progresso}%; background: ${statusConfig.color};"></div>
                        </div>
                    </div>
                </div>
                
                ${renderizarResumoTarefas(atividade)}
                
                ${atividade.observacoes ? `
                    <div class="atividade-observacoes">
                        <strong>Observações:</strong> ${atividade.observacoes}
                    </div>
                ` : ''}
            </div>
        `;
    }

    function renderizarResumoTarefas(atividade) {
        if (!atividade.tarefas || atividade.tarefas.length === 0) {
            return `
                <div class="resumo-tarefas vazio">
                    ⚠️ Nenhuma tarefa definida. 
                    <a href="#" onclick="gerenciarTarefas(${atividade.id})" style="color: #3b82f6;">Adicionar tarefas</a>
                </div>
            `;
        }

        const totalTarefas = atividade.tarefas.length;
        const tarefasConcluidas = atividade.tarefas.filter(t => t.status === 'concluida').length;
        const tarefasBloqueadas = contarTarefasBloqueadas(atividade);
        const proximaTarefa = obterProximaTarefa(atividade);

        return `
            <div class="resumo-tarefas">
                <div class="resumo-estatisticas">
                    <span class="contador-tarefas">
                        ✅ ${tarefasConcluidas}/${totalTarefas} tarefas
                    </span>
                    ${tarefasBloqueadas > 0 ? `
                        <span class="tarefas-bloqueadas">
                            🔒 ${tarefasBloqueadas} bloqueadas
                        </span>
                    ` : ''}
                    ${proximaTarefa ? `
                        <span class="proxima-tarefa">
                            ⏭️ Próxima: <strong>${proximaTarefa.descricao}</strong>
                        </span>
                    ` : ''}
                </div>
            </div>
        `;
    }

    // ========== FILTROS E BUSCA ==========
    function filtrarAtividades(filtros) {
        let todasAtividades = [];

        Object.entries(dados.areas).forEach(([areaKey, area]) => {
            area.atividades.forEach(atividade => {
                todasAtividades.push({
                    ...atividade,
                    areaKey: areaKey,
                    areaNome: area.nome
                });
            });
        });

        // Aplicar filtros
        if (filtros.status && filtros.status !== 'todos') {
            todasAtividades = todasAtividades.filter(a => a.status === filtros.status);
        }

        if (filtros.responsavel) {
            todasAtividades = todasAtividades.filter(a => 
                a.responsaveis.some(r => r.toLowerCase().includes(filtros.responsavel.toLowerCase()))
            );
        }

        if (filtros.area && filtros.area !== 'todas') {
            todasAtividades = todasAtividades.filter(a => a.areaKey === filtros.area);
        }

        if (filtros.prazo) {
            todasAtividades = todasAtividades.filter(a => {
                const diasRestantes = calcularDiasRestantes(a.prazo);
                switch (filtros.prazo) {
                    case 'vencidos': return diasRestantes < 0;
                    case 'hoje': return diasRestantes === 0;
                    case 'semana': return diasRestantes <= 7 && diasRestantes >= 0;
                    case 'mes': return diasRestantes <= 30 && diasRestantes >= 0;
                    default: return true;
                }
            });
        }

        if (filtros.progresso) {
            todasAtividades = todasAtividades.filter(a => {
                const prog = calcularProgresso(a);
                switch (filtros.progresso) {
                    case 'nao-iniciado': return prog === 0;
                    case 'em-andamento': return prog > 0 && prog < 100;
                    case 'concluido': return prog === 100;
                    default: return true;
                }
            });
        }

        if (filtros.busca) {
            const termo = filtros.busca.toLowerCase();
            todasAtividades = todasAtividades.filter(a => 
                a.nome.toLowerCase().includes(termo) ||
                a.responsaveis.some(r => r.toLowerCase().includes(termo)) ||
                (a.descricao && a.descricao.toLowerCase().includes(termo)) ||
                a.areaNome.toLowerCase().includes(termo)
            );
        }

        return todasAtividades;
    }

    // ========== TEMPLATES ==========
    function aplicarTemplate(templateNome, areaKey, dadosPersonalizacao = {}) {
        const template = templatesAtividades.get(templateNome);
        if (!template) {
            throw new Error(`Template ${templateNome} não encontrado`);
        }

        const dadosAtividade = {
            nome: dadosPersonalizacao.nome || template.nome,
            descricao: dadosPersonalizacao.descricao || template.descricao,
            responsaveis: dadosPersonalizacao.responsaveis || template.configuracoes.responsaveisSugeridos,
            prazo: dadosPersonalizacao.prazo || calcularPrazoSugerido(template.configuracoes.prazoSugerido),
            categoria: template.nome,
            observacoes: template.configuracoes.observacoes
        };

        const novaAtividade = criarAtividade(areaKey, dadosAtividade);

        // Aplicar tarefas do template
        if (template.tarefas && template.tarefas.length > 0) {
            novaAtividade.tarefas = template.tarefas.map((tarefa, index) => ({
                id: `${novaAtividade.id}_T${Date.now()}_${index}`,
                descricao: tarefa.descricao,
                tipo: 'tarefa',
                status: 'pendente',
                prioridade: tarefa.prioridade || 'media',
                responsavel: novaAtividade.responsaveis[0] || '',
                dependencias: tarefa.dependencias || [],
                observacoes: tarefa.observacoes || '',
                subtarefas: tarefa.subtarefas ? tarefa.subtarefas.map((sub, subIndex) => ({
                    id: `${novaAtividade.id}_T${Date.now()}_${index}_S${subIndex}`,
                    descricao: sub.descricao,
                    tipo: 'subtarefa',
                    status: 'pendente',
                    responsavel: novaAtividade.responsaveis[0] || ''
                })) : []
            }));

            // Salvar dados atualizados
            if (window.StateModule && window.StateModule.salvarDados) {
                window.StateModule.salvarDados();
            }
        }

        console.log(`📋 Template aplicado: ${template.nome} → ${novaAtividade.nome}`);
        
        return novaAtividade;
    }

    function obterTemplatesDisponiveis(areaKey = null) {
        const templates = Array.from(templatesAtividades.values());
        
        if (areaKey) {
            return templates.filter(t => t.area === areaKey);
        }
        
        return templates;
    }

    // ========== ESTATÍSTICAS ==========
    function obterEstatisticas(areaKey = null) {
        let atividades = [];

        if (areaKey && dados.areas[areaKey]) {
            atividades = dados.areas[areaKey].atividades;
        } else {
            Object.values(dados.areas).forEach(area => {
                atividades = atividades.concat(area.atividades);
            });
        }

        const stats = {
            total: atividades.length,
            status: {
                verde: atividades.filter(a => a.status === 'verde').length,
                amarelo: atividades.filter(a => a.status === 'amarelo').length,
                vermelho: atividades.filter(a => a.status === 'vermelho').length
            },
            prazos: {
                vencidos: 0,
                hoje: 0,
                semana: 0,
                mes: 0
            },
            progresso: {
                naoIniciado: 0,
                emAndamento: 0,
                concluido: 0
            },
            responsaveis: new Map(),
            categorias: new Map()
        };

        const hoje = new Date();
        
        atividades.forEach(atividade => {
            // Estatísticas de prazos
            const diasRestantes = calcularDiasRestantes(atividade.prazo);
            if (diasRestantes < 0) stats.prazos.vencidos++;
            else if (diasRestantes === 0) stats.prazos.hoje++;
            else if (diasRestantes <= 7) stats.prazos.semana++;
            else if (diasRestantes <= 30) stats.prazos.mes++;

            // Estatísticas de progresso
            const progresso = calcularProgresso(atividade);
            if (progresso === 0) stats.progresso.naoIniciado++;
            else if (progresso === 100) stats.progresso.concluido++;
            else stats.progresso.emAndamento++;

            // Responsáveis
            atividade.responsaveis.forEach(responsavel => {
                const atual = stats.responsaveis.get(responsavel) || 0;
                stats.responsaveis.set(responsavel, atual + 1);
            });

            // Categorias
            if (atividade.categoria) {
                const atual = stats.categorias.get(atividade.categoria) || 0;
                stats.categorias.set(atividade.categoria, atual + 1);
            }
        });

        // Converter Maps para objetos
        stats.responsaveis = Object.fromEntries(stats.responsaveis);
        stats.categorias = Object.fromEntries(stats.categorias);

        return stats;
    }

    // ========== HISTÓRICO E AUDITORIA ==========
    function adicionarHistorico(atividadeId, tipo, dados) {
        const entrada = {
            id: Date.now(),
            atividadeId: atividadeId,
            tipo: tipo,
            dados: dados,
            usuario: estadoSistema.usuarioEmail || 'Sistema',
            timestamp: new Date().toISOString()
        };

        dados.historicoAtividades.push(entrada);

        // Manter apenas os últimos 1000 registros
        if (dados.historicoAtividades.length > 1000) {
            dados.historicoAtividades = dados.historicoAtividades.slice(-1000);
        }

        console.log(`📜 Histórico adicionado: ${TIPOS_ALTERACAO[tipo]} - Atividade ${atividadeId}`);
    }

    function obterHistorico(atividadeId = null, limite = 50) {
        let historico = [...dados.historicoAtividades];

        if (atividadeId) {
            historico = historico.filter(h => h.atividadeId === atividadeId);
        }

        // Ordenar por timestamp (mais recente primeiro)
        historico.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        return historico.slice(0, limite);
    }

    // ========== VALIDAÇÕES ==========
    function validarAtividade(dadosAtividade) {
        const erros = [];

        // Nome obrigatório
        if (!dadosAtividade.nome || dadosAtividade.nome.trim().length < 3) {
            erros.push('Nome deve ter pelo menos 3 caracteres');
        }

        // Prazo obrigatório e válido
        if (!dadosAtividade.prazo) {
            erros.push('Prazo é obrigatório');
        } else {
            const prazoData = new Date(dadosAtividade.prazo);
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);
            
            if (prazoData < hoje && dados.configAtividades.validacaoPrazos) {
                erros.push('Prazo não pode ser no passado');
            }
        }

        // Responsáveis obrigatórios
        if (!dadosAtividade.responsaveis || dadosAtividade.responsaveis.length === 0) {
            erros.push('Pelo menos um responsável é obrigatório');
        }

        // Validar responsáveis existentes
        if (dadosAtividade.responsaveis && dados.areas) {
            const membrosValidos = new Set();
            Object.values(dados.areas).forEach(area => {
                area.equipe?.forEach(membro => {
                    membrosValidos.add(membro.nome);
                });
            });

            const responsaveisInvalidos = dadosAtividade.responsaveis.filter(r => !membrosValidos.has(r));
            if (responsaveisInvalidos.length > 0) {
                erros.push(`Responsáveis inválidos: ${responsaveisInvalidos.join(', ')}`);
            }
        }

        return {
            valida: erros.length === 0,
            erros: erros
        };
    }

    // ========== MONITORAMENTO AUTOMÁTICO ==========
    function iniciarMonitoramentoPrazos() {
        // Verificação inicial
        verificarPrazosAutomatico();
        
        // Configurar intervalo de verificação (a cada hora)
        const interval = setInterval(() => {
            verificarPrazosAutomatico();
        }, 60 * 60 * 1000);
        
        intervalosMonitoramento.add(interval);
        
        console.log('⏰ Monitoramento automático de prazos iniciado');
    }

    function verificarPrazosAutomatico() {
        if (!dados.configAtividades.statusAutomatico) return;

        let atividadesAtualizadas = 0;

        Object.values(dados.areas).forEach(area => {
            area.atividades.forEach(atividade => {
                if (!atividade.configuracoes || !atividade.configuracoes.atualizarStatusAuto) return;

                const statusAnterior = atividade.status;
                const novoStatus = calcularStatusPorPrazo(atividade.prazo);

                if (statusAnterior !== novoStatus) {
                    atividade.status = novoStatus;
                    atividade.atualizadoEm = new Date().toISOString();
                    atividade.atualizadoPor = 'Sistema Automático';

                    adicionarHistorico(atividade.id, 'status', {
                        statusAnterior: statusAnterior,
                        statusNovo: novoStatus,
                        motivo: 'Atualização automática por prazo',
                        automatica: true
                    });

                    atividadesAtualizadas++;
                }
            });
        });

        if (atividadesAtualizadas > 0) {
            if (window.StateModule && window.StateModule.salvarDados) {
                window.StateModule.salvarDados();
            }
            console.log(`🔄 ${atividadesAtualizadas} atividades atualizadas automaticamente`);
        }

        // Atualizar progresso também
        atualizarProgressoTodasAtividades();
    }

    // ========== UTILITÁRIOS ==========
    function encontrarAtividade(atividadeId, areaKey = null) {
        if (areaKey && dados.areas[areaKey]) {
            return dados.areas[areaKey].atividades.find(a => a.id === atividadeId);
        }

        // Buscar em todas as áreas
        for (const area of Object.values(dados.areas)) {
            const atividade = area.atividades.find(a => a.id === atividadeId);
            if (atividade) return atividade;
        }

        return null;
    }

    function calcularDiasRestantes(prazo) {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const dataPrazo = new Date(prazo);
        dataPrazo.setHours(0, 0, 0, 0);
        return Math.floor((dataPrazo - hoje) / (1000 * 60 * 60 * 24));
    }

    function obterAlertaPrazo(diasRestantes) {
        if (diasRestantes < 0) {
            return {
                tipo: 'critico',
                cor: PRAZO_ALERTAS.critico.cor,
                icone: PRAZO_ALERTAS.critico.icone,
                texto: `Atrasado ${Math.abs(diasRestantes)} dias`
            };
        } else if (diasRestantes === 0) {
            return {
                tipo: 'urgente',
                cor: PRAZO_ALERTAS.urgente.cor,
                icone: PRAZO_ALERTAS.urgente.icone,
                texto: 'Vence hoje!'
            };
        } else if (diasRestantes <= 3) {
            return {
                tipo: 'proximo',
                cor: PRAZO_ALERTAS.proximo.cor,
                icone: PRAZO_ALERTAS.proximo.icone,
                texto: `${diasRestantes} dias restantes`
            };
        } else {
            return {
                tipo: 'normal',
                cor: PRAZO_ALERTAS.normal.cor,
                icone: PRAZO_ALERTAS.normal.icone,
                texto: `${diasRestantes} dias restantes`
            };
        }
    }

    function verificarSeERecente(dataAdicionado) {
        if (!dataAdicionado) return false;
        return (new Date() - new Date(dataAdicionado)) < 24 * 60 * 60 * 1000;
    }

    function formatarData(data) {
        const d = new Date(data);
        return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
    }

    function calcularPrazoSugerido(dias) {
        const data = new Date();
        data.setDate(data.getDate() + dias);
        return data.toISOString().split('T')[0];
    }

    function contarTarefasBloqueadas(atividade) {
        if (!atividade.tarefas) return 0;
        
        return atividade.tarefas.filter(tarefa => {
            if (!tarefa.dependencias || tarefa.dependencias.length === 0) return false;
            
            return tarefa.dependencias.some(dep => {
                const tarefaDependente = atividade.tarefas.find(t => t.descricao === dep);
                return tarefaDependente && tarefaDependente.status !== 'concluida';
            });
        }).length;
    }

    function obterProximaTarefa(atividade) {
        if (!atividade.tarefas) return null;
        
        return atividade.tarefas.find(tarefa => {
            if (tarefa.status === 'concluida') return false;
            
            if (tarefa.dependencias && tarefa.dependencias.length > 0) {
                const bloqueada = tarefa.dependencias.some(dep => {
                    const tarefaDependente = atividade.tarefas.find(t => t.descricao === dep);
                    return tarefaDependente && tarefaDependente.status !== 'concluida';
                });
                if (bloqueada) return false;
            }
            
            return true;
        });
    }

    // ========== EXPORTAÇÃO/IMPORTAÇÃO ==========
    function exportarAtividades(areaKey = null) {
        let atividades = [];
        
        if (areaKey && dados.areas[areaKey]) {
            atividades = dados.areas[areaKey].atividades;
        } else {
            Object.entries(dados.areas).forEach(([key, area]) => {
                area.atividades.forEach(atividade => {
                    atividades.push({
                        ...atividade,
                        area: key,
                        areaNome: area.nome
                    });
                });
            });
        }

        const exportData = {
            atividades: atividades,
            estatisticas: obterEstatisticas(areaKey),
            historico: obterHistorico(null, 100),
            exportadoEm: new Date().toISOString(),
            versao: '5.1'
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `atividades-${areaKey || 'todas'}-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);

        console.log(`📥 Atividades exportadas: ${atividades.length} itens`);
    }

    function importarAtividades(dadosImportacao, areaKey = null) {
        if (!dadosImportacao.atividades) {
            throw new Error('Dados de importação inválidos');
        }

        let importadas = 0;
        let erros = [];

        dadosImportacao.atividades.forEach(atividadeImportada => {
            try {
                const area = areaKey || atividadeImportada.area;
                if (!dados.areas[area]) {
                    erros.push(`Área ${area} não encontrada para atividade ${atividadeImportada.nome}`);
                    return;
                }

                // Gerar novo ID para evitar conflitos
                const novaAtividade = {
                    ...atividadeImportada,
                    id: Date.now() + importadas,
                    dataAdicionado: new Date().toISOString(),
                    criadoPor: estadoSistema.usuarioEmail || 'Importação'
                };

                delete novaAtividade.area;
                delete novaAtividade.areaNome;

                garantirEstruturaAtividade(novaAtividade);
                dados.areas[area].atividades.push(novaAtividade);

                adicionarHistorico(novaAtividade.id, 'criacao', {
                    area: area,
                    origem: 'importacao',
                    nome: novaAtividade.nome
                });

                importadas++;

            } catch (error) {
                erros.push(`Erro ao importar ${atividadeImportada.nome}: ${error.message}`);
            }
        });

        if (importadas > 0) {
            if (window.StateModule && window.StateModule.salvarDados) {
                window.StateModule.salvarDados();
            }
        }

        console.log(`📤 Importação concluída: ${importadas} atividades importadas, ${erros.length} erros`);

        return {
            importadas: importadas,
            erros: erros
        };
    }

    // ========== EVENT LISTENERS ==========
    function configurarEventListeners() {
        // Salvar dados ao detectar mudanças
        document.addEventListener('change', (e) => {
            if (e.target && e.target.classList.contains('status-select')) {
                // Status já é salvo pela função de callback
            }
        });

        // Atalhos de teclado
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'A') {
                e.preventDefault();
                console.log('📊 Estatísticas:', obterEstatisticas());
            }
        });
    }

    // ========== LIMPEZA ==========
    function destruir() {
        intervalosMonitoramento.forEach(interval => clearInterval(interval));
        intervalosMonitoramento.clear();
        atividadeCache.clear();
        templatesAtividades.clear();
        
        console.log('🧹 Módulo Atividades destruído');
    }

    // ========== EXPOSIÇÃO PÚBLICA ==========
    return {
        init,
        criarAtividade,
        editarAtividade,
        excluirAtividade,
        atualizarStatus,
        adicionarResponsavel,
        removerResponsavel,
        calcularProgresso,
        obterEstatisticas,
        renderizarAtividades,
        filtrarAtividades,
        aplicarTemplate,
        exportarAtividades,
        importarAtividades,
        obterHistorico,
        validarAtividade,
        duplicarAtividade,
        marcarConcluida,
        reabrirAtividade,
        obterTemplatesDisponiveis,
        destruir
    };

})();
