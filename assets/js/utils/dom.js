/**
 * MÓDULO DOM - Sistema de Gestão v5.1
 * Responsável pela manipulação segura do DOM
 */

// ========== UTILITÁRIOS DOM ==========

/**
 * Busca elemento de forma segura
 * @param {string} selector - Seletor CSS ou ID
 * @param {Element} context - Contexto de busca (opcional)
 * @returns {Element|null} - Elemento encontrado ou null
 */
function buscarElemento(selector, context = document) {
    try {
        if (selector.startsWith('#')) {
            return context.getElementById(selector.substring(1));
        }
        return context.querySelector(selector);
    } catch (error) {
        if (typeof console !== 'undefined') {
            console.warn(`❌ Erro ao buscar elemento '${selector}':`, error.message);
        }
        return null;
    }
}

/**
 * Busca múltiplos elementos de forma segura
 * @param {string} selector - Seletor CSS
 * @param {Element} context - Contexto de busca (opcional)
 * @returns {NodeList} - Lista de elementos encontrados
 */
function buscarElementos(selector, context = document) {
    try {
        return context.querySelectorAll(selector);
    } catch (error) {
        if (typeof console !== 'undefined') {
            console.warn(`❌ Erro ao buscar elementos '${selector}':`, error.message);
        }
        return [];
    }
}

/**
 * Adiciona event listener de forma segura
 * @param {string|Element} elementOrSelector - Elemento ou seletor
 * @param {string} eventType - Tipo do evento
 * @param {Function} handler - Função handler
 * @param {boolean|object} options - Opções do event listener
 */
function adicionarEventListener(elementOrSelector, eventType, handler, options = false) {
    let elemento;
    
    if (typeof elementOrSelector === 'string') {
        elemento = buscarElemento(elementOrSelector);
    } else {
        elemento = elementOrSelector;
    }
    
    if (elemento && typeof handler === 'function') {
        try {
            elemento.addEventListener(eventType, handler, options);
        } catch (error) {
            if (typeof console !== 'undefined') {
                console.warn(`❌ Erro ao adicionar event listener para '${eventType}':`, error.message);
            }
        }
    }
}

/**
 * Remove event listener de forma segura
 * @param {string|Element} elementOrSelector - Elemento ou seletor
 * @param {string} eventType - Tipo do evento
 * @param {Function} handler - Função handler
 */
function removerEventListener(elementOrSelector, eventType, handler) {
    let elemento;
    
    if (typeof elementOrSelector === 'string') {
        elemento = buscarElemento(elementOrSelector);
    } else {
        elemento = elementOrSelector;
    }
    
    if (elemento && typeof handler === 'function') {
        try {
            elemento.removeEventListener(eventType, handler);
        } catch (error) {
            if (typeof console !== 'undefined') {
                console.warn(`❌ Erro ao remover event listener para '${eventType}':`, error.message);
            }
        }
    }
}

/**
 * Define atributo de forma segura
 * @param {string|Element} elementOrSelector - Elemento ou seletor
 * @param {string} attribute - Nome do atributo
 * @param {string} value - Valor do atributo
 */
function definirAtributo(elementOrSelector, attribute, value) {
    let elemento;
    
    if (typeof elementOrSelector === 'string') {
        elemento = buscarElemento(elementOrSelector);
    } else {
        elemento = elementOrSelector;
    }
    
    if (elemento) {
        try {
            elemento.setAttribute(attribute, value);
        } catch (error) {
            if (typeof console !== 'undefined') {
                console.warn(`❌ Erro ao definir atributo '${attribute}':`, error.message);
            }
        }
    }
}

/**
 * Define conteúdo de forma segura
 * @param {string|Element} elementOrSelector - Elemento ou seletor
 * @param {string} content - Conteúdo HTML ou texto
 * @param {boolean} isHTML - Se true, usa innerHTML; se false, usa textContent
 */
function definirConteudo(elementOrSelector, content, isHTML = true) {
    let elemento;
    
    if (typeof elementOrSelector === 'string') {
        elemento = buscarElemento(elementOrSelector);
    } else {
        elemento = elementOrSelector;
    }
    
    if (elemento) {
        try {
            if (isHTML) {
                elemento.innerHTML = content;
            } else {
                elemento.textContent = content;
            }
        } catch (error) {
            if (typeof console !== 'undefined') {
                console.warn(`❌ Erro ao definir conteúdo:`, error.message);
            }
        }
    }
}

