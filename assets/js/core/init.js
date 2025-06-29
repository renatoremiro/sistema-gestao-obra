/* ==========================================================================
   INICIALIZAÇÃO DO SISTEMA - Sistema de Gestão v5.1
   ========================================================================== */

/**
 * Módulo de inicialização e orquestração do sistema
 * Responsável por configurar e inicializar todos os componentes
 */

/**
 * Variáveis globais de inicialização
 */
let sistemaInicializado = false;
let etapasInicializacao = [];
let tempoInicioSistema = null;
let intervalosAtivos = [];
let listenersAtivos = [];

/**
 * Configuração de inicialização
 */
/* ==========================================================================
   SISTEMA DE TIMEOUTS ADAPTATIVOS - Substituir CONFIG_INICIALIZACAO em init.js
   ========================================================================== */

/**
 * Detecção inteligente de ambiente e configuração de timeouts
 */
function detectarAmbienteRede() {
    const conexao = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    // Detectar tipo de ambiente
    const isLocal = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    const isDev = location.hostname.includes('github.io') || location.hostname.includes('netlify') || location.hostname.includes('vercel');
    const isProd = !isLocal && !isDev;
    
    // Detectar velocidade da conexão
    let velocidadeConexao = 'rapida';
    if (conexao) {
        const effectiveType = conexao.effectiveType;
        if (effectiveType === 'slow-2g' || effectiveType === '2g') {
            velocidadeConexao = 'lenta';
        } else if (effectiveType === '3g') {
            velocidadeConexao = 'media';
        }
    }
    
    // Detectar performance do dispositivo
    const memoriaDisponivel = navigator.deviceMemory || 4; // GB
    const nucleosCPU = navigator.hardwareConcurrency || 4;
    
    let performanceDispositivo = 'alto';
    if (memoriaDisponivel < 2 || nucleosCPU < 2) {
        performanceDispositivo = 'baixo';
    } else if (memoriaDisponivel < 4 || nucleosCPU < 4) {
        performanceDispositivo = 'medio';
    }
    
    return {
        ambiente: isLocal ? 'local' : isDev ? 'dev' : 'prod',
        velocidadeConexao,
        performanceDispositivo,
        memoriaDisponivel,
        nucleosCPU,
        conexaoInfo: conexao ? {
            tipo: conexao.type,
            effectiveType: conexao.effectiveType,
            downlink: conexao.downlink,
            rtt: conexao.rtt
        } : null
    };
}

/**
 * Configuração inteligente de timeouts baseada no ambiente
 */
function obterConfiguracaoTimeouts() {
    const ambiente = detectarAmbienteRede();
    
    console.log('🌐 Ambiente detectado:', ambiente);
    
    // Multiplicadores baseados no ambiente
    let multiplicadorBase = 1;
    
    // Ajuste por ambiente
    switch (ambiente.ambiente) {
        case 'local':
            multiplicadorBase = 0.5; // Local é mais rápido
            break;
        case 'dev':
            multiplicadorBase = 1.2; // Dev pode ser mais lento
            break;
        case 'prod':
            multiplicadorBase = 1; // Baseline
            break;
    }
    
    // Ajuste por velocidade de conexão
    switch (ambiente.velocidadeConexao) {
        case 'lenta':
            multiplicadorBase *= 2.5;
            break;
        case 'media':
            multiplicadorBase *= 1.5;
            break;
        case 'rapida':
            multiplicadorBase *= 1;
            break;
    }
    
    // Ajuste por performance do dispositivo
    switch (ambiente.performanceDispositivo) {
        case 'baixo':
            multiplicadorBase *= 1.8;
            break;
        case 'medio':
            multiplicadorBase *= 1.3;
            break;
        case 'alto':
            multiplicadorBase *= 1;
            break;
    }
    
    // Timeouts base em milissegundos
    const timeoutsBase = {
        inicializacao: 30000,        // 30s baseline
        autenticacao: 10000,         // 10s baseline
        carregamentoDados: 15000,    // 15s baseline
        conexaoFirebase: 8000,       // 8s baseline
        salvamento: 5000,            // 5s baseline
        sincronizacao: 12000,        // 12s baseline
        tentativaRecuperacao: 3000   // 3s baseline
    };
    
    // Aplicar multiplicador
    const timeoutsFinais = {};
    Object.entries(timeoutsBase).forEach(([chave, valor]) => {
        timeoutsFinais[chave] = Math.round(valor * multiplicadorBase);
    });
    
    // Limites mínimos e máximos
    const limites = {
        inicializacao: { min: 15000, max: 120000 },    // 15s - 2min
        autenticacao: { min: 5000, max: 45000 },       // 5s - 45s
        carregamentoDados: { min: 8000, max: 60000 },  // 8s - 1min
        conexaoFirebase: { min: 3000, max: 30000 },    // 3s - 30s
        salvamento: { min: 2000, max: 20000 },         // 2s - 20s
        sincronizacao: { min: 5000, max: 40000 },      // 5s - 40s
        tentativaRecuperacao: { min: 1000, max: 10000 } // 1s - 10s
    };
    
    // Aplicar limites
    Object.entries(timeoutsFinais).forEach(([chave, valor]) => {
        const limite = limites[chave];
        if (limite) {
            timeoutsFinais[chave] = Math.max(limite.min, Math.min(limite.max, valor));
        }
    });
    
    return {
        timeouts: timeoutsFinais,
        ambiente,
        multiplicador: multiplicadorBase,
        tentativasMaximas: ambiente.velocidadeConexao === 'lenta' ? 5 : 3,
        intervaloTentativa: ambiente.velocidadeConexao === 'lenta' ? 3000 : 2000
    };
}

