/* ==========================================================================
   SISTEMA DE NOTIFICAÇÕES - Sistema de Gestão v5.1
   ========================================================================== */

/**
 * Módulo responsável por todo o sistema de notificações do aplicativo
 * Fornece toast notifications, alertas, confirmações e mensagens do sistema
 */

/**
 * ========== CONFIGURAÇÕES E CONSTANTES ==========
 */

const CONFIG_NOTIFICACOES = {
    // Durações padrão em milissegundos
    duracao: {
        success: 3000,
        info: 4000,
        warning: 5000,
        error: 6000,
        critical: 8000
    },
    
    // Máximo de notificações simultâneas
    maxNotificacoes: 5,
    
    // Posições disponíveis
    posicoes: {
        'top-right': 'top: 20px; right: 20px;',
        'top-left': 'top: 20px; left: 20px;',
        'top-center': 'top: 20px; left: 50%; transform: translateX(-50%);',
        'bottom-right': 'bottom: 20px; right: 20px;',
        'bottom-left': 'bottom: 20px; left: 20px;',
        'bottom-center': 'bottom: 20px; left: 50%; transform: translateX(-50%);'
    },
    
    // Posição padrão
    posicaoPadrao: 'top-right',
    
    // Animações
    animacoes: {
        entrada: 'slideInRight',
        saida: 'slideOutRight'
    }
};

/**
 * ========== ESTADO DAS NOTIFICAÇÕES ==========
 */

let notificacoesAtivas = new Map();
let filaNotificacoes = [];
let contadorId = 0;
let containerNotificacoes = null;

/**
 * ========== INICIALIZAÇÃO ==========
 */

/**
 * Inicializa o sistema de notificações
 */
function inicializarNotificacoes() {
    criarContainerNotificacoes();
    aplicarEstilosNotificacoes();
    
    console.log('📢 Sistema de notificações inicializado');
}

/**
 * Cria o container principal das notificações
 */
function criarContainerNotificacoes() {
    if (containerNotificacoes) return;
    
    containerNotificacoes = document.createElement('div');
    containerNotificacoes.id = 'notifications-container';
    containerNotificacoes.style.cssText = `
        position: fixed;
        ${CONFIG_NOTIFICACOES.posicoes[CONFIG_NOTIFICACOES.posicaoPadrao]}
        z-index: 10000;
        pointer-events: none;
        max-width: 400px;
        width: 100%;
    `;
    
    document.body.appendChild(containerNotificacoes);
}

/**
 * Aplica estilos CSS para as notificações
 */
