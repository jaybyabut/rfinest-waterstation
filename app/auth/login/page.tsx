import Header from "@/components/Header"
import Footer from "@/components/Footer"
import LoginForm from "@/components/login-form"

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col bg-white">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center w-full px-4 py-6 animate-in fade-in zoom-in duration-500">
          <LoginForm />
        </div>
        <Footer />
    </main>
  );
}
