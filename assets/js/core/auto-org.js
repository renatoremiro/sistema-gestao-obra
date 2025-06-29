/* ==========================================================================
   SISTEMA DE AUTOORGANIZAÇÃO INTELIGENTE - v5.1
   ========================================================================== */

/**
 * Sistema que se auto-organiza e auto-documenta
 */

/**
 * 1. AUTO-DOCUMENTAÇÃO DE MÓDULOS
 */
class ModuleRegistry {
    constructor() {
        this.modules = new Map();
        this.dependencies = new Map();
        this.loadOrder = [];
        this.performance = new Map();
    }

    // Registrar módulo automaticamente
    register(name, moduleObj, dependencies = []) {
        const info = {
            name,
            loadTime: performance.now(),
            size: JSON.stringify(moduleObj).length,
            dependencies,
            functions: Object.getOwnPropertyNames(moduleObj).filter(prop => 
                typeof moduleObj[prop] === 'function'
            ),
            status: 'loaded',
            lastUpdate: new Date().toISOString()
        };

        this.modules.set(name, info);
        this.dependencies.set(name, dependencies);
        this.loadOrder.push(name);

        console.log(`📦 Módulo auto-registrado: ${name} (${info.functions.length} funções)`);
        return info;
    }

    // Gerar documentação automática
    generateDocs() {
        const docs = {
            totalModules: this.modules.size,
            loadOrder: this.loadOrder,
            dependencyGraph: this.buildDependencyGraph(),
            performance: this.getPerformanceStats(),
            coverage: this.getFunctionCoverage()
        };

        console.group('📚 DOCUMENTAÇÃO AUTO-GERADA');
        console.table(Array.from(this.modules.values()));
        console.log('🔗 Grafo de dependências:', docs.dependencyGraph);
        console.log('⚡ Performance:', docs.performance);
        console.groupEnd();

        return docs;
    }

    buildDependencyGraph() {
        const graph = {};
        for (const [module, deps] of this.dependencies) {
            graph[module] = deps;
        }
        return graph;
    }

    getPerformanceStats() {
        const modules = Array.from(this.modules.values());
        return {
            fastestLoad: Math.min(...modules.map(m => m.loadTime)),
            slowestLoad: Math.max(...modules.map(m => m.loadTime)),
            averageSize: modules.reduce((sum, m) => sum + m.size, 0) / modules.length,
            totalFunctions: modules.reduce((sum, m) => sum + m.functions.length, 0)
        };
    }

    getFunctionCoverage() {
        const coverage = {};
        for (const [name, info] of this.modules) {
            coverage[name] = {
                declared: info.functions.length,
                tested: 0, // Pode ser integrado com testes
                documented: 0 // Pode contar JSDoc
            };
        }
        return coverage;
    }
}

/**
 * 2. MONITORAMENTO AUTO-ORGANIZADOR
 */
class SystemHealthMonitor {
    constructor() {
        this.metrics = new Map();
        this.alerts = [];
        this.autoFixAttempts = new Map();
        this.healthScore = 100;
        
        this.startMonitoring();
    }

    startMonitoring() {
        // Monitorar a cada 30 segundos
        setInterval(() => {
            this.collectMetrics();
            this.analyzeHealth();
            this.autoOptimize();
        }, 30000);

        console.log('🔍 Monitor de saúde auto-organizador iniciado');
    }

    collectMetrics() {
        const now = Date.now();
        const metrics = {
            timestamp: now,
            memory: this.getMemoryUsage(),
            performance: this.getPerformanceMetrics(),
            errors: this.getErrorCount(),
            connectivity: navigator.onLine,
            user: {
                activeTime: now - (window.userSessionStart || now),
                interactions: window.userInteractionCount || 0
            }
        };

        this.metrics.set(now, metrics);
        
        // Manter apenas últimas 100 métricas
        if (this.metrics.size > 100) {
            const oldestKey = Math.min(...this.metrics.keys());
            this.metrics.delete(oldestKey);
        }
    }

    getMemoryUsage() {
        if (performance.memory) {
            return {
                used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
            };
        }
        return null;
    }

    getPerformanceMetrics() {
        return {
            uptime: performance.now(),
            navigation: performance.getEntriesByType('navigation')[0],
            resources: performance.getEntriesByType('resource').length
        };
    }

