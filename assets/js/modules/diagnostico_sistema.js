/**
 * MÓDULO DE DIAGNÓSTICO E DEBUG - Sistema de Gestão v5.1
 * Ferramenta para identificar e corrigir problemas de inicialização
 */

// ========== SISTEMA DE DIAGNÓSTICO ==========

/**
 * Executa diagnóstico completo do sistema
 */
function executarDiagnostico() {
    console.log('🔍 === DIAGNÓSTICO COMPLETO DO SISTEMA ===');
    
    const relatorio = {
        timestamp: new Date().toISOString(),
        versao: '5.1',
        problemas: [],
        avisos: [],
        sucessos: [],
        recomendacoes: []
    };
    
    // 1. Verificar dependências críticas
    verificarDependenciasCriticas(relatorio);
    
    // 2. Verificar estado do sistema
    verificarEstadoSistema(relatorio);
    
    // 3. Verificar elementos DOM
    verificarElementosDOM(relatorio);
    
    // 4. Verificar dados
    verificarDados(relatorio);
    
    // 5. Verificar calendário específico
    verificarCalendario(relatorio);
    
    // 6. Gerar resumo
    gerarResumo(relatorio);
    
    return relatorio;
}

/**
 * Verifica dependências críticas
 */
function verificarDependenciasCriticas(relatorio) {
    console.log('📦 Verificando dependências críticas...');
    
    const dependencias = [
        { nome: 'firebase', check: () => typeof firebase !== 'undefined' },
        { nome: 'firebase.database', check: () => typeof firebase !== 'undefined' && firebase.database },
        { nome: 'firebase.auth', check: () => typeof firebase !== 'undefined' && firebase.auth },
        { nome: 'console', check: () => typeof console !== 'undefined' },
        { nome: 'localStorage', check: () => typeof localStorage !== 'undefined' },
        { nome: 'document', check: () => typeof document !== 'undefined' },
        { nome: 'window', check: () => typeof window !== 'undefined' }
    ];
    
    dependencias.forEach(dep => {
        try {
            if (dep.check()) {
                relatorio.sucessos.push(`✅ ${dep.nome} disponível`);
            } else {
                relatorio.problemas.push(`❌ ${dep.nome} não encontrado`);
            }
        } catch (error) {
            relatorio.problemas.push(`❌ Erro ao verificar ${dep.nome}: ${error.message}`);
        }
    });
}

/**
 * Verifica estado do sistema
 */
function verificarEstadoSistema(relatorio) {
    console.log('🏗️ Verificando estado do sistema...');
    
    if (typeof estadoSistema === 'undefined' || estadoSistema === null) {
        relatorio.problemas.push('❌ estadoSistema não definido');
        relatorio.recomendacoes.push('💡 Execute: estadoSistema = { mesAtual: new Date().getMonth(), anoAtual: new Date().getFullYear() }');
        return;
    }
    
    relatorio.sucessos.push('✅ estadoSistema encontrado');
    
    // Verificar propriedades essenciais
    const propriedades = ['mesAtual', 'anoAtual'];
    propriedades.forEach(prop => {
        if (typeof estadoSistema[prop] !== 'undefined') {
            relatorio.sucessos.push(`✅ estadoSistema.${prop} = ${estadoSistema[prop]}`);
        } else {
            relatorio.problemas.push(`❌ estadoSistema.${prop} não definido`);
        }
    });
    
    // Verificar Sets e Maps
    const colecoes = ['pessoasSelecionadas', 'tarefasVinculadas', 'alertasPrazosExibidos'];
    colecoes.forEach(col => {
        if (estadoSistema[col]) {
            relatorio.sucessos.push(`✅ estadoSistema.${col} disponível`);
        } else {
            relatorio.avisos.push(`⚠️ estadoSistema.${col} não inicializado`);
        }
    });
}

/**
 * Verifica elementos DOM essenciais
 */
