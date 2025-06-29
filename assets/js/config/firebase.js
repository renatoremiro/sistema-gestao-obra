/* ==========================================================================
   CONFIGURAÇÃO FIREBASE - Sistema de Gestão v5.1
   ========================================================================== */

/**
 * Configuração do Firebase
 * IMPORTANTE: Estas são suas credenciais atuais do Firebase
 */
const firebaseConfig = {
    apiKey: "AIzaSyCT0UXyU6AeurlaZdgM4_MKhzJWIdYxWg4",
    authDomain: "sistema-gestao-obra.firebaseapp.com",
    databaseURL: "https://sistema-gestao-obra-default-rtdb.firebaseio.com",
    projectId: "sistema-gestao-obra",
    storageBucket: "sistema-gestao-obra.firebasestorage.app",
    messagingSenderId: "686804029278",
    appId: "1:686804029278:web:758190822a19ef935e89cf",
    measurementId: "G-RE86WX5KY2"
};

/**
 * Inicializar Firebase e configurar referências globais
 */
let database, auth;

/**
 * Função para inicializar o Firebase
 * @returns {Object} Objeto com database e auth
 */
function initializeFirebase() {
    try {
        // Verificar se Firebase está disponível
        if (typeof firebase === 'undefined') {
            console.error('❌ Firebase não carregado! Verifique os scripts.');
            throw new Error('Firebase não disponível');
        }

        // Inicializar Firebase
        firebase.initializeApp(firebaseConfig);
        
        // Configurar referências globais
        database = firebase.database();
        auth = firebase.auth();
        
        console.log('✅ Firebase inicializado com sucesso');
        console.log('🔥 Projeto:', firebaseConfig.projectId);
        console.log('🌐 Auth Domain:', firebaseConfig.authDomain);
        
        return { database, auth };
        
    } catch (error) {
        console.error('❌ Erro ao inicializar Firebase:', error);
        throw error;
    }
}

/**
 * Função para obter referência do database
 * @returns {Object} Firebase Database
 */
function getDatabase() {
    if (!database) {
        throw new Error('Database não inicializado. Chame initializeFirebase() primeiro.');
    }
    return database;
}

/**
 * Função para obter referência do auth
 * @returns {Object} Firebase Auth
 */
function getAuth() {
    if (!auth) {
        throw new Error('Auth não inicializado. Chame initializeFirebase() primeiro.');
    }
    return auth;
}

/**
 * Função para verificar se Firebase está conectado
 * @returns {Promise<boolean>} Status da conexão
 */
function verificarConexaoFirebase() {
    return new Promise((resolve) => {
        const connectedRef = database.ref('.info/connected');
        connectedRef.on('value', (snapshot) => {
            const connected = snapshot.val();
            console.log(connected ? '🟢 Firebase conectado' : '🔴 Firebase desconectado');
            resolve(connected);
        });
    });
}

/**
 * Função para configurar listeners de conexão
 */
function configurarMonitoramentoConexao() {
    const connectedRef = database.ref('.info/connected');
    
    connectedRef.on('value', (snapshot) => {
        if (snapshot.val() === true) {
            console.log('🟢 Conectado ao Firebase');
            // Atualizar UI se necessário
            if (typeof atualizarIndicadorSync === 'function') {
                atualizarIndicadorSync('synced');
            }
        } else {
            console.log('🔴 Desconectado do Firebase');
            // Atualizar UI se necessário
            if (typeof atualizarIndicadorSync === 'function') {
                atualizarIndicadorSync('offline');
            }
        }
    });
}

/**
 * Função para obter informações do Firebase
 * @returns {Object} Informações do projeto
 */
function getFirebaseInfo() {
    return {
        projectId: firebaseConfig.projectId,
        authDomain: firebaseConfig.authDomain,
        databaseURL: firebaseConfig.databaseURL,
        version: '9.22.0',
        inicializado: !!database && !!auth
    };
}

/**
 * Função para limpar listeners do Firebase
 */
function limparListenersFirebase() {
    try {
        if (database) {
            // Remover listeners de conexão
            database.ref('.info/connected').off();
            console.log('🧹 Listeners Firebase removidos');
        }
    } catch (error) {
        console.error('❌ Erro ao limpar listeners:', error);
    }
}

/**
 * Função para debug do Firebase
 */
function debugFirebase() {
    console.group('🔥 DEBUG FIREBASE');
    console.log('Config:', firebaseConfig);
    console.log('Database:', !!database);
    console.log('Auth:', !!auth);
    console.log('Usuário logado:', auth?.currentUser?.email || 'Nenhum');
    console.groupEnd();
}

// Exportar para uso global (compatibilidade)
if (typeof window !== 'undefined') {
    window.firebaseConfig = firebaseConfig;
    window.initializeFirebase = initializeFirebase;
    window.getDatabase = getDatabase;
    window.getAuth = getAuth;
    window.verificarConexaoFirebase = verificarConexaoFirebase;
    window.configurarMonitoramentoConexao = configurarMonitoramentoConexao;
    window.getFirebaseInfo = getFirebaseInfo;
    window.limparListenersFirebase = limparListenersFirebase;
    window.debugFirebase = debugFirebase;
}
/**
 * ========== INICIALIZAÇÃO AUTOMÁTICA ==========
 */

