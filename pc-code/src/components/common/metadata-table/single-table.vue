<template>
  <el-table highlight-current-row stripe border :data="tableData" :span-method="objectSpanMethod" ref="multipleTable" border @row-click="rowClick" class="el-table-single" @selection-change="selectionChange" @current-change="currentChange" style="width: 100%" height="100%">
    <el-table-column v-if="indexStatus" type="selection" :label="indexLabel" width="52">
    </el-table-column>
    <template v-for="item in tableColumn">
      <table-column v-if="item.children&&item.children.length>0" :model="item" show-overflow-tooltip :key="item.prop"></table-column>
      <el-table-column v-else :key="item.id" :label="item.label" :prop="item.prop" :width="item.width" show-overflow-tooltip>
      </el-table-column>
    </template>
  </el-table>
</template>

<script>
import tableColumn from './table-column.vue'
export default {
  data () {
    return {
      multipleSelection: [],
      currentRow: null,
      selectItem: '',
      spanArr: [],
      pos: 0,
      now_col_row_num: {},
      now_col_offset: {},

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
    indexLabel: {
      type: String,
      default: "序号"
    },
    merge: {
      type: Object,
      default: null
    }
  },
  components: {
    tableColumn
  },
  mounted () {
    let tableDom = this.$refs.multipleTable
    //外部单位表格默认第一行被选中，区分两个表格通过父组件传递过来的状态位
    if (!this.indexStatus) {
      //默认设置表格的第一行被选中
      tableDom.setCurrentRow(tableDom.data[0])
    }

  },
  watch: {
    tableData: {
      handler (newValue) {
        if (this.merge) {
          this.getSpanArr(newValue)
        }
      },
      deep: true
    }
  },
  methods: {
    rowClick (row) {
      this.$refs.multipleTable.toggleRowSelection(row)
    },
    currentChange (val) {
      this.$emit('selectList', val)
    },
    selectionChange (val) {
      this.$emit("selected", val)
    },
    getSpanArr (data) {
      for (var i = 0; i < data.length; i++) {
        if (i === 0) {
          this.spanArr.push(1);
          this.pos = 0
        } else {
          // 判断当前元素与上一个元素是否相同
          if (data[i].waybillNum === data[i - 1].waybillNum) {
            this.spanArr[this.pos] += 1;
            this.spanArr.push(0);
          } else {
            this.spanArr.push(1);
            this.pos = i;
          }
        }
      }

    },

    objectSpanMethod ({ row, column, rowIndex, columnIndex }) {
      console.log(row)
      if (!this.now_col_row_num[column.property]) {
        this.now_col_row_num[column.property] = Object.assign([], this.column_row_offset[column.property]);
        let a = this.now_col_row_num[column.property].shift();
        this.now_col_offset[column.property] = a;
        return {
          rowspan: a,
          colspan: 1
        };
      } else if (rowIndex >= this.now_col_offset[column.property]) {
        let a = this.now_col_row_num[column.property].shift();
        this.now_col_offset[column.property] += a;
        return {
          rowspan: a,
          colspan: 1
        };
      } else {
        return {
          rowspan: 0,
          colspan: 0
        };
      }
    }
  }
}
</script>
