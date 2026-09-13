<script setup lang="ts">
import { onLaunch, onShow } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/userStore'

onLaunch(() => {
  // 提前读一次登录态，页面守卫就不用等第一个请求
  try {
    void useUserStore().ensureReady()
  } catch (e) {
    console.warn('[MapBook] 初始化登录态失败', e)
  }
})

onShow(() => {
  console.log('[MapBook] show')
})
</script>

<style lang="scss">
page {
  height: 100%;
  background-color: $mb-bg-light;
  color: $mb-text-primary;
  font-size: 28rpx;
  font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'PingFang SC',
    'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
}

view,
text,
scroll-view,
button,
input,
textarea {
  box-sizing: border-box;
}

/* 去掉 button 默认边框，方便当纯容器用 */
button::after {
  border: none;
}
</style>
