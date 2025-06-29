/* ==========================================================================
   GESTÃO DO ESTADO GLOBAL - Sistema de Gestão v5.1 - CORRIGIDO
   ========================================================================== */

/**
 * Estado Global do Sistema
 * Centraliza toda a gestão de estado da aplicação
 */
let estadoSistema = {
    // Navegação e interface
    mesAtual: 6,  // Julho (0-11)
    anoAtual: 2025,
    areaAtual: null,
    pessoaAtual: null,
    filtroAtual: 'todos',
    
    // Estados de edição
    editandoAtividade: null,
    editandoEvento: null,
    editandoTarefa: null,
    
    // Seleções temporárias
    pessoasSelecionadas: new Set(),
    tarefasVinculadas: new Map(),
    
    // Informações do sistema
    versaoSistema: '5.1',
    versaoDataBase: 5,
    
    // Usuário atual
    usuarioEmail: null,
    usuarioNome: null,
    usuarioUID: null,
    
    // Cache e performance
    alertasPrazosExibidos: new Set(),
    ultimaVerificacaoPrazos: null,
    contadorSalvamentos: 0,
    
    // Estados de conectividade
    online: true,
    sincronizando: false,
    ultimaSincronizacao: null,
    
    // Configurações da interface
    modoEscuro: false,
    tamanhoCalendario: 'normal', // normal, pequeno, grande
    mostrarTooltips: true,
    animacoesAtivadas: true
};

/**
 * Dados do Sistema - CORRIGIDO: Inicialização automática
 * Estrutura principal dos dados da aplicação
 */
let dados = null; // Será inicializado automaticamente

/**
 * Inicializa os dados padrão do sistema
 */
