/* ==========================================================================
   SISTEMA DE AUTENTICAÇÃO - Sistema de Gestão v5.1
   ========================================================================== */

/**
 * Variáveis globais de autenticação
 */
let usuarioAtual = null;
let authStateChangedCallback = null;

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
 * Função principal de login
 */
function fazerLogin() {
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
    
    // Tentar fazer login no Firebase
    const auth = getAuth();
    auth.signInWithEmailAndPassword(email, senha)
        .then((userCredential) => {
            usuarioAtual = userCredential.user;
            console.log('✅ Login realizado com sucesso:', usuarioAtual.email);
            
            mostrarNotificacao(MENSAGENS.SUCESSO.LOGIN_SUCESSO, 'success');
            
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
 * Função para validar campos de login
 */
function validarCamposLogin(email, senha) {
    let valido = true;
    
    const emailInput = document.getElementById('loginEmail');
    const senhaInput = document.getElementById('loginPassword');
    
    // Validar email
    if (!email || !email.trim()) {
        emailInput?.classList.add('input-error');
        valido = false;
    } else {
        emailInput?.classList.remove('input-error');
    }
    
    // Validar senha
    if (!senha || !senha.trim()) {
        senhaInput?.classList.add('input-error');
        valido = false;
    } else {
        senhaInput?.classList.remove('input-error');
    }
    
    if (!valido) {
        mostrarNotificacao(MENSAGENS.ERRO.CAMPOS_OBRIGATORIOS, 'error');
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
 * Função para tratar erros de login
 */
function tratarErroLogin(error) {
    let mensagem = MENSAGENS.ERRO.ERRO_LOGIN;
    
    switch (error.code) {
        case 'auth/user-not-found':
            mensagem = MENSAGENS.ERRO.USUARIO_NAO_ENCONTRADO;
            break;
        case 'auth/wrong-password':
            mensagem = MENSAGENS.ERRO.SENHA_INCORRETA;
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
 * Função para mostrar o registro de novo usuário
 */
function mostrarRegistro() {
    const email = prompt('Digite seu email:');
    if (!email || !email.trim()) return;
    
    const senha = prompt('Digite uma senha (mínimo 6 caracteres):');
    if (!senha || senha.length < VALIDACAO.MIN_SENHA) {
        mostrarNotificacao(MENSAGENS.ERRO.ERRO_SENHA, 'error');
        return;
    }
    
    const nome = prompt('Digite seu nome:');
    if (!nome || !nome.trim()) return;
    
    console.log('📝 Criando nova conta para:', email);
    mostrarNotificacao('Criando conta...', 'info');
    
    const auth = getAuth();
    auth.createUserWithEmailAndPassword(email, senha)
        .then((userCredential) => {
            // Atualizar perfil com nome
            return userCredential.user.updateProfile({
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
 * Função para fazer logout
 */
function fazerLogout() {
    if (!confirm(MENSAGENS.CONFIRMACAO.LOGOUT)) {
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
    
    // Fazer logout no Firebase
    const auth = getAuth();
    auth.signOut()
        .then(() => {
            console.log('✅ Logout realizado com sucesso');
            mostrarNotificacao(MENSAGENS.SUCESSO.LOGOUT_SUCESSO, 'success');
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
        // Limpar localStorage se necessário
        Object.values(STORAGE_KEYS).forEach(key => {
            if (localStorage.getItem(key)) {
                localStorage.removeItem(key);
            }
        });
        
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
                versaoSistema: VERSAO_SISTEMA,
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
 * Função para configurar listener de mudança de estado de autenticação
 */
function configurarAuthStateListener(callback) {
    const auth = getAuth();
    authStateChangedCallback = callback;
    
    auth.onAuthStateChanged((user) => {
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
 * Função para atualizar perfil do usuário
 */
function atualizarPerfilUsuario(dadosAtualizacao) {
    if (!usuarioAtual) {
        throw new Error('Usuário não está logado');
    }
    
    return usuarioAtual.updateProfile(dadosAtualizacao)
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
        const database = getDatabase();
        database.ref('presence').once('value')
            .then((snapshot) => {
                const usuarios = snapshot.val() || {};
                const usuariosOnline = Object.values(usuarios).filter(u => u.online);
                resolve(usuariosOnline);
            })
            .catch(reject);
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
    console.groupEnd();
}

/**
 * Função para inicializar sistema de autenticação
 */
function inicializarAuth() {
    console.log('🔐 Inicializando sistema de autenticação...');
    
    // Adicionar listeners de eventos do formulário
    adicionarListenersFormulario();
    
    // Configurar teclas de atalho
    configurarTeclasAtalho();
    
    console.log('✅ Sistema de autenticação inicializado');
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
    
    console.log('🔐 Módulo de autenticação carregado');
} 
