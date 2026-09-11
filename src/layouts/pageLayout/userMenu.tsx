import { LogoutOutlined, UserOutlined } from '@ant-design/icons'
import { Avatar, Button, Dropdown, Typography } from 'antd'
import type { MenuProps } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '@/stores'
import { logoutToLogin } from '@/utils/session'

export function UserMenu() {
  const user = useUserStore((state) => state.user)
  const navigate = useNavigate()
  const items: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: user?.nickname ?? '个人信息',
      disabled: true
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
      onClick: () => logoutToLogin(navigate)
    }
  ]

  return (
    <Dropdown menu={{ items }} placement="bottomRight" trigger={['click']}>
      <Button
        type="text"
        aria-label="打开用户菜单"
        className="shrink-0 whitespace-nowrap !px-1"
      >
        <span className="flex items-center gap-1 whitespace-nowrap">
          <Avatar size="small" icon={<UserOutlined />} />
          <Typography.Text ellipsis className="max-w-28 max-[575px]:hidden">
            {user?.nickname ?? '管理员'}
          </Typography.Text>
        </span>
      </Button>
    </Dropdown>
  )
}
