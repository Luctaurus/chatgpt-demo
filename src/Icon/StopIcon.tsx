import type { GetProps } from 'antd'
import Icon from '@ant-design/icons'

type CustomIconComponentProps = GetProps<typeof Icon>

function StopSvg() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24">
      <rect x="7" y="7" width="10" height="10" rx="1.25" fill="currentColor"></rect>
    </svg>
  )
}

function StopIcon(props: Partial<CustomIconComponentProps>) {
  return <Icon component={StopSvg} {...props} />
}
export default StopIcon
