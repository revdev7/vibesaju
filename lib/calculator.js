/**
 * 사주 계산 엔진 (Four Pillars Calculator)
 * v6.0 - 진태양시 + 정시 경계(XX:00) 적용
 */

import {
  CHEONGAN, CHEONGAN_SHORT, JIJI, JIJI_SHORT, MONTH_JIJI,
  SEXAGENARY_CYCLE, CHEONGAN_OHAENG, JIJI_OHAENG,
  CHEONGAN_YINYANG, SIPSUNG_NAMES, JIJANGGAN,
  TWELVE_STAGES, JANGSAENG_BASE, OHAENG_ICONS,
  DOHWA, YEOKMA, HWAGAE, GOEGANG
} from './constants.js';
import { calculateTrueSolarTime } from './solartime.js';

// ─── 유틸 ───
function extractShort(fullName) {
  return fullName.charAt(0);
}

function getCheonganIndex(name) {
  const short = typeof name === 'string' && name.length > 1 ? extractShort(name) : name;
  return CHEONGAN_SHORT.indexOf(short);
}

function getJijiIndex(name) {
  const short = typeof name === 'string' && name.length > 1 ? extractShort(name) : name;
  return JIJI_SHORT.indexOf(short);
}

// ─── 년주 계산 ───
export function calcYearPillar(birthDatetime, ipchunDatetime) {
  const calcYear = birthDatetime < ipchunDatetime
    ? birthDatetime.getFullYear() - 1
    : birthDatetime.getFullYear();
  const ganIdx = ((calcYear - 4) % 10 + 10) % 10;
  const jiIdx = ((calcYear - 4) % 12 + 12) % 12;
  return { gan: CHEONGAN[ganIdx], ji: JIJI[jiIdx] };
}

// ─── 월주 계산 ───
export function calcMonthPillar(yearGan, monthJijiIdx) {
  const yearGanIdx = getCheonganIndex(yearGan);
  const startGanMap = { 0: 2, 5: 2, 1: 4, 6: 4, 2: 6, 7: 6, 3: 8, 8: 8, 4: 0, 9: 0 };
  const startGanIdx = startGanMap[yearGanIdx];
  const monthGanIdx = (startGanIdx + monthJijiIdx) % 10;
  return { gan: CHEONGAN[monthGanIdx], ji: MONTH_JIJI[monthJijiIdx] };
}

// ─── 일주 계산 ───
export function calcDayPillar(solarYear, solarMonth, solarDay) {
  const baseDate = new Date(1900, 0, 1);
  const targetDate = new Date(solarYear, solarMonth - 1, solarDay);
  const diffDays = Math.round((targetDate - baseDate) / (1000 * 60 * 60 * 24));
  const idx = ((10 + diffDays) % 60 + 60) % 60;
  const [gan, ji] = SEXAGENARY_CYCLE[idx];
  return { gan, ji };
}

// ─── 시주 계산 (v6.0: 진태양시 + XX:00 정시 경계) ───
export function calcHourPillar(dayGan, hour, minute) {
  const totalMinutes = hour * 60 + minute;
  let hourJiIdx;
  if (totalMinutes >= 23 * 60 || totalMinutes < 1 * 60) {
    hourJiIdx = 0;
  } else if (totalMinutes < 3 * 60) {
    hourJiIdx = 1;
  } else if (totalMinutes < 5 * 60) {
    hourJiIdx = 2;
  } else if (totalMinutes < 7 * 60) {
    hourJiIdx = 3;
  } else if (totalMinutes < 9 * 60) {
    hourJiIdx = 4;
  } else if (totalMinutes < 11 * 60) {
    hourJiIdx = 5;
  } else if (totalMinutes < 13 * 60) {
    hourJiIdx = 6;
  } else if (totalMinutes < 15 * 60) {
    hourJiIdx = 7;
  } else if (totalMinutes < 17 * 60) {
    hourJiIdx = 8;
  } else if (totalMinutes < 19 * 60) {
    hourJiIdx = 9;
  } else if (totalMinutes < 21 * 60) {
    hourJiIdx = 10;
  } else {
    hourJiIdx = 11;
  }

  const dayGanIdx = getCheonganIndex(dayGan);
  const startGanMap = { 0: 0, 5: 0, 1: 2, 6: 2, 2: 4, 7: 4, 3: 6, 8: 6, 4: 8, 9: 8 };
  const startGanIdx = startGanMap[dayGanIdx];
  const hourGanIdx = (startGanIdx + hourJiIdx) % 10;

  return { gan: CHEONGAN[hourGanIdx], ji: JIJI[hourJiIdx] };
}

