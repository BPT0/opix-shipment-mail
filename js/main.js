/* ---------- 초기 UI 구성 ---------- */
buildSeg('methodSeg', 'method', Object.keys(METHODS));
buildSeg('itemSeg', 'item', Object.keys(ITEMS));
buildSeg('contractSeg', 'contract', Object.keys(CONTRACTS));
$('readerQty').innerHTML = Array.from({ length: 10 }, (_, i) => `<option value="${i + 1}">${i + 1}</option>`).join('');

function fillVersions(selected) {
  const vs = loadVersions();
  $('ver').innerHTML = vs.map(v => `<option value="${v}">${v}</option>`).join('');
  $('ver').value = vs.includes(selected) ? selected : DEFAULT_VERSION;
}
fillVersions(DEFAULT_VERSION);

$('addVer').onclick = () => {
  const v = (prompt('추가할 오픽스 버전을 입력하세요 (예: 3.2)') || '').trim();
  if (!v) return;
  const extra = loadExtraVersions();
  if (!extra.includes(v) && !BASE_VERSIONS.includes(v)) extra.push(v);
  try { localStorage.setItem('opix_versions', JSON.stringify(extra)); } catch (e) { toast('이 브라우저에는 저장되지 않아요 (이번 화면에서만 유지)'); }
  fillVersions(v); render();
};

/* ---------- 이벤트 ---------- */
document.querySelectorAll('input, select, textarea').forEach(el => el.addEventListener('input', render));
$('sales').addEventListener('input', () => { $('dept').value = extractDept($('sales').value); render(); });

document.querySelectorAll('[data-copy]').forEach(btn => {
  const orig = btn.textContent;
  btn.onclick = async () => {
    const val = window.__out[btn.dataset.copy];
    if (!val) { toast('복사할 내용이 없어요. 스니펫을 먼저 등록해 주세요.'); return; }
    const ok = await copyText(val);
    if (ok) {
      btn.textContent = '복사됨 ✓'; btn.classList.add('done');
      setTimeout(() => { btn.textContent = orig; btn.classList.remove('done'); }, 1500);
    } else toast('복사에 실패했어요. 내용을 직접 선택해서 복사해 주세요.');
  };
});

document.querySelectorAll('[data-paste]').forEach(btn => {
  btn.onclick = async () => {
    const el = $(btn.dataset.paste);
    try {
      const txt = await navigator.clipboard.readText();
      if (!txt.trim()) { toast('클립보드가 비어 있어요.'); return; }
      el.value = el.tagName === 'TEXTAREA' ? txt.trim() : txt.trim().replace(/\s*\n\s*/g, ' ');
      el.dispatchEvent(new Event('input', { bubbles: true }));
      toast('붙여넣었습니다.');
    } catch (e) {
      toast('클립보드 읽기 권한이 필요해요. 권한을 허용하거나 입력창에서 Ctrl+V를 사용해 주세요.');
    }
  };
});

$('reset').onclick = () => {
  ['cust', 'sales', 'dept', 'tags', 'erp', 'shipDate'].forEach(id => $(id).value = '');
  document.querySelectorAll('input[type=radio], input[type=checkbox]').forEach(r => r.checked = false);
  $('readerQty').value = '1';
  $('ship').value = 'tom_am'; $('ver').value = DEFAULT_VERSION;
  render();
};

// 스니펫 입력창은 위의 공통 input 이벤트 연결 이후에 만들어지므로(자체적으로 render 호출) 순서를 유지한다.
initSnippets();
render();

// 저장소를 "영구 저장"으로 요청(허용되면 브라우저가 임의로 비우지 않음) + 연결된 저장 파일에서 복원
try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) {}
initFileSync();
