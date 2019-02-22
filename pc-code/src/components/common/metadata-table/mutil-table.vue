<template>
  <el-table :data="tableData" ref="multipleTable"
    border @selection-change="selectList" @row-click="rowClick"
    style="width: 100%" height="100%">
    <el-table-column
      v-if="indexStatus"
      type="selection"
      width="50">
    </el-table-column>
    <el-table-column
      type="index"
      label= "序号"
      width="50">
    </el-table-column>
    <template v-for="item in tableColumn">
      <table-column v-if="item.children&&item.children.length>0" :model="item"></table-column>
      <el-table-column
        v-else
        :key="item.id"
        :label="item.label"
        :prop="item.prop"
        :width="item.width"
        show-overflow-tooltip>
      </el-table-column>
    </template>
  </el-table>
</template>

<script>
  import tableColumn from './table-column.vue'
  export default {
    data () {
      return {
        multipleSelection:[],
        currentRow: null,
        selectItem: ''
      }
    },
    props: {
      tableColumn: {
        type: Array,
        default: []
      },
      tableData: {
        type: Array,
        default: []
      },
      indexStatus: {
        type: Boolean,
        default: true
      },
    },
    components: {
      tableColumn
    },
    methods: {
      rowClick (row) {
        this.$refs.multipleTable.toggleRowSelection(row)
      },
      selectList(val) {
        this.$emit('selectList', val)
      }
    }
  }
</script>
