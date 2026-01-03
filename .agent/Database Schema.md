
### 1. 사용자 및 권한 (Users & Auth)

Supabase의 기본 `auth.users`와 연동되어 비즈니스 프로필을 관리합니다.

SQL

```
-- 사용자 프로필 (Supabase Auth와 1:1 매핑)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'USER' CHECK (role IN ('ADMIN', 'EDITOR', 'USER')), -- 역할 구분
  phone TEXT,
  
  -- [Optimization 2] 정산 자동화를 위한 작업자별 단가 (관리자/에디터용)
  commission_rate INTEGER DEFAULT 0, -- 예: 건당 30,000원
  
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 2. 이벤트 및 상품 (Events & Products)

판매할 대회 정보와 패키지 상품을 정의합니다.

SQL

```
-- 대회 정보
CREATE TABLE public.events (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL, -- 예: "2024 NPCA Gyeonggi"
  event_date DATE NOT NULL,
  location TEXT,
  is_active BOOLEAN DEFAULT true, -- 판매 중 여부
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 패키지 상품
CREATE TABLE public.packages (
  id SERIAL PRIMARY KEY,
  event_id INTEGER REFERENCES public.events(id),
  name TEXT NOT NULL, -- 예: "Pro Stage", "Basic Cut"
  price INTEGER NOT NULL,
  description TEXT,
  
  -- 패키지 구성 요소 (자동 생성될 Deliverables 정의)
  -- 예: ["MAIN_VIDEO", "SHORTS", "PHOTO_ZIP"]
  composition JSONB NOT NULL DEFAULT '[]', 
  
  -- [Showcase] 패키지 스펙 비교용 데이터
  specs JSONB, -- 예: {"resolution": "4K", "duration": "3min"}
  
  is_sold_out BOOLEAN DEFAULT false
);

-- [NEW] 쇼케이스용 미디어 (패키지 비교 갤러리)
CREATE TABLE public.showcase_items (
  id SERIAL PRIMARY KEY,
  package_id INTEGER REFERENCES public.packages(id),
  type TEXT CHECK (type IN ('VIDEO', 'IMAGE')),
  media_url TEXT NOT NULL,
  thumbnail_url TEXT,
  is_best_cut BOOLEAN DEFAULT false -- 베스트 컷 상단 노출
);
```

### 3. 주문 및 파이프라인 (The Core Engine)

결제 데이터가 공정 데이터로 변환되는 핵심 영역입니다.

SQL

```
-- 주문 (결제 내역)
CREATE TABLE public.orders (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id),
  event_id INTEGER REFERENCES public.events(id),
  package_id INTEGER REFERENCES public.packages(id),
  
  payment_id TEXT UNIQUE, -- PortOne 결제 ID (imp_xxx)
  amount INTEGER NOT NULL,
  status TEXT DEFAULT 'PAID' CHECK (status IN ('PENDING', 'PAID', 'REFUNDED')),
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 작업 카드 (파이프라인)
CREATE TABLE public.pipeline_cards (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES public.orders(id) ON DELETE CASCADE, -- 1:1 관계
  
  -- 작업 단계 (5 Stage Kanban)
  stage TEXT NOT NULL DEFAULT 'WAITING' 
    CHECK (stage IN ('WAITING', 'SHOOTING', 'EDITING', 'READY', 'DELIVERED')),
    
  assignee_id UUID REFERENCES public.profiles(id), -- 담당 작업자
  
  -- [Optimization 4] 병목 구간 감지용 타임스탬프
  stage_entered_at TIMESTAMPTZ DEFAULT now(), -- 현재 스테이지에 진입한 시간
  
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 4. 산출물 및 전송 (Deliverables & Delivery)

누락 방지와 링크 사고 예방을 위한 안전장치 테이블입니다.

SQL

```
-- 산출물 체크리스트
CREATE TABLE public.deliverables (
  id SERIAL PRIMARY KEY,
  card_id INTEGER REFERENCES public.pipeline_cards(id) ON DELETE CASCADE,
  
  type TEXT NOT NULL, -- 예: "MAIN_VIDEO", "SHORTS"
  
  -- [Optimization 1] 외부 링크 및 검증 상태
  external_link_url TEXT, -- Google Drive / Dropbox 링크
  link_status TEXT DEFAULT 'UNCHECKED' CHECK (link_status IN ('UNCHECKED', 'VALID', 'INVALID')),
  link_last_checked_at TIMESTAMPTZ, -- 링크 유효성 검사 시간
  
  -- [Optimization 3] 고객 수령 추적 (Audit Log)
  is_downloaded BOOLEAN DEFAULT false,
  first_downloaded_at TIMESTAMPTZ, -- 최초 클릭 시간 (수령 증빙)
  
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 5. 재무 및 정산 (Finance & BI)

순수익 분석을 위한 데이터입니다.

SQL

```
-- 지출 및 비용
CREATE TABLE public.expenses (
  id SERIAL PRIMARY KEY,
  event_id INTEGER REFERENCES public.events(id),
  
  category TEXT NOT NULL CHECK (category IN ('LABOR', 'FOOD', 'TRAVEL', 'EQUIPMENT', 'ETC')),
  description TEXT, -- 예: "김철수 에디터 3건 작업비", "점심 식대"
  amount INTEGER NOT NULL,
  
  -- [Optimization 2] 자동 생성된 비용인지 추적
  is_auto_generated BOOLEAN DEFAULT false, 
  related_worker_id UUID REFERENCES public.profiles(id), -- 인건비일 경우 작업자 연결
  
  expensed_at DATE DEFAULT CURRENT_DATE
);
```

---

## 🔗 테이블 간 관계 다이어그램 (ERD Concept)

글로 설명된 구조를 시각적으로 요약하면 다음과 같습니다.

코드 스니펫

```
erDiagram
    PROFILES ||--o{ ORDERS : "makes"
    PROFILES ||--o{ PIPELINE_CARDS : "works_on"
    EVENTS ||--|{ PACKAGES : "contains"
    EVENTS ||--o{ ORDERS : "has"
    EVENTS ||--o{ EXPENSES : "incurs"
    PACKAGES ||--o{ ORDERS : "sold_as"
    PACKAGES ||--o{ SHOWCASE_ITEMS : "showcases"
    ORDERS ||--|| PIPELINE_CARDS : "triggers"
    PIPELINE_CARDS ||--|{ DELIVERABLES : "requires"
```

---

## ⚡ 핵심 비즈니스 로직 적용 (Implementation Note)

DB 설계만으로는 부족합니다. 위 스키마를 활용하는 **핵심 로직**은 다음과 같이 구현됩니다.

1. **누락 방지 트리거 (`triggers`)**:
    
    - `pipeline_cards`의 `stage`가 `DELIVERED`로 업데이트될 때, 연결된 `deliverables` 중 `external_link_url`이 `NULL`인 행이 하나라도 있으면 **업데이트를 거부(Raise Exception)**합니다.
        
2. **정산 자동화**:
    
    - `pipeline_cards`가 `DELIVERED` 되는 순간, Trigger 또는 Server Action이 `assignee_id`의 `commission_rate`를 조회하여 `expenses` 테이블에 `LABOR` 비용을 자동 Insert 합니다.
        
3. **병목 감지**:
    
    - `pipeline_cards`가 업데이트될 때마다 `stage_entered_at`을 `NOW()`로 갱신합니다. 프론트엔드에서는 `NOW() - stage_entered_at > 3 days`인 카드를 빨간색으로 표시합니다.
        

이 스키마를 Supabase SQL Editor에 복사하여 붙여넣으면 즉시 개발을 시작할 수 있습니다. 추가로 수정하고 싶은 필드가 있으신가요?