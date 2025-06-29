/* ==========================================================================
   APP.JS - ORQUESTRAÇÃO PRINCIPAL - Sistema de Gestão v5.1
   ========================================================================== */

/**
 * Arquivo principal do sistema que orquestra todos os módulos
 * Responsável pela inicialização, configuração e coordenação de todos os componentes
 */

/**
 * ========== VERIFICAÇÃO DE DEPENDÊNCIAS ==========
 */

/**
 * Verifica se todos os módulos necessários estão carregados
 */
function verificarDependencias() {
    const modulosObrigatorios = [
        { nome: 'Firebase', verificacao: () => typeof firebase !== 'undefined' },
        { nome: 'DOMUtils', verificacao: () => typeof window.DOMUtils !== 'undefined' },
        { nome: 'Helpers', verificacao: () => typeof window.Helpers !== 'undefined' },
        { nome: 'Notifications', verificacao: () => typeof window.Notifications !== 'undefined' },
        { nome: 'Validators', verificacao: () => typeof window.Validators !== 'undefined' }
    ];
    
    const modulosFaltando = modulosObrigatorios.filter(modulo => !modulo.verificacao());
    
    if (modulosFaltando.length > 0) {
        console.error('❌ Módulos não carregados:', modulosFaltando.map(m => m.nome));
        return false;
    }
    
    console.log('✅ Todas as dependências carregadas com sucesso');
    return true;
}

/**
 * ========== CONFIGURAÇÃO GLOBAL DO SISTEMA ==========
 */

const SISTEMA_CONFIG = {
    versao: '5.1',
    nome: 'Sistema de Gestão Colaborativo',
    projeto: 'Obra 292 - Museu Nacional',
    ambiente: 'production', // 'development' | 'production'
    
    // Configurações de inicialização
    inicializacao: {
        verificarIntegridade: true,
        carregarDadosIniciais: true,
        configurarEventosGlobais: true,
        iniciarMonitoramento: true,
        habilitarDebug: false // true em desenvolvimento
    },
    
    // Configurações de performance
    performance: {
        debounceSearch: 300,
        throttleResize: 250,
        autosaveInterval: 30000, // 30 segundos
        heartbeatInterval: 60000 // 1 minuto
    },
    
    // Configurações de validação
    validacao: {
        tempoRealValidation: true,
        mostrarTooltips: true,
        animarErros: true
    }
};

/**
 * ========== ESTADO GLOBAL DA APLICAÇÃO ==========
 */

let AppState = {
    // Status da aplicação
    inicializado: false,
    autenticado: false,
    online: true,
    sincronizando: false,
    
    // Dados do usuário
    usuario: null,
    permissoes: [],
    
    // Estado da interface
    telaAtual: 'dashboard',
    modalAberto: null,
    filtrosAtivos: new Map(),
    
    // Cache e performance
    cache: new Map(),
    intervalos: new Map(),
    
    // Debug e logs
    logs: [],
    metricas: {
        tempoInicializacao: 0,
        tempoCarregamento: 0,
        erros: 0,
        operacoes: 0
    }
};

/**
 * ========== INICIALIZAÇÃO PRINCIPAL ==========
 */

/**
 * Função principal de inicialização do sistema
 */
async function inicializarSistema() {
    const tempoInicio = performance.now();
    
    try {
        console.log(`🚀 Iniciando ${SISTEMA_CONFIG.nome} v${SISTEMA_CONFIG.versao}`);
        console.log(`📋 Projeto: ${SISTEMA_CONFIG.projeto}`);
        
        // 1. Verificar dependências
        if (!verificarDependencias()) {
            throw new Error('Dependências não carregadas');
        }
        
        // 2. Configurar ambiente
        configurarAmbiente();
        
        // 3. Inicializar módulos base
        await inicializarModulosBase();
        
        // 4. Configurar Firebase
        await configurarFirebase();
        
        // 5. Verificar autenticação
        await verificarAutenticacao();
        
        // 6. Inicializar interface
        inicializarInterface();
        
        // 7. Configurar eventos globais
        configurarEventosGlobais();
        
        // 8. Iniciar monitoramento
        iniciarMonitoramento();
        
        // 9. Carregar dados iniciais
        if (AppState.autenticado) {
            await carregarDadosIniciais();
        }
        
        // 10. Finalizar inicialização
        finalizarInicializacao(tempoInicio);
        
    } catch (error) {
        console.error('❌ Erro na inicialização:', error);
        tratarErroInicializacao(error);
    }
}

