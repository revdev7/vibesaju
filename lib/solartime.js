/**
 * 진태양시(True Solar Time) 계산 모듈
 * 서울 기준(경도 126.97°E) 진태양시 보정
 */

import { SEOUL_LONGITUDE, KST_STANDARD_LONGITUDE } from './constants.js';

export function calculateEquationOfTime(dayOfYear) {
  const B = (2 * Math.PI * (dayOfYear - 81)) / 365;
  return 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);
}

export function getDayOfYear(year, month, day) {
  const date = new Date(year, month - 1, day);
  const start = new Date(year, 0, 0);
  return Math.floor((date - start) / (1000 * 60 * 60 * 24));
}

export function calculateTrueSolarTime(birthDatetime) {
  const longitudeCorrection = (SEOUL_LONGITUDE - KST_STANDARD_LONGITUDE) * 4.0;
  const dayOfYear = getDayOfYear(
    birthDatetime.getFullYear(),
    birthDatetime.getMonth() + 1,
    birthDatetime.getDate()
  );
  const equationOfTime = calculateEquationOfTime(dayOfYear);
  const totalCorrection = longitudeCorrection + equationOfTime;
  const trueSolarTime = new Date(birthDatetime.getTime() + totalCorrection * 60 * 1000);

  return {
    trueSolarTime,
    longitudeCorrection: Math.round(longitudeCorrection * 100) / 100,
    equationOfTime: Math.round(equationOfTime * 100) / 100,
    totalCorrection: Math.round(totalCorrection * 100) / 100,
    message: '서울 기준 진태양시 보정이 완료되었습니다'
  };
}
