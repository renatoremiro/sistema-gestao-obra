/* ==========================================================================
   MÓDULO RELATÓRIOS - Sistema de Gestão v5.1
   ========================================================================== */

/**
 * Módulo responsável por toda geração de relatórios e estatísticas do sistema
 * Inclui relatórios executivos, operacionais, gráficos e exportações
 * 
 * FUNCIONALIDADES:
 * - Relatórios executivos (dashboards, KPIs)
 * - Relatórios operacionais (atividades, tarefas, prazos)
 * - Relatórios de desempenho por pessoa/área
 * - Gráficos e visualizações dinâmicas
 * - Exportação em múltiplos formatos (PDF, Excel, JSON)
 * - Relatórios agendados e automáticos
 * - Histórico e auditoria
 * - Comparativos temporais
 * - Alertas e notificações baseadas em métricas
 * 
 * TIPOS DE RELATÓRIOS:
 * - Executivo: Visão geral para gestores
 * - Operacional: Detalhado para coordenadores
 * - Individual: Performance pessoal
 * - Temporal: Comparativos mensais/semanais
 * - Prazos: Alertas e monitoramento
 * - Qualidade: Índices de retrabalho e eficiência
 * 
 * @author Sistema de Gestão
 * @version 5.1
 */

// ========== EXPORTAÇÃO DO MÓDULO ==========
window.RelatoriosModule = (function() {
    'use strict';

    // ========== VARIÁVEIS PRIVADAS ==========
    let dados = null;
    let estadoSistema = null;
    let relatoriosCache = new Map();
    let agendamentosRelatorios = new Set();
    let configRelatorios = {
        atualizacaoAutomatica: true,
        intervaloPadrao: 30000, // 30 segundos
        manterHistorico: 30, // dias
        formatoPadrao: 'html'
    };

    // ========== CONSTANTES ==========
    const TIPOS_RELATORIO = {
        'executivo': {
            nome: 'Relatório Executivo',
            descricao: 'Visão geral para gestores',
            icone: '📊',
            nivel: 'high',
            atualizacao: 'diaria'
        },
        'operacional': {
            nome: 'Relatório Operacional',
            descricao: 'Detalhado para coordenadores',
            icone: '📋',
            nivel: 'medium',
            atualizacao: 'tempo-real'
        },
        'individual': {
            nome: 'Performance Individual',
            descricao: 'Relatório pessoal de atividades',
            icone: '👤',
            nivel: 'low',
            atualizacao: 'semanal'
        },
        'temporal': {
            nome: 'Análise Temporal',
            descricao: 'Comparativos históricos',
            icone: '📈',
            nivel: 'medium',
            atualizacao: 'mensal'
        },
        'prazos': {
            nome: 'Monitoramento de Prazos',
            descricao: 'Alertas e vencimentos',
            icone: '⏰',
            nivel: 'high',
            atualizacao: 'tempo-real'
        },
        'qualidade': {
            nome: 'Índices de Qualidade',
            descricao: 'Eficiência e retrabalho',
            icone: '⭐',
            nivel: 'medium',
            atualizacao: 'semanal'
        }
    };

    const METRICAS_KPI = {
        'eficiencia_geral': {
            nome: 'Eficiência Geral',
            formula: 'atividades_concluidas / total_atividades',
            meta: 0.85,
            formato: 'percentual'
        },
        'pontualidade': {
            nome: 'Pontualidade',
            formula: 'entregas_no_prazo / total_entregas',
            meta: 0.90,
            formato: 'percentual'
        },
        'produtividade': {
            nome: 'Produtividade',
            formula: 'tarefas_concluidas / tempo_trabalhado',
            meta: 5.0,
            formato: 'numero'
        },
        'qualidade': {
            nome: 'Índice de Qualidade',
            formula: '(entregas_sem_retrabalho / total_entregas)',
            meta: 0.95,
            formato: 'percentual'
        },
        'carga_trabalho': {
            nome: 'Carga de Trabalho',
            formula: 'atividades_ativas / capacidade_equipe',
            meta: 0.80,
            formato: 'percentual'
        }
    };

    const CORES_GRAFICOS = [
        '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
        '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
    ];

    const FORMATOS_EXPORTACAO = {
        'html': { nome: 'HTML', extensao: 'html', mime: 'text/html' },
        'pdf': { nome: 'PDF', extensao: 'pdf', mime: 'application/pdf' },
        'excel': { nome: 'Excel', extensao: 'xlsx', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
        'json': { nome: 'JSON', extensao: 'json', mime: 'application/json' },
        'csv': { nome: 'CSV', extensao: 'csv', mime: 'text/csv' }
    };

    // ========== INICIALIZAÇÃO ==========
    function init(dadosGlobais, estadoGlobal) {
        console.log('📊 Inicializando módulo Relatórios...');
        
        dados = dadosGlobais;
        estadoSistema = estadoGlobal;
        
        inicializarEstrutura();
        configurarEventListeners();
        iniciarAtualizacaoAutomatica();
        
        console.log('✅ Módulo Relatórios inicializado com sucesso');
        
        return {
            // Funções públicas expostas
            gerarRelatorio,
            obterDashboardExecutivo,
            obterRelatorioOperacional,
            obterPerformanceIndividual,
            obterAnaliseTemporal,
            obterMonitoramentoPrazos,
            obterIndicesQualidade,
            calcularKPIs,
            gerarGrafico,
            exportarRelatorio,
            agendarRelatorio,
            obterHistoricoRelatorios,
            configurarRelatorios,
            limparCache
        };
    }

    // ========== ESTRUTURA DE DADOS ==========
    function inicializarEstrutura() {
        if (!dados.relatorios) {
            dados.relatorios = {
                historico: [],
                agendamentos: [],
                configuracoes: { ...configRelatorios },
                metricas: {},
                snapshots: []
            };
        }

        if (!dados.metricas) {
            dados.metricas = {
                diarias: {},
                semanais: {},
                mensais: {},
                kpis: {}
            };
        }
    }

    // ========== GERAÇÃO DE RELATÓRIOS ==========
    function gerarRelatorio(tipo, parametros = {}) {
        const cacheKey = `${tipo}_${JSON.stringify(parametros)}`;
        
        // Verificar cache
        if (relatoriosCache.has(cacheKey) && !parametros.forcarAtualizacao) {
            const cached = relatoriosCache.get(cacheKey);
            if ((Date.now() - cached.timestamp) < 300000) { // 5 minutos
                console.log(`📊 Relatório ${tipo} obtido do cache`);
                return cached.dados;
            }
        }

        let relatorio = null;

        switch (tipo) {
            case 'executivo':
                relatorio = obterDashboardExecutivo(parametros);
                break;
            case 'operacional':
                relatorio = obterRelatorioOperacional(parametros);
                break;
            case 'individual':
                relatorio = obterPerformanceIndividual(parametros);
                break;
            case 'temporal':
                relatorio = obterAnaliseTemporal(parametros);
                break;
            case 'prazos':
                relatorio = obterMonitoramentoPrazos(parametros);
                break;
            case 'qualidade':
                relatorio = obterIndicesQualidade(parametros);
                break;
            default:
                throw new Error(`Tipo de relatório ${tipo} não reconhecido`);
        }

        // Adicionar metadados
        relatorio.metadata = {
            tipo: tipo,
            geradoEm: new Date().toISOString(),
            parametros: parametros,
            versao: '5.1',
            usuario: estadoSistema.usuarioEmail || 'Sistema'
        };

        // Cache do relatório
        relatoriosCache.set(cacheKey, {
            dados: relatorio,
            timestamp: Date.now()
        });

        // Salvar no histórico
        salvarHistoricoRelatorio(tipo, relatorio);

        console.log(`📊 Relatório ${tipo} gerado com sucesso`);
        
        return relatorio;
    }

    // ========== DASHBOARD EXECUTIVO ==========
    function obterDashboardExecutivo(parametros = {}) {
        const periodo = parametros.periodo || 'mes-atual';
        const incluirComparativos = parametros.incluirComparativos !== false;
        
        const dashboard = {
            titulo: 'Dashboard Executivo',
            periodo: periodo,
            resumoGeral: obterResumoGeral(),
            kpis: calcularKPIs(),
            statusAreas: obterStatusAreas(),
            alertasPrazos: obterAlertasPrazos(),
            tendencias: incluirComparativos ? obterTendencias() : null,
            graficos: {
                statusDistribuicao: gerarGraficoStatusDistribuicao(),
                progressoMensal: gerarGraficoProgressoMensal(),
                performanceAreas: gerarGraficoPerformanceAreas(),
                prazosVencimento: gerarGraficoPrazosVencimento()
            },
            recomendacoes: gerarRecomendacoes()
        };

        return dashboard;
    }

    function obterResumoGeral() {
        let totalAtividades = 0;
        let atividadesConcluidas = 0;
        let atividadesAtrasadas = 0;
        let totalTarefas = 0;
        let tarefasConcluidas = 0;

        Object.values(dados.areas || {}).forEach(area => {
            area.atividades.forEach(atividade => {
                totalAtividades++;
                
                if (atividade.progresso === 100) {
                    atividadesConcluidas++;
                }
                
                const diasRestantes = calcularDiasRestantes(atividade.prazo);
                if (diasRestantes < 0) {
                    atividadesAtrasadas++;
                }

                if (atividade.tarefas) {
                    totalTarefas += atividade.tarefas.length;
                    tarefasConcluidas += atividade.tarefas.filter(t => t.status === 'concluida').length;
                }
            });
        });

        const totalEventos = (dados.eventos || []).length;
        const eventosProximos = (dados.eventos || []).filter(evento => {
            const diasRestantes = calcularDiasRestantes(evento.data);
            return diasRestantes >= 0 && diasRestantes <= 7;
        }).length;

        return {
            atividades: {
                total: totalAtividades,
                concluidas: atividadesConcluidas,
                atrasadas: atividadesAtrasadas,
                emAndamento: totalAtividades - atividadesConcluidas,
                percentualConclusao: totalAtividades > 0 ? Math.round((atividadesConcluidas / totalAtividades) * 100) : 0
            },
            tarefas: {
                total: totalTarefas,
                concluidas: tarefasConcluidas,
                pendentes: totalTarefas - tarefasConcluidas,
                percentualConclusao: totalTarefas > 0 ? Math.round((tarefasConcluidas / totalTarefas) * 100) : 0
            },
            eventos: {
                total: totalEventos,
                proximos: eventosProximos
            },
            areas: Object.keys(dados.areas || {}).length
        };
    }

    function calcularKPIs() {
        const kpis = {};
        const resumo = obterResumoGeral();

        // Eficiência Geral
        kpis.eficiencia_geral = {
            valor: resumo.atividades.percentualConclusao / 100,
            meta: METRICAS_KPI.eficiencia_geral.meta,
            status: (resumo.atividades.percentualConclusao / 100) >= METRICAS_KPI.eficiencia_geral.meta ? 'positivo' : 'negativo',
            tendencia: calcularTendenciaKPI('eficiencia_geral')
        };

        // Pontualidade
        let entregasNoPrazo = 0;
        let totalEntregas = 0;
        
        Object.values(dados.areas || {}).forEach(area => {
            area.atividades.forEach(atividade => {
                if (atividade.progresso === 100) {
                    totalEntregas++;
                    const diasRestantes = calcularDiasRestantes(atividade.prazo);
                    if (diasRestantes >= 0) {
                        entregasNoPrazo++;
                    }
                }
            });
        });

        kpis.pontualidade = {
            valor: totalEntregas > 0 ? entregasNoPrazo / totalEntregas : 0,
            meta: METRICAS_KPI.pontualidade.meta,
            status: totalEntregas > 0 && (entregasNoPrazo / totalEntregas) >= METRICAS_KPI.pontualidade.meta ? 'positivo' : 'negativo',
            tendencia: calcularTendenciaKPI('pontualidade')
        };

        // Produtividade (tarefas por atividade)
        const produtividade = resumo.atividades.total > 0 ? resumo.tarefas.concluidas / resumo.atividades.total : 0;
        
        kpis.produtividade = {
            valor: produtividade,
            meta: METRICAS_KPI.produtividade.meta,
            status: produtividade >= METRICAS_KPI.produtividade.meta ? 'positivo' : 'negativo',
            tendencia: calcularTendenciaKPI('produtividade')
        };

        // Carga de Trabalho
        const atividadesAtivas = resumo.atividades.total - resumo.atividades.concluidas;
        const capacidadeEquipe = calcularCapacidadeEquipe();
        const cargaTrabalho = capacidadeEquipe > 0 ? atividadesAtivas / capacidadeEquipe : 0;

        kpis.carga_trabalho = {
            valor: cargaTrabalho,
            meta: METRICAS_KPI.carga_trabalho.meta,
            status: cargaTrabalho <= METRICAS_KPI.carga_trabalho.meta ? 'positivo' : 'negativo',
            tendencia: calcularTendenciaKPI('carga_trabalho')
        };

        return kpis;
    }

    function obterStatusAreas() {
        const statusAreas = {};

        Object.entries(dados.areas || {}).forEach(([areaKey, area]) => {
            let total = area.atividades.length;
            let concluidas = 0;
            let atrasadas = 0;
            let emDia = 0;
            let atencao = 0;

            area.atividades.forEach(atividade => {
                if (atividade.progresso === 100) {
                    concluidas++;
                }

                switch (atividade.status) {
                    case 'verde':
                        emDia++;
                        break;
                    case 'amarelo':
                        atencao++;
                        break;
                    case 'vermelho':
                        atrasadas++;
                        break;
                }
            });

            statusAreas[areaKey] = {
                nome: area.nome,
                total: total,
                concluidas: concluidas,
                emAndamento: total - concluidas,
                status: {
                    verde: emDia,
                    amarelo: atencao,
                    vermelho: atrasadas
                },
                percentualConclusao: total > 0 ? Math.round((concluidas / total) * 100) : 0,
                equipe: area.equipe ? area.equipe.length : 0,
                coordenador: area.coordenador
            };
        });

        return statusAreas;
    }

    function obterAlertasPrazos() {
        const alertas = {
            criticos: [],
            urgentes: [],
            proximos: []
        };

        Object.entries(dados.areas || {}).forEach(([areaKey, area]) => {
            area.atividades.forEach(atividade => {
                const diasRestantes = calcularDiasRestantes(atividade.prazo);
                
                const alerta = {
                    atividade: atividade.nome,
                    area: area.nome,
                    areaKey: areaKey,
                    prazo: atividade.prazo,
                    diasRestantes: diasRestantes,
                    responsaveis: atividade.responsaveis,
                    status: atividade.status,
                    progresso: atividade.progresso || 0
                };

                if (diasRestantes < 0) {
                    alertas.criticos.push(alerta);
                } else if (diasRestantes === 0) {
                    alertas.urgentes.push(alerta);
                } else if (diasRestantes <= 3) {
                    alertas.proximos.push(alerta);
                }
            });
        });

        // Ordenar por dias restantes
        alertas.criticos.sort((a, b) => a.diasRestantes - b.diasRestantes);
        alertas.urgentes.sort((a, b) => a.diasRestantes - b.diasRestantes);
        alertas.proximos.sort((a, b) => a.diasRestantes - b.diasRestantes);

        return alertas;
    }

    // ========== RELATÓRIO OPERACIONAL ==========
    function obterRelatorioOperacional(parametros = {}) {
        const areaFiltro = parametros.area;
        const periodo = parametros.periodo || 'semana-atual';

        const relatorio = {
            titulo: 'Relatório Operacional',
            area: areaFiltro || 'Todas as Áreas',
            periodo: periodo,
            detalhesAtividades: obterDetalhesAtividades(areaFiltro),
            distribuicaoTarefas: obterDistribuicaoTarefas(areaFiltro),
            performanceEquipe: obterPerformanceEquipe(areaFiltro),
            gargalos: identificarGargalos(areaFiltro),
            recomendacoesOperacionais: gerarRecomendacoesOperacionais(areaFiltro)
        };

        return relatorio;
    }

    function obterDetalhesAtividades(areaFiltro = null) {
        const detalhes = [];

        Object.entries(dados.areas || {}).forEach(([areaKey, area]) => {
            if (areaFiltro && areaKey !== areaFiltro) return;

            area.atividades.forEach(atividade => {
                const diasRestantes = calcularDiasRestantes(atividade.prazo);
                const progresso = calcularProgressoAtividade(atividade);
                
                detalhes.push({
                    id: atividade.id,
                    nome: atividade.nome,
                    area: area.nome,
                    areaKey: areaKey,
                    responsaveis: atividade.responsaveis,
                    prazo: atividade.prazo,
                    diasRestantes: diasRestantes,
                    status: atividade.status,
                    progresso: progresso,
                    totalTarefas: atividade.tarefas ? atividade.tarefas.length : 0,
                    tarefasConcluidas: atividade.tarefas ? atividade.tarefas.filter(t => t.status === 'concluida').length : 0,
                    tarefasBloqueadas: contarTarefasBloqueadas(atividade),
                    dataAdicionado: atividade.dataAdicionado,
                    urgencia: calcularUrgencia(diasRestantes, progresso),
                    riscoAtraso: calcularRiscoAtraso(atividade)
                });
            });
        });

        // Ordenar por urgência
        detalhes.sort((a, b) => b.urgencia - a.urgencia);

        return detalhes;
    }

    function obterDistribuicaoTarefas(areaFiltro = null) {
        const distribuicao = {};

        Object.entries(dados.areas || {}).forEach(([areaKey, area]) => {
            if (areaFiltro && areaKey !== areaFiltro) return;

            area.atividades.forEach(atividade => {
                atividade.responsaveis.forEach(responsavel => {
                    if (!distribuicao[responsavel]) {
                        distribuicao[responsavel] = {
                            nome: responsavel,
                            atividades: 0,
                            tarefas: 0,
                            tarefasConcluidas: 0,
                            atividadesConcluidas: 0,
                            cargaTrabalho: 0,
                            eficiencia: 0
                        };
                    }

                    distribuicao[responsavel].atividades++;
                    
                    if (atividade.progresso === 100) {
                        distribuicao[responsavel].atividadesConcluidas++;
                    }

                    if (atividade.tarefas) {
                        distribuicao[responsavel].tarefas += atividade.tarefas.length;
                        distribuicao[responsavel].tarefasConcluidas += atividade.tarefas.filter(t => t.status === 'concluida').length;
                    }
                });
            });
        });

        // Calcular métricas derivadas
        Object.values(distribuicao).forEach(pessoa => {
            pessoa.eficiencia = pessoa.tarefas > 0 ? pessoa.tarefasConcluidas / pessoa.tarefas : 0;
            pessoa.cargaTrabalho = pessoa.atividades - pessoa.atividadesConcluidas;
        });

        return Object.values(distribuicao);
    }

    function obterPerformanceEquipe(areaFiltro = null) {
        const performance = {};

        Object.entries(dados.areas || {}).forEach(([areaKey, area]) => {
            if (areaFiltro && areaKey !== areaFiltro) return;

            performance[areaKey] = {
                nome: area.nome,
                coordenador: area.coordenador,
                membros: area.equipe ? area.equipe.length : 0,
                atividades: area.atividades.length,
                atividadesConcluidas: area.atividades.filter(a => a.progresso === 100).length,
                atividadesAtrasadas: area.atividades.filter(a => {
                    const dias = calcularDiasRestantes(a.prazo);
                    return dias < 0;
                }).length,
                progressoMedio: calcularProgressoMedio(area.atividades),
                eficiencia: calcularEficienciaArea(area),
                tendencia: calcularTendenciaArea(areaKey)
            };
        });

        return performance;
    }

    function identificarGargalos(areaFiltro = null) {
        const gargalos = [];

        // Gargalos de pessoas sobrecarregadas
        const distribuicao = obterDistribuicaoTarefas(areaFiltro);
        const mediaAtividades = distribuicao.reduce((acc, p) => acc + p.atividades, 0) / distribuicao.length;
        
        distribuicao.forEach(pessoa => {
            if (pessoa.cargaTrabalho > mediaAtividades * 1.5) {
                gargalos.push({
                    tipo: 'sobrecarga_pessoa',
                    descricao: `${pessoa.nome} está sobrecarregado(a)`,
                    pessoa: pessoa.nome,
                    atividades: pessoa.cargaTrabalho,
                    media: Math.round(mediaAtividades),
                    gravidade: 'alta'
                });
            }
        });

        // Gargalos de atividades atrasadas
        Object.entries(dados.areas || {}).forEach(([areaKey, area]) => {
            if (areaFiltro && areaKey !== areaFiltro) return;

            const atividadesAtrasadas = area.atividades.filter(a => {
                const dias = calcularDiasRestantes(a.prazo);
                return dias < 0 && a.progresso < 100;
            });

            if (atividadesAtrasadas.length > 0) {
                gargalos.push({
                    tipo: 'atividades_atrasadas',
                    descricao: `${atividadesAtrasadas.length} atividades atrasadas em ${area.nome}`,
                    area: area.nome,
                    quantidade: atividadesAtrasadas.length,
                    atividades: atividadesAtrasadas.map(a => a.nome),
                    gravidade: atividadesAtrasadas.length > 3 ? 'alta' : 'media'
                });
            }
        });

        // Gargalos de dependências
        Object.entries(dados.areas || {}).forEach(([areaKey, area]) => {
            if (areaFiltro && areaKey !== areaFiltro) return;

            area.atividades.forEach(atividade => {
                const tarefasBloqueadas = contarTarefasBloqueadas(atividade);
                if (tarefasBloqueadas > 0) {
                    gargalos.push({
                        tipo: 'dependencias_bloqueadas',
                        descricao: `${tarefasBloqueadas} tarefas bloqueadas em "${atividade.nome}"`,
                        atividade: atividade.nome,
                        area: area.nome,
                        quantidade: tarefasBloqueadas,
                        gravidade: 'media'
                    });
                }
            });
        });

        return gargalos.sort((a, b) => {
            const prioridades = { 'alta': 3, 'media': 2, 'baixa': 1 };
            return prioridades[b.gravidade] - prioridades[a.gravidade];
        });
    }

    // ========== PERFORMANCE INDIVIDUAL ==========
    function obterPerformanceIndividual(parametros = {}) {
        const pessoa = parametros.pessoa;
        if (!pessoa) {
            throw new Error('Parâmetro "pessoa" é obrigatório para relatório individual');
        }

        const performance = {
            titulo: 'Performance Individual',
            pessoa: pessoa,
            periodo: parametros.periodo || 'mes-atual',
            resumo: obterResumoIndividual(pessoa),
            atividades: obterAtividadesIndividual(pessoa),
            produtividade: calcularProdutividadeIndividual(pessoa),
            qualidade: calcularQualidadeIndividual(pessoa),
            comparativo: obterComparativoIndividual(pessoa),
            agenda: obterAgendaIndividual(pessoa),
            recomendacoes: gerarRecomendacoesIndividuais(pessoa)
        };

        return performance;
    }

    function obterResumoIndividual(pessoa) {
        let atividadesTotal = 0;
        let atividadesConcluidas = 0;
        let tarefasTotal = 0;
        let tarefasConcluidas = 0;
        let atividadesAtrasadas = 0;

        Object.values(dados.areas || {}).forEach(area => {
            area.atividades.forEach(atividade => {
                if (atividade.responsaveis.includes(pessoa)) {
                    atividadesTotal++;
                    
                    if (atividade.progresso === 100) {
                        atividadesConcluidas++;
                    }

                    const diasRestantes = calcularDiasRestantes(atividade.prazo);
                    if (diasRestantes < 0 && atividade.progresso < 100) {
                        atividadesAtrasadas++;
                    }

                    if (atividade.tarefas) {
                        atividade.tarefas.forEach(tarefa => {
                            if (tarefa.responsavel === pessoa) {
                                tarefasTotal++;
                                if (tarefa.status === 'concluida') {
                                    tarefasConcluidas++;
                                }
                            }
                        });
                    }
                }
            });
        });

        return {
            atividades: {
                total: atividadesTotal,
                concluidas: atividadesConcluidas,
                emAndamento: atividadesTotal - atividadesConcluidas,
                atrasadas: atividadesAtrasadas,
                percentualConclusao: atividadesTotal > 0 ? Math.round((atividadesConcluidas / atividadesTotal) * 100) : 0
            },
            tarefas: {
                total: tarefasTotal,
                concluidas: tarefasConcluidas,
                pendentes: tarefasTotal - tarefasConcluidas,
                percentualConclusao: tarefasTotal > 0 ? Math.round((tarefasConcluidas / tarefasTotal) * 100) : 0
            }
        };
    }

    // ========== ANÁLISE TEMPORAL ==========
    function obterAnaliseTemporal(parametros = {}) {
        const periodo = parametros.periodo || 'ultimos-3-meses';
        const metrica = parametros.metrica || 'atividades-concluidas';

        const analise = {
            titulo: 'Análise Temporal',
            periodo: periodo,
            metrica: metrica,
            dados: obterDadosTemporais(periodo, metrica),
            tendencias: calcularTendenciasTemporais(periodo, metrica),
            sazonalidade: identificarSazonalidade(periodo, metrica),
            previsoes: gerarPrevisoes(periodo, metrica),
            comparativos: obterComparativosTemporais(periodo)
        };

        return analise;
    }

    // ========== MONITORAMENTO DE PRAZOS ==========
    function obterMonitoramentoPrazos(parametros = {}) {
        const tipoAlerta = parametros.tipoAlerta || 'todos';
        const areaFiltro = parametros.area;

        const monitoramento = {
            titulo: 'Monitoramento de Prazos',
            tipoAlerta: tipoAlerta,
            area: areaFiltro || 'Todas as Áreas',
            alertas: obterAlertasPrazos(),
            estatisticas: obterEstatisticasPrazos(),
            previsoes: preverProximosVencimentos(),
            acoes: sugerirAcoesPrazos()
        };

        return monitoramento;
    }

    // ========== ÍNDICES DE QUALIDADE ==========
    function obterIndicesQualidade(parametros = {}) {
        const periodo = parametros.periodo || 'mes-atual';

        const qualidade = {
            titulo: 'Índices de Qualidade',
            periodo: periodo,
            indices: calcularIndicesQualidade(),
            retrabalho: analisarRetrabalho(),
            satisfacao: avaliarSatisfacao(),
            melhorias: identificarOportunidadesMelhoria()
        };

        return qualidade;
    }

    // ========== GERAÇÃO DE GRÁFICOS ==========
    function gerarGrafico(tipo, dados, opcoes = {}) {
        const grafico = {
            tipo: tipo,
            dados: dados,
            opcoes: {
                titulo: opcoes.titulo || '',
                cores: opcoes.cores || CORES_GRAFICOS,
                largura: opcoes.largura || 400,
                altura: opcoes.altura || 300,
                formato: opcoes.formato || 'canvas'
            },
            config: gerarConfigGrafico(tipo, dados, opcoes)
        };

        return grafico;
    }

    function gerarGraficoStatusDistribuicao() {
        const resumo = obterResumoGeral();
        
        return gerarGrafico('pizza', [
            { label: 'Em Dia', valor: 0, cor: '#10b981' },
            { label: 'Atenção', valor: 0, cor: '#f59e0b' },
            { label: 'Atraso', valor: 0, cor: '#ef4444' }
        ], {
            titulo: 'Distribuição de Status das Atividades'
        });
    }

    function gerarGraficoProgressoMensal() {
        // Implementar lógica para gráfico de progresso mensal
        return gerarGrafico('linha', [], {
            titulo: 'Progresso Mensal'
        });
    }

    function gerarGraficoPerformanceAreas() {
        const statusAreas = obterStatusAreas();
        const dadosGrafico = Object.values(statusAreas).map(area => ({
            label: area.nome,
            valor: area.percentualConclusao,
            cor: area.percentualConclusao >= 80 ? '#10b981' : area.percentualConclusao >= 60 ? '#f59e0b' : '#ef4444'
        }));

        return gerarGrafico('barras', dadosGrafico, {
            titulo: 'Performance por Área (%)'
        });
    }

    function gerarGraficoPrazosVencimento() {
        const alertas = obterAlertasPrazos();
        const dadosGrafico = [
            { label: 'Críticos', valor: alertas.criticos.length, cor: '#ef4444' },
            { label: 'Urgentes', valor: alertas.urgentes.length, cor: '#f59e0b' },
            { label: 'Próximos', valor: alertas.proximos.length, cor: '#3b82f6' }
        ];

        return gerarGrafico('barras', dadosGrafico, {
            titulo: 'Alertas de Prazos'
        });
    }

    // ========== EXPORTAÇÃO DE RELATÓRIOS ==========
    function exportarRelatorio(relatorio, formato = 'html', nomeArquivo = null) {
        const formatoConfig = FORMATOS_EXPORTACAO[formato];
        if (!formatoConfig) {
            throw new Error(`Formato ${formato} não suportado`);
        }

        let conteudo = '';
        const arquivo = nomeArquivo || `relatorio-${relatorio.metadata.tipo}-${new Date().toISOString().split('T')[0]}`;

        switch (formato) {
            case 'html':
                conteudo = gerarHTML(relatorio);
                break;
            case 'json':
                conteudo = JSON.stringify(relatorio, null, 2);
                break;
            case 'csv':
                conteudo = gerarCSV(relatorio);
                break;
            case 'pdf':
                conteudo = gerarPDF(relatorio);
                break;
            default:
                throw new Error(`Geração para formato ${formato} não implementada`);
        }

        // Download do arquivo
        const blob = new Blob([conteudo], { type: formatoConfig.mime });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${arquivo}.${formatoConfig.extensao}`;
        a.click();
        URL.revokeObjectURL(url);

        console.log(`📥 Relatório exportado: ${arquivo}.${formatoConfig.extensao}`);
        
        return {
            sucesso: true,
            arquivo: `${arquivo}.${formatoConfig.extensao}`,
            formato: formato,
            tamanho: blob.size
        };
    }

    function gerarHTML(relatorio) {
        let html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${relatorio.titulo}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { border-bottom: 2px solid #3b82f6; padding-bottom: 10px; margin-bottom: 20px; }
        .kpi { display: inline-block; margin: 10px; padding: 15px; border-radius: 8px; background: #f8f9fa; }
        .table { border-collapse: collapse; width: 100%; margin: 20px 0; }
        .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .table th { background-color: #f2f2f2; }
        .status-verde { color: #10b981; }
        .status-amarelo { color: #f59e0b; }
        .status-vermelho { color: #ef4444; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${relatorio.titulo}</h1>
        <p>Gerado em: ${new Date(relatorio.metadata.geradoEm).toLocaleString('pt-BR')}</p>
        <p>Usuário: ${relatorio.metadata.usuario}</p>
    </div>
`;

        // Adicionar conteúdo específico do tipo de relatório
        if (relatorio.resumoGeral) {
            html += gerarHTMLResumoGeral(relatorio.resumoGeral);
        }

        if (relatorio.kpis) {
            html += gerarHTMLKPIs(relatorio.kpis);
        }

        if (relatorio.statusAreas) {
            html += gerarHTMLStatusAreas(relatorio.statusAreas);
        }

        if (relatorio.alertasPrazos) {
            html += gerarHTMLAlertasPrazos(relatorio.alertasPrazos);
        }

        html += `
</body>
</html>`;

        return html;
    }

    function gerarCSV(relatorio) {
        let csv = '';
        
        // Cabeçalho
        csv += `Relatório,${relatorio.titulo}\n`;
        csv += `Gerado em,${new Date(relatorio.metadata.geradoEm).toLocaleString('pt-BR')}\n`;
        csv += `Usuário,${relatorio.metadata.usuario}\n\n`;

        // Dados específicos do relatório
        if (relatorio.detalhesAtividades) {
            csv += 'Atividade,Área,Responsáveis,Prazo,Status,Progresso\n';
            relatorio.detalhesAtividades.forEach(atividade => {
                csv += `"${atividade.nome}","${atividade.area}","${atividade.responsaveis.join('; ')}","${atividade.prazo}","${atividade.status}","${atividade.progresso}%"\n`;
            });
        }

        return csv;
    }

    // ========== UTILITÁRIOS DE CÁLCULO ==========
    function calcularDiasRestantes(prazo) {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const dataPrazo = new Date(prazo);
        dataPrazo.setHours(0, 0, 0, 0);
        return Math.floor((dataPrazo - hoje) / (1000 * 60 * 60 * 24));
    }

    function calcularProgressoAtividade(atividade) {
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

        return totalSubtarefas > 0 ? Math.round((subtarefasConcluidas / totalSubtarefas) * 100) : 0;
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

    function calcularUrgencia(diasRestantes, progresso) {
        let urgencia = 0;
        
        // Pontuação por prazo
        if (diasRestantes < 0) urgencia += 100;
        else if (diasRestantes === 0) urgencia += 80;
        else if (diasRestantes <= 3) urgencia += 60;
        else if (diasRestantes <= 7) urgencia += 40;
        
        // Pontuação por progresso
        if (progresso < 25) urgencia += 30;
        else if (progresso < 50) urgencia += 20;
        else if (progresso < 75) urgencia += 10;
        
        return urgencia;
    }

    function calcularRiscoAtraso(atividade) {
        const diasRestantes = calcularDiasRestantes(atividade.prazo);
        const progresso = calcularProgressoAtividade(atividade);
        const tarefasBloqueadas = contarTarefasBloqueadas(atividade);
        
        let risco = 0;
        
        // Fatores de risco
        if (diasRestantes <= 0) risco += 50;
        else if (diasRestantes <= 3) risco += 30;
        else if (diasRestantes <= 7) risco += 15;
        
        if (progresso < 50) risco += 25;
        else if (progresso < 75) risco += 15;
        
        if (tarefasBloqueadas > 0) risco += 20;
        
        return Math.min(risco, 100);
    }

    function calcularCapacidadeEquipe() {
        let capacidade = 0;
        
        Object.values(dados.areas || {}).forEach(area => {
            if (area.equipe) {
                capacidade += area.equipe.length * 2; // 2 atividades por pessoa
            }
        });
        
        return capacidade;
    }

    function calcularTendenciaKPI(kpi) {
        // Implementar lógica de tendência baseada em histórico
        return Math.random() > 0.5 ? 'positiva' : 'negativa';
    }

    // ========== GERAÇÃO DE RECOMENDAÇÕES ==========
    function gerarRecomendacoes() {
        const recomendacoes = [];
        const alertas = obterAlertasPrazos();
        const resumo = obterResumoGeral();

        // Recomendações baseadas em alertas
        if (alertas.criticos.length > 0) {
            recomendacoes.push({
                tipo: 'critico',
                titulo: 'Ação Urgente: Atividades Atrasadas',
                descricao: `${alertas.criticos.length} atividades estão atrasadas e precisam de atenção imediata.`,
                acao: 'Revisar prazos e realocar recursos',
                prioridade: 'alta'
            });
        }

        if (resumo.atividades.percentualConclusao < 70) {
            recomendacoes.push({
                tipo: 'performance',
                titulo: 'Baixa Taxa de Conclusão',
                descricao: `Taxa de conclusão está em ${resumo.atividades.percentualConclusao}%, abaixo do ideal (80%).`,
                acao: 'Analisar gargalos e otimizar processos',
                prioridade: 'media'
            });
        }

        return recomendacoes;
    }

    function gerarRecomendacoesOperacionais(areaFiltro) {
        const recomendacoes = [];
        const gargalos = identificarGargalos(areaFiltro);

        gargalos.forEach(gargalo => {
            switch (gargalo.tipo) {
                case 'sobrecarga_pessoa':
                    recomendacoes.push({
                        tipo: 'redistribuicao',
                        titulo: 'Redistribuir Carga de Trabalho',
                        descricao: gargalo.descricao,
                        acao: 'Redirecionar atividades para outros membros da equipe',
                        pessoa: gargalo.pessoa
                    });
                    break;
                case 'atividades_atrasadas':
                    recomendacoes.push({
                        tipo: 'prazo',
                        titulo: 'Revisar Prazos das Atividades',
                        descricao: gargalo.descricao,
                        acao: 'Negociar novos prazos ou adicionar recursos',
                        area: gargalo.area
                    });
                    break;
            }
        });

        return recomendacoes;
    }

    // ========== CACHE E PERFORMANCE ==========
    function limparCache() {
        relatoriosCache.clear();
        console.log('🧹 Cache de relatórios limpo');
    }

    function atualizarCacheAutomatico() {
        // Regenerar relatórios principais
        const tiposImportantes = ['executivo', 'prazos'];
        
        tiposImportantes.forEach(tipo => {
            try {
                gerarRelatorio(tipo, { forcarAtualizacao: true });
            } catch (error) {
                console.error(`Erro ao atualizar cache do relatório ${tipo}:`, error);
            }
        });
    }

    // ========== HISTÓRICO ==========
    function salvarHistoricoRelatorio(tipo, relatorio) {
        if (!dados.relatorios) {
            dados.relatorios = { historico: [] };
        }

        dados.relatorios.historico.push({
            tipo: tipo,
            timestamp: relatorio.metadata.geradoEm,
            usuario: relatorio.metadata.usuario,
            resumo: extrairResumoRelatorio(relatorio)
        });

        // Manter apenas os últimos 100 relatórios
        if (dados.relatorios.historico.length > 100) {
            dados.relatorios.historico = dados.relatorios.historico.slice(-100);
        }
    }

    function obterHistoricoRelatorios(tipo = null, limite = 20) {
        if (!dados.relatorios || !dados.relatorios.historico) {
            return [];
        }

        let historico = [...dados.relatorios.historico];

        if (tipo) {
            historico = historico.filter(h => h.tipo === tipo);
        }

        return historico
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, limite);
    }

    function extrairResumoRelatorio(relatorio) {
        const resumo = {
            tipo: relatorio.metadata.tipo
        };

        if (relatorio.resumoGeral) {
            resumo.totalAtividades = relatorio.resumoGeral.atividades.total;
            resumo.percentualConclusao = relatorio.resumoGeral.atividades.percentualConclusao;
        }

        if (relatorio.alertasPrazos) {
            resumo.alertasCriticos = relatorio.alertasPrazos.criticos.length;
        }

        return resumo;
    }

    // ========== AGENDAMENTO ==========
    function agendarRelatorio(tipo, configuracao) {
        const agendamento = {
            id: Date.now(),
            tipo: tipo,
            configuracao: configuracao,
            criadoEm: new Date().toISOString(),
            usuario: estadoSistema.usuarioEmail || 'Sistema',
            ativo: true
        };

        if (!dados.relatorios) {
            dados.relatorios = { agendamentos: [] };
        }

        dados.relatorios.agendamentos.push(agendamento);

        // Configurar execução
        const intervalo = configuracao.intervalo || 'diario';
        configurarExecucaoAgendada(agendamento, intervalo);

        console.log(`⏰ Relatório ${tipo} agendado com sucesso`);
        
        return agendamento;
    }

    function configurarExecucaoAgendada(agendamento, intervalo) {
        // Implementar lógica de agendamento baseada no intervalo
        // Por simplicidade, usar setTimeout para demonstração
        agendamentosRelatorios.add(agendamento.id);
    }

    // ========== CONFIGURAÇÕES ==========
    function configurarRelatorios(novasConfiguracoes) {
        configRelatorios = { ...configRelatorios, ...novasConfiguracoes };
        
        if (dados.relatorios) {
            dados.relatorios.configuracoes = configRelatorios;
        }

        console.log('⚙️ Configurações de relatórios atualizadas');
    }

    // ========== INICIALIZAÇÃO AUTOMÁTICA ==========
    function iniciarAtualizacaoAutomatica() {
        if (!configRelatorios.atualizacaoAutomatica) return;

        // Atualizar cache a cada 5 minutos
        setInterval(() => {
            atualizarCacheAutomatico();
        }, 300000);

        console.log('🔄 Atualização automática de relatórios iniciada');
    }

    // ========== EVENT LISTENERS ==========
    function configurarEventListeners() {
        // Listener para mudanças nos dados que devem atualizar relatórios
        document.addEventListener('dadosAtualizados', () => {
            limparCache();
        });
    }

    // ========== FUNÇÕES AUXILIARES HTML ==========
    function gerarHTMLResumoGeral(resumo) {
        return `
    <h2>Resumo Geral</h2>
    <div class="kpi">
        <h3>Atividades</h3>
        <p>Total: ${resumo.atividades.total}</p>
        <p>Concluídas: ${resumo.atividades.concluidas} (${resumo.atividades.percentualConclusao}%)</p>
        <p>Em Andamento: ${resumo.atividades.emAndamento}</p>
        <p>Atrasadas: ${resumo.atividades.atrasadas}</p>
    </div>
    <div class="kpi">
        <h3>Tarefas</h3>
        <p>Total: ${resumo.tarefas.total}</p>
        <p>Concluídas: ${resumo.tarefas.concluidas} (${resumo.tarefas.percentualConclusao}%)</p>
        <p>Pendentes: ${resumo.tarefas.pendentes}</p>
    </div>
`;
    }

    function gerarHTMLKPIs(kpis) {
        let html = '<h2>Indicadores-Chave de Performance (KPIs)</h2>';
        
        Object.entries(kpis).forEach(([chave, kpi]) => {
            const statusClass = kpi.status === 'positivo' ? 'status-verde' : 'status-vermelho';
            const valorFormatado = METRICAS_KPI[chave]?.formato === 'percentual' 
                ? `${(kpi.valor * 100).toFixed(1)}%` 
                : kpi.valor.toFixed(2);
            const metaFormatada = METRICAS_KPI[chave]?.formato === 'percentual' 
                ? `${(kpi.meta * 100).toFixed(1)}%` 
                : kpi.meta.toFixed(2);
            
            html += `
    <div class="kpi">
        <h4 class="${statusClass}">${METRICAS_KPI[chave]?.nome || chave}</h4>
        <p>Valor: ${valorFormatado}</p>
        <p>Meta: ${metaFormatada}</p>
        <p>Status: ${kpi.status}</p>
    </div>`;
        });
        
        return html;
    }

    function gerarHTMLStatusAreas(statusAreas) {
        let html = `
    <h2>Status por Área</h2>
    <table class="table">
        <thead>
            <tr>
                <th>Área</th>
                <th>Total</th>
                <th>Concluídas</th>
                <th>Em Andamento</th>
                <th>% Conclusão</th>
                <th>Coordenador</th>
            </tr>
        </thead>
        <tbody>`;

        Object.values(statusAreas).forEach(area => {
            html += `
            <tr>
                <td>${area.nome}</td>
                <td>${area.total}</td>
                <td>${area.concluidas}</td>
                <td>${area.emAndamento}</td>
                <td>${area.percentualConclusao}%</td>
                <td>${area.coordenador}</td>
            </tr>`;
        });

        html += `
        </tbody>
    </table>`;

        return html;
    }

    function gerarHTMLAlertasPrazos(alertas) {
        let html = '<h2>Alertas de Prazos</h2>';

        if (alertas.criticos.length > 0) {
            html += `
    <h3 class="status-vermelho">Críticos (${alertas.criticos.length})</h3>
    <ul>`;
            alertas.criticos.forEach(alerta => {
                html += `<li>${alerta.atividade} (${alerta.area}) - ${Math.abs(alerta.diasRestantes)} dias atrasado</li>`;
            });
            html += '</ul>';
        }

        if (alertas.urgentes.length > 0) {
            html += `
    <h3 class="status-amarelo">Urgentes (${alertas.urgentes.length})</h3>
    <ul>`;
            alertas.urgentes.forEach(alerta => {
                html += `<li>${alerta.atividade} (${alerta.area}) - vence hoje</li>`;
            });
            html += '</ul>';
        }

        return html;
    }

    // ========== EXPOSIÇÃO PÚBLICA ==========
    return {
        init,
        gerarRelatorio,
        obterDashboardExecutivo,
        obterRelatorioOperacional,
        obterPerformanceIndividual,
        obterAnaliseTemporal,
        obterMonitoramentoPrazos,
        obterIndicesQualidade,
        calcularKPIs,
        gerarGrafico,
        exportarRelatorio,
        agendarRelatorio,
        obterHistoricoRelatorios,
        configurarRelatorios,
        limparCache
    };

})(); 
