<template>
  <div class="home-view">
    <div class="home-hero">
      <h1 class="home-title">MapBook</h1>
      <p class="home-subtitle">在地图上规划你的旅程</p>
      <el-button type="primary" size="large" @click="goCreate">
        创建路书
      </el-button>
      <el-button size="large" @click="goTrips">
        我的路书
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function goCreate() {
  router.push('/trips/new')
}

function goTrips() {
  router.push('/trips')
}
</script>

<style lang="less" scoped>
.home-view {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.home-hero {
  text-align: center;
  color: #fff;
}

.home-title {
  font-size: 56px;
  font-weight: 700;
  margin: 0 0 12px;
  letter-spacing: 2px;
}

.home-subtitle {
  font-size: 20px;
  opacity: 0.85;
  margin: 0 0 32px;
}
</style>
