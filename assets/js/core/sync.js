 /* ==========================================================================
   SISTEMA DE SINCRONIZAÇÃO - Sistema de Gestão v5.1
   ========================================================================== */

/**
 * Variáveis globais de sincronização
 */
let listenersDados = {};
let presenceRef = null;
let connectedRef = null;
let syncTimeout = null;
let conflitosResolucao = null;
let ultimaSincronizacao = null;

/**
 * Função para configurar sistema de presença online
 */
function configurarPresenca() {
    const usuarioAtual = obterUsuarioAtual();
    if (!usuarioAtual) {
        console.warn('⚠️ Usuário não logado para configurar presença');
        return;
    }
    
    console.log('👥 Configurando presença online para:', usuarioAtual.email);
    
    const database = getDatabase();
    const uid = usuarioAtual.uid;
    
    presenceRef = database.ref(`presence/${uid}`);
    connectedRef = database.ref('.info/connected');
    
    const userStatus = {
        uid: uid,
        email: usuarioAtual.email,
        nome: usuarioAtual.displayName || usuarioAtual.email.split('@')[0],
        online: true,
        ultimaAtividade: firebase.database.ServerValue.TIMESTAMP,
        versaoSistema: VERSAO_SISTEMA
    };
    
    // Configurar presença
    connectedRef.on('value', (snapshot) => {
        if (snapshot.val() === true) {
            // Remover presença quando desconectar
            presenceRef.onDisconnect().remove();
            // Definir como online
            presenceRef.set(userStatus);
            console.log('🟢 Presença online configurada');
        }
    });
    
    // Monitorar usuários online
    database.ref('presence').on('value', (snapshot) => {
        const usuarios = snapshot.val() || {};
        atualizarUsuariosOnline(usuarios);
    });
}

/**
 * Função para atualizar lista de usuários online
 */
function atualizarUsuariosOnline(usuarios) {
    const lista = document.getElementById('usersOnlineList');
    if (!lista) return;
    
    lista.innerHTML = '';
    
    const usuariosArray = Object.values(usuarios).filter(u => u.online);
    
    usuariosArray.forEach(usuario => {
        const avatar = document.createElement('div');
        avatar.className = 'user-avatar online';
        avatar.textContent = usuario.nome ? usuario.nome.charAt(0).toUpperCase() : '?';
        
        const tooltip = document.createElement('div');
        tooltip.className = 'user-tooltip';
        tooltip.textContent = `${usuario.nome || usuario.email} - v${usuario.versaoSistema || '?'}`;
        
        avatar.appendChild(tooltip);
        lista.appendChild(avatar);
    });
    
    // Atualizar contador
    const contador = document.querySelector('.users-online > div:first-child');
    if (contador) {
        contador.textContent = `Equipe Online (${usuariosArray.length})`;
    }
    
    console.log(`👥 ${usuariosArray.length} usuários online`);
}

/**
 * Função para configurar sincronização de dados
 */
function configurarSincronizacao() {
    console.log('🔄 Configurando sincronização de dados...');
    
    const database = getDatabase();
    
    // Listener principal dos dados
    listenersDados.dados = database.ref('dados').on('value', (snapshot) => {
        const dadosServidor = snapshot.val();
        
        if (dadosServidor) {
            console.log('📥 Dados recebidos do servidor');
            processarDadosRecebidos(dadosServidor);
        } else {
            console.log('📝 Nenhum dado no servidor, inicializando...');
            dados = inicializarDados();
            salvarDados();
        }
    });
    
    // Listener de atividades (log)
    listenersDados.atividades = database.ref('atividades')
        .orderByChild('timestamp')
        .limitToLast(50)
        .on('child_added', (snapshot) => {
            const atividade = snapshot.val();
            const usuarioAtual = obterUsuarioAtual();
            
            if (atividade && atividade.usuario !== usuarioAtual?.email) {
                adicionarAtividadeLog(atividade);
            }
        });
    
    // Listener de status de edição
    listenersDados.editando = database.ref('editando').on('value', (snapshot) => {
        const editando = snapshot.val() || {};
        atualizarIndicadoresEdicao(editando);
    });
    
    // Listener de conexão
    configurarMonitoramentoConexao();
    
    console.log('✅ Sincronização configurada');
}

