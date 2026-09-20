import {
  LockOutlined,
  UserOutlined
} from '@ant-design/icons'
import { Alert, App, Button, Card, Form, Input, Typography } from 'antd'
import { useState } from 'react'
import { login } from '@/api'
import { isRequestError } from '@/services'
import { useAuthStore } from '@/stores'
import type { LoginCredentials } from '@/types'

export default function LoginPage() {
  const { message } = App.useApp()
  const setToken = useAuthStore((state) => state.setToken)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (credentials: LoginCredentials) => {
    setSubmitting(true)
    try {
      const result = await login(credentials)
      setToken(result.token)
      void message.success('登录成功，正在加载系统')
    } catch (error) {
      void message.error(
        isRequestError(error) ? error.message : '登录失败，请稍后重试'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main
      className="flex min-h-dvh items-center justify-center bg-[var(--ant-color-bg-layout)] p-6"
    >
      <Card className="w-full max-w-[400px]">
        <Typography.Title level={2}>登录管理控制台</Typography.Title>
        <Typography.Paragraph type="secondary">
          使用你的账号继续访问已授权的业务模块。
        </Typography.Paragraph>
        <Alert
          className="mb-6"
          type="info"
          showIcon
          title="演示账号：admin"
          description="密码：123456"
        />
        <Form<LoginCredentials>
          layout="vertical"
          size="large"
          requiredMark={false}
          scrollToFirstError={{ focus: true }}
          initialValues={{ username: 'admin', password: '123456' }}
          onFinish={handleSubmit}
        >
          <Form.Item
            label="用户名"
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="请输入用户名"
              autoComplete="username"
            />
          </Form.Item>
          <Form.Item
            label="密码"
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请输入密码"
              autoComplete="current-password"
            />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={submitting}>
            登录系统
          </Button>
        </Form>
      </Card>
    </main>
  )
}
