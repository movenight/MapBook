<template>
  <wd-popup
    :model-value="modelValue"
    position="bottom"
    :round="true"
    :safe-area-inset-bottom="true"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <view class="sheet">
      <view class="sheet__header">
        <text class="sheet__title">编辑地点</text>
      </view>

      <view v-if="waypoint" class="sheet__body">
        <view class="sheet__row">
          <text class="sheet__label">名称</text>
          <view class="sheet__control">
            <wd-input v-model="name" placeholder="地点名称" no-border />
          </view>
        </view>

        <view class="sheet__row" @click="typeSheetVisible = true">
          <text class="sheet__label">类型</text>
          <view class="sheet__control sheet__control--picker">
            <text class="sheet__value">{{ typeLabel }}</text>
            <wd-icon name="arrow-right" size="14px" color="#999999" />
          </view>
        </view>

        <view class="sheet__row sheet__row--stack">
          <text class="sheet__label">备注</text>
          <view class="sheet__control">
            <wd-textarea
              v-model="notes"
              placeholder="几点到、门票、注意事项…"
              :maxlength="200"
              :auto-height="true"
            />
          </view>
        </view>

        <view class="sheet__actions">
          <wd-button plain custom-class="sheet__action" @click="close">取消</wd-button>
          <wd-button type="primary" custom-class="sheet__action" @click="onSave">保存</wd-button>
        </view>

        <wd-button type="error" plain block custom-class="sheet__delete" @click="onDelete">
          删除这个地点
        </wd-button>
      </view>
    </view>

    <WaypointTypeSheet v-model="typeSheetVisible" title="选择类型" @select="onTypeSelect" />
  </wd-popup>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Waypoint, WaypointType } from '@/types/waypoint'
import { WAYPOINT_TYPE_ICONS, WAYPOINT_TYPE_LABELS } from '@/types/waypoint'
import WaypointTypeSheet from '@/components/map/WaypointTypeSheet.vue'

const props = defineProps<{
  modelValue: boolean
  waypoint: Waypoint | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'save', payload: { id: string; patch: Partial<Waypoint> }): void
  (e: 'delete', id: string): void
}>()

const name = ref('')
const notes = ref('')
const type = ref<WaypointType>('waypoint')
const typeSheetVisible = ref(false)

// 每次打开都从传入的地点重建表单，避免串上一个地点的内容
watch(
  () => props.waypoint,
  (waypoint) => {
    name.value = waypoint?.name ?? ''
    notes.value = waypoint?.notes ?? ''
    type.value = waypoint?.type ?? 'waypoint'
  },
  { immediate: true }
)

const typeLabel = computed(
  () => `${WAYPOINT_TYPE_ICONS[type.value]} ${WAYPOINT_TYPE_LABELS[type.value]}`
)

function close(): void {
  emit('update:modelValue', false)
}

function onSave(): void {
  if (!props.waypoint) return
  emit('save', {
    id: props.waypoint.id,
    patch: { name: name.value, notes: notes.value, type: type.value },
  })
  close()
}

function onDelete(): void {
  if (!props.waypoint) return
  emit('delete', props.waypoint.id)
  close()
}

function onTypeSelect(next: WaypointType): void {
  type.value = next
}
</script>

<style lang="scss" scoped>
.sheet {
  padding: $mb-gap-md $mb-gap-md $mb-gap-lg;
}

.sheet__header {
  padding-bottom: $mb-gap-md;
  text-align: center;
}

.sheet__title {
  font-size: 30rpx;
  font-weight: 600;
  color: $mb-text-primary;
}

.sheet__row {
  display: flex;
  align-items: center;
  padding: $mb-gap-md 0;
  border-bottom: 1rpx solid $mb-border-light;

  &--stack {
    align-items: flex-start;
    flex-direction: column;
  }
}

.sheet__label {
  flex-shrink: 0;
  width: 120rpx;
  font-size: 28rpx;
  color: $mb-text-secondary;
}

.sheet__control {
  flex: 1;
  min-width: 0;

  &--picker {
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }
}

.sheet__value {
  margin-right: $mb-gap-xs;
  font-size: 28rpx;
  color: $mb-text-primary;
}

.sheet__row--stack .sheet__control {
  width: 100%;
  margin-top: $mb-gap-sm;
}

.sheet__actions {
  display: flex;
  gap: $mb-gap-md;
  margin-top: $mb-gap-lg;
}

:deep(.sheet__action) {
  flex: 1;
}

:deep(.sheet__delete) {
  margin-top: $mb-gap-md;
}
</style>
