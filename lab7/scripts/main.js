// Endereço base da loja na Internet
const API_BASE = 'https://deisishop.pythonanywhere.com';

// Caminhos usados para aceder aos dados dos produtos, categorias e para fazer compras
const EP = {
  products: `${API_BASE}/products`,   // Endereço dos produtos
  categories: `${API_BASE}/categories`, // Endereço das categorias
  buy: `${API_BASE}/buy`,             // Endereço para finalizar a compra
};

/* ---- elementos do site ---- */
// Estas linhas ligam o JavaScript aos elementos do HTML
// Assim o código pode alterar o que aparece na página

const gradeProdutos   = document.getElementById('grade-produtos'); // zona onde aparecem os produtos
const listaCesto      = document.getElementById('lista-cesto');    // zona onde aparecem os produtos no cesto
const valorTotalEl    = document.getElementById('valor-total');    // valor total do cesto

// Campos do formulário de filtros
const filtroCategoria = document.getElementById('filtro-categoria'); // menu para escolher a categoria
const ordemPreco      = document.getElementById('ordem-preco');      // menu para ordenar pelo preço
const pesquisaInput   = document.getElementById('pesquisa');         // campo de pesquisa

// Campos do formulário de compra
const formCompra      = document.getElementById('form-compra');      // formulário de compra
const chkEstudante    = document.getElementById('estudante');        // caixa para indicar se é estudante
const inputCupao      = document.getElementById('cupao');            // campo do cupão de desconto
const inputNome       = document.getElementById('nome');             // campo do nome do cliente
const respostaCompra  = document.getElementById('resposta-compra');  // zona onde aparece o resultado da compra

// Secções principais do site
const secProdutos     = document.getElementById('produtos'); // secção dos produtos
const secCesto        = document.getElementById('cesto');    // secção do cesto

// Botões para mudar entre produtos e cesto
const btnProdutos     = document.getElementById('btnProdutos');
const btnCesto        = document.getElementById('btnCesto');

/* ---- estado do site ---- */
// Estas variáveis guardam informação temporária que o site usa

let todosProdutos = []; // guarda todos os produtos vindos da Internet
let viewProdutos  = []; // guarda os produtos filtrados para mostrar no ecrã

// Nome usado para guardar o cesto dentro do navegador (localStorage)
const SELECTED_KEY = 'produtos-selecionados';

/* ---- funções simples de apoio ---- */
// Formata um número para o formato do euro (€)
const fmtEUR = (n) =>
  new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(n);

// Marca um elemento como "ocupado" enquanto carrega informação
const setBusy = (el, busy) => el?.setAttribute('aria-busy', busy ? 'true' : 'false');

