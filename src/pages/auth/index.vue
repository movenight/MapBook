<template>
  <view class="auth">
    <!-- 小程序端没有登录流程：云开发用 openid 隐式识别身份 -->
    <view v-if="!userStore.requiresLogin" class="auth__notice">
      <text class="auth__notice-icon">✅</text>
      <text class="auth__notice-title">无需登录</text>
      <text class="auth__notice-text">
        小程序端已通过微信身份自动识别，你的路书只有自己可见。
      </text>
      <wd-button type="primary" custom-class="auth__notice-btn" @click="goTrips">
        去我的路书
      </wd-button>
    </view>

    <view v-else class="auth__form">
      <text class="auth__title">{{ isRegister ? '注册账号' : '登录 MapBook' }}</text>
      <text class="auth__subtitle">用邮箱账号同步你的路书</text>

      <view class="auth__field">
        <wd-input
          v-model="email"
          placeholder="邮箱"
          type="text"
          no-border
          @confirm="submit"
        />
      </view>

      <view class="auth__field">
        <wd-input
          v-model="password"
          placeholder="密码（8-32 位，需含字母和数字）"
          :show-password="true"
          no-border
          @confirm="submit"
        />
      </view>

      <text v-if="userStore.error" class="auth__error">{{ userStore.error }}</text>

      <wd-button
        type="primary"
        block
        :loading="userStore.loading"
        custom-class="auth__submit"
        @click="submit"
      >
        {{ isRegister ? '注册并登录' : '登录' }}
      </wd-button>

      <text class="auth__switch" @click="toggleMode">
        {{ isRegister ? '已有账号？去登录' : '还没有账号？去注册' }}
      </text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/stores/userStore'

const userStore = useUserStore()

const email = ref('')
const password = ref('')
const isRegister = ref(false)

function toggleMode(): void {
  isRegister.value = !isRegister.value
  userStore.error = ''
}

async function submit(): Promise<void> {
  const mail = email.value.trim()
  const pass = password.value

  if (!mail || !pass) {
    uni.showToast({ title: '请填写邮箱和密码', icon: 'none' })
    return
  }

  try {
    if (isRegister.value) {
      await userStore.signUp(mail, pass)
    } else {
      await userStore.signIn(mail, pass)
    }
    goTrips()
  } catch {
    // 错误信息已经写进 userStore.error，模板里展示
  }
}

function goTrips(): void {
  uni.redirectTo({ url: '/pages/trips/index' })
}
</script>

<style lang="scss" scoped>
.auth {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: calc(100vh - var(--window-top, 0px) - var(--window-bottom, 0px));
  padding: 0 $mb-gap-lg;
  background: $mb-bg-white;
}

.auth__notice {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.auth__notice-icon {
  font-size: 80rpx;
  line-height: 1;
}

.auth__notice-title {
  margin-top: $mb-gap-md;
  font-size: 34rpx;
  font-weight: 600;
  color: $mb-text-primary;
}

.auth__notice-text {
  margin-top: $mb-gap-sm;
  font-size: 26rpx;
  color: $mb-text-secondary;
  text-align: center;
}

:deep(.auth__notice-btn) {
  margin-top: $mb-gap-xl;
}

.auth__form {
  display: flex;
  flex-direction: column;
}

.auth__title {
  display: block;
  font-size: 44rpx;
  font-weight: 700;
  color: $mb-text-primary;
}

.auth__subtitle {
  display: block;
  margin-top: $mb-gap-xs;
  margin-bottom: $mb-gap-xl;
  font-size: 26rpx;
  color: $mb-text-disabled;
}

.auth__field {
  margin-bottom: $mb-gap-md;
  border-bottom: 1rpx solid $mb-border;
}

.auth__error {
  margin-bottom: $mb-gap-md;
  font-size: 24rpx;
  color: $mb-danger;
}

:deep(.auth__submit) {
  margin-top: $mb-gap-md;
}

.auth__switch {
  margin-top: $mb-gap-lg;
  font-size: 26rpx;
  color: $mb-primary;
  text-align: center;
}
</style>
