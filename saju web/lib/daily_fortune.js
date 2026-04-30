/**
 * 오늘의 일진 & 골든타임 계산 모듈
 * 일간 vs 오늘 일진 대조, 용신 기반 행운 시간대 추천
 */

import {
  CHEONGAN_SHORT, JIJI_SHORT, SEXAGENARY_CYCLE,
  CHEONGAN_OHAENG, JIJI_OHAENG, CHEONGAN_YINYANG,
  OHAENG_ICONS, SIPSUNG_NAMES
} from './constants.js';
import { calculateTrueSolarTime } from './solartime.js';

// ─── 오늘의 일진(日辰) 계산 ───
export function calcTodayIljin() {
  const now = new Date();
  const baseDate = new Date(1900, 0, 1);
  const diffDays = Math.round((new Date(now.getFullYear(), now.getMonth(), now.getDate()) - baseDate) / (1000 * 60 * 60 * 24));
  const idx = ((10 + diffDays) % 60 + 60) % 60;
  const [gan, ji] = SEXAGENARY_CYCLE[idx];
  return { gan, ji, date: now };
}

// ─── 십성 판별 ───
function getSipsung(dayStemIdx, targetStemIdx) {
  const dayEl = Math.floor(dayStemIdx / 2);
  const targetEl = Math.floor(targetStemIdx / 2);
  const diff = ((targetEl - dayEl + 5) % 5);
  const same = (targetStemIdx % 2) === (dayStemIdx % 2);
  return SIPSUNG_NAMES[diff * 2 + (same ? 0 : 1)];
}

// ─── 용신 추정 (가장 부족한 오행) ───
export function estimateYongshin(ohaeng) {
  let minCount = Infinity;
  let yongshin = '수';
  for (const [key, val] of Object.entries(ohaeng)) {
    if (val.count < minCount) {
      minCount = val.count;
      yongshin = key;
    }
  }
  return yongshin;
}

// ─── 골든타임 계산 ───
const OHAENG_HOURS = {
  '목': [
    { name: '인시', start: '03:00', end: '05:00', ji: '인' },
    { name: '묘시', start: '05:00', end: '07:00', ji: '묘' }
  ],
  '화': [
    { name: '사시', start: '09:00', end: '11:00', ji: '사' },
    { name: '오시', start: '11:00', end: '13:00', ji: '오' }
  ],
  '토': [
    { name: '진시', start: '07:00', end: '09:00', ji: '진' },
    { name: '미시', start: '13:00', end: '15:00', ji: '미' }
  ],
  '금': [
    { name: '신시', start: '15:00', end: '17:00', ji: '신' },
    { name: '유시', start: '17:00', end: '19:00', ji: '유' }
  ],
  '수': [
    { name: '해시', start: '21:00', end: '23:00', ji: '해' },
    { name: '자시', start: '23:00', end: '01:00', ji: '자' }
  ]
};

export function calcGoldenTime(yongshin) {
  const hours = OHAENG_HOURS[yongshin] || OHAENG_HOURS['수'];
  return {
    element: yongshin,
    icon: OHAENG_ICONS[yongshin],
    times: hours,
    tip: getGoldenTimeTip(yongshin)
  };
}

function getGoldenTimeTip(oh) {
  const tips = {
    '목': '이 시간대에 새로운 계획을 세우거나 창의적 활동을 시작하면 좋아요 🌱',
    '화': '이 시간대에 중요한 미팅이나 발표를 잡으면 에너지가 잘 실려요 🔥',
    '토': '이 시간대에 정리 정돈이나 안정적인 업무를 처리하면 효과적이에요 🏔️',
    '금': '이 시간대에 재무 관련 결정이나 계약을 진행하면 좋아요 ✨',
    '수': '이 시간대에 깊은 사고나 전략적 계획을 세우면 통찰이 열려요 🌊'
  };
  return tips[oh] || tips['수'];
}