// Vai buscar informação à Internet e devolve os dados prontos a usar
async function fetchJSON(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${res.statusText} - ${text}`);
  }
  return res.json();
}

/* ---- guardar e ler o cesto ---- */
// Cria o espaço do cesto no navegador se ainda não existir
function initSelecionados() {
  if (!localStorage.getItem(SELECTED_KEY)) {
    localStorage.setItem(SELECTED_KEY, JSON.stringify([]));
  }
}

// Lê os produtos guardados no cesto
function lerSelecionados() {
  try { return JSON.parse(localStorage.getItem(SELECTED_KEY)) ?? []; }
  catch { localStorage.setItem(SELECTED_KEY, JSON.stringify([])); return []; }
}

// Guarda os produtos no cesto
function guardarSelecionados(lista) {
  localStorage.setItem(SELECTED_KEY, JSON.stringify(lista));
}

// Atualiza o cesto se for alterado noutra aba do navegador
window.addEventListener('storage', (ev) => {
  if (ev.key === SELECTED_KEY) atualizaCesto();
});

/* ---- criação de pequenos textos de informação ---- */
// Esta função ajuda a criar parágrafos com uma palavra em negrito e um valor
function criarInfo(label, valor, className) {
  const p = document.createElement('p');
  if (className) p.className = className;
  p.innerHTML = `<strong>${label}:</strong> ${valor}`;
  return p;
}

/* ---- criação e apresentação dos produtos ---- */
// Cria a estrutura visual de um produto e o botão para o adicionar ao cesto
function criarProduto(p) {
  const art = document.createElement('article'); // cria o cartão do produto
  art.tabIndex = 0; // permite navegar com o teclado

  const h3 = document.createElement('h3');
  h3.textContent = p.title; // nome do produto

  const figure = document.createElement('figure');
  const img = document.createElement('img');
  img.src = p.image; // imagem do produto
  img.alt = p.title;
  img.loading = 'lazy'; // carrega a imagem apenas quando é visível
  figure.appendChild(img);

  // Parte visível do produto
  const resumo = document.createElement('section');
  resumo.className = 'resumo';
  const catResumo = criarInfo('Categoria', p.category, 'categoria');
  const precoResumo = document.createElement('p');
  precoResumo.className = 'preco';
  precoResumo.textContent = fmtEUR(p.price);
  const ratingResumo = document.createElement('p');
  const rate  = p?.rating?.rate ?? '—';
  const count = p?.rating?.count ?? 0;
  ratingResumo.className = 'rating';
  ratingResumo.innerHTML = `<strong>Rating:</strong> ${rate} ⭐ (${count} avaliações)`;
  resumo.append(catResumo, precoResumo, ratingResumo);

  // Parte que aparece quando o produto é clicado
  const detalhes = document.createElement('section');
  detalhes.className = 'detalhes';

  const t = document.createElement('h3'); t.textContent = p.title;
  const meta = document.createElement('p'); meta.className = 'meta';
  meta.innerHTML = `<strong>Categoria:</strong> ${p.category}`;

  const descricao = document.createElement('p');
  descricao.className = 'descricao';
  descricao.textContent = p.description ?? '';

  const preco = document.createElement('p');
  preco.className = 'preco';
  preco.innerHTML = `<strong>${fmtEUR(p.price)}</strong>`;

  const rating = document.createElement('p');
  rating.className = 'rating';
  rating.innerHTML = `<strong>Rating:</strong> ${rate} ⭐ (${count} avaliações)`;

  // Botão para adicionar o produto ao cesto
  const btnAdd = document.createElement('button');
  btnAdd.type = 'button';
  btnAdd.textContent = 'Adicionar ao cesto';
  btnAdd.setAttribute('aria-label', `Adicionar "${p.title}" ao cesto`);
  btnAdd.addEventListener('click', (ev) => {
    ev.stopPropagation(); // impede abrir os detalhes ao clicar
    const lista = lerSelecionados();
    lista.push({
      id: p.id, title: p.title, price: p.price, description: p.description,
      category: p.category, image: p.image, rating: p.rating
    });
    guardarSelecionados(lista); // guarda o novo produto
    atualizaCesto(); // mostra o cesto atualizado
  });

  // Junta tudo no cartão do produto
  detalhes.append(t, meta, descricao, preco, rating, btnAdd);
  art.addEventListener('click', () => art.classList.toggle('aberto'));
  art.append(h3, figure, resumo, detalhes);
  return art;
}

// Mostra todos os produtos no ecrã
function renderProdutos(lista) {
  setBusy(gradeProdutos, true);
  gradeProdutos.textContent = '';
  lista.forEach(p => gradeProdutos.append(criarProduto(p)));
  setBusy(gradeProdutos, false);
}

/* ---- filtros e pesquisa ---- */
// Aplica as escolhas de categoria, preço e texto escrito na pesquisa
function aplicarFiltros() {
  const cat = filtroCategoria.value.trim();
  const ord = ordemPreco.value;
  const q   = pesquisaInput.value.trim().toLowerCase();

  let lista = [...todosProdutos];

  if (cat) lista = lista.filter(p => String(p.category).toLowerCase() === cat.toLowerCase());
  if (q)   lista = lista.filter(p => String(p.title).toLowerCase().includes(q));
  if (ord === 'asc')  lista.sort((a, b) => a.price - b.price);
  if (ord === 'desc') lista.sort((a, b) => b.price - a.price);

  viewProdutos = lista;
  renderProdutos(viewProdutos);
}

/* ---- parte do cesto ---- */
// Cria o aspeto de um produto dentro do cesto
function criaProdutoCesto(produto) {
  const art = document.createElement('article');
  const h3 = document.createElement('h3'); h3.textContent = produto.title;

  const figure = document.createElement('figure');
  const img = document.createElement('img');
  img.src = produto.image; img.alt = produto.title; img.loading = 'lazy';
  img.width = 80; figure.appendChild(img);

  const categoria = criarInfo('Categoria', produto.category);
  const preco = document.createElement('p'); preco.textContent = fmtEUR(produto.price);

  // Botão para remover um produto do cesto
  const btnRem = document.createElement('button');
  btnRem.type = 'button';
  btnRem.textContent = 'Remover';
  btnRem.setAttribute('aria-label', `Remover "${produto.title}" do cesto`);
  btnRem.addEventListener('click', () => {
    const lista = lerSelecionados();
    const idx = lista.findIndex(p => p.id === produto.id);
    if (idx !== -1) {
      lista.splice(idx, 1);
      guardarSelecionados(lista);
      atualizaCesto();
    }
  });

  art.append(h3, figure, categoria, preco, btnRem);
  return art;
}

// Atualiza a lista e o total do cesto
function atualizaCesto() {
  if (!listaCesto || !valorTotalEl) return;

  setBusy(listaCesto, true);
  listaCesto.textContent = '';

  const lista = lerSelecionados();
  let total = 0;

  for (const p of lista) {
    total += Number(p.price) || 0;
    listaCesto.append(criaProdutoCesto(p));
  }

  valorTotalEl.textContent = new Intl.NumberFormat('pt-PT', {
    minimumFractionDigits: 2, maximumFractionDigits: 2
  }).format(total);

  setBusy(listaCesto, false);
}

/* ---- compra ---- */
// Envia a compra para o servidor e mostra o resultado
async function comprar(ev) {
  ev.preventDefault();

  const selecionados = lerSelecionados();
  if (!selecionados.length) {
    respostaCompra.textContent = 'O cesto está vazio.';
    return;
  }

  const productIds = selecionados.map(p => p.id);
  const cupao = (inputCupao.value || '').trim();
  const nome  = (inputNome.value  || '').trim() || 'Cliente';

  const body = {
    products: productIds,
    student: !!chkEstudante.checked,
    coupon: cupao || undefined,
    name: nome
  };

  respostaCompra.textContent = 'A processar compra…';

  try {
    const data = await fetchJSON(EP.buy, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const totalCostNumber = (() => {
      const raw = data.totalCost ?? data.total ?? data.toPay ?? '';
      const num = Number(String(raw).replace(',', '.'));
      return Number.isFinite(num) ? num : selecionados.reduce((s,p)=>s+(Number(p.price)||0),0);
    })();

    const ref = data.reference ?? '—';
    const msg = data.example || data.message || '';

    // Mostra o resultado da compra
    respostaCompra.innerHTML = `
      <p><strong>Referência:</strong> ${ref}</p>
      <p><strong>Total a pagar:</strong> ${fmtEUR(totalCostNumber)}</p>
      ${msg ? `<p>${msg}</p>` : ''}
      ${data.error ? `<p><strong>Erro:</strong> ${data.error}</p>` : ''}
    `;
  } catch (err) {
    respostaCompra.innerHTML = `
      <p><strong>Erro ao comprar:</strong> ${err.message}</p>
      <p>Verifique o cupão, o nome e/ou a opção de estudante e tente novamente.</p>
    `;
  }
}

/* ---- alternar entre produtos e cesto ---- */
// Mostra a parte dos produtos
function mostrarProdutos() {
  secProdutos.classList.remove('oculto'); secProdutos.classList.add('ativo');
  secCesto.classList.add('oculto');       secCesto.classList.remove('ativo');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Mostra a parte do cesto
function mostrarCesto() {
  secCesto.classList.remove('oculto');    secCesto.classList.add('ativo');
  secProdutos.classList.add('oculto');    secProdutos.classList.remove('ativo');
  atualizaCesto();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ---- início do site ---- */
// Esta função é chamada quando a página carrega
async function boot() {
  initSelecionados();  // prepara o cesto
  atualizaCesto();     // mostra o cesto

  // Liga os botões às funções
  btnProdutos.addEventListener('click', (e) => { e.preventDefault(); mostrarProdutos(); });
  btnCesto.addEventListener('click',    (e) => { e.preventDefault(); mostrarCesto(); });

  // Começa na secção de produtos
  mostrarProdutos();

  // Liga os filtros e a pesquisa
  filtroCategoria.addEventListener('change', aplicarFiltros);
  ordemPreco.addEventListener('change', aplicarFiltros);
  pesquisaInput.addEventListener('input',  aplicarFiltros);

  // Liga o botão de comprar
  formCompra.addEventListener('submit', comprar);

  // Vai buscar os produtos e as categorias à Internet
  setBusy(gradeProdutos, true);
  try {
    const [prods, categorias] = await Promise.all([
      fetchJSON(EP.products),
      fetchJSON(EP.categories)
    ]);

    todosProdutos = Array.isArray(prods) ? prods : [];

    // Preenche o menu de categorias
    if (Array.isArray(categorias)) {
      for (const cat of categorias) {
        const opt = document.createElement('option');
        opt.value = String(cat);
        opt.textContent = String(cat);
        filtroCategoria.appendChild(opt);
      }
    }

    // Mostra os produtos no ecrã
    aplicarFiltros();
  } catch (e) {
    gradeProdutos.textContent = 'Não foi possível carregar os produtos da API.';
    console.error(e);
  } finally {
    setBusy(gradeProdutos, false);
  }
}

// Inicia tudo quando a página está pronta
document.addEventListener('DOMContentLoaded', boot);
