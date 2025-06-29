# SISTEMA EVOLUTIVO - Atualização de Contexto Claude

## 🎯 WORKFLOW OBRIGATÓRIO - A Cada Ação

### ⚡ REGRA DE OURO
**TODA mudança de código = ATUALIZAÇÃO IMEDIATA do contexto**

---

## 📋 PROTOCOLO DE ATUALIZAÇÃO

### 🔄 DURANTE A CONVERSA (A cada resolução)

#### **1. MICRO-UPDATE (Imediato - 30s)**
```markdown
## ⚡ MICRO-UPDATE - [TIMESTAMP]
**Problema Resolvido**: [descrição breve]
**Arquivo Modificado**: [arquivo + linhas]  
**Status**: ✅ Funcionando / 🔄 Parcial / ❌ Com problemas
**Próximo Passo**: [próxima ação]
```

#### **2. COMMIT DESCRIPTIVO**
```bash
git add .
git commit -m "Fix: [problema resolvido] - Linhas [X-Y] arquivo [nome]"
```

### 📊 FINAL DA SESSÃO (Obrigatório - 5min)

#### **3. SESSION-UPDATE (Completo)**
```markdown
## 📊 SESSION-UPDATE - [DATA] - [HORA]

### Progresso da Sessão:
- ✅ **Resolvido**: [lista problemas resolvidos]
- 🔄 **Em andamento**: [o que ficou pela metade]  
- ❌ **Novos problemas**: [problemas descobertos]

### Arquivos Modificados:
- `[arquivo1]` - [+X linhas] - [descrição mudança]
- `[arquivo2]` - [-Y linhas] - [descrição mudança]

### Estado Funcional:
- **Sistema geral**: [X]% funcional
- **Módulo calendário**: [status específico]
- **CRUD eventos**: [status específico]
- **Firebase**: [status específico]

### Próxima Conversa:
- **Objetivo principal**: [foco específico]
- **Arquivos necessários**: [lista 3-4 arquivos]
- **Contexto específico**: [detalhes importantes]

### Evolução do Sistema:
- **O que aprendemos**: [insights da sessão]
- **Melhorias no processo**: [como melhorar workflow]
- **Documentação atualizada**: [o que foi documentado]
```

---

## 🎯 TEMPLATES POR TIPO DE MUDANÇA

### 🔧 **Bugfix Template**
```markdown
### 🐛 BUG RESOLVIDO - [TIMESTAMP]
**Erro**: `[erro exato do console]`
**Localização**: `[arquivo:linha]`
**Solução**: [descrição da correção]
**Funcionalidade**: ✅ Funcionando
**Impacto**: [o que melhorou]
**Arquivos**: [lista arquivos modificados]
```

### ⭐ **Feature Template**  
```markdown
### ⭐ FEATURE IMPLEMENTADA - [TIMESTAMP]
**Funcionalidade**: [nome da feature]
**Arquivos**: [arquivos criados/modificados]
**Como Usar**: [instruções básicas]
**Testes**: [como testar]
**Dependências**: [o que depende disso]
**Status**: ✅ Completa / 🔄 Parcial
```

### 🔄 **Refactor Template**
```markdown
### 🔄 REFATORAÇÃO - [TIMESTAMP] 
**Objetivo**: [por que refatorou]
**Arquivos**: [o que mudou]
**Antes vs Depois**: [comparação]
**Benefícios**: [melhorias obtidas] 
**Compatibilidade**: ✅ Mantida / ⚠️ Alterada
```

---

## 📁 ESTRUTURA DE ARQUIVOS EVOLUTIVA

### **Criar estes arquivos no `docs/claude-context/`:**

