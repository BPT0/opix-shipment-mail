/* ---------- 오픽스 버전 (이 브라우저 localStorage에 저장) ---------- */
function loadExtraVersions() {
  try { return JSON.parse(localStorage.getItem('opix_versions') || '[]'); } catch (e) { return []; }
}
function loadVersions() {
  return [...new Set([...BASE_VERSIONS, ...loadExtraVersions()])];
}

/* ---------- 수신인·참조인 스니펫 (이 브라우저 localStorage에 저장) ---------- */
const SNIP_KEY = 'opix_snippets_v1';
const SNIP_TS_KEY = 'opix_snippets_ts'; // 마지막 수정 시각(ms) — 저장 파일과 비교해 더 최신 쪽을 쓴다
let snipMem = null, snipTs = null, snipWarned = false;
function getSnippets() {
  if (snipMem) return snipMem;
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(SNIP_KEY) || '{}') || {}; } catch (e) {}
  snipMem = Object.assign({}, DEFAULT_SNIPPETS, saved);
  return snipMem;
}
function getSnippetsTs() {
  if (snipTs === null) {
    snipTs = 0;
    try { snipTs = Number(localStorage.getItem(SNIP_TS_KEY)) || 0; } catch (e) {}
  }
  return snipTs;
}
function persistSnippetsLocal() {
  try {
    localStorage.setItem(SNIP_KEY, JSON.stringify(getSnippets()));
    localStorage.setItem(SNIP_TS_KEY, String(getSnippetsTs()));
    return true;
  } catch (e) {
    if (!snipWarned) { snipWarned = true; toast('이 브라우저에는 저장되지 않아요. "자동 저장 파일"을 연결하거나 "스니펫 내보내기"로 백업해 주세요.'); }
    return false;
  }
}
// 화면에서 수정했을 때: 브라우저 저장 + (연결돼 있으면) 파일 저장
function saveSnippets() {
  snipTs = Date.now();
  queueFileSave();
  return persistSnippetsLocal();
}
