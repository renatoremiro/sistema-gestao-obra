 /* ==========================================================================
   MÓDULO DASHBOARD - Sistema de Gestão v5.1
   ========================================================================== */

/**
 * Módulo responsável por todas as funcionalidades do dashboard principal
 * Inclui estatísticas, áreas, busca, filtros e navegação
 */

/**
 * Cache do dashboard para performance
 */
let cacheDashboard = {
    ultimaAtualizacao: null,
    estatisticas: null,
    areas: null,
    timeout: null
};

/**
 * Configurações do dashboard
 */
const DASHBOARD_CONFIG = {
    intervaloAtualizacao: 30000, // 30 segundos
    animacoesPadrao: true,
    cacheTimeout: 60000, // 1 minuto
    maxResultadosBusca: 50,
    debounceTimeout: 300 // 300ms para busca
};

/**
 * Renderiza o dashboard principal
 */
function renderizarDashboard() {
    try {
        console.log('🎨 Renderizando dashboard principal...');
        
        if (!dadosCarregados()) {
            console.warn('⚠️ Dados não carregados - não é possível renderizar dashboard');
            return false;
        }

        // Limpar cache se muito antigo
        verificarCacheDashboard();

        // Renderizar componentes em sequência otimizada
        atualizarDataAtual();
        atualizarInformacoesUsuario();
        renderizarAreas();
        atualizarEstatisticas();
        preencherSelectResponsaveis();
        
        // Componentes que dependem de dados externos
        if (typeof gerarCalendario === 'function') {
            gerarCalendario();
        }
        
        // Marcar dashboard como ativo
        mostrarDashboard();
        
        // Atualizar cache
        cacheDashboard.ultimaAtualizacao = new Date();
        
        console.log('✅ Dashboard renderizado com sucesso');
        return true;
        
    } catch (error) {
        console.error('❌ Erro ao renderizar dashboard:', error);
        mostrarErroDashboard(error);
        return false;
    }
}

/**
 * Verifica e limpa cache antigo
 */
function verificarCacheDashboard() {
    const agora = new Date();
    
    if (cacheDashboard.ultimaAtualizacao && 
        (agora - cacheDashboard.ultimaAtualizacao) > DASHBOARD_CONFIG.cacheTimeout) {
        
        console.log('🧹 Limpando cache do dashboard...');
        cacheDashboard = {
            ultimaAtualizacao: null,
            estatisticas: null,
            areas: null,
            timeout: null
        };
    }
}

/**
 * Atualiza informações do usuário na interface
 */
function atualizarInformacoesUsuario() {
    try {
        const usuarioInfo = document.getElementById('usuarioInfo');
        
        if (usuarioInfo && estadoSistema?.usuarioNome) {
            usuarioInfo.textContent = `👤 ${estadoSistema.usuarioNome}`;
        }
        
        // Atualizar versão do sistema
        const versaoElements = document.querySelectorAll('.versao-sistema');
        versaoElements.forEach(el => {
            el.textContent = `v${estadoSistema?.versaoSistema || '5.1'}`;
        });
        
    } catch (error) {
        console.warn('⚠️ Erro ao atualizar informações do usuário:', error);
    }
}

/**
 * Renderiza os cards das áreas
 */
