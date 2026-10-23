// <pure>
function extractDept(raw) {
  raw = (raw || '').trim();
  if (!raw) return '';
  const m = raw.match(/\(([^()]*)\)?/);
  const inner = (m ? m[1] : raw.replace(/<[^>]*>/g, '').replace(/["'“”]/g, '')).trim();
  if (!inner) return '';
  const tk = inner.split(/\s+/);
  let last = -1;
  tk.forEach((t, i) => { if (/[부국]$/.test(t)) last = i; });
  return last >= 0 ? tk.slice(0, last + 1).join(' ') : inner;
}

function validateTags(raw, itemKey, yy) {
  const tokens = (raw || '').split(/[\s,;]+/).filter(Boolean);
  const item = ITEMS[itemKey];
  const seen = new Set();
  const results = tokens.map(t => {
    if (seen.has(t)) return { t, ok: false, msg: '중복 입력' };
    seen.add(t);
    if (!/^\d+$/.test(t)) return { t, ok: false, msg: '숫자 12자리만 가능' };
    if (t.length !== 12) return { t, ok: false, msg: t.length + '자리 (12자리 필요)' };
    if (!item) return { t, ok: null, msg: '품목 선택 후 검증' };
    const first4 = t.slice(0, 4);
    if (first4 !== item.tag) {
      const other = Object.keys(ITEMS).find(k => ITEMS[k].tag === first4);
      return { t, ok: false, msg: other ? other + ' 기번입니다 (선택: ' + itemKey + ')' : '품목구분 ' + first4 + ' ≠ ' + item.tag };
    }
    if (t.slice(4, 6) !== yy) return { t, ok: false, msg: '연도 ' + t.slice(4, 6) + ' ≠ ' + yy };
    if (t.slice(6, 8) !== TAG_MID) return { t, ok: false, msg: '7~8번째 자리 ' + t.slice(6, 8) + ' ≠ ' + TAG_MID };
    return { t, ok: true, msg: '형식 일치' };
  });
  return { tokens, results };
}

function fmtDate(v) {
  if (!v) return '';
  const d = new Date(v + 'T00:00:00');
  return (d.getMonth() + 1) + '월 ' + d.getDate() + '일(' + '일월화수목금토'[d.getDay()] + ')';
}
// 'YYYY-MM-DD'가 오늘(로컬 기준) 이전 날짜인지. 오늘은 과거가 아니다.
function isPastDate(v, now = new Date()) {
  if (!v) return false;
  const d = new Date(v + 'T00:00:00');
  if (isNaN(d)) return false;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return d < today;
}
// 수신인 목록 파싱: 세미콜론/줄바꿈 구분, 이메일 기준 중복 제거
function parseRecipients(raw) {
  const entries = [], bad = [], seen = new Set();
  String(raw || '').split(/[;\n\r]+/).forEach(piece => {
    const p = piece.trim();
    if (!p) return;
    let name = '', email = '', m;
    if ((m = p.match(/^"?([^"<>]*?)"?\s*<([^<>\s]+@[^<>\s]+)>"?$/))) { name = m[1].trim(); email = m[2]; }
    else if (/^[^<>"\s@]+@[^<>"\s]+$/.test(p)) { email = p; }
    else { bad.push(p); return; }
    const key = email.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    entries.push({ name, email });
  });
  return { entries, bad };
}
function uniqRecipients(list) {
  const seen = new Set();
  return list.filter(e => { const k = e.email.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; });
}
function joinRecipients(list) {
  if (!list.length) return '';
  const f = e => !e.name ? e.email : (WRAP_WHOLE ? `"${e.name} <${e.email}>"` : `"${e.name}" <${e.email}>`);
  return list.map(f).join('; ') + ';';
}
// </pure>
