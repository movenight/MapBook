<template>
  <div class="marker-popup">
    <div class="popup-title">{{ waypoint?.name || '未命名地点' }}</div>
    <div v-if="waypoint?.address" class="popup-addr">{{ waypoint.address }}</div>
    <el-divider />
    <el-form label-width="60px" size="small">
      <el-form-item label="类型">
        <el-select v-model="localType" @change="onSave">
          <el-option label="出发地" value="departure" />
          <el-option label="目的地" value="destination" />
          <el-option label="途径点" value="waypoint" />
          <el-option label="住宿" value="lodgment" />
          <el-option label="餐饮" value="dining" />
        </el-select>
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model="localNotes" type="textarea" :rows="2" @blur="onSave" />
      </el-form-item>
    </el-form>
    <div class="popup-actions">
      <el-button size="small" type="primary" @click="onSave">保存</el-button>
      <el-button size="small" type="danger" @click="onDelete">删除</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Waypoint } from '@/types/waypoint'
import { useTripStore } from '@/stores/tripStore'

const props = defineProps<{
  waypoint: Waypoint | null
}>()

const emit = defineEmits<{
  close: []
}>()

const tripStore = useTripStore()
const localType = ref(props.waypoint?.type || 'waypoint')
const localNotes = ref(props.waypoint?.notes || '')

watch(
  () => props.waypoint,
  (wp) => {
    if (wp) {
      localType.value = wp.type
      localNotes.value = wp.notes
    }
  }
)

function onSave() {
  if (!props.waypoint) return
  tripStore.updateWaypoint(props.waypoint.id, {
    type: localType.value,
    notes: localNotes.value,
  })
}

function onDelete() {
  if (!props.waypoint) return
  tripStore.removeWaypoint(props.waypoint.id)
  emit('close')
}
</script>

<style lang="less" scoped>
.marker-popup {
  min-width: 220px;
}

.popup-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.popup-addr {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.popup-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 8px;
}
</style>
