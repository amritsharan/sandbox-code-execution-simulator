'use client';

import { Sandbox } from '@/components/sandbox';
import { UserNav } from '@/components/user-nav';
import { useUser } from '@/firebase';
import { ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  const { user, isUserLoading } = useUser();

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-7 w-7 text-primary" />
          <h1 className="font-headline text-xl font-bold tracking-tighter sm:text-2xl">
            Safe Sandbox
          </h1>
        </div>
        <div>
          {isUserLoading ? (
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
          ) : user ? (
            <UserNav />
          ) : (
            <Button asChild>
              <Link href="/login">Login</Link>
            </Button>
          )}
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        {isUserLoading ? (
          <div className="flex items-center justify-center h-full">
            <p>Loading...</p>
          </div>
        ) : user ? (
          <Sandbox />
        ) : (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Welcome to Safe Sandbox</h2>
            <p className="mb-8 text-muted-foreground">Please log in or sign up to start using the sandbox.</p>
            <div className="space-x-4">
              <Button asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
