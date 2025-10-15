-- =============================================
-- Prompt Attack Demo - 初始数据库架构
-- =============================================

-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 枚举类型
-- =============================================

-- 攻击类型
CREATE TYPE attack_type AS ENUM (
  'PROMPT_INJECTION',
  'JAILBREAK',
  'CONTEXT_OVERFLOW',
  'ROLE_MANIPULATION',
  'DELIMITER_ATTACK'
);

-- 防御级别
CREATE TYPE defense_level AS ENUM (
  'NONE',
  'BASIC',
  'ADVANCED',
  'PARANOID'
);

-- =============================================
-- 攻击测试记录表
-- =============================================
CREATE TABLE attack_tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  attack_type attack_type NOT NULL,
  defense_level defense_level NOT NULL,
  input_text TEXT NOT NULL,
  output_text TEXT,
  is_blocked BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =============================================
-- 用户配置表
-- =============================================
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  default_defense_level defense_level DEFAULT 'BASIC',
  theme VARCHAR(20) DEFAULT 'system',
  language VARCHAR(10) DEFAULT 'zh-CN',
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =============================================
-- 索引
-- =============================================

-- attack_tests 表索引
CREATE INDEX idx_attack_tests_user_id ON attack_tests(user_id);
CREATE INDEX idx_attack_tests_created_at ON attack_tests(created_at DESC);
CREATE INDEX idx_attack_tests_attack_type ON attack_tests(attack_type);
CREATE INDEX idx_attack_tests_defense_level ON attack_tests(defense_level);

-- user_settings 表索引
CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);

-- =============================================
-- 自动更新 updated_at 触发器
-- =============================================

-- 创建触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 为 attack_tests 表创建触发器
CREATE TRIGGER update_attack_tests_updated_at
  BEFORE UPDATE ON attack_tests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 为 user_settings 表创建触发器
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- Row Level Security (RLS) 策略
-- =============================================

-- 启用 RLS
ALTER TABLE attack_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- attack_tests 策略
-- 用户只能查看自己的测试记录
CREATE POLICY "Users can view their own attack tests"
  ON attack_tests FOR SELECT
  USING (auth.uid() = user_id);

-- 用户只能创建自己的测试记录
CREATE POLICY "Users can create their own attack tests"
  ON attack_tests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 用户只能更新自己的测试记录
CREATE POLICY "Users can update their own attack tests"
  ON attack_tests FOR UPDATE
  USING (auth.uid() = user_id);

-- 用户只能删除自己的测试记录
CREATE POLICY "Users can delete their own attack tests"
  ON attack_tests FOR DELETE
  USING (auth.uid() = user_id);

-- user_settings 策略
-- 用户只能查看自己的设置
CREATE POLICY "Users can view their own settings"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);

-- 用户只能创建自己的设置
CREATE POLICY "Users can create their own settings"
  ON user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 用户只能更新自己的设置
CREATE POLICY "Users can update their own settings"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- =============================================
-- 初始化用户设置的函数
-- =============================================

-- 当新用户注册时，自动创建默认设置
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建触发器：新用户注册时自动创建设置
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- 视图：用户统计
-- =============================================

CREATE OR REPLACE VIEW user_attack_stats AS
SELECT
  user_id,
  COUNT(*) AS total_tests,
  COUNT(*) FILTER (WHERE is_blocked = true) AS blocked_count,
  COUNT(*) FILTER (WHERE is_blocked = false) AS passed_count,
  COUNT(*) FILTER (WHERE attack_type = 'PROMPT_INJECTION') AS prompt_injection_count,
  COUNT(*) FILTER (WHERE attack_type = 'JAILBREAK') AS jailbreak_count,
  COUNT(*) FILTER (WHERE attack_type = 'CONTEXT_OVERFLOW') AS context_overflow_count,
  COUNT(*) FILTER (WHERE attack_type = 'ROLE_MANIPULATION') AS role_manipulation_count,
  COUNT(*) FILTER (WHERE attack_type = 'DELIMITER_ATTACK') AS delimiter_attack_count,
  MAX(created_at) AS last_test_at
FROM attack_tests
GROUP BY user_id;

-- 允许用户查看自己的统计信息
ALTER VIEW user_attack_stats SET (security_invoker = true);

-- =============================================
-- 注释
-- =============================================

COMMENT ON TABLE attack_tests IS '攻击测试记录表';
COMMENT ON TABLE user_settings IS '用户配置表';
COMMENT ON TYPE attack_type IS '攻击类型枚举';
COMMENT ON TYPE defense_level IS '防御级别枚举';
COMMENT ON COLUMN attack_tests.metadata IS '额外的元数据，用于存储攻击详情、检测日志等';
COMMENT ON COLUMN user_settings.preferences IS '用户偏好设置，JSON 格式';

