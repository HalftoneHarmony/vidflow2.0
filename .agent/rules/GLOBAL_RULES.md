# VidFlow Manager 2.0 - Global Antigravity Rules

> 이 파일은 VidFlow Manager 2.0 프로젝트의 AI 에이전트 행동 규칙을 정의합니다.
> 모든 코드 생성, 수정, 리뷰 시 이 규칙들을 엄격히 준수하세요.

---

## 🏛️ 1. 프로젝트 개요 (Project Context)

**VidFlow Manager 2.0**은 보디빌딩 대회 영상 프로덕션의 전 과정을 관리하는 **통합 비즈니스 엔진**입니다.

### 핵심 미션
- **Zero-Omission (누락 제로)**: 인간의 개입을 최소화하여 시스템적으로 실수를 차단
- **Profit-Centric (순수익 중심)**: 총 매출이 아닌 실제 순수익을 추적

### 핵심 가치
1. **Zero-Omission Architecture**: 결제 즉시 파이프라인 자동 생성
2. **Verified Delivery System**: 외부 링크 유효성 사전 검증
3. **Profit Intelligence**: 인건비 자동 계산으로 정확한 순이익 산출
4. **Showcase-Driven Sales**: 영상 비교 플레이어를 통한 시각적 세일즈

---

## 🔧 2. 기술 스택 (Tech Stack)

| 영역 | 기술 |
|------|------|
| **Framework** | Next.js 16 (App Router) |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth |
| **Styling** | Tailwind CSS + Shadcn/UI |
| **State (Server)** | React Query / Server Components |
| **State (Client)** | Zustand (제한적 UI 상태만) |
| **Payments** | PortOne SDK |
| **DnD** | @dnd-kit |
| **Charts** | Recharts |
| **AI** | Adapter Pattern (OpenAI/Gemini 교체 가능) |
| **Testing** | Playwright (E2E) |
| **Validation** | Zod |

---

## 📁 3. 디렉토리 구조 (Directory Structure)

**절대 위반 금지**: 다음 구조를 벗어나는 파일 생성을 금지합니다.

```
vidflow-manager/
├── src/
│   ├── app/                   # 🚦 오직 라우팅과 레이아웃만
│   │   ├── (auth)/            # 인증 관련
│   │   ├── (public)/          # 고객/일반 사용자 영역
│   │   ├── (admin)/           # 관리자 영역
│   │   └── api/webhooks/      # Webhook (PortOne 등)
│   │
│   ├── features/              # 📦 비즈니스 도메인 로직
│   │   ├── auth/              # 인증
│   │   ├── showcase/          # 쇼케이스
│   │   ├── pipeline/          # 공정 관리 (Core)
│   │   ├── delivery/          # 전송 관리 (Core)
│   │   ├── finance/           # 재무/BI
│   │   └── orders/            # 주문/결제
│   │
│   ├── shared/                # 🧱 도메인 독립적 모듈
│   │   ├── components/ui/     # Shadcn/UI 컴포넌트
│   │   ├── hooks/             # 공용 훅
│   │   └── utils/             # 유틸리티 함수
│   │
│   ├── lib/                   # 🔌 외부 라이브러리 설정
│   │   ├── supabase/          # Supabase Clients
│   │   ├── portone/           # PortOne SDK
│   │   ├── react-query/       # QueryClient
│   │   └── ai-adapter/        # AI 모델 어댑터
│   │
│   ├── stores/                # 🏪 Zustand (UI 상태만)
│   └── styles/                # 🎨 Tailwind/Fonts
```

### 규칙
- `src/app`: 비즈니스 로직 금지. 라우팅과 레이아웃만.
- `src/features/[domain]`: 관련 컴포넌트, 액션, 훅은 반드시 도메인별 응집 (Colocation)
- `src/shared`: 특정 도메인에 종속되지 않는 순수 UI/유틸리티만

---

