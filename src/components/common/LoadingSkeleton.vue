<template>
  <div class="loading-skeleton">
    <el-skeleton animated>
      <template #template>
        <el-skeleton-item variant="image" style="width: 100%; height: 200px" />
        <div style="padding: 14px">
          <el-skeleton-item variant="h3" style="width: 60%" />
          <div style="display: flex; align-items: center; gap: 16px; margin-top: 8px">
            <el-skeleton-item variant="text" style="width: 30%" />
          </div>
        </div>
      </template>
    </el-skeleton>
  </div>
</template>
