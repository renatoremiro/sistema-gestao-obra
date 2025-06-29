 /* ==========================================================================
   MÓDULO CALENDÁRIO - Sistema de Gestão v5.1
   ========================================================================== */

/**
 * Módulo responsável por todas as funcionalidades do calendário
 * Inclui eventos, recorrências, feriados, navegação e timeline
 */

/**
 * Cache do calendário para performance
 */
let cacheCalendario = {
    mesAtual: null,
    anoAtual: null,
    eventos: null,
    feriados: null,
    htmlCalendario: null,
    ultimaAtualizacao: null
};

/**
 * Configurações do calendário
 */
const CALENDARIO_CONFIG = {
    diasSemana: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
    meses: [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ],
    cacheTimeout: 60000, // 1 minuto
    maxEventosPorDia: 8,
    animacoesPadrao: true,
    mostrarTooltips: true,
    permitirEdicao: true
};

/**
 * Gera e renderiza o calendário principal
 */
function gerarCalendario() {
    try {
        console.log('📅 Gerando calendário...');
        
        const container = document.getElementById('calendario');
        if (!container) {
            console.warn('⚠️ Container do calendário não encontrado');
            return false;
        }

        const mesAtual = estadoSistema?.mesAtual ?? new Date().getMonth();
        const anoAtual = estadoSistema?.anoAtual ?? new Date().getFullYear();

        // Verificar cache
        if (verificarCacheCalendario(mesAtual, anoAtual)) {
            container.innerHTML = cacheCalendario.htmlCalendario;
            aplicarEventosCalendario();
            return true;
        }

        // Limpar container
        container.innerHTML = '';
        
        let htmlCalendario = '';

        // Headers dos dias da semana
        CALENDARIO_CONFIG.diasSemana.forEach(dia => {
            htmlCalendario += `<div class="dia-header">${dia}</div>`;
        });

        // Calcular datas do mês
        const primeiroDia = new Date(anoAtual, mesAtual, 1);
        const ultimoDia = new Date(anoAtual, mesAtual + 1, 0);
        const primeiroDiaSemana = primeiroDia.getDay();
        const totalDias = ultimoDia.getDate();

        // Dias do mês anterior (para completar semana)
        const mesAnterior = new Date(anoAtual, mesAtual - 1, 0);
        for (let i = primeiroDiaSemana - 1; i >= 0; i--) {
            const dia = mesAnterior.getDate() - i;
            htmlCalendario += criarCelulaDia(dia, mesAtual - 1, anoAtual, 'outro-mes');
        }

        // Dias do mês atual
        for (let dia = 1; dia <= totalDias; dia++) {
            const classes = [];
            
            // Verificar se é hoje
            const hoje = new Date();
            if (anoAtual === hoje.getFullYear() && 
                mesAtual === hoje.getMonth() && 
                dia === hoje.getDate()) {
                classes.push('hoje');
            }
            
            htmlCalendario += criarCelulaDia(dia, mesAtual, anoAtual, classes.join(' '));
        }

        // Dias do próximo mês (para completar semana)
        const diasRestantes = 42 - (primeiroDiaSemana + totalDias); // 6 semanas * 7 dias
        for (let dia = 1; dia <= diasRestantes; dia++) {
            htmlCalendario += criarCelulaDia(dia, mesAtual + 1, anoAtual, 'outro-mes');
        }

        container.innerHTML = htmlCalendario;

        // Aplicar eventos aos dias
        aplicarEventosCalendario();

        // Atualizar cabeçalho do calendário
        atualizarCabecalhoCalendario(mesAtual, anoAtual);

        // Atualizar timeline
        if (typeof atualizarTimeline === 'function') {
            atualizarTimeline();
        }

        // Salvar no cache
        salvarCacheCalendario(mesAtual, anoAtual, htmlCalendario);

        // Aplicar animações
        if (CALENDARIO_CONFIG.animacoesPadrao) {
            animarCalendario();
        }

        console.log('✅ Calendário gerado com sucesso');
        return true;

    } catch (error) {
        console.error('❌ Erro ao gerar calendário:', error);
        mostrarErroCalendario(error);
        return false;
    }
}

/**
 * Cria uma célula de dia do calendário
 */
