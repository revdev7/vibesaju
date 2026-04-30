/**
 * 사주팔자 만세력 계산 시스템 v6.0 - 상수 정의
 * ================================================
 * 서울 기준 경도 고정 및 명리학 참조 데이터
 */

// ─── 서울 기준 경도 (사용자에게는 노출하지 않음) ───
export const SEOUL_LONGITUDE = 126.97;
export const KST_STANDARD_LONGITUDE = 135.0;

// ─── 천간 (天干) ───
export const CHEONGAN = [
  '갑(甲)', '을(乙)', '병(丙)', '정(丁)', '무(戊)',
  '기(己)', '경(庚)', '신(辛)', '임(壬)', '계(癸)'
];

// 천간 약자 (계산용)
export const CHEONGAN_SHORT = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];

// ─── 지지 (地支) ───
export const JIJI = [
  '자(子)', '축(丑)', '인(寅)', '묘(卯)', '진(辰)', '사(巳)',
  '오(午)', '미(未)', '신(申)', '유(酉)', '술(戌)', '해(亥)'
];

export const JIJI_SHORT = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];

// 월주용 지지 순서 (인월 시작)
export const MONTH_JIJI = [
  '인(寅)', '묘(卯)', '진(辰)', '사(巳)', '오(午)', '미(未)',
  '신(申)', '유(酉)', '술(戌)', '해(亥)', '자(子)', '축(丑)'
];

// ─── 60갑자 (六十甲子) ───
export const SEXAGENARY_CYCLE = [];
for (let i = 0; i < 60; i++) {
  SEXAGENARY_CYCLE.push([CHEONGAN[i % 10], JIJI[i % 12]]);
}

// ─── 오행 (五行) ───
export const OHAENG = ['목(木)', '화(火)', '토(土)', '금(金)', '수(水)'];
export const OHAENG_ICONS = { '목': '🟢', '화': '🔴', '토': '🟡', '금': '⚪', '수': '🔵' };

// 천간 → 오행 매핑
export const CHEONGAN_OHAENG = {
  '갑': '목', '을': '목',
  '병': '화', '정': '화',
  '무': '토', '기': '토',
  '경': '금', '신': '금',
  '임': '수', '계': '수'
};

// 지지 → 오행 매핑
export const JIJI_OHAENG = {
  '자': '수', '축': '토',
  '인': '목', '묘': '목',
  '진': '토', '사': '화',
  '오': '화', '미': '토',
  '신': '금', '유': '금',
  '술': '토', '해': '수'
};

// 천간 → 음양 매핑
export const CHEONGAN_YINYANG = {
  '갑': '양', '을': '음',
  '병': '양', '정': '음',
  '무': '양', '기': '음',
  '경': '양', '신': '음',
  '임': '양', '계': '음'
};

// ─── 십성 (十星) ───
export const SIPSUNG_NAMES = [
  '비견', '겁재', '식신', '상관', '편재',
  '정재', '편관', '정관', '편인', '정인'
];

// ─── 지장간 (地藏干) ───
export const JIJANGGAN = {
  '자': { yeoqi: '임', junggi: null, jeonggi: '계' },
  '축': { yeoqi: '계', junggi: '신', jeonggi: '기' },
  '인': { yeoqi: '무', junggi: '병', jeonggi: '갑' },
  '묘': { yeoqi: '갑', junggi: null, jeonggi: '을' },
  '진': { yeoqi: '을', junggi: '계', jeonggi: '무' },
  '사': { yeoqi: '무', junggi: '경', jeonggi: '병' },
  '오': { yeoqi: '병', junggi: '기', jeonggi: '정' },
  '미': { yeoqi: '정', junggi: '을', jeonggi: '기' },
  '신': { yeoqi: '기', junggi: '임', jeonggi: '경' },
  '유': { yeoqi: '경', junggi: null, jeonggi: '신' },
  '술': { yeoqi: '신', junggi: '정', jeonggi: '무' },
  '해': { yeoqi: '무', junggi: '갑', jeonggi: '임' }
};

// ─── 12운성 (十二運星) ───
export const TWELVE_STAGES = [
  '장생', '목욕', '관대', '건록', '제왕',
  '쇠', '병', '사', '묘', '절', '태', '양'
];

// 일간별 장생지 인덱스 (지지 인덱스 기준)
export const JANGSAENG_BASE = {
  '갑': 11, // 해
  '을': 6,  // 오
  '병': 2,  // 인
  '정': 9,  // 유
  '무': 2,  // 인
  '기': 9,  // 유
  '경': 5,  // 사
  '신': 0,  // 자
  '임': 8,  // 신
  '계': 3   // 묘
};

// ─── 신살 (神殺) ───
// 도화살: 일지 삼합 기준
export const DOHWA = {
  '인': '묘', '오': '묘', '술': '묘',
  '사': '오', '유': '오', '축': '오',
  '신': '유', '자': '유', '진': '유',
  '해': '자', '묘': '자', '미': '자'
};

// 역마살: 일지 삼합 기준
export const YEOKMA = {
  '인': '신', '오': '신', '술': '신',
  '사': '해', '유': '해', '축': '해',
  '신': '인', '자': '인', '진': '인',
  '해': '사', '묘': '사', '미': '사'
};

// 화개살: 일지 삼합 기준
export const HWAGAE = {
  '인': '술', '오': '술', '술': '술',
  '사': '축', '유': '축', '축': '축',
  '신': '진', '자': '진', '진': '진',
  '해': '미', '묘': '미', '미': '미'
};

// 괴강살: 특정 일주
export const GOEGANG = ['경진', '경술', '임진', '임술'];

// ─── 시주 경계 시간 (v6.0: 정시 경계 XX:00) ───
export const HOUR_BOUNDARIES = [
  { start: 23 * 60, end: 25 * 60, jiji_idx: 0, name: '자시' },   // 23:00~00:59
  { start: 1 * 60,  end: 3 * 60,  jiji_idx: 1, name: '축시' },
  { start: 3 * 60,  end: 5 * 60,  jiji_idx: 2, name: '인시' },
  { start: 5 * 60,  end: 7 * 60,  jiji_idx: 3, name: '묘시' },
  { start: 7 * 60,  end: 9 * 60,  jiji_idx: 4, name: '진시' },
  { start: 9 * 60,  end: 11 * 60, jiji_idx: 5, name: '사시' },
  { start: 11 * 60, end: 13 * 60, jiji_idx: 6, name: '오시' },
  { start: 13 * 60, end: 15 * 60, jiji_idx: 7, name: '미시' },
  { start: 15 * 60, end: 17 * 60, jiji_idx: 8, name: '신시' },
  { start: 17 * 60, end: 19 * 60, jiji_idx: 9, name: '유시' },
  { start: 19 * 60, end: 21 * 60, jiji_idx: 10, name: '술시' },
  { start: 21 * 60, end: 23 * 60, jiji_idx: 11, name: '해시' }
];