function renderizarAreas() {
    const grid = document.getElementById('areasGrid');
    if (!grid || !dados?.areas) {
        console.warn('⚠️ Grid de áreas ou dados não encontrados');
        return false;
    }

    try {
        // Usar cache se disponível e válido
        if (cacheDashboard.areas && cacheDashboard.ultimaAtualizacao) {
            grid.innerHTML = cacheDashboard.areas;
            return true;
        }

        grid.innerHTML = '';
        let htmlAreas = '';

        Object.entries(dados.areas).forEach(([key, area]) => {
            const statusCount = contarStatus(area.atividades || []);
            const totalAtividades = area.atividades?.length || 0;
            const progressoGeral = calcularProgressoArea(area);
            
            // Verificar se há atividades novas (últimas 24h)
            const atividadesNovas = contarAtividadesNovas(area.atividades || []);
            
            htmlAreas += `
                <div class="card area-card" onclick="mostrarArea('${key}')" data-area="${key}">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                        <h3 style="margin: 0; color: var(--text-primary);">${area.nome}</h3>
                        <div style="width: 20px; height: 20px; background: ${area.cor}; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"></div>
                    </div>
                    
                    <p style="color: var(--text-secondary); margin-bottom: 16px; font-size: 14px;">
                        <strong>Coord:</strong> ${area.coordenador}
                    </p>
                    
                    <div style="margin-bottom: 16px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <span style="font-size: 12px; color: var(--text-secondary);">Progresso Geral</span>
                            <span style="font-size: 12px; font-weight: bold; color: ${progressoGeral >= 70 ? 'var(--color-success)' : progressoGeral >= 40 ? 'var(--color-warning)' : 'var(--color-danger)'};">
                                ${progressoGeral}%
                            </span>
                        </div>
                        <div class="progress-bar" style="height: 6px; margin-bottom: 12px;">
                            <div class="progress-fill" style="width: ${progressoGeral}%; background: ${progressoGeral >= 70 ? 'var(--color-success)' : progressoGeral >= 40 ? 'var(--color-warning)' : 'var(--color-danger)'};"></div>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 16px;">
                        <div style="display: flex; align-items: center; margin-bottom: 6px;">
                            <span class="status-indicator status-verde"></span>
                            <span style="font-size: 14px;">Em dia: <strong>${statusCount.verde}</strong></span>
                        </div>
                        <div style="display: flex; align-items: center; margin-bottom: 6px;">
                            <span class="status-indicator status-amarelo"></span>
                            <span style="font-size: 14px;">Atenção: <strong>${statusCount.amarelo}</strong></span>
                        </div>
                        <div style="display: flex; align-items: center; margin-bottom: 6px;">
                            <span class="status-indicator status-vermelho"></span>
                            <span style="font-size: 14px;">Atraso: <strong>${statusCount.vermelho}</strong></span>
                        </div>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center; font-size: 13px; color: var(--text-secondary);">
                        <span>👥 ${area.equipe?.length || 0} pessoas</span>
                        <span>📋 ${totalAtividades} atividades</span>
                        ${atividadesNovas > 0 ? `<span style="background: var(--color-success); color: white; padding: 2px 6px; border-radius: 10px; font-size: 11px;">${atividadesNovas} novo${atividadesNovas > 1 ? 's' : ''}</span>` : ''}
                    </div>
                    
                    <p style="color: var(--color-primary); font-weight: 500; margin-top: 12px; margin-bottom: 0; text-align: center;">
                        Ver detalhes →
                    </p>
                </div>
            `;
        });

        grid.innerHTML = htmlAreas;
        
        // Salvar no cache
        cacheDashboard.areas = htmlAreas;
        
        // Aplicar animações se habilitadas
        if (DASHBOARD_CONFIG.animacoesPadrao) {
            aplicarAnimacoesAreas();
        }
        
        console.log('✅ Áreas renderizadas com sucesso');
        return true;
        
    } catch (error) {
        console.error('❌ Erro ao renderizar áreas:', error);
        grid.innerHTML = '<div class="card"><p style="text-align: center; color: var(--color-danger);">Erro ao carregar áreas</p></div>';
        return false;
    }
}

/**
 * Conta status das atividades de uma área
 */
