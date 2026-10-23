/* ---------- 수신인·참조인 스니펫 등록 화면 ---------- */
function syncSnipInputs() {
  document.querySelectorAll('[data-snip]').forEach(ta => { ta.value = getSnippets()[ta.dataset.snip] || ''; });
}
function refreshSnipCounts() {
  SNIP_GROUPS.forEach(g => {
    const { entries, bad } = parseRecipients(getSnippets()[g.key]);
    const cnt = $('cnt_' + g.key), err = $('err_' + g.key);
    if (bad.length) { cnt.className = 'cnt bad'; cnt.textContent = `${entries.length}명 인식 · 오류 ${bad.length}건`; }
    else if (entries.length) { cnt.className = 'cnt ok'; cnt.textContent = `${entries.length}명 등록됨`; }
    else { cnt.className = 'cnt'; cnt.textContent = '미등록'; }
    err.textContent = bad.length ? '인식하지 못한 항목: ' + bad.slice(0, 2).join(' / ') + (bad.length > 2 ? ' 외 ' + (bad.length - 2) + '건' : '') : '';
  });
}

function initSnippets() {
  $('snipBox').innerHTML = SNIP_GROUPS.map(g =>
    `<div class="field"><div class="sl"><label for="sn_${g.key}">${g.label}</label><span class="cnt" id="cnt_${g.key}"></span></div>` +
    `<textarea id="sn_${g.key}" data-snip="${g.key}" spellcheck="false" placeholder='"홍길동(**부 **팀) <hogkil@example.com>"; "김영희(**부 **팀) <younghee@example.com>";'></textarea>` +
    `<div class="err" id="err_${g.key}"></div></div>`
  ).join('');

  document.querySelectorAll('[data-snip]').forEach(ta => {
    ta.addEventListener('input', () => {
      getSnippets()[ta.dataset.snip] = ta.value;
      saveSnippets(); refreshSnipCounts(); render();
    });
  });
  $('snipExport').onclick = async () => {
    const ok = await copyText(JSON.stringify(getSnippets()));
    toast(ok ? '스니펫을 복사했어요. 메모장 등에 붙여넣어 백업하세요.' : '복사에 실패했어요.');
  };
  $('snipImport').onclick = () => {
    const txt = (prompt('내보낸 스니펫 내용을 붙여넣으세요') || '').trim();
    if (!txt) return;
    try {
      const o = JSON.parse(txt);
      SNIP_GROUPS.forEach(g => { if (typeof o[g.key] === 'string') getSnippets()[g.key] = o[g.key]; });
      saveSnippets(); syncSnipInputs(); refreshSnipCounts(); render(); toast('불러왔습니다.');
    } catch (e) { toast('형식이 올바르지 않아요.'); }
  };
  syncSnipInputs(); refreshSnipCounts();
}