// ─── 십성 판별 (v5.0: 오행 관계 + 음양) ───
export function getSipsung(dayStemIdx, targetStemIdx) {
  const dayElement = Math.floor(dayStemIdx / 2);
  const targetElement = Math.floor(targetStemIdx / 2);
  const elementDiff = ((targetElement - dayElement + 5) % 5);
  const sameYinyang = (targetStemIdx % 2) === (dayStemIdx % 2);
  const sipsungIdx = elementDiff * 2 + (sameYinyang ? 0 : 1);
  return SIPSUNG_NAMES[sipsungIdx];
}

// ─── 12운성 계산 ───
export function calcTwelveStage(dayGan, jijiChar) {
  const dayShort = extractShort(dayGan);
  const jiIdx = getJijiIndex(jijiChar);
  const baseIdx = JANGSAENG_BASE[dayShort];
  if (baseIdx === undefined || jiIdx === -1) return '—';

  const isYang = CHEONGAN_YINYANG[dayShort] === '양';
  let diff;
  if (isYang) {
    diff = ((jiIdx - baseIdx) % 12 + 12) % 12;
  } else {
    diff = ((baseIdx - jiIdx) % 12 + 12) % 12;
  }
  return TWELVE_STAGES[diff];
}

// ─── 지장간 조회 ───
export function getJijanggan(jijiChar) {
  const short = extractShort(jijiChar);
  const data = JIJANGGAN[short];
  if (!data) return { yeoqi: '—', junggi: '—', jeonggi: '—' };
  return {
    yeoqi: data.yeoqi || '—',
    junggi: data.junggi || '—',
    jeonggi: data.jeonggi || '—'
  };
}

// ─── 신살 판별 ───
export function calcShinsal(dayJi, allJiji) {
  const dayShort = extractShort(dayJi);
  const result = { dohwa: null, yeokma: null, hwagae: null, goegang: false };

  // 도화살
  if (DOHWA[dayShort]) {
    const target = DOHWA[dayShort];
    const found = allJiji.filter(j => extractShort(j) === target);
    if (found.length > 0) result.dohwa = found.map(f => f);
  }
  // 역마살
  if (YEOKMA[dayShort]) {
    const target = YEOKMA[dayShort];
    const found = allJiji.filter(j => extractShort(j) === target);
    if (found.length > 0) result.yeokma = found.map(f => f);
  }
  // 화개살
  if (HWAGAE[dayShort]) {
    const target = HWAGAE[dayShort];
    const found = allJiji.filter(j => extractShort(j) === target);
    if (found.length > 0) result.hwagae = found.map(f => f);
  }

  return result;
}

// ─── 오행 분석 ───
export function analyzeOhaeng(pillars) {
  const counts = { '목': 0, '화': 0, '토': 0, '금': 0, '수': 0 };
  const chars = { '목': [], '화': [], '토': [], '금': [], '수': [] };

  for (const p of pillars) {
    const ganShort = extractShort(p.gan);
    const jiShort = extractShort(p.ji);
    const ganOh = CHEONGAN_OHAENG[ganShort];
    const jiOh = JIJI_OHAENG[jiShort];
    if (ganOh) { counts[ganOh]++; chars[ganOh].push(p.gan); }
    if (jiOh) { counts[jiOh]++; chars[jiOh].push(p.ji); }
  }

  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const result = {};
  for (const [key, count] of Object.entries(counts)) {
    const ratio = total > 0 ? ((count / total) * 100) : 0;
    let status = '적정';
    if (count === 0) status = '결핍';
    else if (ratio >= 40) status = '과다';
    else if (count <= 1 && total >= 6) status = '부족';

    result[key] = {
      icon: OHAENG_ICONS[key],
      count,
      ratio: Math.round(ratio * 10) / 10,
      status,
      chars: chars[key]
    };
  }
  return result;
}