function verificarElementosDOM(relatorio) {
    console.log('🎨 Verificando elementos DOM...');
    
    const elementos = [
        'calendario',
        'modalEvento',
        'eventoTipo',
        'eventoTitulo',
        'eventoData',
        'modalEventoTitulo',
        'mainContainer',
        'loginScreen'
    ];
    
    elementos.forEach(id => {
        const elemento = document.getElementById(id);
        if (elemento) {
            relatorio.sucessos.push(`✅ Elemento #${id} encontrado`);
        } else {
            relatorio.problemas.push(`❌ Elemento #${id} não encontrado`);
        }
    });
    
    // Verificar se calendário tem conteúdo
    const calendario = document.getElementById('calendario');
    if (calendario) {
        if (calendario.children.length > 0) {
            relatorio.sucessos.push(`✅ Calendário tem ${calendario.children.length} elementos`);
        } else {
            relatorio.avisos.push('⚠️ Calendário está vazio');
        }
    }
}

/**
 * Verifica dados do sistema
 */
function verificarDados(relatorio) {
    console.log('📊 Verificando dados...');
    
    if (typeof dados === 'undefined' || dados === null) {
        relatorio.problemas.push('❌ Variável dados não definida');
        relatorio.recomendacoes.push('💡 Execute inicializarDados() ou carregue dados do Firebase');
        return;
    }
    
    relatorio.sucessos.push('✅ Variável dados encontrada');
    
    // Verificar estrutura dos dados
    const estruturas = ['areas', 'eventos', 'feriados'];
    estruturas.forEach(est => {
        if (dados[est]) {
            const tamanho = Array.isArray(dados[est]) ? dados[est].length : Object.keys(dados[est]).length;
            relatorio.sucessos.push(`✅ dados.${est} disponível (${tamanho} itens)`);
        } else {
            relatorio.avisos.push(`⚠️ dados.${est} não encontrado`);
        }
    });
}

/**
 * Verifica calendário específico
 */
function verificarCalendario(relatorio) {
    console.log('📅 Verificando calendário específico...');
    
    // Verificar funções críticas
    const funcoes = [
        'mostrarNovoEvento',
        'atualizarCamposEvento',
        'gerarCalendario',
        'mudarMes',
        'editarEvento',
        'deletarEvento'
    ];
    
    funcoes.forEach(func => {
        if (typeof window[func] === 'function') {
            relatorio.sucessos.push(`✅ Função ${func}() disponível`);
        } else {
            relatorio.problemas.push(`❌ Função ${func}() não encontrada`);
        }
    });
    
    // Verificar se calendário foi inicializado
    if (typeof calendarioInicializado !== 'undefined' && calendarioInicializado) {
        relatorio.sucessos.push('✅ Calendário marcado como inicializado');
    } else {
        relatorio.avisos.push('⚠️ Calendário não foi inicializado');
        relatorio.recomendacoes.push('💡 Execute inicializarCalendario()');
    }
}

/**
 * Gera resumo do diagnóstico
 */
function gerarResumo(relatorio) {
    const total = relatorio.problemas.length + relatorio.avisos.length + relatorio.sucessos.length;
    const percentualSucesso = Math.round((relatorio.sucessos.length / total) * 100);
    
    console.log(`\n📊 === RESUMO DO DIAGNÓSTICO ===`);
    console.log(`✅ Sucessos: ${relatorio.sucessos.length}`);
    console.log(`⚠️ Avisos: ${relatorio.avisos.length}`);
    console.log(`❌ Problemas: ${relatorio.problemas.length}`);
    console.log(`📈 Saúde do sistema: ${percentualSucesso}%`);
    
    if (relatorio.problemas.length > 0) {
        console.log(`\n❌ PROBLEMAS CRÍTICOS:`);
        relatorio.problemas.forEach(problema => console.log(problema));
    }
    
    if (relatorio.avisos.length > 0) {
        console.log(`\n⚠️ AVISOS:`);
        relatorio.avisos.forEach(aviso => console.log(aviso));
    }
    
    if (relatorio.recomendacoes.length > 0) {
        console.log(`\n💡 RECOMENDAÇÕES:`);
        relatorio.recomendacoes.forEach(rec => console.log(rec));
    }
    
    console.log(`\n=================================\n`);
    
    // Sugerir ações
    if (relatorio.problemas.length > 0) {
        console.log('🔧 Execute: tentarCorrecaoAutomatica() para tentar corrigir automaticamente');
    }
    
    if (percentualSucesso < 80) {
        console.log('⚠️ Sistema com problemas significativos - verifique os logs acima');
    } else if (percentualSucesso < 95) {
        console.log('✅ Sistema funcionando com pequenos avisos');
    } else {
        console.log('🎉 Sistema funcionando perfeitamente!');
    }
}

