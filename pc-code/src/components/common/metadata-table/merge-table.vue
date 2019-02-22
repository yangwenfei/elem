<template>
  <div>
    <el-table :data="changeData" :span-method="objectSpanMethod" :stripe='true' :border="true" @selection-change="selection" style="height:100%">
      <el-table-column type="selection" label="序号" width="52">
      </el-table-column>
      <el-table-column v-for="item in tableColumn" :key="item.id" :prop="item.prop" :label="item.label" show-overflow-tooltip :width="item.width">
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
export default {
  methods: {
    objectSpanMethod ({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 1 || columnIndex === 6 || columnIndex === 7 || columnIndex === 8 || columnIndex === 9 || columnIndex === 10 || columnIndex === 11) {
        const _row = this.spanArr[rowIndex]
        const _col = _row > 0 ? 1 : 0;
        return {
          rowspan: _row,
          colspan: _col
        }
      }
    },
    selection (val) {
      this.$emit('selected', val)
    }
  },
  data () {
    return {
      spanArr: [],
    };
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
  computed: {
    changeData () {
      this.spanArr = []
      let contactDot = 0;
      this.tableData.forEach((item, index) => {
        item.index = index;
        if (index === 0) {
          this.spanArr.push(1);
        } else {
          if (item.waybillNum === this.tableData[index - 1].waybillNum) {
            this.spanArr[contactDot] += 1;
            this.spanArr.push(0);
          } else {
            this.spanArr.push(1);
            contactDot = index;
          }
        }
      });
      return this.tableData
    }
  }
}
</script>

