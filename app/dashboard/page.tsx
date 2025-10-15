'use client';

import { useState } from 'react';
import { DefenseLevel } from '@prisma/client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAttackTest } from '@/hooks/useAttackTest';
import { useAttackTestStore } from '@/lib/store';

const defenseLevels: DefenseLevel[] = ['NONE', 'LOW', 'MEDIUM', 'HIGH'];

export default function DashboardPage() {
  const [input, setInput] = useState('');
  const [defenseLevel, setDefenseLevel] = useState<DefenseLevel>('MEDIUM');

  const { runTest } = useAttackTest();
  const { currentTest } = useAttackTestStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) return;

    await runTest({
      input,
      defenseLevel,
    });
  };

  return (
    <div className="container mx-auto min-h-screen p-4 py-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">🛡️ Prompt Attack Testing</h1>
          <p className="text-muted-foreground">
            Test various prompt attacks against different defense levels
          </p>
        </div>

        {/* Test Form */}
        <Card>
          <CardHeader>
            <CardTitle>Run Attack Test</CardTitle>
            <CardDescription>
              Enter a prompt to test against the defense system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Input */}
              <div className="space-y-2">
                <label
                  htmlFor="input"
                  className="text-sm font-medium leading-none"
                >
                  Test Input
                </label>
                <Input
                  id="input"
                  placeholder="Enter your prompt here..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={currentTest.isLoading}
                />
              </div>

              {/* Defense Level */}
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">
                  Defense Level
                </label>
                <div className="flex gap-2">
                  {defenseLevels.map((level) => (
                    <Button
                      key={level}
                      type="button"
                      variant={defenseLevel === level ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setDefenseLevel(level)}
                      disabled={currentTest.isLoading}
                    >
                      {level}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={currentTest.isLoading || !input.trim()}
                className="w-full"
              >
                {currentTest.isLoading ? 'Testing...' : 'Run Test'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        {currentTest.result && (
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
              <CardDescription>
                {currentTest.result.blocked ? '⚠️ Blocked' : '✅ Allowed'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Threat Score */}
              {currentTest.result.stages.inputValidation && (
                <div>
                  <h4 className="mb-2 text-sm font-medium">Threat Score</h4>
                  <div className="flex items-center gap-2">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full bg-destructive transition-all"
                        style={{
                          width: `${Math.min(
                            currentTest.result.stages.inputValidation.score,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium">
                      {currentTest.result.stages.inputValidation.score}/100
                    </span>
                  </div>
                </div>
              )}

              {/* Response */}
              <div>
                <h4 className="mb-2 text-sm font-medium">Final Response</h4>
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-sm">{currentTest.result.finalResponse}</p>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Total Time</p>
                  <p className="font-medium">
                    {currentTest.result.metrics.totalTime}ms
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Tokens Used</p>
                  <p className="font-medium">
                    {currentTest.result.metrics.tokensUsed}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Defense Time</p>
                  <p className="font-medium">
                    {currentTest.result.metrics.defenseTime}ms
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error */}
        {currentTest.error && (
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-destructive">{currentTest.error}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

