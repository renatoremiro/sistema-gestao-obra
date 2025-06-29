/**
 * MÓDULO DE TAREFAS - Sistema de Gestão v5.1
 * Responsável pelo gerenciamento de tarefas pessoais e corporativas
 */

// ========== CONFIGURAÇÕES DAS TAREFAS ==========
const TAREFAS_CONFIG = {
    TIPOS: {
        TAREFA_PESSOAL: 'tarefa_pessoal',
        TAREFA_ATIVIDADE: 'tarefa_atividade',
        SUBTAREFA: 'subtarefa'
    },
    PRIORIDADES: {
        ALTA: 'alta',
        MEDIA: 'media',
        BAIXA: 'baixa'
    },
    STATUS: {
        PENDENTE: 'pendente',
        EM_ANDAMENTO: 'em_andamento',
        CONCLUIDA: 'concluida',
        CANCELADA: 'cancelada'
    },
    CORES_PRIORIDADE: {
        alta: '#ef4444',
        media: '#f59e0b',
        baixa: '#10b981'
    }
};

// ========== TEMPLATES DE TAREFAS ==========
const TEMPLATES_TAREFAS = {
    asBuilt: {
        nome: "As Built",
        tarefas: [
            {
                descricao: "Levantamento de Campo",
                tipo: "tarefa",
                status: "pendente",
                prioridade: "alta",
                dependencias: [],
                subtarefas: [
                    { descricao: "Medição Térreo", tipo: "subtarefa", status: "pendente" },
                    { descricao: "Medição 1º Pavimento", tipo: "subtarefa", status: "pendente" },
                    { descricao: "Medição 2º Pavimento", tipo: "subtarefa", status: "pendente" },
                    { descricao: "Conferência de Medidas", tipo: "subtarefa", status: "pendente" }
                ]
            },
            {
                descricao: "Desenho Técnico",
                tipo: "tarefa",
                status: "pendente",
                prioridade: "alta",
                dependencias: ["Levantamento de Campo"],
                subtarefas: [
                    { descricao: "Plantas Baixas", tipo: "subtarefa", status: "pendente" },
                    { descricao: "Cortes", tipo: "subtarefa", status: "pendente" },
                    { descricao: "Fachadas", tipo: "subtarefa", status: "pendente" },
                    { descricao: "Detalhamentos", tipo: "subtarefa", status: "pendente" }
                ]
            },
            {
                descricao: "Revisão Técnica",
                tipo: "tarefa",
                status: "pendente",
                prioridade: "media",
                dependencias: ["Desenho Técnico"],
                subtarefas: [
                    { descricao: "Revisão Interna", tipo: "subtarefa", status: "pendente" },
                    { descricao: "Correções", tipo: "subtarefa", status: "pendente" },
                    { descricao: "Aprovação Coordenador", tipo: "subtarefa", status: "pendente" }
                ]
            },
            {
                descricao: "Entrega Final",
                tipo: "tarefa",
                status: "pendente",
                prioridade: "alta",
                dependencias: ["Revisão Técnica"],
                subtarefas: [
                    { descricao: "Gerar PDFs", tipo: "subtarefa", status: "pendente" },
                    { descricao: "Organizar Arquivos", tipo: "subtarefa", status: "pendente" },
                    { descricao: "Upload no Sistema", tipo: "subtarefa", status: "pendente" },
                    { descricao: "Notificar Cliente", tipo: "subtarefa", status: "pendente" }
                ]
            }
        ]
    },
    relatório: {
        nome: "Relatório Padrão",
        tarefas: [
            {
                descricao: "Coleta de Dados",
                tipo: "tarefa",
                status: "pendente",
                prioridade: "alta",
                dependencias: [],
                subtarefas: [
                    { descricao: "Levantamento de Informações", tipo: "subtarefa", status: "pendente" },
                    { descricao: "Organização dos Dados", tipo: "subtarefa", status: "pendente" },
                    { descricao: "Validação", tipo: "subtarefa", status: "pendente" }
                ]
            },
            {
                descricao: "Elaboração do Relatório",
                tipo: "tarefa",
                status: "pendente",
                prioridade: "alta",
                dependencias: ["Coleta de Dados"],
                subtarefas: [
                    { descricao: "Estruturação", tipo: "subtarefa", status: "pendente" },
                    { descricao: "Redação", tipo: "subtarefa", status: "pendente" },
                    { descricao: "Revisão", tipo: "subtarefa", status: "pendente" }
                ]
            },
            {
                descricao: "Finalização",
                tipo: "tarefa",
                status: "pendente",
                prioridade: "media",
                dependencias: ["Elaboração do Relatório"],
                subtarefas: [
                    { descricao: "Formatação Final", tipo: "subtarefa", status: "pendente" },
                    { descricao: "Aprovação", tipo: "subtarefa", status: "pendente" },
                    { descricao: "Entrega", tipo: "subtarefa", status: "pendente" }
                ]
            }
        ]
    }
};