function criarCelulaDia(dia, mes, ano, classes = '') {
    const dataCompleta = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    const feriado = dados?.feriados?.[dataCompleta];
    
    let classesCompletas = `dia ${classes}`;
    if (feriado) {
        classesCompletas += ' dia-feriado';
    }

    let htmlDia = `<div class="${classesCompletas}" data-data="${dataCompleta}">`;
    
    // Número do dia e feriado
    htmlDia += `<div class="dia-numero">`;
    htmlDia += `<span>${dia}</span>`;
    if (feriado) {
        htmlDia += `<span class="feriado-label" title="${feriado}">Feriado</span>`;
    }
    htmlDia += `</div>`;
    
    htmlDia += `</div>`;
    
    return htmlDia;
}

/**
 * Aplica eventos aos dias do calendário
 */
function aplicarEventosCalendario() {
    const dias = document.querySelectorAll('.dia[data-data]');
    
    dias.forEach(diaElement => {
        const data = diaElement.dataset.data;
        if (!data) return;

        // Obter eventos do dia
        const eventosConflitos = obterEventosDoDia(data);
        
        // Limpar eventos existentes
        const eventosExistentes = diaElement.querySelectorAll('.evento');
        eventosExistentes.forEach(evento => evento.remove());

        // Adicionar eventos
        eventosConflitos.forEach((evento, index) => {
            if (index < CALENDARIO_CONFIG.maxEventosPorDia) {
                const eventoElement = criarElementoEvento(evento, data);
                diaElement.appendChild(eventoElement);
            }
        });

        // Indicador de mais eventos
        if (eventosConflitos.length > CALENDARIO_CONFIG.maxEventosPorDia) {
            const maisEventos = document.createElement('div');
            maisEventos.className = 'evento evento-mais';
            maisEventos.textContent = `+${eventosConflitos.length - CALENDARIO_CONFIG.maxEventosPorDia} mais`;
            maisEventos.onclick = (e) => {
                e.stopPropagation();
                mostrarEventosDia(data, eventosConflitos);
            };
            diaElement.appendChild(maisEventos);
        }

        // Click handler do dia
        diaElement.onclick = (e) => {
            if (e.target === diaElement || e.target.closest('.dia-numero')) {
                abrirNovoEvento(data);
            }
        };
    });
}

/**
 * Cria elemento visual de um evento
 */
function criarElementoEvento(evento, data) {
    const eventoDiv = document.createElement('div');
    const classes = ['evento', `evento-${evento.tipo}`];
    
    // Classes especiais
    if (evento.diaCompleto) classes.push('evento-dia-completo');
    if (evento.dataFim && evento.data !== evento.dataFim) classes.push('evento-multi-dia');
    if (evento.recorrencia) classes.push('evento-recorrente');
    
    eventoDiv.className = classes.join(' ');
    
    // Ícone do tipo
    const icones = {
        reuniao: '📅',
        entrega: '📦',
        prazo: '⏰',
        marco: '🎯',
        outro: '📌'
    };
    
    const icone = icones[evento.tipo] || icones.outro;
    
    // Conteúdo do evento
    let htmlEvento = `
        <div class="evento-header">
            <span>${icone} ${evento.diaCompleto ? 'Dia todo' : evento.horarioInicio || ''}</span>
            ${evento.recorrencia ? '<span class="recorrente-indicator">🔄</span>' : ''}
        </div>
        <div class="evento-titulo">${evento.titulo}</div>
    `;
    
    // Informações adicionais
    if (evento.pessoas && evento.pessoas.length > 0) {
        const labelPessoas = evento.tipo === 'reuniao' ? '👥' : '👤';
        htmlEvento += `<div class="evento-info">${labelPessoas} ${evento.pessoas.length}</div>`;
    }
    
    if (evento.local && evento.tipo === 'reuniao') {
        htmlEvento += `<div class="evento-info">📍 ${truncarTexto(evento.local, 15)}</div>`;
    }
    
    if (evento.horarioFim && !evento.diaCompleto) {
        htmlEvento += `<div class="evento-duracao">até ${evento.horarioFim}</div>`;
    }
    
    eventoDiv.innerHTML = htmlEvento;
    
    // Tooltip
    if (CALENDARIO_CONFIG.mostrarTooltips) {
        adicionarTooltipEvento(eventoDiv, evento);
    }
    
    // Event handlers
    eventoDiv.onclick = (e) => {
        e.stopPropagation();
        if (CALENDARIO_CONFIG.permitirEdicao) {
            editarEvento(evento);
        }
    };
    
    // Botão de exclusão (apenas no hover)
    if (CALENDARIO_CONFIG.permitirEdicao) {
        const deleteBtn = document.createElement('span');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '×';
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            confirmarExclusaoEvento(evento);
        };
        eventoDiv.appendChild(deleteBtn);
    }
    
    return eventoDiv;
}