// Aguardar que o DOM esteja pronto e então inicializar o Firebase
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        try {
            initializeFirebase();
        } catch (error) {
            console.error('❌ Erro na inicialização automática do Firebase:', error);
        }
    });
} else {
    // DOM já carregado - inicializar imediatamente
    try {
        initializeFirebase();
    } catch (error) {
        console.error('❌ Erro na inicialização automática do Firebase:', error);
    }
}
/**
 * CORREÇÃO FIREBASE - Adicionar ao final do assets/js/config/firebase.js
 * Para garantir compatibilidade com o código original
 */

// ========== COMPATIBILIDADE COM CÓDIGO ORIGINAL ==========

/**
 * Aguardar Firebase estar totalmente carregado e então configurar variáveis globais
 */
function aguardarFirebaseEConfigurar() {
    return new Promise((resolve, reject) => {
        let tentativas = 0;
        const maxTentativas = 10;
        
        function verificarFirebase() {
            tentativas++;
            
            if (typeof firebase !== 'undefined' && 
                firebase.apps && 
                firebase.apps.length > 0) {
                
                // Firebase carregado e inicializado
                try {
                    // Configurar variáveis globais para compatibilidade
                    window.database = firebase.database();
                    window.auth = firebase.auth();
                    
                    console.log('✅ Firebase configurado globalmente');
                    console.log('📡 Database:', !!window.database);
                    console.log('🔐 Auth:', !!window.auth);
                    
                    resolve(true);
                } catch (error) {
                    console.error('❌ Erro ao configurar Firebase globalmente:', error);
                    reject(error);
                }
            } else if (tentativas < maxTentativas) {
                // Tentar novamente em 100ms
                setTimeout(verificarFirebase, 100);
            } else {
                // Excesso de tentativas
                reject(new Error('Firebase não carregou após múltiplas tentativas'));
            }
        }
        
        verificarFirebase();
    });
}

/**
 * Inicialização segura com retry
 */
function inicializarFirebaseSafe() {
    aguardarFirebaseEConfigurar()
        .then(() => {
            console.log('🎉 Firebase totalmente pronto!');
            
            // Configurar monitoramento de conexão
            if (typeof configurarMonitoramentoConexao === 'function') {
                configurarMonitoramentoConexao();
            }
            
            // Disparar evento personalizado para avisar que Firebase está pronto
            window.dispatchEvent(new CustomEvent('firebaseReady'));
        })
        .catch(error => {
            console.error('💥 Falha crítica na inicialização do Firebase:', error);
            
            // Mostrar erro para o usuário
            if (typeof mostrarNotificacao === 'function') {
                mostrarNotificacao('Erro ao conectar com o servidor!', 'error');
            } else {
                alert('Erro ao conectar com o servidor! Verifique sua conexão.');
            }
        });
}

// ========== SUBSTITUIR INICIALIZAÇÃO AUTOMÁTICA ==========

// Remover a inicialização automática anterior e usar a nova
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarFirebaseSafe);
} else {
    // DOM já carregado
    setTimeout(inicializarFirebaseSafe, 100); // Pequeno delay para garantir que scripts carregaram
}

console.log('🔧 Firebase configurado com inicialização segura');

// ========== FUNÇÃO DE DIAGNÓSTICO ==========

/**
 * Função para diagnosticar problemas do Firebase
 */
function diagnosticarFirebase() {
    console.group('🔥 DIAGNÓSTICO FIREBASE');
    
    // Verificar se scripts CDN carregaram
    console.log('Firebase Global:', typeof firebase !== 'undefined' ? '✅' : '❌');
    
    if (typeof firebase !== 'undefined') {
        console.log('Firebase Apps:', firebase.apps?.length || 0);
        console.log('SDK Version:', firebase.SDK_VERSION || 'Não detectada');
    }
    
    // Verificar variáveis globais
    console.log('window.database:', !!window.database ? '✅' : '❌');
    console.log('window.auth:', !!window.auth ? '✅' : '❌');
    
    // Verificar configuração
    console.log('Config válida:', !!firebaseConfig.apiKey ? '✅' : '❌');
    
    // Status de conexão
    if (window.database) {
        window.database.ref('.info/connected').once('value')
            .then(snapshot => {
                console.log('Conexão ativa:', snapshot.val() ? '✅' : '❌');
            })
            .catch(error => {
                console.log('Erro de conexão:', error.message);
            });
    }
    
    console.groupEnd();
}

// Exportar função de diagnóstico
window.diagnosticarFirebase = diagnosticarFirebase;

// Executar diagnóstico após 2 segundos (para debug)
if (window.DEBUG && window.DEBUG.ENABLED) {
    setTimeout(diagnosticarFirebase, 2000);
}
console.log('🔥 Firebase configurado para inicialização automática');
 
