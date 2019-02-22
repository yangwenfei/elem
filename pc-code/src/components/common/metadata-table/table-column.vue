<template>
  <el-table-column
    v-if="isFolder"
    :key="model.id"
    :label="model.label"
    :prop="model.prop"
    show-overflow-tooltip>
    <template v-for="item in model.children">
      <tableColumn v-if="item.children && item.children.length" :model="item"></tableColumn>
      <el-table-column
        v-else
        :key="item.id"
        :label="item.label"
        :prop="item.prop" 
        :width="item.width"
        show-overflow-tooltip>
      </el-table-column>
    </template>
  </el-table-column>
  <el-table-column
    v-else
    :key="model.id"
    :label="model.label"
    :prop="model.propo"
    show-overflow-tooltip>
  </el-table-column>
</template>

<script>
  export default {
    name: 'tableColumn',
    props: ['model'],
    computed: {
      isFolder() {
        return this.model.children && this.model.children.length;
      }
    }
  }
</script>
