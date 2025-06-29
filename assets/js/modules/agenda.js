 /* ==========================================================================
   MÓDULO AGENDA PESSOAL - Sistema de Gestão v5.1
   ========================================================================== */

/**
 * Módulo responsável por toda a gestão de agenda pessoal individual
 * Inclui tarefas pessoais, status diário, observações e integração com calendário
 * 
 * FUNCIONALIDADES:
 * - Agenda semanal individual
 * - Tarefas pessoais (recorrentes e únicas)
 * - Status diário (presente, ausência, home office)
 * - Observações pessoais
 * - Integração com calendário da equipe
 * - Sincronização automática
 * - Responsabilidades vindas das atividades
 * 
 * ESTRUTURA DE DADOS:
 * - agendas: {pessoa: {dia: [...tarefas], observacoes: string}}
 * - statusPessoal: {pessoa: {data: {tipo, observacao}}}
 * - tarefasPessoais: separadas por pessoa e tipo
 * 
 * @author Sistema de Gestão
 * @version 5.1
 */

// ========== EXPORTAÇÃO DO MÓDULO ==========
window.AgendaModule = (function() {
    'use strict';

    // ========== VARIÁVEIS PRIVADAS ==========
    let dados = null;
    let estadoSistema = null;
    let pessoaAtual = null;
    let agendaCache = new Map();
    let intervalosAtualizacao = new Set();

    // ========== CONSTANTES ==========
    const DIAS_SEMANA = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
    const DIAS_NOMES = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const DIAS_UTEIS = ['segunda', 'terca', 'quarta', 'quinta', 'sexta'];
    const TIPOS_RECORRENCIA = {
        'unica': 'Única vez',
        'diaria': 'Diária',
        'semanal': 'Semanal',
        'quinzenal': 'Quinzenal',
        'mensal': 'Mensal'
    };
    const TIPOS_STATUS = {
        'presente': { label: 'Presente', icon: '✅', color: '#10b981' },
        'ausencia': { label: 'Ausência', icon: '❌', color: '#ef4444' },
        'home-office': { label: 'Home Office', icon: '🏠', color: '#3b82f6' }
    };

    // ========== INICIALIZAÇÃO ==========
    function init(dadosGlobais, estadoGlobal) {
        console.log('🗓️ Inicializando módulo Agenda Pessoal...');
        
        dados = dadosGlobais;
        estadoSistema = estadoGlobal;
        
        inicializarEstruturaAgenda();
        configurarEventListeners();
        
        console.log('✅ Módulo Agenda Pessoal inicializado com sucesso');
        
        return {
            // Funções públicas expostas
            mostrarAgendaIndividual,
            renderizarAgendaSemana,
            adicionarTarefaPessoal,
            editarTarefaPessoal,
            deletarTarefaPessoal,
            marcarStatusDia,
            salvarObservacoes,
            sincronizarComCalendario,
            obterEventosAgenda,
            limparCache,
            exportarAgenda,
            importarAgenda
        };
    }

    // ========== ESTRUTURA DE DADOS ==========
    function inicializarEstruturaAgenda() {
        if (!dados.agendas) {
            dados.agendas = {};
        }
        if (!dados.statusPessoal) {
            dados.statusPessoal = {};
        }
        if (!dados.tarefasPessoais) {
            dados.tarefasPessoais = {};
        }
    }

    function garantirEstruturaUsuario(nomeUsuario) {
        if (!dados.agendas[nomeUsuario]) {
            dados.agendas[nomeUsuario] = {
                observacoes: '',
                configuracoes: {
                    horaInicio: '08:00',
                    horaFim: '18:00',
                    intervalos: ['12:00-13:00'],
                    notificacoes: true
                }
            };
            
            // Inicializar dias da semana
            DIAS_UTEIS.forEach(dia => {
                dados.agendas[nomeUsuario][dia] = [];
            });
        }
        
        if (!dados.statusPessoal[nomeUsuario]) {
            dados.statusPessoal[nomeUsuario] = {};
        }
        
        if (!dados.tarefasPessoais[nomeUsuario]) {
            dados.tarefasPessoais[nomeUsuario] = {
                recorrentes: [],
                unicas: [],
                templates: []
            };
        }
    }

    // ========== GESTÃO DE AGENDA INDIVIDUAL ==========
    function mostrarAgendaIndividual(nome, cargo, origem = null) {
        pessoaAtual = nome;
        garantirEstruturaUsuario(nome);
        
        // Esconder outras telas
        document.getElementById('painelArea')?.classList.add('hidden');
        document.getElementById('dashboardExecutivo')?.classList.add('hidden');
        document.getElementById('agendaIndividual')?.classList.remove('hidden');
        
        // Atualizar cabeçalho
        const pessoaNomeEl = document.getElementById('pessoaNome');
        const pessoaCargoEl = document.getElementById('pessoaCargo');
        
        if (pessoaNomeEl) pessoaNomeEl.textContent = nome;
        if (pessoaCargoEl) pessoaCargoEl.textContent = cargo;
        
        // Renderizar componentes
        renderizarResponsabilidades(nome);
        renderizarAgendaSemana(nome);
        carregarObservacoes(nome);
        atualizarEstatisticasAgenda(nome);
        
        // Atualizar breadcrumb
        if (window.LayoutModule && window.LayoutModule.atualizarBreadcrumb) {
            const path = origem ? `Dashboard > ${origem} > ${nome}` : `Dashboard > ${nome}`;
            window.LayoutModule.atualizarBreadcrumb(path);
        }
        
        // Cache da agenda atual
        agendaCache.set('atual', { nome, cargo, timestamp: Date.now() });
        
        console.log(`📅 Agenda individual aberta para: ${nome}`);
    }

    // ========== RENDERIZAÇÃO DA AGENDA SEMANAL ==========
    function renderizarAgendaSemana(nome) {
        const container = document.getElementById('agendaSemana');
        if (!container) return;
        
        container.innerHTML = '';
        garantirEstruturaUsuario(nome);
        
        const hoje = new Date();
        const inicioSemana = obterInicioSemana(hoje);
        
        DIAS_UTEIS.forEach((dia, index) => {
            const diaDiv = document.createElement('div');
            diaDiv.className = 'dia-semana';
            diaDiv.setAttribute('data-dia', dia);
            
            // Calcular data do dia
            const dataDodia = new Date(inicioSemana);
            dataDodia.setDate(inicioSemana.getDate() + index + 1); // +1 porque começamos na segunda
            const dataFormatada = dataDodia.toISOString().split('T')[0];
            
            // Verificar se é hoje
            const ehHoje = dataFormatada === hoje.toISOString().split('T')[0];
            
            // Cabeçalho do dia
            const cabecalho = document.createElement('h4');
            cabecalho.className = 'dia-cabecalho';
            cabecalho.innerHTML = `
                ${DIAS_NOMES[index + 1]} 
                <span class="data-dia">${formatarDataCompacta(dataFormatada)}</span>
                ${ehHoje ? '<span class="hoje-badge">HOJE</span>' : ''}
            `;
            diaDiv.appendChild(cabecalho);
            
            // Status do dia
            const statusDia = dados.statusPessoal[nome]?.[dataFormatada];
            if (statusDia) {
                const statusConfig = TIPOS_STATUS[statusDia.tipo];
                const statusDiv = document.createElement('div');
                statusDiv.className = `status-dia status-${statusDia.tipo}`;
                statusDiv.innerHTML = `
                    <span class="status-icon">${statusConfig.icon}</span>
                    <span class="status-label">${statusConfig.label}</span>
                    ${statusDia.observacao ? `<div class="status-obs">${statusDia.observacao}</div>` : ''}
                `;
                diaDiv.appendChild(statusDiv);
            }
            
            // Tarefas do dia (recorrentes)
            const tarefasDia = obterTarefasDoDia(nome, dia, dataFormatada);
            tarefasDia.forEach(tarefa => {
                const tarefaDiv = criarElementoTarefa(tarefa, nome, dia, dataFormatada);
                diaDiv.appendChild(tarefaDiv);
            });
            
            // Eventos do calendário principal relacionados
            const eventosRelevantes = obterEventosRelevantes(nome, dataFormatada);
            eventosRelevantes.forEach(evento => {
                const eventoDiv = criarElementoEvento(evento, nome);
                diaDiv.appendChild(eventoDiv);
            });
            
            // Botão adicionar tarefa
            const btnAdicionar = document.createElement('button');
            btnAdicionar.className = 'btn btn-primary btn-sm adicionar-tarefa-dia';
            btnAdicionar.innerHTML = '+ Tarefa';
            btnAdicionar.onclick = () => mostrarModalTarefaDia(nome, dia, dataFormatada);
            diaDiv.appendChild(btnAdicionar);
            
            container.appendChild(diaDiv);
        });
        
        // Atualizar contador de tarefas na interface
        atualizarContadorTarefas(nome);
    }

    function obterInicioSemana(data) {
        const inicio = new Date(data);
        const diaSemana = inicio.getDay();
        const diasParaSubtrair = diaSemana === 0 ? 6 : diaSemana - 1; // Segunda = 0
        inicio.setDate(inicio.getDate() - diasParaSubtrair);
        inicio.setHours(0, 0, 0, 0);
        return inicio;
    }

    function obterTarefasDoDia(nome, dia, data) {
        const tarefas = [];
        const agendaPessoa = dados.agendas[nome];
        
        // Tarefas recorrentes do dia da semana
        if (agendaPessoa && agendaPessoa[dia]) {
            agendaPessoa[dia].forEach(tarefa => {
                if (verificarTarefaAplicavel(tarefa, data)) {
                    tarefas.push({
                        ...tarefa,
                        tipo: 'recorrente',
                        origem: 'agenda'
                    });
                }
            });
        }
        
        // Tarefas únicas para esta data específica
        if (dados.tarefasPessoais[nome]?.unicas) {
            dados.tarefasPessoais[nome].unicas.forEach(tarefa => {
                if (tarefa.data === data) {
                    tarefas.push({
                        ...tarefa,
                        tipo: 'unica',
                        origem: 'pessoal'
                    });
                }
            });
        }
        
        // Ordenar por horário
        return tarefas.sort((a, b) => {
            const horaA = a.horario || '00:00';
            const horaB = b.horario || '00:00';
            return horaA.localeCompare(horaB);
        });
    }

    function verificarTarefaAplicavel(tarefa, data) {
        if (!tarefa.recorrencia || tarefa.recorrencia === 'semanal') {
            return true;
        }
        
        const dataObj = new Date(data);
        const hoje = new Date();
        
        switch (tarefa.recorrencia) {
            case 'quinzenal':
                const diffSemanas = Math.floor((dataObj - hoje) / (7 * 24 * 60 * 60 * 1000));
                return diffSemanas % 2 === 0;
            case 'mensal':
                return dataObj.getDate() === hoje.getDate();
            default:
                return true;
        }
    }

    function obterEventosRelevantes(nome, data) {
        if (!dados.eventos) return [];
        
        return dados.eventos.filter(evento => {
            if (evento.data !== data) return false;
            if (!evento.pessoas || evento.pessoas.length === 0) return false;
            return evento.pessoas.includes(nome) || evento.pessoas.includes('Todos');
        });
    }

    // ========== CRIAÇÃO DE ELEMENTOS ==========
    function criarElementoTarefa(tarefa, nome, dia, data) {
        const div = document.createElement('div');
        let classes = 'tarefa tarefa-pessoal';
        
        if (tarefa.mostrarNoCalendario) classes += ' tarefa-global';
        if (tarefa.recorrencia && tarefa.recorrencia !== 'unica') classes += ' tarefa-recorrente';
        if (tarefa.prioridade === 'alta') classes += ' prioridade-alta';
        
        div.className = classes;
        div.setAttribute('data-tarefa-id', tarefa.id);
        
        const horario = tarefa.horario || '';
        const recorrenciaTexto = tarefa.recorrencia && tarefa.recorrencia !== 'unica' 
            ? TIPOS_RECORRENCIA[tarefa.recorrencia] 
            : '';
        
        div.innerHTML = `
            <div class="tarefa-conteudo">
                <div class="tarefa-header">
                    <span class="tarefa-horario">${horario}</span>
                    <span class="tarefa-titulo">${tarefa.descricao}</span>
                </div>
                
                ${tarefa.observacoes ? `<div class="tarefa-obs">${tarefa.observacoes}</div>` : ''}
                
                <div class="tarefa-footer">
                    ${recorrenciaTexto ? `<span class="recorrencia-tag">🔄 ${recorrenciaTexto}</span>` : ''}
                    ${tarefa.mostrarNoCalendario ? '<span class="calendario-tag">📅</span>' : ''}
                    ${tarefa.prioridade === 'alta' ? '<span class="prioridade-tag">⚡</span>' : ''}
                </div>
            </div>
            
            <div class="tarefa-acoes">
                <button class="btn-acao edit-btn" onclick="AgendaModule.editarTarefaPessoal('${tarefa.id}', '${nome}', '${dia}')" title="Editar">
                    ✏️
                </button>
                <button class="btn-acao delete-btn" onclick="AgendaModule.deletarTarefaPessoal('${tarefa.id}', '${nome}', '${dia}')" title="Excluir">
                    🗑️
                </button>
            </div>
        `;
        
        // Tooltip com informações detalhadas
        div.title = `${tarefa.descricao}
${horario ? `⏰ ${horario}` : ''}
${recorrenciaTexto ? `🔄 ${recorrenciaTexto}` : ''}
${tarefa.observacoes ? `📝 ${tarefa.observacoes}` : ''}
${tarefa.mostrarNoCalendario ? '📅 Visível no calendário da equipe' : ''}`;
        
        return div;
    }

    function criarElementoEvento(evento, nome) {
        const div = document.createElement('div');
        div.className = 'evento-agenda evento-calendario';
        
        const tipoConfig = obterConfigTipoEvento(evento.tipo);
        div.style.background = tipoConfig.background;
        div.style.borderLeft = `4px solid ${tipoConfig.border}`;
        
        const horarioTexto = evento.diaCompleto 
            ? 'Dia todo' 
            : `${evento.horarioInicio}${evento.horarioFim ? ` - ${evento.horarioFim}` : ''}`;
        
        div.innerHTML = `
            <div class="evento-header">
                <span class="evento-tipo-icon">${tipoConfig.icon}</span>
                <span class="evento-titulo">${evento.titulo}</span>
            </div>
            <div class="evento-horario">${horarioTexto}</div>
            ${evento.local ? `<div class="evento-local">📍 ${evento.local}</div>` : ''}
            ${evento.pessoas.length > 1 ? `<div class="evento-participantes">👥 ${evento.pessoas.length} pessoas</div>` : ''}
        `;
        
        div.onclick = () => {
            if (window.CalendarioModule && window.CalendarioModule.editarEvento) {
                window.CalendarioModule.editarEvento(evento);
            }
        };
        
        div.title = `${evento.titulo}
${evento.descricao || ''}
Clique para editar`;
        
        return div;
    }

    function obterConfigTipoEvento(tipo) {
        const configs = {
            'reuniao': { icon: '📅', background: '#dbeafe', border: '#3b82f6' },
            'entrega': { icon: '📦', background: '#d1fae5', border: '#10b981' },
            'prazo': { icon: '⏰', background: '#fee2e2', border: '#ef4444' },
            'marco': { icon: '🎯', background: '#e0e7ff', border: '#8b5cf6' },
            'outro': { icon: '📌', background: '#f3f4f6', border: '#6b7280' }
        };
        return configs[tipo] || configs.outro;
    }

    // ========== GESTÃO DE TAREFAS PESSOAIS ==========
    function mostrarModalTarefaDia(nome, dia, data) {
        const modal = criarModalTarefa(nome, dia, data);
        document.body.appendChild(modal);
        modal.classList.add('active');
    }

    function criarModalTarefa(nome, dia, data, tarefa = null) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'modalTarefaPessoal';
        
        const isEdicao = !!tarefa;
        const titulo = isEdicao ? 'Editar Tarefa Pessoal' : 'Nova Tarefa Pessoal';
        
        modal.innerHTML = `
            <div class="modal-content">
                <h3>${titulo}</h3>
                
                <form id="formTarefaPessoal" onsubmit="return false;">
                    <input type="hidden" id="tarefaId" value="${tarefa?.id || ''}">
                    <input type="hidden" id="tarefaNome" value="${nome}">
                    <input type="hidden" id="tarefaDia" value="${dia}">
                    <input type="hidden" id="tarefaData" value="${data}">
                    
                    <div class="form-group">
                        <label>Tipo de Agendamento</label>
                        <select id="tipoAgendamento" onchange="alternarTipoTarefa()">
                            <option value="semanal" ${!tarefa || tarefa.tipo === 'recorrente' ? 'selected' : ''}>
                                Recorrente (${DIAS_NOMES[DIAS_UTEIS.indexOf(dia) + 1]})
                            </option>
                            <option value="data" ${tarefa?.tipo === 'unica' ? 'selected' : ''}>
                                Data específica (${formatarDataLegivel(data)})
                            </option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Descrição <span class="obrigatorio">*</span></label>
                        <input type="text" id="tarefaDescricao" placeholder="Digite a descrição da tarefa" 
                               value="${tarefa?.descricao || ''}" required>
                    </div>
                    
                    <div class="form-group">
                        <label>Horário</label>
                        <input type="time" id="tarefaHorario" value="${tarefa?.horario || '09:00'}">
                    </div>
                    
                    <div class="form-group" id="grupoRecorrencia">
                        <label>Recorrência</label>
                        <select id="tarefaRecorrencia">
                            <option value="semanal" ${tarefa?.recorrencia === 'semanal' ? 'selected' : ''}>Semanal</option>
                            <option value="quinzenal" ${tarefa?.recorrencia === 'quinzenal' ? 'selected' : ''}>Quinzenal</option>
                            <option value="mensal" ${tarefa?.recorrencia === 'mensal' ? 'selected' : ''}>Mensal</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Prioridade</label>
                        <select id="tarefaPrioridade">
                            <option value="baixa" ${tarefa?.prioridade === 'baixa' ? 'selected' : ''}>🟢 Baixa</option>
                            <option value="media" ${!tarefa || tarefa?.prioridade === 'media' ? 'selected' : ''}>🟡 Média</option>
                            <option value="alta" ${tarefa?.prioridade === 'alta' ? 'selected' : ''}>🔴 Alta</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Observações</label>
                        <textarea id="tarefaObservacoes" rows="3" placeholder="Observações adicionais...">${tarefa?.observacoes || ''}</textarea>
                    </div>
                    
                    <div class="form-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="tarefaCalendario" ${tarefa?.mostrarNoCalendario ? 'checked' : ''}>
                            📅 Mostrar no calendário da equipe
                        </label>
                        <small>Marque para tarefas importantes que toda equipe deve ver</small>
                    </div>
                </form>
                
                <div class="modal-acoes">
                    <button class="btn btn-secondary" onclick="fecharModalTarefa()">Cancelar</button>
                    <button class="btn btn-primary" onclick="salvarTarefaPessoal()">
                        ${isEdicao ? 'Salvar Alterações' : 'Criar Tarefa'}
                    </button>
                </div>
            </div>
        `;
        
        // Event listener para fechar modal ao clicar fora
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                fecharModalTarefa();
            }
        });
        
        return modal;
    }

    function adicionarTarefaPessoal(nome, dadosTarefa) {
        garantirEstruturaUsuario(nome);
        
        const novaTarefa = {
            id: `tarefa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            descricao: dadosTarefa.descricao,
            horario: dadosTarefa.horario,
            recorrencia: dadosTarefa.recorrencia || 'semanal',
            prioridade: dadosTarefa.prioridade || 'media',
            observacoes: dadosTarefa.observacoes || '',
            mostrarNoCalendario: dadosTarefa.mostrarNoCalendario || false,
            criadoEm: new Date().toISOString(),
            criadoPor: nome
        };
        
        if (dadosTarefa.tipo === 'unica') {
            // Tarefa para data específica
            novaTarefa.data = dadosTarefa.data;
            dados.tarefasPessoais[nome].unicas.push(novaTarefa);
            
            // Se deve aparecer no calendário, criar evento
            if (novaTarefa.mostrarNoCalendario) {
                criarEventoParaTarefa(novaTarefa, nome);
            }
        } else {
            // Tarefa recorrente
            dados.agendas[nome][dadosTarefa.dia].push(novaTarefa);
        }
        
        // Salvar e atualizar interface
        if (window.StateModule && window.StateModule.salvarDados) {
            window.StateModule.salvarDados();
        }
        
        renderizarAgendaSemana(nome);
        
        // Log da atividade
        console.log(`✅ Tarefa pessoal adicionada para ${nome}: ${novaTarefa.descricao}`);
        
        return novaTarefa;
    }

    function editarTarefaPessoal(tarefaId, nome, dia) {
        const tarefa = encontrarTarefa(tarefaId, nome, dia);
        if (!tarefa) {
            console.error('Tarefa não encontrada:', tarefaId);
            return;
        }
        
        // Determinar data atual do dia para o modal
        const hoje = new Date();
        const inicioSemana = obterInicioSemana(hoje);
        const indiceDia = DIAS_UTEIS.indexOf(dia);
        const dataDodia = new Date(inicioSemana);
        dataDodia.setDate(inicioSemana.getDate() + indiceDia + 1);
        const dataFormatada = dataDodia.toISOString().split('T')[0];
        
        const modal = criarModalTarefa(nome, dia, dataFormatada, tarefa);
        document.body.appendChild(modal);
        modal.classList.add('active');
    }

    function deletarTarefaPessoal(tarefaId, nome, dia) {
        if (!confirm('Deseja realmente excluir esta tarefa?')) return;
        
        const tarefa = encontrarTarefa(tarefaId, nome, dia);
        if (!tarefa) return;
        
        // Remover da estrutura apropriada
        if (tarefa.tipo === 'unica') {
            dados.tarefasPessoais[nome].unicas = dados.tarefasPessoais[nome].unicas.filter(t => t.id !== tarefaId);
        } else {
            dados.agendas[nome][dia] = dados.agendas[nome][dia].filter(t => t.id !== tarefaId);
        }
        
        // Remover evento relacionado se existir
        if (tarefa.mostrarNoCalendario && dados.eventos) {
            dados.eventos = dados.eventos.filter(e => e.origem !== 'tarefa_pessoal' || e.tarefaId !== tarefaId);
        }
        
        // Salvar e atualizar
        if (window.StateModule && window.StateModule.salvarDados) {
            window.StateModule.salvarDados();
        }
        
        renderizarAgendaSemana(nome);
        
        if (window.NotificationsModule && window.NotificationsModule.mostrar) {
            window.NotificationsModule.mostrar('Tarefa excluída com sucesso!');
        }
        
        console.log(`🗑️ Tarefa pessoal excluída: ${tarefa.descricao}`);
    }

    function encontrarTarefa(tarefaId, nome, dia) {
        // Procurar em tarefas recorrentes
        if (dados.agendas[nome] && dados.agendas[nome][dia]) {
            const tarefaRecorrente = dados.agendas[nome][dia].find(t => t.id === tarefaId);
            if (tarefaRecorrente) {
                return { ...tarefaRecorrente, tipo: 'recorrente' };
            }
        }
        
        // Procurar em tarefas únicas
        if (dados.tarefasPessoais[nome]?.unicas) {
            const tarefaUnica = dados.tarefasPessoais[nome].unicas.find(t => t.id === tarefaId);
            if (tarefaUnica) {
                return { ...tarefaUnica, tipo: 'unica' };
            }
        }
        
        return null;
    }

    // ========== INTEGRAÇÃO COM CALENDÁRIO ==========
    function criarEventoParaTarefa(tarefa, nome) {
        if (!dados.eventos) dados.eventos = [];
        
        const evento = {
            id: Date.now(),
            titulo: tarefa.descricao,
            tipo: 'outro',
            data: tarefa.data,
            horarioInicio: tarefa.horario,
            diaCompleto: false,
            pessoas: [nome],
            origem: 'tarefa_pessoal',
            tarefaId: tarefa.id,
            descricao: tarefa.observacoes || `Tarefa pessoal de ${nome}`
        };
        
        dados.eventos.push(evento);
        return evento;
    }

    function sincronizarComCalendario() {
        if (!pessoaAtual) return;
        
        // Sincronizar tarefas que devem aparecer no calendário
        const tarefasCalendario = [];
        
        // Tarefas recorrentes
        DIAS_UTEIS.forEach(dia => {
            if (dados.agendas[pessoaAtual] && dados.agendas[pessoaAtual][dia]) {
                dados.agendas[pessoaAtual][dia].forEach(tarefa => {
                    if (tarefa.mostrarNoCalendario) {
                        tarefasCalendario.push({ ...tarefa, dia });
                    }
                });
            }
        });
        
        // Tarefas únicas
        if (dados.tarefasPessoais[pessoaAtual]?.unicas) {
            dados.tarefasPessoais[pessoaAtual].unicas.forEach(tarefa => {
                if (tarefa.mostrarNoCalendario) {
                    tarefasCalendario.push(tarefa);
                }
            });
        }
        
        // Criar/atualizar eventos correspondentes
        tarefasCalendario.forEach(tarefa => {
            const eventoExistente = dados.eventos?.find(e => 
                e.origem === 'tarefa_pessoal' && e.tarefaId === tarefa.id
            );
            
            if (!eventoExistente && tarefa.data) {
                criarEventoParaTarefa(tarefa, pessoaAtual);
            }
        });
        
        console.log(`🔄 Sincronização de agenda realizada para ${pessoaAtual}`);
    }

    // ========== GESTÃO DE STATUS DIÁRIO ==========
    function marcarStatusDia(nome, data, tipo, observacao = '') {
        garantirEstruturaUsuario(nome);
        
        if (tipo === 'presente') {
            // Remover status se for "presente" (padrão)
            delete dados.statusPessoal[nome][data];
        } else {
            dados.statusPessoal[nome][data] = {
                tipo: tipo,
                observacao: observacao,
                marcadoEm: new Date().toISOString()
            };
        }
        
        // Salvar dados
        if (window.StateModule && window.StateModule.salvarDados) {
            window.StateModule.salvarDados();
        }
        
        // Atualizar interface
        if (nome === pessoaAtual) {
            renderizarAgendaSemana(nome);
        }
        
        const statusConfig = TIPOS_STATUS[tipo];
        console.log(`📅 Status marcado para ${nome} em ${data}: ${statusConfig.label}`);
    }

    // ========== OBSERVAÇÕES PESSOAIS ==========
    function carregarObservacoes(nome) {
        const textarea = document.getElementById('observacoesPessoais');
        if (textarea) {
            garantirEstruturaUsuario(nome);
            textarea.value = dados.agendas[nome].observacoes || '';
        }
    }

    function salvarObservacoes(nome = pessoaAtual) {
        if (!nome) return;
        
        const textarea = document.getElementById('observacoesPessoais');
        if (textarea) {
            garantirEstruturaUsuario(nome);
            dados.agendas[nome].observacoes = textarea.value;
            
            if (window.StateModule && window.StateModule.salvarDados) {
                window.StateModule.salvarDados();
            }
            
            console.log(`📝 Observações salvas para ${nome}`);
        }
    }

    // ========== ESTATÍSTICAS E CONTADORES ==========
    function atualizarEstatisticasAgenda(nome) {
        const stats = calcularEstatisticasAgenda(nome);
        
        // Atualizar contador de tarefas
        const contador = document.getElementById('contadorTarefas');
        if (contador) {
            contador.textContent = stats.totalTarefas;
            contador.className = `contador-tarefas ${stats.totalTarefas > 10 ? 'muitas' : stats.totalTarefas > 5 ? 'moderado' : ''}`;
        }
        
        // Atualizar outras estatísticas se houver elementos na interface
        atualizarElementoSeExistir('estatTarefasRecorrentes', stats.tarefasRecorrentes);
        atualizarElementoSeExistir('estatTarefasUnicas', stats.tarefasUnicas);
        atualizarElementoSeExistir('estatTarefasCalendario', stats.tarefasCalendario);
    }

    function calcularEstatisticasAgenda(nome) {
        garantirEstruturaUsuario(nome);
        
        let tarefasRecorrentes = 0;
        let tarefasUnicas = dados.tarefasPessoais[nome].unicas.length;
        let tarefasCalendario = 0;
        
        // Contar tarefas recorrentes
        DIAS_UTEIS.forEach(dia => {
            if (dados.agendas[nome][dia]) {
                tarefasRecorrentes += dados.agendas[nome][dia].length;
                tarefasCalendario += dados.agendas[nome][dia].filter(t => t.mostrarNoCalendario).length;
            }
        });
        
        // Contar tarefas únicas que aparecem no calendário
        tarefasCalendario += dados.tarefasPessoais[nome].unicas.filter(t => t.mostrarNoCalendario).length;
        
        return {
            totalTarefas: tarefasRecorrentes + tarefasUnicas,
            tarefasRecorrentes,
            tarefasUnicas,
            tarefasCalendario
        };
    }

    function atualizarContadorTarefas(nome) {
        const stats = calcularEstatisticasAgenda(nome);
        const contador = document.getElementById('contadorResponsabilidades');
        
        if (contador) {
            // Obter responsabilidades das atividades
            let responsabilidades = 0;
            if (dados.areas) {
                Object.values(dados.areas).forEach(area => {
                    area.atividades.forEach(atividade => {
                        if (atividade.responsaveis.includes(nome)) {
                            responsabilidades++;
                        }
                    });
                });
            }
            
            contador.textContent = responsabilidades;
            contador.style.background = responsabilidades > 5 ? '#fbbf24' : '#e5e7eb';
        }
    }

    // ========== UTILITÁRIOS ==========
    function formatarDataCompacta(data) {
        const d = new Date(data);
        return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
    }

    function formatarDataLegivel(data) {
        const d = new Date(data);
        const opcoes = { day: 'numeric', month: 'long' };
        return d.toLocaleDateString('pt-BR', opcoes);
    }

    function atualizarElementoSeExistir(id, valor) {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.textContent = valor;
        }
    }

    // ========== FUNÇÕES AUXILIARES DE MODAL ==========
    function alternarTipoTarefa() {
        const tipo = document.getElementById('tipoAgendamento').value;
        const grupoRecorrencia = document.getElementById('grupoRecorrencia');
        
        if (tipo === 'data') {
            grupoRecorrencia.style.display = 'none';
        } else {
            grupoRecorrencia.style.display = 'block';
        }
    }

    function salvarTarefaPessoal() {
        const form = document.getElementById('formTarefaPessoal');
        if (!form) return;
        
        const dadosForm = {
            id: document.getElementById('tarefaId').value,
            nome: document.getElementById('tarefaNome').value,
            dia: document.getElementById('tarefaDia').value,
            data: document.getElementById('tarefaData').value,
            tipo: document.getElementById('tipoAgendamento').value,
            descricao: document.getElementById('tarefaDescricao').value,
            horario: document.getElementById('tarefaHorario').value,
            recorrencia: document.getElementById('tarefaRecorrencia').value,
            prioridade: document.getElementById('tarefaPrioridade').value,
            observacoes: document.getElementById('tarefaObservacoes').value,
            mostrarNoCalendario: document.getElementById('tarefaCalendario').checked
        };
        
        // Validação básica
        if (!dadosForm.descricao.trim()) {
            alert('Descrição é obrigatória!');
            return;
        }
        
        const isEdicao = !!dadosForm.id;
        
        if (isEdicao) {
            // Editar tarefa existente
            atualizarTarefaExistente(dadosForm);
        } else {
            // Criar nova tarefa
            adicionarTarefaPessoal(dadosForm.nome, dadosForm);
        }
        
        fecharModalTarefa();
        
        if (window.NotificationsModule && window.NotificationsModule.mostrar) {
            window.NotificationsModule.mostrar(
                isEdicao ? 'Tarefa atualizada com sucesso!' : 'Tarefa criada com sucesso!'
            );
        }
    }

    function atualizarTarefaExistente(dadosForm) {
        const tarefa = encontrarTarefa(dadosForm.id, dadosForm.nome, dadosForm.dia);
        if (!tarefa) return;
        
        // Atualizar propriedades
        Object.assign(tarefa, {
            descricao: dadosForm.descricao,
            horario: dadosForm.horario,
            recorrencia: dadosForm.recorrencia,
            prioridade: dadosForm.prioridade,
            observacoes: dadosForm.observacoes,
            mostrarNoCalendario: dadosForm.mostrarNoCalendario,
            atualizadoEm: new Date().toISOString()
        });
        
        // Salvar dados
        if (window.StateModule && window.StateModule.salvarDados) {
            window.StateModule.salvarDados();
        }
        
        renderizarAgendaSemana(dadosForm.nome);
        
        console.log(`✏️ Tarefa atualizada: ${tarefa.descricao}`);
    }

    function fecharModalTarefa() {
        const modal = document.getElementById('modalTarefaPessoal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        }
    }

    // ========== EVENT LISTENERS ==========
    function configurarEventListeners() {
        // Event listener global para salvar observações
        document.addEventListener('blur', (e) => {
            if (e.target && e.target.id === 'observacoesPessoais') {
                salvarObservacoes();
            }
        }, true);
        
        // Event listener para atalhos de teclado
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'n' && pessoaAtual) {
                e.preventDefault();
                mostrarModalTarefaDia(pessoaAtual, 'segunda', new Date().toISOString().split('T')[0]);
            }
        });
    }

    // ========== UTILITÁRIOS DE EXPORTAÇÃO/IMPORTAÇÃO ==========
    function exportarAgenda(nome) {
        garantirEstruturaUsuario(nome);
        
        const agendaExport = {
            nome: nome,
            agenda: dados.agendas[nome],
            statusPessoal: dados.statusPessoal[nome],
            tarefasPessoais: dados.tarefasPessoais[nome],
            exportadoEm: new Date().toISOString(),
            versao: '5.1'
        };
        
        const blob = new Blob([JSON.stringify(agendaExport, null, 2)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `agenda-${nome}-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        console.log(`📥 Agenda exportada para: ${nome}`);
    }

    function importarAgenda(nome, dadosImportacao) {
        if (!dadosImportacao.agenda) {
            throw new Error('Dados de agenda inválidos');
        }
        
        garantirEstruturaUsuario(nome);
        
        // Fazer backup atual
        const backup = {
            agenda: dados.agendas[nome],
            statusPessoal: dados.statusPessoal[nome],
            tarefasPessoais: dados.tarefasPessoais[nome]
        };
        
        try {
            // Importar dados
            dados.agendas[nome] = dadosImportacao.agenda;
            dados.statusPessoal[nome] = dadosImportacao.statusPessoal || {};
            dados.tarefasPessoais[nome] = dadosImportacao.tarefasPessoais || {
                recorrentes: [],
                unicas: [],
                templates: []
            };
            
            // Salvar e atualizar interface
            if (window.StateModule && window.StateModule.salvarDados) {
                window.StateModule.salvarDados();
            }
            
            if (nome === pessoaAtual) {
                renderizarAgendaSemana(nome);
            }
            
            console.log(`📤 Agenda importada para: ${nome}`);
            
        } catch (error) {
            // Restaurar backup em caso de erro
            dados.agendas[nome] = backup.agenda;
            dados.statusPessoal[nome] = backup.statusPessoal;
            dados.tarefasPessoais[nome] = backup.tarefasPessoais;
            
            throw error;
        }
    }

    // ========== CACHE E PERFORMANCE ==========
    function limparCache() {
        agendaCache.clear();
        intervalosAtualizacao.forEach(interval => clearInterval(interval));
        intervalosAtualizacao.clear();
        console.log('🧹 Cache de agenda limpo');
    }

    function obterEventosAgenda(nome, dataInicio, dataFim) {
        const eventos = [];
        
        // Implementar lógica para obter eventos em um período
        // Usado para integrações externas
        
        return eventos;
    }

    // ========== RENDERIZAÇÃO DE RESPONSABILIDADES ==========
    function renderizarResponsabilidades(nome) {
        const lista = document.getElementById('responsabilidadesLista');
        if (!lista || !dados.areas) return;
        
        lista.innerHTML = '';
        let totalResponsabilidades = 0;
        let responsabilidades = [];
        
        // Coletar responsabilidades de todas as áreas
        Object.entries(dados.areas).forEach(([areaKey, area]) => {
            area.atividades.forEach(atividade => {
                if (atividade.responsaveis.includes(nome)) {
                    totalResponsabilidades++;
                    responsabilidades.push({
                        atividade: atividade,
                        areaKey: areaKey,
                        areaNome: area.nome,
                        prazoData: new Date(atividade.prazo)
                    });
                }
            });
        });
        
        // Ordenar por prazo
        responsabilidades.sort((a, b) => a.prazoData - b.prazoData);
        
        // Aplicar filtro se existir
        const filtro = document.getElementById('filtroResponsabilidades')?.value || 'todas';
        const responsabilidadesFiltradas = aplicarFiltroResponsabilidades(responsabilidades, filtro);
        
        // Renderizar responsabilidades
        responsabilidadesFiltradas.forEach(({atividade, areaKey, areaNome}) => {
            const elemento = criarElementoResponsabilidade(atividade, areaKey, areaNome, nome);
            lista.appendChild(elemento);
        });
        
        // Atualizar contador
        atualizarContadorResponsabilidades(totalResponsabilidades, responsabilidadesFiltradas.length, filtro);
        
        // Mostrar mensagem se vazio
        if (totalResponsabilidades === 0) {
            mostrarMensagemVaziaResponsabilidades(lista);
        } else if (responsabilidadesFiltradas.length === 0) {
            mostrarMensagemFiltroVazio(lista);
        }
    }

    function aplicarFiltroResponsabilidades(responsabilidades, filtro) {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        
        return responsabilidades.filter(({atividade}) => {
            const prazo = new Date(atividade.prazo);
            prazo.setHours(0, 0, 0, 0);
            const diasRestantes = Math.floor((prazo - hoje) / (1000 * 60 * 60 * 24));
            
            switch(filtro) {
                case 'urgentes':
                    return diasRestantes <= 3 && diasRestantes >= 0;
                case 'atrasadas':
                    return diasRestantes < 0;
                case 'emdia':
                    return atividade.status === 'verde';
                case 'atencao':
                    return atividade.status === 'amarelo';
                default:
                    return true;
            }
        });
    }

    function criarElementoResponsabilidade(atividade, areaKey, areaNome, nome) {
        const div = document.createElement('div');
        const diasRestantes = calcularDiasRestantes(atividade.prazo);
        const foiAdicionadoRecentemente = verificarSeERecente(atividade.dataAdicionado);
        
        div.className = 'responsabilidade-item';
        div.style.cssText = obterEstiloResponsabilidade(diasRestantes);
        
        div.innerHTML = `
            <div class="responsabilidade-header">
                <div class="responsabilidade-info">
                    <span class="status-indicator status-${atividade.status}"></span>
                    <strong class="responsabilidade-nome">${atividade.nome}</strong>
                    ${foiAdicionadoRecentemente ? '<span class="badge-novo">NOVO</span>' : ''}
                </div>
                <div class="responsabilidade-acoes">
                    <button class="btn btn-primary btn-sm" onclick="gerenciarTarefasResponsabilidade(${atividade.id}, '${areaKey}')">
                        📋 Tarefas
                    </button>
                    <button class="btn btn-primary btn-sm" onclick="editarResponsabilidade(${atividade.id}, '${areaKey}')">
                        ✏️ Editar
                    </button>
                    ${atividade.responsaveis.length > 1 ? `
                        <button class="btn btn-danger btn-sm" onclick="removerResponsabilidade(${atividade.id}, '${areaKey}', '${nome}')" 
                                title="Remover-me desta atividade">
                            ❌ Sair
                        </button>
                    ` : ''}
                </div>
            </div>
            
            <div class="responsabilidade-detalhes">
                <div class="responsabilidade-area">${areaNome}</div>
                <div class="responsabilidade-prazo">
                    Prazo: ${formatarDataCompacta(atividade.prazo)} 
                    <span class="prazo-status">${obterTextoPrazo(diasRestantes)}</span>
                </div>
                <div class="responsabilidade-responsaveis">
                    Responsáveis: ${atividade.responsaveis.join(', ')}
                </div>
            </div>
            
            <div class="responsabilidade-progresso">
                <select onchange="mudarStatusResponsabilidade(${atividade.id}, '${areaKey}', this.value)" 
                        class="status-select">
                    <option value="verde" ${atividade.status === 'verde' ? 'selected' : ''}>🟢 Em Dia</option>
                    <option value="amarelo" ${atividade.status === 'amarelo' ? 'selected' : ''}>🟡 Atenção</option>
                    <option value="vermelho" ${atividade.status === 'vermelho' ? 'selected' : ''}>🔴 Atraso</option>
                </select>
                
                <div class="progresso-container">
                    <input type="number" value="${calcularProgressoAtividade(atividade)}" 
                           min="0" max="100" readonly class="progresso-input"
                           title="Progresso calculado automaticamente pelas tarefas">
                    <span class="progresso-percent">%</span>
                    <div class="progresso-barra">
                        <div class="progresso-fill" style="width: ${calcularProgressoAtividade(atividade)}%;"></div>
                    </div>
                </div>
            </div>
            
            ${renderizarResumoTarefasCompacto(atividade)}
        `;
        
        return div;
    }

    // ========== FUNÇÕES AUXILIARES ==========
    function calcularDiasRestantes(prazo) {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const dataPrazo = new Date(prazo);
        dataPrazo.setHours(0, 0, 0, 0);
        return Math.floor((dataPrazo - hoje) / (1000 * 60 * 60 * 24));
    }

    function verificarSeERecente(dataAdicionado) {
        if (!dataAdicionado) return false;
        return (new Date() - new Date(dataAdicionado)) < 24 * 60 * 60 * 1000;
    }

    function obterEstiloResponsabilidade(diasRestantes) {
        let estilo = 'padding: 12px; border: 1px solid #e5e7eb; margin-bottom: 12px; border-radius: 8px; position: relative;';
        
        if (diasRestantes < 0) {
            estilo += ' border-color: #ef4444; background: #fee2e2;';
        } else if (diasRestantes <= 3) {
            estilo += ' border-color: #f59e0b; background: #fef3c7;';
        }
        
        return estilo;
    }

    function obterTextoPrazo(diasRestantes) {
        if (diasRestantes < 0) {
            return `⚠️ Atrasado ${Math.abs(diasRestantes)} dias`;
        } else if (diasRestantes === 0) {
            return '📅 Vence hoje!';
        } else if (diasRestantes <= 3) {
            return `⏰ ${diasRestantes} dias restantes`;
        } else {
            return `📅 ${diasRestantes} dias restantes`;
        }
    }

    function calcularProgressoAtividade(atividade) {
        if (!atividade.tarefas || atividade.tarefas.length === 0) {
            return atividade.progresso || 0;
        }
        
        let totalSubtarefas = 0;
        let subtarefasConcluidas = 0;
        
        atividade.tarefas.forEach(tarefa => {
            if (tarefa.subtarefas && tarefa.subtarefas.length > 0) {
                totalSubtarefas += tarefa.subtarefas.length;
                subtarefasConcluidas += tarefa.subtarefas.filter(st => st.status === 'concluida').length;
            } else {
                totalSubtarefas += 1;
                if (tarefa.status === 'concluida') subtarefasConcluidas += 1;
            }
        });
        
        return totalSubtarefas > 0 ? Math.round((subtarefasConcluidas / totalSubtarefas) * 100) : 0;
    }

    function renderizarResumoTarefasCompacto(atividade) {
        if (!atividade.tarefas || atividade.tarefas.length === 0) {
            return '';
        }
        
        const totalTarefas = atividade.tarefas.length;
        const tarefasConcluidas = atividade.tarefas.filter(t => t.status === 'concluida').length;
        
        return `
            <div class="resumo-tarefas-compacto">
                📋 ${tarefasConcluidas}/${totalTarefas} tarefas concluídas
            </div>
        `;
    }

    function atualizarContadorResponsabilidades(totalReal, totalFiltrado, filtro) {
        const contador = document.getElementById('contadorResponsabilidades');
        if (!contador) return;
        
        if (filtro !== 'todas' && totalFiltrado !== totalReal) {
            contador.textContent = `${totalFiltrado}/${totalReal}`;
        } else {
            contador.textContent = totalReal;
        }
        
        contador.style.background = totalReal > 5 ? '#fbbf24' : '#e5e7eb';
    }

    function mostrarMensagemVaziaResponsabilidades(container) {
        container.innerHTML = `
            <div class="mensagem-vazia">
                <p style="font-size: 48px; margin-bottom: 16px;">📋</p>
                <p>Você ainda não tem responsabilidades atribuídas.</p>
                <p style="font-size: 14px; margin-top: 8px;">
                    Entre em contato com seu coordenador para receber tarefas.
                </p>
            </div>
        `;
    }

    function mostrarMensagemFiltroVazio(container) {
        container.innerHTML = `
            <div class="mensagem-vazia">
                <p style="font-size: 32px; margin-bottom: 16px;">🔍</p>
                <p>Nenhuma responsabilidade encontrada com este filtro.</p>
                <p style="font-size: 14px; margin-top: 8px;">
                    Tente mudar o filtro para ver outras responsabilidades.
                </p>
            </div>
        `;
    }

    // ========== EXPOSIÇÃO PÚBLICA ==========
    return {
        init,
        mostrarAgendaIndividual,
        renderizarAgendaSemana,
        adicionarTarefaPessoal,
        editarTarefaPessoal,
        deletarTarefaPessoal,
        marcarStatusDia,
        salvarObservacoes,
        sincronizarComCalendario,
        obterEventosAgenda,
        limparCache,
        exportarAgenda,
        importarAgenda
    };

})();
