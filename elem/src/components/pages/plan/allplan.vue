<template>
  <div class="page-box">
    <div class="page-workbar toolbar-box">
      <el-button><i class="icon iconfont icon-xinjian"></i>新建</el-button>
      <el-button><i class="icon iconfont icon-void"></i>作废</el-button>
      <span>
        包含范围：
        <el-select v-model="rangeStatus" placeholder="请选择">
          <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
      </span>
      <span>
        <el-checkbox v-model="containStatus">包含下级机构</el-checkbox>
      </span>
    </div>
    <div class="page-contant"></div>
  </div>
</template>
<script>
export default {
  data () {
    return {
      rangeStatus: true,
      options: [{
        "label": '正常',
        "value": true
      },
      {
        "label": '作废',
        "value": false
      }],
      containStatus: false
    }
  }
}
</script>

