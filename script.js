emailjs.init('YAUSm7-qqYnzkEonD');

// ── TABELA DE PREÇOS ───────────────────────────────────────────
const PRECOS = {
  tamanho: {
    '15cm': 38,
    '20cm': 60,
    '25cm': 75,
  },
  recheio_extra: {
    'Brigadeiro de pistache': { tipo: 'percentagem', valor: 10 },
  },
  cobertura_extra: {
    'Brigadeiro': { tipo: 'percentagem', valor: 10 },
  },
  topo_extra: {
    'Flores':          { tipo: 'fixo', valor: 10 },
    'Topos de papel':  { tipo: 'fixo', valor: 4  },
    'Brigadeiros':     { tipo: 'percentagem', valor: 5 },
    'Trabalho de bico':{ tipo: 'orcamento' },
  },
};

// ── RECHEIOS COM SUB-SABORES ───────────────────────────────────
const subSabores = {
  brigadeiro: ['Brigadeiro branco', 'Brigadeiro preto', 'Brigadeiro de pistache'],
  ganache:    ['Ganache branca', 'Ganache ao leite', 'Ganache preta'],
  geleia:     ['Geléia de morango', 'Geléia de framboesa', 'Geléia de maracujá'],
};

// ── CALCULAR PREÇO ─────────────────────────────────────────────
function arredondar(val) {
  return Math.round(val * 100) / 100;
}

function calcularPreco(tamanho, subRecheio, cobertura, topo) {
  const linhas = [];
  let total = 0;

  const base = PRECOS.tamanho[tamanho] || 0;
  if (base > 0) {
    total += base;
    linhas.push({ label: `Bolo ${tamanho} — massa + recheio + prato e caixa`, valor: base });
  }

  if (subRecheio && PRECOS.recheio_extra[subRecheio]) {
    const extra = PRECOS.recheio_extra[subRecheio];
    if (extra.tipo === 'percentagem') {
      const val = arredondar(total * extra.valor / 100);
      total += val;
      linhas.push({ label: `Recheio premium: ${subRecheio} (+${extra.valor}%)`, valor: val });
    }
  }

  if (cobertura && PRECOS.cobertura_extra[cobertura]) {
    const extra = PRECOS.cobertura_extra[cobertura];
    if (extra.tipo === 'percentagem') {
      const val = arredondar(total * extra.valor / 100);
      total += val;
      linhas.push({ label: `Cobertura premium: ${cobertura} (+${extra.valor}%)`, valor: val });
    }
  }

  if (topo && PRECOS.topo_extra[topo]) {
    const extra = PRECOS.topo_extra[topo];
    if (extra.tipo === 'fixo') {
      total += extra.valor;
      linhas.push({ label: `Decoração: ${topo}`, valor: extra.valor });
    } else if (extra.tipo === 'percentagem') {
      const val = arredondar(total * extra.valor / 100);
      total += val;
      linhas.push({ label: `Decoração premium: ${topo} (+${extra.valor}%)`, valor: val });
    } else if (extra.tipo === 'orcamento') {
      linhas.push({ label: `Decoração: ${topo}`, valor: null });
    }
  }

  return { linhas, total: arredondar(total) };
}

// ── ATUALIZAR SUB-RECHEIO ──────────────────────────────────────
function atualizarSubRecheio() {
  const recheio = document.getElementById('recheio').value;
  const wrap    = document.getElementById('wrap-subrecheio');
  const sub     = document.getElementById('subrecheio');
  if (recheio && subSabores[recheio]) {
    sub.innerHTML = subSabores[recheio].map(s => `<option>${s}</option>`).join('');
    wrap.style.display = '';
  } else {
    wrap.style.display = 'none';
    sub.innerHTML = '';
  }
  atualizarResumo();
}

