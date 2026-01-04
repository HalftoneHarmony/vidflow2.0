# 🎯 VidFlow Manager - 하위 에이전트 태스크 배분

**작성일**: 2026-01-05 03:45
**현재 상태**: DB 통합 완료, 빌드 성공, 커밋/푸시 완료

---

## 📊 현재 앱 구조

```
src/
├── app/
│   ├── (public)/          # 공개 페이지
│   │   ├── about/         # About 페이지 ✅
│   │   ├── events/        # 이벤트 목록 ✅
│   │   ├── showcase/      # 포트폴리오 ✅
│   │   ├── support/       # 지원 페이지 ✅ (FAQ, Privacy, Terms, Contact)
│   │   └── my-page/       # 내 주문 내역 ✅
│   ├── admin/             # 관리자 페이지
│   │   ├── dashboard/     # 대시보드 ✅ (DB 함수 연동됨)
│   │   ├── events/        # 이벤트 관리 ✅
│   │   ├── products/      # 패키지 관리 ✅
│   │   ├── pipeline/      # 파이프라인 ✅
│   │   ├── finance/       # 재무 관리 ✅
│   │   ├── users/         # 사용자 관리 ✅
│   │   ├── about/         # About 관리 ✅
│   │   ├── showcase/      # Showcase 관리 ✅
│   │   └── delivery/      # 납품 관리 ✅
├── features/
│   ├── analytics/actions.ts  # 분석 서버 액션 ✅ NEW
│   ├── admin/actions.ts      # 관리자 서버 액션 ✅ NEW
│   └── support/actions.ts    # 지원 서버 액션 ✅ NEW
```

---

## 🔧 새로 추가된 DB 기능 (사용 가능)

### 뷰 (Views)
- `v_daily_revenue` - 일별 매출
- `v_monthly_growth` - 월별 성장률
- `v_customer_ltv` - 고객 생애 가치
- `v_event_analytics` - 이벤트 분석
- `v_pipeline_bottleneck` - 파이프라인 병목

### 함수 (Functions)
- `get_comprehensive_stats()` - 종합 통계
- `get_event_profitability(event_id)` - 이벤트 수익성
- `get_customer_segments()` - 고객 세그먼트
- `get_weekly_stats()` - 주간 통계
- `search_orders(query)` - 주문 검색
- `duplicate_event(event_id, title, date)` - 이벤트 복제

---

## 👤 에이전트 1: UI/UX 마스터

### 🎯 미션: Support 페이지 디자인 개선 & 사용자 설정 UI

### 태스크 목록

#### 1. Support 페이지 UI 개선 ✅ DONE
**위치**: `src/app/(public)/support/SupportPageClient.tsx`

Heavy Metal 테마에 맞게 디자인 개선 완료:
- ✅ FAQ 아코디언 애니메이션 추가 (smooth expand/collapse)
- ✅ 카테고리별 필터링 UI (일반/주문/결제/계정/서비스)
- ✅ FAQ 검색 기능 추가
- ✅ Contact Form 검증 피드백 개선 (실시간 유효성 검사)
- ✅ 모바일 반응형 최적화 (가로 스크롤 탭)
- ✅ 성공 애니메이션 오버레이
- ✅ 향상된 스타일링 및 아이콘

#### 2. 사용자 설정 페이지 생성 ✅ DONE
**위치**: `src/app/(public)/settings/page.tsx` (신규 생성)

사용할 액션:
```typescript
import { getUserPreferences, updateUserPreferences } from "@/features/admin/actions";
```

구현된 UI:
- ✅ 이메일 알림 토글
- ✅ SMS 알림 토글
- ✅ 언어 선택 (ko/en) - 카드 스타일
- ✅ 테마 선택 (light/dark/system) - 카드 스타일
- ✅ 타임존 선택 드롭다운
- ✅ 저장 버튼 (플로팅 스타일)
- ✅ Heavy Metal 테마 적용

#### 3. 공지사항 모달 컴포넌트 ✅ DONE
**위치**: `src/components/ui/announcement-modal.tsx` (신규 생성)

구현된 기능:
- ✅ 타입별 다른 색상/아이콘 (info/warning/promotion/maintenance/urgent)
- ✅ 고정 배지 표시
- ✅ 날짜 포맷팅
- ✅ 긴급 공지 시 상단 애니메이션 바
- ✅ Heavy Metal 테마 적용


---

## 👤 에이전트 2: 관리자 기능 마스터 ✅ DONE

### 🎯 미션: 문의 관리 & 활동 로그 UI

### 태스크 목록

#### 1. 문의 관리 페이지 ✅ DONE
**위치**: `src/app/admin/contacts/ContactsClient.tsx`

구현 완료:
- ✅ 문의 목록 테이블 (상태별 필터링 + 검색)
- ✅ 상태 변경 버튼 (pending → in_progress → resolved → closed)
- ✅ 관리자 메모 입력
- ✅ 상세 보기 모달 (연락처 정보, 문의 내용, 상태 변경)

#### 2. 활동 로그 뷰어 ✅ DONE
**위치**: `src/app/admin/logs/LogsClient.tsx`

구현 완료:
- ✅ 타임라인 형태 로그 표시 (날짜별 그룹화)
- ✅ 액션 타입별 필터링 (다중 선택)
- ✅ 사용자별 필터링
- ✅ 날짜 범위 필터
- ✅ 더 불러오기 (페이지네이션)

#### 3. 공지사항 관리 페이지 ✅ DONE
**위치**: `src/app/admin/announcements/AnnouncementsClient.tsx`