function inicializarDados() {
    console.log('🔧 Inicializando dados padrão do sistema...');
    
    return {
        versao: estadoSistema.versaoDataBase,
        areas: {
            documentacao: {
                nome: "Documentação & Arquivo",
                coordenador: "Renato Remiro",
                cor: "#8b5cf6",
                equipe: [
                    {nome: "Renato", cargo: "Coordenador"},
                    {nome: "Bruna", cargo: "Arquiteta Trainee"},
                    {nome: "Juliana A.", cargo: "Estagiária de Arquitetura"},
                    {nome: "Lara", cargo: "Arquiteta Trainee"}
                ],
                atividades: [
                    {
                        id: 1, 
                        nome: "As Built", 
                        status: "verde", 
                        prazo: "2025-07-18", 
                        responsaveis: ["Renato", "Bruna"], 
                        progresso: 0, 
                        dataAdicionado: new Date().toISOString(),
                        tarefas: []
                    },
                    {
                        id: 2, 
                        nome: "Relatório Fotográfico", 
                        status: "amarelo", 
                        prazo: "2025-07-12", 
                        responsaveis: ["Bruna"], 
                        progresso: 0, 
                        dataAdicionado: new Date().toISOString(),
                        tarefas: []
                    },
                    {
                        id: 3, 
                        nome: "Manual de Conservação", 
                        status: "verde", 
                        prazo: "2025-07-25", 
                        responsaveis: ["Renato"], 
                        progresso: 0, 
                        dataAdicionado: new Date().toISOString(),
                        tarefas: []
                    },
                    {
                        id: 4, 
                        nome: "BIM 2D", 
                        status: "verde", 
                        prazo: "2025-07-20", 
                        responsaveis: ["Bruna"], 
                        progresso: 0, 
                        dataAdicionado: new Date().toISOString(),
                        tarefas: []
                    },
                    {
                        id: 5, 
                        nome: "BIM", 
                        status: "verde", 
                        prazo: "2025-07-22", 
                        responsaveis: ["Bruna"], 
                        progresso: 0, 
                        dataAdicionado: new Date().toISOString(),
                        tarefas: []
                    },
                    {
                        id: 6, 
                        nome: "Databook", 
                        status: "verde", 
                        prazo: "2025-07-18", 
                        responsaveis: ["Juliana A."], 
                        progresso: 0, 
                        dataAdicionado: new Date().toISOString(),
                        tarefas: []
                    }
                ]
            },
            planejamento: {
                nome: "Planejamento & Controle de Obra",
                coordenador: "Isabella Rocha (Coord. Geral)",
                cor: "#06b6d4",
                equipe: [
                    {nome: "Isabella", cargo: "Coordenadora Geral"},
                    {nome: "Lara", cargo: "Arquiteta Trainee"},
                    {nome: "Eduardo", cargo: "Engenheiro Civil"},
                    {nome: "Beto", cargo: "Arquiteto"},
                    {nome: "Jean", cargo: "Estagiário de Eng. Civil"}
                ],
                atividades: [
                    {
                        id: 7, 
                        nome: "Cronograma Longo Prazo (CLP)", 
                        status: "verde", 
                        prazo: "2025-07-10", 
                        responsaveis: ["Lara", "Isabella"], 
                        progresso: 0, 
                        dataAdicionado: new Date().toISOString(), 
                        tarefas: []
                    },
                    {
                        id: 8, 
                        nome: "PPCO", 
                        status: "verde", 
                        prazo: "2025-07-31", 
                        responsaveis: ["Lara", "Isabella"], 
                        progresso: 0, 
                        dataAdicionado: new Date().toISOString(), 
                        tarefas: []
                    },
                    {
                        id: 9, 
                        nome: "Vínculos Orçamentários", 
                        status: "verde", 
                        prazo: "2025-07-31", 
                        responsaveis: ["Lara", "Isabella"], 
                        progresso: 0, 
                        dataAdicionado: new Date().toISOString(), 
                        tarefas: []
                    },
                    {
                        id: 10, 
                        nome: "CFF", 
                        status: "amarelo", 
                        prazo: "2025-07-15", 
                        responsaveis: ["Isabella"], 
                        progresso: 0, 
                        dataAdicionado: new Date().toISOString(), 
                        tarefas: []
                    },
                    {
                        id: 11, 
                        nome: "Previsão Financeira", 
                        status: "verde", 
                        prazo: "2025-07-31", 
                        responsaveis: ["Eduardo", "Isabella"], 
                        progresso: 0, 
                        dataAdicionado: new Date().toISOString(), 
                        tarefas: []
                    },
                    {
                        id: 12, 
                        nome: "Planilha de Medição", 
                        status: "amarelo", 
                        prazo: "2025-07-12", 
                        responsaveis: ["Lara", "Isabella"], 
                        progresso: 0, 
                        dataAdicionado: new Date().toISOString(), 
                        tarefas: []
                    },
                    {
                        id: 13, 
                        nome: "CCP", 
                        status: "verde", 
                        prazo: "2025-07-05", 
                        responsaveis: ["Lara", "Beto", "Eduardo"], 
                        progresso: 0, 
                        dataAdicionado: new Date().toISOString(), 
                        tarefas: []
                    }
                ]
            },
            producao: {
                nome: "Produção & Qualidade",
                coordenador: "Beto / Eduardo",
                cor: "#ef4444",
                equipe: [
                    {nome: "Beto", cargo: "Arquiteto"},
                    {nome: "Eduardo", cargo: "Coordenador Eng. Civil"},
                    {nome: "Jean", cargo: "Estagiário de Eng. Civil"},
                    {nome: "Nominato", cargo: "Almoxarifado"},
                    {nome: "Alex", cargo: "Comprador"},
                    {nome: "Manu", cargo: "Assistente de Arquitetura"},
                    {nome: "Marcus", cargo: "Especialista Meio Ambiente"},
                    {nome: "Juliana E.", cargo: "Técnica de Enfermagem"},
                    {nome: "Carlos", cargo: "Técnico de Segurança"}
                ],
                atividades: [
                    {
                        id: 14, 
                        nome: "Levantamento de Materiais", 
                        status: "verde", 
                        prazo: "2025-07-05", 
                        responsaveis: ["Jean", "Beto", "Eduardo"], 
                        progresso: 0, 
                        dataAdicionado: new Date().toISOString(), 
                        tarefas: []
                    },
                    {
                        id: 15, 
                        nome: "Certificação de Estoque", 
                        status: "verde", 
                        prazo: "2025-07-31", 
                        responsaveis: ["Nominato", "Jean", "Eduardo"], 
                        progresso: 0, 
                        dataAdicionado: new Date().toISOString(), 
                        tarefas: []
                    },
                    {
                        id: 16, 
                        nome: "Controle de Patrimônio", 
                        status: "verde", 
                        prazo: "2025-07-31", 
                        responsaveis: ["Nominato", "Alex"], 
                        progresso: 0, 
                        dataAdicionado: new Date().toISOString(), 
                        tarefas: []
                    },
                    {
                        id: 17, 
                        nome: "Procedimento SIENGE", 
                        status: "amarelo", 
                        prazo: "2025-07-09", 
                        responsaveis: ["Alex", "Eduardo"], 
                        progresso: 0, 
                        dataAdicionado: new Date().toISOString(), 
                        tarefas: []
                    },
                    {
                        id: 18, 
                        nome: "Lançamento de Solicitações", 
                        status: "verde", 
                        prazo: "2025-07-01", 
                        responsaveis: ["Nominato", "Alex", "Eduardo"], 
                        progresso: 0, 
                        dataAdicionado: new Date().toISOString(), 
                        tarefas: []
                    },
                    {
                        id: 19, 
                        nome: "Negociações de Compra", 
                        status: "amarelo", 
                        prazo: "2025-07-05", 
                        responsaveis: ["Alex", "Eduardo"], 
                        progresso: 0, 
                        dataAdicionado: new Date().toISOString(), 
                        tarefas: []
                    }
                ]
            }
        },
        eventos: [
            {
                id: 1, 
                titulo: "Reunião semanal de planejamento", 
                tipo: "reuniao",
                data: "2025-07-01",
                horarioInicio: "09:00",
                horarioFim: "11:00",
                diaCompleto: false,
                pessoas: ["Isabella", "Lara", "Eduardo", "Beto"],
                local: "Sala de reunião principal",
                descricao: "Revisão do cronograma e distribuição de tarefas da semana",
                recorrencia: {
                    tipo: "semanal",
                    diasSemana: [1],
                    fim: null
                }
            },
            {
                id: 2, 
                titulo: "Entrega Relatório Fotográfico", 
                tipo: "entrega",
                data: "2025-07-15",
                horarioInicio: "17:00",
                diaCompleto: false,
                pessoas: ["Bruna"],
                descricao: "Entrega mensal do relatório com registro fotográfico do progresso da obra"
            },
            {
                id: 3, 
                titulo: "Microprogramação R00", 
                tipo: "prazo",
                data: "2025-07-08",
                horarioInicio: "23:59",
                diaCompleto: false,
                pessoas: ["Lara"],
                tarefasRelacionadas: [{atividadeId: 7, tipo: "entrega"}]
            }
        ],
        agendas: {},
        feriados: {},
        statusPessoal: {},
        historico: [],
        configuracoes: {
            autoSave: true,
            intervaloVerificacao: 3600000, // 1 hora
            limiteHistorico: 100,
            limiteLogAtividades: 50
        },
        estatisticas: {
            totalAtividades: 0,
            totalEventos: 0,
            totalTarefas: 0,
            ultimaAtualizacao: null
        },
        ultimaAtualizacao: new Date().toISOString(),
        criadoEm: new Date().toISOString(),
        ultimoUsuario: null
    };
}