/**
 * Configuração de inicialização MELHORADA com timeouts adaptativos
 */
const CONFIG_INICIALIZACAO_INTELIGENTE = (() => {
    const config = obterConfiguracaoTimeouts();
    
    return {
        // Timeouts adaptativos
        timeoutInicializacao: config.timeouts.inicializacao,
        timeoutAutenticacao: config.timeouts.autenticacao,
        timeoutCarregamentoDados: config.timeouts.carregamentoDados,
        timeoutConexaoFirebase: config.timeouts.conexaoFirebase,
        timeoutSalvamento: config.timeouts.salvamento,
        timeoutSincronizacao: config.timeouts.sincronizacao,
        timeoutRecuperacao: config.timeouts.tentativaRecuperacao,
        
        // Configurações adaptativas
        tentativasMaximas: config.tentativasMaximas,
        intervaloTentativa: config.intervaloTentativa,
        
        // Flags originais
        verificarIntegridade: true,
        carregarDadosAutomatico: true,
        iniciarVerificacaoPrazos: true,
        configurarEventosGlobais: true,
        
        // Configurações de performance
        memoriaDisponivel: config.ambiente.memoriaDisponivel,
        performanceDispositivo: config.ambiente.performanceDispositivo,
        velocidadeConexao: config.ambiente.velocidadeConexao,
        
        // Debug
        ambiente: config.ambiente.ambiente,
        multiplicadorTimeout: config.multiplicador,
        
        // Configurações específicas por ambiente
        otimizacoes: {
            preloadModulos: config.ambiente.performanceDispositivo === 'alto',
            cacheAgressivo: config.ambiente.velocidadeConexao === 'lenta',
            compressionGzip: config.ambiente.velocidadeConexao !== 'rapida',
            batchRequests: config.ambiente.velocidadeConexao === 'lenta'
        }
    };
})();

/**
 * Função verificarAutenticacao MELHORADA com timeout adaptativo
 */
async function verificarAutenticacaoInteligente() {
    if (!firebase.auth) {
        throw new Error('Firebase Auth não disponível');
    }

    const timeoutAuth = CONFIG_INICIALIZACAO_INTELIGENTE.timeoutAutenticacao;
    console.log(`🔐 Verificando autenticação (timeout: ${timeoutAuth}ms)...`);

    return new Promise((resolve, reject) => {
        let resolvido = false;
        
        const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
            if (resolvido) return;
            
            unsubscribe(); // Remove o listener imediatamente
            resolvido = true;
            
            if (user) {
                // Usuário logado
                usuarioAtual = user;
                
                if (estadoSistema) {
                    estadoSistema.usuarioEmail = user.email;
                    estadoSistema.usuarioNome = user.displayName || user.email.split('@')[0];
                    estadoSistema.usuarioUID = user.uid;
                }

                console.log('👤 Usuário autenticado:', user.email);
                resolve({ autenticado: true, usuario: user.email });
            } else {
                // Usuário não logado
                console.log('🔐 Usuário não autenticado');
                resolve({ autenticado: false });
            }
        }, (error) => {
            if (resolvido) return;
            
            resolvido = true;
            console.error('❌ Erro na verificação de auth:', error);
            reject(error);
        });

        // Timeout adaptativo
        setTimeout(() => {
            if (resolvido) return;
            
            resolvido = true;
            unsubscribe();
            
            const erro = new Error(`Timeout na verificação de autenticação (${timeoutAuth}ms)`);
            console.warn('⏰ Timeout de autenticação:', erro.message);
            reject(erro);
        }, timeoutAuth);
    });
}

/**
 * Função configurarFirebaseInit MELHORADA com timeout adaptativo
 */
async function configurarFirebaseInitInteligente() {
    if (typeof firebase === 'undefined') {
        throw new Error('Firebase não está disponível');
    }

    // Verificar se já foi inicializado
    if (!firebase.apps.length) {
        throw new Error('Firebase não foi configurado. Execute firebase.js primeiro.');
    }

    const timeoutConexao = CONFIG_INICIALIZACAO_INTELIGENTE.timeoutConexaoFirebase;
    console.log(`🔥 Verificando conexão Firebase (timeout: ${timeoutConexao}ms)...`);

    // Verificar conexão com timeout adaptativo
    const connected = await new Promise((resolve) => {
        let resolvido = false;
        
        const connectedRef = firebase.database().ref('.info/connected');
        
        const handleConnection = (snapshot) => {
            if (resolvido) return;
            
            resolvido = true;
            connectedRef.off('value', handleConnection);
            resolve(snapshot.val() === true);
        };
        
        connectedRef.on('value', handleConnection);
        
        // Timeout adaptativo
        setTimeout(() => {
            if (resolvido) return;
            
            resolvido = true;
            connectedRef.off('value', handleConnection);
            console.warn(`⏰ Timeout de conexão Firebase (${timeoutConexao}ms)`);
            resolve(false);
        }, timeoutConexao);
    });

    if (!connected) {
        console.warn('⚠️ Firebase offline - modo offline ativado');
        if (estadoSistema) {
            estadoSistema.online = false;
        }
    } else {
        console.log('🔥 Firebase conectado com sucesso');
        if (estadoSistema) {
            estadoSistema.online = true;
        }
    }

    return { conectado: connected, timeoutUsado: timeoutConexao };
}

