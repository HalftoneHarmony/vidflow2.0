제공해주신 **Masterplan.md**와 **개선된 PRD(패키지 쇼케이스, 외부 링크 전송, 순수익 분석)**를 모두 반영하여, 실행 가능한 수준의 **초정밀 마스터플랜(v2.0)**을 수립했습니다.

이 문서는 개발의 나침반이자, 비즈니스 로직의 설계도입니다.

---

# VidFlow Manager 2.0 - Definitive Master Plan

> Mission: 판매(Sales) → 공정(Pipeline) → 전송(Delivery) → 정산(Profit)을 잇는 완전 자동화 비즈니스 엔진 구축
> 
> Core Value: Zero-Omission (누락 제로) & Profit-Centric (순수익 중심)
> 
> Architecture: Unified Monolith (Next.js 16 + Supabase)

---

## 🏗 1. Architecture & System Design

### 1.1 Architectural Philosophy

- **Unified Monolith**: 관리자(Admin)와 고객(Public)이 단일 코드베이스(Next.js App Router) 안에 공존하며, **Route Groups**로 논리적 경계를 분리합니다.
    
- **Server Actions First**: 데이터 변형(Mutation)은 API 라우트 없이 Server Actions에서 직접 처리하여, 클라이언트 번들을 줄이고 보안을 강화합니다.
    
- **Supabase Integrated**: DB, Auth, Realtime, Storage를 Supabase 하나로 통합하여 인프라 복잡도를 최소화합니다.
    

### 1.2 Directory Structure (Updated)

Bash

```
vidflow-manager/
├── .env.local                 # [Security] 환경 변수 (Supabase keys, PortOne secrets)
├── next.config.mjs            # [Config] Next.js 설정 (Image domains, headers)
├── tailwind.config.ts         # [Design] Heavy Metal 테마 설정 (Colors, Fonts)
├── components.json            # [UI] Shadcn/UI 설정
├── middleware.ts              # [Edge] 인증 가드(Auth Guard) 및 라우팅 리다이렉트
├── types.d.ts                 # [Global] 전역 타입 정의
│
├── src/
│   ├── app/                   # 🚦 [Routing Layer] 오직 라우팅과 레이아웃만 담당
│   │   ├── (auth)/            # 🔐 인증 관련 (Route Group)
│   │   │   ├── layout.tsx     # 인증 페이지 전용 레이아웃 (Centered Box)
│   │   │   ├── login/         # /login
│   │   │   └── join/          # /join
│   │   │
│   │   ├── (public)/          # 🌍 고객/일반 사용자 영역 (Public Layout)
│   │   │   ├── layout.tsx     # GNB(메뉴), Footer 포함
│   │   │   ├── page.tsx       # Landing Page
│   │   │   ├── showcase/      # ✨패키지 포트폴리오 갤러리 (/showcase)
│   │   │   ├── events/        # 이벤트 목록 및 상세
│   │   │   │   └── [id]/      # /events/123 (상세 및 주문)
│   │   │   └── my-page/       # 👤 마이페이지 (주문내역, 다운로드)
│   │   │
│   │   ├── (admin)/           # 🛠 관리자 영역 (Admin Sidebar Layout)
│   │   │   ├── layout.tsx     # 관리자 전용 Sidebar, Topbar, Auth Check
│   │   │   ├── dashboard/     # 📊 수익 분석 및 KPI 대시보드
│   │   │   ├── pipeline/      # 🏭 칸반 보드 (핵심 공정)
│   │   │   ├── finance/       # 💰 매출/지출 관리
│   │   │   ├── products/      # 📦 패키지 및 쇼케이스 관리
│   │   │   └── users/         # 👥 사용자 관리
│   │   │
│   │   ├── api/               # ⚡ [Server Endpoints]
│   │   │   └── webhooks/      # PortOne 결제 알림 처리
│   │   │       └── portone/   # POST /api/webhooks/portone
│   │   │
│   │   ├── error.tsx          # Global Error UI (Heavy Metal Theme)
│   │   ├── not-found.tsx      # 404 Page
│   │   └── layout.tsx         # Root Layout (Fonts, Providers)
│   │
│   ├── features/              # 📦 [Business Domain Layer] 핵심 비즈니스 로직의 집합
│   │   ├── auth/              # 인증 기능
│   │   │   ├── actions.ts     # login, logout, signup (Server Actions)
│   │   │   └── components/    # LoginForm, AuthGuard
│   │   │
│   │   ├── showcase/          # [NEW] 쇼케이스 기능
│   │   │   ├── components/    # ComparisonPlayer, PackageCard
│   │   │   └── types.ts       # MediaAsset 타입 정의
│   │   │
│   │   ├── pipeline/          # [CORE] 공정 관리 기능
│   │   │   ├── actions.ts     # updateCardStatus, assignWorker
│   │   │   ├── components/    # KanbanBoard, StageColumn, TaskCard
│   │   │   ├── hooks/         # usePipelineDrag (dnd-kit 로직)
│   │   │   └── utils.ts       # 상태별 색상 매핑 함수
│   │   │
│   │   ├── delivery/          # [CORE] 전송 및 링크 관리 기능
│   │   │   ├── actions.ts     # submitExternalLink, verifyLink
│   │   │   ├── components/    # LinkInputModal, DownloadButton
│   │   │   └── logic.ts       # "수령 확인" 로직
│   │   │
│   │   ├── finance/           # [BI] 재무 분석 기능
│   │   │   ├── queries.ts     # 순수익 계산 SQL/Supabase Query
│   │   │   └── components/    # ProfitChart, ExpenseTable
│   │   │
│   │   └── orders/            # 주문 및 결제 기능
│   │       ├── services.ts    # PortOne API 호출 로퍼
│   │       └── components/    # OrderHistoryItem, CartDrawer
│   │
│   ├── shared/                # 🧱 [Shared Layer] 도메인에 종속되지 않는 재사용 모듈
│   │   ├── components/        # UI Components
│   │   │   ├── ui/            # Shadcn Base (Button, Input, Dialog...)
│   │   │   ├── layouts/       # Container, Section, Grid
│   │   │   └── icons/         # 프로젝트 전용 아이콘 (Lucide 래핑)
│   │   ├── hooks/             # Global Hooks (useToast, useMediaQuery)
│   │   └── utils/             # Pure Functions (cn, formatWon, formatDate)
│   │
│   ├── lib/                   # 🔌 [Infrastructure Layer] 외부 라이브러리 설정
│   │   ├── supabase/          # Supabase Clients (Server, Client, Admin)
│   │   ├── portone/           # PortOne SDK 설정
│   │   ├── react-query/       # QueryClient Provider 설정
│   │   └── ai-adapter/        # [AI] LLM Interface (OpenAI/Gemini switchable)
│   │
│   ├── stores/                # 🏪 [Client State] 전역 클라이언트 상태 (Zustand)
│   │   ├── use-ui-store.ts    # 사이드바 토글, 모달 상태 등
│   │   └── use-cart-store.ts  # 장바구니 상태
│   │
│   └── styles/                # 🎨 [Style Layer]
│       ├── globals.css        # Tailwind Base, Custom Utilities
│       └── fonts.ts           # Next/Font 설정 (Oswald, Inter)
```

