/* ==========================================================================
   UTILITÁRIOS DOM - Sistema de Gestão v5.1
   ========================================================================== */

/**
 * Módulo responsável por todas as operações de manipulação do DOM
 * Fornece funções utilitárias para interagir com elementos HTML
 */

/**
 * ========== SELETORES E BUSCA DE ELEMENTOS ==========
 */

/**
 * Seleciona elemento por ID com verificação de existência
 * @param {string} id - ID do elemento
 * @returns {HTMLElement|null} Elemento encontrado ou null
 */
function getElementById(id) {
    const elemento = document.getElementById(id);
    if (!elemento) {
        console.warn(`Elemento com ID '${id}' não encontrado`);
    }
    return elemento;
}

/**
 * Seleciona elementos por classe
 * @param {string} className - Nome da classe
 * @param {HTMLElement} container - Container de busca (opcional)
 * @returns {NodeList} Lista de elementos encontrados
 */
function getElementsByClass(className, container = document) {
    return container.querySelectorAll(`.${className}`);
}

/**
 * Seleciona elemento por seletor CSS com verificação
 * @param {string} selector - Seletor CSS
 * @param {HTMLElement} container - Container de busca (opcional)
 * @returns {HTMLElement|null} Primeiro elemento encontrado ou null
 */
function querySelector(selector, container = document) {
    const elemento = container.querySelector(selector);
    if (!elemento) {
        console.warn(`Elemento com seletor '${selector}' não encontrado`);
    }
    return elemento;
}

/**
 * Seleciona todos os elementos por seletor CSS
 * @param {string} selector - Seletor CSS
 * @param {HTMLElement} container - Container de busca (opcional)
 * @returns {NodeList} Lista de elementos encontrados
 */
function querySelectorAll(selector, container = document) {
    return container.querySelectorAll(selector);
}

/**
 * ========== MANIPULAÇÃO DE CLASSES CSS ==========
 */

/**
 * Adiciona classe a um elemento
 * @param {HTMLElement|string} elemento - Elemento ou ID do elemento
 * @param {string|Array} classes - Classe ou array de classes
 */
function addClass(elemento, classes) {
    const el = typeof elemento === 'string' ? getElementById(elemento) : elemento;
    if (!el) return;
    
    const classArray = Array.isArray(classes) ? classes : [classes];
    classArray.forEach(classe => {
        if (classe && !el.classList.contains(classe)) {
            el.classList.add(classe);
        }
    });
}

/**
 * Remove classe de um elemento
 * @param {HTMLElement|string} elemento - Elemento ou ID do elemento
 * @param {string|Array} classes - Classe ou array de classes
 */
function removeClass(elemento, classes) {
    const el = typeof elemento === 'string' ? getElementById(elemento) : elemento;
    if (!el) return;
    
    const classArray = Array.isArray(classes) ? classes : [classes];
    classArray.forEach(classe => {
        if (classe && el.classList.contains(classe)) {
            el.classList.remove(classe);
        }
    });
}

/**
 * Alterna classe em um elemento
 * @param {HTMLElement|string} elemento - Elemento ou ID do elemento
 * @param {string} classe - Classe a alternar
 * @returns {boolean} True se classe foi adicionada, false se removida
 */
function toggleClass(elemento, classe) {
    const el = typeof elemento === 'string' ? getElementById(elemento) : elemento;
    if (!el || !classe) return false;
    
    return el.classList.toggle(classe);
}

/**
 * Verifica se elemento possui uma classe
 * @param {HTMLElement|string} elemento - Elemento ou ID do elemento
 * @param {string} classe - Classe a verificar
 * @returns {boolean} True se possui a classe
 */
function hasClass(elemento, classe) {
    const el = typeof elemento === 'string' ? getElementById(elemento) : elemento;
    if (!el || !classe) return false;
    
    return el.classList.contains(classe);
}

/**
 * ========== MANIPULAÇÃO DE CONTEÚDO ==========
 */

/**
 * Define o conteúdo HTML de um elemento
 * @param {HTMLElement|string} elemento - Elemento ou ID do elemento
 * @param {string} html - Conteúdo HTML
 */
function setHTML(elemento, html) {
    const el = typeof elemento === 'string' ? getElementById(elemento) : elemento;
    if (!el) return;
    
    el.innerHTML = html;
}

/**
 * Obtém o conteúdo HTML de um elemento
 * @param {HTMLElement|string} elemento - Elemento ou ID do elemento
 * @returns {string} Conteúdo HTML
 */
