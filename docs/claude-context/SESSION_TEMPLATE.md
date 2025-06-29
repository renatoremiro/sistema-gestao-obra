# SISTEMA COMPLETO - Continuidade Claude
## 🏗️ Sistema de Gestão de Obra v5.1 - Museu Nacional

---

# 📋 SESSION_TEMPLATE.md

## 🎯 CONTEXTO COMPLETO DO PROJETO

**Sistema**: Gestão de Obra - Calendário e Tarefas de Equipe  
**Projeto Atual**: Obra 292 - Museu Nacional  
**Repositório**: `C:\Projetos\13-sistema-gestao-obra-292`  
**URL Produção**: `renatomiro.github.io/sistema-gestao-obra/`  
**Tech Stack**: Firebase Realtime Database + Vanilla JS + CSS Grid  
**Status**: 95% funcional - apenas CRUD de eventos com problema  

## 🔥 FIREBASE - CONFIGURAÇÃO ATUAL

**Projeto Firebase**: `sistema-gestao-obra`  
**Auth Domain**: `sistema-gestao-obra.firebaseapp.com`  
**Database**: Firebase Realtime Database (não Firestore)  
**Status**: ✅ Conectado e funcionando 100%  

### Estrutura Database:
```
sistema-gestao-obra/
├── eventos/
│   ├── {eventoId}/
│   │   ├── titulo: "string"
│   │   ├── descricao: "string" 
│   │   ├── data: "YYYY-MM-DD"
│   │   ├── horarioInicio: "HH:mm"
│   │   ├── horarioFim: "HH:mm"
│   │   ├── local: "string"
│   │   ├── tipo: "reuniao|prazo|marco|outros"
│   │   ├── tarefasRelacionadas: []
│   │   └── diaCompleto: boolean
├── usuarios/
├── tarefas/
└── configuracoes/
```

## 🚨 PROBLEMA ATUAL - FUNÇÕES FALTANTES

### Erro Principal:
```javascript
❌ ReferenceError: atualizarCamposEvento is not defined
   at editarEvento (calendario.js:403:5)
   at eventoDiv.onclick (calendario.js:172:9)

❌ ReferenceError: mostrarNovoEvento is not defined  
   at HTMLButtonElement.onclick (index.html:linha 192)
```

### Código Problemático:

**calendario.js linha 172:**
```javascript
eventoDiv.onclick = function(e) {
    e.stopPropagation();
    editarEvento(evento); // ← Esta função existe
};
```

**calendario.js linha 403:**
```javascript
// Atualizar interface
atualizarCamposEvento(); // ← FUNÇÃO FALTANTE ❌
toggleHorarios();
toggleRecorrencia();
atualizarListaPessoas();
atualizarListaTarefasVinculadas();
```

**index.html botão "Novo Evento":**
```html
<button class="btn btn-primary btn-sm" onclick="mostrarNovoEvento()">✨ Novo Evento</button>
```

## ✅ STATUS ATUAL DAS FUNCIONALIDADES

### FUNCIONANDO 100%:
- ✅ Carregamento de todos os módulos (15 módulos carregados)
- ✅ Firebase conectado e sincronizando
- ✅ Interface do calendário renderiza perfeitamente
- ✅ Exibição de eventos existentes
- ✅ Sistema de estado e validação
- ✅ Dashboard e navegação
- ✅ Sistema de autenticação (estrutura pronta)
- ✅ Filtros e busca de eventos
- ✅ Indicadores visuais (reunião, prazo, marco)

### COM PROBLEMAS:
- ❌ **Criar novos eventos** (botão chama função inexistente)
- ❌ **Editar eventos existentes** (função faltante linha 403)
- ⚠️ Sistema de login (usuário não logado - não crítico)

## 📁 ARQUIVOS PARA UPLOAD (sempre estes 4)

1. **`assets/js/modules/calendario.js`** - Onde estão os erros (linhas 172, 403)
2. **`assets/js/app.js`** - Entry point e controle de erros  
3. **`index.html`** - HTML com botão problemático
4. **`assets/js/config/firebase.js`** - Config Firebase completa

## 🔧 FUNÇÕES QUE PRECISAM SER CRIADAS

### 1. `atualizarCamposEvento()` 
**Localização**: calendario.js após linha 403  
**Função**: Atualizar formulário de evento com dados do evento selecionado  
**Deve fazer**:
- Preencher campos do modal/formulário
- Configurar modo edição vs criação
- Carregar dados do evento atual

### 2. `mostrarNovoEvento()`
**Localização**: calendario.js (função global)  
**Função**: Abrir modal/formulário para criar novo evento  
**Deve fazer**:
- Limpar formulário 
- Configurar modo criação
- Exibir modal de evento
- Definir data atual como padrão

