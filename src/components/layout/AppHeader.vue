<template>
  <header class="app-header">
    <div class="header-left">
      <router-link to="/" class="logo">MapBook</router-link>
      <nav class="header-nav">
        <router-link to="/">首页</router-link>
        <router-link to="/trips">我的路书</router-link>
      </nav>
    </div>
    <div class="header-right">
      <template v-if="user">
        <span class="user-email">{{ user.email }}</span>
        <el-button size="small" @click="handleLogout">退出</el-button>
      </template>
      <el-button v-else size="small" type="primary" @click="$router.push('/auth')">
        登录
      </el-button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/services/supabase'

const router = useRouter()
const user = ref<{ email?: string } | null>(null)

onMounted(async () => {
  const { data } = await supabase.auth.getUser()
  user.value = data.user
})

async function handleLogout() {
  await supabase.auth.signOut()
  user.value = null
  router.push('/')
}
</script>

<style lang="less" scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 0 24px;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 32px;
}

.logo {
  font-size: 20px;
  font-weight: 700;
  color: #1677ff;
  text-decoration: none;
}

.header-nav {
  display: flex;
  gap: 20px;

  a {
    color: #666;
    text-decoration: none;
    font-size: 14px;

    &:hover,
    &.router-link-active {
      color: #1677ff;
    }
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-email {
  font-size: 13px;
  color: #999;
}
</style>
