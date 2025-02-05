// content-script.js

(async function() {
    'use strict';
    console.log("[Extensão] content-script iniciado (com on/off) no WhatsApp Web...");
  
    /**
     * 1) Carregar nomeUsuario + enabled do storage
     */
    const { nomeUsuario, enabled } = await new Promise((resolve) => {
      chrome.storage.local.get(['nomeUsuario', 'enabled'], (res) => {
        resolve({
          nomeUsuario: res.nomeUsuario || "Defina seu nome na extensão",
          enabled: (typeof res.enabled === 'boolean') ? res.enabled : false
        });
      });
    });
  
    console.log("[Extensão] nomeUsuario =", nomeUsuario, "| enabled =", enabled);
  
    // Se o script estiver desativado, não faz nada
    if (!enabled) {
      console.log("[Extensão] Script está DESATIVADO. Encerrando content-script.");
      return;
    }
  
    // Se chegou aqui, é porque 'enabled' é true.
    console.log("[Extensão] Script ATIVADO. Prosseguindo com a lógica do WhatsApp...");
  
    /**
     * 2) Helper: retornar "*nomeUsuario*"
     */
    function getNomeComAsteriscos() {
      return `*${nomeUsuario}*`;
    }
  
    /**
     * 3) Seletores e config específicos do WhatsApp
     */
    const BUTTON_CONTAINER_SELECTOR = '.x100vrsf.x1fns5xo';  // Ajuste se mudar no WA
    const INPUT_SELECTOR = 'div[contenteditable="true"][data-tab="10"]'; // Ajuste se mudar
    const LABEL_ENVIAR = "Enviar"; // Se WA mudar idioma ou atributo, ajuste
  
    let buttonContainer = null;
    let inputBox = null;
  
    /**
     * 4) Funções auxiliares
     */
    function selectAll() {
      console.log("[Debug] -> selectAll()");
      if (!inputBox) return;
      inputBox.focus();
      const range = document.createRange();
      range.selectNodeContents(inputBox);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      console.log("[Debug] selectAll: todo texto selecionado.");
    }
  
    function insertNome() {
      console.log("[Debug] -> insertNome()");
      if (!inputBox) return;
      const texto = getNomeComAsteriscos() + "\n";
      document.execCommand('insertText', false, texto);
      // Dispara evento para o WA reconhecer a mudança
      inputBox.dispatchEvent(new Event('input', { bubbles: true }));
      console.log("[Debug] insertNome: Inserido =>", texto);
    }
  
    function moveCaretToEnd() {
      console.log("[Debug] -> moveCaretToEnd()");
      if (!inputBox) return;
      const range = document.createRange();
      range.selectNodeContents(inputBox);
      range.collapse(false);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      console.log("[Debug] moveCaretToEnd: Cursor movido para o final.");
    }
  
    function simulateShiftEnter() {
      console.log("[Debug] -> simulateShiftEnter()");
      if (!inputBox) return;
  
      const keydown = new KeyboardEvent('keydown', {
        key: 'Enter',
        code: 'Enter',
        shiftKey: true,
        bubbles: true,
        cancelable: true
      });
      const keypress = new KeyboardEvent('keypress', {
        key: 'Enter',
        code: 'Enter',
        shiftKey: true,
        bubbles: true,
        cancelable: true
      });
      const keyup = new KeyboardEvent('keyup', {
        key: 'Enter',
        code: 'Enter',
        shiftKey: true,
        bubbles: true,
        cancelable: true
      });
  
      inputBox.dispatchEvent(keydown);
      inputBox.dispatchEvent(keypress);
      inputBox.dispatchEvent(keyup);
  
      console.log("[Debug] simulateShiftEnter: SHIFT+ENTER disparado.");
    }
  
    /**
     * 5) Fluxo principal (com atrasos mínimos de 30 ms)
     */
    function runSequenceMinimalDelay() {
      console.log("[Debug] -> runSequenceMinimalDelay() START");
  
      // (1) Selecionar tudo
      selectAll();
  
      setTimeout(() => {
        // (2) Inserir nome
        insertNome();
  
        setTimeout(() => {
          // (3) Mover caret pro final
          moveCaretToEnd();
  
          setTimeout(() => {
            // (4.1) Primeiro SHIFT+ENTER
            console.log("[Debug] runSequence: 1º SHIFT+ENTER...");
            simulateShiftEnter();
  
            setTimeout(() => {
              // (4.2) Segundo SHIFT+ENTER
              console.log("[Debug] runSequence: 2º SHIFT+ENTER...");
              simulateShiftEnter();
              console.log("[Debug] -> runSequenceMinimalDelay() END");
            }, 30);
  
          }, 30);
  
        }, 30);
  
      }, 30);
    }
  
    /**
     * 6) Observa quando o botão vira "Enviar"
     */
    function watchButtonChange() {
      console.log("[Debug] -> watchButtonChange()");
      if (!buttonContainer) {
        console.warn("[Debug] watchButtonChange: buttonContainer é null!");
        return;
      }
  
      new MutationObserver(() => {
        const button = buttonContainer.querySelector('button');
        if (!button) return;
        const label = button.getAttribute('aria-label');
        // Se for "Enviar", executa a sequência
        if (label === LABEL_ENVIAR) {
          console.log("[Debug] Botão virou 'Enviar'. runSequenceMinimalDelay...");
          runSequenceMinimalDelay();
        }
      }).observe(buttonContainer, { attributes: true, childList: true, subtree: true });
  
      console.log("[Debug] watchButtonChange: Observando mutations no buttonContainer...");
    }
  
    /**
     * 7) Observer principal: localiza container do botão e input
     */
    const mainObserver = new MutationObserver(() => {
      const newContainer = document.querySelector(BUTTON_CONTAINER_SELECTOR);
      const newInput = document.querySelector(INPUT_SELECTOR);
  
      console.log("[Debug] mainObserver: newContainer=", newContainer, " newInput=", newInput);
  
      if (newContainer && newInput && (newContainer !== buttonContainer || newInput !== inputBox)) {
        buttonContainer = newContainer;
        inputBox = newInput;
        console.log("[Debug] mainObserver: Achou container e input. Chamando watchButtonChange...");
        watchButtonChange();
      }
    });
  
    // Iniciar o observer no document.body
    mainObserver.observe(document.body, { childList: true, subtree: true });
    console.log("[Debug] mainObserver iniciado (30ms).");
  })();
  