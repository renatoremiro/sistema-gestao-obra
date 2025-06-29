/* ==========================================================================
   SISTEMA DE VALIDAÇÕES - Sistema de Gestão v5.1
   ========================================================================== */

/**
 * Módulo responsável por todas as validações do sistema
 * Fornece validações de campos, formulários, regras de negócio e feedback visual
 */

/**
 * ========== CONFIGURAÇÕES E CONSTANTES ==========
 */

const CONFIG_VALIDACAO = {
    // Classes CSS para estados de validação
    classes: {
        sucesso: 'validation-success',
        erro: 'validation-error',
        aviso: 'validation-warning',
        campo: 'validation-field',
        mensagem: 'validation-message'
    },
    
    // Mensagens padrão de erro
    mensagens: {
        obrigatorio: 'Este campo é obrigatório',
        email: 'Digite um email válido',
        telefone: 'Digite um telefone válido',
        cpf: 'Digite um CPF válido',
        cnpj: 'Digite um CNPJ válido',
        data: 'Digite uma data válida',
        horario: 'Digite um horário válido',
        numero: 'Digite apenas números',
        decimal: 'Digite um número válido',
        min: 'Valor deve ser maior que {min}',
        max: 'Valor deve ser menor que {max}',
        minLength: 'Deve ter pelo menos {min} caracteres',
        maxLength: 'Deve ter no máximo {max} caracteres',
        senha: 'Senha deve ter pelo menos 6 caracteres',
        confirmacao: 'As senhas não coincidem',
        url: 'Digite uma URL válida',
        dataFutura: 'Data deve ser no futuro',
        dataPassada: 'Data deve ser no passado',
        prazoInvalido: 'Prazo não pode ser no passado',
        responsavelObrigatorio: 'Selecione pelo menos um responsável',
        arquivoTamanho: 'Arquivo muito grande (máximo {max})',
        arquivoTipo: 'Tipo de arquivo não permitido'
    },
    
    // Padrões de validação
    padroes: {
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        telefone: /^(\(?\d{2}\)?\s?)?(\d{4,5})-?(\d{4})$/,
        cpf: /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/,
        cnpj: /^\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}$/,
        data: /^\d{4}-\d{2}-\d{2}$/,
        horario: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        numero: /^\d+$/,
        decimal: /^\d+([.,]\d+)?$/,
        url: /^https?:\/\/.+/
    }
};

/**
 * ========== STATE DE VALIDAÇÃO ==========
 */

let validacaoAtiva = new Map();
let regrasPersonalizadas = new Map();
let mensagensPersonalizadas = new Map();

/**
 * ========== INICIALIZAÇÃO ==========
 */

/**
 * Inicializa o sistema de validação
 */
function inicializarValidacao() {
    aplicarEstilosValidacao();
    configurarEventosGlobais();
    
    console.log('✅ Sistema de validação inicializado');
}

/**
 * Aplica estilos CSS para validação
 */
