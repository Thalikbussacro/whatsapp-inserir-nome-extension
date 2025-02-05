// popup.js

document.addEventListener('DOMContentLoaded', () => {
    const nomeInput = document.getElementById('nomeInput');
    const enableCheckbox = document.getElementById('enableCheckbox');
    const salvarBtn = document.getElementById('salvarBtn');
    const statusMsg = document.getElementById('statusMsg');
  
    // 1) Carregar nome e "enabled" do storage
    chrome.storage.local.get(['nomeUsuario', 'enabled'], (res) => {
      // Se houver nome salvo, preenche
      if (res.nomeUsuario) {
        nomeInput.value = res.nomeUsuario;
      }
      // Se houver 'enabled' salvo, define checkbox
      if (typeof res.enabled === 'boolean') {
        enableCheckbox.checked = res.enabled;
      }
    });
  
    // 2) Ao clicar em "Salvar"
    salvarBtn.addEventListener('click', () => {
      const novoNome = nomeInput.value.trim();
      const isEnabled = enableCheckbox.checked; // true/false
  
      // Validação básica do nome
      if (!novoNome) {
        statusMsg.style.color = 'red';
        statusMsg.textContent = 'Digite algo no campo de nome.';
        return;
      }
  
      // Salvar no storage
      chrome.storage.local.set({
        nomeUsuario: novoNome,
        enabled: isEnabled
      }, () => {
        statusMsg.style.color = 'green';
        statusMsg.textContent = `Recarregue a página para aplicar as modificações. Nome salvo. ${novoNome} | Script: ${isEnabled ? 'Ativado' : 'Desativado'}`;
      });
    });
  });
  