function getHTML(elemento) {
    const el = typeof elemento === 'string' ? getElementById(elemento) : elemento;
    return el ? el.innerHTML : '';
}

/**
 * Define o texto de um elemento
 * @param {HTMLElement|string} elemento - Elemento ou ID do elemento
 * @param {string} texto - Texto a definir
 */
function setText(elemento, texto) {
    const el = typeof elemento === 'string' ? getElementById(elemento) : elemento;
    if (!el) return;
    
    el.textContent = texto;
}

/**
 * Obtém o texto de um elemento
 * @param {HTMLElement|string} elemento - Elemento ou ID do elemento
 * @returns {string} Texto do elemento
 */
function getText(elemento) {
    const el = typeof elemento === 'string' ? getElementById(elemento) : elemento;
    return el ? el.textContent : '';
}

/**
 * ========== MANIPULAÇÃO DE ATRIBUTOS ==========
 */

/**
 * Define atributo de um elemento
 * @param {HTMLElement|string} elemento - Elemento ou ID do elemento
 * @param {string} atributo - Nome do atributo
 * @param {string} valor - Valor do atributo
 */
function setAttribute(elemento, atributo, valor) {
    const el = typeof elemento === 'string' ? getElementById(elemento) : elemento;
    if (!el || !atributo) return;
    
    el.setAttribute(atributo, valor);
}

/**
 * Obtém valor de atributo
 * @param {HTMLElement|string} elemento - Elemento ou ID do elemento
 * @param {string} atributo - Nome do atributo
 * @returns {string|null} Valor do atributo
 */
function getAttribute(elemento, atributo) {
    const el = typeof elemento === 'string' ? getElementById(elemento) : elemento;
    if (!el || !atributo) return null;
    
    return el.getAttribute(atributo);
}

/**
 * Remove atributo de um elemento
 * @param {HTMLElement|string} elemento - Elemento ou ID do elemento
 * @param {string} atributo - Nome do atributo
 */
function removeAttribute(elemento, atributo) {
    const el = typeof elemento === 'string' ? getElementById(elemento) : elemento;
    if (!el || !atributo) return;
    
    el.removeAttribute(atributo);
}

/**
 * ========== MANIPULAÇÃO DE VALORES DE CAMPOS ==========
 */

/**
 * Define valor de um campo de formulário
 * @param {HTMLElement|string} campo - Campo ou ID do campo
 * @param {string|number|boolean} valor - Valor a definir
 */
function setValue(campo, valor) {
    const el = typeof campo === 'string' ? getElementById(campo) : campo;
    if (!el) return;
    
    if (el.type === 'checkbox' || el.type === 'radio') {
        el.checked = Boolean(valor);
    } else if (el.tagName.toLowerCase() === 'select' && el.multiple) {
        // Para select múltiplo
        Array.from(el.options).forEach(option => {
            option.selected = Array.isArray(valor) ? valor.includes(option.value) : false;
        });
    } else {
        el.value = valor;
    }
}

/**
 * Obtém valor de um campo de formulário
 * @param {HTMLElement|string} campo - Campo ou ID do campo
 * @returns {string|boolean|Array} Valor do campo
 */
function getValue(campo) {
    const el = typeof campo === 'string' ? getElementById(campo) : campo;
    if (!el) return '';
    
    if (el.type === 'checkbox' || el.type === 'radio') {
        return el.checked;
    } else if (el.tagName.toLowerCase() === 'select' && el.multiple) {
        return Array.from(el.selectedOptions).map(option => option.value);
    } else {
        return el.value;
    }
}

/**
 * Limpa valor de um campo
 * @param {HTMLElement|string} campo - Campo ou ID do campo
 */
function clearValue(campo) {
    const el = typeof campo === 'string' ? getElementById(campo) : campo;
    if (!el) return;
    
    if (el.type === 'checkbox' || el.type === 'radio') {
        el.checked = false;
    } else if (el.tagName.toLowerCase() === 'select') {
        el.selectedIndex = 0;
    } else {
        el.value = '';
    }
}

/**
 * ========== VISIBILIDADE E ESTADO ==========
 */

/**
 * Mostra elemento removendo classe 'hidden'
 * @param {HTMLElement|string} elemento - Elemento ou ID do elemento
 */
function show(elemento) {
    const el = typeof elemento === 'string' ? getElementById(elemento) : elemento;
    if (!el) return;
    
    removeClass(el, 'hidden');
    el.style.display = '';
}

/**
 * Esconde elemento adicionando classe 'hidden'
 * @param {HTMLElement|string} elemento - Elemento ou ID do elemento
 */