/**
 * Função para processar dados recebidos do servidor
 */
function processarDadosRecebidos(dadosServidor) {
    const usuarioAtual = obterUsuarioAtual();
    
    if (dados && dados.ultimaAtualizacao && 
        dadosServidor.ultimaAtualizacao !== dados.ultimaAtualizacao &&
        new Date(dadosServidor.ultimaAtualizacao) > new Date(dados.ultimaAtualizacao)) {
        
        if (temMudancasLocais()) {
            console.log('⚠️ Conflito detectado');
            mostrarConflito(dadosServidor);
        } else {
            console.log('🔄 Atualizando com dados do servidor');
            dados = dadosServidor;
            renderizarDashboard();
            atualizarIndicadorSync('synced');
            ultimaSincronizacao = new Date();
        }
    } else {
        dados = dadosServidor;
        renderizarDashboard();
        atualizarIndicadorSync('synced');
        ultimaSincronizacao = new Date();
    }
}

/**
 * Função para atualizar indicador de sincronização
 */
function atualizarIndicadorSync(status) {
    const indicator = document.getElementById('syncIndicator');
    const loader = document.getElementById('syncLoader');
    const text = document.getElementById('syncText');
    
    if (!indicator || !text) return;
    
    indicator.className = 'sync-indicator';
    
    switch(status) {
        case 'syncing':
            indicator.classList.add('syncing');
            if (loader) loader.style.display = 'inline-block';
            text.textContent = 'Sincronizando...';
            break;
        case 'synced':
            indicator.classList.add('synced');
            if (loader) loader.style.display = 'none';
            text.textContent = '✓ Sincronizado';
            break;
        case 'error':
            indicator.classList.add('error');
            if (loader) loader.style.display = 'none';
            text.textContent = '✗ Erro de sincronização';
            break;
        case 'offline':
            indicator.classList.add('offline');
            if (loader) loader.style.display = 'none';
            text.textContent = '◉ Offline';
            break;
    }
    
    // Log do status
    const statusEmojis = {
        syncing: '🔄',
        synced: '✅',
        error: '❌',
        offline: '🔴'
    };
    console.log(`${statusEmojis[status]} Sync: ${status}`);
}

/**
 * Função principal para salvar dados no Firebase
 */
function salvarDados() {
    const usuarioAtual = obterUsuarioAtual();
    if (!usuarioAtual) {
        console.warn('⚠️ Usuário não logado para salvar dados');
        return;
    }
    
    try {
        atualizarIndicadorSync('syncing');
        
        dados.ultimaAtualizacao = new Date().toISOString();
        dados.ultimoUsuario = usuarioAtual.email;
        dados.versaoSistema = VERSAO_SISTEMA;
        
        const database = getDatabase();
        database.ref('dados').set(dados).then(() => {
            console.log('✅ Dados salvos no Firebase');
            atualizarIndicadorSync('synced');
            ultimaSincronizacao = new Date();
            
            registrarAtividade('dados_salvos', {
                usuario: usuarioAtual.email,
                timestamp: dados.ultimaAtualizacao,
                versao: VERSAO_SISTEMA
            });
        }).catch((error) => {
            console.error('❌ Erro ao salvar:', error);
            atualizarIndicadorSync('error');
            mostrarNotificacao(MENSAGENS.ERRO.ERRO_SALVAMENTO, 'error');
        });
    } catch (error) {
        console.error('❌ Erro ao salvar dados:', error);
        atualizarIndicadorSync('error');
        mostrarNotificacao(MENSAGENS.ERRO.ERRO_SALVAMENTO, 'error');
    }
}

/**
 * Função para registrar atividade no log
 */
function registrarAtividade(tipo, detalhes) {
    const usuarioAtual = obterUsuarioAtual();
    if (!usuarioAtual) return;
    
    const atividade = {
        tipo: tipo,
        usuario: usuarioAtual.email,
        nomeUsuario: usuarioAtual.displayName || usuarioAtual.email.split('@')[0],
        timestamp: firebase.database.ServerValue.TIMESTAMP,
        detalhes: detalhes,
        versaoSistema: VERSAO_SISTEMA
    };
    
    const database = getDatabase();
    database.ref('atividades').push(atividade);
}

