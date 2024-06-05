import AuthButton from "@/components/AuthButton";
import Logo from "@/components/logo";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full flex flex-col min-h-screen">
      <header className="w-full">
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          <div className="w-full px-3 md:px-0 max-w-5xl md:max-w-6xl flex justify-between items-center p-3 text-sm">
            <Logo />
            <AuthButton />
          </div>
        </nav>
      </header>
      <main className="w-full flex justify-center min-h-screen">{children}</main>
      <footer className="p-4 bg-gray-900 text-white w-full text-center h-14 flex justify-center items-center">
        <p>&copy; 2024 Journi</p>
      </footer>
    </div>
  );
}