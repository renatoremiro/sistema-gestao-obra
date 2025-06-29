/* ==========================================================================
   SISTEMA DE AUTENTICAÇÃO - Sistema de Gestão v5.1 - CORRIGIDO
   ========================================================================== */

/**
 * CORREÇÃO CRÍTICA: Imports Firebase adequados
 * Firebase v9+ modular ou v8 namespaced compatível
 */

/**
 * Função compatível para obter Auth (Firebase v8/v9)
 */
function obterFirebaseAuth() {
    // Firebase v9+ (modular)
    if (typeof getAuth !== 'undefined') {
        return getAuth();
    }
    // Firebase v8 (namespaced) 
    if (typeof firebase !== 'undefined' && firebase.auth) {
        return firebase.auth();
    }
    
    throw new Error('Firebase Auth não disponível. Verifique configuração.');
}

/**
 * Função compatível para métodos de autenticação
 */
function obterMetodosAuth() {
    const auth = obterFirebaseAuth();
    
    // Firebase v9+
    if (typeof signInWithEmailAndPassword !== 'undefined') {
        return {
            signIn: (email, password) => signInWithEmailAndPassword(auth, email, password),
            signUp: (email, password) => createUserWithEmailAndPassword(auth, email, password),
            signOut: () => signOut(auth),
            onAuthStateChanged: (callback) => onAuthStateChanged(auth, callback),
            updateProfile: (user, profile) => updateProfile(user, profile)
        };
    }
    
    // Firebase v8 (fallback)
    return {
        signIn: (email, password) => auth.signInWithEmailAndPassword(email, password),
        signUp: (email, password) => auth.createUserWithEmailAndPassword(email, password), 
        signOut: () => auth.signOut(),
        onAuthStateChanged: (callback) => auth.onAuthStateChanged(callback),
        updateProfile: (user, profile) => user.updateProfile(profile)
    };
}

/**
 * Variáveis globais de autenticação
 */
let usuarioAtual = null;
let authStateChangedCallback = null;
let metodosAuth = null;

/**
 * Inicializar métodos de autenticação
 */
function inicializarMetodosAuth() {
    try {
        metodosAuth = obterMetodosAuth();
        console.log('✅ Métodos de autenticação inicializados');
        return true;
    } catch (error) {
        console.error('❌ Erro ao inicializar métodos auth:', error);
        return false;
    }
}

/**
 * Função para mostrar a tela de login
 */
function mostrarLogin() {
    console.log('🔐 Mostrando tela de login');
    
    const loginScreen = document.getElementById('loginScreen');
    const mainContainer = document.getElementById('mainContainer');
    const usersOnline = document.getElementById('usersOnline');
    
    if (loginScreen) loginScreen.classList.remove('hidden');
    if (mainContainer) mainContainer.classList.add('hidden');
    if (usersOnline) usersOnline.classList.add('hidden');
    
    // Limpar campos do formulário
    limparFormularioLogin();
}

/**
 * Função para esconder a tela de login
 */
function esconderLogin() {
    console.log('✅ Escondendo tela de login');
    
    const loginScreen = document.getElementById('loginScreen');
    const mainContainer = document.getElementById('mainContainer');
    const usersOnline = document.getElementById('usersOnline');
    
    if (loginScreen) loginScreen.classList.add('hidden');
    if (mainContainer) mainContainer.classList.remove('hidden');
    if (usersOnline) usersOnline.classList.remove('hidden');
}

/**
 * Função para limpar o formulário de login
 */
function limparFormularioLogin() {
    const emailInput = document.getElementById('loginEmail');
    const senhaInput = document.getElementById('loginPassword');
    
    if (emailInput) emailInput.value = '';
    if (senhaInput) senhaInput.value = '';
    
    // Remover classes de erro
    const inputs = document.querySelectorAll('#loginScreen input');
    inputs.forEach(input => input.classList.remove('input-error'));
}

/**
 * Função principal de login - CORRIGIDA
 */
