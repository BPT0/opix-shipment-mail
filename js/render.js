/* ---------- 렌더링 ---------- */
// 파트: 문자열 또는 {t, miss}
function F(val, label) { return val ? { t: val, miss: false } : { t: '[' + label + ']', miss: true }; }

function render() {
  const method = getRadio('method');
  const itemKey = getRadio('item');
  const item = ITEMS[itemKey];
  const cust = $('cust').value.trim();
  const dept = $('dept').value.trim();
  const ver = $('ver').value;
  const erp = $('erp').value.trim();
  const yy = TAG_YEAR();

  // 배송일자
  const shipSel = $('ship').value;
  $('shipDate').style.display = shipSel === 'date' ? '' : 'none';
  let ship = '';
  const SHIP_LABELS = { today_am: '금일 오전', today_pm: '금일 오후', tom_am: '명일 오전', tom_pm: '명일 오후' };
  ship = SHIP_LABELS[shipSel] || fmtDate($('shipDate').value);

  // 서비스태그 검증
  const { tokens, results } = validateTags($('tags').value, itemKey, yy);
  $('expect').innerHTML = item
    ? `${itemKey} 기번 형식: <code>${item.tag}${yy}${TAG_MID}****</code> (****는 출고 순번)`
    : '출고품목을 선택하면 형식을 검증합니다.';
  $('tagList').innerHTML = results.map(r => {
    const cls = r.ok === true ? 'ok' : r.ok === false ? 'bad' : 'idle';
    return `<div class="chip ${cls}"><span>${esc(r.t)}</span><span>${(r.ok === true ? '✓ ' : r.ok === false ? '✕ ' : '') + esc(r.msg)}</span></div>`;
  }).join('');
  const tagBad = results.filter(r => r.ok === false).length;

  // 제목 / 본문 (파트 배열)
  const subjectParts = ['솔루션 품목 ', F(method, '전달방식'), ' 정보 공유의 건(', F(cust, '고객사명'), ', ', F(dept, '요청 영업 담당자 부서'), ')'];
  const bodyLines = [
    [F(cust, '고객사명'), ' 오픽스 ', F(ver, '오픽스 버전'), ' ', F(item && item.name1, '출고품목'), ' 아래와 같이 ', F(method && METHODS[method], '전달방식'), ' 요청하였습니다.'],
    ['실물은 ', F(ship, '배송일자'), '중에 배송 예정입니다.'],
    ['출고오더 : 확인 부탁드립니다'],
    ['출고품목 : ', F(item && item.code, '출고품목')],
    ['출고기번 : ', F(tokens.join(', '), '서비스태그번호')],
    ['Request Num. : ', F(erp, 'ERP_Request_Num')],
    ['고객사 : ', F(cust, '고객사명')],
  ];
  // 카드리더기 동봉 시 마지막 줄에 추가
  const readerOn = $('readerOn').checked;
  $('readerQtyWrap').style.display = readerOn ? 'flex' : 'none';
  if (readerOn) bodyLines.push(['- 카드리더기 ', $('readerQty').value, '개 동봉 하였습니다.']);

  const toPlain = parts => parts.map(p => typeof p === 'string' ? p : p.t).join('');
  const toHtml = parts => parts.map(p => typeof p === 'string' ? esc(p) : (p.miss ? `<mark>${esc(p.t)}</mark>` : esc(p.t))).join('');

  window.__out = {
    subject: toPlain(subjectParts),
    body: bodyLines.map(toPlain).join('\n'),
  };
  // 수신인 / 참조
  const contract = getRadio('contract');
  const snips = getSnippets();
  const toList = uniqRecipients([
    ...parseRecipients(snips.common).entries,
    ...(contract ? parseRecipients(snips[CONTRACTS[contract]]).entries : []),
  ]);
  const ccList = uniqRecipients(parseRecipients(snips.cc).entries);
  const toStr = joinRecipients(toList), ccStr = joinRecipients(ccList);
  window.__out.to = toStr;
  window.__out.cc = ccStr;
  $('toOut').innerHTML = toStr ? esc(toStr) + `<span class="n">${toList.length}명</span>` : '<mark>[수신인 스니펫 미등록]</mark>';
  $('ccOut').innerHTML = ccStr ? esc(ccStr) + `<span class="n">${ccList.length}명</span>` : '<span class="n" style="margin-left:0">등록된 참조인 없음</span>';
  let hint = '계약 방식 미선택 · 공통 수신인만 표시';
  if (contract) {
    const extra = parseRecipients(snips[CONTRACTS[contract]]).entries.length;
    hint = extra ? `공통 + ${contract} 수신인` : `${contract} 추가 수신인이 아직 등록되지 않았어요`;
  }
  $('rcptHint').textContent = hint;
  $('subjectOut').innerHTML = toHtml(subjectParts);
  $('bodyOut').innerHTML = bodyLines.map(toHtml).join('\n');

  // 상태 배지
  const missing = new Set();
  [subjectParts, ...bodyLines].forEach(l => l.forEach(p => { if (typeof p !== 'string' && p.miss) missing.add(p.t); }));
  if (!contract) missing.add('계약 방식');
  const st = [];
  if (missing.size) st.push(`<span class="badge warn">미입력 ${missing.size}개</span>`);
  if (tagBad) st.push(`<span class="badge bad">기번 오류 ${tagBad}건</span>`);
  if (!missing.size && !tagBad) st.push('<span class="badge ok">복사 준비 완료</span>');
  $('status').innerHTML = st.join('');
}