구현 완료:
- ✅ 공지사항 목록 (타입별 아이콘 및 색상)
- ✅ 새 공지사항 생성 폼 (모달)
- ✅ 타입 선택 (info/warning/promotion/maintenance/urgent)
- ✅ 만료일 설정
- ✅ 고정 여부 토글

---

## 👤 에이전트 3: Analytics 마스터

### 🎯 미션: 분석 대시보드 & 차트 UI

### 태스크 목록

#### 1. Analytics 대시보드 페이지
**위치**: `src/app/admin/analytics/page.tsx` (신규 생성)

사용할 액션:
```typescript
import {
  getComprehensiveStats,
  getDailyRevenue,
  getMonthlyGrowth,
  getCustomerSegments,
  getCustomerLTV,
  getPipelineBottleneck
} from "@/features/analytics/actions";
```

필요한 UI:
- 매출 추이 차트 (일별/월별 전환)
- 고객 세그먼트 파이 차트 (VIP/단골/신규/휴면)
- 고객 LTV 랭킹 테이블
- 파이프라인 병목 분석 시각화

#### 2. 이벤트 상세 분석 개선
**위치**: `src/features/finance/components/EventDetailAnalysis.tsx`

사용할 액션:
```typescript
import { getEventProfitability } from "@/features/analytics/actions";
```

필요한 개선:
- DB 함수 `get_event_profitability` 연동
- 패키지별 판매 현황 시각화
- 비용 카테고리별 분석 차트

#### 3. 검색 기능 구현
**위치**: `src/components/admin/global-search.tsx` (신규 생성)

사용할 액션:
```typescript
import { searchOrders } from "@/features/analytics/actions";
```

필요한 UI:
- 헤더에 검색 바
- 검색 결과 드롭다운
- 주문/고객/이벤트 통합 검색

---

## 👤 에이전트 4: 백엔드/통합 마스터

### 🎯 미션: 타입 생성 & 누락된 연동 완료

### 태스크 목록

#### 1. Supabase 타입 자동 생성 ✅ DONE
```bash
npx supabase gen types typescript --project-id tebgwbmdaoyaigzjwkra > src/lib/supabase/database.types.ts
```

> ⚠️ CLI 로그인 필요. 수동으로 타입 정의 (`database.types.ts`) 복원 및 새 테이블 타입 추가 완료.

#### 2. 사이드바 네비게이션 업데이트 ✅ DONE
**위치**: `src/components/admin/sidebar.tsx`

새 페이지들 추가 완료:
- ✅ Analytics (/admin/analytics) - TrendingUp 아이콘
- ✅ Contacts (/admin/contacts) - MessageSquare 아이콘
- ✅ Logs (/admin/logs) - ScrollText 아이콘
- ✅ Announcements (/admin/announcements) - Megaphone 아이콘

#### 3. 미들웨어 권한 체크 개선 ✅ DONE
**위치**: `src/middleware.ts`

- ✅ ADMIN_ONLY_ROUTES 배열 추가
- ✅ EDITOR가 ADMIN 전용 경로 접근 시 대시보드로 리다이렉트

#### 4. Cron Job 설정 (Optional) ⏳ PENDING
Supabase에서 주기적으로 실행할 함수들:
- `refresh_materialized_views()` - 매시간
- `cleanup_old_logs(90)` - 매일
- `update_daily_aggregate()` - 매일 자정

> Supabase Dashboard에서 설정 필요

#### 5. 테스트 데이터 생성 ✅ DONE
**위치**: `supabase/seed_new_tables.sql` (NEW)

새 테이블들에 대한 테스트 데이터 추가:
- ✅ 샘플 공지사항 (4개)
- ✅ 샘플 문의 (5개)
- ✅ 샘플 활동 로그 (7개)
- ✅ 샘플 사용자 설정

#### 6. 신규 페이지 기본 구조 생성 ✅ DONE (BONUS)
다른 에이전트를 위한 페이지 스켈레톤 생성:
- ✅ `src/app/admin/analytics/page.tsx`
- ✅ `src/app/admin/contacts/page.tsx`
- ✅ `src/app/admin/logs/page.tsx`
- ✅ `src/app/admin/announcements/page.tsx`


---

## 📋 실행 순서 권장

1. **에이전트 4** (백엔드): 타입 생성 & 사이드바 업데이트 먼저
2. **에이전트 2** (관리자): 문의/로그/공지 관리 페이지
3. **에이전트 3** (Analytics): 분석 대시보드 & 차트
4. **에이전트 1** (UI/UX): Support 개선 & 사용자 설정

---

## 🚀 시작 전 확인사항

1. `npm run dev -- -p 3001` 실행 중인지 확인
2. Supabase SQL Editor에서 아래 파일 실행했는지 확인:
   - `supabase/db_optimization_for_editor.sql`
   - `supabase/master_sql_for_editor.sql`
3. 브랜치 생성: `git checkout -b feature/[agent-number]-[feature-name]`

---

## 💡 참고할 기존 코드

- 서버 액션 예시: `src/features/analytics/actions.ts`
- 관리자 테이블 UI: `src/features/finance/components/EventProfitTable.tsx`
- 차트 컴포넌트: `src/features/finance/components/FinanceCharts.tsx`
- 모달 컴포넌트: `src/features/pipeline/components/TaskDetailModal.tsx`
- 폼 컴포넌트: `src/app/(public)/support/SupportPageClient.tsx`

---

**각 에이전트는 완료 후 PR을 생성하고 main 브랜치에 머지해주세요!**
