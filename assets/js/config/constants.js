/* ==========================================================================
   CONSTANTES GLOBAIS - Sistema de Gestão v5.1
   ========================================================================== */

/**
 * Informações da versão do sistema
 */
const VERSAO_SISTEMA = '5.1';
const VERSAO_DB = 5;
const BUILD_DATE = '2025-06-28';
const AUTOR = 'Sistema de Gestão Colaborativo';

/**
 * Configurações de armazenamento
 */
const STORAGE_KEYS = {
    SISTEMA: 'sistemaGestaoFirebase',
    USUARIO: 'usuarioAtual',
    PREFERENCIAS: 'preferenciasUsuario',
    CACHE: 'cacheLocal',
    BACKUP: 'backupLocal'
};

/**
 * Intervalos de tempo (em milissegundos)
 */
const INTERVALOS = {
    SALVAMENTO_AUTO: 5000,           // 5 segundos
    VERIFICACAO_PRAZOS: 3600000,     // 1 hora
    SYNC_HEARTBEAT: 30000,           // 30 segundos
    TIMEOUT_NOTIFICACAO: 3000,       // 3 segundos
    TIMEOUT_ALERTA: 10000,           // 10 segundos
    DEBOUNCE_BUSCA: 300,             // 300ms
    ANIMACAO_RAPIDA: 150,            // 150ms
    ANIMACAO_NORMAL: 300,            // 300ms
    ANIMACAO_LENTA: 500              // 500ms
};

/**
 * Status das atividades
 */
const STATUS_ATIVIDADE = {
    VERDE: 'verde',
    AMARELO: 'amarelo',
    VERMELHO: 'vermelho'
};

const STATUS_LABELS = {
    [STATUS_ATIVIDADE.VERDE]: 'Em Dia',
    [STATUS_ATIVIDADE.AMARELO]: 'Atenção',
    [STATUS_ATIVIDADE.VERMELHO]: 'Atraso'
};

const STATUS_CORES = {
    [STATUS_ATIVIDADE.VERDE]: '#10b981',
    [STATUS_ATIVIDADE.AMARELO]: '#f59e0b',
    [STATUS_ATIVIDADE.VERMELHO]: '#ef4444'
};

/**
 * Tipos de eventos
 */
const TIPOS_EVENTO = {
    REUNIAO: 'reuniao',
    ENTREGA: 'entrega',
    PRAZO: 'prazo',
    MARCO: 'marco',
    OUTRO: 'outro'
};

const EVENTO_LABELS = {
    [TIPOS_EVENTO.REUNIAO]: 'Reunião',
    [TIPOS_EVENTO.ENTREGA]: 'Entrega',
    [TIPOS_EVENTO.PRAZO]: 'Prazo',
    [TIPOS_EVENTO.MARCO]: 'Marco do Projeto',
    [TIPOS_EVENTO.OUTRO]: 'Outro'
};

const EVENTO_ICONES = {
    [TIPOS_EVENTO.REUNIAO]: '📅',
    [TIPOS_EVENTO.ENTREGA]: '📦',
    [TIPOS_EVENTO.PRAZO]: '⏰',
    [TIPOS_EVENTO.MARCO]: '🎯',
    [TIPOS_EVENTO.OUTRO]: '📌'
};

const EVENTO_CORES = {
    [TIPOS_EVENTO.REUNIAO]: '#3b82f6',
    [TIPOS_EVENTO.ENTREGA]: '#10b981',
    [TIPOS_EVENTO.PRAZO]: '#ef4444',
    [TIPOS_EVENTO.MARCO]: '#8b5cf6',
    [TIPOS_EVENTO.OUTRO]: '#6b7280'
};

/**
 * Tipos de recorrência
 */
const TIPOS_RECORRENCIA = {
    UNICA: 'unica',
    DIARIA: 'diaria',
    SEMANAL: 'semanal',
    QUINZENAL: 'quinzenal',
    MENSAL: 'mensal',
    BIMESTRAL: 'bimestral',
    PERSONALIZADA: 'personalizada'
};