function fazerLogin() {
    // Garantir que métodos estão inicializados
    if (!metodosAuth) {
        if (!inicializarMetodosAuth()) {
            mostrarNotificacao('Erro na configuração do sistema', 'error');
            return;
        }
    }
    
    const email = document.getElementById('loginEmail')?.value;
    const senha = document.getElementById('loginPassword')?.value;
    
    console.log('🔑 Tentativa de login para:', email);
    
    // Validar campos
    if (!validarCamposLogin(email, senha)) {
        return;
    }
    
    // Mostrar loading
    mostrarLoadingLogin(true);
    mostrarNotificacao('Entrando...', 'info');
    
    // Tentar fazer login no Firebase - MÉTODO CORRIGIDO
    metodosAuth.signIn(email, senha)
        .then((userCredential) => {
            usuarioAtual = userCredential.user;
            console.log('✅ Login realizado com sucesso:', usuarioAtual.email);
            
            mostrarNotificacao('Login realizado com sucesso!', 'success');
            
            // Inicializar sistema será chamado pelo authStateChanged
        })
        .catch((error) => {
            console.error('❌ Erro no login:', error);
            tratarErroLogin(error);
        })
        .finally(() => {
            mostrarLoadingLogin(false);
        });
}

/**
 * Função para validar campos de login - MELHORADA
 */
function validarCamposLogin(email, senha) {
    let valido = true;
    
    const emailInput = document.getElementById('loginEmail');
    const senhaInput = document.getElementById('loginPassword');
    
    // Validar email com regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !email.trim()) {
        emailInput?.classList.add('input-error');
        valido = false;
    } else if (!emailRegex.test(email)) {
        emailInput?.classList.add('input-error');
        mostrarNotificacao('Email inválido!', 'error');
        valido = false;
    } else {
        emailInput?.classList.remove('input-error');
    }
    
    // Validar senha
    if (!senha || !senha.trim()) {
        senhaInput?.classList.add('input-error');
        valido = false;
    } else if (senha.length < 6) {
        senhaInput?.classList.add('input-error');
        mostrarNotificacao('Senha deve ter pelo menos 6 caracteres!', 'error');
        valido = false;
    } else {
        senhaInput?.classList.remove('input-error');
    }
    
    if (!valido && !emailRegex.test(email) && senha.length >= 6) {
        mostrarNotificacao('Preencha todos os campos obrigatórios!', 'error');
    }
    
    return valido;
}

/**
 * Função para mostrar/esconder loading no botão de login
 */
function mostrarLoadingLogin(mostrar) {
    const botaoLogin = document.querySelector('#loginScreen .btn-primary');
    
    if (!botaoLogin) return;
    
    if (mostrar) {
        botaoLogin.disabled = true;
        botaoLogin.innerHTML = '<span class="loading"></span> Entrando...';
    } else {
        botaoLogin.disabled = false;
        botaoLogin.innerHTML = 'Entrar';
    }
}

/**
 * Função para tratar erros de login - MELHORADA
 */
function tratarErroLogin(error) {
    let mensagem = 'Erro ao fazer login';
    
    switch (error.code) {
        case 'auth/user-not-found':
            mensagem = 'Usuário não encontrado!';
            break;
        case 'auth/wrong-password':
            mensagem = 'Senha incorreta!';
            break;
        case 'auth/invalid-email':
            mensagem = 'Email inválido!';
            break;
        case 'auth/user-disabled':
            mensagem = 'Usuário desabilitado!';
            break;
        case 'auth/too-many-requests':
            mensagem = 'Muitas tentativas. Tente novamente mais tarde.';
            break;
        case 'auth/invalid-credential':
            mensagem = 'Credenciais inválidas!';
            break;
        case 'auth/network-request-failed':
            mensagem = 'Erro de conexão. Verifique sua internet.';
            break;
        default:
            mensagem = `Erro ao fazer login: ${error.message}`;
    }
    
    mostrarNotificacao(mensagem, 'error');
    
    // Adicionar shake animation no formulário
    const loginContainer = document.querySelector('.login-container');
    if (loginContainer) {
        loginContainer.classList.add('animate-shake');
        setTimeout(() => {
            loginContainer.classList.remove('animate-shake');
        }, 500);
    }
}