    getErrorCount() {
        return window.systemErrors?.length || 0;
    }

    analyzeHealth() {
        const latest = Array.from(this.metrics.values()).slice(-10);
        let score = 100;

        // Analisar memória
        const avgMemory = latest.reduce((sum, m) => sum + (m.memory?.used || 0), 0) / latest.length;
        if (avgMemory > 100) score -= 20; // Penalizar alto uso de memória

        // Analisar erros
        const errorTrend = latest.map(m => m.errors);
        const errorsIncreasing = errorTrend[errorTrend.length - 1] > errorTrend[0];
        if (errorsIncreasing) score -= 15;

        // Analisar conectividade
        const connectivityIssues = latest.filter(m => !m.connectivity).length;
        if (connectivityIssues > 3) score -= 10;

        this.healthScore = Math.max(0, score);

        if (this.healthScore < 80) {
            this.createAlert('health', `Saúde do sistema baixa: ${this.healthScore}%`);
        }
    }

    autoOptimize() {
        if (this.healthScore < 70) {
            this.performAutoFixes();
        }
    }

    performAutoFixes() {
        const fixes = [
            () => this.clearOldCaches(),
            () => this.optimizeMemory(),
            () => this.resetConnections(),
            () => this.cleanupListeners()
        ];

        fixes.forEach(fix => {
            try {
                fix();
                console.log('🔧 Auto-fix aplicado com sucesso');
            } catch (error) {
                console.warn('⚠️ Auto-fix falhou:', error);
            }
        });
    }

    clearOldCaches() {
        // Limpar dados antigos
        if (window.localStorage) {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith('cache_') && Math.random() < 0.1) {
                    localStorage.removeItem(key);
                }
            });
        }
    }

    optimizeMemory() {
        // Forçar garbage collection se disponível
        if (window.gc) {
            window.gc();
        }
        
        // Limpar variáveis globais desnecessárias
        Object.keys(window).forEach(key => {
            if (key.startsWith('temp_') || key.startsWith('old_')) {
                delete window[key];
            }
        });
    }

    resetConnections() {
        // Recriar conexões problemáticas
        if (typeof reconectarFirebase === 'function') {
            reconectarFirebase();
        }
    }

    cleanupListeners() {
        // Remover listeners órfãos
        if (window.listenersAtivos) {
            window.listenersAtivos = window.listenersAtivos.filter(listener => {
                return listener.elemento && document.contains(listener.elemento);
            });
        }
    }

    createAlert(type, message) {
        const alert = {
            id: Date.now(),
            type,
            message,
            timestamp: new Date().toISOString(),
            resolved: false
        };

        this.alerts.push(alert);
        console.warn(`🚨 Alerta auto-gerado: ${message}`);

        // Notificar usuário se função existir
        if (typeof mostrarNotificacao === 'function') {
            mostrarNotificacao(`🔧 Sistema: ${message}`, 'warning');
        }

        return alert;
    }

    getHealthReport() {
        return {
            score: this.healthScore,
            alerts: this.alerts.filter(a => !a.resolved),
            metrics: Array.from(this.metrics.values()).slice(-5),
            autoFixes: this.autoFixAttempts.size
        };
    }
}

/**
 * 3. PADRÕES AUTO-REFORÇADORES
 */
class PatternEnforcer {
    constructor() {
        this.patterns = new Map();
        this.violations = [];
        this.autoCorrections = 0;
    }

    // Definir padrões que devem ser seguidos
    definePattern(name, validator, autoFix = null) {
        this.patterns.set(name, { validator, autoFix });
        console.log(`📏 Padrão definido: ${name}`);
    }

    // Verificar todos os padrões
    enforcePatterns() {
        this.violations = [];

        for (const [name, pattern] of this.patterns) {
            try {
                const isValid = pattern.validator();
                if (!isValid) {
                    this.violations.push(name);
                    
                    if (pattern.autoFix) {
                        pattern.autoFix();
                        this.autoCorrections++;
                        console.log(`🔧 Auto-correção aplicada: ${name}`);
                    } else {
                        console.warn(`⚠️ Violação de padrão: ${name}`);
                    }
                }
            } catch (error) {
                console.error(`❌ Erro ao verificar padrão ${name}:`, error);
            }
        }

        return this.violations;
    }