/**
 * Funções de manipulação do estado
 */

/**
 * Atualiza o estado do sistema
 */
function atualizarEstado(chave, valor) {
    if (estadoSistema.hasOwnProperty(chave)) {
        estadoSistema[chave] = valor;
        
        // Registrar debug se necessário
        if (typeof SISTEMA_CONSTANTS !== 'undefined' && SISTEMA_CONSTANTS.DEBUG_MODE) {
            console.log(`🔄 Estado atualizado: ${chave} = ${valor}`);
        }
        
        // Salvar automaticamente se habilitado
        if (dados?.configuracoes?.autoSave) {
            debounceAutoSave();
        }
    } else {
        console.warn(`⚠️ Tentativa de atualizar chave inexistente: ${chave}`);
    }
}

/**
 * Reseta o estado para valores padrão
 */
function resetarEstado() {
    console.log('🔄 Resetando estado do sistema...');
    
    estadoSistema = {
        mesAtual: 6,
        anoAtual: 2025,
        areaAtual: null,
        pessoaAtual: null,
        filtroAtual: 'todos',
        editandoAtividade: null,
        editandoEvento: null,
        editandoTarefa: null,
        pessoasSelecionadas: new Set(),
        tarefasVinculadas: new Map(),
        versaoSistema: '5.1',
        versaoDataBase: 5,
        usuarioEmail: null,
        usuarioNome: null,
        usuarioUID: null,
        alertasPrazosExibidos: new Set(),
        ultimaVerificacaoPrazos: null,
        contadorSalvamentos: 0,
        online: true,
        sincronizando: false,
        ultimaSincronizacao: null,
        modoEscuro: false,
        tamanhoCalendario: 'normal',
        mostrarTooltips: true,
        animacoesAtivadas: true
    };
}

