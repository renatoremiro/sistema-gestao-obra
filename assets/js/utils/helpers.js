 /* ==========================================================================
   FUNÇÕES AUXILIARES - Sistema de Gestão v5.1
   ========================================================================== */

/**
 * Módulo responsável por funções auxiliares gerais do sistema
 * Fornece utilitários para formatação, validação, cálculos e manipulação de dados
 */

/**
 * ========== FORMATAÇÃO DE DATAS ==========
 */

/**
 * Formata data para exibição no formato brasileiro
 * @param {string|Date} data - Data a formatar
 * @param {boolean} incluirHora - Se deve incluir hora (padrão: false)
 * @returns {string} Data formatada
 */
function formatarData(data, incluirHora = false) {
    if (!data) return '';
    
    try {
        const dataObj = typeof data === 'string' ? new Date(data + 'T00:00:00') : new Date(data);
        
        if (isNaN(dataObj.getTime())) {
            return '';
        }
        
        const options = {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        };
        
        if (incluirHora) {
            options.hour = '2-digit';
            options.minute = '2-digit';
        }
        
        return dataObj.toLocaleDateString('pt-BR', options);
    } catch (error) {
        console.warn('Erro ao formatar data:', error);
        return '';
    }
}

/**
 * Formata data para formato ISO (YYYY-MM-DD)
 * @param {string|Date} data - Data a formatar
 * @returns {string} Data no formato ISO
 */
function formatarDataISO(data) {
    if (!data) return '';
    
    try {
        const dataObj = typeof data === 'string' ? new Date(data) : new Date(data);
        
        if (isNaN(dataObj.getTime())) {
            return '';
        }
        
        return dataObj.toISOString().split('T')[0];
    } catch (error) {
        console.warn('Erro ao formatar data ISO:', error);
        return '';
    }
}

/**
 * Calcula diferença em dias entre duas datas
 * @param {string|Date} dataInicio - Data inicial
 * @param {string|Date} dataFim - Data final
 * @returns {number} Diferença em dias
 */
function calcularDiferenca(dataInicio, dataFim) {
    try {
        const inicio = typeof dataInicio === 'string' ? new Date(dataInicio + 'T00:00:00') : new Date(dataInicio);
        const fim = typeof dataFim === 'string' ? new Date(dataFim + 'T00:00:00') : new Date(dataFim);
        
        inicio.setHours(0, 0, 0, 0);
        fim.setHours(0, 0, 0, 0);
        
        const diffTime = fim - inicio;
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    } catch (error) {
        console.warn('Erro ao calcular diferença:', error);
        return 0;
    }
}

/**
 * Calcula dias restantes até uma data
 * @param {string|Date} prazo - Data do prazo
 * @returns {number} Dias restantes (negativo se atrasado)
 */
function calcularDiasRestantes(prazo) {
    const hoje = new Date();
    return calcularDiferenca(hoje, prazo);
}

/**
 * Verifica se data está no passado
 * @param {string|Date} data - Data a verificar
 * @returns {boolean} True se está no passado
 */
function dataNoPassado(data) {
    return calcularDiasRestantes(data) < 0;
}

/**
 * Obtém nome do mês em português
 * @param {number} mes - Número do mês (0-11)
 * @returns {string} Nome do mês
 */
function obterNomeMes(mes) {
    const meses = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return meses[mes] || '';
}

/**
 * Obtém nome do dia da semana em português
 * @param {number} dia - Número do dia (0-6, 0=Domingo)
 * @returns {string} Nome do dia
 */
function obterNomeDia(dia) {
    const dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return dias[dia] || '';
}

/**
 * ========== FORMATAÇÃO DE NÚMEROS ==========
 */

/**
 * Formata número como porcentagem
 * @param {number} numero - Número a formatar
 * @param {number} decimais - Número de casas decimais (padrão: 1)
 * @returns {string} Número formatado como porcentagem
 */
function formatarPorcentagem(numero, decimais = 1) {
    if (typeof numero !== 'number' || isNaN(numero)) return '0%';
    
    return numero.toFixed(decimais) + '%';
}

/**
 * Formata número como moeda brasileira
 * @param {number} valor - Valor a formatar
 * @returns {string} Valor formatado como moeda
 */