function aplicarEstilosNotificacoes() {
    if (document.getElementById('notification-styles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'notification-styles';
    styles.textContent = `
        .notification {
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            margin-bottom: 12px;
            padding: 16px 20px;
            pointer-events: all;
            position: relative;
            overflow: hidden;
            max-width: 100%;
            word-wrap: break-word;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .notification.show {
            opacity: 1;
            transform: translateX(0);
        }
        
        .notification.hide {
            opacity: 0;
            transform: translateX(100%);
            margin-bottom: 0;
            padding-top: 0;
            padding-bottom: 0;
            max-height: 0;
        }
        
        .notification-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 8px;
        }
        
        .notification-title {
            font-weight: 600;
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .notification-close {
            background: none;
            border: none;
            font-size: 18px;
            cursor: pointer;
            padding: 0;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
            transition: background-color 0.2s;
            color: #6b7280;
        }
        
        .notification-close:hover {
            background: rgba(0, 0, 0, 0.1);
        }
        
        .notification-message {
            font-size: 13px;
            line-height: 1.4;
            color: #374151;
        }
        
        .notification-actions {
            margin-top: 12px;
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
        }
        
        .notification-action {
            padding: 6px 12px;
            border: none;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
        }
        
        .notification-progress {
            position: absolute;
            bottom: 0;
            left: 0;
            height: 3px;
            background: rgba(255, 255, 255, 0.3);
            transition: width linear;
        }
        
        /* Tipos de notificação */
        .notification.success {
            border-left: 4px solid #10b981;
        }
        
        .notification.success .notification-title {
            color: #059669;
        }
        
        .notification.success .notification-progress {
            background: #10b981;
        }
        
        .notification.info {
            border-left: 4px solid #3b82f6;
        }
        
        .notification.info .notification-title {
            color: #2563eb;
        }
        
        .notification.info .notification-progress {
            background: #3b82f6;
        }
        
        .notification.warning {
            border-left: 4px solid #f59e0b;
        }
        
        .notification.warning .notification-title {
            color: #d97706;
        }
        
        .notification.warning .notification-progress {
            background: #f59e0b;
        }
        
        .notification.error {
            border-left: 4px solid #ef4444;
        }
        
        .notification.error .notification-title {
            color: #dc2626;
        }
        
        .notification.error .notification-progress {
            background: #ef4444;
        }
        
        .notification.critical {
            border-left: 4px solid #dc2626;
            background: #fef2f2;
            animation: shake 0.5s ease-in-out;
        }
        
        .notification.critical .notification-title {
            color: #991b1b;
        }
        
        .notification.critical .notification-progress {
            background: #dc2626;
        }
        
        /* Responsividade */
        @media (max-width: 480px) {
            .notification {
                margin: 8px;
                border-radius: 6px;
                padding: 12px 16px;
            }
            
            .notification-title {
                font-size: 13px;
            }
            
            .notification-message {
                font-size: 12px;
            }
        }
        
        /* Animação shake para críticos */
        @keyframes shake {
            0%, 20%, 40%, 60%, 80%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        }
    `;
    
    document.head.appendChild(styles);
}

/**
 * ========== FUNÇÕES PRINCIPAIS ==========
 */

/**
 * Mostra uma notificação
 * @param {string|Object} opcoes - Mensagem ou objeto de configuração
 * @param {string} tipo - Tipo da notificação (success, info, warning, error, critical)
 * @param {number} duracao - Duração em ms (opcional)
 * @returns {string} ID da notificação
 */
function mostrarNotificacao(opcoes, tipo = 'info', duracao = null) {
    // Se for apenas uma string, converter para objeto
    if (typeof opcoes === 'string') {
        opcoes = { mensagem: opcoes };
    }
    
    const configuracao = {
        id: `notification_${++contadorId}`,
        tipo: tipo,
        titulo: obterTituloTipo(tipo),
        mensagem: opcoes.mensagem || '',
        duracao: duracao || CONFIG_NOTIFICACOES.duracao[tipo] || 4000,
        icone: obterIconeTipo(tipo),
        acoes: opcoes.acoes || [],
        persistente: opcoes.persistente || false,
        callback: opcoes.callback || null,
        ...opcoes
    };
    
    // Verificar limite de notificações
    if (notificacoesAtivas.size >= CONFIG_NOTIFICACOES.maxNotificacoes) {
        filaNotificacoes.push(configuracao);
        return configuracao.id;
    }
    
    criarNotificacao(configuracao);
    return configuracao.id;
}

/**
 * Cria e exibe uma notificação
 * @param {Object} config - Configuração da notificação
 */
function criarNotificacao(config) {
    const notification = document.createElement('div');
    notification.className = `notification ${config.tipo}`;
    notification.id = config.id;
    
    notification.innerHTML = `
        <div class="notification-header">
            <div class="notification-title">
                <span class="notification-icon">${config.icone}</span>
                ${config.titulo}
            </div>
            <button class="notification-close" onclick="fecharNotificacao('${config.id}')">&times;</button>
        </div>
        
        ${config.mensagem ? `<div class="notification-message">${config.mensagem}</div>` : ''}
        
        ${config.acoes && config.acoes.length > 0 ? `
            <div class="notification-actions">
                ${config.acoes.map((acao, index) => `
                    <button class="notification-action" 
                            style="background: ${acao.cor || '#3b82f6'}; color: white;"
                            onclick="executarAcaoNotificacao('${config.id}', ${index})">
                        ${acao.texto}
                    </button>
                `).join('')}
            </div>
        ` : ''}
        
        ${!config.persistente ? `<div class="notification-progress"></div>` : ''}
    `;
    
    // Adicionar ao container
    if (!containerNotificacoes) {
        criarContainerNotificacoes();
    }
    
    containerNotificacoes.appendChild(notification);
    notificacoesAtivas.set(config.id, config);
    
    // Animar entrada
    setTimeout(() => {
        notification.classList.add('show');
    }, 50);
    
    // Configurar auto-close se não for persistente
    if (!config.persistente) {
        const progressBar = notification.querySelector('.notification-progress');
        if (progressBar) {
            progressBar.style.width = '100%';
            progressBar.style.transition = `width ${config.duracao}ms linear`;
            
            setTimeout(() => {
                progressBar.style.width = '0%';
            }, 100);
        }
        
        setTimeout(() => {
            fecharNotificacao(config.id);
        }, config.duracao);
    }
    
    // Log para debug
    console.log(`📢 Notificação ${config.tipo}: ${config.mensagem}`);
}

/**
 * Fecha uma notificação específica
 * @param {string} id - ID da notificação
 */
function fecharNotificacao(id) {
    const notification = document.getElementById(id);
    if (!notification) return;
    
    const config = notificacoesAtivas.get(id);
    
    // Animar saída
    notification.classList.add('hide');
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
        notificacoesAtivas.delete(id);
        
        // Executar callback se existir
        if (config && config.callback) {
            config.callback();
        }
        
        // Processar fila
        processarFilaNotificacoes();
    }, 300);
}