/**
 * Adiciona tooltip ao evento
 */
function adicionarTooltipEvento(elemento, evento) {
    const tooltip = document.createElement('div');
    tooltip.className = 'evento-tooltip';
    
    let conteudoTooltip = `<strong>${evento.titulo}</strong>`;
    if (evento.descricao) {
        conteudoTooltip += `<br>${evento.descricao}`;
    }
    
    conteudoTooltip += `<br><strong>Tipo:</strong> ${evento.tipo}`;
    
    if (evento.local) {
        conteudoTooltip += `<br><strong>Local:</strong> ${evento.local}`;
    }
    
    if (evento.pessoas && evento.pessoas.length > 0) {
        conteudoTooltip += `<br><strong>Pessoas:</strong> ${evento.pessoas.join(', ')}`;
    }
    
    if (evento.recorrencia) {
        conteudoTooltip += `<br><strong>Recorrência:</strong> ${evento.recorrencia.tipo}`;
    }
    
    tooltip.innerHTML = conteudoTooltip;
    elemento.appendChild(tooltip);
}

/**
 * Obtém eventos de um dia específico
 */
function obterEventosDoDia(data) {
    if (!dados?.eventos) return [];
    
    const dataObj = new Date(data + 'T00:00:00');
    const eventos = [];
    
    dados.eventos.forEach(evento => {
        // Evento direto na data
        if (evento.data === data) {
            eventos.push(evento);
            return;
        }
        
        // Evento de múltiplos dias
        if (evento.dataFim) {
            const inicio = new Date(evento.data + 'T00:00:00');
            const fim = new Date(evento.dataFim + 'T00:00:00');
            
            if (dataObj >= inicio && dataObj <= fim) {
                eventos.push({ ...evento, continuacao: true });
            }
            return;
        }
        
        // Evento recorrente
        if (evento.recorrencia) {
            if (verificarRecorrencia(evento, data)) {
                eventos.push({ ...evento, recorrente: true });
            }
        }
    });
    
    // Ordenar por horário
    return eventos.sort((a, b) => {
        const horaA = a.diaCompleto ? '00:00' : (a.horarioInicio || '00:00');
        const horaB = b.diaCompleto ? '00:00' : (b.horarioInicio || '00:00');
        return horaA.localeCompare(horaB);
    });
}

/**
 * Verifica se evento recorrente ocorre em data específica
 */
function verificarRecorrencia(evento, data) {
    if (!evento.recorrencia) return false;
    
    const dataEvento = new Date(evento.data + 'T00:00:00');
    const dataVerificar = new Date(data + 'T00:00:00');
    
    // Não pode ser antes da data original
    if (dataVerificar < dataEvento) return false;
    
    // Verificar fim da recorrência
    if (evento.recorrencia.fim) {
        const fimRecorrencia = new Date(evento.recorrencia.fim + 'T00:00:00');
        if (dataVerificar > fimRecorrencia) return false;
    }
    
    const tipo = evento.recorrencia.tipo;
    
    switch (tipo) {
        case 'diaria':
            return true;
            
        case 'semanal':
            const diaSemana = dataVerificar.getDay();
            return evento.recorrencia.diasSemana?.includes(diaSemana) || false;
            
        case 'quinzenal':
            const diffDias = Math.floor((dataVerificar - dataEvento) / (1000 * 60 * 60 * 24));
            return diffDias % 14 === 0 && dataVerificar.getDay() === dataEvento.getDay();
            
        case 'mensal':
            return dataEvento.getDate() === dataVerificar.getDate();
            
        case 'bimestral':
            const mesesDiff = (dataVerificar.getFullYear() - dataEvento.getFullYear()) * 12 + 
                              (dataVerificar.getMonth() - dataEvento.getMonth());
            return mesesDiff % 2 === 0 && dataEvento.getDate() === dataVerificar.getDate();
            
        default:
            return false;
    }
}

/**
 * Navegação do calendário
 */