/**
 * Adiciona classe de forma segura
 * @param {string|Element} elementOrSelector - Elemento ou seletor
 * @param {string} className - Nome da classe
 */
function adicionarClasse(elementOrSelector, className) {
    let elemento;
    
    if (typeof elementOrSelector === 'string') {
        elemento = buscarElemento(elementOrSelector);
    } else {
        elemento = elementOrSelector;
    }
    
    if (elemento && className) {
        try {
            elemento.classList.add(className);
        } catch (error) {
            if (typeof console !== 'undefined') {
                console.warn(`❌ Erro ao adicionar classe '${className}':`, error.message);
            }
        }
    }
}

/**
 * Remove classe de forma segura
 * @param {string|Element} elementOrSelector - Elemento ou seletor
 * @param {string} className - Nome da classe
 */
function removerClasse(elementOrSelector, className) {
    let elemento;
    
    if (typeof elementOrSelector === 'string') {
        elemento = buscarElemento(elementOrSelector);
    } else {
        elemento = elementOrSelector;
    }
    
    if (elemento && className) {
        try {
            elemento.classList.remove(className);
        } catch (error) {
            if (typeof console !== 'undefined') {
                console.warn(`❌ Erro ao remover classe '${className}':`, error.message);
            }
        }
    }
}

/**
 * Toggle classe de forma segura
 * @param {string|Element} elementOrSelector - Elemento ou seletor
 * @param {string} className - Nome da classe
 * @returns {boolean} - Se a classe foi adicionada (true) ou removida (false)
 */
function toggleClasse(elementOrSelector, className) {
    let elemento;
    
    if (typeof elementOrSelector === 'string') {
        elemento = buscarElemento(elementOrSelector);
    } else {
        elemento = elementOrSelector;
    }
    
    if (elemento && className) {
        try {
            return elemento.classList.toggle(className);
        } catch (error) {
            if (typeof console !== 'undefined') {
                console.warn(`❌ Erro ao toggle classe '${className}':`, error.message);
            }
            return false;
        }
    }
    return false;
}

/**
 * Verifica se elemento tem classe
 * @param {string|Element} elementOrSelector - Elemento ou seletor
 * @param {string} className - Nome da classe
 * @returns {boolean} - Se o elemento tem a classe
 */
function temClasse(elementOrSelector, className) {
    let elemento;
    
    if (typeof elementOrSelector === 'string') {
        elemento = buscarElemento(elementOrSelector);
    } else {
        elemento = elementOrSelector;
    }
    
    if (elemento && className) {
        try {
            return elemento.classList.contains(className);
        } catch (error) {
            if (typeof console !== 'undefined') {
                console.warn(`❌ Erro ao verificar classe '${className}':`, error.message);
            }
            return false;
        }
    }
    return false;
}

/**
 * Cria elemento de forma segura
 * @param {string} tagName - Nome da tag
 * @param {object} options - Opções do elemento
 * @returns {Element} - Elemento criado
 */
function criarElemento(tagName, options = {}) {
    try {
        const elemento = document.createElement(tagName);
        
        // Adicionar classes
        if (options.classes) {
            if (Array.isArray(options.classes)) {
                elemento.classList.add(...options.classes);
            } else {
                elemento.className = options.classes;
            }
        }
        
        // Adicionar atributos
        if (options.attributes) {
            Object.entries(options.attributes).forEach(([key, value]) => {
                elemento.setAttribute(key, value);
            });
        }
        
        // Definir conteúdo
        if (options.html) {
            elemento.innerHTML = options.html;
        } else if (options.text) {
            elemento.textContent = options.text;
        }
        
        // Adicionar event listeners
        if (options.events) {
            Object.entries(options.events).forEach(([eventType, handler]) => {
                elemento.addEventListener(eventType, handler);
            });
        }
        
        return elemento;
    } catch (error) {
        if (typeof console !== 'undefined') {
            console.warn(`❌ Erro ao criar elemento '${tagName}':`, error.message);
        }
        return document.createElement('div'); // Fallback
    }
}

/**
 * Remove elemento de forma segura
 * @param {string|Element} elementOrSelector - Elemento ou seletor
 */