---

## 💾 2. Database Schema Strategy (The Business Engine)

비즈니스 엔진 구동을 위해 **관계형 데이터베이스 설계**가 핵심입니다.

### 2.1 Key Tables

1. **`packages`**: 상품 정보 (가격, 포함 내역, 옵션).
    
2. **`orders`**: 주문 내역 (결제 정보, 사용자 매핑).
    
3. **`pipeline_cards`**: `orders`와 1:1 매핑. 현재 작업 단계(`stage`) 추적.
    
4. **`deliverables` (Core)**:
    
    - `card_id` (FK)
        
    - `type` (e.g., "MAIN_VIDEO", "PHOTO_ZIP")
        
    - `external_link_url` (관리자가 입력한 Google Drive/Dropbox 링크)
        
    - `is_delivered` (Boolean)
        
    - `delivered_at` (Timestamp)
        
5. **`expenses`**:  대회별 운영 지출 (인건비, 식비 등) - 순수익 계산용.
    

---

## 🔒 4. Critical Logic & Rules

### 4.1 누락 방지 로직 (The Firewall)

1. **자동 생성**: 결제가 확인되면 `Webhook`이 즉시 `pipeline_cards`를 생성합니다. 사람의 개입은 0입니다.
    
2. **전송 잠금 (Delivery Lock)**: `deliverables` 테이블의 모든 항목에 `external_link_url`이 `null`이 아니어야만 카드 상태를 `DELIVERED`로 변경할 수 있습니다.
    

### 4.2 외부 링크 전송 로직 (Safe Delivery)

1. **Input**: 관리자가 편집 툴(Notion style)이나 모달에서 외부 링크를 붙여넣습니다.
    
2. **Display**: 고객의 마이페이지에서는 원본 URL이 직접 노출되기보다, 스타일링된 **[다운로드 하러 가기]** 버튼으로 제공됩니다.
    
3. **Tracking**: 고객이 버튼을 클릭하는 순간 서버 액션을 트리거하여 `clicked_at` 시간을 기록, 수령 여부를 증빙합니다.
    

---

## 📊 5. Success Metrics (KPIs)

|**Metric**|**Target**|**Description**|
|---|---|---|
|**Omission Rate**|**0%**|미전송 건수 0건 달성 (Systematic Block)|
|**Profit Accuracy**|**99.9%**|예상 순수익과 실제 정산금의 일치도|
|**Process Time**|**< 3s**|결제 직후 작업 카드 생성까지 걸리는 시간|
|**Showcase Engagement**|**High**|쇼케이스 페이지 체류 시간 및 패키지 업셀링(상위 모델 선택) 비율|
