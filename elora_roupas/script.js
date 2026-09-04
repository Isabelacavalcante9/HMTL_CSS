const STORAGE_KEYS = {
  cart: 'elora_cart',
  customer: 'elora_customer',
  orders: 'elora_orders',
  session: 'elora_session',
  address: 'elora_checkout_address',
  lastOrder: 'elora_last_order'
};

const PIX_CODE = '00020126360014BR.GOV.BCB.PIX0114+55000000000052040000530398654040.005802BR5913ELORA DEMO6008SAO PAULO62070503***6304ABCD';
let pixCountdownTimer = null;
let pixSecondsRemaining = 300;
let pixPaymentConfirmed = false;

const FALLBACK_IMAGE = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 900">
    <rect width="700" height="900" fill="#E5D6CC"/>
    <path d="M154 840c12-192 46-315 126-390l70-51 70 51c80 75 114 198 126 390Z" fill="#8B3A4A" opacity=".86"/>
    <circle cx="350" cy="250" r="93" fill="#B98288" opacity=".75"/>
    <text x="350" y="805" fill="#FAF8F6" font-family="Georgia, serif" font-size="34" text-anchor="middle" letter-spacing="6">ELORA</text>
  </svg>
`);

// Imagens reais organizadas por ID, usando os arquivos existentes em Img.
const productImageOverrides = {
  'vestido-01': [
    'Img/miragembege.png',
    'Img/miragempreto.png'
  ],
  'vestido-02': [
    'Img/vestido_midi_vinho.png',
    'Img/vesti2_2.png'
  ],
  'vestido-03': [
    'Img/vesti3.png',
    'Img/vesti3_2.png'
  ],
  'vestido-04': [
    'Img/vesti4.png',
    'Img/vesti4_2.png'
  ],
  'vestido-05': [
    'Img/vesti5_2.png',
    'Img/vesti5.png'
  ],
  'vestido-06': [
    'Img/vesti6.png',
    'Img/vesti6_2.png'
  ],
  'vestido-07': [
    'Img/vesti7.png',
    'Img/vesti7_2.png'
  ],
  'vestido-08': [
    'Img/vesti8.png',
    'Img/vesti8_2.png'
  ],
  'vestido-09': [
    'Img/vesti9.png',
    'Img/vesti9_2.png'
  ],
  'blusa-01': [
    'Img/b1.png',
    'Img/b1_2.png'
  ],
  'blusa-02': [
    'Img/Blusa 2 vinho.png', 
    'Img/blusa 2 preto.png'
  ],
  'blusa-03': [
    'Img/blusa 3 rosa.png', 
    'Img/blusa 3 branca.png'
  ],
  'blusa-04': [
    'Img/blusa 4 branco.png', 
    'Img/blusa 4 vinho.png'
  ],
  'blusa-05': [
    'Img/blusa 5 preto.png', 
    'Img/blusa 5 rosa.png'
  ],
  'blusa-06': [
    'Img/blusa 6 marrom.png', 
    'Img/blusa 6 bege.png'
  ],
  'blusa-07': [
    'Img/blusa 7 branco.png', 
    'Img/blusa 7 rosa.png'
  ],
  'blusa-08': [
    'Img/blusa 8 vinho.png',
     'Img/blusa 8 preto.png'
    ],
  'blusa-09': [
    'Img/blusa 9 bege.png', 
    'Img/blusa 9 marrom.png'
  ],
  'calca-01': [
    'Img/calça 1 preto.png'
  ],
  'calca-02': [
    'Img/calça 2 marrom.png'
  ],
  'calca-03': [
    'Img/calça 3 preto.png'
  ],
  'calca-04': [
    'Img/calça 4 marrom.png'
  ],
  'calca-05': [
    'Img/calça 5 vinho.png'
  ],
  'calca-06': [
    'Img/calça 6 bege.png'
  ],
  'calca-07': [
    'Img/calça 7 branco.png'
  ],
  'calca-08': [
    'Img/calça 8 marrom.png'
  ],
  'calca-09': [
    'Img/calça 9 preto.png'
  ]
};

const measuresDefault = {
  P: { busto: '84–88', cintura: '66–70', quadril: '92–96' },
  M: { busto: '90–94', cintura: '72–76', quadril: '98–102' },
  G: { busto: '96–100', cintura: '78–82', quadril: '104–108' },
  GG: { busto: '102–108', cintura: '84–90', quadril: '110–116' }
};

function makeImages(productId) {
  const configuredImages = productImageOverrides[productId];
  if (configuredImages) return [...configuredImages];
  return [1, 2].map((number) => `Img/produtos/${productId}-${number}.jpg`);
}

function product(id, nome, categoria, preco, precoAntigo, cor, cores, descricao, index, destaque = false, novidade = false) {
  const imagens = categoria === 'calcas' ? makeImages(id).slice(0, 1) : makeImages(id);
  const nomeBase = nome.replace(new RegExp(`\\s+${String(cor).replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}$`, 'i'), '').trim() || nome;
  return {
    id,
    nome,
    nomeBase,
    corPrincipal: cor,
    categoria,
    preco,
    precoAntigo,
    descricao,
    cor,
    cores,
    tamanhos: ['P', 'M', 'G', 'GG'],
    imagemPrincipal: imagens[0],
    imagens,
    medidas: measuresDefault,
    destaque,
    novidade
  };
}

const products = [
  product('vestido-01', 'Vestido Longo Miragem Bege', 'vestidos', 229.90, 299.90, 'Bege', ['Bege', 'Preto'], 'Silhueta longa e fluida com decote delicado, feita para acompanhar ocasiões especiais com leveza.', 0, true, true),
  product('vestido-02', 'Vestido Midi Aurora Vinho', 'vestidos', 189.90, 249.90, 'Vinho', ['Vinho', 'Preto'], 'Modelagem midi com cintura marcada e acabamento elegante para uma presença memorável.', 1, true, true),
  product('vestido-03', 'Vestido Longo Lírio Preto', 'vestidos', 159.90, null, 'Preto', ['Preto', 'Branco'], 'Um essencial sofisticado com linhas limpas, alças finas e caimento confortável.', 2, true, false),
  product('vestido-04', 'Vestido Acetinado Íris Rosa', 'vestidos', 279.90, 339.90, 'Rosa', ['Rosa', 'Preto'], 'Brilho sutil e toque acetinado em uma peça que transita do jantar ao evento.', 3, false, true),
  product('vestido-05', 'Vestido Linho Serena Branco', 'vestidos', 149.90, null, 'Branco', ['Branco', 'Preto'], 'Linho leve e natural com shape descontraído para os dias de sol.', 4, false, false),
  product('vestido-06', 'Vestido Envelope Marrom', 'vestidos', 199.90, 229.90, 'Marrom', ['Marrom', 'Bege'], 'Decote envelope e movimento envolvente em uma proposta feminina e atual.', 5, false, false),
  product('vestido-07', 'Vestido Canelado Noa Marrom', 'vestidos', 89.90, 119.90, 'Marrom', ['Marrom', 'Preto'], 'Textura canelada e conforto para um visual minimalista de todos os dias.', 6, false, false),
  product('vestido-08', 'Vestido Plissado Celeste Bege', 'vestidos', 319.90, null, 'Bege', ['Bege', 'Marrom'], 'Plissado delicado e comprimento midi para uma leitura contemporânea da elegância.', 7, false, true),
  product('vestido-09', 'Vestido Longo Eclipse', 'vestidos', 179.90, 219.90, 'Branco', ['Branco', 'Preto'], 'A praticidade da camisa encontra a delicadeza de um vestido essencial.', 8, false, false),
  product('blusa-01', 'Blusa Seda Essencial Bege', 'blusas', 129.90, 169.90, 'Bege', ['Bege', 'Marrom'], 'Toque sedoso e gola clássica em uma base refinada para o guarda-roupa.', 9, true, true),
  product('blusa-02', 'Blusa Decote V Rubi', 'blusas', 99.90, null, 'Vinho', ['Vinho', 'Preto'], 'Decote V sutil e tecido macio para iluminar produções diurnas e noturnas.', 10, true, false),
  product('blusa-03', 'Blusa Cropped Nara Rosa', 'blusas', 79.90, 99.90, 'Rosa', ['Rosa', 'Branco'], 'Proporção cropped e cor suave em uma peça fácil de combinar.', 11, true, true),
  product('blusa-04', 'Blusa Linho Horizonte Bege', 'blusas', 159.90, null, 'Bege', ['Bege', 'Branco'], 'Linho texturizado, mangas amplas e frescor para os dias mais leves.', 12, false, false),
  product('blusa-05', 'Blusa Ombro Único Vitta Preta', 'blusas', 189.90, 239.90, 'Preto', ['Preto', 'Vinho'], 'Uma assimetria marcante para compor looks de personalidade.', 13, false, true),
  product('blusa-06', 'Blusa Tricot Amêndoa', 'blusas', 219.90, null, 'Marrom', ['Marrom', 'Bege'], 'Tricot leve com trama macia e volume preciso para os dias de meia-estação.', 14, false, false),
  product('blusa-07', 'Blusa Básica Aura Branca', 'blusas', 65.90, null, 'Branco', ['Branco', 'Rosa'], 'A base indispensável com acabamento premium e toque suave.', 15, false, false),
  product('blusa-08', 'Blusa Laço Chiara Vinho', 'blusas', 139.90, 179.90, 'Vinho', ['Vinho', 'Preto'], 'Laço frontal e fluidez para uma feminilidade sem excessos.', 0, false, false),
  product('blusa-09', 'Blusa Social Mirra Rosa', 'blusas', 229.90, 279.90, 'Rosa', ['Rosa', 'Bege'], 'Alfaiataria delicada com caimento impecável e presença editorial.', 1, false, true),
  product('calca-01', 'Calça Alfaiataria Ímpar Preto', 'calcas', 229.90, 299.90, 'Preto', ['Preto'], 'Cintura alta e pernas retas para uma alfaiataria versátil e sofisticada.', 2, true, true),
  product('calca-02', 'Calça Pantalona Sépia Marrom', 'calcas', 279.90, null, 'Marrom', ['Marrom'], 'Pantalona ampla com movimento e estrutura na medida certa.', 3, true, false),
  product('calca-03', 'Calça Reta Alba Preta', 'calcas', 189.90, 229.90, 'Preto', ['Preto'], 'Shape reto e tecido encorpado para acompanhar diferentes ocasiões.', 4, true, true),
  product('calca-04', 'Calça Cenoura Terracota', 'calcas', 169.90, null, 'Marrom', ['Marrom'], 'Modelagem cenoura em tom terroso, confortável e cheia de personalidade.', 5, false, false),
  product('calca-05', 'Calça Flare Violeta', 'calcas', 349.90, 419.90, 'Vinho', ['Vinho'], 'Flare alongada com caimento elegante para produções marcantes.', 6, false, true),
  product('calca-06', 'Calça Jogger Cora', 'calcas', 119.90, 149.90, 'Bege', ['Bege'], 'Conforto casual com acabamento limpo e toque utilitário.', 7, false, false),
  product('calca-07', 'Calça Sarja ', 'calcas', 89.90, null, 'Branco', ['Branco'], 'Sarja leve e cintura confortável para a rotina com estilo.', 8, false, false),
  product('calca-08', 'Calça Clochard Siena', 'calcas', 219.90, 269.90, 'Marrom', ['Marrom'], 'Cintura marcada e volume elegante em uma interpretação feminina da clochard.', 9, false, false),
  product('calca-09', 'Calça Reta Noite', 'calcas', 159.90, null, 'Preto', ['Preto'], 'Um clássico essencial para criar bases sofisticadas sem esforço.', 10, false, true)
];

const state = {
  homeTab: 'destaques',
  searchTerm: '',
  filters: { categories: [], sizes: [], colors: [], prices: [] },
  page: 1,
  sort: 'recent',
  selectedSize: '',
  selectedColor: '',
  productQuantity: 1,
  galleryIndex: 0,
  lastProductId: '',
  mobileMenuOpen: false,
  mobileFiltersOpen: false,
  returnToCartAfterLogin: false
};

function normalizeText(text) {
  return String(text ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(value) {
  return new Date(value).toLocaleDateString('pt-BR');
}

function escapeHTML(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getCart() {
  const cart = readStorage(STORAGE_KEYS.cart, []);
  return Array.isArray(cart) ? cart : [];
}

function saveCart(cart) {
  writeStorage(STORAGE_KEYS.cart, cart);
  updateCartCount();
}

function clearCart() {
  saveCart([]);
}

function cartLineKey(productId, size, color) {
  return `${productId}__${normalizeText(size)}__${normalizeText(color)}`;
}

function addToCart(productId, quantity = 1, size = '', color = '') {
  const item = products.find((entry) => entry.id === productId);
  if (!item) return;
  const chosenSize = size || item.tamanhos[0];
  const chosenColor = color || item.cores[0] || item.cor;
  const cart = getCart();
  const key = cartLineKey(productId, chosenSize, chosenColor);
  const existing = cart.find((line) => line.key === key);
  if (existing) {
    existing.quantidade += Math.max(1, Number(quantity) || 1);
  } else {
    cart.push({ key, produtoId: productId, tamanho: chosenSize, cor: chosenColor, imagem: getProductImageForColor(item, chosenColor), nome: getProductDisplayName(item, chosenColor), quantidade: Math.max(1, Number(quantity) || 1) });
  }
  saveCart(cart);
  showToast('Produto adicionado ao carrinho.');
}

function removeFromCart(key) {
  const cart = getCart().filter((line) => line.key !== key);
  saveCart(cart);
  showToast('Produto removido.');
}

function updateQuantity(key, quantity) {
  const cart = getCart();
  const line = cart.find((entry) => entry.key === key);
  if (!line) return;
  const next = Math.max(1, Number(quantity) || 1);
  line.quantidade = next;
  saveCart(cart);
  showToast('Quantidade atualizada.');
}

function getCustomer() {
  return readStorage(STORAGE_KEYS.customer, {});
}

function hasActiveSession() {
  return localStorage.getItem(STORAGE_KEYS.session) === 'true' && Boolean(getCustomer()?.name || getCustomer()?.email);
}

function logout() {
  localStorage.removeItem(STORAGE_KEYS.session);
  localStorage.removeItem(STORAGE_KEYS.customer);
  state.selectedColor = '';
  state.selectedSize = '';
  showToast('Sessão encerrada.');
  navigate('#/home');
}

function saveCustomer(customer) {
  writeStorage(STORAGE_KEYS.customer, customer);
  localStorage.setItem(STORAGE_KEYS.session, 'true');
  showToast('Dados atualizados.');
}

function getOrders() {
  const orders = readStorage(STORAGE_KEYS.orders, []);
  return Array.isArray(orders) ? orders : [];
}

function updateOrderStatus(orderId, status) {
  const orders = getOrders();
  const order = orders.find((entry) => entry.id === orderId);
  if (!order) return;
  order.status = status;
  writeStorage(STORAGE_KEYS.orders, orders);
}

function createOrder(address, payment) {
  const cart = getCart();
  const orders = getOrders();
  const subtotal = cart.reduce((total, line) => {
    const item = products.find((entry) => entry.id === line.produtoId);
    return total + (item ? item.preco * line.quantidade : 0);
  }, 0);
  const frete = subtotal >= 399 ? 0 : 29.90;
  let sequence = 1;
  const used = new Set(orders.map((order) => order.id));
  while (used.has(`#ELORA${String(sequence).padStart(3, '0')}`)) sequence += 1;
  const order = {
    id: `#ELORA${String(sequence).padStart(3, '0')}`,
    date: new Date().toISOString(),
    items: cart.map((line) => {
      const item = products.find((entry) => entry.id === line.produtoId);
      return {
        produtoId: line.produtoId,
        nome: item ? (line.nome || getProductDisplayName(item, line.cor)) : 'Produto ELORA',
        imagem: item ? (line.imagem || getProductImageForColor(item, line.cor)) : FALLBACK_IMAGE,
        preco: item?.preco || 0,
        tamanho: line.tamanho,
        cor: line.cor,
        quantidade: line.quantidade
      };
    }),
    subtotal,
    frete,
    total: subtotal + frete,
    address,
    payment,
    status: 'Em andamento'
  };
  orders.push(order);
  writeStorage(STORAGE_KEYS.orders, orders);
  return order;
}

