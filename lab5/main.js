const p = document.querySelector('#passa');

function trocaFrase(){
    p.textContent = "1. Obrigado por passares!";
}
function mantemFrase(){
    p.textContent = "1. Passa por aqui!";
}
p.onmouseover = trocaFrase;
p.addEventListener('mouseout', mantemFrase);

function pintar(cor) {
    const pinta = document.querySelector("#pinta");
    pinta.style.color = cor;
}

const inputColorir = document.querySelector("#escreve input");
const cores = ['red','blue','green'];
let interador = 0;

function colorir(){
    inputColorir.style.background = cores[interador];
    interador = ++interador % cores.length;
}

inputColorir.onkeyup = colorir;

mudarFundo = () => {
  const cor = document.querySelector("#selecionaCor").value;
  document.body.style.background = cor;
};


let contador = 0;

function contar() {
  contador++;
  document.querySelector("#contador").textContent = contador;
}

function mostrarMensagem() {
  const nome = document.querySelector("#nome").value;
  const idade = document.querySelector("#idade").value;
  const msg = document.querySelector("#mensagem");

  msg.textContent = `Olá, o ${nome} tem ${idade}!`;
}

let contadorAuto = 0;

function atualizarContador() {
  contadorAuto++;
  document.querySelector("#autoContador").textContent = contadorAuto;
}

// aumenta 1 a cada segundo (1000 milissegundos)
setInterval(atualizarContador, 1000);