function removerElemento(elementOrSelector) {
    let elemento;
    
    if (typeof elementOrSelector === 'string') {
        elemento = buscarElemento(elementOrSelector);
    } else {
        elemento = elementOrSelector;
    }
    
    if (elemento && elemento.parentNode) {
        try {
            elemento.parentNode.removeChild(elemento);
        } catch (error) {
            if (typeof console !== 'undefined') {
                console.warn(`❌ Erro ao remover elemento:`, error.message);
            }
        }
    }
}

/**
 * Adiciona elemento filho de forma segura
 * @param {string|Element} parentOrSelector - Elemento pai ou seletor
 * @param {Element} child - Elemento filho
 */
function adicionarFilho(parentOrSelector, child) {
    let parent;
    
    if (typeof parentOrSelector === 'string') {
        parent = buscarElemento(parentOrSelector);
    } else {
        parent = parentOrSelector;
    }
    
    if (parent && child) {
        try {
            parent.appendChild(child);
        } catch (error) {
            if (typeof console !== 'undefined') {
                console.warn(`❌ Erro ao adicionar elemento filho:`, error.message);
            }
        }
    }
}

/**
 * Limpa conteúdo de um elemento
 * @param {string|Element} elementOrSelector - Elemento ou seletor
 */
function limparElemento(elementOrSelector) {
    let elemento;
    
    if (typeof elementOrSelector === 'string') {
        elemento = buscarElemento(elementOrSelector);
    } else {
        elemento = elementOrSelector;
    }
    
    if (elemento) {
        try {
            elemento.innerHTML = '';
        } catch (error) {
            if (typeof console !== 'undefined') {
                console.warn(`❌ Erro ao limpar elemento:`, error.message);
            }
        }
    }
}

/**
 * Aguarda elemento aparecer no DOM
 * @param {string} selector - Seletor do elemento
 * @param {number} timeout - Timeout em milissegundos
 * @returns {Promise<Element>} - Promise que resolve com o elemento
 */
function aguardarElemento(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
        const elemento = buscarElemento(selector);
        if (elemento) {
            resolve(elemento);
            return;
        }
        
        const observer = new MutationObserver((mutations, obs) => {
            const elemento = buscarElemento(selector);
            if (elemento) {
                obs.disconnect();
                resolve(elemento);
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        setTimeout(() => {
            observer.disconnect();
            reject(new Error(`Timeout: Elemento '${selector}' não encontrado em ${timeout}ms`));
        }, timeout);
    });
}

/**
 * Verifica se elemento está visível
 * @param {string|Element} elementOrSelector - Elemento ou seletor
 * @returns {boolean} - Se o elemento está visível
 */
function estaVisivel(elementOrSelector) {
    let elemento;
    
    if (typeof elementOrSelector === 'string') {
        elemento = buscarElemento(elementOrSelector);
    } else {
        elemento = elementOrSelector;
    }
    
    if (!elemento) return false;
    
    try {
        const style = window.getComputedStyle(elemento);
        return style.display !== 'none' && 
               style.visibility !== 'hidden' && 
               style.opacity !== '0' &&
               elemento.offsetWidth > 0 && 
               elemento.offsetHeight > 0;
    } catch (error) {
        if (typeof console !== 'undefined') {
            console.warn(`❌ Erro ao verificar visibilidade:`, error.message);
        }
        return false;
    }
}

/**
 * Scroll suave para elemento
 * @param {string|Element} elementOrSelector - Elemento ou seletor
 * @param {object} options - Opções de scroll
 */
function scrollParaElemento(elementOrSelector, options = {}) {
    let elemento;
    
    if (typeof elementOrSelector === 'string') {
        elemento = buscarElemento(elementOrSelector);
    } else {
        elemento = elementOrSelector;
    }
    
    if (elemento) {
        try {
            elemento.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'nearest',
                ...options
            });
        } catch (error) {
            if (typeof console !== 'undefined') {
                console.warn(`❌ Erro ao fazer scroll para elemento:`, error.message);
            }
        }
    }
}

/**
 * Obtém dimensões de um elemento
 * @param {string|Element} elementOrSelector - Elemento ou seletor
 * @returns {object} - Objeto com dimensões
 */
