/* ==========================================================================
   GESTÃO DO ESTADO GLOBAL - Sistema de Gestão v5.1 - ESTADO IMUTÁVEL
   ========================================================================== */

/**
 * Estado Global do Sistema - IMUTÁVEL
 * Centraliza toda a gestão de estado da aplicação com padrão imutável
 * MELHORADO: Previne bugs de concorrência e mutação acidental
 */

/**
 * Sistema de Gestão de Estado Imutável
 */
const StateManager = {
    // Estado interno (privado)
    _state: null,
    
    // Subscribers para mudanças de estado
    _subscribers: new Map(),
    
    // Histórico de mudanças (para debug)
    _history: [],
    maxHistory: 50,
    
    // Validadores de estado
    _validators: new Map(),
    
    /**
     * Inicializa o gerenciador de estado
     */
    initialize(initialState) {
        this._state = Object.freeze({ ...initialState });
        this._history.push({
            timestamp: new Date().toISOString(),
            action: 'INITIALIZE',
            state: this._state
        });
        console.log('🔒 Estado inicializado como imutável');
    },
    
    /**
     * Obtém uma cópia do estado atual (somente leitura)
     */
    getState() {
        return { ...this._state };
    },
    
    /**
     * Obtém um valor específico do estado
     */
    getValue(key) {
        return this._state?.[key];
    },
    
    /**
     * Atualiza o estado de forma imutável
     */
    updateState(action, updates) {
        if (!updates || typeof updates !== 'object') {
            console.warn('⚠️ Updates deve ser um objeto');
            return false;
        }
        
        // Validar mudanças
        const validationResult = this._validateChanges(updates);
        if (!validationResult.valid) {
            console.error('❌ Validação falhou:', validationResult.errors);
            return false;
        }
        
        // Criar novo estado imutável
        const newState = { ...this._state, ...updates };
        
        // Congelar o novo estado
        this._state = Object.freeze(newState);
        
        // Adicionar ao histórico
        this._addToHistory(action, updates, newState);
        
        // Notificar subscribers
        this._notifySubscribers(action, updates);
        
        console.log(`🔄 Estado atualizado: ${action}`, updates);
        return true;
    },
    
    /**
     * Subscreve a mudanças de estado
     */
    subscribe(key, callback) {
        if (!this._subscribers.has(key)) {
            this._subscribers.set(key, new Set());
        }
        this._subscribers.get(key).add(callback);
        
        console.log(`👂 Subscriber adicionado: ${key}`);
    },
    
    /**
     * Remove subscriber
     */
    unsubscribe(key, callback) {
        if (this._subscribers.has(key)) {
            this._subscribers.get(key).delete(callback);
        }
    },
    
    /**
     * Adiciona validador para uma chave específica
     */
    addValidator(key, validator) {
        this._validators.set(key, validator);
    },
    
    /**
     * Reseta o estado para valores padrão
     */
    reset(newState = null) {
        const defaultState = newState || this._getDefaultState();
        this._state = Object.freeze(defaultState);
        
        this._addToHistory('RESET', {}, this._state);
        this._notifySubscribers('RESET', {});
        
        console.log('🔄 Estado resetado');
    },
    
    /**
     * Obtém histórico de mudanças
     */
    getHistory() {
        return [...this._history];
    },
    
    /**
     * Limpa histórico
     */
    clearHistory() {
        this._history = [];
    },
    
    /**
     * Debug do estado
     */
    debug() {
        console.group('🐛 DEBUG ESTADO IMUTÁVEL');
        console.log('📊 Estado atual:', this.getState());
        console.log('👂 Subscribers:', Array.from(this._subscribers.keys()));
        console.log('📝 Histórico:', this._history.slice(-5));
        console.log('🔒 Estado congelado:', Object.isFrozen(this._state));
        console.groupEnd();
    },
    
    // Métodos privados
    _validateChanges(updates) {
        const errors = [];
        
        for (const [key, value] of Object.entries(updates)) {
            const validator = this._validators.get(key);
            if (validator && !validator(value)) {
                errors.push(`Validação falhou para ${key}: ${value}`);
            }
        }
        
        return {
            valid: errors.length === 0,
            errors
        };
    },
    
    _addToHistory(action, updates, newState) {
        this._history.push({
            timestamp: new Date().toISOString(),
            action,
            updates,
            state: { ...newState }
        });
        
        // Manter tamanho do histórico
        if (this._history.length > this.maxHistory) {
            this._history.shift();
        }
    },
    
    _notifySubscribers(action, updates) {
        // Notificar subscribers gerais
        const generalSubs = this._subscribers.get('*') || new Set();
        generalSubs.forEach(callback => {
            try {
                callback(action, updates, this.getState());
            } catch (error) {
                console.error('❌ Erro em subscriber geral:', error);
            }
        });
        
        // Notificar subscribers específicos
        Object.keys(updates).forEach(key => {
            const keySubs = this._subscribers.get(key) || new Set();
            keySubs.forEach(callback => {
                try {
                    callback(updates[key], key, action);
                } catch (error) {
                    console.error(`❌ Erro em subscriber ${key}:`, error);
                }
            });
        });
    },
    
    _getDefaultState() {
        return {
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
            tamanhoCalendario: 'normal',
            mostrarTooltips: true,
            animacoesAtivadas: true
        };
    }
};

