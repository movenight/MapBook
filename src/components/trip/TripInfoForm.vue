<template>
  <el-form :model="form" label-width="80px">
    <el-form-item label="标题">
      <el-input v-model="form.title" placeholder="给路书起个名字" />
    </el-form-item>
    <el-form-item label="描述">
      <el-input v-model="form.description" type="textarea" :rows="3" placeholder="描述一下这趟旅程" />
    </el-form-item>
    <el-form-item label="日期">
      <el-date-picker
        v-model="form.dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
      />
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

const form = reactive({
  title: '',
  description: '',
  dateRange: null as [Date, Date] | null,
})
</script>
