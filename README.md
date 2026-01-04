# VidFlow Manager 2.0

VidFlow Manager는 보디빌딩 대회 영상 프로덕션의 전 과정을 관통하는 통합 비즈니스 엔진입니다.
Next.js 15, Supabase, TailwindCSS를 기반으로 구축되었습니다.

## 🚀 주요 기능

### 1. 🏗️ Pipeline & Delivery (파이프라인 및 납품)
- **Kanban Board**: 촬영(Shooting) → 편집(Editing) → 납품(Delivery) 단계별 시각화
- **Auto Delivery**: 편집 완료 시 고객에게 자동 알림 및 다운로드 링크 제공
- **Deliverables Validation**: 납품 링크 유효성 자동 검증 (Sentinel Agent)

### 2. 💰 Finance & Profit (재무 및 수익성)
- **Profit Analysis**: 패키지별/이벤트별 순수익(Net Profit) 자동 계산
- **Expense Tracking**: 인건비, 식대, 장비 렌탈 등 비용 관리
- **Worker Payroll**: 커미션 기반 작업자 정산 자동화

### 3. 📊 Analytics & BI (분석 및 인사이트)
- **Dashboard**: 실시간 매출 추이, 고객 세그먼트, 파이프라인 병목 분석
- **LTV Analysis**: 고객 생애 가치(LTV) 분석을 통한 VIP 관리
- **Performance**: 패키지 판매 효율 및 작업자 성과 분석

### 4. 📢 Admin & Support (관리 및 지원)
- **Announcements**: 시스템 공지사항 관리 (긴급/프로모션/점검 등)
- **Contact Management**: 고객 문의 상태 관리 (Pending → Resolved)
- **Activity Logs**: 시스템 전반의 활동 로그 감사 추적

---

## 🛠️ 기술 스택

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Styling**: TailwindCSS (Heavy Metal Theme)
- **State Management**: Zustand (+ Server Actions)
- **Icons**: Lucide React
- **Fonts**: Oswald (Headers), Inter (Body)

---

## 💻 설치 및 실행

### 1. 프로젝트 클론
```bash
git clone https://github.com/your-org/vidflow-manager.git
cd vidflow-manager
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경 변수 설정
`.env.example` 파일을 `.env.local`로 복사하고 Supabase 키를 입력하세요.
```bash
cp .env.example .env.local
```

### 4. 로컬 서버 실행
```bash
npm run dev
```
브라우저에서 `http://localhost:3000` 접속

---

## 🗂️ 폴더 구조

```
src/
├── app/                  # Next.js App Router (페이지)
│   ├── (public)/         # 공개 페이지 (로그인, 지원 등)
│   ├── admin/            # 관리자 전용 페이지
│   └── api/              # API 라우트
├── components/           # 재사용 가능한 UI 컴포넌트
│   ├── admin/            # 관리자용 컴포넌트 (Sidebar, Header)
│   └── ui/               # 공용 UI 요소 (Button, Modal 등)
├── features/             # 기능별 모듈 (핵심 비즈니스 로직)
│   ├── admin/            # 관리자 기능 (공지, 로그 등)
│   ├── analytics/        # 분석 기능 (차트, 통계)
│   ├── auth/             # 인증 관련
│   ├── delivery/         # 납품 관련
│   ├── finance/          # 재무 관련
│   ├── orders/           # 주문 관련
│   └── pipeline/         # 파이프라인(칸반) 관련
└── lib/                  # 유틸리티 및 설정
    ├── supabase/         # Supabase 클라이언트 및 타입
    └── utils.ts          # 공용 유틸리티 함수
```

---

## 🛡️ 권한 체계

- **ADMIN**: 모든 기능 접근 가능 (재무, 설정, 로그 포함)
- **EDITOR**: 파이프라인 관리, 납품 처리 가능 (재무/설정 접근 불가)
- **USER**: 마이페이지(주문 내역, 다운로드)만 접근 가능

---

© 2026 VidFlow. All rights reserved.