/**
 * Função carregarDadosIniciais MELHORADA com timeout adaptativo
 */
async function carregarDadosIniciaisInteligente() {
    if (!CONFIG_INICIALIZACAO_INTELIGENTE.carregarDadosAutomatico) {
        console.log('📊 Carregamento automático de dados desabilitado');
        return { dados: null };
    }

    const timeoutCarregamento = CONFIG_INICIALIZACAO_INTELIGENTE.timeoutCarregamentoDados;
    console.log(`📦 Carregando dados (timeout: ${timeoutCarregamento}ms)...`);

    try {
        // Carregar dados com timeout adaptativo
        const dadosServidor = await Promise.race([
            firebase.database().ref('dados').once('value').then(snapshot => snapshot.val()),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error(`Timeout carregamento dados (${timeoutCarregamento}ms)`)), timeoutCarregamento)
            )
        ]);

        if (dadosServidor) {
            // Dados encontrados no servidor
            dados = dadosServidor;
            console.log('📦 Dados carregados do Firebase');
            
            // Verificar integridade se habilitado
            if (CONFIG_INICIALIZACAO_INTELIGENTE.verificarIntegridade) {
                const problemas = validarIntegridadeDados();
                if (problemas.length > 0) {
                    console.warn('⚠️ Problemas de integridade encontrados:', problemas);
                }
            }
            
            return { origem: 'firebase', dados: dados, timeoutUsado: timeoutCarregamento };
        } else {
            // Nenhum dado no servidor - inicializar dados padrão
            console.log('🔧 Nenhum dado encontrado - inicializando dados padrão');
            dados = inicializarDados();
            
            // Salvar dados iniciais no Firebase se usuário logado
            if (usuarioAtual) {
                await salvarDadosComTimeout(dados);
                console.log('💾 Dados padrão salvos no Firebase');
            }
            
            return { origem: 'inicializacao', dados: dados, timeoutUsado: timeoutCarregamento };
        }
    } catch (error) {
        console.error('❌ Erro ao carregar dados:', error);
        
        // Fallback para dados padrão
        console.log('🔄 Fallback: usando dados padrão');
        dados = inicializarDados();
        
        return { origem: 'fallback', dados: dados, erro: error.message, timeoutUsado: timeoutCarregamento };
    }
}

/**
 * Salvamento com timeout adaptativo
 */
async function salvarDadosComTimeout(dadosParaSalvar) {
    const timeoutSalvamento = CONFIG_INICIALIZACAO_INTELIGENTE.timeoutSalvamento;
    
    return Promise.race([
        firebase.database().ref('dados').set(dadosParaSalvar),
        new Promise((_, reject) => 
            setTimeout(() => reject(new Error(`Timeout salvamento (${timeoutSalvamento}ms)`)), timeoutSalvamento)
        )
    ]);
}

/**
 * Monitoramento inteligente de performance
 */
function monitorarPerformanceInteligente() {
    const config = CONFIG_INICIALIZACAO_INTELIGENTE;
    const memoria = performance.memory;
    
    const stats = {
        // Informações de memória
        memoria: memoria ? {
            usedJSHeapSize: Math.round(memoria.usedJSHeapSize / 1024 / 1024) + 'MB',
            totalJSHeapSize: Math.round(memoria.totalJSHeapSize / 1024 / 1024) + 'MB',
            limitJSHeapSize: Math.round(memoria.jsHeapSizeLimit / 1024 / 1024) + 'MB'
        } : null,
        
        // Informações do sistema
        ambiente: config.ambiente,
        performanceDispositivo: config.performanceDispositivo,
        velocidadeConexao: config.velocidadeConexao,
        memoriaDisponivel: config.memoriaDisponivel + 'GB',
        
        // Informações de timing
        tempoAtivo: Math.round((performance.now() - tempoInicioSistema) / 1000) + 's',
        timeoutsUsados: {
            inicializacao: config.timeoutInicializacao + 'ms',
            autenticacao: config.timeoutAutenticacao + 'ms',
            carregamentoDados: config.timeoutCarregamentoDados + 'ms'
        },
        
        // Contadores
        salvamentos: estadoSistema?.contadorSalvamentos || 0,
        intervalosAtivos: intervalosAtivos.length,
        listenersAtivos: listenersAtivos.length,
        
        // Otimizações ativas
        otimizacoes: config.otimizacoes
    };

    // Log apenas se houver problemas
    if (memoria && memoria.usedJSHeapSize > 50 * 1024 * 1024) { // 50MB
        console.warn('⚠️ Alto uso de memória detectado:', stats);
    }
    
    // Log se conexão lenta ou dispositivo baixa performance
    if (config.velocidadeConexao === 'lenta' || config.performanceDispositivo === 'baixo') {
        console.log('📊 Stats performance (ambiente limitado):', stats);
    }

    return stats;
}

