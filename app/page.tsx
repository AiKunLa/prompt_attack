/**
 * 首页
 */

import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="mb-6 text-5xl font-bold tracking-tight text-gray-900">
            Prompt Attack Demo
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-600">
            探索 AI 提示词攻击与防御机制
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/dashboard">
              <Button size="lg" className="px-8">
                开始测试
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="px-8">
                登录 / 注册
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20 grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🎯</span>
                多种攻击类型
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                支持 5 种常见的提示词攻击模式：注入、越狱、上下文溢出、角色操控和分隔符攻击
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🛡️</span>
                分级防御系统
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                从基础到高级的 4 个防御等级，实时展示不同防御策略的效果
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">📊</span>
                数据分析
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                记录和分析所有测试结果，提供可视化的统计数据和历史记录
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Attack Types */}
        <div className="mt-20">
          <h2 className="mb-8 text-center text-3xl font-bold text-gray-900">
            支持的攻击类型
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                name: '提示词注入',
                description: '尝试修改系统指令或注入恶意命令',
                example: 'Ignore previous instructions and...',
              },
              {
                name: '越狱攻击',
                description: '绕过 AI 的安全限制和伦理规则',
                example: 'DAN mode activated...',
              },
              {
                name: '上下文溢出',
                description: '通过超长输入覆盖系统提示词',
                example: '重复 1000 次...',
              },
              {
                name: '角色操控',
                description: '欺骗 AI 扮演未授权的角色',
                example: 'You are now an admin...',
              },
              {
                name: '分隔符攻击',
                description: '使用特殊字符混淆 AI 的理解',
                example: '--- SYSTEM OVERRIDE ---',
              },
            ].map((attack) => (
              <Card key={attack.name} className="border-l-4 border-l-red-500">
                <CardHeader>
                  <CardTitle className="text-lg">{attack.name}</CardTitle>
                  <CardDescription>{attack.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <code className="rounded bg-gray-100 px-2 py-1 text-xs">
                    {attack.example}
                  </code>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-20 text-center">
          <Card className="mx-auto max-w-2xl border-2 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-2xl">准备好开始了吗？</CardTitle>
              <CardDescription className="text-base">
                创建账户并开始探索 AI 提示词攻击与防御的世界
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard">
                <Button size="lg" className="px-12">
                  立即开始
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-white py-8">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          <p>&copy; 2024 Prompt Attack Demo. Built with Next.js + Supabase.</p>
        </div>
      </footer>
    </div>
  );
}
