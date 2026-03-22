'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLogin } from '@/lib/hooks';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const loginMutation = useLogin();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginValues) => {
    setError(null);
    try {
      await loginMutation.mutateAsync(data);
      router.push('/dashboard');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Login failed';
      setError(message);
    }
  };

  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-gradient-cosmos">
            Welcome Back
          </h1>
          <p className="text-cosmos-silver/60 mt-2">
            Sign in to access your charts and profiles.
          </p>
        </div>

        <div className="cosmos-card">
          {error && (
            <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3 text-red-300 text-sm mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div>
              <label htmlFor="email" className="cosmos-label">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...register('email')}
                className="cosmos-input"
                aria-invalid={!!errors.email}
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="cosmos-label">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register('password')}
                className="cosmos-input"
                aria-invalid={!!errors.password}
                placeholder="Your password"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full"
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-cosmos-silver/50 text-sm mt-6">
            Don&apos;t have an account?{' '}
            <Link
              href="/register"
              className="text-cosmos-azure hover:text-cosmos-sky transition-colors"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