function searchProducts(term) {
  return filterProducts(products, state.filters, term, null);
}

function filterProducts(source, filters, term = '', category = null) {
  const query = normalizeText(term);
  return source.filter((item) => {
    const matchesCategoryRoute = !category || category === 'todos' || category === 'novidades' || item.categoria === category;
    const searchable = normalizeText([item.nome, item.categoria, item.cor, item.cores.join(' '), item.descricao].join(' '));
    const matchesSearch = !query || searchable.includes(query);
    const matchesCategory = !filters.categories.length || filters.categories.includes(item.categoria);
    const matchesSize = !filters.sizes.length || filters.sizes.some((size) => item.tamanhos.includes(size));
    const matchesColor = !filters.colors.length || filters.colors.some((color) => item.cores.includes(color));
    const matchesPrice = !filters.prices.length || filters.prices.some((range) => {
      if (range === '0-90') return item.preco <= 90;
      if (range === '90-150') return item.preco > 90 && item.preco <= 150;
      if (range === '150-200') return item.preco > 150 && item.preco <= 200;
      return item.preco > 200;
    });
    const matchesNew = category !== 'novidades' || item.novidade;
    return matchesCategoryRoute && matchesSearch && matchesCategory && matchesSize && matchesColor && matchesPrice && matchesNew;
  });
}

function clearFilters() {
  state.filters = { categories: [], sizes: [], colors: [], prices: [] };
  state.page = 1;
  render();
}

function changeCategory(category) {
  state.page = 1;
  state.searchTerm = '';
  location.hash = `#/categoria/${category}`;
}