/**
 * Tenta correção automática de problemas comuns
 */
function tentarCorrecaoAutomatica() {
    console.log('🔧 === TENTANDO CORREÇÃO AUTOMÁTICA ===');
    
    let corrigido = 0;
    
    // 1. Corrigir estadoSistema
    if (typeof estadoSistema === 'undefined' || estadoSistema === null) {
        window.estadoSistema = {
            mesAtual: new Date().getMonth(),
            anoAtual: new Date().getFullYear(),
            pessoasSelecionadas: new Set(),
            tarefasVinculadas: new Map(),
            alertasPrazosExibidos: new Set(),
            editandoEvento: null
        };
        console.log('✅ estadoSistema criado');
        corrigido++;
    } else {
        // Garantir propriedades essenciais
        if (typeof estadoSistema.mesAtual === 'undefined') {
            estadoSistema.mesAtual = new Date().getMonth();
            console.log('✅ estadoSistema.mesAtual corrigido');
            corrigido++;
        }
        
        if (typeof estadoSistema.anoAtual === 'undefined') {
            estadoSistema.anoAtual = new Date().getFullYear();
            console.log('✅ estadoSistema.anoAtual corrigido');
            corrigido++;
        }
        
        if (!estadoSistema.pessoasSelecionadas) {
            estadoSistema.pessoasSelecionadas = new Set();
            console.log('✅ estadoSistema.pessoasSelecionadas criado');
            corrigido++;
        }
        
        if (!estadoSistema.tarefasVinculadas) {
            estadoSistema.tarefasVinculadas = new Map();
            console.log('✅ estadoSistema.tarefasVinculadas criado');
            corrigido++;
        }
        
        if (!estadoSistema.alertasPrazosExibidos) {
            estadoSistema.alertasPrazosExibidos = new Set();
            console.log('✅ estadoSistema.alertasPrazosExibidos criado');
            corrigido++;
        }
    }
    
    // 2. Corrigir dados
    if (typeof dados === 'undefined' || dados === null) {
        window.dados = {
            areas: {},
            eventos: [],
            feriados: {}
        };
        console.log('✅ Estrutura dados criada');
        corrigido++;
    }
    
    // 3. Corrigir funções essenciais
    const funcoesEssenciais = {
        formatarData: function(data) {
            if (!data) return '';
            try {
                const dataObj = new Date(data + 'T00:00:00');
                return dataObj.toLocaleDateString('pt-BR');
            } catch (e) {
                return data;
            }
        },
        calcularDiasRestantes: function(prazo) {
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);
            const dataPrazo = new Date(prazo + 'T00:00:00');
            dataPrazo.setHours(0, 0, 0, 0);
            const diff = dataPrazo - hoje;
            return Math.floor(diff / (1000 * 60 * 60 * 24));
        },
        salvarDados: function() {
            console.log('💾 Função salvarDados() chamada (stub)');
        },
        fecharModal: function(modalId) {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.remove('active');
                console.log('🔒 Modal fechado:', modalId);
            }
        }
    };
    
    Object.entries(funcoesEssenciais).forEach(([nome, funcao]) => {
        if (typeof window[nome] === 'undefined') {
            window[nome] = funcao;
            console.log(`✅ Função ${nome}() criada`);
            corrigido++;
        }
    });
    
    // 4. Tentar inicializar calendário
    if (typeof inicializarCalendario === 'function') {
        try {
            if (inicializarCalendario()) {
                console.log('✅ Calendário inicializado');
                corrigido++;
            }
        } catch (error) {
            console.log('❌ Erro ao inicializar calendário:', error.message);
        }
    }
    
    console.log(`\n🎯 Correção automática concluída: ${corrigido} itens corrigidos`);
    
    if (corrigido > 0) {
        console.log('💡 Execute novamente executarDiagnostico() para verificar o resultado');
    }
    
    return corrigido;
}

/**
 * Monitora sistema em tempo real
 */