const RECORRENCIA_LABELS = {
    [TIPOS_RECORRENCIA.UNICA]: 'Única vez',
    [TIPOS_RECORRENCIA.DIARIA]: 'Diária',
    [TIPOS_RECORRENCIA.SEMANAL]: 'Semanal',
    [TIPOS_RECORRENCIA.QUINZENAL]: 'Quinzenal',
    [TIPOS_RECORRENCIA.MENSAL]: 'Mensal',
    [TIPOS_RECORRENCIA.BIMESTRAL]: 'Bimestral',
    [TIPOS_RECORRENCIA.PERSONALIZADA]: 'Personalizada'
};

/**
 * Prioridades das tarefas
 */
const PRIORIDADES_TAREFA = {
    BAIXA: 'baixa',
    MEDIA: 'media',
    ALTA: 'alta'
};

const PRIORIDADE_LABELS = {
    [PRIORIDADES_TAREFA.BAIXA]: 'Baixa',
    [PRIORIDADES_TAREFA.MEDIA]: 'Média',
    [PRIORIDADES_TAREFA.ALTA]: 'Alta'
};

const PRIORIDADE_CORES = {
    [PRIORIDADES_TAREFA.BAIXA]: '#10b981',
    [PRIORIDADES_TAREFA.MEDIA]: '#f59e0b',
    [PRIORIDADES_TAREFA.ALTA]: '#ef4444'
};

const PRIORIDADE_ICONES = {
    [PRIORIDADES_TAREFA.BAIXA]: '🟢',
    [PRIORIDADES_TAREFA.MEDIA]: '🟡',
    [PRIORIDADES_TAREFA.ALTA]: '🔴'
};

/**
 * Status das tarefas
 */
const STATUS_TAREFA = {
    PENDENTE: 'pendente',
    EM_ANDAMENTO: 'em_andamento',
    CONCLUIDA: 'concluida',
    CANCELADA: 'cancelada'
};

/**
 * Tipos de status pessoal
 */
const STATUS_PESSOAL = {
    PRESENTE: 'presente',
    AUSENCIA: 'ausencia',
    HOME_OFFICE: 'home-office'
};

const STATUS_PESSOAL_LABELS = {
    [STATUS_PESSOAL.PRESENTE]: 'Presente',
    [STATUS_PESSOAL.AUSENCIA]: 'Ausência',
    [STATUS_PESSOAL.HOME_OFFICE]: 'Home Office'
};

const STATUS_PESSOAL_ICONES = {
    [STATUS_PESSOAL.PRESENTE]: '✅',
    [STATUS_PESSOAL.AUSENCIA]: '❌',
    [STATUS_PESSOAL.HOME_OFFICE]: '🏠'
};

/**
 * Dias da semana
 */
const DIAS_SEMANA = {
    DOMINGO: 0,
    SEGUNDA: 1,
    TERCA: 2,
    QUARTA: 3,
    QUINTA: 4,
    SEXTA: 5,
    SABADO: 6
};

const DIAS_SEMANA_LABELS = {
    [DIAS_SEMANA.DOMINGO]: 'Domingo',
    [DIAS_SEMANA.SEGUNDA]: 'Segunda',
    [DIAS_SEMANA.TERCA]: 'Terça',
    [DIAS_SEMANA.QUARTA]: 'Quarta',
    [DIAS_SEMANA.QUINTA]: 'Quinta',
    [DIAS_SEMANA.SEXTA]: 'Sexta',
    [DIAS_SEMANA.SABADO]: 'Sábado'
};

const DIAS_SEMANA_ABREV = {
    [DIAS_SEMANA.DOMINGO]: 'Dom',
    [DIAS_SEMANA.SEGUNDA]: 'Seg',
    [DIAS_SEMANA.TERCA]: 'Ter',
    [DIAS_SEMANA.QUARTA]: 'Qua',
    [DIAS_SEMANA.QUINTA]: 'Qui',
    [DIAS_SEMANA.SEXTA]: 'Sex',
    [DIAS_SEMANA.SABADO]: 'Sáb'
};

/**
 * Meses do ano
 */
const MESES = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const MESES_ABREV = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
];

/**
 * Configurações do calendário
 */
const CALENDARIO_CONFIG = {
    ALTURA_CELULA_DESKTOP: 100,
    ALTURA_CELULA_MOBILE: 60,
    ALTURA_CELULA_PEQUENA: 50,
    MAX_EVENTOS_VISIVEIS: 3,
    DIAS_VISAO_SEMANA: 7,
    DIAS_VISAO_MES: 35
};

