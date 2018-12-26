<template>
  <transition enter-active-class="slideInUp" leave-active-class="slideOutDown">
    <div class="add-box" v-if="boxShow">
      <div class="add-title">
        {{ title }}
        <span><i class="iconfont icon-guanbi" @click="close"></i></span>
      </div>
      <div class="add-status-bar">
        <span>状态：</span>
        <span>编制人：</span>
        <span>编制日期：</span>
        <span>编制机构：</span>
      </div>
      <div class="add-tab-contant">
        <el-tabs v-model="activeTab" @tab-click="handleClick" class="add-tab-box">
          <!-- 基本信息 -->
          <el-tab-pane class="add-panel" label="基本信息" name="base">
          </el-tab-pane>
          <!-- 材料明细 -->
          <el-tab-pane class="add-panel" label="材料明细" name="detail">

          </el-tab-pane>
          <!-- 附件信息 -->
          <el-tab-pane class="add-panel" label="附件信息" name="extension">

          </el-tab-pane>
          <!-- 审批记录-->
          <el-tab-pane class="add-panel" label="审批记录" name="list">
          </el-tab-pane>
        </el-tabs>
      </div>
      <div class="add-bottom">
        <el-button type="primary">作废</el-button>
        <el-button type="primary">暂存</el-button>
        <el-button type="primary">提交</el-button>
        <el-button type="primary">编辑</el-button>
        <el-button type="primary">撤回</el-button>
        <el-button type="primary">上报</el-button>
        <!-- 作废  暂存  提交 编辑 撤回  下发  上报-->
      </div>
    </div>
  </transition>
</template>
<script>
export default {
  data () {
    return {
      boxShow: false,
      activeTab: "base",
      title: "新建年需用计划"
    }
  },
  methods: {
    handleClick () {
    },
    show () {
      this.boxShow = true
    },
    close () {
      this.boxShow = false
    }
  }
}
</script>


