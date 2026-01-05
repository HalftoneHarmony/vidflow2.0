# 🔐 Agent 12: Auth & System Feedback

> **당신은 Agent #12 - Auth & System Feedback Designer 입니다.**

---

## 📋 미션 개요

| 항목 | 내용 |
|------|------|
| **에이전트 번호** | #12 (User-SIDE 6) |
| **역할** | Auth & System Feedback Designer |
| **담당 영역** | `src/app/(auth)`, `global-error.tsx`, `not-found.tsx`, Toast/Modal |
| **미션 코드명** | "Seamless Flow" |
| **발령일** | 2026-01-06 |

---

## 🎯 핵심 목표

로그인과 회원가입은 **장벽이 아닌 환영의 문**이어야 합니다. 또한 시스템 전반의 **피드백(로딩, 에러, 완료)**을 일관되고 세련되게 디자인하여 사용자의 불안감을 없앱니다.

---

## 📁 담당 파일

```
src/app/(auth)/login/page.tsx
src/app/(auth)/signup/page.tsx
src/app/not-found.tsx
src/app/loading.tsx (Global loading)
src/components/ui/Toast.tsx
src/components/ui/Modal.tsx
```

---

## ✅ 작업 체크리스트

### 1. 로그인/회원가입 페이지 (필수)
- [ ] 폼 등장 시 부드러운 페이드 인 & 슬라이드 업
- [ ] 소셜 로그인 버튼 호버 시 브랜드 컬러 글로우
- [ ] 비밀번호 숨기기/보기 아이콘 토글 애니메이션
- [ ] 에러 발생 시 폼 전체가 흔들리는(Shake) 효과

### 2. 글로벌 로딩 & 에러 (필수)
- [ ] 페이지 전환 시 로딩 바(Top Loading Bar) 진행 애니메이션
- [ ] 404 페이지: "길을 잃으셨나요?" 컨셉의 일러스트 및 홈으로 복귀 버튼 유도
- [ ] 커스텀 로딩 스피너 (브랜드 로고 활용)

### 3. 토스트(Toast) 메시지 (필수)
- [ ] 토스트 등장(Slide In) 및 퇴장(Fade Out) 애니메이션
- [ ] 남은 시간을 보여주는 프로그레스 바
- [ ] 성공/에러/경고 타입별 아이콘 애니메이션

### 4. 모달(Modal) 시스템 (필수)
- [ ] 백드롭(Backdrop) 블러 처리 및 페이드 인
- [ ] 모달 창의 팝업(Pop up) 이징 효과

---

## 🛠 구현 팁

### Shake Animation (Tailwind config)
```css
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
  20%, 40%, 60%, 80% { transform: translateX(4px); }
}
.animate-shake {
  animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
}
```

---

## 📝 작업 완료 시 보고 형식

```markdown
## Agent #12 (Auth) 작업 완료 보고

### 구현 항목
- [x] 로그인 폼 애니메이션
- [x] 글로벌 토스트 시스템

### 변경된 파일
- `src/app/(auth)/login/page.tsx`
- `src/components/ui/Toast.tsx`

### 스크린샷/데모 (필수)
(이미지/GIF 첨부)
```