// ─── 오늘의 운세 텍스트 (다정한 말투) ───
export function generateDailyReport(dayGanInfo, todayIljin, ohaeng) {
  const userGanShort = dayGanInfo.name.charAt(0);
  const todayGanShort = todayIljin.gan.charAt(0);
  const userIdx = CHEONGAN_SHORT.indexOf(userGanShort);
  const todayIdx = CHEONGAN_SHORT.indexOf(todayGanShort);
  const sipsung = getSipsung(userIdx, todayIdx);

  const todayOh = CHEONGAN_OHAENG[todayGanShort];
  const userOh = dayGanInfo.ohaeng;

  // 감성 요약
  const summaryTexts = {
    '비견': { mood: '자신감 충만', icon: '💪', text: '나와 같은 기운이 흐르는 하루예요. 주체적으로 움직이면 좋은 결과가 따라올 거예요.' },
    '겁재': { mood: '도전 에너지', icon: '⚡', text: '경쟁적인 에너지가 감지돼요. 협력보다는 독자적인 판단이 빛나는 날이에요.' },
    '식신': { mood: '풍요로운 하루', icon: '🍀', text: '먹는 것도, 만드는 것도 잘 되는 날이에요. 창작 활동이나 맛집 탐방 추천!' },
    '상관': { mood: '표현력 폭발', icon: '🎨', text: '말과 글에 힘이 실리는 날이에요. 단, 너무 직설적인 표현은 살짝 자제해 주세요.' },
    '편재': { mood: '기회 포착', icon: '💰', text: '정체되었던 자금 흐름이 풀리는 기운이에요. 예상치 못한 수입의 기회가 올 수 있어요.' },
    '정재': { mood: '안정적 성장', icon: '📈', text: '꾸준히 쌓아온 것들이 빛을 발하는 날이에요. 저축이나 투자 계획을 점검해보세요.' },
    '편관': { mood: '변화의 바람', icon: '🌪️', text: '예상치 못한 변화가 찾아올 수 있어요. 유연하게 대처하면 오히려 전화위복이 될 거예요.' },
    '정관': { mood: '신뢰와 책임', icon: '👔', text: '사회적인 인정이나 승진의 기운이 느껴져요. 맡은 일에 최선을 다해보세요.' },
    '편인': { mood: '직관력 상승', icon: '🔮', text: '영감이 떠오르는 하루예요. 공부나 자격증 준비에 집중하면 효율이 높아요.' },
    '정인': { mood: '든든한 지원', icon: '🤝', text: '주변의 도움이 자연스럽게 찾아오는 날이에요. 감사한 마음을 표현해보세요.' }
  };

  const report = summaryTexts[sipsung] || summaryTexts['비견'];

  // 재물운 / 사회운
  const wealthTexts = {
    '편재': '💰 흐름이 변하는 시기예요. 갑자기 들어오는 제안에 귀 기울여보세요.',
    '정재': '💎 안정적인 수입이 유지돼요. 불필요한 지출만 줄이면 여유가 생겨요.',
    '식신': '🍯 먹고 마시는 데 복이 있는 날! 사업 미팅은 식사 자리로 잡아보세요.',
    '상관': '💡 아이디어가 돈이 되는 날이에요. 부업이나 프리랜서 일감이 들어올 수 있어요.',
    '비견': '🤝 공동 투자보다는 단독 판단이 유리해요. 큰 지출은 내일로 미뤄보세요.',
    '겁재': '⚠️ 충동적인 소비를 조심하세요. 오늘의 유혹은 내일의 후회가 될 수 있어요.',
    '편관': '📊 리스크가 있는 투자는 피하세요. 안정 자산 위주로 관리하면 좋아요.',
    '정관': '🏦 공식적인 금전 거래에 유리해요. 계약서나 서류 작업도 좋은 날이에요.',
    '편인': '📚 자기 계발에 투자하면 장기적으로 큰 수익이 돼요.',
    '정인': '🎁 누군가에게 선물을 받거나, 예상치 못한 혜택이 찾아올 수 있어요.'
  };

  const socialTexts = {
    '편재': '🌟 새로운 만남이 행운을 가져와요. 네트워킹에 적극적으로 참여해보세요.',
    '정재': '🤗 가까운 사람들과의 관계가 더 돈독해지는 날이에요.',
    '식신': '🎉 모임이나 파티에서 인기 만점! 사교 활동에 적극적으로 나서보세요.',
    '상관': '🗣️ 의견 충돌이 있을 수 있어요. 한 박자 쉬고 말하면 관계가 부드러워져요.',
    '비견': '🏃 같은 목표를 가진 사람을 만나기 좋은 날이에요.',
    '겁재': '⚡ 경쟁 관계에서 긴장감이 있을 수 있어요. 여유를 가져보세요.',
    '편관': '👑 윗사람에게 인정받을 기회가 와요. 자신감 있게 임해보세요.',
    '정관': '📋 공식적인 자리에서 좋은 인상을 남길 수 있어요.',
    '편인': '🧘 혼자만의 시간이 필요한 날이에요. 무리한 약속은 피하세요.',
    '정인': '❤️ 가족이나 멘토와의 대화에서 큰 깨달음을 얻을 수 있어요.'
  };

  return {
    todayIljin: {
      gan: todayIljin.gan,
      ji: todayIljin.ji,
      ohaeng: todayOh,
      icon: OHAENG_ICONS[todayOh]
    },
    sipsung,
    mood: report.mood,
    moodIcon: report.icon,
    emotionalSummary: report.text,
    wealth: wealthTexts[sipsung] || wealthTexts['비견'],
    social: socialTexts[sipsung] || socialTexts['비견'],
    dateStr: `${todayIljin.date.getFullYear()}년 ${todayIljin.date.getMonth() + 1}월 ${todayIljin.date.getDate()}일`
  };
}

