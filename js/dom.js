const $ = id => document.getElementById(id);
const esc = s => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const getRadio = name => (document.querySelector(`input[name=${name}]:checked`) || {}).value || '';

function buildSeg(containerId, name, keys) {
  $(containerId).innerHTML = keys.map((k, i) =>
    `<input type="radio" name="${name}" id="${name}_${i}" value="${k}"><label for="${name}_${i}">${k}</label>`
  ).join('');
}

/* ---------- 클립보드 · 토스트 ---------- */
let toastTimer;
function toast(msg) {
  const t = $('toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}

async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true; }
  catch (e) {
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    let ok = false; try { ok = document.execCommand('copy'); } catch (e2) {}
    document.body.removeChild(ta); return ok;
  }
}