function formatarMoeda(valor) {
    if (typeof valor !== 'number' || isNaN(valor)) return 'R$ 0,00';
    
    return valor.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

/**
 * Formata número com separadores de milhares
 * @param {number} numero - Número a formatar
 * @param {number} decimais - Casas decimais (padrão: 0)
 * @returns {string} Número formatado
 */
function formatarNumero(numero, decimais = 0) {
    if (typeof numero !== 'number' || isNaN(numero)) return '0';
    
    return numero.toLocaleString('pt-BR', {
        minimumFractionDigits: decimais,
        maximumFractionDigits: decimais
    });
}

/**
 * ========== MANIPULAÇÃO DE STRINGS ==========
 */

/**
 * Capitaliza primeira letra de uma string
 * @param {string} texto - Texto a capitalizar
 * @returns {string} Texto capitalizado
 */
function capitalize(texto) {
    if (!texto || typeof texto !== 'string') return '';
    
    return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
}

/**
 * Capitaliza primeira letra de cada palavra
 * @param {string} texto - Texto a capitalizar
 * @returns {string} Texto com palavras capitalizadas
 */
function capitalizeWords(texto) {
    if (!texto || typeof texto !== 'string') return '';
    
    return texto.replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Remove acentos de uma string
 * @param {string} texto - Texto para normalizar
 * @returns {string} Texto sem acentos
 */
function removerAcentos(texto) {
    if (!texto || typeof texto !== 'string') return '';
    
    return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Gera slug a partir de uma string
 * @param {string} texto - Texto para converter
 * @returns {string} Slug gerado
 */
function gerarSlug(texto) {
    if (!texto || typeof texto !== 'string') return '';
    
    return removerAcentos(texto)
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

/**
 * Trunca texto com reticências
 * @param {string} texto - Texto a truncar
 * @param {number} limite - Limite de caracteres
 * @returns {string} Texto truncado
 */
function truncarTexto(texto, limite) {
    if (!texto || typeof texto !== 'string') return '';
    
    if (texto.length <= limite) return texto;
    
    return texto.substring(0, limite).trim() + '...';
}

/**
 * ========== MANIPULAÇÃO DE ARRAYS ==========
 */

/**
 * Remove itens duplicados de um array
 * @param {Array} array - Array com possíveis duplicatas
 * @returns {Array} Array sem duplicatas
 */
function removerDuplicatas(array) {
    if (!Array.isArray(array)) return [];
    
    return [...new Set(array)];
}

/**
 * Agrupa array por propriedade
 * @param {Array} array - Array a agrupar
 * @param {string} propriedade - Propriedade para agrupamento
 * @returns {Object} Objeto agrupado
 */
function agruparPor(array, propriedade) {
    if (!Array.isArray(array)) return {};
    
    return array.reduce((grupos, item) => {
        const chave = item[propriedade];
        if (!grupos[chave]) {
            grupos[chave] = [];
        }
        grupos[chave].push(item);
        return grupos;
    }, {});
}

/**
 * Ordena array por propriedade
 * @param {Array} array - Array a ordenar
 * @param {string} propriedade - Propriedade para ordenação
 * @param {boolean} crescente - Ordem crescente (padrão: true)
 * @returns {Array} Array ordenado
 */
function ordenarPor(array, propriedade, crescente = true) {
    if (!Array.isArray(array)) return [];
    
    return [...array].sort((a, b) => {
        const valorA = a[propriedade];
        const valorB = b[propriedade];
        
        if (valorA < valorB) return crescente ? -1 : 1;
        if (valorA > valorB) return crescente ? 1 : -1;
        return 0;
    });
}

/**
 * Filtra array por múltiplos critérios
 * @param {Array} array - Array a filtrar
 * @param {Object} filtros - Objeto com critérios de filtro
 * @returns {Array} Array filtrado
 */
function filtrarPor(array, filtros) {
    if (!Array.isArray(array) || !filtros) return array;
    
    return array.filter(item => {
        return Object.entries(filtros).every(([chave, valor]) => {
            if (valor === '' || valor === null || valor === undefined) return true;
            
            const valorItem = item[chave];
            
            if (Array.isArray(valor)) {
                return valor.includes(valorItem);
            }
            
            if (typeof valor === 'string' && typeof valorItem === 'string') {
                return valorItem.toLowerCase().includes(valor.toLowerCase());
            }
            
            return valorItem === valor;
        });
    });
}

/**
 * ========== MANIPULAÇÃO DE OBJETOS ==========
 */

/**
 * Clona objeto profundamente
 * @param {Object} objeto - Objeto a clonar
 * @returns {Object} Objeto clonado
 */
function clonarObjeto(objeto) {
    if (objeto === null || typeof objeto !== 'object') return objeto;
    
    try {
        return JSON.parse(JSON.stringify(objeto));
    } catch (error) {
        console.warn('Erro ao clonar objeto:', error);
        return {};
    }
}

/**
 * Mescla objetos profundamente
 * @param {Object} destino - Objeto destino
 * @param {...Object} fontes - Objetos fonte
 * @returns {Object} Objeto mesclado
 */
function mesclarObjetos(destino, ...fontes) {
    if (!destino || typeof destino !== 'object') destino = {};
    
    fontes.forEach(fonte => {
        if (!fonte || typeof fonte !== 'object') return;
        
        Object.keys(fonte).forEach(chave => {
            if (fonte[chave] && typeof fonte[chave] === 'object' && !Array.isArray(fonte[chave])) {
                destino[chave] = mesclarObjetos(destino[chave] || {}, fonte[chave]);
            } else {
                destino[chave] = fonte[chave];
            }
        });
    });
    
    return destino;
}

/**
 * Verifica se objeto está vazio
 * @param {Object} objeto - Objeto a verificar
 * @returns {boolean} True se vazio
 */
function objetoVazio(objeto) {
    return !objeto || typeof objeto !== 'object' || Object.keys(objeto).length === 0;
}

/**
 * ========== UTILITÁRIOS DE ID E CHAVES ==========
 */

/**
 * Gera ID único baseado em timestamp
 * @param {string} prefixo - Prefixo para o ID (opcional)
 * @returns {string} ID único
 */
function gerarId(prefixo = '') {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 5);
    return prefixo ? `${prefixo}_${timestamp}_${random}` : `${timestamp}_${random}`;
}

/**
 * Gera UUID v4 simples
 * @returns {string} UUID gerado
 */
function gerarUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * ========== UTILITÁRIOS DE VALIDAÇÃO ==========
 */

/**
 * Verifica se email é válido
 * @param {string} email - Email a validar
 * @returns {boolean} True se válido
 */
function emailValido(email) {
    if (!email || typeof email !== 'string') return false;
    
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * Verifica se data é válida
 * @param {string} data - Data a validar (formato YYYY-MM-DD)
 * @returns {boolean} True se válida
 */
function dataValida(data) {
    if (!data || typeof data !== 'string') return false;
    
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(data)) return false;
    
    const dataObj = new Date(data + 'T00:00:00');
    return !isNaN(dataObj.getTime());
}

/**
 * Verifica se horário é válido
 * @param {string} horario - Horário a validar (formato HH:MM)
 * @returns {boolean} True se válido
 */
function horarioValido(horario) {
    if (!horario || typeof horario !== 'string') return false;
    
    const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return regex.test(horario);
}

/**
 * ========== UTILITÁRIOS DE DEBOUNCE E THROTTLE ==========
 */

/**
 * Cria função com debounce
 * @param {Function} func - Função a aplicar debounce
 * @param {number} delay - Delay em milissegundos
 * @returns {Function} Função com debounce
 */
function debounce(func, delay) {
    let timeoutId;
    
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

/**
 * Cria função com throttle
 * @param {Function} func - Função a aplicar throttle
 * @param {number} delay - Delay em milissegundos
 * @returns {Function} Função com throttle
 */
function throttle(func, delay) {
    let lastCall = 0;
    
    return function(...args) {
        const now = Date.now();
        if (now - lastCall >= delay) {
            lastCall = now;
            return func.apply(this, args);
        }
    };
}

/**
 * ========== UTILITÁRIOS DE ARMAZENAMENTO LOCAL ==========
 */

/**
 * Salva dados no localStorage com try/catch
 * @param {string} chave - Chave para armazenamento
 * @param {*} dados - Dados a armazenar
 * @returns {boolean} True se salvou com sucesso
 */
function salvarLocal(chave, dados) {
    try {
        localStorage.setItem(chave, JSON.stringify(dados));
        return true;
    } catch (error) {
        console.warn('Erro ao salvar no localStorage:', error);
        return false;
    }
}

/**
 * Carrega dados do localStorage
 * @param {string} chave - Chave dos dados
 * @param {*} padrao - Valor padrão se não encontrar
 * @returns {*} Dados carregados ou valor padrão
 */
function carregarLocal(chave, padrao = null) {
    try {
        const dados = localStorage.getItem(chave);
        return dados ? JSON.parse(dados) : padrao;
    } catch (error) {
        console.warn('Erro ao carregar do localStorage:', error);
        return padrao;
    }
}

/**
 * Remove dados do localStorage
 * @param {string} chave - Chave a remover
 * @returns {boolean} True se removeu com sucesso
 */
function removerLocal(chave) {
    try {
        localStorage.removeItem(chave);
        return true;
    } catch (error) {
        console.warn('Erro ao remover do localStorage:', error);
        return false;
    }
}

/**
 * ========== UTILITÁRIOS DE URL E NAVEGAÇÃO ==========
 */

/**
 * Obtém parâmetros da URL
 * @returns {Object} Objeto com parâmetros da URL
 */
function obterParametrosURL() {
    const params = new URLSearchParams(window.location.search);
    const resultado = {};
    
    for (let [chave, valor] of params) {
        resultado[chave] = valor;
    }
    
    return resultado;
}

/**
 * Atualiza parâmetro na URL sem recarregar
 * @param {string} chave - Chave do parâmetro
 * @param {string} valor - Valor do parâmetro
 */
function atualizarParametroURL(chave, valor) {
    try {
        const url = new URL(window.location);
        if (valor) {
            url.searchParams.set(chave, valor);
        } else {
            url.searchParams.delete(chave);
        }
        window.history.replaceState({}, '', url);
    } catch (error) {
        console.warn('Erro ao atualizar URL:', error);
    }
}

/**
 * ========== UTILITÁRIOS DE PERFORMANCE ==========
 */

/**
 * Mede tempo de execução de uma função
 * @param {Function} func - Função a medir
 * @param {string} nome - Nome para identificação
 * @returns {*} Resultado da função
 */
function medirTempo(func, nome = 'função') {
    const inicio = performance.now();
    const resultado = func();
    const fim = performance.now();
    
    console.log(`⏱️ ${nome}: ${(fim - inicio).toFixed(2)}ms`);
    return resultado;
}

/**
 * Aguarda um tempo específico
 * @param {number} ms - Milissegundos a aguardar
 * @returns {Promise} Promise que resolve após o tempo
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * ========== UTILITÁRIOS DE ERRO ==========
 */

/**
 * Executa função com try/catch e log de erro
 * @param {Function} func - Função a executar
 * @param {string} contexto - Contexto para log de erro
 * @param {*} valorPadrao - Valor padrão em caso de erro
 * @returns {*} Resultado da função ou valor padrão
 */
function executarSeguro(func, contexto = 'operação', valorPadrao = null) {
    try {
        return func();
    } catch (error) {
        console.error(`Erro em ${contexto}:`, error);
        return valorPadrao;
    }
}

/**
 * ========== EXPORTAÇÃO DAS FUNÇÕES ==========
 */

// Se estiver em ambiente de módulos, exportar
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        // Datas
        formatarData,
        formatarDataISO,
        calcularDiferenca,
        calcularDiasRestantes,
        dataNoPassado,
        obterNomeMes,
        obterNomeDia,
        
        // Números
        formatarPorcentagem,
        formatarMoeda,
        formatarNumero,
        
        // Strings
        capitalize,
        capitalizeWords,
        removerAcentos,
        gerarSlug,
        truncarTexto,
        
        // Arrays
        removerDuplicatas,
        agruparPor,
        ordenarPor,
        filtrarPor,
        
        // Objetos
        clonarObjeto,
        mesclarObjetos,
        objetoVazio,
        
        // IDs
        gerarId,
        gerarUUID,
        
        // Validação
        emailValido,
        dataValida,
        horarioValido,
        
        // Async
        debounce,
        throttle,
        
        // Storage
        salvarLocal,
        carregarLocal,
        removerLocal,
        
        // URL
        obterParametrosURL,
        atualizarParametroURL,
        
        // Performance
        medirTempo,
        sleep,
        
        // Erro
        executarSeguro
    };
}

// Disponibilizar globalmente se não estiver em módulo
if (typeof window !== 'undefined') {
    window.Helpers = {
        formatarData,
        formatarDataISO,
        calcularDiferenca,
        calcularDiasRestantes,
        dataNoPassado,
        obterNomeMes,
        obterNomeDia,
        formatarPorcentagem,
        formatarMoeda,
        formatarNumero,
        capitalize,
        capitalizeWords,
        removerAcentos,
        gerarSlug,
        truncarTexto,
        removerDuplicatas,
        agruparPor,
        ordenarPor,
        filtrarPor,
        clonarObjeto,
        mesclarObjetos,
        objetoVazio,
        gerarId,
        gerarUUID,
        emailValido,
        dataValida,
        horarioValido,
        debounce,
        throttle,
        salvarLocal,
        carregarLocal,
        removerLocal,
        obterParametrosURL,
        atualizarParametroURL,
        medirTempo,
        sleep,
        executarSeguro
    };
}

/* ==========================================================================
   FIM DO MÓDULO HELPERS - Sistema de Gestão v5.1
   ========================================================================== */