/**
 * Sistema de retry inteligente
 */
async function tentarComRetryInteligente(operacao, nomeOperacao) {
    const config = CONFIG_INICIALIZACAO_INTELIGENTE;
    const maxTentativas = config.tentativasMaximas;
    const intervalo = config.intervaloTentativa;
    
    for (let tentativa = 1; tentativa <= maxTentativas; tentativa++) {
        try {
            console.log(`🔄 ${nomeOperacao} - Tentativa ${tentativa}/${maxTentativas}`);
            const resultado = await operacao();
            
            if (tentativa > 1) {
                console.log(`✅ ${nomeOperacao} sucesso na tentativa ${tentativa}`);
            }
            
            return resultado;
        } catch (error) {
            console.warn(`⚠️ ${nomeOperacao} falhou (tentativa ${tentativa}):`, error.message);
            
            if (tentativa === maxTentativas) {
                throw new Error(`${nomeOperacao} falhou após ${maxTentativas} tentativas: ${error.message}`);
            }
            
            // Esperar antes da próxima tentativa
            await new Promise(resolve => setTimeout(resolve, intervalo * tentativa));
        }
    }
}

/**
 * Função de debug para timeouts
 */
function debugTimeouts() {
    const config = CONFIG_INICIALIZACAO_INTELIGENTE;
    
    console.group('⏰ DEBUG TIMEOUTS INTELIGENTES');
    console.log('🌐 Ambiente:', config.ambiente);
    console.log('📱 Performance dispositivo:', config.performanceDispositivo);
    console.log('🌐 Velocidade conexão:', config.velocidadeConexao);
    console.log('💾 Memória disponível:', config.memoriaDisponivel);
    console.log('⚡ Multiplicador:', config.multiplicadorTimeout);
    console.log('🔧 Timeouts configurados:', {
        inicializacao: config.timeoutInicializacao + 'ms',
        autenticacao: config.timeoutAutenticacao + 'ms',
        carregamentoDados: config.timeoutCarregamentoDados + 'ms',
        conexaoFirebase: config.timeoutConexaoFirebase + 'ms'
    });
    console.log('🔄 Tentativas máximas:', config.tentativasMaximas);
    console.log('🎯 Otimizações ativas:', config.otimizacoes);
    console.groupEnd();
}

// Substituir as configurações e funções originais
if (typeof window !== 'undefined') {
    // Substituir configuração global
    window.CONFIG_INICIALIZACAO = CONFIG_INICIALIZACAO_INTELIGENTE;
    
    // Substituir funções com timeouts
    window.verificarAutenticacao = verificarAutenticacaoInteligente;
    window.configurarFirebaseInit = configurarFirebaseInitInteligente;
    window.carregarDadosIniciais = carregarDadosIniciaisInteligente;
    window.monitorarPerformance = monitorarPerformanceInteligente;
    
    // Novas funções
    window.detectarAmbienteRede = detectarAmbienteRede;
    window.obterConfiguracaoTimeouts = obterConfiguracaoTimeouts;
    window.salvarDadosComTimeout = salvarDadosComTimeout;
    window.tentarComRetryInteligente = tentarComRetryInteligente;
    window.debugTimeouts = debugTimeouts;
    
    console.log('⏰ Sistema de timeouts adaptativos carregado!');
    console.log(`🎯 Configuração atual:`, CONFIG_INICIALIZACAO_INTELIGENTE.ambiente, 
                `- Auth timeout: ${CONFIG_INICIALIZACAO_INTELIGENTE.timeoutAutenticacao}ms`);
}

/**
 * Sequência de inicialização do sistema
 */