/**
 * Obtém o estado atual
 */
function obterEstado(chave = null) {
    if (chave) {
        return estadoSistema[chave];
    }
    return { ...estadoSistema }; // Cópia para evitar mutações
}

/**
 * Limpa seleções temporárias
 */
function limparSelecoes() {
    estadoSistema.pessoasSelecionadas.clear();
    estadoSistema.tarefasVinculadas.clear();
    estadoSistema.editandoAtividade = null;
    estadoSistema.editandoEvento = null;
    estadoSistema.editandoTarefa = null;
}

/**
 * Funções de navegação
 */

/**
 * Navega para uma área específica
 */
function navegarParaArea(areaKey) {
    if (dados?.areas?.[areaKey]) {
        estadoSistema.areaAtual = areaKey;
        estadoSistema.pessoaAtual = null;
        limparSelecoes();
        
        console.log(`📂 Navegando para área: ${areaKey}`);
        return true;
    }
    
    console.warn(`⚠️ Área não encontrada: ${areaKey}`);
    return false;
}

/**
 * Navega para agenda de uma pessoa
 */
function navegarParaPessoa(nomePessoa) {
    if (nomePessoa) {
        estadoSistema.pessoaAtual = nomePessoa;
        limparSelecoes();
        
        console.log(`👤 Navegando para pessoa: ${nomePessoa}`);
        return true;
    }
    
    console.warn(`⚠️ Nome da pessoa não fornecido`);
    return false;
}

/**
 * Volta para o dashboard principal
 */
function voltarDashboard() {
    estadoSistema.areaAtual = null;
    estadoSistema.pessoaAtual = null;
    limparSelecoes();
    
    console.log(`🏠 Voltando para dashboard`);
}

/**
 * Funções de filtros
 */

/**
 * Aplica filtro de status
 */
function aplicarFiltro(filtro) {
    const filtrosValidos = ['todos', 'verde', 'amarelo', 'vermelho', 'urgentes', 'atrasadas', 'emdia', 'atencao'];
    
    if (filtrosValidos.includes(filtro)) {
        estadoSistema.filtroAtual = filtro;
        console.log(`🔍 Filtro aplicado: ${filtro}`);
        return true;
    }
    
    console.warn(`⚠️ Filtro inválido: ${filtro}`);
    return false;
}

/**
 * Limpa filtros aplicados
 */
function limparFiltros() {
    estadoSistema.filtroAtual = 'todos';
    console.log(`🧹 Filtros limpos`);
}

/**
 * Funções de dados
 */

/**
 * Verifica se os dados estão carregados
 */
function dadosCarregados() {
    return dados !== null && typeof dados === 'object' && dados.areas;
}

/**
 * Obtém estatísticas gerais do sistema
 */