// ========== FUNÇÕES DE TAREFAS ==========

/**
 * Calcula o progresso de uma atividade baseado nas tarefas
 */
function calcularProgressoAtividade(atividade) {
    if (!atividade.tarefas || atividade.tarefas.length === 0) {
        return atividade.progresso || 0;
    }
    
    let totalSubtarefas = 0;
    let subtarefasConcluidas = 0;
    
    atividade.tarefas.forEach(tarefa => {
        if (tarefa.subtarefas && tarefa.subtarefas.length > 0) {
            totalSubtarefas += tarefa.subtarefas.length;
            subtarefasConcluidas += tarefa.subtarefas.filter(st => st.status === TAREFAS_CONFIG.STATUS.CONCLUIDA).length;
        } else {
            totalSubtarefas += 1;
            if (tarefa.status === TAREFAS_CONFIG.STATUS.CONCLUIDA) subtarefasConcluidas += 1;
        }
    });
    
    return totalSubtarefas > 0 ? Math.round((subtarefasConcluidas / totalSubtarefas) * 100) : 0;
}

/**
 * Renderiza resumo compacto das tarefas para uma atividade
 */
function renderizarResumoTarefas(atividade) {
    if (!atividade.tarefas || atividade.tarefas.length === 0) {
        return `
            <div style="margin-top: 12px; padding: 8px; background: #fef3c7; border-radius: 6px; font-size: 12px;">
                ⚠️ Nenhuma tarefa definida. <a href="#" onclick="event.preventDefault(); gerenciarTarefas(${atividade.id})" style="color: #3b82f6;">Adicionar tarefas</a>
            </div>
        `;
    }
    
    const totalTarefas = atividade.tarefas.length;
    const tarefasConcluidas = atividade.tarefas.filter(t => t.status === TAREFAS_CONFIG.STATUS.CONCLUIDA).length;
    const tarefasBloqueadas = contarTarefasBloqueadas(atividade);
    const proximaTarefa = obterProximaTarefa(atividade);
    
    return `
        <div style="margin-top: 12px; padding: 12px; background: #f9fafb; border-radius: 6px; font-size: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <span class="contador-tarefas">
                        ✅ ${tarefasConcluidas}/${totalTarefas} tarefas
                        ${tarefasBloqueadas > 0 ? `<span style="color: #ef4444;">🔒 ${tarefasBloqueadas} bloqueadas</span>` : ''}
                    </span>
                </div>
                ${proximaTarefa ? `
                    <div style="color: #6b7280;">
                        Próxima: <strong>${proximaTarefa.descricao}</strong>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

/**
 * Renderiza resumo compacto para agenda pessoal
 */
function renderizarResumoTarefasCompacto(atividade) {
    if (!atividade.tarefas || atividade.tarefas.length === 0) {
        return '';
    }
    
    const totalTarefas = atividade.tarefas.length;
    const tarefasConcluidas = atividade.tarefas.filter(t => t.status === TAREFAS_CONFIG.STATUS.CONCLUIDA).length;
    
    return `
        <div style="margin-top: 8px; font-size: 11px; color: #6b7280;">
            📋 ${tarefasConcluidas}/${totalTarefas} tarefas concluídas
        </div>
    `;
}

/**
 * Conta tarefas bloqueadas por dependências
 */
function contarTarefasBloqueadas(atividade) {
    if (!atividade.tarefas) return 0;
    
    return atividade.tarefas.filter(tarefa => {
        if (!tarefa.dependencias || tarefa.dependencias.length === 0) return false;
        
        return tarefa.dependencias.some(dep => {
            const tarefaDependente = atividade.tarefas.find(t => t.descricao === dep);
            return tarefaDependente && tarefaDependente.status !== TAREFAS_CONFIG.STATUS.CONCLUIDA;
        });
    }).length;
}

/**
 * Obtém a próxima tarefa disponível
 */
function obterProximaTarefa(atividade) {
    if (!atividade.tarefas) return null;
    
    return atividade.tarefas.find(tarefa => {
        if (tarefa.status === TAREFAS_CONFIG.STATUS.CONCLUIDA) return false;
        
        if (tarefa.dependencias && tarefa.dependencias.length > 0) {
            const bloqueada = tarefa.dependencias.some(dep => {
                const tarefaDependente = atividade.tarefas.find(t => t.descricao === dep);
                return tarefaDependente && tarefaDependente.status !== TAREFAS_CONFIG.STATUS.CONCLUIDA;
            });
            if (bloqueada) return false;
        }
        
        return true;
    });
}

/**
 * Verifica se uma tarefa está bloqueada
 */
function verificarTarefaBloqueada(tarefa, atividade) {
    if (!tarefa.dependencias || tarefa.dependencias.length === 0) return false;
    
    return tarefa.dependencias.some(dep => {
        const tarefaDependente = atividade.tarefas.find(t => t.descricao === dep);
        return tarefaDependente && tarefaDependente.status !== TAREFAS_CONFIG.STATUS.CONCLUIDA;
    });
}

/**
 * Gerencia tarefas de uma atividade
 */
function gerenciarTarefas(atividadeId) {
    const area = dados.areas[estadoSistema.areaAtual];
    const atividade = area.atividades.find(a => a.id === atividadeId);
    
    if (!atividade) return;
    
    mostrarModalTarefas(atividade);
}

/**
 * Mostra modal de gerenciamento de tarefas
 */
function mostrarModalTarefas(atividade) {
    let modal = document.getElementById('modalTarefas');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modalTarefas';
        modal.className = 'modal';
        document.body.appendChild(modal);
    }
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 800px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                <div>
                    <h3>📋 Gerenciar Tarefas: ${atividade.nome}</h3>
                    <p style="color: #6b7280; font-size: 14px; margin-top: 4px;">
                        Prazo da responsabilidade: ${formatarData(atividade.prazo)} | 
                        Progresso: ${calcularProgressoAtividade(atividade)}%
                    </p>
                </div>
                <div style="display: flex; gap: 8px;">
                    <button class="btn btn-template btn-sm" onclick="aplicarTemplate(${atividade.id})">
                        📄 Aplicar Template
                    </button>
                    <button class="btn btn-primary btn-sm" onclick="adicionarTarefa(${atividade.id})">
                        + Nova Tarefa
                    </button>
                </div>
            </div>
            
            <div id="listaTarefas" style="max-height: 500px; overflow-y: auto;">
                ${renderizarListaTarefas(atividade)}
            </div>
            
            <div style="margin-top: 24px; display: flex; justify-content: flex-end;">
                <button class="btn btn-secondary" onclick="fecharModalTarefas()">Fechar</button>
            </div>
        </div>
    `;
    
    modal.classList.add('active');
}

/**
 * Renderiza lista de tarefas
 */
function renderizarListaTarefas(atividade) {
    if (!atividade.tarefas || atividade.tarefas.length === 0) {
        return `
            <div style="text-align: center; padding: 40px; color: #6b7280;">
                <p style="font-size: 48px; margin-bottom: 16px;">📋</p>
                <p>Nenhuma tarefa cadastrada ainda.</p>
                <p style="font-size: 14px; margin-top: 8px;">
                    Adicione tarefas manualmente ou aplique um template.
                </p>
            </div>
        `;
    }
    
    return atividade.tarefas.map((tarefa, index) => {
        const bloqueada = verificarTarefaBloqueada(tarefa, atividade);
        
        return `
            <div class="tarefa-item ${bloqueada ? 'dependencia-bloqueada' : ''}" id="tarefa_${tarefa.id}">
                <div class="tarefa-header">
                    ${tarefa.subtarefas && tarefa.subtarefas.length > 0 ? `
                        <span class="tarefa-expandir" onclick="toggleSubtarefas('${tarefa.id}')">▶</span>
                    ` : '<span style="width: 20px;"></span>'}
                    
                    <input type="checkbox" 
                           class="tarefa-checkbox" 
                           ${tarefa.status === TAREFAS_CONFIG.STATUS.CONCLUIDA ? 'checked' : ''}
                           ${bloqueada ? 'disabled' : ''}
                           onchange="toggleTarefa(${atividade.id}, '${tarefa.id}')">
                    
                    <span class="tarefa-descricao ${tarefa.status === TAREFAS_CONFIG.STATUS.CONCLUIDA ? 'concluida' : ''}">
                        ${tarefa.descricao}
                    </span>
                    
                    <div class="tarefa-info">
                        ${tarefa.prioridade ? `
                            <span class="prioridade-${tarefa.prioridade}">
                                ${tarefa.prioridade === 'alta' ? '🔴' : tarefa.prioridade === 'media' ? '🟡' : '🟢'}
                                ${tarefa.prioridade}
                            </span>
                        ` : ''}
                        
                        ${tarefa.responsavel ? `
                            <span>👤 ${tarefa.responsavel}</span>
                        ` : ''}
                        
                        ${tarefa.prazo ? `
                            <span>📅 ${formatarData(tarefa.prazo)}</span>
                        ` : ''}
                        
                        ${tarefa.dependencias && tarefa.dependencias.length > 0 ? `
                            <span title="Depende de: ${tarefa.dependencias.join(', ')}">
                                🔗 ${tarefa.dependencias.length} dep.
                            </span>
                        ` : ''}
                        
                        <button class="btn btn-primary btn-sm" onclick="editarTarefaModal(${atividade.id}, '${tarefa.id}')">
                            ✏️
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="deletarTarefaItem(${atividade.id}, '${tarefa.id}')">
                            🗑️
                        </button>
                    </div>
                </div>
                
                ${tarefa.subtarefas && tarefa.subtarefas.length > 0 ? `
                    <div class="subtarefas-container" id="subtarefas_${tarefa.id}" style="display: none;">
                        ${tarefa.subtarefas.map((subtarefa, subIndex) => `
                            <div class="subtarefa-item">
                                <input type="checkbox" 
                                       class="tarefa-checkbox" 
                                       ${subtarefa.status === TAREFAS_CONFIG.STATUS.CONCLUIDA ? 'checked' : ''}
                                       onchange="toggleSubtarefa(${atividade.id}, '${tarefa.id}', '${subtarefa.id}')">
                                
                                <span class="${subtarefa.status === TAREFAS_CONFIG.STATUS.CONCLUIDA ? 'concluida' : ''}">
                                    ${subtarefa.descricao}
                                </span>
                                
                                ${subtarefa.responsavel ? `
                                    <span style="font-size: 11px; color: #6b7280;">
                                        👤 ${subtarefa.responsavel}
                                    </span>
                                ` : ''}
                            </div>
                        `).join('')}
                        
                        <div style="margin-top: 8px;">
                            <button class="btn btn-primary btn-sm" onclick="adicionarSubtarefa(${atividade.id}, '${tarefa.id}')">
                                + Adicionar subtarefa
                            </button>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

/**
 * Toggle expansão de subtarefas
 */
function toggleSubtarefas(tarefaId) {
    const container = document.getElementById(`subtarefas_${tarefaId}`);
    const expandir = container.parentElement.querySelector('.tarefa-expandir');
    
    if (container.style.display === 'none') {
        container.style.display = 'block';
        expandir.classList.add('expandido');
    } else {
        container.style.display = 'none';
        expandir.classList.remove('expandido');
    }
}

/**
 * Toggle status de uma tarefa
 */
function toggleTarefa(atividadeId, tarefaId) {
    const area = dados.areas[estadoSistema.areaAtual];
    const atividade = area.atividades.find(a => a.id === atividadeId);
    const tarefa = atividade.tarefas.find(t => t.id === tarefaId);
    
    if (tarefa) {
        if (tarefa.subtarefas && tarefa.subtarefas.length > 0) {
            const subtarefasPendentes = tarefa.subtarefas.filter(st => st.status !== TAREFAS_CONFIG.STATUS.CONCLUIDA).length;
            if (subtarefasPendentes > 0 && tarefa.status !== TAREFAS_CONFIG.STATUS.CONCLUIDA) {
                mostrarNotificacao(`Conclua todas as ${subtarefasPendentes} subtarefas primeiro!`, 'error');
                mostrarModalTarefas(atividade);
                return;
            }
        }
        
        tarefa.status = tarefa.status === TAREFAS_CONFIG.STATUS.CONCLUIDA ? TAREFAS_CONFIG.STATUS.PENDENTE : TAREFAS_CONFIG.STATUS.CONCLUIDA;
        
        if (tarefa.status === TAREFAS_CONFIG.STATUS.CONCLUIDA && tarefa.subtarefas) {
            tarefa.subtarefas.forEach(st => st.status = TAREFAS_CONFIG.STATUS.CONCLUIDA);
        }
        
        const novoProgresso = calcularProgressoAtividade(atividade);
        atividade.progresso = novoProgresso;
        
        if (novoProgresso === 100) {
            atividade.status = 'verde';
            mostrarNotificacao('🎉 Todas as tarefas concluídas! Responsabilidade completa!');
        }
        
        salvarDados();
        mostrarModalTarefas(atividade);
    }
}

/**
 * Toggle status de uma subtarefa
 */
function toggleSubtarefa(atividadeId, tarefaId, subtarefaId) {
    const area = dados.areas[estadoSistema.areaAtual];
    const atividade = area.atividades.find(a => a.id === atividadeId);
    const tarefa = atividade.tarefas.find(t => t.id === tarefaId);
    const subtarefa = tarefa.subtarefas.find(st => st.id === subtarefaId);
    
    if (subtarefa) {
        subtarefa.status = subtarefa.status === TAREFAS_CONFIG.STATUS.CONCLUIDA ? TAREFAS_CONFIG.STATUS.PENDENTE : TAREFAS_CONFIG.STATUS.CONCLUIDA;
        
        const todasConcluidas = tarefa.subtarefas.every(st => st.status === TAREFAS_CONFIG.STATUS.CONCLUIDA);
        if (todasConcluidas && tarefa.status !== TAREFAS_CONFIG.STATUS.CONCLUIDA) {
            mostrarNotificacao('Todas as subtarefas concluídas! Você pode marcar a tarefa principal agora.');
        }
        
        const novoProgresso = calcularProgressoAtividade(atividade);
        atividade.progresso = novoProgresso;
        
        salvarDados();
        mostrarModalTarefas(atividade);
    }
}

/**
 * Adiciona nova tarefa
 */
function adicionarTarefa(atividadeId) {
    const descricao = prompt('Digite a descrição da nova tarefa:');
    if (!descricao) return;
    
    const area = dados.areas[estadoSistema.areaAtual];
    const atividade = area.atividades.find(a => a.id === atividadeId);
    
    if (!atividade.tarefas) atividade.tarefas = [];
    
    const novaTarefa = {
        id: `${atividadeId}_T${Date.now()}`,
        descricao: descricao,
        tipo: TAREFAS_CONFIG.TIPOS.TAREFA_ATIVIDADE,
        status: TAREFAS_CONFIG.STATUS.PENDENTE,
        responsavel: atividade.responsaveis[0] || '',
        prioridade: TAREFAS_CONFIG.PRIORIDADES.MEDIA,
        subtarefas: [],
        dependencias: [],
        observacoes: ''
    };
    
    atividade.tarefas.push(novaTarefa);
    salvarDados();
    mostrarModalTarefas(atividade);
    mostrarNotificacao('Tarefa adicionada com sucesso!');
}

/**
 * Aplica template de tarefas
 */
function aplicarTemplate(atividadeId) {
    const area = dados.areas[estadoSistema.areaAtual];
    const atividade = area.atividades.find(a => a.id === atividadeId);
    
    // Determinar template baseado no nome da atividade
    let templateNome = 'asBuilt';
    if (atividade.nome.toLowerCase().includes('relatório')) {
        templateNome = 'relatório';
    }
    
    const template = TEMPLATES_TAREFAS[templateNome];
    
    if (confirm(`Aplicar template "${template.nome}"? Isso substituirá as tarefas existentes.`)) {
        atividade.tarefas = JSON.parse(JSON.stringify(template.tarefas));
        
        atividade.tarefas.forEach((tarefa, index) => {
            tarefa.id = `${atividadeId}_T${Date.now()}_${index}`;
            tarefa.responsavel = atividade.responsaveis[0] || '';
            
            if (tarefa.subtarefas) {
                tarefa.subtarefas.forEach((sub, subIndex) => {
                    sub.id = `${tarefa.id}_S${subIndex + 1}`;
                    sub.responsavel = tarefa.responsavel;
                });
            }
        });
        
        salvarDados();
        mostrarModalTarefas(atividade);
        mostrarNotificacao('Template aplicado com sucesso!');
    }
}

/**
 * Edita tarefa no modal
 */
function editarTarefaModal(atividadeId, tarefaId) {
    const area = dados.areas[estadoSistema.areaAtual];
    const atividade = area.atividades.find(a => a.id === atividadeId);
    const tarefa = atividade.tarefas.find(t => t.id === tarefaId);
    
    if (!tarefa) return;

    estadoSistema.editandoTarefa = {atividadeId, tarefaId};
    
    // Preencher responsáveis
    const selectResponsavel = document.getElementById('editTarefaResponsavel');
    selectResponsavel.innerHTML = '';
    
    atividade.responsaveis.forEach(responsavel => {
        const option = document.createElement('option');
        option.value = responsavel;
        option.textContent = responsavel;
        option.selected = tarefa.responsavel === responsavel;
        selectResponsavel.appendChild(option);
    });

    // Preencher dependências
    const containerDependencias = document.getElementById('editTarefaDependencias');
    containerDependencias.innerHTML = '';
    
    atividade.tarefas.forEach(outraTarefa => {
        if (outraTarefa.id !== tarefaId) {
            const div = document.createElement('div');
            div.style.cssText = 'margin-bottom: 8px;';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = outraTarefa.descricao;
            checkbox.checked = tarefa.dependencias && tarefa.dependencias.includes(outraTarefa.descricao);
            checkbox.style.marginRight = '8px';
            
            const label = document.createElement('label');
            label.style.cssText = 'display: flex; align-items: center; cursor: pointer; font-size: 13px;';
            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(outraTarefa.descricao));
            
            div.appendChild(label);
            containerDependencias.appendChild(div);
        }
    });

    // Preencher campos
    document.getElementById('editTarefaAtividadeId').value = atividadeId;
    document.getElementById('editTarefaId').value = tarefaId;
    document.getElementById('editTarefaDescricao').value = tarefa.descricao || '';
    document.getElementById('editTarefaPrioridade').value = tarefa.prioridade || TAREFAS_CONFIG.PRIORIDADES.MEDIA;
    document.getElementById('editTarefaPrazo').value = tarefa.prazo || '';
    document.getElementById('editTarefaObservacoes').value = tarefa.observacoes || '';

    document.getElementById('modalEditarTarefa').classList.add('active');
}

/**
 * Salva edição de tarefa
 */
function salvarEdicaoTarefa() {
    const atividadeId = parseInt(document.getElementById('editTarefaAtividadeId').value);
    const tarefaId = document.getElementById('editTarefaId').value;
    
    if (!validarFormulario([{id: 'editTarefaDescricao'}])) {
        mostrarNotificacao('Preencha todos os campos obrigatórios!', 'error');
        return;
    }

    const area = dados.areas[estadoSistema.areaAtual];
    const atividade = area.atividades.find(a => a.id === atividadeId);
    const tarefa = atividade.tarefas.find(t => t.id === tarefaId);

    if (!tarefa) return;

    // Coletar dependências selecionadas
    const dependenciasSelecionadas = [];
    document.querySelectorAll('#editTarefaDependencias input[type="checkbox"]:checked').forEach(cb => {
        dependenciasSelecionadas.push(cb.value);
    });

    // Atualizar tarefa
    tarefa.descricao = document.getElementById('editTarefaDescricao').value;
    tarefa.prioridade = document.getElementById('editTarefaPrioridade').value;
    tarefa.responsavel = document.getElementById('editTarefaResponsavel').value;
    tarefa.prazo = document.getElementById('editTarefaPrazo').value;
    tarefa.dependencias = dependenciasSelecionadas;
    tarefa.observacoes = document.getElementById('editTarefaObservacoes').value;

    registrarAtividade('tarefa_editada', {
        tarefa: tarefa.descricao,
        atividade: atividade.nome
    });

    salvarDados();
    fecharModal('modalEditarTarefa');
    mostrarModalTarefas(atividade);
    mostrarNotificacao('Tarefa editada com sucesso!');
}

/**
 * Delete uma tarefa
 */
function deletarTarefaItem(atividadeId, tarefaId) {
    if (confirm('Deseja realmente excluir esta tarefa?')) {
        const area = dados.areas[estadoSistema.areaAtual];
        const atividade = area.atividades.find(a => a.id === atividadeId);
        
        atividade.tarefas = atividade.tarefas.filter(t => t.id !== tarefaId);
        
        salvarDados();
        mostrarModalTarefas(atividade);
        mostrarNotificacao('Tarefa excluída!');
    }
}

/**
 * Adiciona subtarefa
 */
function adicionarSubtarefa(atividadeId, tarefaId) {
    const descricao = prompt('Digite a descrição da subtarefa:');
    if (!descricao) return;
    
    const area = dados.areas[estadoSistema.areaAtual];
    const atividade = area.atividades.find(a => a.id === atividadeId);
    const tarefa = atividade.tarefas.find(t => t.id === tarefaId);
    
    if (!tarefa.subtarefas) tarefa.subtarefas = [];
    
    const novaSubtarefa = {
        id: `${tarefaId}_S${Date.now()}`,
        descricao: descricao,
        status: TAREFAS_CONFIG.STATUS.PENDENTE,
        responsavel: tarefa.responsavel || ''
    };
    
    tarefa.subtarefas.push(novaSubtarefa);
    salvarDados();
    mostrarModalTarefas(atividade);
    mostrarNotificacao('Subtarefa adicionada!');
}

/**
 * Fecha modal de tarefas
 */
function fecharModalTarefas() {
    const modal = document.getElementById('modalTarefas');
    if (modal) {
        modal.classList.remove('active');
    }
    
    const area = dados.areas[estadoSistema.areaAtual];
    renderizarAtividades(area);
    atualizarEstatisticas();
}

// ========== FUNÇÕES DE TAREFAS PESSOAIS ==========

/**
 * Mostra modal de nova tarefa pessoal
 */
function mostrarNovaTarefa() {
    document.getElementById('modalTarefa').classList.add('active');
}

/**
 * Alterna tipo de agendamento
 */
function alternarTipoAgendamento() {
    const tipo = document.getElementById('tarefaTipo').value;
    if (tipo === 'semanal') {
        document.getElementById('grupoDiaSemana').classList.remove('hidden');
        document.getElementById('grupoData').classList.add('hidden');
    } else {
        document.getElementById('grupoDiaSemana').classList.add('hidden');
        document.getElementById('grupoData').classList.remove('hidden');
    }
}

/**
 * Salva tarefa pessoal
 */
function salvarTarefa() {
    const nome = estadoSistema.pessoaAtual;
    const tipo = document.getElementById('tarefaTipo').value;
    const descricao = document.getElementById('tarefaDescricao').value;
    const horario = document.getElementById('tarefaHorario').value;
    const recorrencia = document.getElementById('tarefaRecorrencia').value;
    const mostrarNoCalendario = document.getElementById('tarefaCalendario').checked;
    
    if (!validarFormulario([
        {id: 'tarefaDescricao'},
        {id: 'tarefaHorario'}
    ])) {
        mostrarNotificacao('Preencha todos os campos obrigatórios!', 'error');
        return;
    }
    
    if (tipo === 'data') {
        if (!document.getElementById('tarefaDataEspecifica').value) {
            document.getElementById('tarefaDataEspecifica').classList.add('input-error');
            document.getElementById('tarefaDataError').classList.remove('hidden');
            mostrarNotificacao('Selecione uma data!', 'error');
            return;
        }
    }
    
    const tarefaBase = {
        id: Date.now(),
        descricao: `${descricao} - ${horario}`,
        recorrencia: recorrencia,
        mostrarNoCalendario: mostrarNoCalendario
    };
    
    if (!dados.agendas[nome]) {
        dados.agendas[nome] = {};
    }
    
    if (tipo === 'semanal') {
        const dia = document.getElementById('tarefaDia').value;
        
        if (!dados.agendas[nome][dia]) {
            dados.agendas[nome][dia] = [];
        }
        
        dados.agendas[nome][dia].push(tarefaBase);
    } else {
        const dataEspecifica = document.getElementById('tarefaDataEspecifica').value;
        
        const evento = {
            id: Date.now(),
            data: dataEspecifica,
            horarioInicio: horario,
            titulo: descricao,
            tipo: 'outro',
            pessoas: [nome],
            origem: TAREFAS_CONFIG.TIPOS.TAREFA_PESSOAL
        };
        dados.eventos.push(evento);
    }
    
    salvarDados();
    fecharModal('modalTarefa');
    renderizarAgendaSemana(nome);
    gerarCalendario();
    
    // Atualizar todas as agendas pessoais
    atualizarTodasAgendasPessoais();
    
    mostrarNotificacao('Tarefa salva com sucesso!');
}

/**
 * Deleta tarefa pessoal
 */
function deletarTarefa(nome, dia, tarefaId) {
    if (confirm('Deseja realmente excluir esta tarefa?')) {
        dados.agendas[nome][dia] = dados.agendas[nome][dia].filter(t => t.id != tarefaId);
        salvarDados();
        renderizarAgendaSemana(nome);
        
        // Atualizar todas as agendas pessoais
        atualizarTodasAgendasPessoais();
        
        mostrarNotificacao('Tarefa excluída!');
    }
}

// ========== LOG DE CARREGAMENTO ==========
if (typeof console !== 'undefined') {
    console.log('📋 Módulo tarefas.js carregado com sucesso');
}