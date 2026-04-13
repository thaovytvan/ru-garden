"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Leaf, Mail, Lock, ArrowRight } from "lucide-react";
import { Button } from "@radix-ui/themes";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(email, password);
      router.push("/");
    } catch (err: any) {
      setError(
        err.response?.data?.error || "Đã có lỗi xảy ra. Vui lòng thử lại."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-20 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-background to-muted">
      <div className="max-w-md w-full bg-white/80 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-white/20">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group mb-6">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Leaf className="text-primary w-7 h-7" />
            </div>
          </Link>
          <h2 className="text-3xl font-bold text-foreground">
            Chào mừng trở lại!
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Đăng nhập để quản lý đơn hàng và nhận ưu đãi từ Rú Garden
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-white/50 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                placeholder="you@email.com"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-foreground">
                Mật khẩu
              </label>
              <Link
                href="#"
                className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Quên mật khẩu?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-white/50 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>
          <Button
            type="submit"
            disabled={isLoading}
            variant="classic"
            color="grass"
            size="4"
            className="!w-full flex justify-center py-6 cursor-pointer"
          >
            {isLoading ? "Đang xử lý..." : "Đăng nhập"}
            {!isLoading && <ArrowRight className="ml-1 w-5 h-5" />}
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-500">
          Chưa có tài khoản?{" "}
          <Link
            href="/signup"
            className="font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            Đăng ký ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
