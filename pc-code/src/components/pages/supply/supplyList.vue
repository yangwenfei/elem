<template>
  <div class="page-box">
    <!-- title -->
    <div class="page-contant">
      <dl class="page-title">
        <dt>{{title}}</dt>
        <dd class="export" @click="exportExcel"><i class="iconfont icon-excel"></i>导出</dd>
      </dl>
      <!-- 查询面板 -->
      <div class="page-query">
        <query-page :formData="formData" @search="search" :status="status" :page="page"></query-page>
      </div>
      <!-- 数据列表 -->
      <div class="page-list">
        <div class="listBox" style="height:100%;overflow-y: auto;">
          <list-table :tableColumn="tableColumn" :tableData="tableData" :merge="merge" @selected="selectList" indexLabel="操作" id="out-table"></list-table>
        </div>
        <!-- 二维码打印按钮 -->
        <el-row type="flex" justify="center" class="codeBtn" style="width:100%">
          <el-button type="primary" @click="print(1)" title="按照批次进行材料管理，每个批次材料打印一个二维码">打印批次二维码</el-button>
          <el-button type="primary" @click="print(2)" title="按照同一批次的每个个体进行管理，打印个体二维码数量同运单数量">打印个体二维码</el-button>
        </el-row>
        <!-- 分页 -->
        <div class="pageNation" v-show="pageShow">
          <el-pagination background :page-size="page.size" layout="prev, pager, next" :total="page.total" @current-change="currentChange">
          </el-pagination>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import QueryPage from "./supplyList-view/queryPage.vue"
import ListTable from "@/components/common/metadata-table/merge-table.vue"
import commonFn from "@/assets/js/common.js"
import QRCode from 'qrcodejs2'

