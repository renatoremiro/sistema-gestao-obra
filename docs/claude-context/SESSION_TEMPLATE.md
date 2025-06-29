# SESSION_TEMPLATE - Sistema Gestão de Obra v5.1

## 🏗️ CONTEXTO DO PROJETO

**Sistema**: Gestão de Obra - Calendário e Tarefas  
**Repositório**: `C:\Projetos\13-sistema-gestao-obra-292`  
**URL Produção**: `renatomiro.github.io/sistema-gestao-obra/`  
**Tech Stack**: Firebase + Vanilla JS + CSS Grid  
**Status**: 90% funcional, corrigindo bugs JavaScript  

## 📁 ESTRUTURA PRINCIPAL

```
assets/js/
├── app.js                    # 🎯 PRINCIPAL - Entry point
├── config/
│   ├── firebase.js          # 🔥 Configuração Firebase
│   └── constants.js         # Constantes do sistema
├── core/
│   ├── auth.js             # Autenticação
│   ├── init.js             # Inicialização
│   ├── state.js            # Gerenciamento de estado
│   └── sync.js             # Sincronização
├── modules/
│   ├── calendario.js       # 📅 PROBLEMA ATUAL - Erros JS
│   ├── atividades.js       # Gestão atividades
│   ├── tarefas.js          # Gestão tarefas
│   ├── agenda.js           # Agenda pessoal
│   ├── dashboard.js        # Dashboard principal
│   └── relatorios.js       # Relatórios
└── utils/
    ├── dom.js              # Manipulação DOM
    ├── helpers.js          # Funções auxiliares
    ├── notifications.js    # Notificações
    └── validators.js       # Validações
```

## 🔥 CONFIGURAÇÃO FIREBASE

### Projeto Ativo:
- **Projeto**: `sistema-gestao-obra`
- **Auth Domain**: `sistema-gestao-obra.firebaseapp.com`
- **Status**: ✅ Conectado e funcionando

### Collections Principais:
- `obras/` - Dados das obras (Obra 292 - Museu Nacional)
- `tarefas/` - Tarefas do projeto
- `atividades/` - Atividades do calendário  
- `usuarios/` - Usuários do sistema
- `eventos/` - Eventos do calendário

## 🚨 PROBLEMAS ATUAIS

### Erros JavaScript Console:
```javascript
❌ ERRO PRINCIPAL:
ReferenceError: atualizarCamposEvento is not defined
at editarEvento (calendario.js:403:5)
at eventoDiv.onclick (calendario.js:172:9)

❌ ERRO SECUNDÁRIO:
ReferenceError: mostrarNovoEvento is not defined  
at HTMLButtonElement.onclick (sistema-gestao-obra/:164:94)

⚠️ AVISO (não crítico):
Usuário não logado para salvar dados (sync.js:219)
```

### Status das Funcionalidades:
✅ **Funcionando Perfeitamente**:
- ✅ Carregamento de todos os módulos
- ✅ Firebase conectado e configurado
- ✅ Sistema de estado e validação
- ✅ Interface carrega corretamente
- ✅ Calendário exibe eventos existentes
- ✅ Dashboard e navegação

❌ **Com Problemas**:
- ❌ Editar eventos existentes (função `atualizarCamposEvento` faltando)
- ❌ Criar novos eventos (função `mostrarNovoEvento` faltando)
- ⚠️ Sistema de login/autenticação (usuário não logado)

## 📋 ARQUIVOS PARA UPLOAD

### Sempre Necessários:
1. `assets/js/app.js` - Entry point principal
2. `assets/js/modules/calendario.js` - Onde estão os erros
3. `assets/js/config/firebase.js` - Configuração Firebase
4. `index.html` - HTML principal

### Conforme Necessário:
- `assets/js/modules/atividades.js` - Se trabalhando com atividades
- `assets/js/modules/tarefas.js` - Se trabalhando com tarefas
- `assets/js/core/state.js` - Se problemas de estado
- `assets/css/calendar.css` - Se problemas visuais

## 🎯 ESTADO ATUAL (ATUALIZAR SEMPRE)

**Última Sessão**: 29/06/2025  
**Trabalhando em**: Corrigir funções faltantes no calendario.js  
**Problema Principal**: `atualizarCamposEvento` e `mostrarNovoEvento` não definidas  
**Próximo Objetivo**: Implementar as 2 funções faltantes no calendario.js  
**Arquivos para Verificar**: 
- `assets/js/modules/calendario.js` (linha 403 e 172)
- `index.html` (linha 164 - botão novo evento)
**Status Sistema**: 95% funcional, apenas CRUD de eventos com problema  

## 🔍 DEBUGGING RÁPIDO

### Verificar Funções Faltantes:
```javascript
// Console do navegador - verificar se funções existem
console.log('atualizarCamposEvento:', typeof atualizarCamposEvento);
console.log('mostrarNovoEvento:', typeof mostrarNovoEvento);
console.log('Funções calendario:', Object.getOwnPropertyNames(window).filter(name => name.includes('evento')));
```

### Testar Firebase:
```javascript
// Verificar conexão Firebase
console.log('Firebase apps:', firebase.apps.length);
console.log('Estado atual:', window.sistemaState || 'Estado não encontrado');
```

### Localizar Problemas:
- **Arquivo**: `calendario.js` linha 403 (função `editarEvento` chama `atualizarCamposEvento`)
- **Arquivo**: `calendario.js` linha 172 (onclick chama `editarEvento`)  
- **Arquivo**: `index.html` linha 164 (botão chama `mostrarNovoEvento`)

## 📝 CHECKLIST NOVA CONVERSA

- [ ] Cole este template completo
- [ ] Upload dos 4 arquivos principais
- [ ] Confirme erros atuais do console
- [ ] Defina objetivo específico da sessão
- [ ] Claude confirma entendimento do contexto

---
*Sistema: Gestão de Obra v5.1 | Projeto: sistema-gestao-obra-292*