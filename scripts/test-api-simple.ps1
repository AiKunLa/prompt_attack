# API 接口测试脚本 (PowerShell 版本)
# 测试所有的 API 端点

$BaseUrl = "http://localhost:3000"
$TestsPassed = 0
$TestsFailed = 0
$TotalTests = 0

# 颜色输出
function Write-TestResult {
    param(
        [string]$TestName,
        [bool]$Success,
        [string]$Details = ""
    )
    
    $script:TotalTests++
    
    if ($Success) {
        Write-Host "✅ " -ForegroundColor Green -NoNewline
        Write-Host "$TestName" -ForegroundColor White
        $script:TestsPassed++
    }
    else {
        Write-Host "❌ " -ForegroundColor Red -NoNewline
        Write-Host "$TestName" -ForegroundColor White
        if ($Details) {
            Write-Host "   $Details" -ForegroundColor Yellow
        }
        $script:TestsFailed++
    }
}

function Test-Endpoint {
    param(
        [string]$Method,
        [string]$Endpoint,
        [object]$Body = $null,
        [int]$ExpectedStatus = 200
    )
    
    try {
        $Uri = "$BaseUrl$Endpoint"
        $Headers = @{
            "Content-Type" = "application/json"
        }
        
        $Params = @{
            Uri = $Uri
            Method = $Method
            Headers = $Headers
            UseBasicParsing = $true
        }
        
        if ($Body) {
            $Params['Body'] = ($Body | ConvertTo-Json -Depth 10)
        }
        
        $Response = Invoke-WebRequest @Params -ErrorAction Stop
        
        if ($Response.StatusCode -eq $ExpectedStatus) {
            return @{
                Success = $true
                Status = $Response.StatusCode
                Body = ($Response.Content | ConvertFrom-Json)
            }
        }
        else {
            return @{
                Success = $false
                Status = $Response.StatusCode
                Expected = $ExpectedStatus
                Body = $Response.Content
            }
        }
    }
    catch {
        $StatusCode = $_.Exception.Response.StatusCode.value__
        if ($StatusCode -eq $ExpectedStatus) {
            return @{
                Success = $true
                Status = $StatusCode
            }
        }
        return @{
            Success = $false
            Error = $_.Exception.Message
            Status = $StatusCode
        }
    }
}

# 开始测试
Write-Host "`n╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     🧪 API 接口测试开始               ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════╝`n" -ForegroundColor Cyan

Write-Host "📊 测试配置:" -ForegroundColor Yellow
Write-Host "   基础URL: $BaseUrl`n" -ForegroundColor Gray

# ==========================================
# 1. 健康检查
# ==========================================
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "   第 1 组: 健康检查" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan

$Result = Test-Endpoint -Method "GET" -Endpoint "/api/health"
if ($Result.Success -and $Result.Body.status -eq "healthy") {
    Write-TestResult -TestName "健康检查 API" -Success $true
    Write-Host "   状态: $($Result.Body.status)" -ForegroundColor Gray
    Write-Host "   数据库: $($Result.Body.database)" -ForegroundColor Gray
    Write-Host "   版本: $($Result.Body.version)`n" -ForegroundColor Gray
}
else {
    Write-TestResult -TestName "健康检查 API" -Success $false -Details $Result.Error
}

# ==========================================
# 2. 认证测试
# ==========================================
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "   第 2 组: 认证流程" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan

# 使用已存在的用户测试登录
$LoginData = @{
    email = "3535648608@qq.com"
    password = "74122313579Gw"
}

$Result = Test-Endpoint -Method "POST" -Endpoint "/api/auth/login" -Body $LoginData
if ($Result.Success) {
    Write-TestResult -TestName "用户登录" -Success $true
    if ($Result.Body.user) {
        Write-Host "   用户: $($Result.Body.user.email)`n" -ForegroundColor Gray
    }
}
else {
    Write-TestResult -TestName "用户登录" -Success $false -Details "状态码: $($Result.Status)"
    if ($Result.Status -eq 400) {
        Write-Host "   提示: 请确保在 Supabase Dashboard 中禁用了邮箱验证" -ForegroundColor Yellow
        Write-Host "   或者手动确认用户邮箱`n" -ForegroundColor Yellow
    }
}

# 测试未授权访问
$Result = Test-Endpoint -Method "GET" -Endpoint "/api/user/stats" -ExpectedStatus 401
Write-TestResult -TestName "未登录访问保护接口 (应该401)" -Success $Result.Success

# ==========================================
# 3. 攻击测试接口测试
# ==========================================
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "   第 3 组: 攻击测试接口" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan

Write-Host "   提示: 需要先登录才能测试此接口" -ForegroundColor Yellow
Write-Host "   请手动在浏览器中测试 Dashboard 功能`n" -ForegroundColor Yellow

# ==========================================
# 测试总结
# ==========================================
Write-Host "`n╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     📊 测试结果汇总                   ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════╝`n" -ForegroundColor Cyan

Write-Host "总测试数: $TotalTests" -ForegroundColor Yellow
Write-Host "✅ 通过: $TestsPassed" -ForegroundColor Green
Write-Host "❌ 失败: $TestsFailed" -ForegroundColor Red

$PassRate = if ($TotalTests -gt 0) { ($TestsPassed / $TotalTests * 100).ToString("F1") } else { "0.0" }
Write-Host "通过率: $PassRate%`n" -ForegroundColor $(if ($PassRate -eq "100.0") { "Green" } else { "Yellow" })

if ($TestsFailed -eq 0) {
    Write-Host "🎉 所有基础测试通过！" -ForegroundColor Green
}
else {
    Write-Host "⚠️  部分测试失败，请检查上面的错误信息" -ForegroundColor Yellow
}

Write-Host "`n📝 手动测试清单:" -ForegroundColor Cyan
Write-Host "1. 访问 http://localhost:3000 - 查看首页" -ForegroundColor Gray
Write-Host "2. 访问 http://localhost:3000/login - 测试登录" -ForegroundColor Gray
Write-Host "3. 访问 http://localhost:3000/dashboard - 测试 Dashboard" -ForegroundColor Gray
Write-Host "4. 在 Dashboard 中运行攻击测试" -ForegroundColor Gray
Write-Host "5. 查看统计数据是否正确显示`n" -ForegroundColor Gray

exit $TestsFailed

