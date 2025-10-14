const p = document.querySelector('#passa');

function trocaFrase(){ p.textContent = "1. Obrigado por passares!"; }
function mantemFrase(){ p.textContent = "1. Passa por aqui!"; }
p.onmouseover = trocaFrase;
p.addEventListener('mouseout', mantemFrase);

// 2. Pinta-me
document.querySelectorAll("button.color").forEach((button) => {
  button.addEventListener("click", () => {
    const cor = button.dataset.color;
    document.querySelector("#pinta").style.color = cor;
  });
});

// 3. Alternância de cor no input
const inputColorir = document.querySelector("#escreve input");
const cores = ['red','blue','green'];
let interador = 0;
if (inputColorir) {
  inputColorir.onkeyup = () => {
    inputColorir.style.background = cores[interador];
    interador = ++interador % cores.length;
  };
}

// 4. Select cor
const selectCor = document.querySelector("#selecionaCor");
if (selectCor) {
  selectCor.onchange = function () {
    document.body.style.backgroundColor = this.value;
  };
}

// 5. Conta!
let contador = 0;
function contar() {
  contador++;
  const span = document.querySelector("#contador");
  if (span) span.textContent = contador;
}
window.contar = contar; // expõe para o onclick do HTML

// 6. Saudação
function mostrarMensagem() {
  const nome = document.querySelector("#nome")?.value || "";
  const idade = document.querySelector("#idade")?.value || "";
  const msg = document.querySelector("#mensagem");
  if (msg) msg.textContent = `Olá, o ${nome} tem ${idade}!`;
}
window.mostrarMensagem = mostrarMensagem;

// 7. Contador automático
let contadorAuto = 0;
function atualizarContador() {
  contadorAuto++;
  const span = document.querySelector("#autoContador");
  if (span) span.textContent = contadorAuto;
}
setInterval(atualizarContador, 1000);
