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

/* ==========================================================================
   SISTEMA DE REGISTRO MODERNO - Substituir em auth.js
   ========================================================================== */

/**
 * Estado do formulário de registro
 */
let estadoRegistro = {
    etapaAtual: 1,
    camposValidados: {},
    dadosFormulario: {},
    validandoEmail: false
};

/**
 * Função principal para mostrar o registro moderno - SUBSTITUI a função original
 */
function mostrarRegistro() {
    console.log('📝 Abrindo modal de registro moderno');
    
    // Resetar estado
    resetarEstadoRegistro();
    
    // Mostrar modal
    const modal = document.getElementById('modalRegistro');
    if (modal) {
        modal.classList.add('active');
        
        // Focar no primeiro campo
        setTimeout(() => {
            const emailInput = document.getElementById('registroEmail');
            if (emailInput) emailInput.focus();
        }, 300);
        
        // Configurar listeners
        configurarListenersRegistro();
    } else {
        console.error('❌ Modal de registro não encontrado');
        // Fallback para o sistema antigo
        mostrarRegistroLegado();
    }
}

/**
 * Resetar estado do formulário
 */
function resetarEstadoRegistro() {
    estadoRegistro = {
        etapaAtual: 1,
        camposValidados: {},
        dadosFormulario: {},
        validandoEmail: false
    };
    
    // Limpar formulário
    const form = document.getElementById('formRegistro');
    if (form) form.reset();
    
    // Resetar etapas
    mostrarEtapa(1);
    
    // Limpar validações
    limparValidacoes();
}

/**
 * Configurar listeners do formulário
 */
function configurarListenersRegistro() {
    // Listener para Enter
    document.addEventListener('keydown', function handleEnterRegistro(e) {
        if (e.key === 'Enter') {
            const modal = document.getElementById('modalRegistro');
            if (modal && modal.classList.contains('active')) {
                e.preventDefault();
                
                if (estadoRegistro.etapaAtual === 1) {
                    proximaEtapa();
                } else {
                    finalizarRegistro();
                }
            }
        }
        
        // Remover listener quando modal fechar
        if (!document.getElementById('modalRegistro')?.classList.contains('active')) {
            document.removeEventListener('keydown', handleEnterRegistro);
        }
    });
    
    // Listener para mudança de cargo
    const selectCargo = document.getElementById('registroCargo');
    if (selectCargo) {
        selectCargo.addEventListener('change', function() {
            const grupoOutro = document.getElementById('grupoCargoOutro');
            if (this.value === 'outro') {
                grupoOutro.style.display = 'block';
                document.getElementById('registroCargoOutro').focus();
            } else {
                grupoOutro.style.display = 'none';
            }
        });
    }
}

/**
 * Validação em tempo real de campos
 */
function validarCampoTempo(campoId) {
    const campo = document.getElementById(campoId);
    const valor = campo.value;
    let validacao = { valido: false, mensagem: '', icone: '' };
    
    switch (campoId) {
        case 'registroEmail':
            validacao = validarEmailTempo(valor);
            break;
        case 'registroSenha':
            validacao = validarSenhaTempo(valor);
            atualizarForcaSenha(valor);
            break;
        case 'registroConfirmarSenha':
            const senhaOriginal = document.getElementById('registroSenha').value;
            validacao = validarConfirmacaoSenha(valor, senhaOriginal);
            break;
        case 'registroNome':
            validacao = validarNomeTempo(valor);
            break;
        case 'registroCargo':
            validacao = validarCargoTempo(valor);
            break;
    }
    
    // Aplicar resultado da validação
    aplicarValidacao(campoId, validacao);
    
    // Atualizar estado
    estadoRegistro.camposValidados[campoId] = validacao.valido;
    estadoRegistro.dadosFormulario[campoId] = valor;
    
    // Atualizar botões
    atualizarBotoesEtapa();
}

/**
 * Validações específicas
 */