function obterDimensoes(elementOrSelector) {
    let elemento;
    
    if (typeof elementOrSelector === 'string') {
        elemento = buscarElemento(elementOrSelector);
    } else {
        elemento = elementOrSelector;
    }
    
    if (!elemento) {
        return { width: 0, height: 0, top: 0, left: 0, right: 0, bottom: 0 };
    }
    
    try {
        const rect = elemento.getBoundingClientRect();
        return {
            width: rect.width,
            height: rect.height,
            top: rect.top,
            left: rect.left,
            right: rect.right,
            bottom: rect.bottom
        };
    } catch (error) {
        if (typeof console !== 'undefined') {
            console.warn(`❌ Erro ao obter dimensões:`, error.message);
        }
        return { width: 0, height: 0, top: 0, left: 0, right: 0, bottom: 0 };
    }
}

/**
 * Debounce para eventos DOM
 * @param {Function} func - Função a ser executada
 * @param {number} delay - Delay em milissegundos
 * @returns {Function} - Função com debounce
 */
function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

/**
 * Throttle para eventos DOM
 * @param {Function} func - Função a ser executada
 * @param {number} delay - Delay em milissegundos
 * @returns {Function} - Função com throttle
 */
function throttle(func, delay) {
    let timeoutId;
    let lastExecTime = 0;
    return function(...args) {
        const currentTime = Date.now();
        
        if (currentTime - lastExecTime > delay) {
            func.apply(this, args);
            lastExecTime = currentTime;
        } else {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func.apply(this, args);
                lastExecTime = Date.now();
            }, delay - (currentTime - lastExecTime));
        }
    };
}

// ========== CONFIGURAÇÃO DE EVENTOS GLOBAIS ==========

/**
 * Configura eventos globais do sistema
 */
function configurarEventosGlobais() {
    // Atalhos de teclado
    adicionarEventListener(document, 'keydown', function(e) {
        // Ctrl+S para salvar
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            if (typeof salvarDados === 'function') {
                salvarDados();
                if (typeof mostrarNotificacao === 'function') {
                    mostrarNotificacao('Dados salvos!');
                }
            }
        }
        
        // Escape para fechar modais
        if (e.key === 'Escape') {
            buscarElementos('.modal.active').forEach(modal => {
                if (typeof fecharModal === 'function') {
                    fecharModal(modal.id);
                }
            });
        }
        
        // Ctrl+Shift+I para verificar integridade do sistema
        if (e.ctrlKey && e.shiftKey && e.key === 'I') {
            e.preventDefault();
            if (typeof verificarIntegridadeSistema === 'function') {
                verificarIntegridadeSistema();
            }
        }
    });
    
    // Fechar modais clicando fora
    adicionarEventListener(document, 'click', function(e) {
        if (e.target.classList.contains('modal')) {
            if (typeof fecharModal === 'function') {
                fecharModal(e.target.id);
            }
        }
    });
    
    // Salvar dados ao sair da página
    adicionarEventListener(window, 'beforeunload', function(e) {
        if (typeof usuarioAtual !== 'undefined' && usuarioAtual && typeof salvarDados === 'function') {
            salvarDados();
        }
    });
    
    // Otimizar performance no resize
    const resizeHandler = throttle(function() {
        if (typeof otimizarDesempenho === 'function') {
            otimizarDesempenho();
        }
    }, 250);
    
    adicionarEventListener(window, 'resize', resizeHandler);
    
    // Detectar mudanças de visibilidade da página
    adicionarEventListener(document, 'visibilitychange', function() {
        if (document.hidden) {
            // Página ficou oculta - parar operações pesadas
            if (typeof console !== 'undefined') {
                console.log('📱 Página oculta - pausando operações');
            }
        } else {
            // Página ficou visível - retomar operações
            if (typeof console !== 'undefined') {
                console.log('📱 Página visível - retomando operações');
            }
            if (typeof verificarIntegridadeSistema === 'function') {
                verificarIntegridadeSistema();
            }
        }
    });
}

// ========== INICIALIZAÇÃO ==========

/**
 * Inicializa o módulo DOM quando o documento estiver pronto
 */
function inicializarModuloDOM() {
    if (document.readyState === 'loading') {
        adicionarEventListener(document, 'DOMContentLoaded', configurarEventosGlobais);
    } else {
        configurarEventosGlobais();
    }
}

// Inicializar automaticamente
inicializarModuloDOM();

// ========== LOG DE CARREGAMENTO ==========
if (typeof console !== 'undefined') {
    console.log('🎨 Módulo dom.js carregado com sucesso');
}