
const API_BASE = 'https://deisishop.pythonanywhere.com';
const EP = {
  products: `${API_BASE}/products`,
  categories: `${API_BASE}/categories`,
  buy: `${API_BASE}/buy`,
};

/* ---- seletores ---- */
const gradeProdutos   = document.getElementById('grade-produtos');
const listaCesto      = document.getElementById('lista-cesto');
const valorTotalEl    = document.getElementById('valor-total');

const filtroCategoria = document.getElementById('filtro-categoria');
const ordemPreco      = document.getElementById('ordem-preco');
const pesquisaInput   = document.getElementById('pesquisa');

const formCompra      = document.getElementById('form-compra');
const chkEstudante    = document.getElementById('estudante');
const inputCupao      = document.getElementById('cupao');
const inputNome       = document.getElementById('nome');
const respostaCompra  = document.getElementById('resposta-compra');

const secProdutos     = document.getElementById('produtos');
const secCesto        = document.getElementById('cesto');

const btnProdutos     = document.getElementById('btnProdutos');
const btnCesto        = document.getElementById('btnCesto');

/* ---- estado ---- */
let todosProdutos = [];
let viewProdutos  = [];

const SELECTED_KEY = 'produtos-selecionados';

/* ---- utils ---- */
const fmtEUR = (n) =>
  new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(n);

const setBusy = (el, busy) => el?.setAttribute('aria-busy', busy ? 'true' : 'false');

async function fetchJSON(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${res.statusText} - ${text}`);
  }
  return res.json();
}

/* ---- localStorage (cesto) ---- */
function initSelecionados() {
  if (!localStorage.getItem(SELECTED_KEY)) {
    localStorage.setItem(SELECTED_KEY, JSON.stringify([]));
  }
}
function lerSelecionados() {
  try { return JSON.parse(localStorage.getItem(SELECTED_KEY)) ?? []; }
  catch { localStorage.setItem(SELECTED_KEY, JSON.stringify([])); return []; }
}
function guardarSelecionados(lista) {
  localStorage.setItem(SELECTED_KEY, JSON.stringify(lista));
}
window.addEventListener('storage', (ev) => {
  if (ev.key === SELECTED_KEY) atualizaCesto();
});

/* ---- helpers de UI ---- */
function criarInfo(label, valor, className) {
  const p = document.createElement('p');
  if (className) p.className = className;
  p.innerHTML = `<strong>${label}:</strong> ${valor}`;
  return p;
}

/* ---- render de produtos ---- */
function criarProduto(p) {
  const art = document.createElement('article');
  art.tabIndex = 0;

  const h3 = document.createElement('h3');
  h3.textContent = p.title;

  const figure = document.createElement('figure');
  const img = document.createElement('img');
  img.src = p.image;
  img.alt = p.title;
  img.loading = 'lazy';
  figure.appendChild(img);

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

  const btnAdd = document.createElement('button');
  btnAdd.type = 'button';
  btnAdd.textContent = 'Adicionar ao cesto';
  btnAdd.setAttribute('aria-label', `Adicionar "${p.title}" ao cesto`);
  btnAdd.addEventListener('click', (ev) => {
    ev.stopPropagation();
    const lista = lerSelecionados();
    lista.push({
      id: p.id, title: p.title, price: p.price, description: p.description,
      category: p.category, image: p.image, rating: p.rating
    });
    guardarSelecionados(lista);
    atualizaCesto();
  });

  detalhes.append(t, meta, descricao, preco, rating, btnAdd);

  art.addEventListener('click', () => art.classList.toggle('aberto'));

  art.append(h3, figure, resumo, detalhes);
  return art;
}

function renderProdutos(lista) {
  setBusy(gradeProdutos, true);
  gradeProdutos.textContent = '';
  lista.forEach(p => gradeProdutos.append(criarProduto(p)));
  setBusy(gradeProdutos, false);
}

/* ---- filtros / sort / search ---- */
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

/* ---- cesto ---- */
function criaProdutoCesto(produto) {
  const art = document.createElement('article');

  const h3 = document.createElement('h3'); h3.textContent = produto.title;

  const figure = document.createElement('figure');
  const img = document.createElement('img');
  img.src = produto.image; img.alt = produto.title; img.loading = 'lazy';
  img.width = 80; figure.appendChild(img);

  const categoria = criarInfo('Categoria', produto.category);
  const preco = document.createElement('p'); preco.textContent = fmtEUR(produto.price);

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

/* ---- checkout: POST /buy ---- */
/* API: products[], student(boolean), coupon(string), name(string) */
/* Resposta: totalCost (string), reference (string), example (string), error (string) */
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

    // totalCost vem como string "23,43" ou "23.43"
    const totalCostNumber = (() => {
      const raw = data.totalCost ?? data.total ?? data.toPay ?? '';
      const num = Number(String(raw).replace(',', '.'));
      return Number.isFinite(num) ? num : selecionados.reduce((s,p)=>s+(Number(p.price)||0),0);
    })();

    const ref = data.reference ?? '—';
    const msg = data.example || data.message || '';

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

/* ---- tabs: Produtos | Cesto ---- */
function mostrarProdutos() {
  secProdutos.classList.remove('oculto'); secProdutos.classList.add('ativo');
  secCesto.classList.add('oculto');       secCesto.classList.remove('ativo');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function mostrarCesto() {
  secCesto.classList.remove('oculto');    secCesto.classList.add('ativo');
  secProdutos.classList.add('oculto');    secProdutos.classList.remove('ativo');
  atualizaCesto();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ---- arranque ---- */
async function boot() {
  initSelecionados();
  atualizaCesto();

  // tabs
  btnProdutos.addEventListener('click', (e) => { e.preventDefault(); mostrarProdutos(); });
  btnCesto.addEventListener('click',    (e) => { e.preventDefault(); mostrarCesto(); });

  // começa na vista Produtos
  mostrarProdutos();

  // filtros
  filtroCategoria.addEventListener('change', aplicarFiltros);
  ordemPreco.addEventListener('change', aplicarFiltros);
  pesquisaInput.addEventListener('input',  aplicarFiltros);

  // checkout
  formCompra.addEventListener('submit', comprar);

  // fetch inicial
  setBusy(gradeProdutos, true);
  try {
    const [prods, categorias] = await Promise.all([
      fetchJSON(EP.products),
      fetchJSON(EP.categories)
    ]);

    todosProdutos = Array.isArray(prods) ? prods : [];

    if (Array.isArray(categorias)) {
      for (const cat of categorias) {
        const opt = document.createElement('option');
        opt.value = String(cat);
        opt.textContent = String(cat);
        filtroCategoria.appendChild(opt);
      }
    }

    aplicarFiltros();
  } catch (e) {
    gradeProdutos.textContent = 'Não foi possível carregar os produtos da API.';
    console.error(e);
  } finally {
    setBusy(gradeProdutos, false);
  }
}

document.addEventListener('DOMContentLoaded', boot);
