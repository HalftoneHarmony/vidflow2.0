# 👤 Agent 10: My Page & Personal Dashboard

> **당신은 Agent #10 - My Page & Personal Dashboard Designer 입니다.**

---

## 📋 미션 개요

| 항목 | 내용 |
|------|------|
| **에이전트 번호** | #10 (User-SIDE 4) |
| **역할** | My Page & Personal Dashboard Designer |
| **담당 영역** | `src/app/(public)/my-page` |
| **미션 코드명** | "Personal HQ" |
| **발령일** | 2026-01-06 |

---

## 🎯 핵심 목표

마이페이지는 단순한 설정이 아니라 **개인을 위한 HQ(본부)**입니다. 주문 현황을 직관적인 **프로그레스 바**로 보여주고, 내 정보를 소중하게 다루는 느낌을 줍니다.

---

## 📁 담당 파일

```
src/app/(public)/my-page/page.tsx
src/app/(public)/my-page/orders/
src/app/(public)/my-page/profile/
src/features/user/components/
├── OrderStatusTracker.tsx
├── ProfileCard.tsx
└── DashboardStats.tsx
```

---

## ✅ 작업 체크리스트

### 1. 대시보드 요약 (필수)
- [ ] 인사말("안녕하세요, 00님")에 타이핑 효과 또는 페이드 인
- [ ] "내 주문", "찜한 상품" 등 통계 카드의 숫자 카운트 업

### 2. 주문 상태 트래커 (필수)
- [ ] 주문 단계(결제완료 -> 준비중 -> 배송중 -> 완료)를 시각화하는 프로그레스 바
- [ ] 현재 단계에 펄스(Pulse) 애니메이션
- [ ] 다음 단계로 넘어가는 진행바 채움 애니메이션

### 3. 리스트 및 내역 (필수)
- [ ] 내역 리스트의 아코디언 인터랙션 (클릭 시 상세 내역 펼쳐짐)
- [ ] "비어있음" 상태(주문 내역 없음 등)의 감성적인 일러스트/아이콘

### 4. 프로필 편집 (권장)
- [ ] 프로필 이미지 업로드 시 미리보기 및 크롭 애니메이션
- [ ] 정보 수정 후 "저장 완료" 토스트 메시지

---

## 🛠 구현 팁

### Progress Tracker
CSS Grid와 Flexbox를 활용해 단계별 아이콘과 연결선을 배치하고, `width`를 transition하여 배송 상태를 표현하세요.

---

## 📝 작업 완료 시 보고 형식

```markdown
## Agent #10 (MyPage) 작업 완료 보고

### 구현 항목
- [x] 주문 상태 트래커
- [x] 대시보드 통계 애니메이션

### 변경된 파일
- `src/app/(public)/my-page/page.tsx`

### 스크린샷/데모 (필수)
(이미지/GIF 첨부)
```