    // Relatório de conformidade
    getComplianceReport() {
        return {
            totalPatterns: this.patterns.size,
            violations: this.violations.length,
            autoCorrections: this.autoCorrections,
            complianceRate: ((this.patterns.size - this.violations.length) / this.patterns.size) * 100
        };
    }
}

/**
 * 4. SISTEMA DE CÓDIGO AUTO-ORGANIZADOR
 */
class CodeOrganizer {
    constructor() {
        this.codeMetrics = new Map();
        this.refactorSuggestions = [];
    }

    analyzeCodeQuality() {
        const analysis = {
            functions: this.analyzeFunctions(),
            variables: this.analyzeVariables(),
            dependencies: this.analyzeDependencies(),
            complexity: this.analyzeComplexity()
        };

        this.generateRefactorSuggestions(analysis);
        return analysis;
    }

    analyzeFunctions() {
        const functions = [];
        
        // Analisar funções globais
        Object.keys(window).forEach(key => {
            if (typeof window[key] === 'function' && !key.startsWith('webkit')) {
                const funcStr = window[key].toString();
                functions.push({
                    name: key,
                    length: funcStr.length,
                    lines: funcStr.split('\n').length,
                    complexity: this.calculateComplexity(funcStr)
                });
            }
        });

        return functions;
    }

    analyzeVariables() {
        const variables = [];
        const globalVars = Object.keys(window);
        
        globalVars.forEach(key => {
            if (!this.isBuiltIn(key)) {
                variables.push({
                    name: key,
                    type: typeof window[key],
                    isFunction: typeof window[key] === 'function'
                });
            }
        });

        return variables;
    }

    analyzeDependencies() {
        // Analisar dependências entre módulos
        const deps = [];
        
        if (window.moduleRegistry) {
            for (const [module, info] of window.moduleRegistry.modules) {
                deps.push({
                    module,
                    dependencies: info.dependencies || [],
                    dependents: this.findDependents(module)
                });
            }
        }

        return deps;
    }

    analyzeComplexity() {
        // Analisar complexidade geral do sistema
        return {
            globalVariables: Object.keys(window).filter(k => !this.isBuiltIn(k)).length,
            functions: Object.keys(window).filter(k => typeof window[k] === 'function').length,
            listeners: (window.listenersAtivos || []).length,
            intervals: (window.intervalosAtivos || []).length
        };
    }

    calculateComplexity(code) {
        // Calcular complexidade ciclomática simples
        const cyclomaticKeywords = ['if', 'else', 'while', 'for', 'switch', 'case', 'catch'];
        let complexity = 1; // Base complexity

        cyclomaticKeywords.forEach(keyword => {
            const regex = new RegExp(`\\b${keyword}\\b`, 'g');
            const matches = code.match(regex);
            if (matches) complexity += matches.length;
        });

        return complexity;
    }

    isBuiltIn(key) {
        const builtIns = ['console', 'document', 'window', 'navigator', 'location', 'history'];
        return builtIns.includes(key) || key.startsWith('webkit') || key.startsWith('moz');
    }

    findDependents(module) {
        const dependents = [];
        
        if (window.moduleRegistry) {
            for (const [name, info] of window.moduleRegistry.modules) {
                if (info.dependencies && info.dependencies.includes(module)) {
                    dependents.push(name);
                }
            }
        }

        return dependents;
    }

    generateRefactorSuggestions(analysis) {
        this.refactorSuggestions = [];

        // Sugerir refatoração de funções complexas
        analysis.functions.forEach(func => {
            if (func.lines > 50) {
                this.refactorSuggestions.push({
                    type: 'function_too_long',
                    target: func.name,
                    message: `Função ${func.name} tem ${func.lines} linhas. Considere dividir.`
                });
            }

            if (func.complexity > 10) {
                this.refactorSuggestions.push({
                    type: 'high_complexity',
                    target: func.name,
                    message: `Função ${func.name} tem alta complexidade (${func.complexity}). Simplifique.`
                });
            }
        });

        // Sugerir limpeza de variáveis globais
        if (analysis.complexity.globalVariables > 50) {
            this.refactorSuggestions.push({
                type: 'too_many_globals',
                message: `${analysis.complexity.globalVariables} variáveis globais. Considere namespacing.`
            });
        }

        return this.refactorSuggestions;
    }
}