function mudarMes(direcao) {
    if (!estadoSistema) return false;
    
    estadoSistema.mesAtual += direcao;
    
    if (estadoSistema.mesAtual < 0) {
        estadoSistema.mesAtual = 11;
        estadoSistema.anoAtual--;
    } else if (estadoSistema.mesAtual > 11) {
        estadoSistema.mesAtual = 0;
        estadoSistema.anoAtual++;
    }
    
    // Limpar cache para forçar regeneração
    limparCacheCalendario();
    
    // Regenerar calendário
    gerarCalendario();
    
    // Atualizar estatísticas se necessário
    if (typeof atualizarEstatisticas === 'function') {
        atualizarEstatisticas();
    }
    
    console.log(`📅 Navegação: ${CALENDARIO_CONFIG.meses[estadoSistema.mesAtual]} ${estadoSistema.anoAtual}`);
    return true;
}

/**
 * Atualiza cabeçalho do calendário
 */
function atualizarCabecalhoCalendario(mes, ano) {
    const elementoMesAno = document.getElementById('mesAno');
    if (elementoMesAno) {
        elementoMesAno.textContent = `${CALENDARIO_CONFIG.meses[mes]} ${ano}`;
    }
}

/**
 * Timeline de próximos eventos
 */
function atualizarTimeline() {
    const timeline = document.getElementById('timelineEventos');
    if (!timeline || !dados?.eventos) return false;

    try {
        timeline.innerHTML = '';
        
        const hoje = new Date();
        const proximosEventos = [];
        
        // Coletar eventos dos próximos 14 dias
        for (let i = 0; i < 14; i++) {
            const data = new Date(hoje);
            data.setDate(hoje.getDate() + i);
            const dataStr = data.toISOString().split('T')[0];
            
            const eventosDia = obterEventosDoDia(dataStr);
            eventosDia.forEach(evento => {
                proximosEventos.push({
                    ...evento,
                    dataCompleta: dataStr,
                    diasRestantes: i,
                    dataObj: data
                });
            });
        }
        
        // Ordenar por data e horário
        proximosEventos.sort((a, b) => {
            if (a.dataCompleta !== b.dataCompleta) {
                return a.dataCompleta.localeCompare(b.dataCompleta);
            }
            return (a.horarioInicio || '00:00').localeCompare(b.horarioInicio || '00:00');
        });
        
        // Mostrar apenas os primeiros 8 eventos
        proximosEventos.slice(0, 8).forEach(evento => {
            const item = criarItemTimeline(evento);
            timeline.appendChild(item);
        });
        
        if (proximosEventos.length === 0) {
            timeline.innerHTML = `
                <div style="text-align: center; color: var(--text-secondary); padding: 20px;">
                    📅 Nenhum evento nos próximos 14 dias
                </div>
            `;
        }
        
        console.log('🔄 Timeline atualizada:', proximosEventos.length, 'eventos');
        return true;
        
    } catch (error) {
        console.error('❌ Erro ao atualizar timeline:', error);
        return false;
    }
}

/**
 * Cria item da timeline
 */
function criarItemTimeline(evento) {
    const item = document.createElement('div');
    item.className = 'timeline-item';
    
    // Cores por tipo
    const cores = {
        reuniao: 'var(--color-primary)',
        entrega: 'var(--color-success)',
        prazo: 'var(--color-danger)',
        marco: 'var(--color-purple)',
        outro: 'var(--color-secondary)'
    };
    
    const cor = cores[evento.tipo] || cores.outro;
    
    // Textos de prazo
    let textoPrazo = '';
    if (evento.diasRestantes === 0) {
        textoPrazo = 'Hoje';
    } else if (evento.diasRestantes === 1) {
        textoPrazo = 'Amanhã';
    } else {
        textoPrazo = `Em ${evento.diasRestantes} dias`;
    }
    
    // Tipos legíveis
    const tiposTexto = {
        reuniao: 'Reunião',
        entrega: 'Entrega',
        prazo: 'Prazo',
        marco: 'Marco',
        outro: 'Evento'
    };
    
    const tipoTexto = tiposTexto[evento.tipo] || 'Evento';
    
    item.innerHTML = `
        <div class="timeline-marker" style="border-color: ${cor}; background: ${cor};"></div>
        <div class="timeline-content">
            <div style="font-weight: 600; margin-bottom: 4px; color: var(--text-primary);">
                ${evento.titulo}
            </div>
            <div style="font-size: 13px; color: var(--text-secondary); margin-bottom: 6px;">
                <span style="color: ${cor}; font-weight: 500;">${tipoTexto}</span> • 
                ${textoPrazo} • 
                ${formatarData(evento.dataCompleta)}
                ${evento.diaCompleto ? ' • Dia todo' : ` • ${evento.horarioInicio}`}
            </div>
            ${evento.pessoas && evento.pessoas.length > 0 ? `
                <div style="font-size: 12px; color: var(--text-secondary);">
                    ${evento.tipo === 'reuniao' ? 'Participantes' : 'Responsáveis'}: 
                    ${evento.pessoas.slice(0, 3).join(', ')}
                    ${evento.pessoas.length > 3 ? ` +${evento.pessoas.length - 3}` : ''}
                </div>
            ` : ''}
        </div>
    `;
    
    // Click para editar
    item.style.cursor = 'pointer';
    item.onclick = () => {
        if (typeof editarEvento === 'function') {
            editarEvento(evento);
        }
    };
    
    return item;
}

