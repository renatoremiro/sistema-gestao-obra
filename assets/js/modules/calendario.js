/**
 * MÓDULO DE CALENDÁRIO - Sistema de Gestão v5.1
 * Responsável pela renderização e manipulação do calendário
 */

// ========== CONFIGURAÇÕES DO CALENDÁRIO ==========
const CALENDARIO_SETTINGS = {
    DIAS_SEMANA: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
    MESES: [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ],
    TIPOS_EVENTO: {
        reuniao: { icone: '📅', cor: '#3b82f6' },
        entrega: { icone: '📦', cor: '#10b981' },
        prazo: { icone: '⏰', cor: '#ef4444' },
        marco: { icone: '🎯', cor: '#8b5cf6' },
        outro: { icone: '📌', cor: '#6b7280' }
    },
    ALTURA_CELULA_MIN: 100,
    ALTURA_CELULA_MOBILE: 60
};

// ========== FUNÇÕES DO CALENDÁRIO ==========

/**
 * Gera o calendário para o mês atual
 */
function gerarCalendario() {
    const calendario = document.getElementById('calendario');
    if (!calendario) return;
    
    calendario.innerHTML = '';
    
    // Criar headers dos dias da semana
    CALENDARIO_SETTINGS.DIAS_SEMANA.forEach(dia => {
        const header = document.createElement('div');
        header.className = 'dia-header';
        header.textContent = dia;
        calendario.appendChild(header);
    });
    
    const primeiroDia = new Date(estadoSistema.anoAtual, estadoSistema.mesAtual, 1);
    const ultimoDia = new Date(estadoSistema.anoAtual, estadoSistema.mesAtual + 1, 0);
    const primeiroDiaSemana = primeiroDia.getDay();
    
    // Células vazias antes do primeiro dia
    for (let i = 0; i < primeiroDiaSemana; i++) {
        const diaVazio = document.createElement('div');
        diaVazio.className = 'dia outro-mes';
        calendario.appendChild(diaVazio);
    }
    
    // Gerar dias do mês
    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
        const diaDiv = document.createElement('div');
        diaDiv.className = 'dia';
        
        const dataCompleta = `${estadoSistema.anoAtual}-${String(estadoSistema.mesAtual + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
        
        // Verificar se é feriado
        if (dados.feriados && dados.feriados[dataCompleta]) {
            diaDiv.classList.add('dia-feriado');
        }
        
        // Verificar se é hoje
        const hoje = new Date();
        if (hoje.getFullYear() === estadoSistema.anoAtual && 
            hoje.getMonth() === estadoSistema.mesAtual && 
            hoje.getDate() === dia) {
            diaDiv.classList.add('hoje');
        }
        
        const numeroDiv = document.createElement('div');
        numeroDiv.className = 'dia-numero';
        numeroDiv.innerHTML = `<span>${dia}</span>`;
        
        // Adicionar label de feriado se necessário
        if (dados.feriados && dados.feriados[dataCompleta]) {
            numeroDiv.innerHTML += `<span class="feriado-label" title="${dados.feriados[dataCompleta]}">Feriado</span>`;
        }
        
        diaDiv.appendChild(numeroDiv);
        
        // Obter eventos do dia
        const eventosDia = obterEventosDoDia(dataCompleta);
        
        // Ordenar eventos por horário
        eventosDia.sort((a, b) => {
            const horaA = a.diaCompleto ? '00:00' : a.horarioInicio;
            const horaB = b.diaCompleto ? '00:00' : b.horarioInicio;
            return horaA.localeCompare(horaB);
        });
        
        // Renderizar eventos
        eventosDia.forEach(evento => {
            const eventoDiv = criarElementoEvento(evento);
            diaDiv.appendChild(eventoDiv);
        });
        
        // Event listener para criar novo evento
        diaDiv.onclick = (e) => {
            if (e.target === diaDiv || e.target.classList.contains('dia-numero')) {
                document.getElementById('eventoData').value = dataCompleta;
                mostrarNovoEvento();
            }
        };
        
        calendario.appendChild(diaDiv);
    }
    
    // Atualizar título do mês
    const mesAno = document.getElementById('mesAno');
    if (mesAno) {
        mesAno.textContent = `${CALENDARIO_SETTINGS.MESES[estadoSistema.mesAtual]} ${estadoSistema.anoAtual}`;
    }
    
    // Atualizar timeline
    atualizarTimelineEventos();
}

/**
 * Cria elemento visual para um evento
 */
function criarElementoEvento(evento) {
    const eventoDiv = document.createElement('div');
    eventoDiv.className = `evento evento-${evento.tipo}`;
    
    // Classes especiais
    if (evento.diaCompleto) {
        eventoDiv.classList.add('evento-dia-completo');
    }
    
    if (evento.dataFim && evento.data !== evento.dataFim) {
        eventoDiv.classList.add('evento-multi-dia');
    }
    
    // Conteúdo do evento
    const tipoConfig = CALENDARIO_SETTINGS.TIPOS_EVENTO[evento.tipo] || CALENDARIO_SETTINGS.TIPOS_EVENTO.outro;
    
    let htmlEvento = `
        <div class="evento-header">
            <span>${tipoConfig.icone} ${evento.diaCompleto ? 'Dia todo' : evento.horarioInicio}</span>
            ${evento.recorrencia ? '<span class="recorrente-indicator">🔄</span>' : ''}
        </div>
        <div style="font-weight: 500;">${evento.titulo}</div>
    `;
    
    // Adicionar informações extras
    if (evento.pessoas && evento.pessoas.length > 0) {
        const labelPessoas = evento.tipo === 'reuniao' ? '👥' : '👤';
        htmlEvento += `<div class="evento-info">${labelPessoas} ${evento.pessoas.length} ${evento.pessoas.length > 1 ? 'pessoas' : 'pessoa'}</div>`;
    }
    
    if (evento.local) {
        htmlEvento += `<div class="evento-info">📍 ${evento.local}</div>`;
    }
    
    if (evento.tarefasRelacionadas && evento.tarefasRelacionadas.length > 0) {
        htmlEvento += `<div class="evento-info">📋 ${evento.tarefasRelacionadas.length} tarefa(s)</div>`;
    }
    
    if (evento.horarioFim && !evento.diaCompleto) {
        htmlEvento += `<div class="evento-duracao">até ${evento.horarioFim}</div>`;
    }
    
    eventoDiv.innerHTML = htmlEvento;
    
    // Event listeners
    eventoDiv.onclick = function(e) {
        e.stopPropagation();
        editarEvento(evento);
    };
    
    eventoDiv.title = `${evento.titulo}\n${evento.descricao || 'Clique para editar'}`;
    
    // Botão de deletar
    const deleteBtn = document.createElement('span');
    deleteBtn.className = 'delete-btn';
    deleteBtn.innerHTML = '×';
    deleteBtn.onclick = function(e) {
        e.stopPropagation();
        deletarEvento(evento.id);
    };
    eventoDiv.appendChild(deleteBtn);
    
    return eventoDiv;
}

/**
 * Obtém eventos de um dia específico
 */
function obterEventosDoDia(data) {
    if (!dados || !dados.eventos) return [];
    
    const dataObj = new Date(data + 'T00:00:00');
    const eventos = [];
    
    dados.eventos.forEach(evento => {
        // Evento na data exata
        if (evento.data === data) {
            eventos.push(evento);
        }
        // Evento de múltiplos dias
        else if (evento.dataFim) {
            const inicio = new Date(evento.data + 'T00:00:00');
            const fim = new Date(evento.dataFim + 'T00:00:00');
            const atual = new Date(data + 'T00:00:00');
            if (atual >= inicio && atual <= fim) {
                eventos.push({...evento, continuacao: true});
            }
        }
        // Evento recorrente
        else if (evento.recorrencia) {
            if (verificarRecorrenciaEvento(evento, data)) {
                eventos.push({...evento, recorrente: true});
            }
        }
    });
    
    return eventos;
}

/**
 * Verifica se um evento recorrente ocorre numa data específica
 */
function verificarRecorrenciaEvento(evento, data) {
    const dataEvento = new Date(evento.data + 'T00:00:00');
    const dataVerificar = new Date(data + 'T00:00:00');
    
    if (dataVerificar < dataEvento) return false;
    
    // Verificar fim da recorrência
    if (evento.recorrencia.fim) {
        const fimRecorrencia = new Date(evento.recorrencia.fim + 'T00:00:00');
        if (dataVerificar > fimRecorrencia) return false;
    }
    
    const tipo = evento.recorrencia.tipo;
    
    switch(tipo) {
        case 'diaria':
            return true;
            
        case 'semanal':
            const diaSemana = dataVerificar.getDay();
            return evento.recorrencia.diasSemana && evento.recorrencia.diasSemana.includes(diaSemana);
            
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
 * Atualiza timeline de próximos eventos
 */
function atualizarTimelineEventos() {
    const timeline = document.getElementById('timelineEventos');
    if (!timeline || !dados) return;
    
    timeline.innerHTML = '';
    
    const hoje = new Date();
    const eventos = [];
    
    // Coletar eventos dos próximos 7 dias
    for (let i = 0; i < 7; i++) {
        const data = new Date(hoje);
        data.setDate(hoje.getDate() + i);
        const dataStr = data.toISOString().split('T')[0];
        
        const eventosDia = obterEventosDoDia(dataStr);
        eventosDia.forEach(evento => {
            eventos.push({
                ...evento,
                dataCompleta: dataStr,
                diasRestantes: i
            });
        });
    }
    
    // Ordenar eventos
    eventos.sort((a, b) => {
        if (a.dataCompleta !== b.dataCompleta) {
            return a.dataCompleta.localeCompare(b.dataCompleta);
        }
        return (a.horarioInicio || '00:00').localeCompare(b.horarioInicio || '00:00');
    });
    
    // Mostrar apenas os primeiros 5 eventos
    eventos.slice(0, 5).forEach(evento => {
        const item = document.createElement('div');
        item.className = 'timeline-item';
        
        const tipoConfig = CALENDARIO_SETTINGS.TIPOS_EVENTO[evento.tipo] || CALENDARIO_SETTINGS.TIPOS_EVENTO.outro;
        
        item.innerHTML = `
            <div class="timeline-marker" style="border-color: ${tipoConfig.cor};"></div>
            <div class="timeline-content">
                <div style="font-weight: 600; margin-bottom: 4px;">${evento.titulo}</div>
                <div style="font-size: 13px; color: #6b7280;">
                    ${evento.diasRestantes === 0 ? 'Hoje' : evento.diasRestantes === 1 ? 'Amanhã' : `Em ${evento.diasRestantes} dias`}
                    • ${formatarData(evento.dataCompleta)}
                    ${evento.diaCompleto ? '• Dia todo' : `• ${evento.horarioInicio}`}
                </div>
                ${evento.pessoas && evento.pessoas.length > 0 ? 
                    `<div style="font-size: 12px; color: #6b7280; margin-top: 4px;">
                        ${evento.tipo === 'reuniao' ? 'Participantes' : 'Responsáveis'}: ${evento.pessoas.join(', ')}
                    </div>` : ''}
            </div>
        `;
        
        timeline.appendChild(item);
    });
    
    if (eventos.length === 0) {
        timeline.innerHTML = '<div style="text-align: center; color: #6b7280; padding: 20px;">Nenhum evento nos próximos 7 dias</div>';
    }
}

/**
 * Muda o mês do calendário
 */
function mudarMes(direcao) {
    estadoSistema.mesAtual += direcao;
    if (estadoSistema.mesAtual < 0) {
        estadoSistema.mesAtual = 11;
        estadoSistema.anoAtual--;
    } else if (estadoSistema.mesAtual > 11) {
        estadoSistema.mesAtual = 0;
        estadoSistema.anoAtual++;
    }
    gerarCalendario();
    atualizarEstatisticas();
}

/**
 * Edita um evento existente
 */
function editarEvento(evento) {
    estadoSistema.editandoEvento = evento.id;
    estadoSistema.pessoasSelecionadas.clear();
    estadoSistema.tarefasVinculadas.clear();
    
    // Marcar como editando
    marcarEditando('evento', evento.id);
    
    // Preencher formulário
    document.getElementById('modalEventoTitulo').textContent = 'Editar Evento';
    document.getElementById('eventoId').value = evento.id;
    document.getElementById('eventoTipo').value = evento.tipo;
    document.getElementById('eventoTitulo').value = evento.titulo;
    document.getElementById('eventoDescricao').value = evento.descricao || '';
    document.getElementById('eventoDiaCompleto').checked = evento.diaCompleto;
    document.getElementById('eventoData').value = evento.data;
    document.getElementById('eventoDataFim').value = evento.dataFim || '';
    document.getElementById('eventoHorarioInicio').value = evento.horarioInicio || '09:00';
    document.getElementById('eventoHorarioFim').value = evento.horarioFim || '';
    document.getElementById('eventoLocal').value = evento.local || '';
    
    // Preencher pessoas selecionadas
    if (evento.pessoas) {
        evento.pessoas.forEach(pessoa => {
            estadoSistema.pessoasSelecionadas.add(pessoa);
        });
    }
    
    // Preencher tarefas vinculadas
    if (evento.tarefasRelacionadas) {
        evento.tarefasRelacionadas.forEach(tarefa => {
            const key = tarefa.tarefaId ? `${tarefa.atividadeId}_${tarefa.tarefaId}` : `${tarefa.atividadeId}`;
            estadoSistema.tarefasVinculadas.set(key, { nome: 'Tarefa vinculada' });
        });
    }
    
    // Configurar recorrência
    if (evento.recorrencia) {
        document.getElementById('eventoRecorrente').checked = true;
        document.getElementById('recorrenciaConfig').classList.remove('hidden');
        document.getElementById('recorrenciaTipo').value = evento.recorrencia.tipo;
        document.getElementById('recorrenciaFim').value = evento.recorrencia.fim || '';
        
        if (evento.recorrencia.diasSemana) {
            document.querySelectorAll('#grupoDiasSemana input[type="checkbox"]').forEach(cb => {
                cb.checked = evento.recorrencia.diasSemana.includes(parseInt(cb.value));
            });
        }
    }
    
    // Atualizar interface
    atualizarCamposEvento();
    toggleHorarios();
    toggleRecorrencia();
    atualizarListaPessoas();
    atualizarListaTarefasVinculadas();
    
    // Mostrar modal
    document.getElementById('modalEvento').classList.add('active');
}

/**
 * Deleta um evento
 */
function deletarEvento(id) {
    if (confirm('Deseja realmente excluir este evento? Se for recorrente, todas as ocorrências serão removidas.')) {
        const evento = dados.eventos.find(e => e.id === id);
        dados.eventos = dados.eventos.filter(e => e.id !== id);
        
        salvarDados();
        gerarCalendario();
        atualizarEstatisticas();
        
        // Atualizar todas as agendas pessoais
        atualizarTodasAgendasPessoais();
        
        mostrarNotificacao(evento && evento.recorrencia ? 'Evento recorrente excluído!' : 'Evento excluído!');
    }
}

// ========== LOG DE CARREGAMENTO ==========
if (typeof console !== 'undefined') {
    console.log('📅 Módulo calendario.js carregado com sucesso');
}
/**
 * Mostra modal para criar novo evento
 * Função chamada pelo botão "Novo Evento" e ao clicar em dia vazio
 */
function mostrarNovoEvento() {
    // Limpar estado de edição
    estadoSistema.editandoEvento = null;
    estadoSistema.pessoasSelecionadas.clear();
    estadoSistema.tarefasVinculadas.clear();
    
    // Configurar título do modal
    document.getElementById('modalEventoTitulo').textContent = 'Novo Evento';
    
    // Limpar formulário
    document.getElementById('eventoId').value = '';
    document.getElementById('eventoTipo').value = 'reuniao';
    document.getElementById('eventoTitulo').value = '';
    document.getElementById('eventoDescricao').value = '';
    document.getElementById('eventoDiaCompleto').checked = false;
    document.getElementById('eventoDataFim').value = '';
    document.getElementById('eventoHorarioInicio').value = '09:00';
    document.getElementById('eventoHorarioFim').value = '10:00';
    document.getElementById('eventoLocal').value = '';
    
    // Configurar data padrão (hoje ou data selecionada)
    const dataInput = document.getElementById('eventoData');
    if (!dataInput.value) {
        const hoje = new Date();
        const dataFormatada = hoje.toISOString().split('T')[0];
        dataInput.value = dataFormatada;
    }
    
    // Limpar recorrência
    document.getElementById('eventoRecorrente').checked = false;
    document.getElementById('recorrenciaConfig').classList.add('hidden');
    document.getElementById('recorrenciaTipo').value = 'semanal';
    document.getElementById('recorrenciaFim').value = '';
    
    // Limpar checkboxes de dias da semana
    document.querySelectorAll('#grupoDiasSemana input[type="checkbox"]').forEach(cb => {
        cb.checked = false;
    });
    
    // Atualizar interface
    atualizarCamposEvento();
    toggleHorarios();
    toggleRecorrencia();
    atualizarListaPessoas();
    atualizarListaTarefasVinculadas();
    
    // Mostrar modal
    document.getElementById('modalEvento').classList.add('active');
    
    // Focar no campo título
    setTimeout(() => {
        document.getElementById('eventoTitulo').focus();
    }, 100);
}

/**
 * Atualiza campos do evento baseado no tipo e configurações
 * Função chamada após preencher formulário ou mudar configurações
 */
function atualizarCamposEvento() {
    const tipoEvento = document.getElementById('eventoTipo').value;
    const diaCompleto = document.getElementById('eventoDiaCompleto').checked;
    
    // Configurações específicas por tipo de evento
    const configTipos = {
        'reuniao': {
            horariosPadrao: true,
            localObrigatorio: false,
            pessoasRecomendado: true,
            placeholder: 'Assunto da reunião'
        },
        'entrega': {
            horariosPadrao: false,
            localObrigatorio: true,
            pessoasRecomendado: true,
            placeholder: 'Nome da entrega'
        },
        'prazo': {
            horariosPadrao: true,
            localObrigatorio: false,
            pessoasRecomendado: false,
            placeholder: 'Nome do prazo'
        },
        'marco': {
            horariosPadrao: false,
            localObrigatorio: false,
            pessoasRecomendado: false,
            placeholder: 'Nome do marco'
        },
        'outro': {
            horariosPadrao: true,
            localObrigatorio: false,
            pessoasRecomendado: false,
            placeholder: 'Título do evento'
        }
    };
    
    const config = configTipos[tipoEvento] || configTipos['outro'];
    
    // Atualizar placeholder do título
    const tituloInput = document.getElementById('eventoTitulo');
    if (tituloInput) {
        tituloInput.placeholder = config.placeholder;
    }
    
    // Configurar horários padrão se necessário
    if (config.horariosPadrao && !estadoSistema.editandoEvento) {
        const horaInicio = document.getElementById('eventoHorarioInicio');
        const horaFim = document.getElementById('eventoHorarioFim');
        
        if (!horaInicio.value) {
            switch(tipoEvento) {
                case 'reuniao':
                    horaInicio.value = '09:00';
                    horaFim.value = '10:00';
                    break;
                case 'prazo':
                    horaInicio.value = '18:00';
                    horaFim.value = '18:00';
                    break;
                default:
                    horaInicio.value = '09:00';
                    horaFim.value = '10:00';
            }
        }
    }
    
    // Mostrar/ocultar campos baseado no tipo
    const grupoLocal = document.querySelector('.grupo-local');
    if (grupoLocal) {
        if (config.localObrigatorio) {
            grupoLocal.style.display = 'block';
            const localInput = document.getElementById('eventoLocal');
            if (localInput) {
                localInput.required = true;
            }
        }
    }
    
    // Destacar seção de pessoas se recomendado
    const secaoPessoas = document.querySelector('.secao-pessoas');
    if (secaoPessoas) {
        if (config.pessoasRecomendado) {
            secaoPessoas.classList.add('recomendado');
        } else {
            secaoPessoas.classList.remove('recomendado');
        }
    }
    
    // Configurar horários se dia completo
    if (diaCompleto) {
        document.getElementById('eventoHorarioInicio').value = '00:00';
        document.getElementById('eventoHorarioFim').value = '23:59';
    }
    
    // Atualizar indicadores visuais
    atualizarIndicadoresEvento(tipoEvento);
}

/**
 * Atualiza indicadores visuais do tipo de evento
 */
function atualizarIndicadoresEvento(tipo) {
    const indicador = document.querySelector('.tipo-evento-indicador');
    if (!indicador) return;
    
    const tipoConfig = CALENDARIO_SETTINGS.TIPOS_EVENTO[tipo] || CALENDARIO_SETTINGS.TIPOS_EVENTO.outro;
    
    indicador.innerHTML = `${tipoConfig.icone} ${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`;
    indicador.style.color = tipoConfig.cor;
}

/**
 * Toggle de horários (mostrar/ocultar baseado em "dia completo")
 */
function toggleHorarios() {
    const diaCompleto = document.getElementById('eventoDiaCompleto').checked;
    const grupoHorarios = document.querySelector('.grupo-horarios');
    
    if (grupoHorarios) {
        if (diaCompleto) {
            grupoHorarios.style.display = 'none';
        } else {
            grupoHorarios.style.display = 'block';
        }
    }
}

/**
 * Toggle de configuração de recorrência
 */
function toggleRecorrencia() {
    const recorrente = document.getElementById('eventoRecorrente').checked;
    const configRecorrencia = document.getElementById('recorrenciaConfig');
    
    if (configRecorrencia) {
        if (recorrente) {
            configRecorrencia.classList.remove('hidden');
        } else {
            configRecorrencia.classList.add('hidden');
        }
    }
}

/**
 * Atualiza lista de pessoas selecionadas
 */
function atualizarListaPessoas() {
    const lista = document.getElementById('pessoasSelecionadas');
    if (!lista) return;
    
    lista.innerHTML = '';
    
    if (estadoSistema.pessoasSelecionadas.size === 0) {
        lista.innerHTML = '<div class="lista-vazia">Nenhuma pessoa selecionada</div>';
        return;
    }
    
    estadoSistema.pessoasSelecionadas.forEach(pessoa => {
        const item = document.createElement('div');
        item.className = 'pessoa-item';
        item.innerHTML = `
            <span>${pessoa}</span>
            <button type="button" onclick="removerPessoa('${pessoa}')" class="btn-remover">×</button>
        `;
        lista.appendChild(item);
    });
}

/**
 * Atualiza lista de tarefas vinculadas
 */
function atualizarListaTarefasVinculadas() {
    const lista = document.getElementById('tarefasVinculadas');
    if (!lista) return;
    
    lista.innerHTML = '';
    
    if (estadoSistema.tarefasVinculadas.size === 0) {
        lista.innerHTML = '<div class="lista-vazia">Nenhuma tarefa vinculada</div>';
        return;
    }
    
    estadoSistema.tarefasVinculadas.forEach((tarefa, key) => {
        const item = document.createElement('div');
        item.className = 'tarefa-item';
        item.innerHTML = `
            <span>${tarefa.nome}</span>
            <button type="button" onclick="removerTarefa('${key}')" class="btn-remover">×</button>
        `;
        lista.appendChild(item);
    });
}

/**
 * Remove pessoa da seleção
 */
function removerPessoa(pessoa) {
    estadoSistema.pessoasSelecionadas.delete(pessoa);
    atualizarListaPessoas();
}

/**
 * Remove tarefa da vinculação  
 */
function removerTarefa(key) {
    estadoSistema.tarefasVinculadas.delete(key);
    atualizarListaTarefasVinculadas();
}

// ========== EVENTOS DO FORMULÁRIO ==========

// Event listeners para campos do formulário
document.addEventListener('DOMContentLoaded', function() {
    // Listener para mudança de tipo de evento
    const tipoEvento = document.getElementById('eventoTipo');
    if (tipoEvento) {
        tipoEvento.addEventListener('change', atualizarCamposEvento);
    }
    
    // Listener para dia completo
    const diaCompleto = document.getElementById('eventoDiaCompleto');
    if (diaCompleto) {
        diaCompleto.addEventListener('change', function() {
            atualizarCamposEvento();
            toggleHorarios();
        });
    }
    
    // Listener para recorrência
    const eventoRecorrente = document.getElementById('eventoRecorrente');
    if (eventoRecorrente) {
        eventoRecorrente.addEventListener('change', toggleRecorrencia);
    }
});

console.log('✅ Funções faltantes implementadas: mostrarNovoEvento() e atualizarCamposEvento()');

/**
 * Inicializa o calendário automaticamente
 */
function inicializarCalendario() {
    // Verificar se elementos necessários existem
    if (!document.getElementById('calendario')) {
        console.log('⚠️ Elemento calendário não encontrado, tentando novamente...');
        setTimeout(inicializarCalendario, 100);
        return;
    }
    
    // Verificar se estado do sistema existe
    if (typeof estadoSistema === 'undefined' || !estadoSistema) {
        console.log('⚠️ Estado do sistema não encontrado, tentando novamente...');
        setTimeout(inicializarCalendario, 100);
        return;
    }
    
    // Definir data atual se não estiver definida
    if (!estadoSistema.mesAtual && estadoSistema.mesAtual !== 0) {
        const hoje = new Date();
        estadoSistema.anoAtual = hoje.getFullYear();
        estadoSistema.mesAtual = hoje.getMonth();
        console.log('📅 Data atual definida:', estadoSistema.anoAtual, estadoSistema.mesAtual);
    }
    
    // Gerar calendário
    console.log('📅 Inicializando calendário automaticamente...');
    gerarCalendario();
    console.log('✅ Calendário inicializado com sucesso!');
}

/**
 * Aguardar carregamento completo e inicializar
 */
function aguardarInicializacao() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inicializarCalendario);
    } else {
        // DOM já carregado
        setTimeout(inicializarCalendario, 50);
    }
}

// Executar inicialização
aguardarInicializacao();

// Também tentar inicializar quando a janela carregar completamente
window.addEventListener('load', function() {
    setTimeout(function() {
        if (!document.querySelector('#calendario .dia')) {
            console.log('🔄 Calendário vazio detectado, reinicializando...');
            inicializarCalendario();
        }
    }, 200);
});

console.log('🔧 Sistema de inicialização automática do calendário ativado');