// ── ATUALIZAR RESUMO + PREÇO ───────────────────────────────────
function atualizarResumo() {
  const massa     = document.getElementById('massa').value;
  const recheio   = document.getElementById('recheio').value;
  const sub       = document.getElementById('subrecheio').value;
  const cobertura = document.getElementById('cobertura').value;
  const topo      = document.getElementById('topo').value;
  const tamanho   = document.getElementById('tamanho').value;

  const elResumo = document.getElementById('resumo-bolo');
  const elPreco  = document.getElementById('resumo-preco');

  if (!massa && !recheio && !cobertura && !topo && !tamanho) {
    elResumo.textContent = 'Ainda sem escolhas feitas...';
    if (elPreco) elPreco.innerHTML = '';
    return;
  }

  const recheioLabel = sub ? `${recheio} (${sub})` : recheio;
  const partes = [];
  if (tamanho)   partes.push(`${tamanho}`);
  if (massa)     partes.push(`massa de ${massa.toLowerCase()}`);
  if (recheio)   partes.push(`recheio de ${recheioLabel.toLowerCase()}`);
  if (cobertura) partes.push(`cobertura de ${cobertura.toLowerCase()}`);
  if (topo)      partes.push(`topo de ${topo.toLowerCase()}`);
  elResumo.textContent = 'Bolo ' + partes.join(', com ') + '.';

  if (!elPreco) return;
  if (!tamanho) {
    elPreco.innerHTML = '<p style="color:#9c8260;font-style:italic;font-size:0.88rem;">Escolhe o tamanho para ver o preço.</p>';
    return;
  }

  const { linhas, total } = calcularPreco(tamanho, sub, cobertura, topo);
  const temOrcamento = linhas.some(l => l.valor === null);

  let html = '<ul class="preco-lista">';
  linhas.forEach(l => {
    if (l.valor === null) {
      html += `<li><span class="preco-item-label">${l.label}</span><span class="preco-item-val preco-orcamento">orçamento à parte</span></li>`;
    } else {
      html += `<li><span class="preco-item-label">${l.label}</span><span class="preco-item-val">${l.valor.toFixed(2)} €</span></li>`;
    }
  });
  html += '</ul>';

  if (temOrcamento) {
    html += `<div class="preco-total">Subtotal: <strong>${total.toFixed(2)} €</strong> <span style="font-size:0.8rem;font-weight:400;">+ trabalho de bico (orçamento)</span></div>`;
  } else {
    html += `<div class="preco-total">Total estimado: <strong>${total.toFixed(2)} €</strong></div>`;
  }

  elPreco.innerHTML = html;
}

// ── RECOLHER DADOS ─────────────────────────────────────────────
function recolherDados() {
  return {
    nome:      document.getElementById('nome').value.trim(),
    contato:   document.getElementById('contato').value.trim(),
    massa:     document.getElementById('massa').value,
    recheio:   document.getElementById('recheio').value,
    sub:       document.getElementById('subrecheio').value,
    cobertura: document.getElementById('cobertura').value,
    topo:      document.getElementById('topo').value,
    tamanho:   document.getElementById('tamanho').value,
    obs:       document.getElementById('obs').value.trim(),
  };
}

function validar(d) {
  if (!d.nome || !d.contato) {
    alert('Por favor, preenche o nome e o contacto antes de enviar.');
    return false;
  }
  if (!d.massa || !d.recheio || !d.cobertura || !d.tamanho) {
    alert('Por favor, escolhe a massa, o recheio, a cobertura e o tamanho.');
    return false;
  }
  return true;
}

function mostrarFeedback(ok, texto) {
  const el = document.getElementById('msg-feedback');
  el.style.display = 'block';
  el.style.background = ok ? '#e8f5e9' : '#fce8e8';
  el.style.color = ok ? '#2e7d32' : '#b71c1c';
  el.textContent = texto;
}

// ── ENVIAR EMAIL ───────────────────────────────────────────────
async function enviarAmbos() {
  const d = recolherDados();
  if (!validar(d)) return;

  const recheioLabel = d.sub ? `${d.recheio} (${d.sub})` : d.recheio;
  const { linhas, total } = calcularPreco(d.tamanho, d.sub, d.cobertura, d.topo);
  const temOrcamento = linhas.some(l => l.valor === null);

  let precoResumo = linhas.map(l =>
    l.valor === null ? `${l.label}: orçamento à parte` : `${l.label}: ${l.valor.toFixed(2)} €`
  ).join('\n');
  precoResumo += temOrcamento
    ? `\nSubtotal: ${total.toFixed(2)} € + trabalho de bico (orçamento)`
    : `\nTotal estimado: ${total.toFixed(2)} €`;

  const btn = document.getElementById('btn-enviar');
  btn.disabled = true;
  btn.textContent = 'A enviar...';

  try {
    await emailjs.send('service_hn332p8', 'template_281fucc', {
      nome:         d.nome,
      contato:      d.contato,
      tamanho:      d.tamanho,
      massa:        d.massa,
      recheio:      recheioLabel,
      cobertura:    d.cobertura,
      topo:         d.topo || 'Sem decoração de topo',
      obs:          d.obs  || 'Nenhuma',
      preco_resumo: precoResumo,
      imagem1:      imagensBase64[0] || '',
      imagem2:      imagensBase64[1] || '',
    });
    mostrarFeedback(true, '✅ Encomenda enviada com sucesso! Entraremos em contacto em breve.');
  } catch (err) {
    console.error('EmailJS error:', err);
    mostrarFeedback(false, '⚠️ Erro ao enviar. Por favor tenta novamente.');
  }

  btn.disabled = false;
  btn.textContent = 'Efetuar pedido';
}

