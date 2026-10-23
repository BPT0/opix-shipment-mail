/* ---------- 오픽스 버전 (이 브라우저 localStorage에 저장) ---------- */
function loadExtraVersions() {
  try { return JSON.parse(localStorage.getItem('opix_versions') || '[]'); } catch (e) { return []; }
}
function loadVersions() {
  return [...new Set([...BASE_VERSIONS, ...loadExtraVersions()])];
}

/* ---------- 수신인·참조인 스니펫 (이 브라우저 localStorage에 저장) ---------- */
const SNIP_KEY = 'opix_snippets_v1';
let snipMem = null, snipWarned = false;
function getSnippets() {
  if (snipMem) return snipMem;
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(SNIP_KEY) || '{}') || {}; } catch (e) {}
  snipMem = Object.assign({}, DEFAULT_SNIPPETS, saved);
  return snipMem;
}
function saveSnippets() {
  try { localStorage.setItem(SNIP_KEY, JSON.stringify(getSnippets())); return true; }
  catch (e) {
    if (!snipWarned) { snipWarned = true; toast('이 브라우저에는 저장되지 않아요. "스니펫 내보내기"로 따로 백업해 주세요.'); }
    return false;
  }
}