/**
 * Função para mostrar o registro de novo usuário - MELHORADA
 */
function mostrarRegistro() {
    // TODO: Implementar modal responsivo (próxima prioridade)
    // Por enquanto mantém prompts mas com validação melhorada
    
    const email = prompt('Digite seu email:');
    if (!email || !email.trim()) {
        mostrarNotificacao('Email é obrigatório!', 'error');
        return;
    }
    
    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        mostrarNotificacao('Email inválido!', 'error');
        return;
    }
    
    const senha = prompt('Digite uma senha (mínimo 6 caracteres):');
    if (!senha || senha.length < 6) {
        mostrarNotificacao('Senha deve ter pelo menos 6 caracteres!', 'error');
        return;
    }
    
    const nome = prompt('Digite seu nome:');
    if (!nome || !nome.trim()) {
        mostrarNotificacao('Nome é obrigatório!', 'error');
        return;
    }
    
    console.log('📝 Criando nova conta para:', email);
    mostrarNotificacao('Criando conta...', 'info');
    
    // Garantir métodos inicializados
    if (!metodosAuth) {
        inicializarMetodosAuth();
    }
    
    // Criar conta - MÉTODO CORRIGIDO
    metodosAuth.signUp(email, senha)
        .then((userCredential) => {
            // Atualizar perfil com nome - MÉTODO CORRIGIDO
            return metodosAuth.updateProfile(userCredential.user, {
                displayName: nome
            });
        })
        .then(() => {
            console.log('✅ Conta criada com sucesso');
            mostrarNotificacao('Conta criada com sucesso! Fazendo login...', 'success');
            
            // Preencher campos e fazer login automático
            setTimeout(() => {
                document.getElementById('loginEmail').value = email;
                document.getElementById('loginPassword').value = senha;
                fazerLogin();
            }, 1500);
        })
        .catch((error) => {
            console.error('❌ Erro ao criar conta:', error);
            
            let mensagem = 'Erro ao criar conta';
            if (error.code === 'auth/email-already-in-use') {
                mensagem = 'Este email já está em uso!';
            } else if (error.code === 'auth/weak-password') {
                mensagem = 'Senha muito fraca!';
            } else if (error.code === 'auth/invalid-email') {
                mensagem = 'Email inválido!';
            }
            
            mostrarNotificacao(mensagem, 'error');
        });
}

/**
 * Função para fazer logout - CORRIGIDA
 */
function fazerLogout() {
    if (!confirm('Tem certeza que deseja sair?')) {
        return;
    }
    
    console.log('🚪 Fazendo logout...');
    
    // Limpar presença online
    if (presenceRef) {
        presenceRef.remove().catch(error => {
            console.warn('Aviso: Erro ao remover presença:', error);
        });
    }
    
    // Limpar listeners
    limparListenersAuth();
    
    // Limpar intervalos
    if (intervaloPrazos) {
        clearInterval(intervaloPrazos);
        intervaloPrazos = null;
    }
    
    // Garantir métodos inicializados
    if (!metodosAuth) {
        inicializarMetodosAuth();
    }
    
    // Fazer logout no Firebase - MÉTODO CORRIGIDO
    metodosAuth.signOut()
        .then(() => {
            console.log('✅ Logout realizado com sucesso');
            mostrarNotificacao('Logout realizado com sucesso!', 'success');
            mostrarLogin();
            
            // Limpar dados locais
            usuarioAtual = null;
            limparDadosLocais();
        })
        .catch((error) => {
            console.error('❌ Erro ao fazer logout:', error);
            mostrarNotificacao('Erro ao sair!', 'error');
        });
}