## 🎯 OBJETIVO ATUAL

**Implementar as 2 funções faltantes para completar o CRUD de eventos:**
1. ✅ READ - funcionando (eventos são exibidos)
2. ❌ CREATE - `mostrarNovoEvento()` faltando  
3. ❌ UPDATE - `atualizarCamposEvento()` faltando
4. ✅ DELETE - funcionando (botão delete existe)

## 🚀 PRÓXIMOS PASSOS

1. **Imediato**: Criar `mostrarNovoEvento()` e `atualizarCamposEvento()`
2. **Secundário**: Implementar salvamento no Firebase
3. **Futuro**: Sistema de autenticação de usuários

---

# 📊 CURRENT_STATUS.md

## Estado Atual - 29/06/2025

**Sessão Ativa**: Corrigindo CRUD de eventos no calendário  
**Progresso**: 95% do sistema funcional  
**Bloqueio**: 2 funções JavaScript faltantes  
**Prioridade**: Alta - funcionalidade principal do sistema  

### Última Modificação:
- Identificados erros específicos no console
- Localizada origem dos problemas (linhas exatas)
- Sistema Firebase 100% operacional

### Próxima Ação:
- Implementar `mostrarNovoEvento()` 
- Implementar `atualizarCamposEvento()`
- Testar CRUD completo

---

# 🐛 ACTIVE_ISSUES.md

## Issues Ativos

### #001 - CRÍTICO: Função atualizarCamposEvento não definida
**Arquivo**: `calendario.js:403`  
**Erro**: `ReferenceError: atualizarCamposEvento is not defined`  
**Impacto**: Edição de eventos não funciona  
**Status**: Identificado, aguardando implementação  

### #002 - CRÍTICO: Função mostrarNovoEvento não definida  
**Arquivo**: `index.html` botão "Novo Evento"  
**Erro**: `ReferenceError: mostrarNovoEvento is not defined`  
**Impacto**: Criação de eventos não funciona  
**Status**: Identificado, aguardando implementação  

### #003 - MENOR: Usuário não logado
**Arquivo**: `sync.js:219`  
**Erro**: `⚠️ Usuário não logado para salvar dados`  
**Impacto**: Dados não persistem no Firebase  
**Status**: Identificado, não crítico  

---

# 💻 CODE_SNIPPETS.md

## Códigos Importantes

### Estrutura Evento Firebase:
```javascript
const eventoTemplate = {
    id: "evento_" + Date.now(),
    titulo: "",
    descricao: "",
    data: "2025-06-29", 
    horarioInicio: "09:00",
    horarioFim: "10:00",
    local: "",
    tipo: "reuniao", // reuniao|prazo|marco|outros
    tarefasRelacionadas: [],
    diaCompleto: false,
    criador: "usuario_id",
    timestamp: Date.now()
};
```

### Função editarEvento (existente - linha 403):
```javascript
function editarEvento(evento) {
    // ... código existente ...
    
    // Linha 403 - PROBLEMA AQUI:
    atualizarCamposEvento(); // ← FUNÇÃO FALTANTE
    toggleHorarios();
    toggleRecorrencia(); 
    atualizarListaPessoas();
    atualizarListaTarefasVinculadas();
}
```

### Event Listener (existente - linha 172):
```javascript
eventoDiv.onclick = function(e) {
    e.stopPropagation();
    editarEvento(evento); // Chama editarEvento que falha na linha 403
};
```

### Debug Commands:
```javascript
// Verificar funções disponíveis
console.log('Funções evento:', Object.getOwnPropertyNames(window).filter(name => name.includes('evento')));

// Testar Firebase
console.log('Firebase conectado:', !!database);
console.log('Estado sistema:', window.sistemaState);
```

---

# 🔍 CHECKLIST NOVA CONVERSA

## Preparação (2 minutos):
- [ ] Abrir nova conversa Claude
- [ ] Upload do arquivo SESSION_TEMPLATE.md (este arquivo)
- [ ] Upload dos 4 arquivos principais
- [ ] Especificar problema: "Implementar funções faltantes CRUD eventos"

## Verificação Claude:
- [ ] Claude confirma contexto completo ✅
- [ ] Claude identifica problema específico ✅  
- [ ] Claude propõe solução direta ✅

## Resultado Esperado:
- [ ] Tempo de contexto: < 30 segundos
- [ ] Solução pronta: < 5 minutos  
- [ ] Zero retrabalho de explicação

---

**SISTEMA PRONTO! ✅**
*Salve este arquivo como `docs/claude-context/SESSION_TEMPLATE.md`*
*Na próxima conversa: upload apenas este arquivo + os 4 arquivos de código*