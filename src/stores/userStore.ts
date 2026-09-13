import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { AuthUser } from '@/services/backend'
import { getBackend } from '@/services/backend'

export const useUserStore = defineStore('user', () => {
  const user = ref<AuthUser | null>(null)
  const loading = ref(false)
  const error = ref('')
  /** 是否已经从后端读过一次登录态 */
  const ready = ref(false)

  /**
   * 小程序端为 false：云开发用 openid 隐式识别身份，没有登录流程。
   * H5 端为 true：需要邮箱密码登录。
   */
  const requiresLogin = computed(() => getBackend().requiresLogin)

  const isLoggedIn = computed(() => (requiresLogin.value ? !!user.value : true))

  const displayName = computed(
    () => user.value?.displayName ?? user.value?.email ?? '微信用户'
  )

  async function refresh(): Promise<AuthUser | null> {
    loading.value = true
    try {
      user.value = await getBackend().getCurrentUser()
      return user.value
    } catch (e) {
      error.value = e instanceof Error ? e.message : '读取登录态失败'
      user.value = null
      return null
    } finally {
      loading.value = false
      ready.value = true
    }
  }

  /** 只在首次调用时真正请求，避免每个页面 onLoad 都打一次后端 */
  async function ensureReady(): Promise<void> {
    if (ready.value) return
    await refresh()
  }

  async function signIn(email: string, password: string): Promise<void> {
    loading.value = true
    error.value = ''
    try {
      user.value = await getBackend().signIn(email, password)
    } catch (e) {
      error.value = e instanceof Error ? e.message : '登录失败'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function signUp(email: string, password: string): Promise<void> {
    loading.value = true
    error.value = ''
    try {
      user.value = await getBackend().signUp(email, password)
    } catch (e) {
      error.value = e instanceof Error ? e.message : '注册失败'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function signOut(): Promise<void> {
    try {
      await getBackend().signOut()
    } finally {
      user.value = null
      ready.value = true
    }
  }

  /**
   * 页面级登录守卫。
   * 返回 true 表示可以继续；返回 false 表示已经跳转到登录页。
   */
  async function requireLogin(): Promise<boolean> {
    await ensureReady()
    if (isLoggedIn.value) return true
    uni.navigateTo({ url: '/pages/auth/index' })
    return false
  }

  return {
    user,
    loading,
    error,
    ready,
    requiresLogin,
    isLoggedIn,
    displayName,
    refresh,
    ensureReady,
    signIn,
    signUp,
    signOut,
    requireLogin,
  }
})