async function inicializarSistema() {
    if (sistemaInicializado) {
        console.warn('⚠️ Sistema já foi inicializado!');
        return true;
    }

    tempoInicioSistema = performance.now();
    console.log('🚀 Iniciando Sistema de Gestão v5.1...');
    console.log('📋 Sequência de inicialização iniciada');

    try {
        // Reset do estado de inicialização
        etapasInicializacao = [];
        intervalosAtivos = [];
        listenersAtivos = [];

        // Sequência ordenada de inicialização
        const etapas = [
            { nome: 'Verificar Dependências', funcao: verificarDependencias },
            { nome: 'Configurar Firebase', funcao: configurarFirebaseInit },
            { nome: 'Verificar Autenticação', funcao: verificarAutenticacao },
            { nome: 'Carregar/Inicializar Dados', funcao: carregarDadosIniciais },
            { nome: 'Configurar Sincronização', funcao: configurarSincronizacaoInit },
            { nome: 'Configurar Presença Online', funcao: configurarPresencaInit },
            { nome: 'Iniciar Monitoramento', funcao: iniciarMonitoramento },
            { nome: 'Configurar Interface', funcao: configurarInterface },
            { nome: 'Configurar Eventos Globais', funcao: configurarEventosGlobais },
            { nome: 'Renderizar Dashboard', funcao: renderizarDashboardInicial },
            { nome: 'Verificação Final', funcao: verificacaoFinal }
        ];

        // Executar cada etapa
        for (const etapa of etapas) {
            await executarEtapaInicializacao(etapa);
        }

        sistemaInicializado = true;
        const tempoTotal = performance.now() - tempoInicioSistema;
        
        console.log('🎉 Sistema inicializado com sucesso!');
        console.log(`⏱️ Tempo total de inicialização: ${Math.round(tempoTotal)}ms`);
        console.log('📊 Etapas concluídas:', etapasInicializacao.length);
        
        // Mostrar notificação de sucesso
        if (typeof mostrarNotificacao === 'function') {
            mostrarNotificacao(`✨ Sistema v5.1 pronto! (${Math.round(tempoTotal)}ms)`);
        }

        // Registrar inicialização
        if (typeof registrarAtividade === 'function') {
            registrarAtividade('sistema_inicializado', {
                tempo: Math.round(tempoTotal),
                etapas: etapasInicializacao.length,
                versao: SISTEMA_CONSTANTS.VERSAO_SISTEMA
            });
        }

        // Otimização pós-inicialização
        setTimeout(otimizacaoPosinicializacao, 5000);

        return true;

    } catch (error) {
        console.error('❌ Erro durante inicialização:', error);
        
        if (typeof mostrarNotificacao === 'function') {
            mostrarNotificacao('Erro na inicialização do sistema', 'error');
        }

        // Tentar recuperação
        await tentarRecuperacao(error);
        return false;
    }
}

/**
 * Executa uma etapa específica da inicialização
 */
async function executarEtapaInicializacao(etapa) {
    const inicioEtapa = performance.now();
    
    try {
        console.log(`🔧 Executando: ${etapa.nome}...`);
        
        const resultado = await etapa.funcao();
        
        const tempoEtapa = performance.now() - inicioEtapa;
        
        etapasInicializacao.push({
            nome: etapa.nome,
            sucesso: true,
            tempo: Math.round(tempoEtapa),
            resultado: resultado
        });
        
        console.log(`✅ ${etapa.nome} concluída (${Math.round(tempoEtapa)}ms)`);
        
    } catch (error) {
        const tempoEtapa = performance.now() - inicioEtapa;
        
        etapasInicializacao.push({
            nome: etapa.nome,
            sucesso: false,
            tempo: Math.round(tempoEtapa),
            erro: error.message
        });
        
        console.error(`❌ Erro em ${etapa.nome}:`, error);
        throw new Error(`Falha na etapa: ${etapa.nome} - ${error.message}`);
    }
}

/**
 * Etapas de inicialização
 */

/**
 * 1. Verificar dependências necessárias
 */
async function verificarDependencias() {
    const dependencias = {
        firebase: typeof firebase !== 'undefined',
        firebaseDatabase: typeof firebase !== 'undefined' && firebase.database,
        firebaseAuth: typeof firebase !== 'undefined' && firebase.auth,
        dom: typeof document !== 'undefined',
        console: typeof console !== 'undefined',
        localStorage: typeof localStorage !== 'undefined'
    };

    const dependenciasFaltando = Object.entries(dependencias)
        .filter(([nome, disponivel]) => !disponivel)
        .map(([nome]) => nome);

    if (dependenciasFaltando.length > 0) {
        throw new Error(`Dependências não encontradas: ${dependenciasFaltando.join(', ')}`);
    }

    console.log('📦 Todas as dependências verificadas');
    return dependencias;
}

/**
 * 2. Configurar Firebase para inicialização
 */
async function configurarFirebaseInit() {
    if (typeof firebase === 'undefined') {
        throw new Error('Firebase não está disponível');
    }

    // Verificar se já foi inicializado
    if (!firebase.apps.length) {
        throw new Error('Firebase não foi configurado. Execute firebase.js primeiro.');
    }

    // Verificar conexão
    const connected = await new Promise((resolve) => {
        const connectedRef = firebase.database().ref('.info/connected');
        connectedRef.once('value', (snapshot) => {
            resolve(snapshot.val() === true);
        });
        
        // Timeout de 5 segundos
        setTimeout(() => resolve(false), 5000);
    });

    if (!connected) {
        console.warn('⚠️ Firebase offline - modo offline ativado');
        if (estadoSistema) {
            estadoSistema.online = false;
        }
    }

    console.log('🔥 Firebase configurado para inicialização');
    return { conectado: connected };
}

/**
 * 3. Verificar estado de autenticação
 */
async function verificarAutenticacao() {
    if (!firebase.auth) {
        throw new Error('Firebase Auth não disponível');
    }

    return new Promise((resolve, reject) => {
        const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
            unsubscribe(); // Remove o listener imediatamente
            
            if (user) {
                // Usuário logado
                usuarioAtual = user;
                
                if (estadoSistema) {
                    estadoSistema.usuarioEmail = user.email;
                    estadoSistema.usuarioNome = user.displayName || user.email.split('@')[0];
                    estadoSistema.usuarioUID = user.uid;
                }

                console.log('👤 Usuário autenticado:', user.email);
                resolve({ autenticado: true, usuario: user.email });
            } else {
                // Usuário não logado
                console.log('🔐 Usuário não autenticado');
                resolve({ autenticado: false });
            }
        }, (error) => {
            console.error('❌ Erro na verificação de auth:', error);
            reject(error);
        });

        // Timeout de 10 segundos
        setTimeout(() => {
            unsubscribe();
            reject(new Error('Timeout na verificação de autenticação'));
        }, 10000);
    });
}