/**
 * Configura o ambiente da aplicação
 */
function configurarAmbiente() {
    // Configurar console.log baseado no ambiente
    if (SISTEMA_CONFIG.ambiente === 'production' && !SISTEMA_CONFIG.inicializacao.habilitarDebug) {
        console.log = () => {}; // Silenciar logs em produção
    }
    
    // Configurar tratamento de erros globais
    window.addEventListener('error', (event) => {
        AppState.metricas.erros++;
        console.error('Erro JavaScript:', event.error);
        
        if (window.Notifications) {
            window.Notifications.erro('Erro inesperado no sistema');
        }
    });
    
    // Configurar tratamento de promises rejeitadas
    window.addEventListener('unhandledrejection', (event) => {
        AppState.metricas.erros++;
        console.error('Promise rejeitada:', event.reason);
        
        if (window.Notifications) {
            window.Notifications.erro('Erro de comunicação');
        }
    });
    
    console.log('🔧 Ambiente configurado:', SISTEMA_CONFIG.ambiente);
}

/**
 * Inicializa módulos base do sistema
 */
async function inicializarModulosBase() {
    console.log('📦 Inicializando módulos base...');
    
    // Inicializar utilitários
    if (window.Notifications) {
        window.Notifications.inicializar();
    }
    
    if (window.Validators) {
        window.Validators.inicializar();
    }
    
    // Configurar notificações
    if (window.Notifications) {
        window.Notifications.posicao('top-right');
    }
    
    console.log('✅ Módulos base inicializados');
}

/**
 * Configura conexão com Firebase
 */
async function configurarFirebase() {
    console.log('🔥 Configurando Firebase...');
    
    try {
        // Verificar se Firebase está configurado no HTML
        if (typeof firebase === 'undefined') {
            throw new Error('Firebase não carregado');
        }
        
        // Verificar se as configurações estão presentes
        if (!firebase.apps.length) {
            throw new Error('Firebase não inicializado no HTML');
        }
        
        // Configurar listener de conexão
        const connectedRef = firebase.database().ref('.info/connected');
        connectedRef.on('value', (snapshot) => {
            AppState.online = snapshot.val() === true;
            
            if (window.Notifications) {
                if (AppState.online) {
                    window.Notifications.sincronizacao('synced');
                } else {
                    window.Notifications.sincronizacao('offline');
                }
            }
        });
        
        console.log('✅ Firebase configurado com sucesso');
        
    } catch (error) {
        console.error('❌ Erro ao configurar Firebase:', error);
        throw error;
    }
}

/**
 * Verifica estado de autenticação
 */
async function verificarAutenticacao() {
    console.log('🔐 Verificando autenticação...');
    
    return new Promise((resolve) => {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                AppState.autenticado = true;
                AppState.usuario = {
                    uid: user.uid,
                    email: user.email,
                    nome: user.displayName || user.email.split('@')[0]
                };
                
                console.log('✅ Usuário autenticado:', AppState.usuario.nome);
                
                // Esconder tela de login se estiver visível
                if (window.DOMUtils) {
                    window.DOMUtils.hide('loginScreen');
                    window.DOMUtils.show('mainContainer');
                }
                
                resolve(true);
            } else {
                AppState.autenticado = false;
                AppState.usuario = null;
                
                console.log('ℹ️ Usuário não autenticado');
                
                // Mostrar tela de login
                if (window.DOMUtils) {
                    window.DOMUtils.show('loginScreen');
                    window.DOMUtils.hide('mainContainer');
                }
                
                resolve(false);
            }
        });
    });
}

/**
 * Inicializa elementos da interface
 */
function inicializarInterface() {
    console.log('🎨 Inicializando interface...');
    
    try {
        // Atualizar informações do sistema
        atualizarInfoSistema();
        
        // Configurar data atual
        atualizarDataAtual();
        
        // Inicializar tooltips
        inicializarTooltips();
        
        // Configurar atalhos de teclado
        configurarAtalhosTeclado();
        
        console.log('✅ Interface inicializada');
        
    } catch (error) {
        console.error('❌ Erro ao inicializar interface:', error);
    }
}

/**
 * Atualiza informações do sistema na interface
 */
