import { Sandbox } from '@/components/sandbox';
import { ShieldCheck } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-7 w-7 text-primary" />
          <h1 className="font-headline text-xl font-bold tracking-tighter sm:text-2xl">
            Safe Sandbox
          </h1>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <Sandbox />
      </main>
      <footer className="border-t p-4 text-center text-sm text-muted-foreground">
        <p>
          Powered by AI. This is a simulator and does not execute real code. For
          demonstration purposes only.
        </p>
      </footer>
    </div>
  );
}