/**
 * Gestão de cache do calendário
 */
function verificarCacheCalendario(mes, ano) {
    if (!cacheCalendario.ultimaAtualizacao) return false;
    
    const agora = new Date();
    const tempoDecorrido = agora - cacheCalendario.ultimaAtualizacao;
    
    return cacheCalendario.mesAtual === mes &&
           cacheCalendario.anoAtual === ano &&
           tempoDecorrido < CALENDARIO_CONFIG.cacheTimeout &&
           cacheCalendario.htmlCalendario;
}

function salvarCacheCalendario(mes, ano, html) {
    cacheCalendario = {
        mesAtual: mes,
        anoAtual: ano,
        htmlCalendario: html,
        ultimaAtualizacao: new Date()
    };
}

function limparCacheCalendario() {
    cacheCalendario = {
        mesAtual: null,
        anoAtual: null,
        eventos: null,
        feriados: null,
        htmlCalendario: null,
        ultimaAtualizacao: null
    };
}

/**
 * Animações do calendário
 */
function animarCalendario() {
    const dias = document.querySelectorAll('.dia');
    
    dias.forEach((dia, index) => {
        dia.style.opacity = '0';
        dia.style.transform = 'scale(0.8)';
        
        setTimeout(() => {
            dia.style.transition = 'all 0.3s ease-out';
            dia.style.opacity = '1';
            dia.style.transform = 'scale(1)';
        }, index * 20);
    });
}

/**
 * Utilitários
 */
function truncarTexto(texto, limite) {
    if (texto.length <= limite) return texto;
    return texto.substring(0, limite) + '...';
}

function formatarData(data) {
    const d = new Date(data + 'T00:00:00');
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
}

/**
 * Event handlers
 */
function abrirNovoEvento(data) {
    if (typeof mostrarNovoEvento === 'function') {
        // Pré-preencher a data
        const eventoData = document.getElementById('eventoData');
        if (eventoData) {
            eventoData.value = data;
        }
        mostrarNovoEvento();
    }
}

function confirmarExclusaoEvento(evento) {
    const mensagem = evento.recorrencia ? 
        'Deseja excluir este evento recorrente? Todas as ocorrências serão removidas.' :
        'Deseja excluir este evento?';
        
    if (confirm(mensagem)) {
        if (typeof deletarEvento === 'function') {
            deletarEvento(evento.id);
        }
    }
}

function mostrarEventosDia(data, eventos) {
    // Implementar modal com todos os eventos do dia
    console.log('Mostrar todos os eventos do dia:', data, eventos);
}

/**
 * Tratamento de erros
 */
function mostrarErroCalendario(erro) {
    const container = document.getElementById('calendario');
    if (container) {
        container.innerHTML = `
            <div style="grid-column: span 7; text-align: center; padding: 40px;">
                <div style="font-size: 48px; margin-bottom: 20px;">📅</div>
                <h3 style="color: var(--color-danger); margin-bottom: 16px;">Erro no Calendário</h3>
                <p style="color: var(--text-secondary);">
                    Não foi possível carregar o calendário. Verifique os dados.
                </p>
                <button class="btn btn-primary" onclick="gerarCalendario()" style="margin-top: 16px;">
                    🔄 Tentar Novamente
                </button>
            </div>
        `;
    }
}

/**
 * Exposição global para compatibilidade
 */
if (typeof window !== 'undefined') {
    window.gerarCalendario = gerarCalendario;
    window.mudarMes = mudarMes;
    window.atualizarTimeline = atualizarTimeline;
    window.obterEventosDoDia = obterEventosDoDia;
    window.verificarRecorrencia = verificarRecorrencia;
    window.limparCacheCalendario = limparCacheCalendario;
    window.formatarData = formatarData;
}

console.log('✅ Módulo calendario.js carregado com sucesso');