function hide(elemento) {
    const el = typeof elemento === 'string' ? getElementById(elemento) : elemento;
    if (!el) return;
    
    addClass(el, 'hidden');
}

/**
 * Alterna visibilidade de um elemento
 * @param {HTMLElement|string} elemento - Elemento ou ID do elemento
 * @returns {boolean} True se ficou visível, false se ficou oculto
 */
function toggle(elemento) {
    const el = typeof elemento === 'string' ? getElementById(elemento) : elemento;
    if (!el) return false;
    
    const isHidden = hasClass(el, 'hidden');
    if (isHidden) {
        show(el);
        return true;
    } else {
        hide(el);
        return false;
    }
}

/**
 * Verifica se elemento está visível
 * @param {HTMLElement|string} elemento - Elemento ou ID do elemento
 * @returns {boolean} True se visível
 */
function isVisible(elemento) {
    const el = typeof elemento === 'string' ? getElementById(elemento) : elemento;
    if (!el) return false;
    
    return !hasClass(el, 'hidden') && el.style.display !== 'none';
}

/**
 * ========== CRIAÇÃO E MANIPULAÇÃO DE ELEMENTOS ==========
 */

/**
 * Cria novo elemento HTML
 * @param {string} tag - Tag do elemento
 * @param {Object} options - Opções do elemento
 * @param {string} options.id - ID do elemento
 * @param {string|Array} options.className - Classes CSS
 * @param {string} options.innerHTML - Conteúdo HTML
 * @param {string} options.textContent - Conteúdo de texto
 * @param {Object} options.attributes - Atributos do elemento
 * @param {Object} options.styles - Estilos CSS
 * @returns {HTMLElement} Elemento criado
 */
function createElement(tag, options = {}) {
    const elemento = document.createElement(tag);
    
    if (options.id) {
        elemento.id = options.id;
    }
    
    if (options.className) {
        const classes = Array.isArray(options.className) ? options.className : [options.className];
        classes.forEach(classe => elemento.classList.add(classe));
    }
    
    if (options.innerHTML) {
        elemento.innerHTML = options.innerHTML;
    } else if (options.textContent) {
        elemento.textContent = options.textContent;
    }
    
    if (options.attributes) {
        Object.entries(options.attributes).forEach(([attr, value]) => {
            elemento.setAttribute(attr, value);
        });
    }
    
    if (options.styles) {
        Object.entries(options.styles).forEach(([style, value]) => {
            elemento.style[style] = value;
        });
    }
    
    return elemento;
}

/**
 * Remove elemento do DOM
 * @param {HTMLElement|string} elemento - Elemento ou ID do elemento
 */
function removeElement(elemento) {
    const el = typeof elemento === 'string' ? getElementById(elemento) : elemento;
    if (el && el.parentNode) {
        el.parentNode.removeChild(el);
    }
}

/**
 * Insere elemento antes de outro
 * @param {HTMLElement} novoElemento - Elemento a inserir
 * @param {HTMLElement|string} elementoReferencia - Elemento de referência
 */
function insertBefore(novoElemento, elementoReferencia) {
    const ref = typeof elementoReferencia === 'string' ? getElementById(elementoReferencia) : elementoReferencia;
    if (ref && ref.parentNode) {
        ref.parentNode.insertBefore(novoElemento, ref);
    }
}

/**
 * Insere elemento após outro
 * @param {HTMLElement} novoElemento - Elemento a inserir
 * @param {HTMLElement|string} elementoReferencia - Elemento de referência
 */
function insertAfter(novoElemento, elementoReferencia) {
    const ref = typeof elementoReferencia === 'string' ? getElementById(elementoReferencia) : elementoReferencia;
    if (ref && ref.parentNode) {
        ref.parentNode.insertBefore(novoElemento, ref.nextSibling);
    }
}

/**
 * ========== EVENTOS ==========
 */

/**
 * Adiciona event listener a um elemento
 * @param {HTMLElement|string} elemento - Elemento ou ID do elemento
 * @param {string} evento - Nome do evento
 * @param {Function} callback - Função callback
 * @param {Object|boolean} options - Opções do evento
 */
function addEventListener(elemento, evento, callback, options = false) {
    const el = typeof elemento === 'string' ? getElementById(elemento) : elemento;
    if (!el || typeof callback !== 'function') return;
    
    el.addEventListener(evento, callback, options);
}

/**
 * Remove event listener de um elemento
 * @param {HTMLElement|string} elemento - Elemento ou ID do elemento
 * @param {string} evento - Nome do evento
 * @param {Function} callback - Função callback
 */