/**
 * Dados do Sistema - MELHORADO com validação
 * Estrutura principal dos dados da aplicação
 */
let dados = null; // Será inicializado automaticamente

/**
 * Inicializa os dados padrão do sistema
 */
function inicializarDados() {
    console.log('🔧 Inicializando dados padrão do sistema...');
    
    return {
        versao: 5,
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
            intervaloVerificacao: 3600000,
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
 * Configurar validadores de estado
 */
function configurarValidadores() {
    StateManager.addValidator('mesAtual', (value) => {
        return Number.isInteger(value) && value >= 0 && value <= 11;
    });
    
    StateManager.addValidator('anoAtual', (value) => {
        return Number.isInteger(value) && value >= 2020 && value <= 2030;
    });
    
    StateManager.addValidator('filtroAtual', (value) => {
        const filtrosValidos = ['todos', 'verde', 'amarelo', 'vermelho', 'urgentes', 'atrasadas', 'emdia', 'atencao'];
        return filtrosValidos.includes(value);
    });
    
    StateManager.addValidator('usuarioEmail', (value) => {
        return value === null || (typeof value === 'string' && value.includes('@'));
    });
}

/**
 * ========== FUNÇÕES DE MANIPULAÇÃO DO ESTADO - REFATORADAS ==========
 */

/**
 * Atualiza o estado do sistema de forma segura
 */
function atualizarEstado(chave, valor) {
    return StateManager.updateState('UPDATE_FIELD', { [chave]: valor });
}

/**
 * Reseta o estado para valores padrão
 */
function resetarEstado() {
    console.log('🔄 Resetando estado do sistema...');
    StateManager.reset();
}

/**
 * Obtém o estado atual
 */
function obterEstado(chave = null) {
    if (chave) {
        return StateManager.getValue(chave);
    }
    return StateManager.getState();
}

/**
 * Limpa seleções temporárias
 */
function limparSelecoes() {
    StateManager.updateState('CLEAR_SELECTIONS', {
        pessoasSelecionadas: new Set(),
        tarefasVinculadas: new Map(),
        editandoAtividade: null,
        editandoEvento: null,
        editandoTarefa: null
    });
}

/**
 * ========== FUNÇÕES DE NAVEGAÇÃO - REFATORADAS ==========
 */

/**
 * Navega para uma área específica
 */
function navegarParaArea(areaKey) {
    if (dados?.areas?.[areaKey]) {
        StateManager.updateState('NAVIGATE_AREA', {
            areaAtual: areaKey,
            pessoaAtual: null
        });
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
        StateManager.updateState('NAVIGATE_PERSON', {
            pessoaAtual: nomePessoa
        });
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
    StateManager.updateState('NAVIGATE_DASHBOARD', {
        areaAtual: null,
        pessoaAtual: null
    });
    limparSelecoes();
    
    console.log(`🏠 Voltando para dashboard`);
}

/**
 * ========== FUNÇÕES DE FILTROS - REFATORADAS ==========
 */

/**
 * Aplica filtro de status
 */
function aplicarFiltro(filtro) {
    if (StateManager.updateState('APPLY_FILTER', { filtroAtual: filtro })) {
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
    StateManager.updateState('CLEAR_FILTERS', { filtroAtual: 'todos' });
    console.log(`🧹 Filtros limpos`);
}

/**
 * ========== AUTO-SAVE INTELIGENTE ==========
 */

let autoSaveTimeout = null;

/**
 * Auto-save com debounce inteligente
 */
function debounceAutoSave() {
    if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
    }
    
    autoSaveTimeout = setTimeout(() => {
        if (typeof salvarDados === 'function') {
            salvarDados();
            StateManager.updateState('AUTO_SAVE', {
                contadorSalvamentos: StateManager.getValue('contadorSalvamentos') + 1,
                ultimaSincronizacao: new Date().toISOString()
            });
        }
    }, 5000);
}

// Subscriber para auto-save em mudanças críticas
StateManager.subscribe('*', (action, updates) => {
    // Apenas fazer auto-save em mudanças que realmente importam
    const criticalChanges = ['areaAtual', 'pessoaAtual', 'filtroAtual'];
    const hasCriticalChange = Object.keys(updates).some(key => criticalChanges.includes(key));
    
    if (hasCriticalChange && typeof salvarDados === 'function') {
        debounceAutoSave();
    }
});

/**
 * ========== INICIALIZAÇÃO E SETUP ==========
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
 * Inicializa o sistema de estado
 */
function inicializarSistemaEstado() {
    // Garantir dados inicializados
    garantirDadosInicializados();
    
    // Configurar validadores
    configurarValidadores();
    
    // Inicializar StateManager
    StateManager.initialize(StateManager._getDefaultState());
    
    console.log('🔒 Sistema de estado imutável inicializado');
}

// ... (resto das funções utilitárias permanecem iguais)

/**
 * ========== DEBUG MELHORADO ==========
 */

/**
 * Debug do estado atual
 */
function debugEstado() {
    console.group('🐛 DEBUG - Estado do Sistema');
    console.log('📊 Estatísticas:', obterEstatisticas());
    console.log('🔧 Estado atual:', StateManager.getState());
    console.log('📦 Dados carregados:', dadosCarregados());
    console.log('👤 Usuário atual:', {
        email: StateManager.getValue('usuarioEmail'),
        nome: StateManager.getValue('usuarioNome'),
        uid: StateManager.getValue('usuarioUID')
    });
    console.log('🌐 Conectividade:', {
        online: StateManager.getValue('online'),
        sincronizando: StateManager.getValue('sincronizando'),
        ultimaSincronizacao: StateManager.getValue('ultimaSincronizacao')
    });
    console.log('📝 Histórico de mudanças:', StateManager.getHistory().slice(-5));
    console.groupEnd();
}

/**
 * ========== EXPOSIÇÃO GLOBAL ==========
 */

if (typeof window !== 'undefined') {
    // Estado imutável
    window.StateManager = StateManager;
    window.estadoSistema = new Proxy({}, {
        get: (target, prop) => StateManager.getValue(prop),
        set: () => {
            console.warn('⚠️ Não é possível alterar estado diretamente. Use atualizarEstado()');
            return false;
        }
    });
    
    // Dados
    window.dados = dados;
    window.inicializarDados = inicializarDados;
    window.garantirDadosInicializados = garantirDadosInicializados;
    window.inicializarSistemaEstado = inicializarSistemaEstado;
    
    // Funções de manipulação
    window.atualizarEstado = atualizarEstado;
    window.obterEstado = obterEstado;
    window.debugEstado = debugEstado;
    window.validarIntegridadeDados = validarIntegridadeDados;
    window.dadosCarregados = dadosCarregados;
    window.navegarParaArea = navegarParaArea;
    window.navegarParaPessoa = navegarParaPessoa;
    window.voltarDashboard = voltarDashboard;
}

/**
 * ========== AUTO-INICIALIZAÇÃO ==========
 */

if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            inicializarSistemaEstado();
        });
    } else {
        inicializarSistemaEstado();
    }
} else {
    inicializarSistemaEstado();
}

console.log('✅ Módulo state.js IMUTÁVEL carregado com sucesso');