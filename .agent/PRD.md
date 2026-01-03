# VidFlow Manager 2.0 - Integrated Business Engine PRD

## 1. 개요 (Executive Summary)

VidFlow Manager 2.0은 보디빌딩 대회 영상 프로덕션의 전 과정을 관통하는 통합 비즈니스 엔진입니다.

단순한 작업 관리를 넘어, **판매(Sales)**가 **공정(Pipeline)**을 자동으로 생성하고, **전송(Delivery)**이 **정산(Profit)**을 확정 짓는 데이터 선순환 구조를 통해 **'누락률 0%'**와 **'실시간 순수익 파악'**을 실현합니다.

- **Mission**: 인간의 개입을 최소화하여 시스템적으로 실수를 차단하는 무결성(Integrity) 확보.
    
- **Concept**: **"Heavy Metal & Muscle"** - 강인하고 직관적인 비주얼과 성능.
    

---

## 2. 해결 과제 (Problem Statement)

1. **공정 누락 사고**: 수동 입력 실수로 인해 촬영이나 편집이 누락되는 치명적 사고 발생.
    
2. **전송 사고 (Link Rot)**: 유효하지 않은 링크를 전송하여 고객 불만 및 CS 리소스 낭비 발생.
    
3. **수익 분석의 불투명성**: 매출은 파악되나, 건별 인건비(변동비) 계산이 복잡하여 정확한 순수익 파악 불가.
    
4. **운영 비효율**: 현황 파악을 위해 엑셀, 메신저, 클라우드를 오가는 파편화된 워크플로우.
    

---

## 3. 핵심 가치 제안 (Key Value Propositions)

1. **Zero-Omission Architecture**: 결제 즉시 파이프라인과 산출물 목록이 자동 생성되어 누락 가능성 원천 차단.
    
2. **Verified Delivery System**: 서버가 외부 링크의 유효성을 사전 검증(Ping)하고, 고객의 수령 시점을 추적(Audit)하여 전송 신뢰도 확보.
    
3. **Profit Intelligence**: 작업 완료 시 작업자의 인건비(Commission)가 자동 비용 처리되어, 1원 단위의 정확한 순이익 실시간 산출.
    
4. **Showcase-Driven Sales**: 단순 텍스트 나열이 아닌, 영상 비교 플레이어를 통한 강력한 시각적 세일즈.
    

---

## 4. 시스템 아키텍처 (System Architecture)

- **Structure**: **Unified Monolith** (Next.js 16 App Router) - `(admin)`과 `(public)`을 Route Group으로 분리하여 단일 프로젝트에서 관리.
    
- **Database**: **Supabase (PostgreSQL)** - 관계형 데이터베이스로 데이터 무결성 보장 및 Realtime 동기화 활용.
    
- **Server Actions**: 모든 데이터 변형(Mutation) 및 링크 검증 로직을 서버 사이드에서 안전하게 처리.
    
- **Design System**: **Shadcn/UI + Tailwind CSS** (Deep Black & Impact Red 테마).
    

---

## 5. 상세 기능 명세 (Functional Specifications)

### 5.1 Sales & Showcase (판매 엔진)

- **패키지 쇼케이스**: 두 개의 영상을 나란히 재생하며 퀄리티 차이를 비교하는 **'Side-by-Side Player'** 구현.
    
- **옵션 구성**: 기본 패키지 외 숏폼, 원본 제공 등 추가 옵션(Upsell) 선택 기능.
    
- **자동화 트리거**: PortOne 결제 완료(`paid`) Webhook 수신 시, `Orders`, `Pipeline Cards`, `Deliverables` 데이터 트랜잭션 자동 생성.
    

### 5.2 Production Pipeline (공정 엔진)

- **5-Stage Kanban Board**: `WAITING` → `SHOOTING` → `EDITING` → `READY` → `DELIVERED`의 흐름 관리.
    
- **Bottleneck Alert**: 특정 스테이지에 일정 기간(예: 3일) 이상 머무를 경우 관리자 대시보드에 **'지연 경고'** 표시.
    
- **Ghost Card (On-Site)**: 결제하지 않은 선수도 현장에서 즉시 등록하여 촬영 누락을 방지하는 모바일 전용 뷰.
    
- **Stage Gate (The Firewall)**: `Deliverables`의 모든 항목에 유효한 링크가 등록되지 않으면 `DELIVERED` 상태 변경 불가.
    

### 5.3 Smart Delivery (전송 엔진)

- **Link Health Check**: 관리자가 외부 링크(Google Drive 등) 입력 시, 서버가 `HEAD` 요청을 보내 접근 권한 및 유효성을 자동 검증.
    
- **My Page Download Hub**: 고객은 복잡한 URL 대신 스타일링된 **'다운로드' 버튼**으로 결과물 수령.
    
- **Delivery Audit**: 고객이 다운로드 버튼을 클릭한 시각(`clicked_at`)을 기록하여 수령 여부 증빙.
    

### 5.4 Finance & BI (정산 엔진)

- **Dynamic Costing**: 작업자가 할당된 카드를 `DELIVERED` 처리하는 순간, 해당 작업자의 `commission_rate`에 따른 인건비가 `Expenses` 테이블에 자동 등록.
    
- **Net Profit Dashboard**: `총 매출 - (PG 수수료 + 고정 지출 + 자동 인건비)` 공식에 따른 실시간 순수익 차트 제공.
    
- **Package ROI**: 패키지별 판매량 대비 공정 소요 시간 및 수익률 분석.
    

---

## 6. 데이터베이스 전략 (Data Strategy)

> _Business Logic Embedded Schema_

- **`pipeline_cards`**: `stage_entered_at` 컬럼을 통해 병목 구간 자동 감지.
    
- **`deliverables`**: `link_status` 및 `link_last_checked_at` 컬럼으로 링크 건전성 관리.
    
- **`expenses`**: `is_auto_generated` 컬럼을 두어 자동 계산된 인건비와 수기 입력된 운영비를 구분.
    
- **`profiles`**: `commission_rate` 컬럼을 통해 작업자별 정산 단가 관리.
    

---

## 7. 디자인 가이드라인 (Design Guidelines)

- **Theme Concept**: **"Heavy Metal & Muscle"**.
    
- **Color Palette**:
    
    - Background: **Deep Black** (#000000) ~ **Dark Metal** (#1C1C1E).
        
    - Primary Action: **Impact Red** (#FF0000) (결제, 다운로드, 경고).
        
    - Status: Waiting(Gray), Editing(Blue), Ready(Gold), Delivered(Red).
        
- **Typography**: 헤드라인은 굵고 강한 **Oswald/Bebas Neue**, 본문은 가독성 높은 **Inter** 사용.
    

---

## 8. 성공 지표 (Success Metrics)

|**지표**|**목표치**|**측정 방법**|
|---|---|---|
|**누락률 (Omission Rate)**|**0%**|미배송 주문 건수 0건 유지|
|**전송 사고율**|**0%**|유효하지 않은 링크 전송 건수|
|**정산 오차**|**< 0.1%**|시스템 예상 순이익 vs 실제 통장 잔고 차이|
|**CS 감소율**|**30% ▼**|"언제 나와요?", "다운 안 돼요" 관련 문의 감소분|

---

## 9. 향후 확장 (Future Roadmap)

- **Archive Market**: 지난 대회의 영상을 검색하고 구매할 수 있는 아카이브 마켓플레이스.