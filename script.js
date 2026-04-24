<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>

    emailjs.init('YAUSm7-qqYnzkEonD');

    const subSabores = {
      brigadeiro: ['Brigadeiro branco', 'Brigadeiro preto', 'Brigadeiro de pistache'],
      ganache:    ['Ganache branca', 'Ganache ao leite', 'Ganache preta'],
      geleia:     ['Geléia de morango', 'Geléia de framboesa', 'Geléia de maracujá'],
    };

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
    }

    function atualizarResumo() {
      const massa     = document.getElementById('massa').value;
      const recheio   = document.getElementById('recheio').value;
      const sub       = document.getElementById('subrecheio').value;
      const cobertura = document.getElementById('cobertura').value;
      const topo      = document.getElementById('topo').value;
      const tamanho   = document.getElementById('tamanho').value;
      const el        = document.getElementById('resumo-bolo');

      if (!massa && !recheio && !cobertura && !topo && !tamanho) {
        el.textContent = 'Ainda sem escolhas feitas...';
        return;
      }
      const recheioLabel = sub ? `${recheio} (${sub})` : recheio;
      const partes = [];
      if (tamanho)   partes.push(`${tamanho}`);
      if (massa)     partes.push(`massa de ${massa.toLowerCase()}`);
      if (recheio)   partes.push(`recheio de ${recheioLabel.toLowerCase()}`);
      if (cobertura) partes.push(`cobertura de ${cobertura.toLowerCase()}`);
      if (topo)      partes.push(`topo de ${topo.toLowerCase()}`);
      el.textContent = 'Bolo ' + partes.join(', com ') + '.';
    }

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

    async function enviarAmbos() {
      const d = recolherDados();
      if (!validar(d)) return;

      const recheioLabel = d.sub ? `${d.recheio} (${d.sub})` : d.recheio;
      const btn = document.getElementById('btn-enviar');
      btn.disabled = true;
      btn.textContent = 'A enviar...';

      // 1. Enviar email via EmailJS
      try {
        await emailjs.send('service_hn332p8', 'template_281fucc', {
          nome:      d.nome,
          contato:   d.contato,
          tamanho:   d.tamanho,
          massa:     d.massa,
          recheio:   recheioLabel,
          cobertura: d.cobertura,
          topo:      d.topo || 'Sem decoração de topo',
          obs:       d.obs  || 'Nenhuma',
          imagem1:   imagensBase64[0] || '',
          imagem2:   imagensBase64[1] || '',
        });
        mostrarFeedback(true, '✅ Email enviado com sucesso!');
      } catch (err) {
        mostrarFeedback(false, '⚠️ Erro ao enviar email. Tenta novamente.');
        btn.disabled = false;
        btn.textContent = 'Enviar encomenda por Email';
        return;
      }

      // 2. Abrir WhatsApp
      let msg  = `🎂 *Nova Encomenda de Bolo*\n\n`;
      msg     += `👤 *Cliente:* ${d.nome}\n`;
      msg     += `📞 *Contacto:* ${d.contato}\n\n`;
      msg     += `🍰 *Bolo:*\n`;
      msg     += `   • Tamanho: ${d.tamanho}\n`;
      msg     += `   • Massa: ${d.massa}\n`;
      msg     += `   • Recheio: ${recheioLabel}\n`;
      msg     += `   • Cobertura: ${d.cobertura}\n`;
      if (d.topo) msg += `   • Topo: ${d.topo}\n`;
      if (d.obs)  msg += `\n📝 *Observações:* ${d.obs}`;

      const url = `https://wa.me/351938097627?text=${encodeURIComponent(msg)}`;
      window.open(url, '_blank');

      btn.disabled = false;
      btn.textContent = 'Enviar encomenda por Email';
    }
    let imagensBase64 = [];

    // Comprime imagem para no máximo maxKB kilobytes
    function comprimirImagem(file, maxKB = 20) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            // Redimensiona mantendo proporção, máx 800px
            let w = img.width, h = img.height;
            const maxDim = 800;
            if (w > maxDim || h > maxDim) {
              if (w > h) { h = Math.round(h * maxDim / w); w = maxDim; }
              else       { w = Math.round(w * maxDim / h); h = maxDim; }
            }
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, w, h);

            // Reduz qualidade progressivamente até caber em maxKB
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
      const files = Array.from(event.target.files);
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
      const container = document.getElementById('preview-container');
      const placeholder = document.getElementById('upload-placeholder');
      const area = document.getElementById('upload-area');
      container.innerHTML = '';

      if (files.length === 0) {
        container.style.display = 'none';
        placeholder.style.display = 'block';
        area.classList.remove('has-files');
        return;
      }

      // Mostrar estado de carregamento
      container.style.display = 'flex';
      placeholder.style.display = 'none';
      area.classList.add('has-files');
      container.innerHTML = '<div style="color:#9c6070; font-size:0.9rem; padding:1rem;">A comprimir imagens...</div>';

      // Comprimir todas em paralelo
      const comprimidas = await Promise.all(files.map(f => comprimirImagem(f, 20)));

      container.innerHTML = '';
      comprimidas.forEach((base64, index) => {
        imagensBase64[index] = base64;

        // Calcular tamanho aproximado em KB
        const kb = Math.round(base64.length * 0.75 / 1024);

        const wrap = document.createElement('div');
        wrap.className = 'preview-img-wrap';
        wrap.innerHTML = `
          <img src="${base64}" alt="Referência ${index + 1}" />
          <div style="font-size:0.72rem; color:#9c6070; text-align:center; margin-top:4px;">~${kb} KB</div>
          <button class="remove-btn" onclick="removerImagem(${index}, event)" title="Remover">✕</button>
        `;
        container.appendChild(wrap);
      });
    }

    function removerImagem(index, event) {
      event.stopPropagation();
      imagensBase64.splice(index, 1);
      document.getElementById('imagens').value = '';

      const container = document.getElementById('preview-container');
      const placeholder = document.getElementById('upload-placeholder');
      const area = document.getElementById('upload-area');

      if (imagensBase64.length === 0) {
        container.style.display = 'none';
        container.innerHTML = '';
        placeholder.style.display = 'block';
        area.classList.remove('has-files');
      } else {
        const wraps = container.querySelectorAll('.preview-img-wrap');
        wraps[index].remove();
        // reindexar botões
        container.querySelectorAll('.remove-btn').forEach((btn, i) => {
          btn.setAttribute('onclick', `removerImagem(${i}, event)`);
        });
      }
    }