/**
 * Executa ação de uma notificação
 * @param {string} id - ID da notificação
 * @param {number} indexAcao - Índice da ação
 */
function executarAcaoNotificacao(id, indexAcao) {
    const config = notificacoesAtivas.get(id);
    if (!config || !config.acoes || !config.acoes[indexAcao]) return;
    
    const acao = config.acoes[indexAcao];
    
    // Executar callback da ação
    if (acao.callback && typeof acao.callback === 'function') {
        acao.callback();
    }
    
    // Fechar notificação se solicitado
    if (acao.fecharApos !== false) {
        fecharNotificacao(id);
    }
}

/**
 * Processa fila de notificações pendentes
 */
function processarFilaNotificacoes() {
    if (filaNotificacoes.length > 0 && notificacoesAtivas.size < CONFIG_NOTIFICACOES.maxNotificacoes) {
        const proxima = filaNotificacoes.shift();
        criarNotificacao(proxima);
    }
}

/**
 * ========== FUNÇÕES AUXILIARES ==========
 */

/**
 * Obtém título padrão para cada tipo
 * @param {string} tipo - Tipo da notificação
 * @returns {string} Título
 */
function obterTituloTipo(tipo) {
    const titulos = {
        success: 'Sucesso',
        info: 'Informação',
        warning: 'Atenção',
        error: 'Erro',
        critical: 'Crítico'
    };
    
    return titulos[tipo] || 'Notificação';
}

/**
 * Obtém ícone para cada tipo
 * @param {string} tipo - Tipo da notificação
 * @returns {string} Ícone emoji
 */
function obterIconeTipo(tipo) {
    const icones = {
        success: '✅',
        info: 'ℹ️',
        warning: '⚠️',
        error: '❌',
        critical: '🚨'
    };
    
    return icones[tipo] || 'ℹ️';
}

/**
 * ========== FUNÇÕES ESPECÍFICAS ==========
 */

/**
 * Mostra notificação de sucesso
 * @param {string} mensagem - Mensagem da notificação
 * @param {Object} opcoes - Opções adicionais
 * @returns {string} ID da notificação
 */
function notificacaoSucesso(mensagem, opcoes = {}) {
    return mostrarNotificacao({
        mensagem,
        ...opcoes
    }, 'success');
}

/**
 * Mostra notificação de informação
 * @param {string} mensagem - Mensagem da notificação
 * @param {Object} opcoes - Opções adicionais
 * @returns {string} ID da notificação
 */
function notificacaoInfo(mensagem, opcoes = {}) {
    return mostrarNotificacao({
        mensagem,
        ...opcoes
    }, 'info');
}

/**
 * Mostra notificação de atenção
 * @param {string} mensagem - Mensagem da notificação
 * @param {Object} opcoes - Opções adicionais
 * @returns {string} ID da notificação
 */
function notificacaoAtencao(mensagem, opcoes = {}) {
    return mostrarNotificacao({
        mensagem,
        ...opcoes
    }, 'warning');
}

/**
 * Mostra notificação de erro
 * @param {string} mensagem - Mensagem da notificação
 * @param {Object} opcoes - Opções adicionais
 * @returns {string} ID da notificação
 */