```
claude-context/
├── SESSION_TEMPLATE.md      # Template principal (sempre atualizar)
├── CURRENT_STATUS.md        # Estado ATUAL detalhado
├── WORKFLOW.md             # Este arquivo - processo obrigatório  
├── PROGRESS_LOG.md         # Log evolutivo de progresso
├── MICRO_UPDATES.md        # Updates rápidos da sessão atual
└── sessions/
    ├── 2025-06-29_16h30.md # Sessão atual detalhada
    ├── 2025-06-29_14h00.md # Sessões anteriores
    └── template_session.md  # Template de sessão
```

---

## ⚡ COMANDOS RÁPIDOS

### **Durante a Conversa:**
```bash
# 1. Micro-update (30s)
echo "### 🔧 [$(date +%H:%M)] - [PROBLEMA] resolvido em [ARQUIVO]" >> docs/claude-context/MICRO_UPDATES.md

# 2. Commit descritivo
git add . && git commit -m "Fix: [DESCRIÇÃO] - [ARQUIVO] linhas [X-Y]"
```

### **Final da Sessão:**
```bash
# 1. Salvar sessão completa
cp docs/claude-context/MICRO_UPDATES.md docs/claude-context/sessions/$(date +%Y-%m-%d_%Hh%M).md

# 2. Atualizar status atual
# [EDITAR MANUALLY CURRENT_STATUS.md]

# 3. Limpar micro-updates
echo "# MICRO-UPDATES - Nova Sessão" > docs/claude-context/MICRO_UPDATES.md

# 4. Commit sessão
git add . && git commit -m "Session: $(date +%Y-%m-%d_%Hh%M) - [RESUMO_PROGRESSO]"
```

---

## 🚀 SISTEMA AUTO-EVOLUTIVO

### **A Cada 5 Sessões:**
1. **Revisar Templates** - melhorar com base na experiência
2. **Otimizar Workflow** - remover passos desnecessários  
3. **Evoluir SESSION_TEMPLATE** - adicionar contextos importantes
4. **Documentar Patterns** - padrões que se repetem

### **Métricas de Sucesso:**
- ⏱️ **Tempo para contexto**: < 30s (objetivo: 10s)
- 🎯 **Precisão do contexto**: 100% (zero retrabalho)
- 📈 **Velocidade de resolução**: +50% por sessão
- 🔄 **Continuidade perfeita**: zero explicações repetidas

---

## 📋 CHECKLIST OBRIGATÓRIO

### **💫 INÍCIO DE CADA CONVERSA:**
- [ ] Upload SESSION_TEMPLATE.md atualizado
- [ ] Upload CURRENT_STATUS.md atual  
- [ ] Upload 3-4 arquivos de código principais
- [ ] Definir objetivo específico da sessão
- [ ] Claude confirma 100% do contexto

### **⚡ DURANTE A CONVERSA:**
- [ ] A cada mudança: micro-update (30s)
- [ ] A cada correção: commit descritivo
- [ ] Testar funcionalidade antes de continuar
- [ ] Documentar problemas encontrados

### **✅ FINAL DA CONVERSA:**
- [ ] Session-update completo (5min)
- [ ] Atualizar CURRENT_STATUS.md
- [ ] Atualizar SESSION_TEMPLATE.md se necessário
- [ ] Commit final da sessão
- [ ] Preparar contexto para próxima conversa

---

## 🎯 RESULTADO GARANTIDO

**Com este sistema:**
- ✅ **Zero perda de contexto** entre conversas
- ✅ **Progresso sempre crescente** 
- ✅ **Claude sempre atualizado** sobre mudanças
- ✅ **Workflow cada vez mais eficiente**
- ✅ **Documentação automática** do projeto
- ✅ **Evolução contínua** do processo

---

**🔥 IMPLEMENTAR AGORA:**
1. Salvar este arquivo como `docs/claude-context/WORKFLOW.md`
2. Criar `MICRO_UPDATES.md` vazio
3. Seguir protocolo a partir de AGORA
4. Evoluir o sistema com a experiência

**PRÓXIMA AÇÃO: Aplicar micro-update sobre a correção do calendário!** ⚡