function aplicarEstilosValidacao() {
    if (document.getElementById('validation-styles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'validation-styles';
    styles.textContent = `
        .validation-field {
            position: relative;
        }
        
        .validation-field input,
        .validation-field select,
        .validation-field textarea {
            transition: border-color 0.2s, box-shadow 0.2s;
        }
        
        .validation-success input,
        .validation-success select,
        .validation-success textarea {
            border-color: #10b981 !important;
            box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }
        
        .validation-error input,
        .validation-error select,
        .validation-error textarea {
            border-color: #ef4444 !important;
            box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
            animation: shake 0.5s ease-in-out;
        }
        
        .validation-warning input,
        .validation-warning select,
        .validation-warning textarea {
            border-color: #f59e0b !important;
            box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
        }
        
        .validation-message {
            font-size: 12px;
            margin-top: 4px;
            display: flex;
            align-items: center;
            gap: 4px;
            opacity: 0;
            transform: translateY(-10px);
            transition: all 0.2s ease-out;
        }
        
        .validation-message.show {
            opacity: 1;
            transform: translateY(0);
        }
        
        .validation-message.success {
            color: #10b981;
        }
        
        .validation-message.error {
            color: #ef4444;
        }
        
        .validation-message.warning {
            color: #f59e0b;
        }
        
        .validation-icon {
            font-size: 14px;
        }
        
        .validation-counter {
            font-size: 11px;
            color: #6b7280;
            margin-top: 2px;
            text-align: right;
        }
        
        .validation-counter.warning {
            color: #f59e0b;
        }
        
        .validation-counter.error {
            color: #ef4444;
        }
        
        @keyframes shake {
            0%, 20%, 40%, 60%, 80%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-3px); }
        }
        
        /* Loading indicator para validações assíncronas */
        .validation-loading {
            position: absolute;
            right: 10px;
            top: 50%;
            transform: translateY(-50%);
            width: 16px;
            height: 16px;
            border: 2px solid #e5e7eb;
            border-top-color: #3b82f6;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            to { transform: translateY(-50%) rotate(360deg); }
        }
        
        /* Tooltip de validação */
        .validation-tooltip {
            position: absolute;
            bottom: 100%;
            left: 0;
            background: #1f2937;
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 12px;
            white-space: nowrap;
            opacity: 0;
            pointer-events: none;
            transform: translateY(4px);
            transition: all 0.2s;
            z-index: 1000;
            max-width: 250px;
            white-space: normal;
        }
        
        .validation-field:hover .validation-tooltip {
            opacity: 1;
            transform: translateY(0);
        }
        
        .validation-tooltip::after {
            content: '';
            position: absolute;
            top: 100%;
            left: 20px;
            width: 0;
            height: 0;
            border-left: 5px solid transparent;
            border-right: 5px solid transparent;
            border-top: 5px solid #1f2937;
        }
    `;
    
    document.head.appendChild(styles);
}

/**
 * Configura eventos globais de validação
 */
function configurarEventosGlobais() {
    // Validação em tempo real ao digitar
    document.addEventListener('input', function(e) {
        if (e.target.matches('input, textarea')) {
            const campo = e.target;
            if (validacaoAtiva.has(campo.id || campo.name)) {
                setTimeout(() => validarCampo(campo), 300);
            }
        }
    });
    
    // Validação ao sair do campo
    document.addEventListener('blur', function(e) {
        if (e.target.matches('input, select, textarea')) {
            validarCampo(e.target);
        }
    }, true);
    
    // Validação de formulários ao submeter
    document.addEventListener('submit', function(e) {
        const form = e.target;
        if (form.hasAttribute('data-validate')) {
            e.preventDefault();
            validarFormulario(form);
        }
    });
}

/**
 * ========== VALIDAÇÕES BÁSICAS ==========
 */

/**
 * Valida se campo é obrigatório
 * @param {string} valor - Valor a validar
 * @returns {Object} Resultado da validação
 */
function validarObrigatorio(valor) {
    const valido = valor !== null && valor !== undefined && valor.toString().trim() !== '';
    
    return {
        valido,
        mensagem: valido ? '' : CONFIG_VALIDACAO.mensagens.obrigatorio
    };
}

/**
 * Valida formato de email
 * @param {string} email - Email a validar
 * @returns {Object} Resultado da validação
 */
function validarEmail(email) {
    if (!email) return { valido: true, mensagem: '' };
    
    const valido = CONFIG_VALIDACAO.padroes.email.test(email);
    
    return {
        valido,
        mensagem: valido ? '' : CONFIG_VALIDACAO.mensagens.email
    };
}

/**
 * Valida formato de telefone brasileiro
 * @param {string} telefone - Telefone a validar
 * @returns {Object} Resultado da validação
 */
function validarTelefone(telefone) {
    if (!telefone) return { valido: true, mensagem: '' };
    
    const valido = CONFIG_VALIDACAO.padroes.telefone.test(telefone);
    
    return {
        valido,
        mensagem: valido ? '' : CONFIG_VALIDACAO.mensagens.telefone
    };
}

/**
 * Valida CPF brasileiro
 * @param {string} cpf - CPF a validar
 * @returns {Object} Resultado da validação
 */
function validarCPF(cpf) {
    if (!cpf) return { valido: true, mensagem: '' };
    
    // Remove formatação
    const cpfLimpo = cpf.replace(/[^\d]/g, '');
    
    if (cpfLimpo.length !== 11) {
        return { valido: false, mensagem: CONFIG_VALIDACAO.mensagens.cpf };
    }
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cpfLimpo)) {
        return { valido: false, mensagem: CONFIG_VALIDACAO.mensagens.cpf };
    }
    
    // Validação dos dígitos verificadores
    let soma = 0;
    for (let i = 0; i < 9; i++) {
        soma += parseInt(cpfLimpo.charAt(i)) * (10 - i);
    }
    
    let resto = 11 - (soma % 11);
    let digitoVerificador1 = resto > 9 ? 0 : resto;
    
    if (parseInt(cpfLimpo.charAt(9)) !== digitoVerificador1) {
        return { valido: false, mensagem: CONFIG_VALIDACAO.mensagens.cpf };
    }
    
    soma = 0;
    for (let i = 0; i < 10; i++) {
        soma += parseInt(cpfLimpo.charAt(i)) * (11 - i);
    }
    
    resto = 11 - (soma % 11);
    let digitoVerificador2 = resto > 9 ? 0 : resto;
    
    const valido = parseInt(cpfLimpo.charAt(10)) === digitoVerificador2;
    
    return {
        valido,
        mensagem: valido ? '' : CONFIG_VALIDACAO.mensagens.cpf
    };
}