/**
 * Função para marcar que está editando algo
 */
function marcarEditando(tipo, id) {
    const usuarioAtual = obterUsuarioAtual();
    if (!usuarioAtual) return;
    
    const database = getDatabase();
    const ref = database.ref(`editando/${tipo}_${id}`);
    
    ref.set({
        usuario: usuarioAtual.email,
        nomeUsuario: usuarioAtual.displayName || usuarioAtual.email.split('@')[0],
        timestamp: firebase.database.ServerValue.TIMESTAMP,
        tipo: tipo,
        itemId: id
    });
    
    // Auto-remover após 30 segundos
    setTimeout(() => {
        ref.remove().catch(err => console.warn('Aviso: Erro ao remover marcação de edição:', err));
    }, 30000);
}

/**
 * Função para parar de marcar como editando
 */
function pararEditando(tipo, id) {
    const usuarioAtual = obterUsuarioAtual();
    if (!usuarioAtual) return;
    
    const database = getDatabase();
    database.ref(`editando/${tipo}_${id}`).remove();
}

/**
 * Função para verificar se tem mudanças locais não salvas
 */
function temMudancasLocais() {
    // Por enquanto, sempre retorna false
    // No futuro, implementar verificação de mudanças locais pendentes
    return false;
}

/**
 * Função para mostrar modal de conflito
 */
function mostrarConflito(dadosServidor) {
    conflitosResolucao = dadosServidor;
    
    const modal = document.getElementById('conflictModal');
    const mensagem = document.getElementById('conflictMessage');
    
    if (modal && mensagem) {
        mensagem.textContent = `${dadosServidor.ultimoUsuario} fez alterações. O que deseja fazer?`;
        modal.classList.add('active');
        
        console.log('⚠️ Conflito exibido para usuário');
    }
}

/**
 * Função para resolver conflito
 */
function resolverConflito(acao) {
    const modal = document.getElementById('conflictModal');
    if (modal) {
        modal.classList.remove('active');
    }
    
    if (acao === 'descartar' && conflitosResolucao) {
        console.log('📥 Usando versão do servidor');
        dados = conflitosResolucao;
        renderizarDashboard();
        mostrarNotificacao('Usando versão do servidor', 'info');
    } else {
        console.log('💾 Mantendo alterações locais');
        salvarDados();
        mostrarNotificacao('Mantendo suas alterações', 'info');
    }
    
    conflitosResolucao = null;
}

/**
 * Função para atualizar indicadores de edição
 */
function atualizarIndicadoresEdicao(editando) {
    const usuarioAtual = obterUsuarioAtual();
    if (!usuarioAtual) return;
    
    // Remover indicadores existentes
    document.querySelectorAll('.editing-indicator').forEach(el => el.remove());
    
    Object.entries(editando).forEach(([key, info]) => {
        if (info.usuario !== usuarioAtual.email) {
            const [tipo, id] = key.split('_');
            
            if (tipo === 'atividade') {
                const elemento = document.querySelector(`[data-atividade-id="${id}"]`);
                if (elemento && !elemento.querySelector('.editing-indicator')) {
                    const indicator = document.createElement('span');
                    indicator.className = 'editing-indicator';
                    indicator.textContent = `${info.nomeUsuario} editando...`;
                    elemento.appendChild(indicator);
                }
            }
        }
    });
}

/**
 * Função para adicionar atividade ao log
 */
function adicionarAtividadeLog(atividade) {
    const container = document.getElementById('activityLogContent');
    if (!container) return;
    
    const item = document.createElement('div');
    item.className = 'activity-item';
    
    const tempo = new Date(atividade.timestamp).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    let mensagem = gerarMensagemAtividade(atividade);
    
    item.innerHTML = `
        <div>${mensagem}</div>
        <div class="time">${tempo}</div>
    `;
    
    // Adicionar no topo
    container.insertBefore(item, container.firstChild);
    
    // Limitar a 50 itens
    while (container.children.length > 50) {
        container.removeChild(container.lastChild);
    }
    
    // Animação de entrada
    item.classList.add('activity-item', 'novo');
    setTimeout(() => {
        item.classList.remove('novo');
    }, 800);
}

/**
 * Função para gerar mensagem de atividade
 */
