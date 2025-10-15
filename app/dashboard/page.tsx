/**
 * Dashboard 页面
 */

'use client';

import { useEffect, useState } from 'react';
import { useRequireAuth } from '@/hooks/useAuth';
import { useAttackTest } from '@/hooks/useAttackTest';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { AttackType, DefenseLevel } from '@/types/supabase';

export default function DashboardPage() {
  const { user, loading: authLoading } = useRequireAuth();
  const { runTest, loading, error } = useAttackTest();

  const [attackType, setAttackType] = useState<AttackType>('PROMPT_INJECTION');
  const [defenseLevel, setDefenseLevel] = useState<DefenseLevel>('BASIC');
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const testResult = await runTest({
      attackType,
      defenseLevel,
      inputText,
    });

    if (testResult) {
      setResult(testResult);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>加载中...</p>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useRequireAuth
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <h1 className="text-2xl font-bold">Prompt Attack Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {user.email}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = '/api/auth/logout'}
            >
              登出
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Test Form */}
          <Card>
            <CardHeader>
              <CardTitle>攻击测试</CardTitle>
              <CardDescription>
                选择攻击类型和防御级别，然后输入测试文本
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium">攻击类型</label>
                  <select
                    value={attackType}
                    onChange={(e) => setAttackType(e.target.value as AttackType)}
                    className="w-full rounded-md border border-gray-300 p-2"
                  >
                    <option value="PROMPT_INJECTION">提示词注入</option>
                    <option value="JAILBREAK">越狱攻击</option>
                    <option value="CONTEXT_OVERFLOW">上下文溢出</option>
                    <option value="ROLE_MANIPULATION">角色操控</option>
                    <option value="DELIMITER_ATTACK">分隔符攻击</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">防御级别</label>
                  <select
                    value={defenseLevel}
                    onChange={(e) => setDefenseLevel(e.target.value as DefenseLevel)}
                    className="w-full rounded-md border border-gray-300 p-2"
                  >
                    <option value="NONE">无防御</option>
                    <option value="BASIC">基础防御</option>
                    <option value="ADVANCED">高级防御</option>
                    <option value="PARANOID">严格防御</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">测试文本</label>
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="输入要测试的提示词..."
                    className="w-full rounded-md border border-gray-300 p-2"
                    rows={6}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? '测试中...' : '运行测试'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Result */}
          <Card>
            <CardHeader>
              <CardTitle>测试结果</CardTitle>
              <CardDescription>
                查看 AI 的响应和防御系统的拦截情况
              </CardDescription>
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="space-y-4">
                  <div
                    className={`rounded-lg p-4 ${
                      result.is_blocked
                        ? 'border-2 border-red-500 bg-red-50'
                        : 'border-2 border-green-500 bg-green-50'
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-semibold">
                        {result.is_blocked ? '⚠️ 已拦截' : '✅ 通过'}
                      </span>
                      <span className="text-xs text-gray-600">
                        {new Date(result.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm">{result.output_text}</p>
                  </div>

                  {result.metadata && (
                    <div className="rounded-lg bg-gray-100 p-4">
                      <h4 className="mb-2 text-sm font-semibold">元数据</h4>
                      <pre className="text-xs">
                        {JSON.stringify(result.metadata, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex h-64 items-center justify-center text-gray-400">
                  运行测试以查看结果
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                总测试数
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                拦截次数
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">-</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                通过次数
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">-</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                拦截率
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