/**
 * Valida formato de data
 * @param {string} data - Data a validar (YYYY-MM-DD)
 * @returns {Object} Resultado da validação
 */
function validarData(data) {
    if (!data) return { valido: true, mensagem: '' };
    
    if (!CONFIG_VALIDACAO.padroes.data.test(data)) {
        return { valido: false, mensagem: CONFIG_VALIDACAO.mensagens.data };
    }
    
    const dataObj = new Date(data + 'T00:00:00');
    const valido = !isNaN(dataObj.getTime());
    
    return {
        valido,
        mensagem: valido ? '' : CONFIG_VALIDACAO.mensagens.data
    };
}

/**
 * Valida formato de horário
 * @param {string} horario - Horário a validar (HH:MM)
 * @returns {Object} Resultado da validação
 */
function validarHorario(horario) {
    if (!horario) return { valido: true, mensagem: '' };
    
    const valido = CONFIG_VALIDACAO.padroes.horario.test(horario);
    
    return {
        valido,
        mensagem: valido ? '' : CONFIG_VALIDACAO.mensagens.horario
    };
}

/**
 * Valida tamanho mínimo e máximo
 * @param {string} valor - Valor a validar
 * @param {number} min - Tamanho mínimo
 * @param {number} max - Tamanho máximo
 * @returns {Object} Resultado da validação
 */
function validarTamanho(valor, min = 0, max = Infinity) {
    const tamanho = valor ? valor.toString().length : 0;
    
    if (tamanho < min) {
        return {
            valido: false,
            mensagem: CONFIG_VALIDACAO.mensagens.minLength.replace('{min}', min)
        };
    }
    
    if (tamanho > max) {
        return {
            valido: false,
            mensagem: CONFIG_VALIDACAO.mensagens.maxLength.replace('{max}', max)
        };
    }
    
    return { valido: true, mensagem: '' };
}

/**
 * Valida valor numérico
 * @param {string} valor - Valor a validar
 * @param {number} min - Valor mínimo
 * @param {number} max - Valor máximo
 * @returns {Object} Resultado da validação
 */
function validarNumero(valor, min = -Infinity, max = Infinity) {
    if (!valor) return { valido: true, mensagem: '' };
    
    const numero = parseFloat(valor.toString().replace(',', '.'));
    
    if (isNaN(numero)) {
        return { valido: false, mensagem: CONFIG_VALIDACAO.mensagens.numero };
    }
    
    if (numero < min) {
        return {
            valido: false,
            mensagem: CONFIG_VALIDACAO.mensagens.min.replace('{min}', min)
        };
    }
    
    if (numero > max) {
        return {
            valido: false,
            mensagem: CONFIG_VALIDACAO.mensagens.max.replace('{max}', max)
        };
    }
    
    return { valido: true, mensagem: '' };
}

