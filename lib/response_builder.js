/**
 * API 응답 구조 빌더 v2
 * summary(Daily Report) / detail(Pro Chart) 분리
 */

import { calculateSaju, analyzeOhaeng } from './calculator.js';
import { OHAENG_ICONS, CHEONGAN_OHAENG, CHEONGAN_YINYANG } from './constants.js';
import { calcTodayIljin, estimateYongshin, calcGoldenTime, generateDailyReport, generateNarrative } from './daily_fortune.js';

export function buildApiResponse(birthYear, birthMonth, birthDay, birthHour, birthMinute, gender, timeUnknown = false) {
  const result = calculateSaju(
    birthYear, birthMonth, birthDay,
    timeUnknown ? 12 : birthHour,
    timeUnknown ? 0 : birthMinute,
    gender
  );

  // 오늘의 일진
  const todayIljin = calcTodayIljin();

  // 용신 추정
  const yongshin = estimateYongshin(result.ohaeng);

  // 골든타임
  const goldenTime = calcGoldenTime(yongshin);

  // 감성 데일리 리포트
  const dailyReport = generateDailyReport(result.dayGanInfo, todayIljin, result.ohaeng);

  // 서술형 운세
  const narrative = generateNarrative(result.dayGanInfo, todayIljin, result.ohaeng, goldenTime);

  // ─── summary: Daily Report (간략 보기) ───
  const summary = {
    dayGan: {
      name: result.dayGanInfo.name,
      ohaeng: result.dayGanInfo.ohaeng,
      yinyang: result.dayGanInfo.yinyang,
      icon: result.dayGanInfo.icon
    },
    dailyReport,
    narrative,
    goldenTime,
    yongshin: { element: yongshin, icon: OHAENG_ICONS[yongshin] },
    ohaengRatio: {},
    fourPillars: {
      year: { gan: result.yearPillar.gan, ji: result.yearPillar.ji },
      month: { gan: result.monthPillar.gan, ji: result.monthPillar.ji },
      day: { gan: result.dayPillar.gan, ji: result.dayPillar.ji },
      hour: timeUnknown
        ? { gan: '미상', ji: '미상' }
        : { gan: result.hourPillar.gan, ji: result.hourPillar.ji }
    },
    trueSolarTime: timeUnknown
      ? { clockTime: '미상', correctedTime: '미상', message: '시간 미상 — 3주 분석' }
      : {
          clockTime: `${String(birthHour).padStart(2, '0')}:${String(birthMinute).padStart(2, '0')}`,
          correctedTime: `${String(result.solarResult.trueSolarTime.getHours()).padStart(2, '0')}:${String(result.solarResult.trueSolarTime.getMinutes()).padStart(2, '0')}`,
          message: result.solarResult.message
        }
  };

  for (const [key, val] of Object.entries(result.ohaeng)) {
    summary.ohaengRatio[key] = {
      icon: val.icon, count: val.count,
      ratio: val.ratio, status: val.status, chars: val.chars
    };
  }

  // ─── detail: Pro Chart (상세 보기) ───
  const detail = {
    sipsung: {
      year: { gan: result.sipsungs.year_gan, ji: result.sipsungs.year_ji },
      month: { gan: result.sipsungs.month_gan, ji: result.sipsungs.month_ji },
      day: { gan: '본인', ji: '—' },
      hour: timeUnknown ? { gan: '미상', ji: '미상' } : { gan: result.sipsungs.hour_gan, ji: result.sipsungs.hour_ji }
    },
    jijanggan: {
      year: result.jijanggan.year, month: result.jijanggan.month,
      day: result.jijanggan.day,
      hour: timeUnknown ? { yeoqi: '—', junggi: '—', jeonggi: '—' } : result.jijanggan.hour
    },
    twelveStages: {
      year: result.stages.year, month: result.stages.month,
      day: result.stages.day, hour: timeUnknown ? '미상' : result.stages.hour
    },
    shinsal: {
      dohwa: result.shinsal.dohwa ? { exists: true, positions: result.shinsal.dohwa } : { exists: false },
      yeokma: result.shinsal.yeokma ? { exists: true, positions: result.shinsal.yeokma } : { exists: false },
      hwagae: result.shinsal.hwagae ? { exists: true, positions: result.shinsal.hwagae } : { exists: false },
      goegang: result.shinsal.goegang
    },
    ohaengDetail: result.ohaeng
  };

  // ─── meta ───
  const meta = {
    version: '6.0',
    calculationBasis: '서울 기준',
    trueSolarTimeApplied: !timeUnknown,
    timeUnknown,
    boundaryRule: 'XX:00 (전통 정시 경계)',
    solarCorrection: {
      longitudeCorrection: timeUnknown ? 0 : result.solarResult.longitudeCorrection,
      equationOfTime: timeUnknown ? 0 : result.solarResult.equationOfTime,
      totalCorrection: timeUnknown ? 0 : result.solarResult.totalCorrection,
      message: timeUnknown ? '태어난 시간 미상 — 3주 분석 진행' : result.solarResult.message
    },
    timestamp: new Date().toISOString()
  };

  return { summary, detail, meta };
}