function notificacaoErro(mensagem, opcoes = {}) {
    return mostrarNotificacao({
        mensagem,
        ...opcoes
    }, 'error');
}

/**
 * Mostra notificação crítica
 * @param {string} mensagem - Mensagem da notificação
 * @param {Object} opcoes - Opções adicionais
 * @returns {string} ID da notificação
 */
function notificacaoCritica(mensagem, opcoes = {}) {
    return mostrarNotificacao({
        mensagem,
        persistente: true,
        ...opcoes
    }, 'critical');
}

/**
 * ========== NOTIFICAÇÕES ESPECIAIS ==========
 */

/**
 * Mostra confirmação com botões Sim/Não
 * @param {string} mensagem - Mensagem da confirmação
 * @param {Function} callbackSim - Callback para "Sim"
 * @param {Function} callbackNao - Callback para "Não" (opcional)
 * @returns {string} ID da notificação
 */
function notificacaoConfirmacao(mensagem, callbackSim, callbackNao = null) {
    return mostrarNotificacao({
        mensagem,
        titulo: 'Confirmação',
        icone: '❓',
        persistente: true,
        acoes: [
            {
                texto: 'Sim',
                cor: '#10b981',
                callback: callbackSim
            },
            {
                texto: 'Não',
                cor: '#6b7280',
                callback: callbackNao
            }
        ]
    }, 'info');
}

/**
 * Mostra notificação de loading
 * @param {string} mensagem - Mensagem do loading
 * @returns {string} ID da notificação
 */
function notificacaoLoading(mensagem = 'Carregando...') {
    return mostrarNotificacao({
        mensagem,
        titulo: 'Aguarde',
        icone: '⏳',
        persistente: true
    }, 'info');
}

/**
 * Mostra notificação de progresso
 * @param {string} mensagem - Mensagem do progresso
 * @param {number} porcentagem - Porcentagem (0-100)
 * @returns {string} ID da notificação
 */
function notificacaoProgresso(mensagem, porcentagem = 0) {
    const id = mostrarNotificacao({
        mensagem: `${mensagem} (${porcentagem}%)`,
        titulo: 'Progresso',
        icone: '📊',
        persistente: true
    }, 'info');
    
    // Atualizar barra de progresso personalizada
    setTimeout(() => {
        const notification = document.getElementById(id);
        if (notification) {
            const progressBar = notification.querySelector('.notification-progress');
            if (progressBar) {
                progressBar.style.width = `${porcentagem}%`;
                progressBar.style.transition = 'width 0.3s ease-out';
            }
        }
    }, 100);
    
    return id;
}

/**
 * ========== FUNÇÕES DE CONTROLE ==========
 */

/**
 * Fecha todas as notificações
 */
function fecharTodasNotificacoes() {
    const ids = Array.from(notificacoesAtivas.keys());
    ids.forEach(id => fecharNotificacao(id));
    filaNotificacoes = [];
}

/**
 * Fecha todas as notificações de um tipo específico
 * @param {string} tipo - Tipo das notificações a fechar
 */
function fecharNotificacoesTipo(tipo) {
    notificacoesAtivas.forEach((config, id) => {
        if (config.tipo === tipo) {
            fecharNotificacao(id);
        }
    });
}

/**
 * Atualiza uma notificação existente
 * @param {string} id - ID da notificação
 * @param {Object} novaConfig - Nova configuração
 */
function atualizarNotificacao(id, novaConfig) {
    const notification = document.getElementById(id);
    const config = notificacoesAtivas.get(id);
    
    if (!notification || !config) return;
    
    // Atualizar configuração
    const configAtualizada = { ...config, ...novaConfig };
    notificacoesAtivas.set(id, configAtualizada);
    
    // Atualizar mensagem se fornecida
    if (novaConfig.mensagem) {
        const messageEl = notification.querySelector('.notification-message');
        if (messageEl) {
            messageEl.textContent = novaConfig.mensagem;
        }
    }
    
    // Atualizar título se fornecido
    if (novaConfig.titulo) {
        const titleEl = notification.querySelector('.notification-title');
        if (titleEl) {
            titleEl.textContent = novaConfig.titulo;
        }
    }
}