function obterEstatisticas() {
    if (!dadosCarregados()) {
        return {
            totalAreas: 0,
            totalAtividades: 0,
            totalEventos: 0,
            totalTarefas: 0,
            statusCount: { verde: 0, amarelo: 0, vermelho: 0 }
        };
    }
    
    const areas = Object.keys(dados.areas);
    let totalAtividades = 0;
    let totalTarefas = 0;
    const statusCount = { verde: 0, amarelo: 0, vermelho: 0 };
    
    areas.forEach(areaKey => {
        const area = dados.areas[areaKey];
        totalAtividades += area.atividades?.length || 0;
        
        area.atividades?.forEach(atividade => {
            statusCount[atividade.status] = (statusCount[atividade.status] || 0) + 1;
            totalTarefas += atividade.tarefas?.length || 0;
        });
    });
    
    return {
        totalAreas: areas.length,
        totalAtividades,
        totalEventos: dados.eventos?.length || 0,
        totalTarefas,
        statusCount
    };
}

/**
 * Obtém atividades por responsável
 */
function obterAtividadesPorResponsavel(nomeResponsavel) {
    if (!dadosCarregados() || !nomeResponsavel) return [];
    
    const atividades = [];
    
    Object.entries(dados.areas).forEach(([areaKey, area]) => {
        area.atividades?.forEach(atividade => {
            if (atividade.responsaveis?.includes(nomeResponsavel)) {
                atividades.push({
                    ...atividade,
                    areaKey,
                    areaNome: area.nome
                });
            }
        });
    });
    
    return atividades.sort((a, b) => new Date(a.prazo) - new Date(b.prazo));
}

/**
 * Funções de cache e performance
 */

let autoSaveTimeout = null;

/**
 * Auto-save com debounce
 */
function debounceAutoSave() {
    if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
    }
    
    autoSaveTimeout = setTimeout(() => {
        if (typeof salvarDados === 'function') {
            salvarDados();
            estadoSistema.contadorSalvamentos++;
        }
    }, (typeof SISTEMA_CONSTANTS !== 'undefined' && SISTEMA_CONSTANTS.INTERVALO_SALVAMENTO) || 5000);
}

/**
 * Limpa cache antigo
 */
function limparCacheAntigo() {
    const agora = new Date();
    const limite24h = 24 * 60 * 60 * 1000;
    
    // Limpar alertas antigos
    estadoSistema.alertasPrazosExibidos.forEach(alertaKey => {
        const [id, prazo] = alertaKey.split('_');
        if (prazo) {
            const prazoData = new Date(prazo);
            if (agora - prazoData > limite24h) {
                estadoSistema.alertasPrazosExibidos.delete(alertaKey);
            }
        }
    });
    
    console.log(`🧹 Cache limpo. Alertas restantes: ${estadoSistema.alertasPrazosExibidos.size}`);
}

/**
 * Funções de debugging
 */

/**
 * Debug do estado atual
 */
function debugEstado() {
    console.group('🐛 DEBUG - Estado do Sistema');
    console.log('📊 Estatísticas:', obterEstatisticas());
    console.log('🔧 Estado:', estadoSistema);
    console.log('📦 Dados carregados:', dadosCarregados());
    console.log('👤 Usuário atual:', {
        email: estadoSistema.usuarioEmail,
        nome: estadoSistema.usuarioNome,
        uid: estadoSistema.usuarioUID
    });
    console.log('🌐 Conectividade:', {
        online: estadoSistema.online,
        sincronizando: estadoSistema.sincronizando,
        ultimaSincronizacao: estadoSistema.ultimaSincronizacao
    });
    console.groupEnd();
}

/**
 * Validação da integridade dos dados
 */