function contarStatus(atividades) {
    return atividades.reduce((acc, atividade) => {
        const status = atividade.status || 'verde';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, { verde: 0, amarelo: 0, vermelho: 0 });
}

/**
 * Calcula progresso geral de uma área
 */
function calcularProgressoArea(area) {
    if (!area.atividades || area.atividades.length === 0) {
        return 0;
    }
    
    const progressoTotal = area.atividades.reduce((total, atividade) => {
        return total + (atividade.progresso || 0);
    }, 0);
    
    return Math.round(progressoTotal / area.atividades.length);
}

/**
 * Conta atividades novas (últimas 24h)
 */
function contarAtividadesNovas(atividades) {
    const agora = new Date();
    const limite24h = 24 * 60 * 60 * 1000;
    
    return atividades.filter(atividade => {
        if (!atividade.dataAdicionado) return false;
        
        const dataAdicionado = new Date(atividade.dataAdicionado);
        return (agora - dataAdicionado) <= limite24h;
    }).length;
}

/**
 * Aplica animações nos cards das áreas
 */
function aplicarAnimacoesAreas() {
    const cards = document.querySelectorAll('.area-card');
    
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.3s ease-out';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

/**
 * Atualiza estatísticas do dashboard
 */
function atualizarEstatisticas() {
    if (!dados?.areas) {
        console.warn('⚠️ Dados não disponíveis para estatísticas');
        return false;
    }

    try {
        // Usar cache se válido
        if (cacheDashboard.estatisticas && cacheDashboard.ultimaAtualizacao) {
            aplicarEstatisticasNaInterface(cacheDashboard.estatisticas);
            return true;
        }

        let totalVerde = 0, totalAmarelo = 0, totalVermelho = 0;
        let totalAtividades = 0;
        let atividadesUrgentes = 0;
        let atividadesAtrasadas = 0;

        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        Object.values(dados.areas).forEach(area => {
            area.atividades?.forEach(atividade => {
                totalAtividades++;
                
                const count = contarStatus([atividade]);
                totalVerde += count.verde;
                totalAmarelo += count.amarelo;
                totalVermelho += count.vermelho;
                
                // Verificar urgência
                if (atividade.prazo) {
                    const prazoData = new Date(atividade.prazo);
                    prazoData.setHours(0, 0, 0, 0);
                    const diasRestantes = Math.floor((prazoData - hoje) / (1000 * 60 * 60 * 24));
                    
                    if (diasRestantes < 0) {
                        atividadesAtrasadas++;
                    } else if (diasRestantes <= 3) {
                        atividadesUrgentes++;
                    }
                }
            });
        });

        // Calcular eventos do mês atual
        const eventosDoMes = calcularEventosDoMes();
        
        const estatisticas = {
            totalVerde,
            totalAmarelo,
            totalVermelho,
            totalAtividades,
            atividadesUrgentes,
            atividadesAtrasadas,
            eventosDoMes,
            percentualConclusao: totalAtividades > 0 ? Math.round((totalVerde / totalAtividades) * 100) : 0
        };

        // Aplicar na interface
        aplicarEstatisticasNaInterface(estatisticas);
        
        // Salvar no cache
        cacheDashboard.estatisticas = estatisticas;
        
        console.log('📊 Estatísticas atualizadas:', estatisticas);
        return true;
        
    } catch (error) {
        console.error('❌ Erro ao atualizar estatísticas:', error);
        return false;
    }
}

/**
 * Aplica estatísticas na interface
 */
function aplicarEstatisticasNaInterface(stats) {
    // Estatísticas principais
    const elementos = {
        'statEmDia': stats.totalVerde,
        'statAtencao': stats.totalAmarelo,
        'statAtraso': stats.totalVermelho,
        'statEventos': stats.eventosDoMes
    };

    Object.entries(elementos).forEach(([id, valor]) => {
        const elemento = document.getElementById(id);
        if (elemento) {
            // Animação de contagem
            animarContador(elemento, valor);
        }
    });

    // Barras de progresso
    const total = stats.totalVerde + stats.totalAmarelo + stats.totalVermelho;
    if (total > 0) {
        atualizarBarraProgresso('progressEmDia', stats.totalVerde, total, 'var(--color-success)');
        atualizarBarraProgresso('progressAtencao', stats.totalAmarelo, total, 'var(--color-warning)');
        atualizarBarraProgresso('progressAtraso', stats.totalVermelho, total, 'var(--color-danger)');
    }
}

/**
 * Anima contador de número
 */
function animarContador(elemento, valorFinal) {
    const valorAtual = parseInt(elemento.textContent) || 0;
    const incremento = Math.max(1, Math.ceil(Math.abs(valorFinal - valorAtual) / 10));
    
    let valor = valorAtual;
    const interval = setInterval(() => {
        if (valor < valorFinal) {
            valor = Math.min(valor + incremento, valorFinal);
        } else if (valor > valorFinal) {
            valor = Math.max(valor - incremento, valorFinal);
        } else {
            clearInterval(interval);
            return;
        }
        
        elemento.textContent = valor;
    }, 50);
}

/**
 * Atualiza barra de progresso
 */
function atualizarBarraProgresso(id, valor, total, cor) {
    const elemento = document.getElementById(id);
    if (elemento) {
        const percentual = Math.round((valor / total) * 100);
        elemento.style.width = `${percentual}%`;
        elemento.style.background = cor;
        elemento.style.transition = 'width 0.8s ease-out';
    }
}

/**
 * Calcula eventos do mês atual
 */
function calcularEventosDoMes() {
    if (!dados?.eventos) return 0;
    
    const mesAtual = estadoSistema?.mesAtual ?? new Date().getMonth();
    const anoAtual = estadoSistema?.anoAtual ?? new Date().getFullYear();
    
    const eventosUnicos = new Set();
    
    // Verificar cada dia do mês
    const ultimoDia = new Date(anoAtual, mesAtual + 1, 0).getDate();
    
    for (let dia = 1; dia <= ultimoDia; dia++) {
        const data = `${anoAtual}-${String(mesAtual + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
        
        if (typeof obterEventosDoDia === 'function') {
            const eventosDia = obterEventosDoDia(data);
            eventosDia.forEach(evento => {
                const key = `${evento.id}_${evento.titulo}`;
                eventosUnicos.add(key);
            });
        }
    }
    
    return eventosUnicos.size;
}

/**
 * Preenche select de responsáveis/pessoas
 */
function preencherSelectResponsaveis() {
    const selects = ['eventoPessoas', 'atividadeResponsaveis'];
    
    selects.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (!select || !dados?.areas) return;
        
        // Limpar opções existentes
        select.innerHTML = '<option value="">Selecionar pessoa...</option>';
        
        // Coletar todos os membros únicos
        const membrosUnicos = new Map();
        
        Object.values(dados.areas).forEach(area => {
            area.equipe?.forEach(membro => {
                if (!membrosUnicos.has(membro.nome)) {
                    membrosUnicos.set(membro.nome, {
                        nome: membro.nome,
                        cargo: membro.cargo,
                        areas: [area.nome]
                    });
                } else {
                    const membroExistente = membrosUnicos.get(membro.nome);
                    if (!membroExistente.areas.includes(area.nome)) {
                        membroExistente.areas.push(area.nome);
                    }
                }
            });
        });
        
        // Adicionar opção "Toda Equipe" se for select de eventos
        if (selectId === 'eventoPessoas') {
            const optionTodos = document.createElement('option');
            optionTodos.value = '_todos';
            optionTodos.textContent = '🌐 Toda Equipe';
            select.appendChild(optionTodos);
        }
        
        // Adicionar membros ordenados
        Array.from(membrosUnicos.values())
            .sort((a, b) => a.nome.localeCompare(b.nome))
            .forEach(membro => {
                const option = document.createElement('option');
                option.value = membro.nome;
                option.textContent = `${membro.nome} - ${membro.cargo}`;
                option.title = `Áreas: ${membro.areas.join(', ')}`;
                select.appendChild(option);
            });
    });
}

/**
 * Atualiza data atual na interface
 */
function atualizarDataAtual() {
    const elementoData = document.getElementById('dataAtual');
    if (elementoData) {
        const hoje = new Date();
        const opcoes = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        elementoData.textContent = hoje.toLocaleDateString('pt-BR', opcoes);
    }
    
    // Atualizar mês/ano no cabeçalho do calendário
    const elementoMesAno = document.getElementById('mesAno');
    if (elementoMesAno) {
        const meses = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        
        const mes = estadoSistema?.mesAtual ?? new Date().getMonth();
        const ano = estadoSistema?.anoAtual ?? new Date().getFullYear();
        
        elementoMesAno.textContent = `${meses[mes]} ${ano}`;
    }
}

/**
 * Mostra dashboard (esconde outras telas)
 */
function mostrarDashboard() {
    const telas = ['dashboardExecutivo', 'painelArea', 'agendaIndividual'];
    
    telas.forEach(telaId => {
        const tela = document.getElementById(telaId);
        if (tela) {
            if (telaId === 'dashboardExecutivo') {
                tela.classList.remove('hidden');
            } else {
                tela.classList.add('hidden');
            }
        }
    });
    
    // Esconder breadcrumb
    const breadcrumb = document.getElementById('breadcrumb');
    if (breadcrumb) {
        breadcrumb.classList.add('hidden');
    }
    
    // Limpar estado de navegação
    if (estadoSistema) {
        estadoSistema.areaAtual = null;
        estadoSistema.pessoaAtual = null;
    }
}

/**
 * Mostra erro no dashboard
 */
function mostrarErroDashboard(erro) {
    const grid = document.getElementById('areasGrid');
    if (grid) {
        grid.innerHTML = `
            <div class="card" style="grid-column: span 3; text-align: center; padding: 40px;">
                <div style="font-size: 48px; margin-bottom: 20px;">⚠️</div>
                <h3 style="color: var(--color-danger); margin-bottom: 16px;">Erro no Dashboard</h3>
                <p style="color: var(--text-secondary); margin-bottom: 20px;">
                    Ocorreu um erro ao carregar o dashboard. Tente recarregar a página.
                </p>
                <button class="btn btn-primary" onclick="window.location.reload()">
                    🔄 Recarregar Página
                </button>
                <details style="margin-top: 20px; text-align: left;">
                    <summary style="cursor: pointer; color: var(--text-secondary);">Detalhes técnicos</summary>
                    <pre style="background: var(--bg-tertiary); padding: 12px; border-radius: 6px; font-size: 12px; margin-top: 8px; overflow: auto;">
${erro.message}
${erro.stack}
                    </pre>
                </details>
            </div>
        `;
    }
}

/**
 * Atualização automática do dashboard
 */
function iniciarAtualizacaoAutomatica() {
    if (cacheDashboard.timeout) {
        clearInterval(cacheDashboard.timeout);
    }
    
    cacheDashboard.timeout = setInterval(() => {
        if (document.getElementById('dashboardExecutivo')?.classList.contains('hidden') === false) {
            console.log('🔄 Atualização automática do dashboard...');
            atualizarEstatisticas();
        }
    }, DASHBOARD_CONFIG.intervaloAtualizacao);
    
    console.log(`⏰ Atualização automática configurada (${DASHBOARD_CONFIG.intervaloAtualizacao}ms)`);
}

/**
 * Para atualização automática
 */
function pararAtualizacaoAutomatica() {
    if (cacheDashboard.timeout) {
        clearInterval(cacheDashboard.timeout);
        cacheDashboard.timeout = null;
        console.log('⏹️ Atualização automática parada');
    }
}

/**
 * Força atualização completa do dashboard
 */
function forcarAtualizacaoDashboard() {
    console.log('🔄 Forçando atualização completa do dashboard...');
    
    // Limpar cache
    cacheDashboard = {
        ultimaAtualizacao: null,
        estatisticas: null,
        areas: null,
        timeout: cacheDashboard.timeout
    };
    
    // Re-renderizar
    return renderizarDashboard();
}

/**
 * Exporta estatísticas do dashboard
 */
function exportarEstatisticasDashboard() {
    if (!dados) return null;
    
    const estatisticas = obterEstatisticas();
    const timestamp = new Date().toISOString();
    
    const relatorio = {
        timestamp,
        sistema: {
            versao: estadoSistema?.versaoSistema || '5.1',
            usuario: estadoSistema?.usuarioNome || 'Desconhecido'
        },
        resumo: estatisticas,
        areas: Object.entries(dados.areas).map(([key, area]) => ({
            id: key,
            nome: area.nome,
            coordenador: area.coordenador,
            equipe: area.equipe?.length || 0,
            atividades: area.atividades?.length || 0,
            progresso: calcularProgressoArea(area),
            status: contarStatus(area.atividades || [])
        })),
        eventos: {
            total: dados.eventos?.length || 0,
            doMes: calcularEventosDoMes()
        }
    };
    
    return relatorio;
}

/**
 * Exposição global para compatibilidade
 */
if (typeof window !== 'undefined') {
    window.renderizarDashboard = renderizarDashboard;
    window.atualizarEstatisticas = atualizarEstatisticas;
    window.forcarAtualizacaoDashboard = forcarAtualizacaoDashboard;
    window.exportarEstatisticasDashboard = exportarEstatisticasDashboard;
    window.iniciarAtualizacaoAutomatica = iniciarAtualizacaoAutomatica;
    window.pararAtualizacaoAutomatica = pararAtualizacaoAutomatica;
    window.atualizarDataAtual = atualizarDataAtual;
    window.preencherSelectResponsaveis = preencherSelectResponsaveis;
    window.mostrarDashboard = mostrarDashboard;
    window.contarStatus = contarStatus;
}

console.log('✅ Módulo dashboard.js carregado com sucesso');