function iniciarMonitoramento() {
    console.log('📊 Iniciando monitoramento em tempo real...');
    
    // Monitor de erros JavaScript
    const errosOriginais = window.onerror;
    window.onerror = function(message, source, lineno, colno, error) {
        console.error('🚨 ERRO DETECTADO:', {
            message,
            source,
            line: lineno,
            column: colno,
            error: error?.stack
        });
        
        // Tentar recuperação automática para erros do calendário
        if (message.includes('atualizarCamposEvento') || message.includes('mostrarNovoEvento')) {
            console.log('🔄 Tentando recuperação automática...');
            setTimeout(tentarCorrecaoAutomatica, 1000);
        }
        
        if (errosOriginais) {
            return errosOriginais.apply(this, arguments);
        }
    };
    
    // Monitor de promises rejeitadas
    window.addEventListener('unhandledrejection', function(event) {
        console.error('🚨 PROMISE REJEITADA:', event.reason);
    });
    
    // Monitor periódico de saúde
    setInterval(() => {
        const relatorio = executarDiagnosticoRapido();
        if (relatorio.problemas.length > 0) {
            console.warn('⚠️ Problemas detectados no monitoramento:', relatorio.problemas);
        }
    }, 60000); // A cada minuto
    
    console.log('✅ Monitoramento ativado');
}

/**
 * Diagnóstico rápido para monitoramento
 */
function executarDiagnosticoRapido() {
    const problemas = [];
    
    // Verificações básicas
    if (typeof estadoSistema === 'undefined') problemas.push('estadoSistema indefinido');
    if (typeof dados === 'undefined') problemas.push('dados indefinidos');
    if (typeof mostrarNovoEvento !== 'function') problemas.push('mostrarNovoEvento não é função');
    if (typeof atualizarCamposEvento !== 'function') problemas.push('atualizarCamposEvento não é função');
    
    // Verificar calendário
    const calendario = document.getElementById('calendario');
    if (!calendario) problemas.push('elemento calendário não encontrado');
    
    return { problemas };
}

/**
 * Exporta relatório de diagnóstico
 */
function exportarDiagnostico() {
    const relatorio = executarDiagnostico();
    
    const blob = new Blob([JSON.stringify(relatorio, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `diagnostico_sistema_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    
    console.log('📄 Relatório de diagnóstico exportado');
}

/**
 * Modo debug avançado
 */
function ativarModoDebug() {
    console.log('🐛 === MODO DEBUG ATIVADO ===');
    
    // Interceptar todas as chamadas de função
    const funcoes = ['mostrarNovoEvento', 'atualizarCamposEvento', 'gerarCalendario', 'mudarMes'];
    
    funcoes.forEach(nome => {
        if (typeof window[nome] === 'function') {
            const original = window[nome];
            window[nome] = function(...args) {
                console.log(`🔍 Chamando ${nome}() com argumentos:`, args);
                try {
                    const resultado = original.apply(this, args);
                    console.log(`✅ ${nome}() executado com sucesso`);
                    return resultado;
                } catch (error) {
                    console.error(`❌ Erro em ${nome}():`, error);
                    throw error;
                }
            };
        }
    });
    
    // Log de mudanças no DOM
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.target.id === 'calendario') {
                console.log('🎨 Calendário modificado:', mutation);
            }
        });
    });
    
    const calendario = document.getElementById('calendario');
    if (calendario) {
        observer.observe(calendario, { childList: true, subtree: true });
    }
    
    console.log('🐛 Modo debug ativo - todas as chamadas serão logadas');
}

// ========== API PÚBLICA ==========

window.sistemaDebug = {
    executarDiagnostico,
    tentarCorrecaoAutomatica,
    iniciarMonitoramento,
    exportarDiagnostico,
    ativarModoDebug,
    executarDiagnosticoRapido
};

// Comandos rápidos para console
window.diagnostico = executarDiagnostico;
window.corrigir = tentarCorrecaoAutomatica;
window.debug = ativarModoDebug;

console.log('🔍 Sistema de diagnóstico carregado');
console.log('💡 Comandos disponíveis:');
console.log('   diagnostico() - Executa diagnóstico completo');
console.log('   corrigir() - Tenta correção automática');
console.log('   debug() - Ativa modo debug avançado');
console.log('   sistemaDebug.exportarDiagnostico() - Exporta relatório');
