/* ==========================================================================
   FUNÇÕES AUXILIARES CRÍTICAS - Sistema de Gestão v5.2
   Implementação das funções ausentes identificadas na análise
   ========================================================================== */

/**
 * Verifica se os dados foram carregados corretamente
 * CORRIGE: Função dadosCarregados() ausente em state.js e dashboard.js
 */
function dadosCarregados() {
    try {
        if (!dados) {
            console.warn('⚠️ Dados não inicializados');
            return false;
        }
        
        // Verificar estrutura mínima necessária
        const estruturaMinima = ['versao', 'areas', 'eventos'];
        
        for (let campo of estruturaMinima) {
            if (!dados.hasOwnProperty(campo)) {
                console.warn(`⚠️ Campo obrigatório ausente: ${campo}`);
                return false;
            }
        }
        
        // Verificar se há pelo menos uma área
        if (!dados.areas || Object.keys(dados.areas).length === 0) {
            console.warn('⚠️ Nenhuma área cadastrada');
            return false;
        }
        
        console.log('✅ Dados carregados e validados');
        return true;
        
    } catch (error) {
        console.error('❌ Erro ao verificar dados:', error);
        return false;
    }
}

/**
 * Calcula estatísticas completas do sistema
 * CORRIGE: Função obterEstatisticas() ausente em state.js
 */
function obterEstatisticas() {
    try {
        if (!dadosCarregados()) {
            return {
                totalAtividades: 0,
                totalEventos: 0,
                status: { verde: 0, amarelo: 0, vermelho: 0 },
                areas: {}
            };
        }
        
        const stats = {
            totalAtividades: 0,
            totalEventos: Array.isArray(dados.eventos) ? dados.eventos.length : 0,
            status: { verde: 0, amarelo: 0, vermelho: 0 },
            areas: {},
            ultima_atualizacao: new Date().toISOString()
        };
        
        // Processar cada área
        Object.entries(dados.areas).forEach(([areaKey, area]) => {
            const statsArea = {
                nome: area.nome,
                totalAtividades: area.atividades?.length || 0,
                status: { verde: 0, amarelo: 0, vermelho: 0 }
            };
            
            // Processar atividades da área
            area.atividades?.forEach(atividade => {
                stats.totalAtividades++;
                
                const status = atividade.status || 'verde';
                stats.status[status]++;
                statsArea.status[status]++;
            });
            
            stats.areas[areaKey] = statsArea;
        });
        
        console.log('📊 Estatísticas calculadas:', stats);
        return stats;
        
    } catch (error) {
        console.error('❌ Erro ao calcular estatísticas:', error);
        return {
            totalAtividades: 0,
            totalEventos: 0,
            status: { verde: 0, amarelo: 0, vermelho: 0 },
            areas: {},
            erro: error.message
        };
    }
}

/**
 * Sistema de notificações padronizado
 * CORRIGE: Sistema de notificações inconsistente
 */
const SistemaNotificacoes = {
    mostrar(mensagem, tipo = 'info', duracao = 4000) {
        const container = document.getElementById('notification');
        const texto = document.getElementById('notificationText');
        
        if (!container || !texto) {
            console.log(`${tipo.toUpperCase()}: ${mensagem}`);
            return;
        }
        
        const icones = {
            success: '✅',
            error: '❌', 
            warning: '⚠️',
            info: 'ℹ️'
        };
        
        texto.innerHTML = `${icones[tipo] || 'ℹ️'} ${mensagem}`;
        container.className = `notification ${tipo} show`;
        
        setTimeout(() => {
            container.classList.remove('show');
        }, duracao);
    },
    
    sucesso(mensagem, duracao) { this.mostrar(mensagem, 'success', duracao); },
    erro(mensagem, duracao) { this.mostrar(mensagem, 'error', duracao); },
    aviso(mensagem, duracao) { this.mostrar(mensagem, 'warning', duracao); },
    info(mensagem, duracao) { this.mostrar(mensagem, 'info', duracao); }
};

/**
 * Funções auxiliares adicionais
 */
if (typeof calcularDiasRestantes === 'undefined') {
    function calcularDiasRestantes(prazo) {
        try {
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);
            const dataPrazo = new Date(prazo + 'T00:00:00');
            dataPrazo.setHours(0, 0, 0, 0);
            return Math.floor((dataPrazo - hoje) / (1000 * 60 * 60 * 24));
        } catch (error) {
            console.error('Erro ao calcular dias restantes:', error);
            return 0;
        }
    }
}

if (typeof formatarData === 'undefined') {
    function formatarData(data) {
        try {
            if (!data) return '';
            const dataObj = new Date(data + 'T00:00:00');
            return dataObj.toLocaleDateString('pt-BR');
        } catch (error) {
            console.error('Erro ao formatar data:', error);
            return data;
        }
    }
}

/**
 * Exportação global
 */
if (typeof window !== 'undefined') {
    window.dadosCarregados = dadosCarregados;
    window.obterEstatisticas = obterEstatisticas;
    window.Notifications = SistemaNotificacoes;
    window.mostrarNotificacao = SistemaNotificacoes.mostrar.bind(SistemaNotificacoes);
    window.calcularDiasRestantes = calcularDiasRestantes;
    window.formatarData = formatarData;
    
    console.log('✅ Funções auxiliares carregadas:', [
        'dadosCarregados()',
        'obterEstatisticas()', 
        'SistemaNotificacoes',
        'calcularDiasRestantes()',
        'formatarData()'
    ]);
}