function atualizarInfoSistema() {
    if (AppState.usuario && window.DOMUtils) {
        window.DOMUtils.setText('usuarioInfo', `👤 ${AppState.usuario.nome}`);
    }
    
    // Atualizar versão se existir elemento
    const versaoEl = document.querySelector('[data-versao]');
    if (versaoEl) {
        versaoEl.textContent = `v${SISTEMA_CONFIG.versao}`;
    }
}

/**
 * Atualiza data atual na interface
 */
function atualizarDataAtual() {
    const hoje = new Date();
    const opcoes = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    
    if (window.DOMUtils) {
        window.DOMUtils.setText('dataAtual', hoje.toLocaleDateString('pt-BR', opcoes));
    }
    
    // Atualizar mês/ano
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                   'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    
    if (window.DOMUtils) {
        window.DOMUtils.setText('mesAno', `${meses[hoje.getMonth()]} ${hoje.getFullYear()}`);
    }
}

/**
 * Inicializa tooltips do sistema
 */
function inicializarTooltips() {
    // Configurar tooltips para elementos com data-tooltip
    document.addEventListener('mouseover', (e) => {
        const elemento = e.target.closest('[data-tooltip]');
        if (elemento && !elemento.querySelector('.tooltip-content')) {
            mostrarTooltip(elemento);
        }
    });
    
    document.addEventListener('mouseout', (e) => {
        const elemento = e.target.closest('[data-tooltip]');
        if (elemento) {
            ocultarTooltip(elemento);
        }
    });
}

/**
 * Configura atalhos de teclado globais
 */
function configurarAtalhosTeclado() {
    document.addEventListener('keydown', (e) => {
        // Ctrl+S - Salvar
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            salvarDados();
        }
        
        // Ctrl+Shift+I - Verificar integridade
        if (e.ctrlKey && e.shiftKey && e.key === 'I') {
            e.preventDefault();
            verificarIntegridadeSistema();
        }
        
        // Escape - Fechar modais
        if (e.key === 'Escape') {
            fecharTodosModais();
        }
        
        // F5 - Recarregar com confirmação
        if (e.key === 'F5' && !e.ctrlKey) {
            if (AppState.sincronizando) {
                e.preventDefault();
                if (window.Notifications) {
                    window.Notifications.atencao('Aguarde a sincronização terminar');
                }
            }
        }
    });
}

/**
 * Configura eventos globais do sistema
 */
function configurarEventosGlobais() {
    console.log('⚡ Configurando eventos globais...');
    
    // Evento de resize com throttle
    if (window.Helpers) {
        const handleResize = window.Helpers.throttle(() => {
            // Atualizar layout responsivo se necessário
            atualizarLayoutResponsivo();
        }, SISTEMA_CONFIG.performance.throttleResize);
        
        window.addEventListener('resize', handleResize);
    }
    
    // Evento de visibilidade da página
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            // Página ficou oculta - pausar operações pesadas
            pausarOperacoesPesadas();
        } else {
            // Página ficou visível - retomar operações
            retomarOperacoesPesadas();
        }
    });
    
    // Evento antes de sair da página
    window.addEventListener('beforeunload', (e) => {
        if (AppState.sincronizando) {
            e.preventDefault();
            e.returnValue = 'Dados sendo sincronizados. Tem certeza que deseja sair?';
        }
    });
    
    console.log('✅ Eventos globais configurados');
}

/**
 * Inicia monitoramento do sistema
 */
function iniciarMonitoramento() {
    console.log('📊 Iniciando monitoramento...');
    
    // Heartbeat para verificar saúde do sistema
    const heartbeat = setInterval(() => {
        verificarSaudeSistema();
    }, SISTEMA_CONFIG.performance.heartbeatInterval);
    
    AppState.intervalos.set('heartbeat', heartbeat);
    
    // Auto-save periódico
    const autosave = setInterval(() => {
        if (AppState.autenticado && !AppState.sincronizando) {
            salvarDadosAutomatico();
        }
    }, SISTEMA_CONFIG.performance.autosaveInterval);
    
    AppState.intervalos.set('autosave', autosave);
    
    console.log('✅ Monitoramento iniciado');
}

/**
 * Carrega dados iniciais do sistema
 */