// ─── 메인 계산 함수 ───
export function calculateSaju(birthYear, birthMonth, birthDay, birthHour, birthMinute, gender) {
  const birthDatetime = new Date(birthYear, birthMonth - 1, birthDay, birthHour, birthMinute);

  // 1. 진태양시 계산 (서울 고정, 사용자 입력 없이)
  const solarResult = calculateTrueSolarTime(birthDatetime);
  const tst = solarResult.trueSolarTime;

  // 2. 입춘 datetime (간이: 해당 년도 2/4 기준. 실제로는 절기 CSV에서 조회해야 함)
  const ipchun = new Date(birthYear, 1, 4, 0, 0);

  // 3. 년주
  const yearPillar = calcYearPillar(birthDatetime, ipchun);

  // 4. 월주 (간이 절기 판별)
  const monthJijiIdx = getMonthJijiIndex(birthMonth, birthDay);
  const monthPillar = calcMonthPillar(yearPillar.gan, monthJijiIdx);

  // 5. 일주
  const dayPillar = calcDayPillar(birthYear, birthMonth, birthDay);

  // 6. 시주 (진태양시 기준, v6.0 정시 경계)
  const hourPillar = calcHourPillar(dayPillar.gan, tst.getHours(), tst.getMinutes());

  // 7. 십성
  const dayGanIdx = getCheonganIndex(dayPillar.gan);
  const sipsungs = {
    year_gan: getSipsung(dayGanIdx, getCheonganIndex(yearPillar.gan)),
    year_ji: getSipsung(dayGanIdx, getCheonganIndex(JIJANGGAN[extractShort(yearPillar.ji)]?.jeonggi || '갑')),
    month_gan: getSipsung(dayGanIdx, getCheonganIndex(monthPillar.gan)),
    month_ji: getSipsung(dayGanIdx, getCheonganIndex(JIJANGGAN[extractShort(monthPillar.ji)]?.jeonggi || '갑')),
    hour_gan: getSipsung(dayGanIdx, getCheonganIndex(hourPillar.gan)),
    hour_ji: getSipsung(dayGanIdx, getCheonganIndex(JIJANGGAN[extractShort(hourPillar.ji)]?.jeonggi || '갑'))
  };

  // 8. 12운성
  const stages = {
    year: calcTwelveStage(dayPillar.gan, yearPillar.ji),
    month: calcTwelveStage(dayPillar.gan, monthPillar.ji),
    day: calcTwelveStage(dayPillar.gan, dayPillar.ji),
    hour: calcTwelveStage(dayPillar.gan, hourPillar.ji)
  };

  // 9. 지장간
  const jijanggan = {
    year: getJijanggan(yearPillar.ji),
    month: getJijanggan(monthPillar.ji),
    day: getJijanggan(dayPillar.ji),
    hour: getJijanggan(hourPillar.ji)
  };

  // 10. 신살
  const allJiji = [hourPillar.ji, dayPillar.ji, monthPillar.ji, yearPillar.ji];
  const shinsal = calcShinsal(dayPillar.ji, allJiji);

  // 11. 괴강살 체크
  const dayPillarStr = extractShort(dayPillar.gan) + extractShort(dayPillar.ji);
  shinsal.goegang = GOEGANG.includes(dayPillarStr);

  // 12. 오행 분석
  const pillars = [
    { gan: yearPillar.gan, ji: yearPillar.ji },
    { gan: monthPillar.gan, ji: monthPillar.ji },
    { gan: dayPillar.gan, ji: dayPillar.ji },
    { gan: hourPillar.gan, ji: hourPillar.ji }
  ];
  const ohaeng = analyzeOhaeng(pillars);

  // 일간 정보
  const dayGanShort = extractShort(dayPillar.gan);
  const dayGanOhaeng = CHEONGAN_OHAENG[dayGanShort];
  const dayGanYinyang = CHEONGAN_YINYANG[dayGanShort];

  return {
    yearPillar, monthPillar, dayPillar, hourPillar,
    solarResult, ohaeng, sipsungs, stages, jijanggan, shinsal,
    dayGanInfo: {
      name: dayPillar.gan,
      ohaeng: dayGanOhaeng,
      yinyang: dayGanYinyang,
      icon: OHAENG_ICONS[dayGanOhaeng]
    }
  };
}

// 간이 월 지지 인덱스 (절기 기반 간이 판별)
function getMonthJijiIndex(month, day) {
  const boundaries = [
    { month: 2, day: 4 },   // 0: 인월 (입춘 ~)
    { month: 3, day: 6 },   // 1: 묘월 (경칩 ~)
    { month: 4, day: 5 },   // 2: 진월 (청명 ~)
    { month: 5, day: 6 },   // 3: 사월 (입하 ~)
    { month: 6, day: 6 },   // 4: 오월 (망종 ~)
    { month: 7, day: 7 },   // 5: 미월 (소서 ~)
    { month: 8, day: 7 },   // 6: 신월 (입추 ~)
    { month: 9, day: 8 },   // 7: 유월 (백로 ~)
    { month: 10, day: 8 },  // 8: 술월 (한로 ~)
    { month: 11, day: 7 },  // 9: 해월 (입동 ~)
    { month: 12, day: 7 },  // 10: 자월 (대설 ~)
    { month: 1, day: 5 }    // 11: 축월 (소한 ~)
  ];

  for (let i = boundaries.length - 1; i >= 0; i--) {
    const b = boundaries[i];
    if (i === 11) {
      if (month === 1 && day >= b.day) return 11;
      if (month === 1 && day < b.day) return 10; // 전년 자월
    }
    if (month === b.month && day >= b.day) return i;
    if (month > b.month && i < 11) return i;
  }

  // 1월 소한 이전 → 전년도 축월이 아닌 자월
  if (month === 1) return 10;
  // 2월 입춘 이전
  if (month === 2 && day < 4) return 11;

  return 0;
}
