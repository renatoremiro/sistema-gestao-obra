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
