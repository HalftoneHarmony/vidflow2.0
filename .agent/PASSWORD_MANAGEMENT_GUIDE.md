# 🔐 비밀번호 초기화 및 변경 구현 가이드

## 📋 개요

이 문서는 VidFlow에서 구현된 비밀번호 초기화(Password Reset)와 비밀번호 변경(Password Change) 기능에 대한 가이드입니다.

## 🎯 구현된 기능

### 1. **비밀번호 초기화 (Password Reset)**
사용자가 비밀번호를 잊어버렸을 때 이메일을 통해 재설정할 수 있는 기능

**플로우:**
1. 사용자가 로그인 페이지에서 "Forgot Password?" 클릭
2. `/forgot-password` 페이지에서 이메일 입력
3. Supabase가 비밀번호 재설정 링크를 이메일로 전송
4. 사용자가 이메일의 링크 클릭
5. `/reset-password` 페이지에서 새 비밀번호 설정
6. 자동으로 로그인 페이지로 리다이렉트

**관련 파일:**
- `src/features/auth/password-actions.ts` - 서버 액션
- `src/features/auth/components/ForgotPasswordForm.tsx` - 이메일 입력 폼
- `src/features/auth/components/ResetPasswordForm.tsx` - 비밀번호 재설정 폼
- `src/app/(auth)/forgot-password/page.tsx` - 비밀번호 찾기 페이지
- `src/app/(auth)/reset-password/page.tsx` - 비밀번호 재설정 페이지

### 2. **비밀번호 변경 (Password Change)**
로그인된 사용자가 설정 페이지에서 비밀번호를 변경할 수 있는 기능

**플로우:**
1. 사용자가 `/settings` 페이지 접속
2. "비밀번호 변경" 카드에서 현재 비밀번호와 새 비밀번호 입력
3. 현재 비밀번호 검증 후 새 비밀번호로 업데이트

**관련 파일:**
- `src/features/auth/password-actions.ts` - 서버 액션
- `src/features/auth/components/ChangePasswordCard.tsx` - 비밀번호 변경 카드
- `src/app/(public)/settings/SettingsPageClient.tsx` - 설정 페이지에 통합

## 🔧 Supabase 이메일 설정

### 1. Email Templates 설정

Supabase Dashboard에서 이메일 템플릿을 설정해야 합니다:

1. **Supabase Dashboard 접속**
   - https://supabase.com/dashboard

2. **프로젝트 선택**
   - VidFlow 프로젝트 선택

3. **Authentication > Email Templates**
   - 좌측 메뉴에서 `Authentication` > `Email Templates` 선택

4. **Reset Password 템플릿 수정**
   - "Reset Password" 템플릿 선택
   - 다음 설정 확인:
     ```
     Subject: VidFlow - 비밀번호 재설정
     ```
   - Body에 `{{ .ConfirmationURL }}` 포함 확인

### 2. URL Configuration 설정

1. **Authentication > URL Configuration**
   - `Site URL`: 프로덕션 URL (예: `https://vidflow.com`)
   - `Redirect URLs` 추가:
     - Development: `http://localhost:3001/reset-password`
     - Production: `https://yourdomain.com/reset-password`

### 3. 환경 변수 설정

`.env.local` 파일에 다음 변수가 설정되어 있는지 확인:

```bash
# 개발 환경
NEXT_PUBLIC_SITE_URL=http://localhost:3001

# 프로덕션 환경 (배포 시)
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

## 🔐 비밀번호 요구사항

모든 비밀번호는 다음 조건을 충족해야 합니다:

- ✅ 최소 8자 이상
- ✅ 영문 대문자 포함
- ✅ 영문 소문자 포함
- ✅ 숫자 포함

## 🎨 UI/UX 특징

### Premium 애니메이션
- **Framer Motion** 사용한 부드러운 전환 효과
- **Focus 상태** 시 glow 효과
- **성공/실패** 상태에 따른 색상 변화
- **자동 리다이렉트** (비밀번호 재설정 후 3초)

### PremiumInput 컴포넌트 개선
- `icon` prop 추가로 아이콘 지원
- 자동 padding 조정 (아이콘 있을 때 `pl-10`)
- 포커스 시 동적 테두리 glow 효과

## 📝 사용 예시

### 비밀번호 초기화 요청

```typescript
import { requestPasswordReset } from "@/features/auth/password-actions";

// FormData 사용
const formData = new FormData();
formData.append("email", "user@example.com");

const result = await requestPasswordReset({}, formData);
// { success: true, message: "비밀번호 재설정 링크가 이메일로 전송되었습니다..." }
```

### 비밀번호 재설정

```typescript
import { resetPassword } from "@/features/auth/password-actions";

const formData = new FormData();
formData.append("password", "NewPass123");
formData.append("passwordConfirm", "NewPass123");

const result = await resetPassword({}, formData);
// { success: true, message: "비밀번호가 성공적으로 재설정되었습니다." }
```

### 비밀번호 변경

```typescript
import { changePassword } from "@/features/auth/password-actions";

const formData = new FormData();
formData.append("currentPassword", "OldPass123");
formData.append("newPassword", "NewPass123");
formData.append("newPasswordConfirm", "NewPass123");

const result = await changePassword({}, formData);
// { success: true, message: "비밀번호가 성공적으로 변경되었습니다." }
```

## 🧪 테스트 체크리스트

### 비밀번호 초기화
- [ ] 존재하지 않는 이메일로 요청 시 성공 메시지 표시 (보안상 이유)
- [ ] 이메일이 실제로 전송되는지 확인
- [ ] 이메일 링크 클릭 시 `/reset-password` 페이지로 이동
- [ ] 새 비밀번호 설정 후 로그인 가능 확인
- [ ] 약한 비밀번호 입력 시 에러 메시지 표시

### 비밀번호 변경
- [ ] 로그인하지 않은 상태에서 접근 불가
- [ ] 잘못된 현재 비밀번호 입력 시 에러 표시
- [ ] 새 비밀번호와 확인 비밀번호 불일치 시 에러 표시
- [ ] 현재 비밀번호와 동일한 새 비밀번호 입력 시 에러
- [ ] 성공 시 설정 페이지에서 성공 메시지 표시

## 🚨 보안 고려사항

1. **비밀번호 재설정 링크**
   - Supabase는 자동으로 토큰을 URL에 포함
   - 토큰은 일회용이며 시간 제한이 있음
   
2. **현재 비밀번호 검증**
   - 비밀번호 변경 시 반드시 현재 비밀번호 확인
   - Supabase의 `signInWithPassword`로 검증

3. **에러 메시지**
   - 존재하지 않는 이메일도 "성공" 메시지 표시 (enumeration attack 방지)
   - 구체적인 실패 이유는 서버 로그에만 기록

## 📚 참고 자료

- [Supabase Auth - Password Reset](https://supabase.com/docs/guides/auth/passwords#password-reset)
- [Supabase Auth - Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)

## 🎯 다음 단계

- [ ] 이메일 템플릿 커스터마이징 (브랜드 색상, 로고 추가)
- [ ] 비밀번호 강도 측정기 추가
- [ ] 2FA (Two-Factor Authentication) 구현 고려
- [ ] 비밀번호 변경 이력 기록

---

**작성:** Antigravity AI  
**날짜:** 2026-01-06  
**버전:** 1.0