/**
 * 4. Carregar ou inicializar dados do sistema
 */
async function carregarDadosIniciais() {
    if (!CONFIG_INICIALIZACAO.carregarDadosAutomatico) {
        console.log('📊 Carregamento automático de dados desabilitado');
        return { dados: null };
    }

    try {
        // Tentar carregar dados do Firebase
        const snapshot = await firebase.database().ref('dados').once('value');
        const dadosServidor = snapshot.val();

        if (dadosServidor) {
            // Dados encontrados no servidor
            dados = dadosServidor;
            console.log('📦 Dados carregados do Firebase');
            
            // Verificar integridade
            if (CONFIG_INICIALIZACAO.verificarIntegridade) {
                const problemas = validarIntegridadeDados();
                if (problemas.length > 0) {
                    console.warn('⚠️ Problemas de integridade encontrados:', problemas);
                }
            }
            
            return { origem: 'firebase', dados: dados };
        } else {
            // Nenhum dado no servidor - inicializar dados padrão
            console.log('🔧 Nenhum dado encontrado - inicializando dados padrão');
            dados = inicializarDados();
            
            // Salvar dados iniciais no Firebase
            if (usuarioAtual) {
                await firebase.database().ref('dados').set(dados);
                console.log('💾 Dados padrão salvos no Firebase');
            }
            
            return { origem: 'inicializacao', dados: dados };
        }
    } catch (error) {
        console.error('❌ Erro ao carregar dados:', error);
        
        // Fallback para dados padrão
        console.log('🔄 Fallback: usando dados padrão');
        dados = inicializarDados();
        
        return { origem: 'fallback', dados: dados, erro: error.message };
    }
}

/**
 * 5. Configurar sincronização para inicialização
 */
async function configurarSincronizacaoInit() {
    if (!usuarioAtual) {
        console.log('👤 Usuário não logado - pulando configuração de sync');
        return { configurado: false };
    }

    try {
        // Configurar listeners básicos
        if (typeof configurarSincronizacao === 'function') {
            configurarSincronizacao();
            console.log('🔄 Sincronização configurada');
        }

        return { configurado: true };
    } catch (error) {
        console.warn('⚠️ Erro ao configurar sincronização:', error);
        return { configurado: false, erro: error.message };
    }
}

/**
 * 6. Configurar presença online
 */
async function configurarPresencaInit() {
    if (!usuarioAtual) {
        console.log('👤 Usuário não logado - pulando presença online');
        return { configurado: false };
    }

    try {
        if (typeof configurarPresenca === 'function') {
            configurarPresenca();
            console.log('🌐 Presença online configurada');
        }

        return { configurado: true };
    } catch (error) {
        console.warn('⚠️ Erro ao configurar presença:', error);
        return { configurado: false, erro: error.message };
    }
}

/**
 * 7. Iniciar monitoramento automático
 */
async function iniciarMonitoramento() {
    try {
        // Verificação automática de prazos
        if (CONFIG_INICIALIZACAO.iniciarVerificacaoPrazos && typeof iniciarVerificacaoPrazos === 'function') {
            iniciarVerificacaoPrazos();
            console.log('⏰ Verificação automática de prazos iniciada');
        }

        // Monitoramento de performance
        const intervalPerformance = setInterval(() => {
            monitorarPerformance();
        }, 60000); // A cada minuto
        intervalosAtivos.push(intervalPerformance);

        // Auto-save periódico
        const intervalAutoSave = setInterval(() => {
            if (typeof salvarDados === 'function' && dados) {
                salvarDados();
            }
        }, SISTEMA_CONSTANTS.INTERVALO_SALVAMENTO || 300000); // 5 minutos
        intervalosAtivos.push(intervalAutoSave);

        console.log('📊 Monitoramento automático iniciado');
        return { monitorando: true, intervalos: intervalosAtivos.length };
    } catch (error) {
        console.warn('⚠️ Erro ao iniciar monitoramento:', error);
        return { monitorando: false, erro: error.message };
    }
}

/**
 * 8. Configurar interface inicial
 */
