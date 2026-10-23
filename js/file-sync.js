/* ---------- 스니펫 파일 자동 저장 (File System Access API · Chrome/Edge) ----------
   브라우저 저장소(localStorage)는 "종료 시 사이트 데이터 삭제" 설정, 시크릿 창, 파일 경로 변경 등으로
   비워질 수 있다. JSON 파일 하나를 연결해 두면 수정할 때마다 그 파일에도 저장하고,
   다음 실행 때 파일에서 복원한다. 연결한 파일 핸들은 IndexedDB에 보관한다. */
const FS_SUPPORTED = 'showSaveFilePicker' in window && 'showOpenFilePicker' in window;
const FS_PICK_OPTS = {
  suggestedName: 'opix-snippets.json',
  types: [{ description: '스니펫 백업(JSON)', accept: { 'application/json': ['.json'] } }],
};
let fileHandle = null, fileSaveTimer = null, fileStateKind = 'off';

function idbOpen() {
  return new Promise((res, rej) => {
    const r = indexedDB.open('opix_sync', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('kv');
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}
async function idbGet(key) {
  const db = await idbOpen();
  return new Promise((res, rej) => {
    const q = db.transaction('kv').objectStore('kv').get(key);
    q.onsuccess = () => res(q.result);
    q.onerror = () => rej(q.error);
  });
}
async function idbSet(key, val) {
  const db = await idbOpen();
  return new Promise((res, rej) => {
    const tx = db.transaction('kv', 'readwrite');
    if (val === undefined) tx.objectStore('kv').delete(key); else tx.objectStore('kv').put(val, key);
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  });
}

function setFileState(kind) {
  fileStateKind = kind;
  const name = fileHandle ? fileHandle.name : '';
  const MAP = {
    unsupported: ['', '이 브라우저는 파일 자동 저장을 지원하지 않아요 (Chrome·Edge에서 사용 가능). 브라우저 저장만 사용 중입니다.'],
    off:  ['', '파일 저장 안 함 · 브라우저 저장만 사용 중'],
    ok:   ['ok', `파일 자동 저장 중: ${name}`],
    need: ['bad', `"${name}" 접근 권한이 필요해요. 위 버튼을 눌러 허용해 주세요.`],
    err:  ['bad', `"${name}" 저장에 실패했어요. 다시 연결해 주세요.`],
  };
  const [cls, text] = MAP[kind];
  const el = $('snipFileState');
  el.className = 'snip-file-state ' + cls;
  el.textContent = text;
  $('snipFileBtn').style.display = FS_SUPPORTED ? '' : 'none';
  $('snipFileBtn').textContent = !fileHandle ? '자동 저장 파일 연결' : kind === 'need' || kind === 'err' ? '저장 파일 다시 연결' : '다른 파일로 변경';
  $('snipFileOff').style.display = fileHandle ? '' : 'none';
}

async function hasFilePermission(ask) {
  const mode = { mode: 'readwrite' };
  if (await fileHandle.queryPermission(mode) === 'granted') return true;
  return ask && await fileHandle.requestPermission(mode) === 'granted'; // 요청은 클릭 같은 사용자 동작 안에서만 가능
}

async function writeSnipFile() {
  if (!fileHandle) return false;
  try {
    if (!await hasFilePermission(false)) { setFileState('need'); return false; }
    const w = await fileHandle.createWritable();
    await w.write(JSON.stringify(Object.assign({}, getSnippets(), { _updatedAt: getSnippetsTs() }), null, 2));
    await w.close();
    setFileState('ok');
    return true;
  } catch (e) { setFileState('err'); return false; }
}
function queueFileSave() {
  if (!fileHandle) return;
  clearTimeout(fileSaveTimer);
  fileSaveTimer = setTimeout(writeSnipFile, 300);
}

async function readSnipFile() {
  try {
    const txt = await (await fileHandle.getFile()).text();
    return txt.trim() ? JSON.parse(txt) : null;
  } catch (e) { return null; }
}
const snipHasContent = o => SNIP_GROUPS.some(g => typeof o[g.key] === 'string' && o[g.key].trim());

// 파일과 브라우저 저장본 중 더 최신(또는 내용이 있는 쪽)을 기준으로 맞춘다
async function syncWithFile() {
  const data = await readSnipFile();
  const fileTs = data ? Number(data._updatedAt) || 0 : 0;
  const localEmpty = !snipHasContent(getSnippets());
  if (data && snipHasContent(data) && (fileTs > getSnippetsTs() || localEmpty)) {
    SNIP_GROUPS.forEach(g => { if (typeof data[g.key] === 'string') getSnippets()[g.key] = data[g.key]; });
    snipTs = fileTs || Date.now();
    persistSnippetsLocal();
    syncSnipInputs(); refreshSnipCounts(); render();
    setFileState('ok');
    toast('저장 파일에서 스니펫을 불러왔어요.');
  } else {
    await writeSnipFile();
  }
}

async function onFileBtn() {
  try {
    if (fileHandle && !await hasFilePermission(true)) { setFileState('need'); return; }
    if (!fileHandle || fileStateKind === 'ok') {
      const h = await window.showSaveFilePicker(FS_PICK_OPTS); // 기존 파일을 고르면 그 내용을 불러온다
      fileHandle = h;
      await idbSet('snipFile', h);
    }
    await syncWithFile();
  } catch (e) {
    if (e && e.name !== 'AbortError') { setFileState(fileHandle ? 'err' : 'off'); toast('파일을 연결하지 못했어요.'); }
  }
}

async function initFileSync() {
  $('snipFileBtn').onclick = onFileBtn;
  $('snipFileOff').onclick = async () => {
    fileHandle = null;
    try { await idbSet('snipFile', undefined); } catch (e) {}
    setFileState('off');
    toast('파일 연결을 해제했어요. (파일은 그대로 남아 있습니다)');
  };
  if (!FS_SUPPORTED) { setFileState('unsupported'); return; }
  try { fileHandle = (await idbGet('snipFile')) || null; } catch (e) { fileHandle = null; }
  if (!fileHandle) { setFileState('off'); return; }
  try {
    if (await hasFilePermission(false)) await syncWithFile();
    else setFileState('need');
  } catch (e) { setFileState('err'); }
}
