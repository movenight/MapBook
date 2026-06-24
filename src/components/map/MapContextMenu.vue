<template>
  <div
    v-if="visible"
    class="context-menu"
    :style="{ left: x + 'px', top: y + 'px' }"
  >
    <div class="menu-item" @click="$emit('select', 'departure')">设为出发地</div>
    <div class="menu-item" @click="$emit('select', 'destination')">设为目的地</div>
    <div class="menu-item" @click="$emit('select', 'waypoint')">添加为途径点</div>
    <div class="menu-item" @click="$emit('select', 'lodgment')">添加为住宿点</div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  visible: boolean
  x: number
  y: number
}>()

defineEmits<{
  select: [type: string]
  close: []
}>()
</script>

<style lang="less" scoped>
.context-menu {
  position: absolute;
  z-index: 100;
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  min-width: 140px;
  overflow: hidden;
}

.menu-item {
  padding: 10px 16px;
  font-size: 13px;
  color: #333;
  cursor: pointer;

  &:hover {
    background: #f0f5ff;
    color: #1677ff;
  }
}
</style>
