/**
 * MÓDULO DE CALENDÁRIO - Sistema de Gestão v5.1
 * Responsável pela renderização e manipulação do calendário
 * VERSÃO CORRIGIDA - Inicialização Robusta
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

// ========== ESTADO DO CALENDÁRIO ==========
let calendarioInicializado = false;
let tentativasInicializacao = 0;
const MAX_TENTATIVAS = 10;
const INTERVALO_TENTATIVA = 200; // 200ms

// ========== VERIFICAÇÕES DE DEPENDÊNCIAS ==========

/**
 * Verifica se todas as dependências estão disponíveis
 */
function verificarDependenciasCalendario() {
    const dependencias = {
        estadoSistema: typeof estadoSistema !== 'undefined' && estadoSistema !== null,
        dados: typeof dados !== 'undefined' && dados !== null,
        elementoCalendario: document.getElementById('calendario') !== null,
        formatarData: typeof formatarData !== 'undefined',
        calcularDiasRestantes: typeof calcularDiasRestantes !== 'undefined',
        salvarDados: typeof salvarDados !== 'undefined'
    };
    
    const dependenciasFaltando = Object.entries(dependencias)
        .filter(([nome, disponivel]) => !disponivel)
        .map(([nome]) => nome);
    
    if (dependenciasFaltando.length > 0) {
        console.warn('📅 Dependências faltando para calendário:', dependenciasFaltando);
        return false;
    }
    
    return true;
}

/**
 * Configura data atual no estado se não estiver definida
 */
function configurarDataAtual() {
    if (!estadoSistema) {
        console.error('❌ Estado do sistema não encontrado!');
        return false;
    }
    
    // Definir data atual se não estiver definida
    if (typeof estadoSistema.mesAtual === 'undefined' || estadoSistema.mesAtual === null) {
        const hoje = new Date();
        estadoSistema.anoAtual = hoje.getFullYear();
        estadoSistema.mesAtual = hoje.getMonth();
        console.log('📅 Data atual configurada:', estadoSistema.anoAtual, estadoSistema.mesAtual);
    }
    
    // Inicializar sets se não existirem
    if (!estadoSistema.pessoasSelecionadas) {
        estadoSistema.pessoasSelecionadas = new Set();
    }
    if (!estadoSistema.tarefasVinculadas) {
        estadoSistema.tarefasVinculadas = new Map();
    }
    if (!estadoSistema.alertasPrazosExibidos) {
        estadoSistema.alertasPrazosExibidos = new Set();
    }
    
    return true;
}

// ========== FUNÇÕES PRINCIPAIS DO CALENDÁRIO ==========

/**
 * Mostra modal para criar novo evento
 * Função chamada pelo botão "Novo Evento" e ao clicar em dia vazio
 */
function mostrarNovoEvento() {
    try {
        console.log('📅 Abrindo modal de novo evento...');
        
        // Verificar se modal existe
        const modal = document.getElementById('modalEvento');
        if (!modal) {
            console.error('❌ Modal de evento não encontrado!');
            if (window.Notifications) {
                window.Notifications.erro('Erro: Modal não encontrado!');
            }
            return;
        }
        
        // Limpar estado de edição
        if (estadoSistema) {
            estadoSistema.editandoEvento = null;
            estadoSistema.pessoasSelecionadas.clear();
            estadoSistema.tarefasVinculadas.clear();
        }
        
        // Configurar título do modal
        const titulo = document.getElementById('modalEventoTitulo');
        if (titulo) {
            titulo.textContent = 'Novo Evento';
        }
        
        // Limpar formulário
        limparFormularioEvento();
        
        // Configurar data padrão (hoje ou data selecionada)
        configurarDataPadrao();
        
        // Limpar recorrência
        limparConfiguracao('recorrencia');
        
        // Atualizar interface
        atualizarCamposEvento();
        toggleHorarios();
        toggleRecorrencia();
        atualizarListaPessoas();
        atualizarListaTarefasVinculadas();
        
        // Mostrar modal
        modal.classList.add('active');
        
        // Focar no campo título
        setTimeout(() => {
            const tituloInput = document.getElementById('eventoTitulo');
            if (tituloInput) {
                tituloInput.focus();
            }
        }, 100);
        
        console.log('✅ Modal de novo evento aberto com sucesso');
        
    } catch (error) {
        console.error('❌ Erro ao abrir modal de novo evento:', error);
        if (window.Notifications) {
            window.Notifications.erro('Erro ao abrir formulário de evento');
        }
    }
}

