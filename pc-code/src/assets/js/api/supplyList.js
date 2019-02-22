//供货列表模块接口

import base from "./axios/base" //导入接口域名列表
import axios from "./axios/http" //导入http中创建的axios实例
import qs from "qs" //根据需求是否导入qs模块，qs能对post请求的参数进行序列化

const supplyList = {
  getMaterials(param) { //供应商供货列表-查询材料
    let me = this;
    return new Promise(function (resolve, reject) {
      axios.get('/supplier/partner/supplier-bill/getMaterials', {
          params: param
        })
        .then(res => {
          me.reDirect(res, resolve)
        }).catch(error => {
          reject(error)
        })
    })
  },
  getProjectNames(param) { //供应商供货列表-查询采购单位
    let me = this;
    return new Promise(function (resolve, reject) {
      axios.get('/supplier/partner/supplier-bill/getProjectNames', {
          params: param
        })
        .then(res => {
          me.reDirect(res, resolve)
        })
        .catch(error => {
          reject(error)
        })
    })
  },
  get(param) { //查询供应商- 供货列表
    let me = this;
    return new Promise(function (resolve, reject) {
      axios.get('/supplier/partner/supplier-bill/get', { ///supplier/partner
          params: param
        })
        .then(res => {
          me.reDirect(res, resolve)
        })
        .catch(error => {
          reject(error)
        })
    })
  },
  qrcode(param) { //供应商列表生成二维码接口
    let me = this;
    return new Promise(function (resolve, reject) {
      axios.post('/supplier/partner/material-track/generate-qrcode', param)
        .then(res => {
          me.reDirect(res, resolve)
        })
        .catch(error => {
          reject(error)
        })
    })
  },
  exportData(param) { //导出excel
    let me = this;
    return new Promise(function (resolve, reject) {
      axios.get('/supplier/partner/supplier-bill/exportData', {
          params: param,
          responseType: 'arraybuffer'
        })
        .then(res => {
          me.reDirect(res, resolve)
        })
        .catch(error => {
          reject(error)
        })
    })
  },
  reDirect(res, resolve) {
    let url = res.request.responseURL
    if (url) {
      if (url.indexOf("login") == -1) { //说明当前url不包含login，没有重定向
        resolve(res.data);
      } else {
        if (window.sessionStorage) {
          sessionStorage.clear();
        }
        window.location.replace("/logout");
      }
    } else {
      resolve(res.data);
    }
  }
}
export default supplyList
