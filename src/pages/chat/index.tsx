import { useRouter } from '@tarojs/taro'
import { View } from '@tarojs/components'
import { ChatView } from '@/features/chat/ChatView'
import { useTimeOfDay } from '@/features/theme/useTimeOfDay'

// 页面壳：读取首页带入的一句，装配时段主题 + 挂载会话功能视图。
export default function ChatPage() {
  const { className, tod } = useTimeOfDay()
  const router = useRouter()
  const raw = router.params.seed
  const seed = raw ? decodeURIComponent(raw) : undefined
  return (
    <View className={className}>
      <ChatView seed={seed} tod={tod} />
    </View>
  )
}