async function configurarInterface() {
    try {
        // Esconder tela de login se usuário estiver logado
        if (usuarioAtual) {
            const loginScreen = document.getElementById('loginScreen');
            const mainContainer = document.getElementById('mainContainer');
            const usersOnline = document.getElementById('usersOnline');

            if (loginScreen) loginScreen.classList.add('hidden');
            if (mainContainer) mainContainer.classList.remove('hidden');
            if (usersOnline) usersOnline.classList.remove('hidden');

            // Atualizar informações do usuário na interface
            const usuarioInfo = document.getElementById('usuarioInfo');
            if (usuarioInfo) {
                usuarioInfo.textContent = `👤 ${estadoSistema.usuarioNome}`;
            }
        } else {
            // Mostrar tela de login
            const loginScreen = document.getElementById('loginScreen');
            const mainContainer = document.getElementById('mainContainer');
            const usersOnline = document.getElementById('usersOnline');

            if (loginScreen) loginScreen.classList.remove('hidden');
            if (mainContainer) mainContainer.classList.add('hidden');
            if (usersOnline) usersOnline.classList.add('hidden');
        }

        // Atualizar data atual
        if (typeof atualizarDataAtual === 'function') {
            atualizarDataAtual();
        }

        console.log('🎨 Interface configurada');
        return { configurado: true };
    } catch (error) {
        console.warn('⚠️ Erro ao configurar interface:', error);
        return { configurado: false, erro: error.message };
    }
}

/**
 * 9. Configurar eventos globais
 */
async function configurarEventosGlobais() {
    if (!CONFIG_INICIALIZACAO.configurarEventosGlobais) {
        return { configurado: false };
    }

    try {
        // Listener para teclas de atalho
        const keyboardListener = (e) => {
            // Ctrl+S para salvar
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                if (typeof salvarDados === 'function') {
                    salvarDados();
                    if (typeof mostrarNotificacao === 'function') {
                        mostrarNotificacao('Dados salvos!');
                    }
                }
            }

            // Escape para fechar modais
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal.active').forEach(modal => {
                    if (typeof fecharModal === 'function') {
                        fecharModal(modal.id);
                    }
                });
            }

            // Ctrl+Shift+I para debug
            if (e.ctrlKey && e.shiftKey && e.key === 'I') {
                e.preventDefault();
                if (typeof debugEstado === 'function') {
                    debugEstado();
                }
            }
        };

        document.addEventListener('keydown', keyboardListener);
        listenersAtivos.push({ tipo: 'keydown', elemento: document, funcao: keyboardListener });

        // Listener para cliques em modais (fechar ao clicar fora)
        document.querySelectorAll('.modal').forEach(modal => {
            const clickListener = (e) => {
                if (e.target === modal && typeof fecharModal === 'function') {
                    fecharModal(modal.id);
                }
            };
            modal.addEventListener('click', clickListener);
            listenersAtivos.push({ tipo: 'click', elemento: modal, funcao: clickListener });
        });

        // Listener para beforeunload (salvar antes de sair)
        const beforeUnloadListener = (e) => {
            if (usuarioAtual && typeof salvarDados === 'function') {
                salvarDados();
            }
        };
        window.addEventListener('beforeunload', beforeUnloadListener);
        listenersAtivos.push({ tipo: 'beforeunload', elemento: window, funcao: beforeUnloadListener });

        // Listeners para conectividade
        const onlineListener = () => {
            if (estadoSistema) {
                estadoSistema.online = true;
            }
            if (typeof atualizarIndicadorSync === 'function') {
                atualizarIndicadorSync('syncing');
            }
            if (typeof mostrarNotificacao === 'function') {
                mostrarNotificacao('Conexão restaurada!');
            }
        };

        const offlineListener = () => {
            if (estadoSistema) {
                estadoSistema.online = false;
            }
            if (typeof atualizarIndicadorSync === 'function') {
                atualizarIndicadorSync('offline');
            }
            if (typeof mostrarNotificacao === 'function') {
                mostrarNotificacao('Sem conexão - trabalhando offline', 'error');
            }
        };

        window.addEventListener('online', onlineListener);
        window.addEventListener('offline', offlineListener);
        listenersAtivos.push({ tipo: 'online', elemento: window, funcao: onlineListener });
        listenersAtivos.push({ tipo: 'offline', elemento: window, funcao: offlineListener });

        console.log('⌨️ Eventos globais configurados');
        return { configurado: true, listeners: listenersAtivos.length };
    } catch (error) {
        console.warn('⚠️ Erro ao configurar eventos globais:', error);
        return { configurado: false, erro: error.message };
    }
}

/**
 * 10. Renderizar dashboard inicial
 */
async function renderizarDashboardInicial() {
    if (!usuarioAtual || !dados) {
        console.log('👤 Usuário não logado ou dados não carregados - pulando renderização');
        return { renderizado: false };
    }

    try {
        if (typeof renderizarDashboard === 'function') {
            renderizarDashboard();
            console.log('🎨 Dashboard renderizado');
        }

        return { renderizado: true };
    } catch (error) {
        console.warn('⚠️ Erro ao renderizar dashboard:', error);
        return { renderizado: false, erro: error.message };
    }
}

/**
 * 11. Verificação final
 */
async function verificacaoFinal() {
    const verificacoes = {
        dadosCarregados: dados !== null,
        estadoConfigurado: estadoSistema !== null,
        interfaceConfigured: document.getElementById('mainContainer') !== null,
        usuarioLogado: usuarioAtual !== null,
        firebaseConectado: estadoSistema?.online || false,
        monitoramentoAtivo: intervalosAtivos.length > 0,
        eventosConfigurados: listenersAtivos.length > 0
    };

    const problemasFinais = Object.entries(verificacoes)
        .filter(([chave, valor]) => !valor)
        .map(([chave]) => chave);

    if (problemasFinais.length > 0) {
        console.warn('⚠️ Problemas na verificação final:', problemasFinais);
    } else {
        console.log('✅ Verificação final: tudo funcionando!');
    }

    return {
        verificacoes,
        problemas: problemasFinais,
        sucesso: problemasFinais.length === 0
    };
}