/**
 * Função para limpar listeners relacionados à autenticação
 */
function limparListenersAuth() {
    try {
        // Limpar listeners de dados globais
        if (typeof listenersDados !== 'undefined' && listenersDados) {
            Object.values(listenersDados).forEach(ref => {
                if (ref && typeof ref.off === 'function') {
                    ref.off();
                }
            });
            listenersDados = {};
        }
        
        // Limpar listeners do Firebase
        if (typeof limparListenersFirebase === 'function') {
            limparListenersFirebase();
        }
        
        console.log('🧹 Listeners de autenticação limpos');
    } catch (error) {
        console.error('❌ Erro ao limpar listeners:', error);
    }
}

/**
 * Função para limpar dados locais do usuário
 */
function limparDadosLocais() {
    try {
        // Limpar variáveis globais
        if (typeof dados !== 'undefined') {
            dados = null;
        }
        
        if (typeof estadoSistema !== 'undefined') {
            estadoSistema = {
                mesAtual: new Date().getMonth(),
                anoAtual: new Date().getFullYear(),
                areaAtual: null,
                pessoaAtual: null,
                filtroAtual: 'todos',
                editandoAtividade: null,
                editandoEvento: null,
                editandoTarefa: null,
                pessoasSelecionadas: new Set(),
                tarefasVinculadas: new Map(),
                versaoSistema: '5.1',
                usuarioEmail: null,
                usuarioNome: null,
                alertasPrazosExibidos: new Set()
            };
        }
        
        console.log('🧹 Dados locais limpos');
    } catch (error) {
        console.error('❌ Erro ao limpar dados locais:', error);
    }
}

/**
 * Função para configurar listener de mudança de estado de autenticação - CORRIGIDA
 */
function configurarAuthStateListener(callback) {
    // Garantir métodos inicializados
    if (!metodosAuth) {
        if (!inicializarMetodosAuth()) {
            console.error('❌ Não foi possível configurar Auth State Listener');
            return;
        }
    }
    
    authStateChangedCallback = callback;
    
    // Usar método corrigido
    metodosAuth.onAuthStateChanged((user) => {
        console.log('🔄 Estado de autenticação mudou:', user ? user.email : 'Nenhum usuário');
        
        if (user) {
            usuarioAtual = user;
            if (callback && typeof callback === 'function') {
                callback(user);
            }
        } else {
            usuarioAtual = null;
            mostrarLogin();
        }
    });
}

/**
 * Função para obter usuário atual
 */
function obterUsuarioAtual() {
    return usuarioAtual;
}

/**
 * Função para verificar se usuário está logado
 */
function usuarioLogado() {
    return !!usuarioAtual;
}

/**
 * Função para obter informações do usuário atual
 */
function obterInfoUsuario() {
    if (!usuarioAtual) {
        return null;
    }
    
    return {
        uid: usuarioAtual.uid,
        email: usuarioAtual.email,
        nome: usuarioAtual.displayName || usuarioAtual.email.split('@')[0],
        emailVerificado: usuarioAtual.emailVerified,
        dataUltimoLogin: usuarioAtual.metadata.lastSignInTime,
        dataCriacao: usuarioAtual.metadata.creationTime
    };
}

/**
 * Função para atualizar perfil do usuário - CORRIGIDA
 */
function atualizarPerfilUsuario(dadosAtualizacao) {
    if (!usuarioAtual) {
        throw new Error('Usuário não está logado');
    }
    
    // Garantir métodos inicializados
    if (!metodosAuth) {
        inicializarMetodosAuth();
    }
    
    return metodosAuth.updateProfile(usuarioAtual, dadosAtualizacao)
        .then(() => {
            console.log('✅ Perfil atualizado com sucesso');
            mostrarNotificacao('Perfil atualizado!', 'success');
        })
        .catch((error) => {
            console.error('❌ Erro ao atualizar perfil:', error);
            mostrarNotificacao('Erro ao atualizar perfil!', 'error');
            throw error;
        });
}