// ═══════════════════════════════════════════
//  서술형 운세 생성기 (Narrative Fortune)
// ═══════════════════════════════════════════

const GAN_POETIC = {
  '갑':'거대한 나무(甲)','을':'푸른 새싹(乙)','병':'밝은 태양(丙)','정':'따스한 촛불(丁)',
  '무':'높은 산(戊)','기':'기름진 대지(己)','경':'굳센 강철(庚)','신':'빛나는 보석(辛)',
  '임':'넓은 바다(壬)','계':'고요한 이슬(癸)'
};
const JI_POETIC = {
  '자':'쥐(子)','축':'소(丑)','인':'호랑이(寅)','묘':'토끼(卯)','진':'용(辰)','사':'뱀(巳)',
  '오':'말(午)','미':'양(未)','신':'원숭이(申)','유':'닭(酉)','술':'개(戌)','해':'돼지(亥)'
};
const GAN_ACTION = {
  '갑':'세상을 향해 힘차게 뻗어나가고','을':'대지를 부드럽게 감싸며',
  '병':'만물을 환하게 비추고','정':'어둠 속에서 따뜻한 빛을 밝히며',
  '무':'굳건하게 세상을 떠받치고','기':'생명의 씨앗을 품어 키우며',
  '경':'모든 것을 단호하게 정리하고','신':'세밀하게 다듬으며 빛을 내고',
  '임':'유유히 흐르며 세상을 적시고','계':'조용히 스며들어 만물을 적셔주며'
};
const JI_ACTION = {
  '자':'지혜의 씨앗을 뿌려주는','축':'묵묵히 복을 쌓아가는',
  '인':'용맹하게 새 길을 열어주는','묘':'세련된 감각으로 꽃을 피우는',
  '진':'비바람 속에서 무지개를 선물하는','사':'날카로운 통찰로 기회를 잡아주는',
  '오':'열정의 불꽃을 타오르게 하는','미':'따뜻한 마음으로 사람을 모으는',
  '신':'빠른 판단으로 문제를 해결해주는','유':'보석처럼 빛나는 성과를 안겨주는',
  '술':'충성스럽게 당신을 지켜주는','해':'풍요의 물결을 가져다주는'
};

const OHAENG_NUMBERS = {'목':'3, 8','화':'2, 7','토':'5, 0','금':'4, 9','수':'1, 6'};
const OHAENG_COLORS_MAP = {
  '목':{name:'초록색(연두색)',desc:'성장과 새로운 시작의 기운을 불러옵니다'},
  '화':{name:'빨간색(주홍색)',desc:'열정과 활력을 더해줍니다'},
  '토':{name:'노란색(황금색)',desc:'안정감과 들어온 복을 단단히 잡아줍니다'},
  '금':{name:'흰색(은색)',desc:'결단력과 정리의 기운을 높여줍니다'},
  '수':{name:'검은색(남색)',desc:'냉철한 판단력과 지혜를 도와줍니다'}
};
const OHAENG_DIR = {
  '목':{dir:'동쪽',desc:'책상이나 작업 공간의 동쪽에 초록 식물을 놓아보세요'},
  '화':{dir:'남쪽',desc:'남쪽 창가에서 햇빛을 받으며 활력을 충전해보세요'},
  '토':{dir:'중앙',desc:'집이나 사무실의 중앙에서 중요한 결정을 내려보세요'},
  '금':{dir:'서쪽',desc:'서쪽 방향에서 중요한 전화나 계약을 진행해보세요'},
  '수':{dir:'북쪽',desc:'북쪽 방향을 활용하면 운의 흐름이 매끄러워집니다'}
};