/**
 * ========== VALIDAÇÕES ESPECÍFICAS DO SISTEMA ==========
 */

/**
 * Valida prazo (não pode ser no passado)
 * @param {string} prazo - Data do prazo
 * @returns {Object} Resultado da validação
 */
function validarPrazo(prazo) {
    if (!prazo) return { valido: true, mensagem: '' };
    
    const resultadoData = validarData(prazo);
    if (!resultadoData.valido) return resultadoData;
    
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    const dataPrazo = new Date(prazo + 'T00:00:00');
    
    if (dataPrazo < hoje) {
        return {
            valido: false,
            mensagem: CONFIG_VALIDACAO.mensagens.prazoInvalido
        };
    }
    
    return { valido: true, mensagem: '' };
}

/**
 * Valida seleção de responsáveis
 * @param {Array|string} responsaveis - Responsáveis selecionados
 * @returns {Object} Resultado da validação
 */
function validarResponsaveis(responsaveis) {
    let lista = responsaveis;
    
    if (typeof responsaveis === 'string') {
        lista = responsaveis.split(',').map(r => r.trim()).filter(r => r);
    }
    
    if (!Array.isArray(lista) || lista.length === 0) {
        return {
            valido: false,
            mensagem: CONFIG_VALIDACAO.mensagens.responsavelObrigatorio
        };
    }
    
    return { valido: true, mensagem: '' };
}

/**
 * Valida horário de evento (início deve ser antes do fim)
 * @param {string} inicio - Horário de início
 * @param {string} fim - Horário de fim
 * @returns {Object} Resultado da validação
 */
function validarHorarioEvento(inicio, fim) {
    if (!inicio || !fim) return { valido: true, mensagem: '' };
    
    const inicioMinutos = converterHorarioParaMinutos(inicio);
    const fimMinutos = converterHorarioParaMinutos(fim);
    
    if (inicioMinutos >= fimMinutos) {
        return {
            valido: false,
            mensagem: 'Horário de início deve ser anterior ao término'
        };
    }
    
    return { valido: true, mensagem: '' };
}

/**
 * Valida arquivo upload
 * @param {File} arquivo - Arquivo a validar
 * @param {Object} opcoes - Opções de validação
 * @returns {Object} Resultado da validação
 */
function validarArquivo(arquivo, opcoes = {}) {
    if (!arquivo) return { valido: true, mensagem: '' };
    
    const {
        tamanhoMax = 5 * 1024 * 1024, // 5MB padrão
        tiposPermitidos = ['image/*', 'application/pdf', '.doc', '.docx']
    } = opcoes;
    
    // Validar tamanho
    if (arquivo.size > tamanhoMax) {
        return {
            valido: false,
            mensagem: CONFIG_VALIDACAO.mensagens.arquivoTamanho
                .replace('{max}', formatarTamanhoArquivo(tamanhoMax))
        };
    }
    
    // Validar tipo
    const tipoValido = tiposPermitidos.some(tipo => {
        if (tipo.includes('*')) {
            return arquivo.type.startsWith(tipo.replace('*', ''));
        }
        return arquivo.name.toLowerCase().endsWith(tipo);
    });
    
    if (!tipoValido) {
        return {
            valido: false,
            mensagem: CONFIG_VALIDACAO.mensagens.arquivoTipo
        };
    }
    
    return { valido: true, mensagem: '' };
}

/**
 * ========== VALIDAÇÃO DE CAMPOS ==========
 */

/**
 * Valida um campo específico
 * @param {HTMLElement|string} campo - Campo a validar
 * @param {Object} regras - Regras de validação
 * @returns {Object} Resultado da validação
 */