/**
 * Atualiza campos do evento baseado no tipo e configurações
 * Função chamada após preencher formulário ou mudar configurações
 */
function atualizarCamposEvento() {
    try {
        const tipoEvento = document.getElementById('eventoTipo')?.value || 'reuniao';
        const diaCompleto = document.getElementById('eventoDiaCompleto')?.checked || false;
        
        // Configurações específicas por tipo de evento
        const configTipos = {
            'reuniao': {
                horariosPadrao: true,
                localObrigatorio: false,
                pessoasRecomendado: true,
                placeholder: 'Assunto da reunião',
                horaInicio: '09:00',
                horaFim: '10:00'
            },
            'entrega': {
                horariosPadrao: false,
                localObrigatorio: true,
                pessoasRecomendado: true,
                placeholder: 'Nome da entrega',
                horaInicio: '08:00',
                horaFim: '17:00'
            },
            'prazo': {
                horariosPadrao: true,
                localObrigatorio: false,
                pessoasRecomendado: false,
                placeholder: 'Nome do prazo',
                horaInicio: '18:00',
                horaFim: '18:00'
            },
            'marco': {
                horariosPadrao: false,
                localObrigatorio: false,
                pessoasRecomendado: false,
                placeholder: 'Nome do marco',
                horaInicio: '00:00',
                horaFim: '23:59'
            },
            'outro': {
                horariosPadrao: true,
                localObrigatorio: false,
                pessoasRecomendado: false,
                placeholder: 'Título do evento',
                horaInicio: '09:00',
                horaFim: '10:00'
            }
        };
        
        const config = configTipos[tipoEvento] || configTipos['outro'];
        
        // Atualizar placeholder do título
        const tituloInput = document.getElementById('eventoTitulo');
        if (tituloInput) {
            tituloInput.placeholder = config.placeholder;
        }
        
        // Configurar horários padrão se necessário e não estiver editando
        if (config.horariosPadrao && !estadoSistema?.editandoEvento) {
            const horaInicio = document.getElementById('eventoHorarioInicio');
            const horaFim = document.getElementById('eventoHorarioFim');
            
            if (horaInicio && !horaInicio.value) {
                horaInicio.value = config.horaInicio;
            }
            if (horaFim && !horaFim.value) {
                horaFim.value = config.horaFim;
            }
        }
        
        // Configurar campo local
        const grupoLocal = document.querySelector('.grupo-local');
        const localInput = document.getElementById('eventoLocal');
        if (grupoLocal && localInput) {
            if (config.localObrigatorio) {
                grupoLocal.style.display = 'block';
                localInput.required = true;
                localInput.placeholder = 'Local é obrigatório para este tipo';
            } else {
                localInput.required = false;
                localInput.placeholder = 'Ex: Sala de reunião, Canteiro de obras...';
            }
        }
        
        // Destacar seção de pessoas se recomendado
        const secaoPessoas = document.querySelector('.secao-pessoas');
        const labelPessoas = document.getElementById('labelPessoas');
        if (secaoPessoas) {
            if (config.pessoasRecomendado) {
                secaoPessoas.classList.add('recomendado');
                if (labelPessoas) {
                    labelPessoas.textContent = tipoEvento === 'reuniao' ? 'Participantes' : 'Responsáveis';
                }
            } else {
                secaoPessoas.classList.remove('recomendado');
                if (labelPessoas) {
                    labelPessoas.textContent = 'Participantes';
                }
            }
        }
        
        // Configurar horários se dia completo
        if (diaCompleto) {
            const horaInicio = document.getElementById('eventoHorarioInicio');
            const horaFim = document.getElementById('eventoHorarioFim');
            if (horaInicio) horaInicio.value = '00:00';
            if (horaFim) horaFim.value = '23:59';
        }
        
        // Atualizar indicadores visuais
        atualizarIndicadoresEvento(tipoEvento);
        
        console.log('✅ Campos do evento atualizados para tipo:', tipoEvento);
        
    } catch (error) {
        console.error('❌ Erro ao atualizar campos do evento:', error);
    }
}

