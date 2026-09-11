import { Drawer } from 'antd'
import { MOBILE_SIDEBAR_WIDTH } from '@/constants'
import { Sidebar } from '@/layouts/pageLayout/sidebar'

interface MobileSidebarProps {
  open: boolean
  onClose: () => void
}

export function MobileSidebar({ open, onClose }: MobileSidebarProps) {
  return (
    <Drawer
      placement="left"
      size={MOBILE_SIDEBAR_WIDTH}
      open={open}
      onClose={onClose}
      closable={false}
      styles={{ body: { padding: 0 } }}
    >
      <Sidebar mobile onNavigate={onClose} />
    </Drawer>
  )
}