export default {
  name: "allplan",
  data () {
    return {
      title: "运单列表",
      formData: {
        beginDate: new Date(),
        endDate: new Date(),
        projectName: "",
        projectId: null,
        materialName: "",
        materialId: null,
      },
      page: {
        index: 0,
        size: 30,
        total: 0
      },
      pageShow: false,
      tableColumn: [//列表表头
        {
          "label": "运单编号",
          "prop": "waybillNum",
          'width': 160
        },
        {
          "label": "材料名称",
          "prop": "materialName",
          'width': 160
        },
        {
          "label": "单位",
          "prop": "unit",
          'width': 65
        },
        {
          "label": "批次编号",
          "prop": "batchNumber",
          'width': 180
        },
        {
          "label": "运单数量",
          "prop": "waybillQuantity",
          "width": 100,
        },
        {
          "label": "车牌号",
          "prop": "carNum",
          'width': 100,
        },
        {
          "label": "发货时间",
          "prop": "waybillSendTime",
          "width": 180
        },
        {
          "label": "采购单位",
          "prop": "projectName",
          'width': 160
        },
        {
          "label": "收货地点",
          "prop": "address"
        },
        {
          "label": "发货人",
          "prop": "creater"
        }
      ],
      tableData: [],
      selectTable: [],//选中的列表数据
      merge: { //单元格合并行的条件
        col: [1, 6, 7, 8, 9, 10, 11],//需要合并的列
        param: "waybillNum"//根据供货单编码进行合并
      },
      qrCode: { //生成二维码方法只在第一次点击按钮时调用
        batch: true,
        individual: true
      },
      status: {
        projectClick: false,
        materialClick: false
      }
    }
  },
  methods: {
    print (type) {//打印二维码
      var data = this.selectTable
      var newData = [];
      //合并数据
      data.forEach(function (v, i) {
        v.billId = v.id
        var n;
        for (var i = 0; i < newData.length; i++) {
          var t = newData[i];
          if (t.billId == v.billId) {
            n = t;
            break;
          }
        }
        if (!n) {
          n = { billId: v.billId, materialIds: [] };
          newData.push(n);
        }
        delete v.billId;
        n.materialIds.push(v.waybillId)
      });
      if (this.selectTable.length > 0) {
        let param = {
          "type": type,
          "billInfo": newData
        }
        this.$api.supplyList.qrcode(param)
          .then(res => {
            if (res.success) {
              var newWin = window.open(""); //新打开一个空窗口
              let ul = this.createCode(res.data, newWin)
              //去掉页眉和页脚
              var style = newWin.document.createElement('style');
              style.innerHTML = "*{margin:0;padding:0} ul{padding-left:20px} @media print {@page {size:auto;margin: 0mm auto;}}";
              newWin.document.head.appendChild(style);
              newWin.document.body.appendChild(ul); //将图片添加进新的窗口
              setTimeout(function () {
                newWin.window.print(); //打印
              })
            } else {
              this.$message({
                message: res.errMsg,
                type: 'error'
              });
            }

          })
          .catch(error => {
            console.log(error)
          })
      } else {
        this.$message({
          message: '请选择材料后再打印',
          type: 'warning'
        });
      }
    },
    createCode (data, newWin) {//生成二维码
      let ul = newWin.document.createElement('ul')
      for (var i = 0; i < data.length; i++) {
        let item = data[i]
        let li = newWin.document.createElement('li')
        let divCode = document.createElement('div')
        item.codeContent.product = item.codeContent.product.toLowerCase()
        let text = JSON.stringify(item.codeContent)
        new QRCode(divCode, {
          width: 120, // 设置宽度，单位像素
          height: 120, // 设置高度，单位像素
          text: text,  // 设置二维码内容或跳转地址
          correctLevel: 1,
          render: "canvas"
        })
        /*----------兼容ie处理开始------------- */
        let imgDom = divCode.querySelector('canvas')
        // console.log('str', imgDom.toDataURL("image/png"))
        var str = `<canvas width="120" height="120" style="display: none;"></canvas>
                  <img style="display: block;" alt="Scan me!" src="${imgDom.toDataURL("image/png")}"></img>
                  `
        let newDiv = newWin.document.createElement('div')
        newDiv.innerHTML = str
        newDiv.setAttribute('style', 'float:left')
        li.appendChild(newDiv)
        /*------兼容ie处理结束------ */
        let showCodeName = ''
        let showCodeStr = ''
        if (item.showContent.type == 1) {
          showCodeName = '批次二维码'
        } else {
          showCodeName = '个体二维码'
          showCodeStr = `<span style="display:inline-block;word-wrap:break-word;width:150px">序号：${item.showContent.order}</span><br/>`
        }
        let str = `<span style="display:inline-block;word-wrap:break-word;width:150px">材料：${item.showContent.materialName}</span><br/><span style="display:inline-block;word-wrap:break-word;width:150px">单位：${item.showContent.unit ? item.showContent.unit : ''}</span><br/><span style="display:inline-block;word-wrap:break-word;width:150px">批次：${item.showContent.batchNumber ? item.showContent.batchNumber : ''}</span><br/><span style="display:inline-block;word-wrap:break-word;width:150px">类型：${showCodeName}</span><br/>${showCodeStr}`
        let div = newWin.document.createElement("div")
        div.innerHTML = str
        div.setAttribute('style', "margin-left:10px;float:left")
        li.appendChild(div)
        li.setAttribute('style', "display:flex;list-style:none;overflow-y:hidden;page-break-before: auto;padding-top:30px; page-break-after: always;font-size:13px;font-weight: lighter;font-family:'微软雅黑'")
        ul.appendChild(li)
      }
      return ul
    },
    search () {//查询方法
      if (!this.status.projectClick) {
        this.formData.projectName = ''
      }
      if (!this.status.materialClick) {
        this.formData.materialName = ''
      }
      if (this.formData.beginDate) {
        if (this.formData.endDate) {
          let param = {
            'startDate': (commonFn.dateFormat(this.formData.beginDate, 'yyyy-MM-dd') + ' 00:00:00'),
            'endDate': (commonFn.dateFormat(this.formData.endDate, 'yyyy-MM-dd') + ' 23:59:59'),
            'projectId': this.formData.projectId,
            'materialId': this.formData.materialId,
            'index': this.page.index,
            'size': this.page.size
          }
          this.$api.supplyList.get(param)
            .then(res => {
              if (res.success) {
                let data = res.data
                if (data) {
                  this.page.total = data.count
                  this.tableData = data.supplierBillVos
                  this.tableData.forEach(el => {
                    for (let key in el) {
                      if (key == 'waybillQuantity') {
                        el.waybillQuantity = commonFn.fixNumber(el.waybillQuantity, 3)
                      }
                    }
                  })
                } else {
                  this.tableData = []
                }
              } else {
                this.$message({
                  message: res.errMsg,
                  type: 'error'
                });
              }
              this.pageShow = (this.tableData.length > 0) ? true : false
            })
            .catch(error => {
              console.log(error)
            })
        } else {
          this.$message({
            message: '请选择结束时间',
            type: 'warning'
          });
        }
      } else {
        this.$message({
          message: '请选择开始时间',
          type: 'warning'
        });
      }

    },
    currentChange (val) {//页数发生改变时
      this.page.index = (val - 1)
      this.search()
    },
    selectList (val) {
      this.selectTable = val
    },
    exportExcel () {//导出excel
      let me = this
      if (this.tableData.length > 0) {
        let param = {
          'startDate': (commonFn.dateFormat(this.formData.beginDate, 'yyyy-MM-dd') + ' 00:00:00'),
          'endDate': (commonFn.dateFormat(this.formData.endDate, 'yyyy-MM-dd') + ' 23:59:59'),
          'projectId': this.formData.projectId,
          'materialId': this.formData.materialId
        }
        // console.log(param)
        this.$api.supplyList.exportData(param)
          .then(res => {
            //console.log(res)
            this.ab2str(res, function (str) {
              //   console.log(str)
              //str为字符串
              let firstLetter = str.substr(0, 1)
              if (firstLetter == "{") {
                let objStr = JSON.parse(str)
                me.$message({
                  message: objStr.errMsg,
                  type: 'error'
                });
              } else {
                me.download(res)
              }
            });
          })
          .catch(error => {

            console.log(error)
          })
      } else {
        this.$message({
          message: '暂无数据',
          type: 'warning'
        });
      }

    },
    // 下载文件
    download (data) {
      if (this.isIE()) {
        let excelBlob = new Blob([data])
        window.navigator.msSaveOrOpenBlob(excelBlob, '供货列表.xls');
      } else {
        let url = window.URL.createObjectURL(new Blob([data]))
        let link = document.createElement('a')
        link.style.display = 'none'
        link.href = url
        link.setAttribute('download', '供货列表.xls')
        document.body.appendChild(link)
        link.click()
      }
      // let iframe = document.createElement('iframe')
      // iframe.setAttribute('style', "display:none")
      // iframe.setAttribute('src', data)
      // document.body.appendChild(iframe)
    },
    ab2str (u, f) { //arraybuffer类型的返回值转成json
      var b = new Blob([u]);
      var r = new FileReader();
      r.readAsText(b, 'utf-8');
      r.onload = function () { if (f) f.call(null, r.result) }
    },
    isIE () {//判断是否IE浏览器
      if (!!window.ActiveXObject || "ActiveXObject" in window) {
        return true;
      } else {
        return false;
      }
    }
  },
  components: {
    QueryPage,
    ListTable
  },
  mounted () {
    this.search()
  }
}
</script>
<style scoped>
</style>



