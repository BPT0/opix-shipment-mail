/* ================= 설정 (여기만 고치면 됩니다) ================= */
// 오픽스 버전 목록 — 새 버전은 화면의 "+ 버전 추가"로도 추가 가능(이 PC 브라우저에 저장)
const BASE_VERSIONS = ['3.1'];
const DEFAULT_VERSION = '3.1';

// 전달방식: 선택값 → 본문에 들어갈 표현(전달방식2)
const METHODS = {
  '물류이동': '물류 출고(창고간 이동)',
  '방문출고': '방문출고',
};

// 출고품목: name1=출고품목1, code=출고품목2, tag=서비스태그 앞 4자리(품목구분)
const ITEMS = {
  '스탠다드':  { name1: '오픽스_스탠다드',   code: 'NOFFIX30STD',          tag: '8401' },
  '플러스':    { name1: '오픽스_플러스',     code: '플러스아이템코드미정', tag: '8406' },
  '시큐어드':  { name1: '오픽스_시큐어드',   code: 'NOFFIX30SCU',          tag: '8403' },
  '시큐어드AI':{ name1: '오픽스_시큐어드_AI', code: 'NOFFIX30AI',           tag: '8404' },
  '프리미엄':  { name1: '오픽스_프리미엄',   code: 'NOFFIX30PRE',          tag: '8402' },
};
// 계약 방식 → 해당 계약일 때 "추가"되는 수신인 스니펫 그룹
const CONTRACTS = { 'CB 렌탈': 'cbRental', 'CB 세일': 'cbSale', '지사(PP영업부)': 'branch' };

// 스니펫 그룹 (등록 화면 표시 순서)
const SNIP_GROUPS = [
  { key: 'common',   label: '모든 메일 수신인' },
  { key: 'cbRental', label: 'CB 렌탈 추가 수신인' },
  { key: 'cbSale',   label: 'CB 세일 추가 수신인' },
  { key: 'branch',   label: '지사(PP영업부) 추가 수신인' },
  { key: 'cc',       label: '참조인' },
];
// 브라우저에 저장된 값이 없을 때 처음 채워질 기본 스니펫 (팀 공용 배포 시 여기에 넣어두면 편함)
const DEFAULT_SNIPPETS = { common: '', cbRental: '', cbSale: '', branch: '', cc: '' };

// 출력 형식: false → "이름" <메일>;   true → "이름 <메일>";
const WRAP_WHOLE = false;

// 서비스태그 형식:[품목4자리][연도2자리][고정 2자리][일련번호 4자리] = 12자리
const TAG_MID = '01';
const TAG_YEAR = () => String(new Date().getFullYear() % 100).padStart(2, '0'); // 연도가 바뀌면 자동 갱신
/* ============================================================== */
