import { View } from '@tarojs/components'
import { HomeView } from '@/features/home/HomeView'
import { useTimeOfDay } from '@/features/theme/useTimeOfDay'

// 页面壳：仅装配时段主题 + 挂载首页功能视图。
export default function HomePage() {
  const tod = useTimeOfDay()
  return (
    <View className={tod}>
      <HomeView />
    </View>
  )
}