/**
 * Funções auxiliares
 */

/**
 * Monitoramento de performance
 */
function monitorarPerformance() {
    const memoria = performance.memory;
    const navegacao = performance.navigation;

    const stats = {
        memoria: memoria ? {
            usedJSHeapSize: Math.round(memoria.usedJSHeapSize / 1024 / 1024) + 'MB',
            totalJSHeapSize: Math.round(memoria.totalJSHeapSize / 1024 / 1024) + 'MB'
        } : null,
        tempoAtivo: Math.round((performance.now() - tempoInicioSistema) / 1000) + 's',
        salvamentos: estadoSistema?.contadorSalvamentos || 0,
        intervalosAtivos: intervalosAtivos.length,
        listenersAtivos: listenersAtivos.length
    };

    // Log apenas se houver problemas de memória
    if (memoria && memoria.usedJSHeapSize > 50 * 1024 * 1024) { // 50MB
        console.warn('⚠️ Alto uso de memória detectado:', stats);
    }

    return stats;
}

/**
 * Otimização pós-inicialização
 */
function otimizacaoPosinicializacao() {
    console.log('🚀 Executando otimização pós-inicialização...');

    try {
        // Limpar cache antigo
        if (typeof limparCacheAntigo === 'function') {
            limparCacheAntigo();
        }

        // Verificar integridade dos dados
        if (typeof validarIntegridadeDados === 'function') {
            validarIntegridadeDados();
        }

        // Otimizar listeners duplicados
        otimizarListeners();

        // Força garbage collection se disponível
        if (window.gc) {
            window.gc();
        }

        console.log('✅ Otimização pós-inicialização concluída');
    } catch (error) {
        console.warn('⚠️ Erro na otimização pós-inicialização:', error);
    }
}

/**
 * Otimizar listeners para evitar duplicatas
 */
function otimizarListeners() {
    const listenerMap = new Map();

    listenersAtivos.forEach((listener, index) => {
        const key = `${listener.tipo}_${listener.elemento.tagName || 'UNKNOWN'}`;
        
        if (listenerMap.has(key)) {
            // Listener duplicado encontrado
            console.warn(`⚠️ Listener duplicado removido: ${key}`);
            listener.elemento.removeEventListener(listener.tipo, listener.funcao);
            listenersAtivos.splice(index, 1);
        } else {
            listenerMap.set(key, true);
        }
    });
}

/**
 * Tentativa de recuperação em caso de erro
 */
async function tentarRecuperacao(erro) {
    console.log('🔄 Tentando recuperação do sistema...');

    try {
        // Limpar intervalos e listeners
        limparRecursos();

        // Resetar estado
        if (typeof resetarEstado === 'function') {
            resetarEstado();
        }

        // Tentar inicialização simples
        dados = inicializarDados();
        
        console.log('✅ Recuperação básica realizada');
        
        if (typeof mostrarNotificacao === 'function') {
            mostrarNotificacao('Sistema recuperado em modo básico', 'warning');
        }

        return true;
    } catch (recoveryError) {
        console.error('❌ Falha na recuperação:', recoveryError);
        
        if (typeof mostrarNotificacao === 'function') {
            mostrarNotificacao('Erro crítico no sistema - recarregue a página', 'error');
        }

        return false;
    }
}

/**
 * Limpeza de recursos
 */
function limparRecursos() {
    // Limpar intervalos
    intervalosAtivos.forEach(interval => {
        clearInterval(interval);
    });
    intervalosAtivos = [];

    // Remover listeners
    listenersAtivos.forEach(listener => {
        listener.elemento.removeEventListener(listener.tipo, listener.funcao);
    });
    listenersAtivos = [];

    console.log('🧹 Recursos limpos');
}

/**
 * Finalização do sistema
 */
function finalizarSistema() {
    console.log('🔚 Finalizando sistema...');

    // Salvar dados uma última vez
    if (typeof salvarDados === 'function' && dados) {
        salvarDados();
    }

    // Remover presença online
    if (presenceRef) {
        presenceRef.remove();
    }

    // Limpar recursos
    limparRecursos();

    // Desconectar listeners do Firebase
    Object.values(listenersDados || {}).forEach(ref => {
        if (ref && ref.off) {
            ref.off();
        }
    });

    sistemaInicializado = false;
    console.log('✅ Sistema finalizado');
}

/**
 * Exposição global para compatibilidade
 */
if (typeof window !== 'undefined') {
    window.inicializarSistema = inicializarSistema;
    window.finalizarSistema = finalizarSistema;
    window.sistemaInicializado = () => sistemaInicializado;
    window.monitorarPerformance = monitorarPerformance;
    window.limparRecursos = limparRecursos;
}

console.log('✅ Módulo init.js carregado com sucesso'); 