function validarCampo(campo, regras = null) {
    const elemento = typeof campo === 'string' ? document.getElementById(campo) : campo;
    if (!elemento) return { valido: false, mensagem: 'Campo não encontrado' };
    
    const valor = obterValorCampo(elemento);
    const nomeRegras = regras || obterRegrasElemento(elemento);
    
    if (!nomeRegras) return { valido: true, mensagem: '' };
    
    const resultados = [];
    
    // Validar cada regra
    for (let [nomeRegra, parametros] of Object.entries(nomeRegras)) {
        let resultado;
        
        switch (nomeRegra) {
            case 'obrigatorio':
                if (parametros) resultado = validarObrigatorio(valor);
                break;
            case 'email':
                if (parametros) resultado = validarEmail(valor);
                break;
            case 'telefone':
                if (parametros) resultado = validarTelefone(valor);
                break;
            case 'cpf':
                if (parametros) resultado = validarCPF(valor);
                break;
            case 'data':
                if (parametros) resultado = validarData(valor);
                break;
            case 'horario':
                if (parametros) resultado = validarHorario(valor);
                break;
            case 'prazo':
                if (parametros) resultado = validarPrazo(valor);
                break;
            case 'tamanho':
                if (parametros) resultado = validarTamanho(valor, parametros.min, parametros.max);
                break;
            case 'numero':
                if (parametros) resultado = validarNumero(valor, parametros.min, parametros.max);
                break;
            case 'personalizada':
                if (regrasPersonalizadas.has(parametros)) {
                    resultado = regrasPersonalizadas.get(parametros)(valor, elemento);
                }
                break;
        }
        
        if (resultado && !resultado.valido) {
            resultados.push(resultado);
        }
    }
    
    // Aplicar feedback visual
    const resultadoFinal = resultados.length > 0 ? resultados[0] : { valido: true, mensagem: '' };
    aplicarFeedbackVisual(elemento, resultadoFinal);
    
    return resultadoFinal;
}

/**
 * Valida formulário completo
 * @param {HTMLFormElement|string} formulario - Formulário a validar
 * @returns {Object} Resultado da validação
 */