/**
 * Função para verificar se usuário tem permissão
 */
function verificarPermissao(permissao) {
    // Por enquanto, todos os usuários têm todas as permissões
    // No futuro, implementar sistema de roles
    return usuarioLogado();
}

/**
 * Função para obter lista de usuários online (para presença)
 */
function obterUsuariosOnline() {
    return new Promise((resolve, reject) => {
        // Usar função compatível do sync.js
        if (typeof obterDatabaseCompativel === 'function') {
            const database = obterDatabaseCompativel();
            database.ref('presence').once('value')
                .then((snapshot) => {
                    const usuarios = snapshot.val() || {};
                    const usuariosOnline = Object.values(usuarios).filter(u => u.online);
                    resolve(usuariosOnline);
                })
                .catch(reject);
        } else {
            reject(new Error('Database não disponível'));
        }
    });
}

/**
 * Função para debug da autenticação
 */
function debugAuth() {
    console.group('🔐 DEBUG AUTENTICAÇÃO');
    console.log('Usuário atual:', usuarioAtual);
    console.log('Logado:', usuarioLogado());
    console.log('Info usuário:', obterInfoUsuario());
    console.log('Auth callback:', !!authStateChangedCallback);
    console.log('Métodos Auth:', !!metodosAuth);
    console.log('Firebase disponível:', typeof firebase !== 'undefined');
    console.groupEnd();
}

/**
 * Função para inicializar sistema de autenticação - MELHORADA
 */
function inicializarAuth() {
    console.log('🔐 Inicializando sistema de autenticação...');
    
    // Primeiro: inicializar métodos
    if (!inicializarMetodosAuth()) {
        console.error('❌ Falha ao inicializar métodos de autenticação');
        return false;
    }
    
    // Adicionar listeners de eventos do formulário
    adicionarListenersFormulario();
    
    // Configurar teclas de atalho
    configurarTeclasAtalho();
    
    console.log('✅ Sistema de autenticação inicializado');
    return true;
}

/**
 * Função para adicionar listeners do formulário de login
 */
function adicionarListenersFormulario() {
    // Enter no formulário de login
    const loginInputs = document.querySelectorAll('#loginScreen input');
    loginInputs.forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                fazerLogin();
            }
        });
    });
    
    // Remover classe de erro quando usuário digita
    loginInputs.forEach(input => {
        input.addEventListener('input', () => {
            input.classList.remove('input-error');
        });
    });
}

/**
 * Função para configurar teclas de atalho de autenticação
 */
function configurarTeclasAtalho() {
    document.addEventListener('keydown', (e) => {
        // Ctrl+L para logout (quando logado)
        if (e.ctrlKey && e.key === 'l' && usuarioLogado()) {
            e.preventDefault();
            fazerLogout();
        }
        
        // Escape para limpar formulário de login
        if (e.key === 'Escape' && !usuarioLogado()) {
            limparFormularioLogin();
        }
    });
}

// Exportar para uso global (compatibilidade)
if (typeof window !== 'undefined') {
    window.mostrarLogin = mostrarLogin;
    window.esconderLogin = esconderLogin;
    window.fazerLogin = fazerLogin;
    window.mostrarRegistro = mostrarRegistro;
    window.fazerLogout = fazerLogout;
    window.configurarAuthStateListener = configurarAuthStateListener;
    window.obterUsuarioAtual = obterUsuarioAtual;
    window.usuarioLogado = usuarioLogado;
    window.obterInfoUsuario = obterInfoUsuario;
    window.atualizarPerfilUsuario = atualizarPerfilUsuario;
    window.verificarPermissao = verificarPermissao;
    window.obterUsuariosOnline = obterUsuariosOnline;
    window.debugAuth = debugAuth;
    window.inicializarAuth = inicializarAuth;
    
    console.log('🔐 Módulo de autenticação CORRIGIDO carregado');
}