const WEALTH_NARRATIVE = {
  '비견':'오늘은 나의 주체적인 판단이 재물운을 좌우하는 날이에요. 누군가와 함께 투자하기보다는 내 감각을 믿고 단독으로 움직이는 것이 유리합니다. 큰 지출은 하루 미뤄보시는 것도 좋아요.',
  '겁재':'재물에 대한 경쟁 에너지가 느껴지는 날이에요. 충동적인 소비나 과도한 투자는 삼가시고, 지키는 것에 집중하면 오히려 더 큰 기회가 옵니다.',
  '식신':'먹고 마시는 데 복이 가득한 날이에요! 비즈니스 미팅은 맛있는 식사 자리로 잡아보세요. 먹으면서 나누는 대화 속에 의외의 금전적 기회가 숨어 있을 수 있어요.',
  '상관':'아이디어가 곧 돈이 되는 날이에요. 평소 구상하던 부업이나 프리랜서 프로젝트를 실행에 옮기기 좋습니다. 창의적인 제안이 수입으로 이어질 수 있어요.',
  '편재':'오랫동안 소식이 없던 매매 건이나 미뤄졌던 자금 회수 등 금전과 관련된 긍정적인 신호가 들려옵니다. 특히 오늘은 내 고집보다는 시장의 흐름과 전문가의 조언을 따를 때 수익이 극대화됩니다.',
  '정재':'꾸준히 관리해온 자산에서 안정적인 성과가 나타나는 날이에요. 저축 계획을 재점검하거나, 장기적 투자 포트폴리오를 조정하기에 적합합니다.',
  '편관':'예상치 못한 지출이 발생할 수 있지만, 이는 미래의 더 큰 수익을 위한 투자가 될 거예요. 리스크가 있는 투자는 피하고, 안정 자산 위주로 관리하세요.',
  '정관':'공식적인 금전 거래에 유리한 날이에요. 계약서 작성, 대출 상담, 보험 점검 등 서류 관련 재무 활동이 순조롭게 풀립니다.',
  '편인':'당장의 수익보다는 자기 계발에 투자하면 장기적으로 큰 수익이 될 거예요. 온라인 강의, 자격증 준비 등에 과감하게 투자해보세요.',
  '정인':'주변 어른이나 멘토로부터 예상치 못한 경제적 도움이나 귀한 정보를 받을 수 있어요. 감사한 마음을 전하면 더 큰 복이 돌아옵니다.'
};

const SOCIAL_NARRATIVE = {
  '비견':'나와 비슷한 에너지를 가진 사람들과의 만남이 빛나는 날이에요. 같은 목표를 향해 달리는 동료와 교류하면 시너지가 폭발합니다.',
  '겁재':'경쟁 관계에서 긴장감이 있을 수 있어요. 하지만 이를 건강한 자극으로 받아들이면 한 단계 성장할 수 있는 기회가 됩니다.',
  '식신':'모임이나 파티에서 인기 만점인 날! 사교 활동에 적극적으로 나서보세요. 새로운 인연이 앞으로의 큰 행운을 가져다줄 수 있어요.',
  '상관':'표현력이 극대화되는 날이지만, 너무 직설적인 표현은 관계에 작은 마찰을 일으킬 수 있어요. 한 박자 쉬고 말하면 모든 것이 부드러워집니다.',
  '편재':'새로운 만남이 행운의 열쇠가 돼요. 평소 가지 않던 장소나 모임에 참석하면 뜻밖의 귀인을 만날 수 있습니다.',
  '정재':'가까운 사람들과의 관계가 더욱 돈독해지는 날이에요. 오래된 친구에게 연락해보세요. 따뜻한 대화가 마음의 안정을 가져다줍니다.',
  '편관':'조금은 책임감이 따르는 위치에 서거나, 중요한 결정을 내려야 할 수 있지만, 이를 통해 내 능력을 주변에 확실히 각인시키는 기회가 됩니다.',
  '정관':'공식적인 자리에서 좋은 인상을 남길 수 있는 날이에요. 상사나 거래처와의 미팅에서 신뢰를 쌓으면 장기적인 협력 관계로 발전합니다.',
  '편인':'혼자만의 시간이 필요한 날이에요. 복잡한 인간관계에서 잠시 벗어나 자기 자신에게 집중하면, 내일 더 맑은 에너지로 돌아올 수 있어요.',
  '정인':'가족이나 멘토, 스승과의 대화에서 큰 깨달음을 얻을 수 있는 날이에요. 주변의 사랑과 지지에 진심으로 감사를 표현해보세요.'
};