function validarFormulario(formulario) {
    const form = typeof formulario === 'string' ? document.getElementById(formulario) : formulario;
    if (!form) return { valido: false, erros: ['Formulário não encontrado'] };
    
    const campos = form.querySelectorAll('input, select, textarea');
    const erros = [];
    let primeiroErro = null;
    
    campos.forEach(campo => {
        const resultado = validarCampo(campo);
        if (!resultado.valido) {
            erros.push({
                campo: campo.name || campo.id,
                mensagem: resultado.mensagem
            });
            
            if (!primeiroErro) {
                primeiroErro = campo;
            }
        }
    });
    
    // Focar no primeiro erro
    if (primeiroErro) {
        primeiroErro.focus();
        primeiroErro.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    return {
        valido: erros.length === 0,
        erros: erros
    };
}

/**
 * ========== FEEDBACK VISUAL ==========
 */

/**
 * Aplica feedback visual ao campo
 * @param {HTMLElement} elemento - Elemento do campo
 * @param {Object} resultado - Resultado da validação
 */
function aplicarFeedbackVisual(elemento, resultado) {
    const container = obterContainerValidacao(elemento);
    
    // Remover classes anteriores
    container.classList.remove(
        CONFIG_VALIDACAO.classes.sucesso,
        CONFIG_VALIDACAO.classes.erro,
        CONFIG_VALIDACAO.classes.aviso
    );
    
    // Adicionar classe apropriada
    if (resultado.valido) {
        if (elemento.value) {
            container.classList.add(CONFIG_VALIDACAO.classes.sucesso);
        }
    } else {
        container.classList.add(CONFIG_VALIDACAO.classes.erro);
    }
    
    // Mostrar/atualizar mensagem
    atualizarMensagemValidacao(container, resultado);
    
    // Registrar validação ativa
    if (elemento.id || elemento.name) {
        validacaoAtiva.set(elemento.id || elemento.name, true);
    }
}

/**
 * Atualiza mensagem de validação
 * @param {HTMLElement} container - Container do campo
 * @param {Object} resultado - Resultado da validação
 */
function atualizarMensagemValidacao(container, resultado) {
    let mensagemEl = container.querySelector('.validation-message');
    
    if (!mensagemEl) {
        mensagemEl = document.createElement('div');
        mensagemEl.className = 'validation-message';
        container.appendChild(mensagemEl);
    }
    
    if (resultado.mensagem) {
        const icone = resultado.valido ? '✅' : '❌';
        const tipo = resultado.valido ? 'success' : 'error';
        
        mensagemEl.innerHTML = `
            <span class="validation-icon">${icone}</span>
            <span>${resultado.mensagem}</span>
        `;
        
        mensagemEl.className = `validation-message ${tipo} show`;
    } else {
        mensagemEl.classList.remove('show');
        setTimeout(() => {
            if (mensagemEl.parentNode) {
                mensagemEl.parentNode.removeChild(mensagemEl);
            }
        }, 200);
    }
}

/**
 * ========== FUNÇÕES AUXILIARES ==========
 */

/**
 * Obtém valor do campo baseado no tipo
 * @param {HTMLElement} elemento - Elemento do campo
 * @returns {string|Array} Valor do campo
 */
function obterValorCampo(elemento) {
    if (elemento.type === 'checkbox') {
        return elemento.checked;
    } else if (elemento.type === 'radio') {
        const form = elemento.closest('form') || document;
        const radio = form.querySelector(`input[name="${elemento.name}"]:checked`);
        return radio ? radio.value : '';
    } else if (elemento.tagName === 'SELECT' && elemento.multiple) {
        return Array.from(elemento.selectedOptions).map(opt => opt.value);
    } else {
        return elemento.value;
    }
}

/**
 * Obtém regras de validação do elemento
 * @param {HTMLElement} elemento - Elemento do campo
 * @returns {Object} Regras de validação
 */
function obterRegrasElemento(elemento) {
    const regras = {};
    
    // Atributos HTML5
    if (elemento.required) regras.obrigatorio = true;
    if (elemento.type === 'email') regras.email = true;
    if (elemento.type === 'tel') regras.telefone = true;
    if (elemento.type === 'date') regras.data = true;
    if (elemento.type === 'time') regras.horario = true;
    if (elemento.type === 'number') {
        regras.numero = {
            min: elemento.min ? parseFloat(elemento.min) : -Infinity,
            max: elemento.max ? parseFloat(elemento.max) : Infinity
        };
    }
    
    // Atributos customizados
    if (elemento.hasAttribute('data-validate-cpf')) regras.cpf = true;
    if (elemento.hasAttribute('data-validate-prazo')) regras.prazo = true;
    
    // Tamanho
    if (elemento.minLength || elemento.maxLength) {
        regras.tamanho = {
            min: elemento.minLength || 0,
            max: elemento.maxLength || Infinity
        };
    }
    
    // Regras customizadas via atributo
    const customRules = elemento.getAttribute('data-validate');
    if (customRules) {
        try {
            const parsed = JSON.parse(customRules);
            Object.assign(regras, parsed);
        } catch (e) {
            console.warn('Erro ao parsear regras de validação:', e);
        }
    }
    
    return Object.keys(regras).length > 0 ? regras : null;
}

/**
 * Obtém ou cria container de validação
 * @param {HTMLElement} elemento - Elemento do campo
 * @returns {HTMLElement} Container de validação
 */
function obterContainerValidacao(elemento) {
    let container = elemento.closest('.validation-field');
    
    if (!container) {
        // Verificar se o pai já é um container adequado
        const pai = elemento.parentElement;
        if (pai && (pai.classList.contains('form-group') || pai.classList.contains('field'))) {
            container = pai;
        } else {
            // Criar wrapper
            container = document.createElement('div');
            elemento.parentNode.insertBefore(container, elemento);
            container.appendChild(elemento);
        }
        
        container.classList.add('validation-field');
    }
    
    return container;
}

/**
 * Converte horário para minutos
 * @param {string} horario - Horário no formato HH:MM
 * @returns {number} Minutos desde meia-noite
 */
function converterHorarioParaMinutos(horario) {
    const [horas, minutos] = horario.split(':').map(Number);
    return horas * 60 + minutos;
}

/**
 * Formata tamanho de arquivo
 * @param {number} bytes - Tamanho em bytes
 * @returns {string} Tamanho formatado
 */
function formatarTamanhoArquivo(bytes) {
    const unidades = ['B', 'KB', 'MB', 'GB'];
    let tamanho = bytes;
    let unidade = 0;
    
    while (tamanho >= 1024 && unidade < unidades.length - 1) {
        tamanho /= 1024;
        unidade++;
    }
    
    return `${tamanho.toFixed(1)} ${unidades[unidade]}`;
}

/**
 * ========== CONFIGURAÇÃO E EXTENSIBILIDADE ==========
 */

/**
 * Adiciona regra de validação personalizada
 * @param {string} nome - Nome da regra
 * @param {Function} validador - Função validadora
 */
function adicionarRegra(nome, validador) {
    regrasPersonalizadas.set(nome, validador);
}

/**
 * Adiciona mensagem personalizada
 * @param {string} tipo - Tipo da mensagem
 * @param {string} mensagem - Mensagem personalizada
 */
function adicionarMensagem(tipo, mensagem) {
    mensagensPersonalizadas.set(tipo, mensagem);
    CONFIG_VALIDACAO.mensagens[tipo] = mensagem;
}

/**
 * Remove validação de um campo
 * @param {HTMLElement|string} campo - Campo a limpar
 */
function limparValidacao(campo) {
    const elemento = typeof campo === 'string' ? document.getElementById(campo) : campo;
    if (!elemento) return;
    
    const container = elemento.closest('.validation-field');
    if (container) {
        container.classList.remove(
            CONFIG_VALIDACAO.classes.sucesso,
            CONFIG_VALIDACAO.classes.erro,
            CONFIG_VALIDACAO.classes.aviso
        );
        
        const mensagem = container.querySelector('.validation-message');
        if (mensagem) {
            mensagem.remove();
        }
    }
    
    validacaoAtiva.delete(elemento.id || elemento.name);
}

/**
 * ========== EXPORTAÇÃO DAS FUNÇÕES ==========
 */

// Se estiver em ambiente de módulos, exportar
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        // Inicialização
        inicializarValidacao,
        
        // Validações básicas
        validarObrigatorio,
        validarEmail,
        validarTelefone,
        validarCPF,
        validarData,
        validarHorario,
        validarTamanho,
        validarNumero,
        
        // Validações específicas
        validarPrazo,
        validarResponsaveis,
        validarHorarioEvento,
        validarArquivo,
        
        // Validação de campos e formulários
        validarCampo,
        validarFormulario,
        
        // Configuração
        adicionarRegra,
        adicionarMensagem,
        limparValidacao,
        
        // Feedback visual
        aplicarFeedbackVisual
    };
}

// Disponibilizar globalmente se não estiver em módulo
if (typeof window !== 'undefined') {
    window.Validators = {
        inicializar: inicializarValidacao,
        obrigatorio: validarObrigatorio,
        email: validarEmail,
        telefone: validarTelefone,
        cpf: validarCPF,
        data: validarData,
        horario: validarHorario,
        tamanho: validarTamanho,
        numero: validarNumero,
        prazo: validarPrazo,
        responsaveis: validarResponsaveis,
        horarioEvento: validarHorarioEvento,
        arquivo: validarArquivo,
        campo: validarCampo,
        formulario: validarFormulario,
        adicionarRegra,
        adicionarMensagem,
        limpar: limparValidacao,
        feedback: aplicarFeedbackVisual
    };
    
    // Auto-inicializar quando o DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inicializarValidacao);
    } else {
        inicializarValidacao();
    }
}

/* ==========================================================================
   FIM DO MÓDULO VALIDATORS - Sistema de Gestão v5.1
   ========================================================================== */ 
