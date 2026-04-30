# 🔮 바이브 사주 — AI 행운 리포트

> AI 사주 분석 · 진태양시 보정 v6.0

---

## 📋 Requirements (실행 요구사항)

### 시스템 요구사항
- **Node.js** >= 18.0.0
- **npm** (Node.js 설치 시 자동 포함)

### 외부 의존성
```
없음 (Zero Dependencies)
```
이 프로젝트는 순수 Node.js 내장 모듈(`http`, `fs`, `path`)만 사용합니다.  
`npm install` 없이 바로 실행 가능합니다.

### 사용 API 키 (배포 시 필요)
| 서비스 | 용도 | 등록 URL |
|:---|:---|:---|
| Google Analytics 4 | 사용자 행동 분석 | https://analytics.google.com |
| Kakao JavaScript SDK | 카카오톡 공유 | https://developers.kakao.com |

---

## 🚀 실행 방법

### 로컬 개발
```bash
# 서버 실행 (포트 3000)
npm run dev

# 또는 직접 실행
node server.js
```

브라우저에서 `http://localhost:3000` 접속

### 프로덕션 실행
```bash
npm start
```

---

## 📁 프로젝트 구조

```
saju-web/
├── server.js              # Node.js HTTP 서버 (API + 정적 파일)
├── package.json           # 프로젝트 설정
├── render.yaml            # Render 배포 설정
├── .env.production        # 환경 변수 템플릿
├── .gitignore
├── README.md
│
├── lib/                   # 백엔드 사주 계산 로직
│   ├── response_builder.js   # API 응답 빌더
│   ├── daily_fortune.js      # 일일 운세 + 서술형 생성
│   ├── saju_calculator.js    # 만세력 계산 엔진
│   └── constants.js          # 천간·지지·오행 상수
│
├── public/                # 프론트엔드 정적 파일
│   ├── index.html            # 메인 페이지 (PWA 메타태그 포함)
│   ├── style.css             # 다크모드 글래스모피즘 UI
│   ├── app.js                # 프론트엔드 렌더링 로직
│   ├── analytics.js          # GA4 래퍼 + 퍼널 추적
│   ├── manifest.json         # PWA 매니페스트
│   ├── sw.js                 # Service Worker v2
│   └── icons/
│       ├── icon-192.png
│       └── icon-512.png
│
└── test/
    └── boundary_test.js   # 정시 경계 규칙 테스트
```

---

## 🔧 환경 변수

| 변수 | 기본값 | 설명 |
|:---|:---|:---|
| `PORT` | `3000` | 서버 포트 (Render 자동 할당) |
| `ALLOWED_ORIGINS` | `*` | CORS 허용 도메인 (쉼표 구분) |

---

## 🌐 배포

### Render (권장)
1. GitHub에 Push
2. [render.com](https://render.com) → New Web Service → 저장소 연결
3. `render.yaml` 자동 인식
4. 환경 변수에 `ALLOWED_ORIGINS` 설정

### 배포 전 체크리스트
- [ ] GA4 Measurement ID 교체 (`G-XXXXXXXXXX`)
- [ ] Kakao JavaScript Key 교체 (`YOUR_KAKAO_JAVASCRIPT_KEY`)
- [ ] `ALLOWED_ORIGINS`을 실제 도메인으로 변경
- [ ] `.env` 파일이 `.gitignore`에 포함되어 있는지 확인

---

## 🧪 테스트

```bash
npm test
```

정시 경계(XX:00) 규칙 및 진태양시 보정 정확도를 검증합니다.

---

## 📌 기술 스택

| 영역 | 기술 |
|:---|:---|
| 서버 | Node.js (내장 HTTP, 프레임워크 없음) |
| 프론트 | Vanilla HTML/CSS/JS |
| 디자인 | 다크모드 글래스모피즘, Noto Sans KR |
| PWA | manifest.json + Service Worker |
| 분석 | Google Analytics 4 |
| 공유 | Kakao JS SDK + Clipboard API |
