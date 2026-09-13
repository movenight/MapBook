<template>
  <wd-action-sheet
    :model-value="modelValue"
    :actions="actions"
    :title="title"
    cancel-text="取消"
    @update:model-value="onVisibleChange"
    @select="onSelect"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { WaypointType } from '@/types/waypoint'
import { WAYPOINT_TYPES, WAYPOINT_TYPE_ICONS, WAYPOINT_TYPE_LABELS } from '@/types/waypoint'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    title?: string
  }>(),
  { title: '这一点是什么？' }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'select', type: WaypointType): void
}>()

const actions = computed(() =>
  WAYPOINT_TYPES.map((type) => ({
    name: `${WAYPOINT_TYPE_ICONS[type]} ${WAYPOINT_TYPE_LABELS[type]}`,
    type,
  }))
)

function onVisibleChange(value: boolean): void {
  emit('update:modelValue', value)
}

function onSelect(event: { item: { type?: WaypointType } }): void {
  const type = event?.item?.type
  emit('update:modelValue', false)
  if (type) {
    emit('select', type)
  }
}
</script>