/**
 * Configurações de validação
 */
const VALIDACAO = {
    MIN_SENHA: 6,
    MAX_TITULO_EVENTO: 100,
    MAX_DESCRICAO: 500,
    MAX_NOME_ATIVIDADE: 200,
    MIN_DIAS_PRAZO: 0,
    MAX_PROGRESSO: 100,
    MAX_ARQUIVOS_UPLOAD: 10,
    TAMANHO_MAX_ARQUIVO: 5242880 // 5MB
};

/**
 * Mensagens do sistema
 */
const MENSAGENS = {
    SUCESSO: {
        SALVAMENTO: 'Dados salvos com sucesso!',
        EVENTO_CRIADO: 'Evento criado com sucesso!',
        ATIVIDADE_CRIADA: 'Atividade criada com sucesso!',
        TAREFA_CRIADA: 'Tarefa criada com sucesso!',
        LOGIN_SUCESSO: 'Login realizado com sucesso!',
        LOGOUT_SUCESSO: 'Até logo!',
        SYNC_SUCESSO: '✓ Sincronizado',
        DADOS_EXPORTADOS: 'Dados exportados com sucesso!',
        DADOS_IMPORTADOS: 'Dados importados com sucesso!'
    },
    ERRO: {
        CAMPOS_OBRIGATORIOS: 'Preencha todos os campos obrigatórios!',
        PRAZO_PASSADO: 'Não é possível criar atividade com prazo no passado!',
        ERRO_SALVAMENTO: 'Erro ao salvar dados!',
        ERRO_LOGIN: 'Erro ao fazer login!',
        ERRO_SENHA: 'Senha deve ter no mínimo 6 caracteres!',
        ERRO_SYNC: '✗ Erro de sincronização',
        ERRO_CONEXAO: 'Erro de conexão com o servidor!',
        ARQUIVO_INVALIDO: 'Arquivo inválido!',
        ARQUIVO_MUITO_GRANDE: 'Arquivo muito grande!',
        USUARIO_NAO_ENCONTRADO: 'Usuário não encontrado!',
        SENHA_INCORRETA: 'Senha incorreta!'
    },
    CONFIRMACAO: {
        EXCLUIR_EVENTO: 'Deseja realmente excluir este evento?',
        EXCLUIR_ATIVIDADE: 'Deseja realmente excluir esta atividade?',
        EXCLUIR_TAREFA: 'Deseja realmente excluir esta tarefa?',
        LOGOUT: 'Deseja realmente sair?',
        IMPORTAR_DADOS: 'Isso substituirá todos os dados atuais. Continuar?',
        REMOVER_RESPONSABILIDADE: 'Deseja remover-se desta atividade?'
    },
    INFO: {
        CARREGANDO: 'Carregando...',
        SINCRONIZANDO: 'Sincronizando...',
        PROCESSANDO: 'Processando...',
        CONECTANDO: 'Conectando...',
        DESCONECTADO: '◉ Offline',
        NENHUM_RESULTADO: 'Nenhum resultado encontrado',
        SEM_DADOS: 'Nenhum dado disponível',
        EM_DESENVOLVIMENTO: 'Função em desenvolvimento...'
    }
};

/**
 * Configurações de performance
 */
const PERFORMANCE = {
    MAX_LISTENERS: 50,
    CACHE_TTL: 300000, // 5 minutos
    DEBOUNCE_SAVE: 1000,
    BATCH_SIZE: 100,
    MAX_LOG_ENTRIES: 1000,
    CLEANUP_INTERVAL: 3600000 // 1 hora
};

/**
 * Z-Index layers
 */
const Z_INDEX = {
    TOOLTIP: 700,
    DROPDOWN: 100,
    STICKY: 200,
    FIXED: 300,
    MODAL_BACKDROP: 400,
    MODAL: 500,
    POPOVER: 600,
    TOAST: 800,
    DEBUG: 9999
};

/**
 * Breakpoints responsivos
 */
const BREAKPOINTS = {
    MOBILE_SMALL: 480,
    MOBILE: 640,
    TABLET: 768,
    DESKTOP: 1024,
    DESKTOP_LARGE: 1280,
    DESKTOP_XL: 1536
};