/**
 * Limpa formulário de evento
 */
function limparFormularioEvento() {
    try {
        const campos = [
            { id: 'eventoId', valor: '' },
            { id: 'eventoTipo', valor: 'reuniao' },
            { id: 'eventoTitulo', valor: '' },
            { id: 'eventoDescricao', valor: '' },
            { id: 'eventoDiaCompleto', checked: false },
            { id: 'eventoDataFim', valor: '' },
            { id: 'eventoHorarioInicio', valor: '09:00' },
            { id: 'eventoHorarioFim', valor: '10:00' },
            { id: 'eventoLocal', valor: '' },
            { id: 'eventoRecorrente', checked: false }
        ];
        
        campos.forEach(campo => {
            const elemento = document.getElementById(campo.id);
            if (elemento) {
                if (campo.hasOwnProperty('checked')) {
                    elemento.checked = campo.checked;
                } else {
                    elemento.value = campo.valor;
                }
            }
        });
        
        // Limpar erros
        document.querySelectorAll('.error-message').forEach(erro => {
            erro.classList.add('hidden');
        });
        
        console.log('✅ Formulário de evento limpo');
        
    } catch (error) {
        console.error('❌ Erro ao limpar formulário:', error);
    }
}

/**
 * Configura data padrão no formulário
 */
function configurarDataPadrao() {
    try {
        const dataInput = document.getElementById('eventoData');
        if (!dataInput) return;
        
        if (!dataInput.value) {
            const hoje = new Date();
            const dataFormatada = hoje.toISOString().split('T')[0];
            dataInput.value = dataFormatada;
            console.log('📅 Data padrão configurada:', dataFormatada);
        }
        
    } catch (error) {
        console.error('❌ Erro ao configurar data padrão:', error);
    }
}

/**
 * Limpa configuração específica
 */
function limparConfiguracao(tipo) {
    try {
        if (tipo === 'recorrencia') {
            const recorrenciaConfig = document.getElementById('recorrenciaConfig');
            const recorrenciaTipo = document.getElementById('recorrenciaTipo');
            const recorrenciaFim = document.getElementById('recorrenciaFim');
            
            if (recorrenciaConfig) recorrenciaConfig.classList.add('hidden');
            if (recorrenciaTipo) recorrenciaTipo.value = 'semanal';
            if (recorrenciaFim) recorrenciaFim.value = '';
            
            // Limpar checkboxes de dias da semana
            document.querySelectorAll('#grupoDiasSemana input[type="checkbox"]').forEach(cb => {
                cb.checked = false;
            });
            
            console.log('✅ Configuração de recorrência limpa');
        }
        
    } catch (error) {
        console.error('❌ Erro ao limpar configuração:', error);
    }
}

/**
 * Atualiza indicadores visuais do tipo de evento
 */
function atualizarIndicadoresEvento(tipo) {
    try {
        const indicador = document.querySelector('.tipo-evento-indicador');
        if (!indicador) return;
        
        const tipoConfig = CALENDARIO_SETTINGS.TIPOS_EVENTO[tipo] || CALENDARIO_SETTINGS.TIPOS_EVENTO.outro;
        
        indicador.innerHTML = `${tipoConfig.icone} ${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`;
        indicador.style.color = tipoConfig.cor;
        
    } catch (error) {
        console.error('❌ Erro ao atualizar indicadores:', error);
    }
}

