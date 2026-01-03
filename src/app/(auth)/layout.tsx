/**
 * 🔐 Auth Layout
 * 인증 관련 페이지 (로그인, 회원가입)를 위한 레이아웃
 * Centered Box 스타일 적용
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-full max-w-md p-8">
        {children}
      </div>
    </div>
  );
}