/**
 * Configura posição das notificações
 * @param {string} posicao - Nova posição ('top-right', 'top-left', etc.)
 */
function configurarPosicao(posicao) {
    if (!CONFIG_NOTIFICACOES.posicoes[posicao]) {
        console.warn('Posição inválida:', posicao);
        return;
    }
    
    CONFIG_NOTIFICACOES.posicaoPadrao = posicao;
    
    if (containerNotificacoes) {
        containerNotificacoes.style.cssText = `
            position: fixed;
            ${CONFIG_NOTIFICACOES.posicoes[posicao]}
            z-index: 10000;
            pointer-events: none;
            max-width: 400px;
            width: 100%;
        `;
    }
}

/**
 * ========== INTEGRAÇÃO COM SISTEMA PRINCIPAL ==========
 */

/**
 * Mostra notificação baseada em resposta da API
 * @param {Object} resposta - Resposta da API/Firebase
 * @param {string} operacao - Nome da operação realizada
 */
function notificacaoResposta(resposta, operacao = 'operação') {
    if (resposta.sucesso || resposta.success) {
        notificacaoSucesso(resposta.mensagem || `${operacao} realizada com sucesso!`);
    } else if (resposta.erro || resposta.error) {
        notificacaoErro(resposta.mensagem || resposta.erro || `Erro ao realizar ${operacao}`);
    } else {
        notificacaoInfo(resposta.mensagem || `${operacao} processada`);
    }
}

/**
 * Mostra notificação de sincronização
 * @param {string} status - Status da sincronização ('syncing', 'synced', 'error', 'offline')
 */
function notificacaoSincronizacao(status) {
    const configs = {
        syncing: { tipo: 'info', mensagem: 'Sincronizando dados...', icone: '🔄' },
        synced: { tipo: 'success', mensagem: 'Dados sincronizados!', icone: '✅' },
        error: { tipo: 'error', mensagem: 'Erro na sincronização', icone: '❌' },
        offline: { tipo: 'warning', mensagem: 'Trabalhando offline', icone: '🔌' }
    };
    
    const config = configs[status];
    if (config) {
        // Fechar notificações anteriores de sincronização
        fecharNotificacoesTipo('sync');
        
        return mostrarNotificacao({
            ...config,
            titulo: 'Sincronização'
        }, config.tipo);
    }
}

/**
 * ========== EXPORTAÇÃO DAS FUNÇÕES ==========
 */

// Se estiver em ambiente de módulos, exportar
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        // Inicialização
        inicializarNotificacoes,
        
        // Funções principais
        mostrarNotificacao,
        fecharNotificacao,
        
        // Tipos específicos
        notificacaoSucesso,
        notificacaoInfo,
        notificacaoAtencao,
        notificacaoErro,
        notificacaoCritica,
        
        // Especiais
        notificacaoConfirmacao,
        notificacaoLoading,
        notificacaoProgresso,
        
        // Controle
        fecharTodasNotificacoes,
        fecharNotificacoesTipo,
        atualizarNotificacao,
        configurarPosicao,
        
        // Integração
        notificacaoResposta,
        notificacaoSincronizacao
    };
}

// Disponibilizar globalmente se não estiver em módulo
if (typeof window !== 'undefined') {
    window.Notifications = {
        inicializar: inicializarNotificacoes,
        mostrar: mostrarNotificacao,
        fechar: fecharNotificacao,
        sucesso: notificacaoSucesso,
        info: notificacaoInfo,
        atencao: notificacaoAtencao,
        erro: notificacaoErro,
        critica: notificacaoCritica,
        confirmacao: notificacaoConfirmacao,
        loading: notificacaoLoading,
        progresso: notificacaoProgresso,
        fecharTodas: fecharTodasNotificacoes,
        fecharTipo: fecharNotificacoesTipo,
        atualizar: atualizarNotificacao,
        posicao: configurarPosicao,
        resposta: notificacaoResposta,
        sincronizacao: notificacaoSincronizacao
    };
    
    // Auto-inicializar quando o DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inicializarNotificacoes);
    } else {
        inicializarNotificacoes();
    }
}

/* ==========================================================================
   FIM DO MÓDULO NOTIFICATIONS - Sistema de Gestão v5.1
   ========================================================================== */ 