function validarIntegridadeDados() {
    const problemas = [];
    
    if (!dadosCarregados()) {
        problemas.push('Dados não carregados');
        return problemas;
    }
    
    // Verificar estrutura básica
    if (!dados.areas || typeof dados.areas !== 'object') {
        problemas.push('Estrutura de áreas inválida');
    }
    
    if (!Array.isArray(dados.eventos)) {
        problemas.push('Estrutura de eventos inválida');
    }
    
    // Verificar áreas
    Object.entries(dados.areas || {}).forEach(([areaKey, area]) => {
        if (!area.nome) {
            problemas.push(`Área ${areaKey} sem nome`);
        }
        
        if (!Array.isArray(area.atividades)) {
            problemas.push(`Área ${areaKey} sem atividades válidas`);
        }
        
        if (!Array.isArray(area.equipe)) {
            problemas.push(`Área ${areaKey} sem equipe válida`);
        }
    });
    
    if (problemas.length === 0) {
        console.log('✅ Integridade dos dados validada com sucesso');
    } else {
        console.warn('⚠️ Problemas de integridade encontrados:', problemas);
    }
    
    return problemas;
}

/**
 * Funções utilitárias de estado
 */

/**
 * Serializa o estado para localStorage
 */
function serializarEstado() {
    return JSON.stringify({
        estadoSistema: {
            ...estadoSistema,
            pessoasSelecionadas: Array.from(estadoSistema.pessoasSelecionadas),
            tarefasVinculadas: Array.from(estadoSistema.tarefasVinculadas.entries()),
            alertasPrazosExibidos: Array.from(estadoSistema.alertasPrazosExibidos)
        },
        timestamp: new Date().toISOString()
    });
}

/**
 * Deserializa o estado do localStorage
 */
function deserializarEstado(estadoString) {
    try {
        const parsed = JSON.parse(estadoString);
        const estadoSalvo = parsed.estadoSistema;
        
        if (estadoSalvo) {
            // Restaurar Sets e Maps
            estadoSalvo.pessoasSelecionadas = new Set(estadoSalvo.pessoasSelecionadas || []);
            estadoSalvo.tarefasVinculadas = new Map(estadoSalvo.tarefasVinculadas || []);
            estadoSalvo.alertasPrazosExibidos = new Set(estadoSalvo.alertasPrazosExibidos || []);
            
            // Merge com estado atual
            Object.assign(estadoSistema, estadoSalvo);
            
            console.log('✅ Estado restaurado do localStorage');
            return true;
        }
    } catch (error) {
        console.warn('⚠️ Erro ao deserializar estado:', error);
    }
    
    return false;
}

/**
 * ========== CORREÇÃO CRÍTICA: AUTO-INICIALIZAÇÃO DOS DADOS ==========
 */

/**
 * Força inicialização dos dados se estiverem null
 */
function garantirDadosInicializados() {
    if (dados === null) {
        console.log('🔧 CORREÇÃO: Inicializando dados automaticamente...');
        dados = inicializarDados();
        console.log('✅ CORREÇÃO: Dados inicializados com sucesso!');
        
        // Validar integridade após inicialização
        const problemas = validarIntegridadeDados();
        if (problemas.length === 0) {
            console.log('✅ CORREÇÃO: Integridade dos dados confirmada!');
        }
        
        return true;
    }
    return false;
}

/**
 * Exposição global para compatibilidade
 */
if (typeof window !== 'undefined') {
    window.estadoSistema = estadoSistema;
    window.dados = dados;
    window.inicializarDados = inicializarDados;
    window.atualizarEstado = atualizarEstado;
    window.obterEstado = obterEstado;
    window.debugEstado = debugEstado;
    window.validarIntegridadeDados = validarIntegridadeDados;
    window.garantirDadosInicializados = garantirDadosInicializados;
    window.dadosCarregados = dadosCarregados;
    window.navegarParaArea = navegarParaArea;
    window.navegarParaPessoa = navegarParaPessoa;
    window.voltarDashboard = voltarDashboard;
}

/**
 * ========== AUTO-INICIALIZAÇÃO CRÍTICA ==========
 * CORREÇÃO: Inicializar dados automaticamente quando módulo carregar
 */

// Aguardar DOM estar pronto antes de inicializar
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            garantirDadosInicializados();
        });
    } else {
        // DOM já está pronto - inicializar imediatamente
        garantirDadosInicializados();
    }
} else {
    // Ambiente sem DOM - inicializar imediatamente
    garantirDadosInicializados();
}

console.log('✅ Módulo state.js carregado com sucesso - VERSÃO CORRIGIDA');