function changePage(page) {
  state.page = Number(page) || 1;
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function openProduct(id) {
  location.hash = `#/produto/${id}`;
}

function changeProductImage(index) {
  const productItem = products.find((item) => item.id === state.lastProductId);
  const imageIndex = Number(index);
  if (!productItem || !productItem.imagens[imageIndex]) return;
  const selectedColor = productItem.cores[imageIndex] || productItem.corPrincipal || productItem.cor;
  selectColor(selectedColor);
}

function selectSize(size) {
  state.selectedSize = size;
  const error = document.getElementById('product-size-error');
  if (error) error.textContent = '';
}

function getCurrentProduct() {
  return products.find((item) => item.id === state.lastProductId) || null;
}

function getProductDisplayName(item, color = item.corPrincipal || item.cor) {
  const selectedColor = color || item.corPrincipal || item.cor;
  return `${item.nomeBase || item.nome} ${selectedColor}`.trim();
}

function getProductImageForColor(item, color = item.corPrincipal || item.cor) {
  const isMainColor = normalizeText(color) === normalizeText(item.corPrincipal || item.cor);
  return item.imagens[isMainColor ? 0 : 1] || item.imagens[0] || FALLBACK_IMAGE;
}

function selectColor(color) {
  const item = getCurrentProduct();
  if (!item || !item.cores.includes(color)) return;
  state.selectedColor = color;
  state.galleryIndex = normalizeText(color) === normalizeText(item.corPrincipal || item.cor) ? 0 : 1;
  render();
}

function getRoute() {
  const raw = location.hash.replace(/^#\/?/, '');
  if (!raw || raw === 'home') return { name: 'home' };
  const [route, ...rest] = raw.split('/');
  const value = decodeURIComponent(rest.join('/'));
  if (route === 'categoria') return { name: 'catalog', category: value || 'novidades' };
  if (route === 'busca') return { name: 'search', term: value };
  if (route === 'produto') return { name: 'product', id: value };
  if (route === 'carrinho') return { name: 'cart' };
  if (route === 'entrega') return { name: 'delivery' };
  if (route === 'pagamento') return { name: 'payment' };
  if (route === 'confirmacao') return { name: 'confirmation' };
  if (route === 'conta') return { name: 'account' };
  if (route === 'pedidos') return { name: 'orders' };
  return { name: 'home' };
}

function navigate(hash) {
  if (location.hash === hash) render();
  else location.hash = hash;
}

function productCardMarkup(item) {
  return `
    <article class="product-card">
      <div class="product-card-media">
        <a href="#/produto/${encodeURIComponent(item.id)}" aria-label="Ver detalhes de ${escapeHTML(item.nome)}">
          <img src="${item.imagemPrincipal}" alt="${escapeHTML(item.nome)}" loading="lazy" />
        </a>
        ${item.novidade ? '<span class="product-card-badge">Novidade</span>' : ''}
        <button class="card-cart" type="button" data-action="card-add-cart" data-product-id="${item.id}" aria-label="Adicionar ${escapeHTML(item.nome)} ao carrinho">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M3.8 5.5h2.1l1.7 10.1h9.9l2.1-7.3H6.4" /><path d="M9.1 20.2a1.1 1.1 0 1 0 0-2.2 1.1 1.1 0 0 0 0 2.2ZM17 20.2a1.1 1.1 0 1 0 0-2.2 1.1 1.1 0 0 0 0 2.2Z" /></svg>
        </button>
      </div>
      <div class="product-card-body">
        <h3><a href="#/produto/${encodeURIComponent(item.id)}">${escapeHTML(item.nome)}</a></h3>
        <div class="product-price">
          ${item.precoAntigo ? `<span class="product-price-old">${formatCurrency(item.precoAntigo)}</span>` : ''}
          <span class="product-price-current">${formatCurrency(item.preco)}</span>
        </div>
        <div class="product-meta">${escapeHTML(item.cor)} · ${escapeHTML(item.categoria)}</div>
      </div>
    </article>
  `;
}

function renderHome() {
  const tabs = [
    ['destaques', 'Destaques'], ['todos', 'Todos'], ['vestidos', 'Vestidos'], ['blusas', 'Blusas'], ['calcas', 'Calças']
  ];
  let homeItems;
  if (state.homeTab === 'destaques') homeItems = products.filter((item) => item.destaque).slice(0, 3);
  else if (state.homeTab === 'todos') homeItems = products.slice(0, 3);
  else homeItems = products.filter((item) => item.categoria === state.homeTab).slice(0, 3);
  const linkTarget = state.homeTab === 'vestidos' || state.homeTab === 'blusas' || state.homeTab === 'calcas' ? state.homeTab : 'novidades';
  return `
    <section class="hero container" aria-labelledby="home-title">
      <div class="hero-banner">
        <div class="hero-copy">
          <p class="eyebrow">Nova coleção</p>
          <h1 id="home-title" class="display-title">Vista-se de você.</h1>
          <p>Peças que valorizam sua essência em cada detalhe.</p>
          <a class="button" href="#/categoria/novidades">Conheça a coleção</a>
        </div>
        <div class="hero-image">
          <img src="https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1500&q=88" alt="Modelo usando uma produção sofisticada em tons neutros" fetchpriority="high" />
        </div>
      </div>
    </section>

    <section class="benefits" aria-label="Benefícios da ELORA">
      <div class="container benefits-grid">
        <div class="benefit"><span class="benefit-icon"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="5" width="16" height="14" rx="1"/><path d="M8 9h8M8 13h5"/></svg></span><div><strong>Parcele em até 6x</strong><span>sem juros</span></div></div>
        <div class="benefit"><span class="benefit-icon"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 7h11v9H3zM14 10h3l4 4v2h-7z"/><circle cx="7" cy="18" r="1.5"/><circle cx="18" cy="18" r="1.5"/></svg></span><div><strong>Frete grátis</strong><span>acima de R$399</span></div></div>
        <div class="benefit"><span class="benefit-icon"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 7h16M4 12h16M4 17h10"/><path d="m15 15 2 2 4-4"/></svg></span><div><strong>Troca fácil</strong><span>e gratuita</span></div></div>
        <div class="benefit"><span class="benefit-icon"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 3 14.8 9l6.2.6-4.7 4.1 1.4 6.1-5.7-3.2-5.7 3.2 1.4-6.1L3 9.6 9.2 9z"/></svg></span><div><strong>10% off na 1ª compra</strong><span>cupom ELORA10</span></div></div>
      </div>
    </section>

    <section class="section container" aria-labelledby="highlights-title">
      <div class="section-heading"><div><p class="eyebrow">Seleção ELORA</p><h2 id="highlights-title" class="section-title">Destaques</h2></div><p>Descubra os destaques da temporada e encontre a peça que fala com o seu momento.</p></div>
      <div class="tabs" role="tablist" aria-label="Categorias em destaque">
        ${tabs.map(([key, label]) => `<button class="tab ${state.homeTab === key ? 'is-active' : ''}" type="button" role="tab" aria-selected="${state.homeTab === key}" data-action="home-tab" data-tab="${key}">${label}</button>`).join('')}
      </div>
      <div class="product-grid home-product-grid">${homeItems.map(productCardMarkup).join('')}</div>
      <div class="section-footer"><a class="button button--outline" href="#/categoria/${linkTarget}">Ver todos</a></div>
    </section>
  `;
}

function filterFieldsMarkup() {
  const colorMap = { Bege: '#d5c0ae', Preto: '#292628', Vinho: '#8B3A4A', Rosa: '#c78f98', Branco: '#fff', Marrom: '#806352' };
  const categories = [['vestidos', 'Vestidos'], ['blusas', 'Blusas'], ['calcas', 'Calças']];
  const prices = [['0-90', 'R$65 – R$90'], ['90-150', 'R$90 – R$150'], ['150-200', 'R$150 – R$200'], ['200+', 'Mais de R$200']];
  return `
    <div class="filter-group"><h3>Tipo de roupa</h3>${categories.map(([value, label]) => `<label class="check-label"><input type="checkbox" data-filter-type="categories" value="${value}" ${state.filters.categories.includes(value) ? 'checked' : ''} />${label}</label>`).join('')}</div>
    <div class="filter-group"><h3>Tamanho</h3><div class="size-options">${['P','M','G','GG'].map((size) => `<label class="size-filter-label"><input type="checkbox" data-filter-type="sizes" value="${size}" ${state.filters.sizes.includes(size) ? 'checked' : ''} /><span>${size}</span></label>`).join('')}</div></div>
    <div class="filter-group"><h3>Cor</h3><div class="color-options">${Object.entries(colorMap).map(([label, color]) => `<label class="color-filter-label" title="${label}"><input type="checkbox" data-filter-type="colors" value="${label}" ${state.filters.colors.includes(label) ? 'checked' : ''} /><span class="color-swatch" style="background:${color}"></span><span class="sr-only">${label}</span></label>`).join('')}</div></div>
    <div class="filter-group price-options"><h3>Preço</h3>${prices.map(([value, label]) => `<label class="check-label"><input type="checkbox" data-filter-type="prices" value="${value}" ${state.filters.prices.includes(value) ? 'checked' : ''} />${label}</label>`).join('')}</div>
  `;
}

function filtersPanelMarkup(mobile = false) {
  return `
    <div class="filter-header"><h2>Filtros</h2><button class="filter-clear" type="button" data-action="clear-filters">Limpar filtros</button></div>
    ${filterFieldsMarkup()}
    ${mobile ? '<button class="button button--full" type="button" data-action="apply-filters">Aplicar filtros</button>' : ''}
  `;
}

function sortProducts(items) {
  return [...items].sort((a, b) => {
    if (state.sort === 'price-asc') return a.preco - b.preco;
    if (state.sort === 'price-desc') return b.preco - a.preco;
    if (state.sort === 'name-asc') return a.nome.localeCompare(b.nome, 'pt-BR');
    if (state.sort === 'name-desc') return b.nome.localeCompare(a.nome, 'pt-BR');
    return Number(b.novidade) - Number(a.novidade);
  });
}

function paginationMarkup(total, perPage) {
  const pages = Math.ceil(total / perPage);
  if (pages <= 1) return '';
  return `<nav class="pagination" aria-label="Paginação">${Array.from({ length: pages }, (_, index) => {
    const page = index + 1;
    return `<button type="button" class="${state.page === page ? 'is-active' : ''}" aria-current="${state.page === page ? 'page' : 'false'}" data-action="change-page" data-page="${page}">${page}</button>`;
  }).join('')}</nav>`;
}

function renderCatalogPage({ category = null, term = '' } = {}) {
  const isSearch = Boolean(term);
  state.searchTerm = term;
  const filtered = sortProducts(filterProducts(products, state.filters, term, category));
  const perPage = 8;
  const maxPages = Math.max(1, Math.ceil(filtered.length / perPage));
  if (state.page > maxPages) state.page = maxPages;
  const currentItems = filtered.slice((state.page - 1) * perPage, state.page * perPage);
  const title = isSearch ? `Resultados para: “${escapeHTML(term)}”` : category === 'novidades' ? 'Novidades' : category ? categoryLabel(category) : 'Todos os produtos';
  const description = isSearch ? `${filtered.length} produto${filtered.length === 1 ? '' : 's'} encontrado${filtered.length === 1 ? '' : 's'}.` : 'Descubra peças femininas que unem elegância, conforto e personalidade.';
  return `
    <section class="category-intro"><div class="container"><div class="breadcrumb"><a href="#/home">Início</a><span>›</span><span class="current">${isSearch ? 'Busca' : escapeHTML(title)}</span></div><h1>${title}</h1><p>${description}</p></div></section>
    <section class="catalog-section container">
      <button class="button button--outline mobile-filter-trigger" type="button" data-action="open-filters">Filtrar</button>
      <div class="catalog-layout">
        <aside class="filter-panel" aria-label="Filtros de produtos">${filtersPanelMarkup()}</aside>
        <div class="catalog-content">
          <div class="catalog-toolbar"><p>${filtered.length} produto${filtered.length === 1 ? '' : 's'}</p><label class="sr-only" for="sort-select">Ordenar por</label><select class="sort-select" id="sort-select"><option value="recent" ${state.sort === 'recent' ? 'selected' : ''}>Ordenar por: Mais recentes</option><option value="price-asc" ${state.sort === 'price-asc' ? 'selected' : ''}>Menor preço</option><option value="price-desc" ${state.sort === 'price-desc' ? 'selected' : ''}>Maior preço</option><option value="name-asc" ${state.sort === 'name-asc' ? 'selected' : ''}>Nome: A–Z</option><option value="name-desc" ${state.sort === 'name-desc' ? 'selected' : ''}>Nome: Z–A</option></select></div>
          ${currentItems.length ? `<div class="product-grid catalog-grid">${currentItems.map(productCardMarkup).join('')}</div>${paginationMarkup(filtered.length, perPage)}` : `<div class="empty-results"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="11" cy="11" r="6.8"/><path d="m16.2 16.2 4.1 4.1"/></svg><h2>Nenhum produto encontrado</h2><p>Tente buscar por outro nome, categoria ou cor.</p><button class="button" type="button" data-action="show-all-products">Ver todos os produtos</button></div>`}
        </div>
      </div>
      <div class="mobile-filter-backdrop ${state.mobileFiltersOpen ? 'is-open' : ''}" data-action="close-filters"><aside class="mobile-filter-panel" role="dialog" aria-modal="true" aria-label="Filtros" data-action="stop-propagation">${filtersPanelMarkup(true)}</aside></div>
    </section>
  `;
}

function categoryLabel(category) {
  return ({ todos: 'Todos os produtos', vestidos: 'Vestidos', blusas: 'Blusas', calcas: 'Calças', novidades: 'Novidades' })[category] || 'Produtos';
}

function renderProductPage(id) {
  const item = products.find((entry) => entry.id === id) || products[0];
  if (state.lastProductId !== item.id) {
    state.selectedSize = '';
    state.selectedColor = item.corPrincipal || item.cor || item.cores[0] || '';
    state.productQuantity = 1;
    state.galleryIndex = 0;
    state.lastProductId = item.id;
  }
  const galleryImage = item.imagens[state.galleryIndex] || item.imagens[0];
  const displayName = getProductDisplayName(item, state.selectedColor);
  return `
    <section class="product-detail-section container">
      <div class="breadcrumb"><a href="#/home">Início</a><span>›</span><a href="#/categoria/${item.categoria}">${categoryLabel(item.categoria)}</a><span>›</span><span class="current">${escapeHTML(displayName)}</span></div>
      <div class="product-detail">
        <div class="product-gallery">
          <div class="gallery-thumbnails">${item.imagens.map((image, index) => `<button class="gallery-thumbnail ${index === state.galleryIndex ? 'is-active' : ''}" type="button" data-action="change-image" data-image-index="${index}" aria-label="Ver foto ${index + 1} de ${escapeHTML(displayName)}"><img src="${image}" alt="" loading="lazy" /></button>`).join('')}</div>
          <div class="gallery-main"><img id="gallery-main-image" src="${galleryImage}" alt="${escapeHTML(displayName)}" /></div>
        </div>
        <div class="product-info">
          <p class="eyebrow">${categoryLabel(item.categoria)}</p>
          <h1>${escapeHTML(displayName)}</h1>
          <div class="detail-price"><div class="product-price">${item.precoAntigo ? `<span class="product-price-old">${formatCurrency(item.precoAntigo)}</span>` : ''}<span class="product-price-current">${formatCurrency(item.preco)}</span></div><p class="installments">ou 6x de ${formatCurrency(item.preco / 6)} sem juros</p></div>
          <div class="option-group"><span class="option-label">Cor <span>${state.selectedColor ? `· ${escapeHTML(state.selectedColor)}` : ''}</span></span><div class="color-selectors">${item.cores.map((color) => `<label class="color-choice"><input type="radio" name="product-color" data-product-color value="${escapeHTML(color)}" ${state.selectedColor === color ? 'checked' : ''} /><span><i style="background:${colorToHex(color)}"></i>${escapeHTML(color)}</span></label>`).join('')}</div></div>
          <div class="option-group"><span class="option-label">Tamanho <span>${state.selectedSize ? `· ${state.selectedSize}` : ''}</span></span><div class="size-selectors">${item.tamanhos.map((size) => `<label class="size-choice"><input type="radio" name="product-size" data-product-size value="${size}" ${state.selectedSize === size ? 'checked' : ''} /><span>${size}</span></label>`).join('')}</div><p class="inline-error" id="product-size-error"></p></div>
          <div class="option-group"><span class="option-label">Quantidade</span><div class="quantity-control"><button type="button" data-action="product-quantity" data-quantity-change="-1" aria-label="Diminuir quantidade">−</button><output id="product-quantity-output">${state.productQuantity}</output><button type="button" data-action="product-quantity" data-quantity-change="1" aria-label="Aumentar quantidade">+</button></div></div>
          <div class="product-actions"><button class="button button--full" type="button" data-action="detail-add-cart" data-product-id="${item.id}">Adicionar ao carrinho</button></div>
        </div>
      </div>
      <div class="product-description"><div class="product-description-grid"><div><h2>Descrição</h2><p>${escapeHTML(item.descricao)}</p></div><div><h2>Guia de medidas</h2><table class="measure-table"><thead><tr><th>Tamanho</th><th>Busto</th><th>Cintura</th><th>Quadril</th></tr></thead><tbody>${Object.entries(item.medidas).map(([size, data]) => `<tr><td>${size}</td><td>${data.busto}</td><td>${data.cintura}</td><td>${data.quadril}</td></tr>`).join('')}</tbody></table></div></div></div>
    </section>
  `;
}

function colorToHex(color) {
  return ({ Bege: '#d5c0ae', Preto: '#292628', Vinho: '#8B3A4A', Rosa: '#c78f98', Branco: '#fff', Marrom: '#806352' })[color] || '#B98288';
}

function cartDetails() {
  return getCart().map((line) => ({ line, item: products.find((productItem) => productItem.id === line.produtoId) })).filter((entry) => entry.item);
}

function cartTotals(items = cartDetails()) {
  const subtotal = items.reduce((total, { line, item }) => total + item.preco * line.quantidade, 0);
  const frete = subtotal === 0 || subtotal >= 399 ? 0 : 29.90;
  return { subtotal, frete, total: subtotal + frete };
}

function summaryMarkup(items, totals) {
  return `${items.map(({ line, item }) => `<div class="summary-item"><span>${escapeHTML(line.nome || getProductDisplayName(item, line.cor))}<small>${line.quantidade} unidade${line.quantidade > 1 ? 's' : ''}</small></span><strong>${formatCurrency(item.preco * line.quantidade)}</strong></div>`).join('')}<div class="summary-row"><span>Subtotal</span><strong>${formatCurrency(totals.subtotal)}</strong></div><div class="summary-row"><span>Frete</span><strong>${totals.frete ? formatCurrency(totals.frete) : 'Grátis'}</strong></div><div class="summary-row total"><span>Total</span><strong>${formatCurrency(totals.total)}</strong></div>`;
}

function renderCartPage() {
  const items = cartDetails();
  if (!items.length) return `<section class="cart-shell container"><div class="empty-state"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M3.8 5.5h2.1l1.7 10.1h9.9l2.1-7.3H6.4"/><path d="M9.1 20.2a1.1 1.1 0 1 0 0-2.2 1.1 1.1 0 0 0 0 2.2ZM17 20.2a1.1 1.1 0 1 0 0-2.2 1.1 1.1 0 0 0 0 2.2Z"/></svg><h1>Seu carrinho está vazio</h1><p>Adicione suas peças favoritas para continuar.</p><a class="button" href="#/home">Continuar comprando</a></div></section>`;
  const totals = cartTotals(items);
  return `<section class="cart-shell container"><h1>Meu carrinho</h1><div class="cart-layout"><div class="cart-items">${items.map(({ line, item }) => `<article class="cart-item"><a class="cart-item-image" href="#/produto/${item.id}"><img src="${line.imagem || getProductImageForColor(item, line.cor)}" alt="${escapeHTML(line.nome || getProductDisplayName(item, line.cor))}" loading="lazy" /></a><div class="cart-item-info"><h2><a href="#/produto/${item.id}">${escapeHTML(line.nome || getProductDisplayName(item, line.cor))}</a></h2><p>Tamanho: ${escapeHTML(line.tamanho)}</p><p>Cor: ${escapeHTML(line.cor)}</p><span class="product-price-current">${formatCurrency(item.preco)}</span></div><div class="cart-item-controls"><div class="quantity-control"><button type="button" data-action="cart-quantity" data-key="${line.key}" data-quantity-change="-1" aria-label="Diminuir quantidade">−</button><output>${line.quantidade}</output><button type="button" data-action="cart-quantity" data-key="${line.key}" data-quantity-change="1" aria-label="Aumentar quantidade">+</button></div><button class="remove-button" type="button" data-action="remove-cart" data-key="${line.key}">Remover</button></div></article>`).join('')}</div><aside class="cart-summary"><h2>Resumo do pedido</h2>${summaryMarkup(items, totals)}<a class="button button--full" href="#/entrega" data-action="continue-to-delivery">Continuar para entrega</a></aside></div></section>`;
}

function openCheckoutModal() {
  if (document.getElementById('checkout-auth-modal')) return;
  const modal = document.createElement('div');
  modal.id = 'checkout-auth-modal';
  modal.dataset.action = 'close-checkout-modal';
  modal.setAttribute('role', 'presentation');
  modal.innerHTML = `<div role="dialog" aria-modal="true" aria-labelledby="checkout-auth-title" tabindex="-1" style="position:relative;width:min(90%,520px);box-sizing:border-box;padding:42px 34px 34px;background:#F3EFEF;border:1px solid rgba(139,58,74,.18);box-shadow:0 18px 55px rgba(35,22,26,.2);text-align:center;animation:eloraModalIn .22s ease-out"><button type="button" data-action="close-checkout-modal" aria-label="Fechar" style="position:absolute;top:12px;right:16px;border:0;background:transparent;color:#8B3A4A;font-size:28px;line-height:1;cursor:pointer">×</button><p class="eyebrow">Finalização</p><h2 id="checkout-auth-title" style="margin:10px 0 14px;font-family:Georgia,serif;color:#8B3A4A">Antes de continuar</h2><p style="max-width:410px;margin:0 auto 28px;line-height:1.6">Para finalizar sua compra, entre na sua conta.</p><div style="display:flex;justify-content:center"><button type="button" class="button" data-action="checkout-login" style="width:100%;min-height:54px;background:#8B3A4A;color:#fff;border-color:#8B3A4A">Fazer login</button></div></div>`;
  Object.assign(modal.style, { position: 'fixed', inset: '0', zIndex: '1000', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', boxSizing: 'border-box', background: 'rgba(0,0,0,.35)' });
  document.body.appendChild(modal);
  modal.querySelector('[role="dialog"]')?.focus();
}

function closeCheckoutModal() {
  document.getElementById('checkout-auth-modal')?.remove();
}

function handleCheckoutContinue() {
  if (hasActiveSession()) {
    navigate('#/entrega');
    return;
  }
  openCheckoutModal();
}

function inputField(name, label, value, required = false, type = 'text', full = false, autocomplete = '') {
  return `<div class="form-field ${full ? 'full' : ''}"><label for="${name}">${label}${required ? ' *' : ''}</label><input id="${name}" name="${name}" type="${type}" value="${escapeHTML(value)}" ${required ? 'required' : ''} ${autocomplete ? `autocomplete="${autocomplete}"` : ''} /><p class="field-error" data-error-for="${name}"></p></div>`;
}

function renderCheckoutSteps(active) {
  const steps = [['delivery', '1', 'Entrega'], ['payment', '2', 'Pagamento'], ['confirmation', '3', 'Confirmação']];
  return `<div class="checkout-steps">${steps.map(([key, number, label], index) => `${index ? '<span class="checkout-step-line"></span>' : ''}<span class="checkout-step ${active === key ? 'is-active' : ''}"><span>${number}</span>${label}</span>`).join('')}</div>`;
}

function renderDeliveryPage() {
  const address = readStorage(STORAGE_KEYS.address, {});
  const items = cartDetails();
  if (!items.length) return renderCartPage();
  return `<section class="checkout-shell container"><div class="checkout-title"><p class="eyebrow">Finalização</p><h1>Endereço de entrega</h1><p>Informe onde deseja receber suas peças ELORA.</p></div>${renderCheckoutSteps('delivery')}<div class="checkout-layout"><form class="form-card" id="delivery-form" novalidate><h2>Seus dados</h2><div class="form-grid">${inputField('name', 'Nome completo', address.name || '', true, 'text', true, 'name')}${inputField('zip', 'CEP', address.zip || '', true, 'text', false, 'postal-code')}${inputField('street', 'Endereço', address.street || '', true, 'text', true, 'street-address')}${inputField('number', 'Número', address.number || '', true, 'text', false, 'address-line2')}${inputField('complement', 'Complemento', address.complement || '', false, 'text', false, 'address-line2')}${inputField('neighborhood', 'Bairro', address.neighborhood || '', true)}${inputField('city', 'Cidade', address.city || '', true)}<div class="form-field"><label for="state">Estado *</label><select id="state" name="state" required><option value="">Selecione</option>${['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO'].map((uf) => `<option value="${uf}" ${address.state === uf ? 'selected' : ''}>${uf}</option>`).join('')}</select><p class="field-error" data-error-for="state"></p></div></div><div class="form-actions"><a class="button button--outline" href="#/carrinho">Voltar ao carrinho</a><button class="button" type="submit">Continuar para pagamento</button></div></form><aside class="order-summary"><h2>Resumo do pedido</h2>${summaryMarkup(items, cartTotals(items))}<p class="summary-note">Pagamento seguro e simulado para este protótipo frontend.</p></aside></div></section>`;
}

function renderPaymentPage() {
  pixPaymentConfirmed = false;
  const address = readStorage(STORAGE_KEYS.address, {});
  const items = cartDetails();
  if (!items.length) return renderCartPage();
  if (!address.name || !address.zip || !address.street || !address.number || !address.neighborhood || !address.city || !address.state) return renderDeliveryPage();
  return `<section class="checkout-shell container"><div class="checkout-title"><p class="eyebrow">Finalização</p><h1>Forma de pagamento</h1><p>Escolha uma forma de pagamento para concluir seu pedido.</p></div>${renderCheckoutSteps('payment')}<div class="checkout-layout"><form class="form-card" id="payment-form" novalidate><h2>Pagamento</h2><div class="payment-options"><label class="payment-option"><input type="radio" name="payment" value="card" data-payment="card" checked /><span><strong>Cartão de crédito</strong><small>Até 6x sem juros</small></span></label><label class="payment-option"><input type="radio" name="payment" value="pix" data-payment="pix" /><span><strong>PIX</strong><small>Pagamento com aprovação imediata.</small></span></label></div><div id="pix-payment-card" hidden style="margin-top:22px;padding:18px;background:#F3EFEF;border:1px solid rgba(139,58,74,.16);border-radius:8px"><h3 style="margin:0 0 8px;color:#8B3A4A;font-family:Georgia,serif">Pagamento via Pix</h3><p style="margin:0 0 12px;color:#6f6264;font-size:14px;line-height:1.45">Faça o pagamento usando o QR Code. O código expira em alguns minutos.</p><div style="display:grid;grid-template-columns:minmax(180px,210px) minmax(0,1fr);gap:16px;align-items:center"><div style="padding:12px;background:#fff;text-align:center;border:1px solid rgba(139,58,74,.1)"><img id="pix-qr" src="${pixQrUrl()}" alt="QR Code para pagamento via Pix" style="display:block;width:100%;max-width:210px;margin:0 auto" /></div><div><p style="margin:0 0 8px;color:#2e2527;font-weight:600">Total da compra: ${formatCurrency(cartTotals(items).total)}</p><p style="margin:0 0 8px;color:#6f6264;font-size:13px;line-height:1.45">Abra o aplicativo do seu banco, escaneie o QR Code e confirme o pagamento. Ou copie o código Pix e cole no aplicativo do seu banco.</p><div style="padding:12px;background:#fff;border:1px solid rgba(139,58,74,.12);font-size:12px;line-height:1.4;word-break:break-all;color:#6f6264">${escapeHTML(PIX_CODE)}</div><button type="button" class="button button--outline" data-action="copy-pix-code" style="margin-top:8px;color:#8B3A4A;border-color:#8B3A4A">Copiar código Pix</button><p id="pix-timer" style="margin:10px 0 0;color:#8B3A4A;font-size:13px">Este código expira em: 05:00</p><p id="pix-expired" hidden style="margin:6px 0 0;color:#8B3A4A;font-size:13px">Código Pix expirado.</p><button type="button" class="button" data-action="pix-paid" style="display:block;margin-top:12px;background:#8B3A4A;color:#fff;border-color:#8B3A4A">Já fiz o pagamento</button><p id="pix-payment-status" style="margin:8px 0 0;color:#6f6264;font-size:13px">Aguardando pagamento.</p><p id="pix-finalize-error" hidden style="margin:12px 0 0;padding:10px;background:#F3EFEF;color:#8B3A4A;font-size:13px;line-height:1.45">Realize o pagamento via Pix antes de finalizar a compra.<br><span>Após realizar o pagamento, clique em 'Já fiz o pagamento' para continuar.</span></p></div></div></div><div class="payment-fields" id="card-fields">${inputField('cardNumber', 'Número do cartão', '', true, 'text', true, 'cc-number')}${inputField('cardHolder', 'Nome no cartão', '', true, 'text', true, 'cc-name')}<div class="form-grid">${inputField('expiry', 'Validade', '', true, 'text', false, 'cc-exp')}${inputField('cvv', 'CVV', '', true, 'text', false, 'cc-csc')}</div></div><div class="form-actions"><a class="button button--outline" href="#/entrega">Voltar para entrega</a><button class="button" type="submit">Finalizar compra</button></div></form><aside class="order-summary"><h2>Resumo do pedido</h2>${summaryMarkup(items, cartTotals(items))}<p class="summary-note">Seus dados são utilizados apenas para simular o fluxo da compra.</p></aside></div></section>`;
}

function renderConfirmationPage() {
  const lastId = localStorage.getItem(STORAGE_KEYS.lastOrder) || '#ELORA001';
  return `<section class="confirmation-shell container"><div class="confirmation-card"><span class="confirmation-mark"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="m5 12 4.4 4.2L19 7" /></svg></span><p class="eyebrow">Obrigada por escolher a ELORA</p><h1>Compra realizada com sucesso!</h1><p>Seu pedido foi recebido e está sendo preparado.</p><p class="order-number">${escapeHTML(lastId)}</p><div class="confirmation-actions"><a class="button" href="#/pedidos">Acompanhar pedido</a><a class="button button--outline" href="#/home">Continuar comprando</a></div></div></section>`;
}

function renderAccountPage() {
  const customer = getCustomer();
  const accountMenu = `<nav class="account-menu" aria-label="Menu da conta"><a class="is-active" href="#/conta">Meus dados</a><a href="#/pedidos">Meus pedidos</a>${hasActiveSession() ? '<button type="button" data-action="logout">Sair da conta</button>' : ''}</nav>`;
  if (!hasActiveSession()) {
    return `<section class="account-shell container" style="min-height:clamp(620px,calc(100vh - 180px),820px);display:flex;flex-direction:column;justify-content:center;padding:48px 20px 64px;box-sizing:border-box"><div class="page-heading" style="width:100%;max-width:680px;margin:0 auto 34px;text-align:center"><p class="eyebrow">Área da cliente</p><h1>Minha conta</h1><p style="max-width:560px;margin:12px auto 0">Entre na sua conta para acessar seus dados e acompanhar seus pedidos.</p></div><div class="account-layout" style="width:100%;display:flex;justify-content:center"><form class="form-card account-form-card" id="login-form" novalidate style="width:min(100%,560px);box-sizing:border-box;padding:clamp(28px,5vw,52px);margin:0 auto;background:#fff;border:1px solid rgba(139,58,74,.16);box-shadow:0 14px 36px rgba(61,36,42,.08)"><h2 style="margin:0 0 30px;text-align:center;font-family:Georgia,serif;font-size:clamp(1.6rem,3vw,2.15rem);color:#8B3A4A">Entrar</h2><div class="form-field"><label for="loginIdentity">E-mail *</label><input id="loginIdentity" name="loginIdentity" type="email" required autocomplete="username" inputmode="email" style="width:100%;min-height:54px;box-sizing:border-box;padding:0 16px;border:1px solid rgba(139,58,74,.28);background:#fff;font-size:1rem" /><p class="field-error" data-error-for="loginIdentity"></p></div><div class="form-field" style="margin-top:22px"><label for="loginPassword">Senha *</label><input id="loginPassword" name="loginPassword" type="password" required autocomplete="current-password" style="width:100%;min-height:54px;box-sizing:border-box;padding:0 16px;border:1px solid rgba(139,58,74,.28);background:#fff;font-size:1rem" /><label for="show-login-password" style="display:flex;align-items:center;justify-content:flex-end;gap:5px;width:max-content;margin:9px 0 0 auto;font-size:13px;line-height:1.2;font-weight:400;color:#6f6264;cursor:pointer;white-space:nowrap"><input id="show-login-password" type="checkbox" data-action="toggle-login-password" style="width:14px;height:14px;margin:0;accent-color:#8B3A4A;cursor:pointer" /> <span>Mostrar senha</span></label><p class="field-error" data-error-for="loginPassword"></p></div><p class="field-error" id="login-error" style="margin-top:12px"></p><div class="form-actions" style="display:flex;justify-content:center;margin-top:30px;transform:translateY(-20px)"><span></span><button class="button" type="submit" style="width:min(100%,230px);min-height:52px;background:#8B3A4A;color:#fff;border-color:#8B3A4A">Entrar</button></div><div style="margin-top:18px;text-align:center;font-size:14px;color:#6f6264">Não tem uma conta? <button type="button" data-action="open-register" style="padding:0;border:0;background:transparent;color:#8B3A4A;font:600 14px/1.4 inherit;cursor:pointer;text-decoration:none">Cadastre-se</button></div></form></div></section>`;
  }
  const firstName = String(customer.name || 'cliente').trim().split(/\s+/)[0] || 'cliente';
  return `<section class="account-shell container"><div class="page-heading"><p class="eyebrow">Área da cliente</p><h1>Minha conta</h1><p>Olá, ${escapeHTML(firstName)}. Gerencie seus dados e acompanhe suas compras.</p></div><div class="account-layout" style="width:100%;max-width:1180px;margin:0 auto;display:grid;grid-template-columns:minmax(190px,240px) minmax(0,1fr);gap:24px;align-items:start">${accountMenu}<form class="form-card account-form-card" id="account-form" novalidate style="width:100%;max-width:1000px;box-sizing:border-box"><h2>Meus dados</h2><div class="form-grid">${inputField('customerName', 'Nome completo', customer.name || '', true, 'text', true, 'name')}${inputField('customerEmail', 'E-mail', customer.email || '', true, 'email', true, 'email')}${inputField('customerPhone', 'Telefone', customer.phone || '', false, 'tel', false, 'tel')}${inputField('customerPassword', 'Senha', customer.password || '', false, 'password', false, 'new-password')}</div><div class="form-actions"><span></span><button class="button" type="submit">Salvar alterações</button></div></form></div></section>`;
}

function renderOrdersPage() {
  const orders = getOrders().slice().reverse();
  if (!orders.length) return `<section class="orders-shell container"><div class="page-heading"><p class="eyebrow">Área da cliente</p><h1>Meus pedidos</h1><p>Acompanhe aqui todas as compras realizadas.</p></div><div class="empty-state"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M5 4h14v17H5z"/><path d="M8 8h8M8 12h8M8 16h5"/></svg><h2>Você ainda não realizou pedidos</h2><p>Quando finalizar uma compra, ela aparecerá aqui.</p><a class="button" href="#/home">Conhecer a coleção</a></div></section>`;
  return `<section class="orders-shell container"><div class="page-heading"><p class="eyebrow">Área da cliente</p><h1>Meus pedidos</h1><p>Todos os seus pedidos, com status atualizado dinamicamente.</p></div><div class="orders-list">${orders.map((order) => `<article class="order-card"><div class="order-card-header"><div><h2>${escapeHTML(order.id)}</h2><p>${formatDate(order.date)} · ${escapeHTML(order.payment?.method === 'pix' ? 'PIX' : 'Cartão de crédito')}</p></div><span class="order-status">${escapeHTML(order.status).toUpperCase()}</span></div><div class="order-products">${order.items.map((item) => `<div class="order-product"><span><strong>${escapeHTML(item.nome)}</strong><br />${item.quantidade} unidade${item.quantidade > 1 ? 's' : ''} · ${escapeHTML(item.tamanho)} · ${escapeHTML(item.cor)}</span><span>${formatCurrency(item.preco * item.quantidade)}</span></div>`).join('')}</div><div class="order-card-footer"><span>Total</span><strong>${formatCurrency(order.total)}</strong></div></article>`).join('')}</div></section>`;
}

function validateFormFields(form, fieldRules) {
  let valid = true;
  fieldRules.forEach(({ name, message }) => {
    const field = form.elements[name];
    const error = form.querySelector(`[data-error-for="${name}"]`);
    const empty = !field || !String(field.value || '').trim();
    if (empty) {
      valid = false;
      field?.classList.add('is-invalid');
      if (error) error.textContent = message;
    } else {
      field?.classList.remove('is-invalid');
      if (error) error.textContent = '';
    }
  });
  return valid;
}

function handleDeliverySubmit(form) {
  const rules = [
    { name: 'name', message: 'Informe seu nome.' }, { name: 'zip', message: 'Informe o CEP.' }, { name: 'street', message: 'Informe o endereço.' },
    { name: 'number', message: 'Informe o número.' }, { name: 'neighborhood', message: 'Informe o bairro.' }, { name: 'city', message: 'Informe a cidade.' }, { name: 'state', message: 'Selecione o estado.' }
  ];
  if (!validateFormFields(form, rules)) return;
  const address = Object.fromEntries(new FormData(form).entries());
  writeStorage(STORAGE_KEYS.address, address);
  navigate('#/pagamento');
}

function pixQrUrl() {
  return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(PIX_CODE)}`;
}

function formatPixTime(seconds) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
  const remainder = (seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${remainder}`;
}

function updatePixTimer() {
  const timer = document.getElementById('pix-timer');
  const expired = document.getElementById('pix-expired');
  const qr = document.getElementById('pix-qr');
  if (!timer || !expired || !qr) return;
  timer.textContent = pixSecondsRemaining > 0 ? `Este código expira em: ${formatPixTime(pixSecondsRemaining)}` : 'Código Pix expirado.';
  const isExpired = pixSecondsRemaining <= 0;
  expired.hidden = !isExpired;
  qr.style.opacity = isExpired ? '0.35' : '1';
  qr.style.filter = isExpired ? 'grayscale(1)' : 'none';
}

function startPixTimer(reset = false) {
  if (reset) pixSecondsRemaining = 300;
  window.clearInterval(pixCountdownTimer);
  updatePixTimer();
  pixCountdownTimer = window.setInterval(() => {
    pixSecondsRemaining = Math.max(0, pixSecondsRemaining - 1);
    updatePixTimer();
    if (pixSecondsRemaining === 0) window.clearInterval(pixCountdownTimer);
  }, 1000);
}

function togglePaymentFields(method) {
  const fields = document.getElementById('card-fields');
  const pixCard = document.getElementById('pix-payment-card');
  if (fields) fields.classList.toggle('is-hidden', method === 'pix');
  if (pixCard) {
    pixCard.hidden = method !== 'pix';
    if (method === 'pix') {
      pixPaymentConfirmed = false;
      startPixTimer(true);
      const status = document.getElementById('pix-payment-status');
      const error = document.getElementById('pix-finalize-error');
      if (status) status.textContent = 'Aguardando pagamento.';
      if (error) error.hidden = true;
    } else window.clearInterval(pixCountdownTimer);
  }
}

function simulatePixApproval() {
  const button = document.querySelector('[data-action="pix-paid"]');
  const status = document.getElementById('pix-payment-status');
  const form = document.getElementById('payment-form');
  if (!button || !status || !form || button.disabled) return;
  button.disabled = true;
  button.textContent = 'VERIFICANDO PAGAMENTO...';
  status.textContent = 'Verificando pagamento...';
  window.setTimeout(() => {
    pixPaymentConfirmed = true;
    status.innerHTML = '<strong style="color:#8B3A4A">Pagamento aprovado</strong><br><span>Seu pedido foi confirmado com sucesso.</span>';
    button.textContent = 'Pagamento aprovado';
    const error = document.getElementById('pix-finalize-error');
    if (error) error.hidden = true;
  }, 1000);
}

function copyPixCode() {
  const button = document.querySelector('[data-action="copy-pix-code"]');
  const done = () => {
    if (!button) return;
    button.textContent = 'Código copiado';
    window.setTimeout(() => { if (button.isConnected) button.textContent = 'Copiar código Pix'; }, 2200);
  };
  if (navigator.clipboard?.writeText) navigator.clipboard.writeText(PIX_CODE).then(done).catch(() => {});
  else {
    const helper = document.createElement('textarea');
    helper.value = PIX_CODE;
    document.body.appendChild(helper);
    helper.select();
    document.execCommand('copy');
    helper.remove();
    done();
  }
}

function handlePaymentSubmit(form) {
  const method = form.elements.payment.value;
  if (method === 'pix' && !pixPaymentConfirmed) {
    const error = document.getElementById('pix-finalize-error');
    if (error) error.hidden = false;
    return;
  }
  if (method === 'card') {
    const rules = [
      { name: 'cardNumber', message: 'Informe o número do cartão.' }, { name: 'cardHolder', message: 'Informe o nome no cartão.' },
      { name: 'expiry', message: 'Informe a validade.' }, { name: 'cvv', message: 'Informe o CVV.' }
    ];
    if (!validateFormFields(form, rules)) return;
  }
  const cardNumber = String(form.elements.cardNumber?.value || '').replace(/\D/g, '');
  const payment = { method, last4: method === 'card' ? cardNumber.slice(-4) : null };
  const address = readStorage(STORAGE_KEYS.address, {});
  const order = createOrder(address, payment);
  localStorage.setItem(STORAGE_KEYS.lastOrder, order.id);
  clearCart();
  showToast('Compra realizada com sucesso.');
  navigate('#/confirmacao');
}

function renderRegisterPage() {
  return `<section class="account-shell container" style="min-height:clamp(620px,calc(100vh - 180px),820px);display:flex;flex-direction:column;justify-content:center;padding:48px 20px 64px;box-sizing:border-box"><div class="page-heading" style="width:100%;max-width:680px;margin:0 auto 34px;text-align:center"><p class="eyebrow">Área da cliente</p><h1>Crie sua conta</h1><p style="max-width:560px;margin:12px auto 0">Cadastre seus dados para acompanhar seus pedidos.</p></div><form class="form-card account-form-card" id="register-form" novalidate style="width:min(100%,560px);box-sizing:border-box;padding:clamp(28px,5vw,52px);margin:0 auto;background:#fff;border:1px solid rgba(139,58,74,.16);box-shadow:0 14px 36px rgba(61,36,42,.08)"><h2 style="margin:0 0 26px;text-align:center;font-family:Georgia,serif;color:#8B3A4A">Cadastro</h2>${inputField('registerName', 'Nome completo', '', true, 'text', true, 'name')}${inputField('registerEmail', 'E-mail', '', true, 'email', true, 'email')}${inputField('registerPassword', 'Senha', '', true, 'password', true, 'new-password')}${inputField('registerConfirmPassword', 'Confirmar senha', '', true, 'password', true, 'new-password')}<p class="field-error" id="register-error" style="margin-top:12px"></p><div class="form-actions" style="display:flex;justify-content:center;gap:12px;margin-top:26px"><button class="button button--outline" type="button" data-action="back-to-login">Voltar</button><button class="button" type="submit" style="min-width:180px;background:#8B3A4A;color:#fff;border-color:#8B3A4A">Cadastrar</button></div></form></section>`;
}

function handleRegisterSubmit(form) {
  const name = String(form.elements.registerName?.value || '').trim();
  const email = String(form.elements.registerEmail?.value || '').trim();
  const password = String(form.elements.registerPassword?.value || '');
  const confirmPassword = String(form.elements.registerConfirmPassword?.value || '');
  const error = form.querySelector('#register-error');
  if (!name || !email || !password || !confirmPassword) { if (error) error.textContent = 'Preencha todos os campos obrigatórios.'; return; }
  if (!email.includes('@')) { if (error) error.textContent = 'Digite um e-mail válido com @.'; return; }
  if (password !== confirmPassword) { if (error) error.textContent = 'As senhas não coincidem.'; return; }
  writeStorage(STORAGE_KEYS.customer, { name, email, phone: '', password });
  localStorage.removeItem(STORAGE_KEYS.session);
  showToast('Cadastro realizado com sucesso.');
  navigate('#/conta');
}

function handleLoginSubmit(form) {
  const identity = String(form.elements.loginIdentity?.value || '').trim();
  const password = String(form.elements.loginPassword?.value || '').trim();
  const error = form.querySelector('#login-error');
  if (!identity || !password) {
    if (error) error.textContent = 'Preencha todos os campos.';
    return;
  }
  if (!identity.includes('@')) {
    if (error) error.textContent = 'Digite um e-mail válido com @.';
    return;
  }
  const storedCustomer = getCustomer();
  const normalizedIdentity = normalizeText(identity);
  const matchesStoredCustomer = Boolean(storedCustomer.email && normalizeText(storedCustomer.email) === normalizedIdentity);
  if (matchesStoredCustomer && storedCustomer.password && storedCustomer.password !== password) {
    if (error) error.textContent = 'Nome ou e-mail e senha não conferem.';
    return;
  }
  const displayName = storedCustomer.name && matchesStoredCustomer ? storedCustomer.name : (identity.includes('@') ? identity.split('@')[0] : identity);
  const email = storedCustomer.email && matchesStoredCustomer ? storedCustomer.email : (identity.includes('@') ? identity : '');
  saveCustomer({ name: displayName, email, phone: storedCustomer.phone || '', password });
  const nextRoute = state.returnToCartAfterLogin ? '#/carrinho' : '#/conta';
  state.returnToCartAfterLogin = false;
  navigate(nextRoute);
}

function handleAccountSubmit(form) {
  const rules = [{ name: 'customerName', message: 'Informe seu nome.' }, { name: 'customerEmail', message: 'Informe seu e-mail.' }];
  if (!validateFormFields(form, rules)) return;
  const values = Object.fromEntries(new FormData(form).entries());
  saveCustomer({ name: values.customerName, email: values.customerEmail, phone: values.customerPhone, password: values.customerPassword });
  render();
}

function updateCartCount() {
  const count = getCart().reduce((total, item) => total + Number(item.quantidade || 0), 0);
  const element = document.getElementById('cart-count');
  if (element) element.textContent = count;
}

function showToast(message) {
  const region = document.getElementById('toast-region');
  if (!region) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  region.appendChild(toast);
  window.setTimeout(() => {
    toast.classList.add('is-leaving');
    window.setTimeout(() => toast.remove(), 260);
  }, 2600);
}

function updateActiveNavigation(route) {
  let active = '';
  if (route.name === 'catalog') active = route.category;
  if (route.name === 'cart') active = 'carrinho';
  if (route.name === 'account') active = 'conta';
  document.querySelectorAll('[data-nav-route]').forEach((link) => link.classList.toggle('is-active', link.dataset.navRoute === active));
}

function attachImageFallbacks() {
  document.querySelectorAll('img').forEach((image) => {
    image.addEventListener('error', () => {
      if (image.src !== FALLBACK_IMAGE) image.src = FALLBACK_IMAGE;
    }, { once: true });
  });
}

function render() {
  const route = getRoute();
  const main = document.getElementById('main-content');
  if (!main) return;
  if (route.name === 'home') main.innerHTML = renderHome();
  if (route.name === 'catalog') main.innerHTML = renderCatalogPage({ category: route.category });
  if (route.name === 'search') main.innerHTML = renderCatalogPage({ term: route.term });
  if (route.name === 'product') main.innerHTML = renderProductPage(route.id);
  if (route.name === 'cart') main.innerHTML = renderCartPage();
  if (route.name === 'delivery') main.innerHTML = renderDeliveryPage();
  if (route.name === 'payment') main.innerHTML = renderPaymentPage();
  if (route.name === 'confirmation') main.innerHTML = renderConfirmationPage();
  if (route.name === 'account') main.innerHTML = renderAccountPage();
  if (route.name === 'orders') main.innerHTML = renderOrdersPage();
  main.focus({ preventScroll: true });
  document.title = route.name === 'home' ? 'ELORA | Moda Feminina' : `ELORA | ${route.name === 'product' ? 'Produto' : 'Moda Feminina'}`;
  updateActiveNavigation(route);
  updateCartCount();
  const searchInput = document.getElementById('header-search-input');
  if (searchInput) {
    searchInput.value = route.name === 'search' ? route.term : state.searchTerm;
    if (route.name === 'search') {
      searchInput.focus();
      searchInput.setSelectionRange(searchInput.value.length, searchInput.value.length);
    }
  }
  attachImageFallbacks();
}

function toggleMobileMenu() {
  state.mobileMenuOpen = !state.mobileMenuOpen;
  const menu = document.getElementById('mobile-nav');
  const button = document.querySelector('.mobile-menu-toggle');
  menu?.classList.toggle('is-open', state.mobileMenuOpen);
  menu?.setAttribute('aria-hidden', String(!state.mobileMenuOpen));
  button?.setAttribute('aria-expanded', String(state.mobileMenuOpen));
}

function handleClick(event) {
  const target = event.target.closest('[data-action]');
  if (!target) return;
  const action = target.dataset.action;
  if (action === 'copy-pix-code') { event.preventDefault(); copyPixCode(); return; }
  if (action === 'pix-paid') { event.preventDefault(); simulatePixApproval(); return; }
  if (action === 'continue-to-delivery') { event.preventDefault(); handleCheckoutContinue(); return; }
  if (action === 'checkout-login') { state.returnToCartAfterLogin = true; closeCheckoutModal(); navigate('#/conta'); return; }
  if (action === 'open-register') { event.preventDefault(); const main = document.getElementById('main-content'); if (main) main.innerHTML = renderRegisterPage(); return; }
  if (action === 'back-to-login') { event.preventDefault(); navigate('#/conta'); return; }
  if (action === 'close-checkout-modal') { closeCheckoutModal(); return; }
  if (action === 'toggle-login-password') {
    const passwordInput = document.getElementById('loginPassword');
    if (passwordInput) passwordInput.type = target.checked ? 'text' : 'password';
    return;
  }
  if (action === 'toggle-mobile-menu') { event.preventDefault(); toggleMobileMenu(); return; }
  if (action === 'stop-propagation') { event.stopPropagation(); return; }
  if (action === 'open-filters') { state.mobileFiltersOpen = true; render(); document.querySelector('.mobile-filter-backdrop')?.classList.add('is-open'); return; }
  if (action === 'close-filters') { state.mobileFiltersOpen = false; render(); return; }
  if (action === 'apply-filters') { state.mobileFiltersOpen = false; render(); return; }
  if (action === 'home-tab') { state.homeTab = target.dataset.tab; render(); return; }
  if (action === 'card-add-cart') { event.preventDefault(); event.stopPropagation(); addToCart(target.dataset.productId); return; }
  if (action === 'change-page') { changePage(target.dataset.page); return; }
  if (action === 'clear-filters') { clearFilters(); return; }
  if (action === 'show-all-products') { state.filters = { categories: [], sizes: [], colors: [], prices: [] }; state.searchTerm = ''; state.page = 1; navigate('#/categoria/todos'); return; }
  if (action === 'change-image') { changeProductImage(target.dataset.imageIndex); return; }
  if (action === 'product-quantity') { state.productQuantity = Math.max(1, state.productQuantity + Number(target.dataset.quantityChange)); const output = document.getElementById('product-quantity-output'); if (output) output.textContent = state.productQuantity; return; }
  if (action === 'detail-add-cart') {
    const item = products.find((entry) => entry.id === target.dataset.productId);
    if (!state.selectedSize) { const error = document.getElementById('product-size-error'); if (error) error.textContent = 'Selecione um tamanho.'; return; }
    addToCart(item.id, state.productQuantity, state.selectedSize, state.selectedColor || item.cores[0]);
    return;
  }
  if (action === 'cart-quantity') {
    const line = getCart().find((entry) => entry.key === target.dataset.key);
    if (line) updateQuantity(line.key, line.quantidade + Number(target.dataset.quantityChange));
    render();
    return;
  }
  if (action === 'remove-cart') { removeFromCart(target.dataset.key); render(); return; }
  if (action === 'logout') { logout(); return; }
}

function handleChange(event) {
  const target = event.target;
  if (target.id === 'sort-select') { state.sort = target.value; state.page = 1; render(); return; }
  if (target.matches('[data-filter-type]')) {
    const type = target.dataset.filterType;
    const values = state.filters[type];
    if (target.checked && !values.includes(target.value)) values.push(target.value);
    if (!target.checked) state.filters[type] = values.filter((value) => value !== target.value);
    state.page = 1;
    render();
    if (state.mobileFiltersOpen) document.querySelector('.mobile-filter-backdrop')?.classList.add('is-open');
    return;
  }
  if (target.matches('[data-product-size]')) { selectSize(target.value); return; }
  if (target.matches('[data-product-color]')) { selectColor(target.value); return; }
  if (target.matches('[data-payment]')) { togglePaymentFields(target.value); return; }
}

function handleInput(event) {
  if (event.target.id !== 'header-search-input') return;
  state.searchTerm = event.target.value;
  const term = state.searchTerm.trim();
  const route = getRoute();
  if (route.name !== 'search') {
    if (term) location.hash = `#/busca/${encodeURIComponent(term)}`;
    else location.hash = '#/home';
    return;
  }
  const catalog = document.querySelector('.catalog-content');
  if (!catalog) {
    render();
    return;
  }
  const filtered = sortProducts(filterProducts(products, state.filters, term, null));
  const perPage = 8;
  state.page = 1;
  const currentItems = filtered.slice(0, perPage);
  const heading = document.querySelector('.category-intro h1');
  if (heading) heading.textContent = term ? `Resultados para: “${term}”` : 'Busca';
  const intro = document.querySelector('.category-intro p');
  if (intro) intro.textContent = `${filtered.length} produto${filtered.length === 1 ? '' : 's'} encontrado${filtered.length === 1 ? '' : 's'}.`;
  const toolbar = catalog.querySelector('.catalog-toolbar');
  if (toolbar) {
    const count = toolbar.querySelector('p');
    if (count) count.textContent = `${filtered.length} produto${filtered.length === 1 ? '' : 's'}`;
  }
  const grid = catalog.querySelector('.catalog-grid');
  const empty = catalog.querySelector('.empty-results');
  if (currentItems.length) {
    if (empty) empty.outerHTML = `<div class="product-grid catalog-grid">${currentItems.map(productCardMarkup).join('')}</div>${paginationMarkup(filtered.length, perPage)}`;
    else if (grid) {
      grid.innerHTML = currentItems.map(productCardMarkup).join('');
      catalog.querySelector('.pagination')?.remove();
      const pagination = paginationMarkup(filtered.length, perPage);
      if (pagination) grid.insertAdjacentHTML('afterend', pagination);
    }
  } else if (grid) {
    catalog.querySelector('.pagination')?.remove();
    grid.outerHTML = `<div class="empty-results"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="11" cy="11" r="6.8"/><path d="m16.2 16.2 4.1 4.1"/></svg><h2>Nenhum produto encontrado</h2><p>Tente buscar por outro nome, categoria ou cor.</p><button class="button" type="button" data-action="show-all-products">Ver todos os produtos</button></div>`;
  } else if (empty) {
    empty.querySelector('h2').textContent = 'Nenhum produto encontrado';
    empty.querySelector('p').textContent = 'Tente buscar por outro nome, categoria ou cor.';
  }
  attachImageFallbacks();
}

function handleSubmit(event) {
  const form = event.target;
  if (form.id === 'header-search-form') {
    event.preventDefault();
    const term = form.elements.q.value.trim();
    navigate(term ? `#/busca/${encodeURIComponent(term)}` : '#/home');
  }
  if (form.id === 'delivery-form') { event.preventDefault(); handleDeliverySubmit(form); }
  if (form.id === 'payment-form') { event.preventDefault(); handlePaymentSubmit(form); }
  if (form.id === 'account-form') { event.preventDefault(); handleAccountSubmit(form); }
  if (form.id === 'login-form') { event.preventDefault(); handleLoginSubmit(form); }
  if (form.id === 'register-form') { event.preventDefault(); handleRegisterSubmit(form); }
}

document.addEventListener('click', handleClick);
document.addEventListener('change', handleChange);
document.addEventListener('input', handleInput);
document.addEventListener('submit', handleSubmit);
window.addEventListener('hashchange', () => {
  state.mobileMenuOpen = false;
  state.page = 1;
  const route = getRoute();
  state.searchTerm = route.name === 'search' ? route.term : '';
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

window.ELORA = { products, addToCart, removeFromCart, updateQuantity, getCart, saveCart, clearCart, searchProducts, normalizeText, filterProducts, clearFilters, changeCategory, changePage, openProduct, changeProductImage, selectSize, selectColor, createOrder, getOrders, updateOrderStatus, saveCustomer, getCustomer };

render();