/**
 * Toggle de horários (mostrar/ocultar baseado em "dia completo")
 */
function toggleHorarios() {
    try {
        const diaCompleto = document.getElementById('eventoDiaCompleto')?.checked || false;
        const grupoHorarios = document.querySelector('.grupo-horarios');
        
        if (grupoHorarios) {
            if (diaCompleto) {
                grupoHorarios.style.display = 'none';
            } else {
                grupoHorarios.style.display = 'block';
            }
        }
        
        console.log('🔄 Toggle horários:', diaCompleto ? 'oculto' : 'visível');
        
    } catch (error) {
        console.error('❌ Erro no toggle de horários:', error);
    }
}

/**
 * Toggle de configuração de recorrência
 */
function toggleRecorrencia() {
    try {
        const recorrente = document.getElementById('eventoRecorrente')?.checked || false;
        const configRecorrencia = document.getElementById('recorrenciaConfig');
        
        if (configRecorrencia) {
            if (recorrente) {
                configRecorrencia.classList.remove('hidden');
            } else {
                configRecorrencia.classList.add('hidden');
            }
        }
        
        console.log('🔄 Toggle recorrência:', recorrente ? 'visível' : 'oculto');
        
    } catch (error) {
        console.error('❌ Erro no toggle de recorrência:', error);
    }
}

/**
 * Atualiza lista de pessoas selecionadas
 */
function atualizarListaPessoas() {
    try {
        const lista = document.getElementById('pessoasSelecionadas');
        if (!lista || !estadoSistema?.pessoasSelecionadas) return;
        
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
        
        console.log('✅ Lista de pessoas atualizada:', estadoSistema.pessoasSelecionadas.size, 'pessoas');
        
    } catch (error) {
        console.error('❌ Erro ao atualizar lista de pessoas:', error);
    }
}

/**
 * Atualiza lista de tarefas vinculadas
 */
function atualizarListaTarefasVinculadas() {
    try {
        const lista = document.getElementById('tarefasVinculadas');
        if (!lista || !estadoSistema?.tarefasVinculadas) return;
        
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
        
        console.log('✅ Lista de tarefas vinculadas atualizada:', estadoSistema.tarefasVinculadas.size, 'tarefas');
        
    } catch (error) {
        console.error('❌ Erro ao atualizar lista de tarefas:', error);
    }
}

/**
 * Remove pessoa da seleção
 */
function removerPessoa(pessoa) {
    try {
        if (estadoSistema?.pessoasSelecionadas) {
            estadoSistema.pessoasSelecionadas.delete(pessoa);
            atualizarListaPessoas();
            console.log('🗑️ Pessoa removida:', pessoa);
        }
    } catch (error) {
        console.error('❌ Erro ao remover pessoa:', error);
    }
}

/**
 * Remove tarefa da vinculação  
 */
function removerTarefa(key) {
    try {
        if (estadoSistema?.tarefasVinculadas) {
            estadoSistema.tarefasVinculadas.delete(key);
            atualizarListaTarefasVinculadas();
            console.log('🗑️ Tarefa removida:', key);
        }
    } catch (error) {
        console.error('❌ Erro ao remover tarefa:', error);
    }
}

/**
 * Gera o calendário para o mês atual
 */
function gerarCalendario() {
    try {
        console.log('📅 Gerando calendário...');
        
        const calendario = document.getElementById('calendario');
        if (!calendario) {
            console.error('❌ Elemento calendário não encontrado!');
            return false;
        }
        
        if (!estadoSistema || typeof estadoSistema.mesAtual === 'undefined') {
            console.error('❌ Estado do sistema não configurado!');
            return false;
        }
        
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
            const diaDiv = criarDiaCalendario(dia);
            calendario.appendChild(diaDiv);
        }
        
        // Atualizar título do mês
        atualizarTituloMes();
        
        // Atualizar timeline
        atualizarTimelineEventos();
        
        console.log('✅ Calendário gerado com sucesso');
        return true;
        
    } catch (error) {
        console.error('❌ Erro ao gerar calendário:', error);
        return false;
    }
}

