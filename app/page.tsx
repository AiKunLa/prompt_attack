import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function HomePage() {
  return (
    <div className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl">🛡️ Prompt Attack</CardTitle>
          <CardDescription className="text-lg">
            Interactive Prompt Attack & Defense Demonstration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Features</h3>
            <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
              <li>5 Types of Prompt Attacks</li>
              <li>4-Layer Defense System</li>
              <li>Real-time LLM Testing</li>
              <li>Configurable Defense Levels</li>
            </ul>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild className="flex-1">
              <Link href="/dashboard">Get Started</Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>

          <div className="rounded-lg bg-muted p-4 text-sm">
            <p className="font-medium">Production-Ready Framework</p>
            <p className="text-muted-foreground">
              Next.js 14 • TypeScript • Prisma • NextAuth • Tailwind CSS
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