function gerarMensagemAtividade(atividade) {
    const nome = atividade.nomeUsuario || atividade.usuario.split('@')[0];
    
    switch(atividade.tipo) {
        case 'atividade_criada':
            return `${nome} criou "${atividade.detalhes.nome}"`;
        case 'atividade_editada':
            return `${nome} editou "${atividade.detalhes.nome}"`;
        case 'status_alterado':
            return `${nome} alterou status de "${atividade.detalhes.atividade}"`;
        case 'evento_criado':
            return `${nome} criou evento "${atividade.detalhes.titulo}"`;
        case 'evento_editado':
            return `${nome} editou evento "${atividade.detalhes.titulo}"`;
        case 'tarefa_editada':
            return `${nome} editou tarefa "${atividade.detalhes.tarefa}"`;
        case 'status_automatico':
            return `Sistema alterou status de "${atividade.detalhes.atividade}" automaticamente`;
        case 'dados_salvos':
            return `${nome} sincronizou dados`;
        default:
            return `${nome} fez uma alteração`;
    }
}

/**
 * Função para limpar listeners de sincronização
 */
function limparListenersSync() {
    try {
        Object.values(listenersDados).forEach(ref => {
            if (ref && typeof ref.off === 'function') {
                ref.off();
            }
        });
        listenersDados = {};
        
        // Limpar presença
        if (presenceRef) {
            presenceRef.remove().catch(err => console.warn('Aviso ao remover presença:', err));
            presenceRef = null;
        }
        
        if (connectedRef) {
            connectedRef.off();
            connectedRef = null;
        }
        
        console.log('🧹 Listeners de sincronização limpos');
    } catch (error) {
        console.error('❌ Erro ao limpar listeners:', error);
    }
}

/**
 * Função para obter estatísticas de sincronização
 */
function obterEstatisticasSync() {
    return {
        ultimaSincronizacao: ultimaSincronizacao,
        listenersAtivos: Object.keys(listenersDados).length,
        presencaOnline: !!presenceRef,
        conflitoPendente: !!conflitosResolucao,
        versaoSistema: VERSAO_SISTEMA
    };
}

/**
 * Função para forçar sincronização
 */
function forcarSincronizacao() {
    console.log('🔄 Forçando sincronização...');
    atualizarIndicadorSync('syncing');
    
    setTimeout(() => {
        salvarDados();
    }, 500);
}

/**
 * Função para toggle do log de atividades
 */
function toggleActivityLog() {
    const log = document.getElementById('activityLog');
    if (log) {
        log.classList.toggle('active');
    }
}

/**
 * Função para debug do sistema de sincronização
 */
function debugSync() {
    console.group('🔄 DEBUG SINCRONIZAÇÃO');
    console.log('Listeners:', listenersDados);
    console.log('Presença:', !!presenceRef);
    console.log('Conectado:', !!connectedRef);
    console.log('Última sync:', ultimaSincronizacao);
    console.log('Conflitos:', !!conflitosResolucao);
    console.log('Estatísticas:', obterEstatisticasSync());
    console.groupEnd();
}

// Exportar para uso global (compatibilidade)
if (typeof window !== 'undefined') {
    window.configurarPresenca = configurarPresenca;
    window.configurarSincronizacao = configurarSincronizacao;
    window.atualizarIndicadorSync = atualizarIndicadorSync;
    window.salvarDados = salvarDados;
    window.registrarAtividade = registrarAtividade;
    window.marcarEditando = marcarEditando;
    window.pararEditando = pararEditando;
    window.mostrarConflito = mostrarConflito;
    window.resolverConflito = resolverConflito;
    window.atualizarIndicadoresEdicao = atualizarIndicadoresEdicao;
    window.adicionarAtividadeLog = adicionarAtividadeLog;
    window.limparListenersSync = limparListenersSync;
    window.obterEstatisticasSync = obterEstatisticasSync;
    window.forcarSincronizacao = forcarSincronizacao;
    window.toggleActivityLog = toggleActivityLog;
    window.debugSync = debugSync;
    
    // Compatibilidade com nomes antigos
    window.listenersDados = listenersDados;
    window.presenceRef = presenceRef;
    
    console.log('🔄 Módulo de sincronização carregado');
}