const OVERALL_SUMMARY = {
  '비견':'오늘은 나와 같은 기운이 세상에 흐르는 날이에요. 주체적으로 움직일수록 좋은 결과가 따라오고, 자신의 영역을 확고히 할 수 있는 기회입니다.',
  '겁재':'경쟁의 에너지가 감도는 하루예요. 긴장감을 건강한 자극으로 바꾸면, 오히려 평소보다 더 큰 성장을 이룰 수 있는 역동적인 날입니다.',
  '식신':'풍요롭고 여유로운 기운이 흐르는 하루예요. 먹는 것에 복이 있고, 창작 활동에서도 좋은 영감이 떠오르는 실속 있는 날입니다.',
  '상관':'표현력과 창의력이 극대화되는 하루예요. 말과 글에 힘이 실리지만, 너무 직설적인 표현은 살짝 유연하게 다듬어주면 더 빛나는 날이 됩니다.',
  '편재':'정체되었던 자금 흐름이 유연하게 풀리고, 주변의 조력자 덕분에 고민하던 문제가 해결의 물꼬를 트는 실속 있는 날입니다.',
  '정재':'꾸준히 쌓아온 노력이 안정적인 결실로 이어지는 날이에요. 성급하게 서두르지 않고 내 페이스를 지키면 착실한 성과를 거둘 수 있습니다.',
  '편관':'예상치 못한 변화가 찾아올 수 있지만, 유연하게 대처하면 오히려 전화위복의 기회가 되는 날이에요. 도전을 두려워하지 마세요.',
  '정관':'사회적 인정과 신뢰가 높아지는 하루예요. 맡은 역할에 최선을 다하면, 주변에서 당신의 능력을 확실히 인정해줄 거예요.',
  '편인':'직관과 영감이 빛나는 하루예요. 공부나 연구, 자기 계발에 집중하면 평소보다 훨씬 높은 효율을 경험할 수 있습니다.',
  '정인':'든든한 지원군이 나타나는 날이에요. 주변의 도움이 자연스럽게 찾아오고, 감사한 마음을 표현하면 더 큰 복이 돌아옵니다.'
};

/**
 * 서술형 운세(Narrative) 생성
 */
export function generateNarrative(dayGanInfo, todayIljin, ohaeng, goldenTime) {
  const userGanShort = dayGanInfo.name.charAt(0);
  const todayGanShort = todayIljin.gan.charAt(0);
  const todayJiShort = todayIljin.ji.charAt(0);
  const userIdx = CHEONGAN_SHORT.indexOf(userGanShort);
  const todayGanIdx = CHEONGAN_SHORT.indexOf(todayGanShort);
  const sipsung = getSipsung(userIdx, todayGanIdx);
  const todayGanOh = CHEONGAN_OHAENG[todayGanShort];
  const todayJiOh = JIJI_OHAENG[todayJiShort];
  const userOh = dayGanInfo.ohaeng;

  const days = ['일','월','화','수','목','금','토'];
  const dayOfWeek = days[todayIljin.date.getDay()];

  // 용신
  let yongshin = '수';
  let minC = Infinity;
  for (const [k,v] of Object.entries(ohaeng)) { if (v.count < minC) { minC = v.count; yongshin = k; } }

  // 오프닝
  const poeticOpening = `${GAN_POETIC[todayGanShort]}이 ${GAN_ACTION[todayGanShort]} ${JI_POETIC[todayJiShort]}가 ${JI_ACTION[todayJiShort]} 날`;

  const color1 = OHAENG_COLORS_MAP[userOh];
  const color2 = OHAENG_COLORS_MAP[yongshin];
  const direction = OHAENG_DIR[yongshin];
  const gtDesc = goldenTime.times.map(t => `${t.name}(${t.start}~${t.end})`).join(', ');

  return {
    dateStr: `${todayIljin.date.getFullYear()}-${String(todayIljin.date.getMonth()+1).padStart(2,'0')}-${String(todayIljin.date.getDate()).padStart(2,'0')} (${dayOfWeek}요일, ${todayGanShort}${todayJiShort}일)`,
    poeticOpening,
    overallSummary: OVERALL_SUMMARY[sipsung] || OVERALL_SUMMARY['비견'],
    wealth: { title: '💰 재물 및 문서운', sipsung, todayJiOh, userGan: dayGanInfo.name, text: WEALTH_NARRATIVE[sipsung] || WEALTH_NARRATIVE['비견'] },
    social: { title: '✨ 사회운 및 인덕', sipsung, todayGan: todayGanShort, text: SOCIAL_NARRATIVE[sipsung] || SOCIAL_NARRATIVE['비견'] },
    luckyGuide: {
      numbers: { user: OHAENG_NUMBERS[userOh], userLabel: '나의 중심', boost: OHAENG_NUMBERS[yongshin], boostLabel: `${yongshin}의 기운` },
      colors: [ { name: color1.name, desc: color1.desc }, { name: color2.name, desc: color2.desc } ],
      direction: { name: direction.dir, desc: direction.desc },
      goldenTime: { text: gtDesc, desc: `하루 중 가장 중요한 결정이나 미팅은 이 시간에 배치하세요. ${goldenTime.tip}` }
    }
  };
}
