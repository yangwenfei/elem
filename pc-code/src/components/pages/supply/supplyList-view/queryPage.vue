<template>
  <el-form ref="baseForm" class="baseForm" :model="formData" label-width="110px">
    <dl>
      <dt>
        <el-row type="flex" justify="center" align="middle">
          <el-form-item prop="beginDate">
            <span class="dateArrow" @click="preDate">&lt;</span>
            <el-date-picker v-model="formData.beginDate" @change="change" type="date" placeholder="选择日期"></el-date-picker>-
            <el-date-picker v-model="formData.endDate" type="date" placeholder="选择日期"></el-date-picker>
            <span class="dateArrow" @click="nextDate">&gt;</span>
          </el-form-item>
        </el-row>
      </dt>
      <dd>
        <el-row class="add-form-mb30" type="flex" align="middle">
          <el-col :span="6">
            <el-form-item label="采购单位" prop="projectName">
              <el-autocomplete v-model="formData.projectName" :fetch-suggestions="projectNameSearch" @select="projectNameSelect" placeholder="搜索采购单位">
                <i slot="suffix" class="iconfont ipt-del" @click="clearInput('projectName')">×</i>
              </el-autocomplete>
            </el-form-item>
          </el-col>
          <el-col :span="6" :offset="5">
            <el-form-item label="材料明细" prop='materialName'>
              <el-autocomplete v-model="formData.materialName" :fetch-suggestions="materialSearch" @select="materialSelect" placeholder="搜索材料">
                <i slot="suffix" class="iconfont ipt-del" @click="clearInput('materialName')">×</i>
              </el-autocomplete>

            </el-form-item>
          </el-col>
          <el-col :span="3" :offset="3">
            <el-button type="primary" @click="search">查询</el-button>
          </el-col>
        </el-row>
      </dd>
    </dl>

  </el-form>
</template>

<script>
import axios from 'axios'
export default {
  data () {
    return {
      projectNameArray: [],
      materialArray: [],
      selectedProjectName: '',
      selectedMaterialName: ''
    }
  },
  props: {
    formData: Object,
    canEdit: {
      type: Boolean,
      default: false
    },
    status: {
      type: Object
    },
    page: {
      type: Object
    }
  },
  methods: {
    formValid () {
      let flag = false
      this.$refs['baseForm'].validate((valid) => {
        if (valid) {
          flag = true
        }
      })
      return flag
    },
    preDate () {//前一天
      this.formData.beginDate = new Date(this.formData.beginDate.getTime() - 24 * 60 * 60 * 1000)
      this.formData.endDate = new Date(this.formData.endDate.getTime() - 24 * 60 * 60 * 1000)
    },
    nextDate () {//后一天
      this.formData.beginDate = new Date(this.formData.beginDate.getTime() + 24 * 60 * 60 * 1000)
      this.formData.endDate = new Date(this.formData.endDate.getTime() + 24 * 60 * 60 * 1000)
    },
    clearInput (param) {//清空搜索框
      this.page.index = 0//切换查询条件时当前页应该从0开始
      this.formData[param] = ''
      if (param == 'materialName') {
        this.formData.materialId = ''
      } else if (param == 'projectName') {
        this.formData.projectId = ''
      }
    },
    projectNameSearch (queryString, cb) {//采购单位下拉框搜素
      if (this.selectedProjectName != queryString) {
        this.formData.projectId = null
        this.status.projectClick = false
      }
      var projectNameArray = this.projectNameArray;
      var results = queryString ? projectNameArray.filter(item => { return item.value.includes(queryString) }) : projectNameArray;
      // 调用 callback 返回建议列表的数据
      if (results.length > 0) {
        cb(results);
      } else {
        this.formData.projectId = null
        cb([{ 'value': '暂无数据' }])
      }
    },
    materialSearch (queryString, cb) {//材料下拉框搜素
      if (this.selectedMaterialName != queryString) {
        this.formData.materialId = null
        this.status.materialClick = false
      }
      var materialArray = this.materialArray;
      var results = queryString ? materialArray.filter(item => { return item.value.includes(queryString) }) : materialArray;
      // 调用 callback 返回建议列表的数据
      if (results.length > 0) {
        cb(results);
      } else {
        this.formData.materialId = null
        cb([{ 'value': '暂无数据' }])
      }

    },
    projectNameSelect (item) {
      this.page.index = 0//切换查询条件时当前页应该从0开始
      this.selectedProjectName = item.value
      this.status.projectClick = true
      this.formData.projectName = item.value
      this.formData.projectId = item.projectId
    },
    materialSelect (item) {
      this.page.index = 0//切换查询条件时当前页应该从0开始
      this.selectedMaterialName = item.value
      this.status.materialClick = true
      this.formData.materialId = item.materialId
      this.formData.materialName = item.value
    },
    getMaterials () {//材料明细下拉框的数据
      let param = {
        'materialName': ''
      }
      this.$api.supplyList.getMaterials()
        .then(res => {
          res = res.data
          if (res && res.length > 0) {
            res.forEach(element => {
              element.value = element.materialName
            });
            this.materialArray = res
          } else {
            this.materialArray = []
          }
        })
        .catch(error => {
          console.log(error)
        })
    },
    getProjectNames () {//采购单位下拉框的数据
      let param = {
        'projectName': ''
      }
      this.$api.supplyList.getProjectNames()
        .then(res => {
          res = res.data
          if (res && res.length > 0) {
            res.forEach(element => {
              element.value = element.projectName
            });
            this.projectNameArray = res
          } else {
            this.projectNameArray = []
          }
        })
        .catch(error => {
          console.log(error)
        })
    },
    search () {//查询
      this.$emit("search")
    },
    change (val) {
      // console.log(val)
    }
  },
  mounted () {
    this.getMaterials()
    this.getProjectNames()
  }
}
</script>
<style  scoped>
</style>