## ⚙️ 4. 핵심 개발 원칙 (Core Principles)

### 4.1 아키텍처 원칙

1. **Unified Monolith**
   - `(public)`, `(admin)`, `(auth)` Route Groups의 경계 침범 금지
   - 단일 코드베이스 유지

2. **Server Actions First**
   - 모든 데이터 Mutation은 API Route 대신 **Server Actions** 사용
   - 클라이언트 번들 최소화

3. **Single Source of Truth**
   - 모든 비즈니스 데이터는 Supabase에 중앙화
   - 프론트엔드 상태와 DB 충돌 시 → DB 우선

### 4.2 타입 안전성

- **`any` 타입 사용 절대 금지**
- Supabase Database Types와 Zod 스키마로 End-to-End 타입 안전성 보장
- Server-Side에서 Zod를 통한 입력값 검증 필수

### 4.3 트랜잭션 원자성

```
결제 완료 → 주문 생성 → 파이프라인 생성 → 산출물 목록 생성
```
위 플로우는 **단일 트랜잭션**으로 처리. 하나라도 실패 시 전체 롤백.

---

## 🎨 5. 디자인 시스템 (Design System)

### 테마 컨셉: **"Heavy Metal & Muscle"**

### 컬러 팔레트
| 용도 | 컬러 |
|------|------|
| Background | Deep Black (#000000) ~ Dark Metal (#1C1C1E) |
| Primary Action | Impact Red (#FF0000) |
| Status - Waiting | Gray |
| Status - Editing | Blue |
| Status - Ready | Gold |
| Status - Delivered | Red |

### 타이포그래피
- **헤드라인**: Oswald / Bebas Neue (굵고 강함)
- **본문**: Inter (가독성)

### UI 원칙
1. `border-radius` 최소화 (Sharp Edges)
2. 모든 액션에 즉각적 시각 피드백 (Optimistic Update, Toast, Animation)
3. **Admin (PC)**: 고밀도 대시보드
4. **Field/User (Mobile)**: 크고 단순한 터치 인터페이스

---

## 🔒 6. 비즈니스 로직 규칙 (Business Rules)

### 6.1 누락 방지 로직 (The Firewall)

1. **자동 생성**: 결제 Webhook 수신 시 `pipeline_cards` 즉시 생성 (인간 개입 0)
2. **Stage Gate**: `deliverables`의 모든 항목에 유효한 링크가 있어야만 `DELIVERED` 상태 변경 가능

### 6.2 파이프라인 5단계

```
WAITING → SHOOTING → EDITING → READY → DELIVERED
```

- 각 단계 이동 시 조건(Condition) 충족 검사 필수
- `READY` → `DELIVERED`: 모든 산출물 링크 존재 확인

### 6.3 외부 링크 전송 규칙

1. 관리자가 링크 등록 시 `HEAD` 요청으로 유효성 검증
2. 403/404 상태 링크는 저장 거부
3. 고객 다운로드 클릭 시 `clicked_at` 기록 (수령 증빙)

### 6.4 정산 자동화

- 작업 완료(`DELIVERED`) 시 `assignee_id`의 `commission_rate` 조회
- `expenses` 테이블에 `LABOR` 비용 자동 Insert
- `is_auto_generated = true`로 수동 입력과 구분

---

## 🗄️ 7. 데이터베이스 스키마 (Key Tables)

### 핵심 테이블
| 테이블 | 설명 |
|--------|------|
| `profiles` | 사용자 프로필 (commission_rate 포함) |
| `events` | 대회 정보 |
| `packages` | 패키지 상품 (composition JSONB) |
| `showcase_items` | 쇼케이스 미디어 |
| `orders` | 주문 (결제 내역) |
| `pipeline_cards` | 작업 카드 (stage, assignee_id, stage_entered_at) |
| `deliverables` | 산출물 (external_link_url, link_status, is_downloaded) |
| `expenses` | 지출 (is_auto_generated) |

### RLS (Row Level Security)
- `(admin)` 데이터: 관리자만 접근
- `(my-page)` 데이터: 해당 사용자만 접근

### 병목 감지
- `pipeline_cards.stage_entered_at` 활용
- `NOW() - stage_entered_at > 3 days` → 빨간색 경고 표시

---

## 🚫 8. 금지 사항 (DO NOT)

### 절대 하지 말 것
1. ❌ `any` 타입 사용
2. ❌ `src/app` 폴더에 비즈니스 로직 작성
3. ❌ API Route 대신 Server Actions 사용 가능한 곳에서 API Route 생성
4. ❌ Route Groups 경계 침범 (`(public)`에서 `(admin)` 데이터 직접 접근 등)
5. ❌ 검증 없는 외부 링크 저장
6. ❌ 산출물 링크 없이 `DELIVERED` 상태 전환
7. ❌ 트랜잭션 없이 결제-주문-파이프라인 분리 처리
8. ❌ Zustand를 서버 상태 관리에 사용
9. ❌ 둥글고 부드러운 UI (Heavy Metal 테마 위반)
10. ❌ 특정 AI 모델에 종속된 코드 (Adapter Pattern 필수)

---

## ✅ 9. 필수 사항 (MUST DO)

### 항상 해야 할 것
1. ✅ Zod로 모든 입력값 서버 사이드 검증
2. ✅ Supabase Database Types 사용
3. ✅ Server Actions로 Mutation 처리
4. ✅ 결제-주문-파이프라인 단일 트랜잭션 처리
5. ✅ 외부 링크 등록 시 `HEAD` 요청으로 유효성 검증
6. ✅ 작업 완료 시 인건비 자동 계산 및 등록
7. ✅ Optimistic Update로 즉각적 UI 피드백
8. ✅ Heavy Metal 테마 (Deep Black + Impact Red) 준수
9. ✅ Supabase Realtime으로 실시간 상태 동기화
10. ✅ 에러 발생 시에도 일관된 테마 UI 유지

---

## 📊 10. 성공 지표 (KPIs)

| 지표 | 목표 | 설명 |
|------|------|------|
| **Omission Rate** | **0%** | 미전송 건수 0건 |
| **Link Rot Rate** | **0%** | 유효하지 않은 링크 전송 0건 |
| **Profit Accuracy** | **99.9%** | 예상 순수익과 실제 정산금 일치도 |
| **Process Time** | **< 3s** | 결제 후 작업 카드 생성까지 시간 |
| **CS 감소율** | **30% ▼** | "언제 나와요?", "다운 안 돼요" 문의 감소 |

---

## 👥 11. 에이전트 역할 참조 (Agent Roles)

| 에이전트 | 역할 | 핵심 책임 |
|----------|------|-----------|
| **Overlord** | Project Lead | 전략적 목표 달성, 아키텍처 무결성 수호 |
| **Vulcan** | Database & Backend | DB 설계, 트랜잭션, RLS, 링크 검증 |
| **Venom** | Frontend & Design | Heavy Metal 테마, UI/UX, 시각적 피드백 |
| **Dealer** | Sales & Public | 결제 흐름, 쇼케이스, 고객 경험 |
| **Gear** | Pipeline & Workflow | 칸반, Stage Gate, 병목 감지 |
| **Sentinel** | QA & Delivery | 링크 검증, 수령 증빙, E2E 테스트 |
| **Gold** | BI & Finance | 순수익 계산, 정산 자동화, 데이터 시각화 |
| **Droid** | AI & Optimization | AI 어댑터, 성능 최적화, 예지 보전 |

---

## 🔄 12. 의사결정 우선순위

충돌 발생 시 다음 순서로 결정:

1. **Data Integrity** (데이터 무결성)
2. **Operational Safety** (누락/사고 방지)
3. **Performance** (속도)
4. **Aesthetics** (디자인)

---

*Last Updated: 2026-01-04*
