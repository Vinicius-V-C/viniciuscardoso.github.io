document.addEventListener('DOMContentLoaded', () => {
  // 1. Passa por aqui
  const p = document.getElementById('passa');
  if (p) {
    p.addEventListener('mouseover', () => p.textContent = "1. Obrigado por passares!");
    p.addEventListener('mouseout',  () => p.textContent = "1. Passa por aqui!");
  }

  // 2. Pinta-me (botões com data-color)
  const pinta = document.getElementById('pinta');
  if (pinta) {
    document.querySelectorAll('button.color').forEach((button) => {
      button.addEventListener('click', () => {
        const cor = button.dataset.color;
        pinta.style.color = cor;
      });
    });
  }

  // 3. Alternância de cor no input
  const inputColorir = document.querySelector('#escreve input');
  const cores = ['red', 'blue', 'green'];
  let indice = 0;
  if (inputColorir) {
    inputColorir.addEventListener('keyup', () => {
      inputColorir.style.background = cores[indice];
      indice = (indice + 1) % cores.length;
    });
  }

  // 4. Select que muda o fundo (usa this)
  const selectCor = document.getElementById('selecionaCor');
  if (selectCor) {
    selectCor.addEventListener('change', function () {
      document.body.style.backgroundColor = this.value;
    });
  }

  // 5. Conta! (expõe a função para o onclick do HTML)
  let contador = 0;
  window.contar = function () {
    contador++;
    const span = document.getElementById('contador');
    if (span) span.textContent = contador;
  };

  // 6. Saudação (se usares formulário)
  const form = document.getElementById('formSaudacao');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const nome = (document.getElementById('nome') || {}).value || '';
      const idade = (document.getElementById('idade') || {}).value || '';
      const msg = document.getElementById('mensagem');
      if (msg) msg.textContent = `Olá, o ${nome} tem ${idade}!`;
    });
  }

  // 7. Contador automático (1/segundo)
  const autoSpan = document.getElementById('autoContador');
  if (autoSpan) {
    let contadorAuto = 0;
    setInterval(() => {
      contadorAuto++;
      autoSpan.textContent = contadorAuto;
    }, 1000);
  }
});