function validarEmailTempo(email) {
    if (!email) {
        return { valido: false, mensagem: 'Email é obrigatório', icone: '' };
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { valido: false, mensagem: 'Email inválido', icone: '❌' };
    }
    
    // Verificar domínios comuns
    const dominiosComuns = ['gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com'];
    const dominio = email.split('@')[1];
    
    if (dominiosComuns.includes(dominio)) {
        return { valido: true, mensagem: 'Email válido', icone: '✅' };
    }
    
    return { valido: true, mensagem: 'Email corporativo detectado', icone: '🏢' };
}

function validarSenhaTempo(senha) {
    if (!senha) {
        return { valido: false, mensagem: 'Senha é obrigatória', icone: '' };
    }
    
    if (senha.length < 6) {
        return { valido: false, mensagem: 'Mínimo 6 caracteres', icone: '❌' };
    }
    
    if (senha.length < 8) {
        return { valido: true, mensagem: 'Senha fraca mas aceita', icone: '⚠️' };
    }
    
    const temNumero = /\d/.test(senha);
    const temMaiuscula = /[A-Z]/.test(senha);
    const temMinuscula = /[a-z]/.test(senha);
    const temEspecial = /[!@#$%^&*]/.test(senha);
    
    const criterios = [temNumero, temMaiuscula, temMinuscula, temEspecial].filter(Boolean).length;
    
    if (criterios >= 3) {
        return { valido: true, mensagem: 'Senha forte', icone: '🔒' };
    }
    
    return { valido: true, mensagem: 'Senha média', icone: '⚡' };
}

function validarConfirmacaoSenha(confirmacao, senhaOriginal) {
    if (!confirmacao) {
        return { valido: false, mensagem: 'Confirme sua senha', icone: '' };
    }
    
    if (confirmacao !== senhaOriginal) {
        return { valido: false, mensagem: 'Senhas não coincidem', icone: '❌' };
    }
    
    return { valido: true, mensagem: 'Senhas coincidem', icone: '✅' };
}

function validarNomeTempo(nome) {
    if (!nome) {
        return { valido: false, mensagem: 'Nome é obrigatório', icone: '' };
    }
    
    if (nome.length < 2) {
        return { valido: false, mensagem: 'Nome muito curto', icone: '❌' };
    }
    
    const nomeCompleto = nome.trim().split(' ').length >= 2;
    
    if (!nomeCompleto) {
        return { valido: true, mensagem: 'Inclua seu sobrenome', icone: '⚠️' };
    }
    
    return { valido: true, mensagem: 'Nome válido', icone: '✅' };
}

function validarCargoTempo(cargo) {
    if (!cargo) {
        return { valido: false, mensagem: 'Selecione seu cargo', icone: '' };
    }
    
    return { valido: true, mensagem: 'Cargo selecionado', icone: '✅' };
}

/**
 * Aplicar resultado da validação no campo
 */
function aplicarValidacao(campoId, validacao) {
    const campo = document.getElementById(campoId);
    const mensagem = document.getElementById(`${campoId}Validation`);
    const icone = document.getElementById(`${campoId}Icon`);
    
    if (!campo || !mensagem || !icone) return;
    
    // Limpar classes anteriores
    campo.classList.remove('valid', 'invalid');
    mensagem.classList.remove('error', 'success');
    
    // Aplicar nova validação
    if (campo.value) {
        if (validacao.valido) {
            campo.classList.add('valid');
            mensagem.classList.add('success');
            campo.setAttribute('aria-invalid', 'false');
        } else {
            campo.classList.add('invalid');
            mensagem.classList.add('error');
            campo.setAttribute('aria-invalid', 'true');
        }
    }
    
    mensagem.textContent = validacao.mensagem;
    icone.textContent = validacao.icone;
}

/**
 * Atualizar indicador de força da senha
 */
function atualizarForcaSenha(senha) {
    const strengthFill = document.getElementById('strengthFill');
    const strengthText = document.getElementById('strengthText');
    
    if (!strengthFill || !strengthText) return;
    
    if (!senha) {
        strengthFill.style.width = '0%';
        strengthFill.style.background = '#e5e7eb';
        strengthText.textContent = 'Digite uma senha';
        return;
    }
    
    let score = 0;
    let feedback = [];
    
    // Critérios de força
    if (senha.length >= 8) score += 20; else feedback.push('8+ caracteres');
    if (/[a-z]/.test(senha)) score += 20; else feedback.push('minúscula');
    if (/[A-Z]/.test(senha)) score += 20; else feedback.push('maiúscula');
    if (/\d/.test(senha)) score += 20; else feedback.push('número');
    if (/[!@#$%^&*]/.test(senha)) score += 20; else feedback.push('especial');
    
    let cor, texto;
    
    if (score < 40) {
        cor = '#ef4444';
        texto = `Fraca (falta: ${feedback.join(', ')})`;
    } else if (score < 60) {
        cor = '#f59e0b';
        texto = `Média (falta: ${feedback.join(', ')})`;
    } else if (score < 80) {
        cor = '#3b82f6';
        texto = 'Boa (quase lá!)';
    } else {
        cor = '#10b981';
        texto = 'Forte 🔒';
    }
    
    strengthFill.style.width = `${score}%`;
    strengthFill.style.background = cor;
    strengthText.textContent = texto;
}

/**
 * Limpar todas as validações
 */
function limparValidacoes() {
    const campos = ['registroEmail', 'registroSenha', 'registroConfirmarSenha', 'registroNome', 'registroCargo'];
    
    campos.forEach(campoId => {
        const campo = document.getElementById(campoId);
        const mensagem = document.getElementById(`${campoId}Validation`);
        const icone = document.getElementById(`${campoId}Icon`);
        
        if (campo) {
            campo.classList.remove('valid', 'invalid');
            campo.removeAttribute('aria-invalid');
        }
        if (mensagem) {
            mensagem.textContent = '';
            mensagem.classList.remove('error', 'success');
        }
        if (icone) icone.textContent = '';
    });
    
    // Limpar força da senha
    atualizarForcaSenha('');
}

/**
 * Controle de etapas
 */
function mostrarEtapa(numeroEtapa) {
    // Esconder todas as etapas
    document.querySelectorAll('.form-step').forEach(etapa => {
        etapa.classList.remove('active');
    });
    
    // Mostrar etapa atual
    const etapaAtual = document.getElementById(`step${numeroEtapa}`);
    if (etapaAtual) {
        etapaAtual.classList.add('active');
    }
    
    // Atualizar indicadores
    atualizarIndicadoresEtapa(numeroEtapa);
    
    estadoRegistro.etapaAtual = numeroEtapa;
}

function atualizarIndicadoresEtapa(numeroEtapa) {
    [1, 2].forEach(numero => {
        const indicador = document.getElementById(`stepIndicator${numero}`);
        if (indicador) {
            indicador.classList.remove('active', 'completed');
            
            if (numero < numeroEtapa) {
                indicador.classList.add('completed');
            } else if (numero === numeroEtapa) {
                indicador.classList.add('active');
            }
        }
    });
}

function proximaEtapa() {
    // Validar campos da etapa 1
    const camposEtapa1 = ['registroEmail', 'registroSenha', 'registroConfirmarSenha'];
    
    let todosValidos = true;
    camposEtapa1.forEach(campoId => {
        validarCampoTempo(campoId);
        if (!estadoRegistro.camposValidados[campoId]) {
            todosValidos = false;
        }
    });
    
    if (!todosValidos) {
        if (window.Notifications) {
            window.Notifications.erro('Corrija os campos destacados antes de continuar');
        }
        
        // Focar no primeiro campo inválido
        const primeiroInvalido = camposEtapa1.find(campoId => !estadoRegistro.camposValidados[campoId]);
        if (primeiroInvalido) {
            document.getElementById(primeiroInvalido)?.focus();
        }
        return;
    }
    
    mostrarEtapa(2);
    
    // Focar no primeiro campo da próxima etapa
    setTimeout(() => {
        document.getElementById('registroNome')?.focus();
    }, 300);
}

function etapaAnterior() {
    mostrarEtapa(1);
    
    setTimeout(() => {
        document.getElementById('registroEmail')?.focus();
    }, 300);
}

function atualizarBotoesEtapa() {
    if (estadoRegistro.etapaAtual === 1) {
        const botao = document.getElementById('btnProximaEtapa');
        const camposEtapa1 = ['registroEmail', 'registroSenha', 'registroConfirmarSenha'];
        const todosValidos = camposEtapa1.every(campoId => estadoRegistro.camposValidados[campoId]);
        
        if (botao) {
            botao.disabled = !todosValidos;
            botao.classList.toggle('btn-primary', todosValidos);
            botao.classList.toggle('btn-secondary', !todosValidos);
        }
    } else {
        const botao = document.getElementById('btnFinalizarRegistro');
        const camposEtapa2 = ['registroNome', 'registroCargo'];
        const todosValidos = camposEtapa2.every(campoId => estadoRegistro.camposValidados[campoId]);
        
        if (botao) {
            botao.disabled = !todosValidos;
        }
    }
}

/**
 * Finalizar registro
 */
async function finalizarRegistro() {
    // Validar todos os campos obrigatórios
    const camposObrigatorios = ['registroEmail', 'registroSenha', 'registroConfirmarSenha', 'registroNome', 'registroCargo'];
    
    let todosValidos = true;
    camposObrigatorios.forEach(campoId => {
        validarCampoTempo(campoId);
        if (!estadoRegistro.camposValidados[campoId]) {
            todosValidos = false;
        }
    });
    
    if (!todosValidos) {
        if (window.Notifications) {
            window.Notifications.erro('Preencha todos os campos obrigatórios');
        }
        return;
    }
    
    // Coletar dados do formulário
    const email = document.getElementById('registroEmail').value;
    const senha = document.getElementById('registroSenha').value;
    const nome = document.getElementById('registroNome').value;
    let cargo = document.getElementById('registroCargo').value;
    const area = document.getElementById('registroArea').value;
    
    // Se cargo é "outro", usar o campo especificado
    if (cargo === 'outro') {
        const cargoEspecifico = document.getElementById('registroCargoOutro').value;
        cargo = cargoEspecifico || 'Não especificado';
    }
    
    console.log('📝 Criando nova conta para:', email);
    
    // Mostrar loading
    const botao = document.getElementById('btnFinalizarRegistro');
    const loading = document.getElementById('loadingRegistro');
    if (botao && loading) {
        botao.disabled = true;
        loading.classList.remove('hidden');
    }
    
    try {
        // Garantir métodos inicializados
        if (!metodosAuth) {
            if (!inicializarMetodosAuth()) {
                throw new Error('Sistema de autenticação não disponível');
            }
        }
        
        if (window.Notifications) {
            window.Notifications.info('Criando sua conta...');
        }
        
        // Criar conta no Firebase
        const userCredential = await metodosAuth.signUp(email, senha);
        
        // Atualizar perfil com informações completas
        const profileData = {
            displayName: nome,
            photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(nome)}&background=3b82f6&color=fff`
        };
        
        await metodosAuth.updateProfile(userCredential.user, profileData);
        
        // Salvar dados adicionais no banco (se necessário)
        if (typeof salvarDadosUsuario === 'function') {
            await salvarDadosUsuario(userCredential.user.uid, {
                nome,
                cargo,
                area,
                email,
                dataCriacao: new Date().toISOString()
            });
        }
        
        console.log('✅ Conta criada com sucesso');
        
        if (window.Notifications) {
            window.Notifications.sucesso(`🎉 Bem-vindo, ${nome}! Conta criada com sucesso!`);
        }
        
        // Fechar modal
        fecharModal('modalRegistro');
        
        // O sistema será inicializado automaticamente pelo authStateChanged
        
    } catch (error) {
        console.error('❌ Erro ao criar conta:', error);
        
        let mensagem = 'Erro ao criar conta';
        if (error.code === 'auth/email-already-in-use') {
            mensagem = 'Este email já está em uso!';
        } else if (error.code === 'auth/weak-password') {
            mensagem = 'Senha muito fraca!';
        } else if (error.code === 'auth/invalid-email') {
            mensagem = 'Email inválido!';
        } else if (error.code === 'auth/network-request-failed') {
            mensagem = 'Erro de conexão. Verifique sua internet.';
        } else {
            mensagem = `Erro: ${error.message}`;
        }
        
        if (window.Notifications) {
            window.Notifications.erro(mensagem);
        }
        
        // Voltar para primeira etapa se erro de email
        if (error.code === 'auth/email-already-in-use' || error.code === 'auth/invalid-email') {
            mostrarEtapa(1);
            setTimeout(() => {
                document.getElementById('registroEmail')?.focus();
            }, 300);
        }
        
    } finally {
        // Esconder loading
        if (botao && loading) {
            botao.disabled = false;
            loading.classList.add('hidden');
        }
    }
}

/**
 * Funções auxiliares
 */
function toggleSenhaVisibilidade(inputId) {
    const input = document.getElementById(inputId);
    const botao = input?.nextElementSibling;
    
    if (input && botao) {
        if (input.type === 'password') {
            input.type = 'text';
            botao.textContent = '🙈';
        } else {
            input.type = 'password';
            botao.textContent = '👁️';
        }
    }
}

function mostrarTermos() {
    if (window.Notifications) {
        window.Notifications.info('Termos de uso: Use o sistema com responsabilidade e respeite os dados da equipe.');
    }
}

/**
 * Função de fallback para o sistema antigo
 */
function mostrarRegistroLegado() {
    console.log('⚠️ Usando sistema de registro legado');
    
    const email = prompt('Digite seu email:');
    if (!email || !email.trim()) {
        if (window.Notifications) {
            window.Notifications.erro('Email é obrigatório!');
        }
        return;
    }
    
    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        if (window.Notifications) {
            window.Notifications.erro('Email inválido!');
        }
        return;
    }
    
    const senha = prompt('Digite uma senha (mínimo 6 caracteres):');
    if (!senha || senha.length < 6) {
        if (window.Notifications) {
            window.Notifications.erro('Senha deve ter pelo menos 6 caracteres!');
        }
        return;
    }
    
    const nome = prompt('Digite seu nome:');
    if (!nome || !nome.trim()) {
        if (window.Notifications) {
            window.Notifications.erro('Nome é obrigatório!');
        }
        return;
    }
    
    console.log('📝 Criando nova conta (modo legado) para:', email);
    
    if (window.Notifications) {
        window.Notifications.info('Criando conta...');
    }
    
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
            console.log('✅ Conta criada com sucesso (modo legado)');
            if (window.Notifications) {
                window.Notifications.sucesso('Conta criada com sucesso! Fazendo login...');
            }
            
            // Preencher campos e fazer login automático
            setTimeout(() => {
                const emailInput = document.getElementById('loginEmail');
                const senhaInput = document.getElementById('loginPassword');
                if (emailInput) emailInput.value = email;
                if (senhaInput) senhaInput.value = senha;
                fazerLogin();
            }, 1500);
        })
        .catch((error) => {
            console.error('❌ Erro ao criar conta (modo legado):', error);
            
            let mensagem = 'Erro ao criar conta';
            if (error.code === 'auth/email-already-in-use') {
                mensagem = 'Este email já está em uso!';
            } else if (error.code === 'auth/weak-password') {
                mensagem = 'Senha muito fraca!';
            } else if (error.code === 'auth/invalid-email') {
                mensagem = 'Email inválido!';
            }
            
            if (window.Notifications) {
                window.Notifications.erro(mensagem);
            }
        });
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.mostrarRegistroModerno = mostrarRegistro;
    window.validarCampoTempo = validarCampoTempo;
    window.proximaEtapa = proximaEtapa;
    window.etapaAnterior = etapaAnterior;
    window.finalizarRegistro = finalizarRegistro;
    window.toggleSenhaVisibilidade = toggleSenhaVisibilidade;
    window.mostrarTermos = mostrarTermos;
    
    console.log('✅ Sistema de registro moderno carregado');
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