async function carregarDadosIniciais() {
    console.log('📡 Carregando dados iniciais...');
    
    try {
        AppState.sincronizando = true;
        
        if (window.Notifications) {
            window.Notifications.sincronizacao('syncing');
        }
        
        // Simular carregamento - em implementação real, carregar do Firebase
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        AppState.sincronizando = false;
        
        if (window.Notifications) {
            window.Notifications.sincronizacao('synced');
        }
        
        console.log('✅ Dados iniciais carregados');
        
    } catch (error) {
        AppState.sincronizando = false;
        console.error('❌ Erro ao carregar dados:', error);
        
        if (window.Notifications) {
            window.Notifications.sincronizacao('error');
        }
    }
}

/**
 * Finaliza processo de inicialização
 */
function finalizarInicializacao(tempoInicio) {
    const tempoFim = performance.now();
    const tempoTotal = tempoFim - tempoInicio;
    
    AppState.inicializado = true;
    AppState.metricas.tempoInicializacao = tempoTotal;
    
    console.log(`🎉 Sistema inicializado com sucesso em ${tempoTotal.toFixed(2)}ms`);
    
    // Mostrar notificação de boas-vindas
    if (AppState.autenticado && window.Notifications) {
        window.Notifications.sucesso(
            `Bem-vindo(a), ${AppState.usuario.nome}! Sistema v${SISTEMA_CONFIG.versao} pronto.`
        );
    }
    
    // Disparar evento personalizado
    window.dispatchEvent(new CustomEvent('sistemaInicializado', {
        detail: {
            versao: SISTEMA_CONFIG.versao,
            tempoInicializacao: tempoTotal,
            usuario: AppState.usuario
        }
    }));
}

/**
 * ========== FUNÇÕES DE SISTEMA ==========
 */

/**
 * Verifica integridade do sistema
 */
function verificarIntegridadeSistema() {
    console.log('🔍 Verificando integridade do sistema...');
    
    const verificacoes = {
        firebase: typeof firebase !== 'undefined' && firebase.apps.length > 0,
        autenticacao: AppState.autenticado,
        conexao: AppState.online,
        modulos: verificarDependencias(),
        interface: document.getElementById('mainContainer') !== null
    };
    
    const problemas = Object.entries(verificacoes)
        .filter(([chave, valor]) => !valor)
        .map(([chave]) => chave);
    
    if (problemas.length === 0) {
        console.log('✅ Sistema íntegro');
        if (window.Notifications) {
            window.Notifications.sucesso('Sistema funcionando corretamente');
        }
    } else {
        console.warn('⚠️ Problemas encontrados:', problemas);
        if (window.Notifications) {
            window.Notifications.atencao(`Problemas detectados: ${problemas.join(', ')}`);
        }
    }
    
    return verificacoes;
}

/**
 * Verifica saúde do sistema (heartbeat)
 */
function verificarSaudeSistema() {
    // Verificar uso de memória
    if (performance.memory) {
        const memoria = performance.memory;
        const usoMemoria = (memoria.usedJSHeapSize / memoria.jsHeapSizeLimit) * 100;
        
        if (usoMemoria > 80) {
            console.warn('⚠️ Alto uso de memória:', usoMemoria.toFixed(1) + '%');
        }
    }
    
    // Verificar quantidade de listeners
    const totalListeners = AppState.intervalos.size;
    if (totalListeners > 20) {
        console.warn('⚠️ Muitos listeners ativos:', totalListeners);
    }
    
    // Limpeza de cache se necessário
    if (AppState.cache.size > 100) {
        limparCache();
    }
}

/**
 * Salva dados automaticamente
 */
function salvarDadosAutomatico() {
    if (typeof salvarDados === 'function') {
        console.log('💾 Auto-save executado');
        salvarDados();
    }
}

/**
 * Limpa cache do sistema
 */
function limparCache() {
    const tamanhoAnterior = AppState.cache.size;
    AppState.cache.clear();
    console.log(`🗑️ Cache limpo: ${tamanhoAnterior} itens removidos`);
}

/**
 * ========== FUNÇÕES DE INTERFACE ==========
 */

/**
 * Mostra tooltip
 */
function mostrarTooltip(elemento) {
    const tooltip = document.createElement('div');
    tooltip.className = 'system-tooltip';
    tooltip.textContent = elemento.getAttribute('data-tooltip');
    tooltip.style.cssText = `
        position: absolute;
        background: #1f2937;
        color: white;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 12px;
        z-index: 10000;
        pointer-events: none;
        white-space: nowrap;
    `;
    
    document.body.appendChild(tooltip);
    
    const rect = elemento.getBoundingClientRect();
    tooltip.style.top = (rect.bottom + 5) + 'px';
    tooltip.style.left = rect.left + 'px';
    
    elemento._tooltip = tooltip;
}