/**
 * 5. INICIALIZAÇÃO DO SISTEMA AUTO-ORGANIZADOR
 */
class AutoOrganizationSystem {
    constructor() {
        this.moduleRegistry = new ModuleRegistry();
        this.healthMonitor = new SystemHealthMonitor();
        this.patternEnforcer = new PatternEnforcer();
        this.codeOrganizer = new CodeOrganizer();
        
        this.setupDefaultPatterns();
        this.startAutoOrganization();
    }

    setupDefaultPatterns() {
        // Padrão: Todas as funções globais devem ter documentação
        this.patternEnforcer.definePattern(
            'function_documentation',
            () => {
                const funcs = Object.keys(window).filter(k => typeof window[k] === 'function');
                const documented = funcs.filter(f => {
                    const funcStr = window[f].toString();
                    return funcStr.includes('/**') || funcStr.includes('//');
                });
                return documented.length / funcs.length > 0.7; // 70% documentado
            }
        );

        // Padrão: Não deve haver muitas variáveis globais
        this.patternEnforcer.definePattern(
            'global_variables_limit',
            () => {
                const globals = Object.keys(window).filter(k => !this.isBuiltIn(k));
                return globals.length < 100;
            },
            () => {
                console.log('🧹 Sugestão: Considere usar namespaces para reduzir variáveis globais');
            }
        );

        // Padrão: Sistema deve ter boa performance
        this.patternEnforcer.definePattern(
            'performance_threshold',
            () => {
                return this.healthMonitor.healthScore > 80;
            },
            () => {
                this.healthMonitor.performAutoFixes();
            }
        );
    }

    startAutoOrganization() {
        // Executar organização automática a cada 5 minutos
        setInterval(() => {
            this.performAutoOrganization();
        }, 300000);

        console.log('🤖 Sistema de auto-organização iniciado');
    }

    performAutoOrganization() {
        console.group('🤖 AUTO-ORGANIZAÇÃO EXECUTANDO');

        // 1. Atualizar documentação
        const docs = this.moduleRegistry.generateDocs();

        // 2. Verificar saúde do sistema
        const health = this.healthMonitor.getHealthReport();

        // 3. Aplicar padrões
        const violations = this.patternEnforcer.enforcePatterns();

        // 4. Analisar qualidade do código
        const codeAnalysis = this.codeOrganizer.analyzeCodeQuality();

        const report = {
            timestamp: new Date().toISOString(),
            documentation: docs,
            health: health,
            patterns: {
                violations: violations.length,
                compliance: this.patternEnforcer.getComplianceReport()
            },
            code: {
                suggestions: this.codeOrganizer.refactorSuggestions.length,
                analysis: codeAnalysis
            }
        };

        console.log('📊 Relatório de auto-organização:', report);
        console.groupEnd();

        return report;
    }

    isBuiltIn(key) {
        const builtIns = ['console', 'document', 'window', 'navigator', 'location', 'history'];
        return builtIns.includes(key) || key.startsWith('webkit') || key.startsWith('moz');
    }

    // Interface para desenvolvedores
    getSystemStatus() {
        return {
            modules: this.moduleRegistry.modules.size,
            health: this.healthMonitor.healthScore,
            violations: this.patternEnforcer.violations.length,
            suggestions: this.codeOrganizer.refactorSuggestions.length
        };
    }

    generateFullReport() {
        return this.performAutoOrganization();
    }
}

// Inicializar sistema de auto-organização
if (typeof window !== 'undefined') {
    window.autoOrganization = new AutoOrganizationSystem();
    
    // Registrar módulos existentes automaticamente
    setTimeout(() => {
        window.autoOrganization.moduleRegistry.register('core', window, []);
        window.autoOrganization.moduleRegistry.register('auth', { fazerLogin, fazerLogout }, ['firebase']);
        window.autoOrganization.moduleRegistry.register('calendar', { renderizarCalendario }, ['core']);
        
        console.log('🤖 Sistema auto-organizador ativo e monitorando!');
    }, 5000);

    // Comandos de debug
    window.debugAutoOrg = () => window.autoOrganization.getSystemStatus();
    window.autoOrgReport = () => window.autoOrganization.generateFullReport();
    
    console.log('🤖 Sistema de Auto-Organização carregado!');
}