/**
 * Templates de tarefas padrão
 */
const TEMPLATES_TAREFAS = {
    AS_BUILT: 'asBuilt',
    RELATORIO: 'relatorio',
    CRONOGRAMA: 'cronograma',
    MEDICAO: 'medicao'
};

/**
 * Configurações de debug
 */
const DEBUG = {
    ENABLED: true,
    LOG_LEVEL: 'info', // 'debug', 'info', 'warn', 'error'
    SHOW_PERFORMANCE: false,
    SHOW_FIREBASE_LOGS: true
};

/**
 * URLs e endpoints
 */
const URLS = {
    GITHUB_REPO: 'https://github.com/renatoremiro/sistema-gestao-obra',
    DOCUMENTACAO: 'https://docs.sistema-gestao.com',
    SUPORTE: 'mailto:suporte@sistema-gestao.com',
    BACKUP_SERVICE: 'https://backup.sistema-gestao.com'
};

/**
 * Função para obter configuração por ambiente
 */
function getConfigByEnvironment() {
    const hostname = window.location.hostname;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return {
            environment: 'development',
            debug: true,
            autoSave: false,
            showLogs: true
        };
    } else if (hostname.includes('github.io')) {
        return {
            environment: 'production',
            debug: false,
            autoSave: true,
            showLogs: false
        };
    } else {
        return {
            environment: 'unknown',
            debug: DEBUG.ENABLED,
            autoSave: true,
            showLogs: DEBUG.ENABLED
        };
    }
}

// Exportar para uso global (compatibilidade)
if (typeof window !== 'undefined') {
    // Constantes principais
    window.VERSAO_SISTEMA = VERSAO_SISTEMA;
    window.VERSAO_DB = VERSAO_DB;
    window.INTERVALOS = INTERVALOS;
    window.STATUS_ATIVIDADE = STATUS_ATIVIDADE;
    window.STATUS_LABELS = STATUS_LABELS;
    window.STATUS_CORES = STATUS_CORES;
    window.TIPOS_EVENTO = TIPOS_EVENTO;
    window.EVENTO_LABELS = EVENTO_LABELS;
    window.EVENTO_ICONES = EVENTO_ICONES;
    window.EVENTO_CORES = EVENTO_CORES;
    window.TIPOS_RECORRENCIA = TIPOS_RECORRENCIA;
    window.RECORRENCIA_LABELS = RECORRENCIA_LABELS;
    window.PRIORIDADES_TAREFA = PRIORIDADES_TAREFA;
    window.PRIORIDADE_LABELS = PRIORIDADE_LABELS;
    window.PRIORIDADE_CORES = PRIORIDADE_CORES;
    window.PRIORIDADE_ICONES = PRIORIDADE_ICONES;
    window.STATUS_TAREFA = STATUS_TAREFA;
    window.STATUS_PESSOAL = STATUS_PESSOAL;
    window.STATUS_PESSOAL_LABELS = STATUS_PESSOAL_LABELS;
    window.STATUS_PESSOAL_ICONES = STATUS_PESSOAL_ICONES;
    window.DIAS_SEMANA = DIAS_SEMANA;
    window.DIAS_SEMANA_LABELS = DIAS_SEMANA_LABELS;
    window.DIAS_SEMANA_ABREV = DIAS_SEMANA_ABREV;
    window.MESES = MESES;
    window.MESES_ABREV = MESES_ABREV;
    window.CALENDARIO_CONFIG = CALENDARIO_CONFIG;
    window.VALIDACAO = VALIDACAO;
    window.MENSAGENS = MENSAGENS;
    window.PERFORMANCE = PERFORMANCE;
    window.Z_INDEX = Z_INDEX;
    window.BREAKPOINTS = BREAKPOINTS;
    window.TEMPLATES_TAREFAS = TEMPLATES_TAREFAS;
    window.DEBUG = DEBUG;
    window.URLS = URLS;
    window.STORAGE_KEYS = STORAGE_KEYS;
    
    // Funções
    window.getConfigByEnvironment = getConfigByEnvironment;
    
    // Log de inicialização
    console.log(`🔧 Constantes carregadas - Sistema v${VERSAO_SISTEMA}`);
} 