function removeEventListener(elemento, evento, callback) {
    const el = typeof elemento === 'string' ? getElementById(elemento) : elemento;
    if (!el || typeof callback !== 'function') return;
    
    el.removeEventListener(evento, callback);
}

/**
 * Dispara evento customizado
 * @param {HTMLElement|string} elemento - Elemento ou ID do elemento
 * @param {string} nomeEvento - Nome do evento
 * @param {Object} detalhes - Dados do evento
 */
function dispatchEvent(elemento, nomeEvento, detalhes = {}) {
    const el = typeof elemento === 'string' ? getElementById(elemento) : elemento;
    if (!el) return;
    
    const evento = new CustomEvent(nomeEvento, {
        detail: detalhes,
        bubbles: true,
        cancelable: true
    });
    
    el.dispatchEvent(evento);
}

/**
 * ========== FORMULÁRIOS ==========
 */

/**
 * Obtém dados de um formulário
 * @param {HTMLFormElement|string} formulario - Formulário ou ID do formulário
 * @returns {Object} Objeto com os dados do formulário
 */
function getFormData(formulario) {
    const form = typeof formulario === 'string' ? getElementById(formulario) : formulario;
    if (!form) return {};
    
    const formData = new FormData(form);
    const dados = {};
    
    for (let [key, value] of formData.entries()) {
        if (dados[key]) {
            // Se já existe, transformar em array
            if (!Array.isArray(dados[key])) {
                dados[key] = [dados[key]];
            }
            dados[key].push(value);
        } else {
            dados[key] = value;
        }
    }
    
    return dados;
}

/**
 * Preenche formulário com dados
 * @param {HTMLFormElement|string} formulario - Formulário ou ID do formulário
 * @param {Object} dados - Dados para preencher
 */
function setFormData(formulario, dados) {
    const form = typeof formulario === 'string' ? getElementById(formulario) : formulario;
    if (!form || !dados) return;
    
    Object.entries(dados).forEach(([name, value]) => {
        const campo = form.querySelector(`[name="${name}"]`);
        if (campo) {
            setValue(campo, value);
        }
    });
}

/**
 * Limpa todos os campos de um formulário
 * @param {HTMLFormElement|string} formulario - Formulário ou ID do formulário
 */
function clearForm(formulario) {
    const form = typeof formulario === 'string' ? getElementById(formulario) : formulario;
    if (!form) return;
    
    const campos = form.querySelectorAll('input, select, textarea');
    campos.forEach(campo => clearValue(campo));
}

/**
 * ========== ANIMAÇÕES E TRANSIÇÕES ==========
 */

/**
 * Fade in em um elemento
 * @param {HTMLElement|string} elemento - Elemento ou ID do elemento
 * @param {number} duracao - Duração em ms (padrão: 300)
 */
function fadeIn(elemento, duracao = 300) {
    const el = typeof elemento === 'string' ? getElementById(elemento) : elemento;
    if (!el) return;
    
    el.style.opacity = '0';
    el.style.display = '';
    removeClass(el, 'hidden');
    
    el.style.transition = `opacity ${duracao}ms ease-out`;
    
    // Force reflow
    el.offsetHeight;
    
    el.style.opacity = '1';
    
    setTimeout(() => {
        el.style.transition = '';
    }, duracao);
}

/**
 * Fade out em um elemento
 * @param {HTMLElement|string} elemento - Elemento ou ID do elemento
 * @param {number} duracao - Duração em ms (padrão: 300)
 */
function fadeOut(elemento, duracao = 300) {
    const el = typeof elemento === 'string' ? getElementById(elemento) : elemento;
    if (!el) return;
    
    el.style.transition = `opacity ${duracao}ms ease-out`;
    el.style.opacity = '0';
    
    setTimeout(() => {
        hide(el);
        el.style.transition = '';
        el.style.opacity = '';
    }, duracao);
}

/**
 * Slide down (mostrar com animação)
 * @param {HTMLElement|string} elemento - Elemento ou ID do elemento
 * @param {number} duracao - Duração em ms (padrão: 300)
 */
function slideDown(elemento, duracao = 300) {
    const el = typeof elemento === 'string' ? getElementById(elemento) : elemento;
    if (!el) return;
    
    el.style.height = '0';
    el.style.overflow = 'hidden';
    el.style.display = '';
    removeClass(el, 'hidden');
    
    const altura = el.scrollHeight;
    
    el.style.transition = `height ${duracao}ms ease-out`;
    el.style.height = altura + 'px';
    
    setTimeout(() => {
        el.style.height = '';
        el.style.overflow = '';
        el.style.transition = '';
    }, duracao);
}

