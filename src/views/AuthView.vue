<template>
  <div class="auth-view">
    <div class="auth-card">
      <h2>{{ isRegister ? '注册' : '登录' }} MapBook</h2>
      <el-form>
        <el-form-item>
          <el-input v-model="email" placeholder="邮箱" type="email" size="large" />
        </el-form-item>
        <el-form-item>
          <el-input v-model="password" placeholder="密码" type="password" size="large" show-password />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="large" :loading="loading" style="width: 100%" @click="handleSubmit">
            {{ isRegister ? '注册' : '登录' }}
          </el-button>
        </el-form-item>
      </el-form>
      <el-alert v-if="errorMsg" :title="errorMsg" type="error" show-icon :closable="false" style="margin-bottom: 16px" />
      <p class="auth-toggle">
        {{ isRegister ? '已有账号？' : '还没有账号？' }}
        <el-button link type="primary" @click="isRegister = !isRegister; errorMsg = ''">
          {{ isRegister ? '去登录' : '去注册' }}
        </el-button>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/services/supabase'

const router = useRouter()
const email = ref('')
const password = ref('')
const loading = ref(false)
const isRegister = ref(false)
const errorMsg = ref('')

async function handleSubmit() {
  errorMsg.value = ''
  if (!email.value || !password.value) {
    errorMsg.value = '请填写邮箱和密码'
    return
  }

  loading.value = true
  try {
    const { error } = isRegister.value
      ? await supabase.auth.signUp({ email: email.value, password: password.value })
      : await supabase.auth.signInWithPassword({ email: email.value, password: password.value })

    if (error) {
      errorMsg.value = error.message
      return
    }
    router.push('/trips')
  } catch (err: any) {
    errorMsg.value = err?.message || '请求失败，请检查网络'
  } finally {
    loading.value = false
  }
}
</script>

<style lang="less" scoped>
.auth-view {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: #f5f5f5;
}

.auth-card {
  width: 400px;
  padding: 40px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);

  h2 {
    text-align: center;
    margin: 0 0 24px;
  }
}

.auth-toggle {
  text-align: center;
  font-size: 14px;
  color: #999;
}
</style>
