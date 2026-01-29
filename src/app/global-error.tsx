'use client'

import { Button } from "@/components/ui/button"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
          <div className="max-w-md p-8 space-y-4 text-center">
            <h1 className="text-4xl font-bold text-destructive">Something went wrong!</h1>
            <p className="text-muted-foreground">
              {error.message || "An unexpected error occurred."}
            </p>
            <pre className="text-xs text-left p-2 bg-muted rounded-md overflow-auto">
              <code>
                {error.stack}
              </code>
            </pre>
            <Button onClick={() => reset()}>Try again</Button>
          </div>
        </div>
      </body>
    </html>
  )
}