/**
 * Slide up (esconder com animação)
 * @param {HTMLElement|string} elemento - Elemento ou ID do elemento
 * @param {number} duracao - Duração em ms (padrão: 300)
 */
function slideUp(elemento, duracao = 300) {
    const el = typeof elemento === 'string' ? getElementById(elemento) : elemento;
    if (!el) return;
    
    const altura = el.scrollHeight;
    el.style.height = altura + 'px';
    el.style.overflow = 'hidden';
    
    // Force reflow
    el.offsetHeight;
    
    el.style.transition = `height ${duracao}ms ease-out`;
    el.style.height = '0';
    
    setTimeout(() => {
        hide(el);
        el.style.height = '';
        el.style.overflow = '';
        el.style.transition = '';
    }, duracao);
}

/**
 * ========== UTILITÁRIOS DE POSIÇÃO E DIMENSÃO ==========
 */

/**
 * Obtém posição de um elemento
 * @param {HTMLElement|string} elemento - Elemento ou ID do elemento
 * @returns {Object} Objeto com posições {top, left, right, bottom}
 */
function getPosition(elemento) {
    const el = typeof elemento === 'string' ? getElementById(elemento) : elemento;
    if (!el) return { top: 0, left: 0, right: 0, bottom: 0 };
    
    const rect = el.getBoundingClientRect();
    return {
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        right: rect.right + window.scrollX,
        bottom: rect.bottom + window.scrollY
    };
}

/**
 * Obtém dimensões de um elemento
 * @param {HTMLElement|string} elemento - Elemento ou ID do elemento
 * @returns {Object} Objeto com dimensões {width, height}
 */
function getDimensions(elemento) {
    const el = typeof elemento === 'string' ? getElementById(elemento) : elemento;
    if (!el) return { width: 0, height: 0 };
    
    return {
        width: el.offsetWidth,
        height: el.offsetHeight
    };
}

/**
 * Rola página até um elemento
 * @param {HTMLElement|string} elemento - Elemento ou ID do elemento
 * @param {Object} options - Opções de rolagem
 */
function scrollToElement(elemento, options = {}) {
    const el = typeof elemento === 'string' ? getElementById(elemento) : elemento;
    if (!el) return;
    
    const defaultOptions = {
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
    };
    
    el.scrollIntoView({ ...defaultOptions, ...options });
}

/**
 * ========== EXPORTAÇÃO DAS FUNÇÕES ==========
 */

// Se estiver em ambiente de módulos, exportar
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        // Seletores
        getElementById,
        getElementsByClass,
        querySelector,
        querySelectorAll,
        
        // Classes
        addClass,
        removeClass,
        toggleClass,
        hasClass,
        
        // Conteúdo
        setHTML,
        getHTML,
        setText,
        getText,
        
        // Atributos
        setAttribute,
        getAttribute,
        removeAttribute,
        
        // Valores
        setValue,
        getValue,
        clearValue,
        
        // Visibilidade
        show,
        hide,
        toggle,
        isVisible,
        
        // Elementos
        createElement,
        removeElement,
        insertBefore,
        insertAfter,
        
        // Eventos
        addEventListener,
        removeEventListener,
        dispatchEvent,
        
        // Formulários
        getFormData,
        setFormData,
        clearForm,
        
        // Animações
        fadeIn,
        fadeOut,
        slideDown,
        slideUp,
        
        // Posição
        getPosition,
        getDimensions,
        scrollToElement
    };
}

// Disponibilizar globalmente se não estiver em módulo
if (typeof window !== 'undefined') {
    window.DOMUtils = {
        getElementById,
        getElementsByClass,
        querySelector,
        querySelectorAll,
        addClass,
        removeClass,
        toggleClass,
        hasClass,
        setHTML,
        getHTML,
        setText,
        getText,
        setAttribute,
        getAttribute,
        removeAttribute,
        setValue,
        getValue,
        clearValue,
        show,
        hide,
        toggle,
        isVisible,
        createElement,
        removeElement,
        insertBefore,
        insertAfter,
        addEventListener,
        removeEventListener,
        dispatchEvent,
        getFormData,
        setFormData,
        clearForm,
        fadeIn,
        fadeOut,
        slideDown,
        slideUp,
        getPosition,
        getDimensions,
        scrollToElement
    };
}

/* ==========================================================================
   FIM DO MÓDULO DOM - Sistema de Gestão v5.1
   ========================================================================== */ 