/**
 * Oculta tooltip
 */
function ocultarTooltip(elemento) {
    if (elemento._tooltip) {
        elemento._tooltip.remove();
        delete elemento._tooltip;
    }
}

/**
 * Fecha todos os modais abertos
 */
function fecharTodosModais() {
    const modais = document.querySelectorAll('.modal.active');
    modais.forEach(modal => {
        if (typeof fecharModal === 'function') {
            fecharModal(modal.id);
        } else {
            modal.classList.remove('active');
        }
    });
}

/**
 * Atualiza layout responsivo
 */
function atualizarLayoutResponsivo() {
    // Implementar ajustes de layout se necessário
    const largura = window.innerWidth;
    
    if (largura < 768) {
        document.body.classList.add('mobile-layout');
    } else {
        document.body.classList.remove('mobile-layout');
    }
}

/**
 * ========== FUNÇÕES DE PERFORMANCE ==========
 */

/**
 * Pausa operações pesadas
 */
function pausarOperacoesPesadas() {
    console.log('⏸️ Pausando operações pesadas');
    // Implementar lógica para pausar operações que consomem recursos
}

/**
 * Retoma operações pesadas
 */
function retomarOperacoesPesadas() {
    console.log('▶️ Retomando operações pesadas');
    // Implementar lógica para retomar operações
}

/**
 * ========== FUNÇÕES DE ERRO ==========
 */

/**
 * Trata erro na inicialização
 */
function tratarErroInicializacao(error) {
    console.error('💥 Falha crítica na inicialização:', error);
    
    // Mostrar mensagem de erro para o usuário
    const errorContainer = document.createElement('div');
    errorContainer.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #ef4444;
        color: white;
        padding: 20px;
        border-radius: 8px;
        text-align: center;
        z-index: 99999;
        max-width: 400px;
    `;
    
    errorContainer.innerHTML = `
        <h3>Erro de Inicialização</h3>
        <p>Não foi possível carregar o sistema.</p>
        <p style="font-size: 12px; margin-top: 10px;">
            Erro: ${error.message}
        </p>
        <button onclick="location.reload()" style="
            margin-top: 15px;
            padding: 8px 16px;
            background: white;
            color: #ef4444;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        ">Tentar Novamente</button>
    `;
    
    document.body.appendChild(errorContainer);
}

/**
 * ========== FUNÇÕES DE CLEANUP ==========
 */

/**
 * Limpa recursos ao sair
 */
function limparRecursos() {
    console.log('🧹 Limpando recursos...');
    
    // Limpar intervalos
    AppState.intervalos.forEach((intervalo, nome) => {
        clearInterval(intervalo);
        console.log(`🗑️ Intervalo ${nome} limpo`);
    });
    AppState.intervalos.clear();
    
    // Limpar cache
    limparCache();
    
    // Limpar tooltips
    document.querySelectorAll('.system-tooltip').forEach(tooltip => {
        tooltip.remove();
    });
}

/**
 * ========== API PÚBLICA DO SISTEMA ==========
 */

// Disponibilizar API pública
window.Sistema = {
    // Estado
    estado: AppState,
    config: SISTEMA_CONFIG,
    
    // Funções principais
    inicializar: inicializarSistema,
    verificarIntegridade: verificarIntegridadeSistema,
    limparCache: limparCache,
    limparRecursos: limparRecursos,
    
    // Utilitários
    versao: () => SISTEMA_CONFIG.versao,
    online: () => AppState.online,
    autenticado: () => AppState.autenticado,
    usuario: () => AppState.usuario
};

/**
 * ========== INICIALIZAÇÃO AUTOMÁTICA ==========
 */

// Aguardar carregamento do DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarSistema);
} else {
    // DOM já carregado - inicializar imediatamente
    inicializarSistema();
}

// Limpar recursos ao sair
window.addEventListener('beforeunload', limparRecursos);

console.log('📁 app.js carregado - Sistema pronto para inicialização');

/* ==========================================================================
   FIM DO APP.JS - Sistema de Gestão v5.1
   ========================================================================== */ 