/**
 * Cria elemento de dia do calendário
 */
function criarDiaCalendario(dia) {
    const diaDiv = document.createElement('div');
    diaDiv.className = 'dia';
    
    const dataCompleta = `${estadoSistema.anoAtual}-${String(estadoSistema.mesAtual + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    
    // Verificar se é feriado
    if (dados?.feriados?.[dataCompleta]) {
        diaDiv.classList.add('dia-feriado');
    }
    
    // Verificar se é hoje
    const hoje = new Date();
    if (hoje.getFullYear() === estadoSistema.anoAtual && 
        hoje.getMonth() === estadoSistema.mesAtual && 
        hoje.getDate() === dia) {
        diaDiv.classList.add('hoje');
    }
    
    // Criar número do dia
    const numeroDiv = document.createElement('div');
    numeroDiv.className = 'dia-numero';
    numeroDiv.innerHTML = `<span>${dia}</span>`;
    
    // Adicionar label de feriado se necessário
    if (dados?.feriados?.[dataCompleta]) {
        numeroDiv.innerHTML += `<span class="feriado-label" title="${dados.feriados[dataCompleta]}">Feriado</span>`;
    }
    
    diaDiv.appendChild(numeroDiv);
    
    // Obter e renderizar eventos do dia
    const eventosDia = obterEventosDoDia(dataCompleta);
    
    // Ordenar eventos por horário
    eventosDia.sort((a, b) => {
        const horaA = a.diaCompleto ? '00:00' : (a.horarioInicio || '00:00');
        const horaB = b.diaCompleto ? '00:00' : (b.horarioInicio || '00:00');
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
            const dataInput = document.getElementById('eventoData');
            if (dataInput) {
                dataInput.value = dataCompleta;
            }
            mostrarNovoEvento();
        }
    };
    
    return diaDiv;
}

/**
 * Atualiza título do mês
 */
function atualizarTituloMes() {
    try {
        const mesAno = document.getElementById('mesAno');
        if (mesAno && estadoSistema) {
            mesAno.textContent = `${CALENDARIO_SETTINGS.MESES[estadoSistema.mesAtual]} ${estadoSistema.anoAtual}`;
        }
    } catch (error) {
        console.error('❌ Erro ao atualizar título do mês:', error);
    }
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
            <span>${tipoConfig.icone} ${evento.diaCompleto ? 'Dia todo' : (evento.horarioInicio || '00:00')}</span>
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
    if (!dados?.eventos) return [];
    
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
    try {
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
        
    } catch (error) {
        console.error('❌ Erro ao verificar recorrência:', error);
        return false;
    }
}

/**
 * Atualiza timeline de próximos eventos
 */
function atualizarTimelineEventos() {
    try {
        const timeline = document.getElementById('timelineEventos');
        if (!timeline || !dados?.eventos) return;
        
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
                        • ${formatarData ? formatarData(evento.dataCompleta) : evento.dataCompleta}
                        ${evento.diaCompleto ? '• Dia todo' : `• ${evento.horarioInicio || '00:00'}`}
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
        
        console.log('✅ Timeline de eventos atualizada:', eventos.length, 'eventos');
        
    } catch (error) {
        console.error('❌ Erro ao atualizar timeline:', error);
    }
}

/**
 * Muda o mês do calendário
 */
function mudarMes(direcao) {
    try {
        if (!estadoSistema) {
            console.error('❌ Estado do sistema não encontrado!');
            return;
        }
        
        estadoSistema.mesAtual += direcao;
        if (estadoSistema.mesAtual < 0) {
            estadoSistema.mesAtual = 11;
            estadoSistema.anoAtual--;
        } else if (estadoSistema.mesAtual > 11) {
            estadoSistema.mesAtual = 0;
            estadoSistema.anoAtual++;
        }
        
        gerarCalendario();
        
        if (typeof atualizarEstatisticas === 'function') {
            atualizarEstatisticas();
        }
        
        console.log('📅 Mês alterado:', CALENDARIO_SETTINGS.MESES[estadoSistema.mesAtual], estadoSistema.anoAtual);
        
    } catch (error) {
        console.error('❌ Erro ao mudar mês:', error);
    }
}

/**
 * Edita um evento existente
 */
function editarEvento(evento) {
    try {
        console.log('✏️ Editando evento:', evento.titulo);
        
        if (!estadoSistema) {
            console.error('❌ Estado do sistema não encontrado!');
            return;
        }
        
        estadoSistema.editandoEvento = evento.id;
        estadoSistema.pessoasSelecionadas.clear();
        estadoSistema.tarefasVinculadas.clear();
        
        // Marcar como editando se função existir
        if (typeof marcarEditando === 'function') {
            marcarEditando('evento', evento.id);
        }
        
        // Preencher formulário
        preencherFormularioEvento(evento);
        
        // Atualizar interface
        atualizarCamposEvento();
        toggleHorarios();
        toggleRecorrencia();
        atualizarListaPessoas();
        atualizarListaTarefasVinculadas();
        
        // Mostrar modal
        const modal = document.getElementById('modalEvento');
        if (modal) {
            modal.classList.add('active');
        }
        
    } catch (error) {
        console.error('❌ Erro ao editar evento:', error);
        if (window.Notifications) {
            window.Notifications.erro('Erro ao abrir evento para edição');
        }
    }
}

/**
 * Preenche formulário com dados do evento
 */
function preencherFormularioEvento(evento) {
    try {
        const campos = [
            { id: 'modalEventoTitulo', tipo: 'text', valor: 'Editar Evento' },
            { id: 'eventoId', tipo: 'value', valor: evento.id },
            { id: 'eventoTipo', tipo: 'value', valor: evento.tipo },
            { id: 'eventoTitulo', tipo: 'value', valor: evento.titulo },
            { id: 'eventoDescricao', tipo: 'value', valor: evento.descricao || '' },
            { id: 'eventoDiaCompleto', tipo: 'checked', valor: evento.diaCompleto },
            { id: 'eventoData', tipo: 'value', valor: evento.data },
            { id: 'eventoDataFim', tipo: 'value', valor: evento.dataFim || '' },
            { id: 'eventoHorarioInicio', tipo: 'value', valor: evento.horarioInicio || '09:00' },
            { id: 'eventoHorarioFim', tipo: 'value', valor: evento.horarioFim || '' },
            { id: 'eventoLocal', tipo: 'value', valor: evento.local || '' }
        ];
        
        campos.forEach(campo => {
            const elemento = document.getElementById(campo.id);
            if (elemento) {
                if (campo.tipo === 'text') {
                    elemento.textContent = campo.valor;
                } else if (campo.tipo === 'checked') {
                    elemento.checked = campo.valor;
                } else {
                    elemento.value = campo.valor;
                }
            }
        });
        
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
        const eventoRecorrente = document.getElementById('eventoRecorrente');
        if (evento.recorrencia && eventoRecorrente) {
            eventoRecorrente.checked = true;
            
            const recorrenciaConfig = document.getElementById('recorrenciaConfig');
            if (recorrenciaConfig) {
                recorrenciaConfig.classList.remove('hidden');
            }
            
            const recorrenciaTipo = document.getElementById('recorrenciaTipo');
            if (recorrenciaTipo) {
                recorrenciaTipo.value = evento.recorrencia.tipo;
            }
            
            const recorrenciaFim = document.getElementById('recorrenciaFim');
            if (recorrenciaFim) {
                recorrenciaFim.value = evento.recorrencia.fim || '';
            }
            
            if (evento.recorrencia.diasSemana) {
                document.querySelectorAll('#grupoDiasSemana input[type="checkbox"]').forEach(cb => {
                    cb.checked = evento.recorrencia.diasSemana.includes(parseInt(cb.value));
                });
            }
        }
        
        console.log('✅ Formulário preenchido com dados do evento');
        
    } catch (error) {
        console.error('❌ Erro ao preencher formulário:', error);
    }
}

/**
 * Deleta um evento
 */
function deletarEvento(id) {
    try {
        if (!confirm('Deseja realmente excluir este evento? Se for recorrente, todas as ocorrências serão removidas.')) {
            return;
        }
        
        if (!dados?.eventos) {
            console.error('❌ Dados de eventos não encontrados!');
            return;
        }
        
        const evento = dados.eventos.find(e => e.id === id);
        dados.eventos = dados.eventos.filter(e => e.id !== id);
        
        if (typeof salvarDados === 'function') {
            salvarDados();
        }
        
        gerarCalendario();
        
        if (typeof atualizarEstatisticas === 'function') {
            atualizarEstatisticas();
        }
        
        // Atualizar todas as agendas pessoais
        if (typeof atualizarTodasAgendasPessoais === 'function') {
            atualizarTodasAgendasPessoais();
        }
        
        if (window.Notifications) {
            window.Notifications.sucesso(evento && evento.recorrencia ? 'Evento recorrente excluído!' : 'Evento excluído!');
        }
        
        console.log('🗑️ Evento excluído:', id);
        
    } catch (error) {
        console.error('❌ Erro ao deletar evento:', error);
        if (window.Notifications) {
            window.Notifications.erro('Erro ao excluir evento');
        }
    }
}

// ========== INICIALIZAÇÃO ROBUSTA DO CALENDÁRIO ==========

/**
 * Inicializa o calendário com verificações robustas
 */
function inicializarCalendario() {
    if (calendarioInicializado) {
        console.log('📅 Calendário já foi inicializado');
        return true;
    }
    
    tentativasInicializacao++;
    console.log(`📅 Tentativa de inicialização do calendário: ${tentativasInicializacao}/${MAX_TENTATIVAS}`);
    
    // Verificar dependências
    if (!verificarDependenciasCalendario()) {
        if (tentativasInicializacao < MAX_TENTATIVAS) {
            console.log(`⏳ Aguardando dependências... tentativa ${tentativasInicializacao}`);
            setTimeout(inicializarCalendario, INTERVALO_TENTATIVA);
            return false;
        } else {
            console.error('❌ Máximo de tentativas atingido - calendário não pôde ser inicializado');
            return false;
        }
    }
    
    try {
        // Configurar data atual
        if (!configurarDataAtual()) {
            console.error('❌ Falha ao configurar data atual');
            return false;
        }
        
        // Gerar calendário
        if (!gerarCalendario()) {
            console.error('❌ Falha ao gerar calendário');
            return false;
        }
        
        // Configurar eventos do formulário
        configurarEventosFormulario();
        
        // Marcar como inicializado
        calendarioInicializado = true;
        
        console.log('✅ Calendário inicializado com sucesso!');
        
        if (window.Notifications) {
            window.Notifications.sucesso('Calendário carregado!');
        }
        
        return true;
        
    } catch (error) {
        console.error('❌ Erro na inicialização do calendário:', error);
        
        if (tentativasInicializacao < MAX_TENTATIVAS) {
            setTimeout(inicializarCalendario, INTERVALO_TENTATIVA);
            return false;
        }
        
        if (window.Notifications) {
            window.Notifications.erro('Erro ao carregar calendário');
        }
        
        return false;
    }
}

/**
 * Configura eventos do formulário
 */
function configurarEventosFormulario() {
    try {
        // Listener para mudança de tipo de evento
        const tipoEvento = document.getElementById('eventoTipo');
        if (tipoEvento) {
            tipoEvento.removeEventListener('change', atualizarCamposEvento); // Remove listener anterior
            tipoEvento.addEventListener('change', atualizarCamposEvento);
        }
        
        // Listener para dia completo
        const diaCompleto = document.getElementById('eventoDiaCompleto');
        if (diaCompleto) {
            diaCompleto.removeEventListener('change', handleDiaCompletoChange);
            diaCompleto.addEventListener('change', handleDiaCompletoChange);
        }
        
        // Listener para recorrência
        const eventoRecorrente = document.getElementById('eventoRecorrente');
        if (eventoRecorrente) {
            eventoRecorrente.removeEventListener('change', toggleRecorrencia);
            eventoRecorrente.addEventListener('change', toggleRecorrencia);
        }
        
        console.log('✅ Eventos do formulário configurados');
        
    } catch (error) {
        console.error('❌ Erro ao configurar eventos do formulário:', error);
    }
}

/**
 * Handler para mudança de dia completo
 */
function handleDiaCompletoChange() {
    atualizarCamposEvento();
    toggleHorarios();
}

/**
 * Força reinicialização do calendário
 */
function reinicializarCalendario() {
    console.log('🔄 Forçando reinicialização do calendário...');
    calendarioInicializado = false;
    tentativasInicializacao = 0;
    return inicializarCalendario();
}

/**
 * Verifica se calendário precisa ser reinicializado
 */
function verificarEstadoCalendario() {
    if (!calendarioInicializado) {
        console.log('⚠️ Calendário não inicializado, tentando inicializar...');
        return inicializarCalendario();
    }
    
    const calendario = document.getElementById('calendario');
    if (!calendario || !calendario.children.length) {
        console.log('⚠️ Calendário vazio detectado, reinicializando...');
        return reinicializarCalendario();
    }
    
    return true;
}

// ========== EVENTOS E INICIALIZAÇÃO AUTOMÁTICA ==========

/**
 * Aguarda carregamento e inicializa
 */
function aguardarEInicializar() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(inicializarCalendario, 100);
        });
    } else {
        setTimeout(inicializarCalendario, 50);
    }
}

// Inicializar quando DOM estiver pronto
aguardarEInicializar();

// Inicializar quando janela carregar completamente
window.addEventListener('load', () => {
    setTimeout(() => {
        if (!verificarEstadoCalendario()) {
            console.log('🔄 Tentativa adicional de inicialização...');
            setTimeout(reinicializarCalendario, 500);
        }
    }, 200);
});

// Verificação periódica se calendário está funcionando
setInterval(() => {
    if (!verificarEstadoCalendario()) {
        console.log('🔄 Verificação periódica: reinicializando calendário...');
        reinicializarCalendario();
    }
}, 30000); // A cada 30 segundos

// ========== API PÚBLICA ==========

// Exportar funções principais para uso global
window.calendarioFunctions = {
    mostrarNovoEvento,
    atualizarCamposEvento,
    toggleHorarios,
    toggleRecorrencia,
    gerarCalendario,
    mudarMes,
    editarEvento,
    deletarEvento,
    inicializarCalendario,
    reinicializarCalendario,
    verificarEstadoCalendario,
    atualizarListaPessoas,
    atualizarListaTarefasVinculadas,
    removerPessoa,
    removerTarefa
};

// Garantir disponibilidade global das funções principais
window.mostrarNovoEvento = mostrarNovoEvento;
window.atualizarCamposEvento = atualizarCamposEvento;
window.toggleHorarios = toggleHorarios;
window.toggleRecorrencia = toggleRecorrencia;
window.mudarMes = mudarMes;
window.editarEvento = editarEvento;
window.deletarEvento = deletarEvento;
window.removerPessoa = removerPessoa;
window.removerTarefa = removerTarefa;
window.atualizarListaPessoas = atualizarListaPessoas;
window.atualizarListaTarefasVinculadas = atualizarListaTarefasVinculadas;

console.log('📅 Módulo calendário.js v5.1 carregado com sucesso - Inicialização Robusta Ativada');
console.log('✅ Funções críticas implementadas: mostrarNovoEvento() e atualizarCamposEvento()');
console.log('🔧 Sistema de verificação periódica ativado');