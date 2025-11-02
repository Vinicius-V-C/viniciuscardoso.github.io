

const gradeProdutos = document.getElementById('grade-produtos');
const listaCesto    = document.getElementById('lista-cesto');
const valorTotalEl  = document.getElementById('valor-total');

const SELECTED_KEY = 'produtos-selecionados';

const fmtEUR = (n) =>
  new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(n);

const setBusy = (el, busy) => el.setAttribute('aria-busy', busy ? 'true' : 'false');

/* ---------- LocalStorage helpers ---------- */
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

/* ---------- Utilitário ---------- */
function criarInfo(label, valor, className) {
  const p = document.createElement('p');
  if (className) p.className = className;
  p.innerHTML = `<strong>${label}:</strong> ${valor}`;
  return p;
}

/* ---------- Renderização dos produtos ---------- */
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

  /* resumo curto */
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

  /* overlay com mais informações e botão */
  const detalhes = document.createElement('section');
  detalhes.className = 'detalhes';

  const t = document.createElement('h3');
  t.textContent = p.title;

  const meta = document.createElement('p');
  meta.className = 'meta';
  meta.innerHTML = `<strong>Categoria:</strong> ${p.category}`;

  const descricao = document.createElement('p');
  descricao.className = 'descricao';
  descricao.textContent = p.description;

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
    ev.stopPropagation(); // evita fechar overlay
    const lista = lerSelecionados();
    lista.push({
      id: p.id,
      title: p.title,
      price: p.price,
      description: p.description,
      category: p.category,
      image: p.image,
      rating: p.rating
    });
    guardarSelecionados(lista);
    atualizaCesto();
  });

  detalhes.append(t, meta, descricao, preco, rating, btnAdd);

  art.addEventListener('click', () => {
    art.classList.toggle('aberto');
  });

  art.append(h3, figure, resumo, detalhes);
  return art;
}

function carregarProdutos(lista) {
  setBusy(gradeProdutos, true);
  gradeProdutos.textContent = '';
  lista.forEach(p => gradeProdutos.append(criarProduto(p)));
  setBusy(gradeProdutos, false);
}

/* ---------- Cesto ---------- */
function criaProdutoCesto(produto) {
  const art = document.createElement('article');

  const h3 = document.createElement('h3');
  h3.textContent = produto.title;

  const figure = document.createElement('figure');
  const img = document.createElement('img');
  img.src = produto.image;
  img.alt = produto.title;
  img.loading = 'lazy';
  img.width = 80;
  figure.appendChild(img);

  const categoria = criarInfo('Categoria', produto.category);
  const preco = document.createElement('p');
  preco.textContent = fmtEUR(produto.price);

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

/* ---------- Inicialização ---------- */
document.addEventListener('DOMContentLoaded', () => {
  initSelecionados();
  carregarProdutos(produtos);
  atualizaCesto();
});