// ── IMAGENS ────────────────────────────────────────────────────
let imagensBase64 = [];

function comprimirImagem(file, maxKB = 20) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width, h = img.height;
        const maxDim = 800;
        if (w > maxDim || h > maxDim) {
          if (w > h) { h = Math.round(h * maxDim / w); w = maxDim; }
          else       { w = Math.round(w * maxDim / h); h = maxDim; }
        }
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        let quality = 0.8;
        let result = canvas.toDataURL('image/jpeg', quality);
        while (result.length > maxKB * 1024 * 1.37 && quality > 0.1) {
          quality -= 0.05;
          result = canvas.toDataURL('image/jpeg', quality);
        }
        resolve(result);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

async function handleImagens(event) {
  const files  = Array.from(event.target.files);
  const erroEl = document.getElementById('img-erro');
  erroEl.style.display = 'none';

  if (files.length > 2) {
    erroEl.textContent = 'Podes enviar no máximo 2 imagens.';
    erroEl.style.display = 'block';
    event.target.value = '';
    return;
  }
  const invalidas = files.filter(f => f.size > 20 * 1024 * 1024);
  if (invalidas.length > 0) {
    erroEl.textContent = 'Cada imagem deve ter no máximo 20MB.';
    erroEl.style.display = 'block';
    event.target.value = '';
    return;
  }

  imagensBase64 = [];
  const container   = document.getElementById('preview-container');
  const placeholder = document.getElementById('upload-placeholder');
  const area        = document.getElementById('upload-area');
  container.innerHTML = '';

  if (files.length === 0) {
    container.style.display = 'none';
    placeholder.style.display = 'block';
    area.classList.remove('has-files');
    return;
  }

  container.style.display = 'flex';
  placeholder.style.display = 'none';
  area.classList.add('has-files');
  container.innerHTML = '<div style="color:#9c8260;font-size:0.9rem;padding:1rem;">A comprimir imagens...</div>';

  const comprimidas = await Promise.all(files.map(f => comprimirImagem(f, 20)));
  container.innerHTML = '';

  comprimidas.forEach((base64, index) => {
    imagensBase64[index] = base64;
    const kb   = Math.round(base64.length * 0.75 / 1024);
    const wrap = document.createElement('div');
    wrap.className = 'preview-img-wrap';
    wrap.innerHTML = `
      <img src="${base64}" alt="Referência ${index + 1}" />
      <div style="font-size:0.72rem;color:#9c8260;text-align:center;margin-top:4px;">~${kb} KB</div>
      <button class="remove-btn" onclick="removerImagem(${index}, event)" title="Remover">✕</button>
    `;
    container.appendChild(wrap);
  });
}

function removerImagem(index, event) {
  event.stopPropagation();
  imagensBase64.splice(index, 1);
  document.getElementById('imagens').value = '';

  const container   = document.getElementById('preview-container');
  const placeholder = document.getElementById('upload-placeholder');
  const area        = document.getElementById('upload-area');

  if (imagensBase64.length === 0) {
    container.style.display = 'none';
    container.innerHTML = '';
    placeholder.style.display = 'block';
    area.classList.remove('has-files');
  } else {
    container.querySelectorAll('.preview-img-wrap')[index].remove();
    container.querySelectorAll('.remove-btn').forEach((btn, i) => {
      btn.setAttribute('onclick', `removerImagem(${i}, event)`);
    });
  }
}
