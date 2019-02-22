/**
 * axios封装
 * 请求拦截、相应拦截、错误统一处理
 * */
import axios from 'axios'

//常量
const baseURL = {
  dev: ''
}
if (process.env.NODE_ENV == 'development') {
  baseURL.dev = '/api'
}
const TIMEOUT = 3000

//创建axios实例
var instance = null
if (process.env.NODE_ENV == 'development') {
  console.log(process.env.NODE_ENV)
  instance = axios.create({
    baseURL: baseURL.dev,
    timeout: TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Basic lGsxyhk9Is/lpH9VDq5NlV01acl3vDhfaxdAJp0RL+GdbObJ0QS9oGrsoDezO/kYJjX72dB2Zu4kMo/iC77u7khVuhp6EOCXqKGJ8zkJmM7LYBgaJ0+WakKG+DaowYpvUS0MTK5FaApr8fLsZdT5D2vhaBbHBM9te1TDWWVPnB8VUtJ1yXCIDSviYYS6T4wFuurADU/5Ps03lAYI4rzSayuH0615J2m1rCqnPF1bb6YSxFw+uUMPlkU3wdv1vPCGSDqT/fungrMJgLFyqeRaXCYXt4mnnbDAKMR9OTJcK+M3Q1jDazdbAOyLLCeHJW/owGi1jpRqk9RiPL2PF0ct1A==',
      'x-tenant-id': 5,
      'x-project-id': 5007
    }
  })
} else {
  console.log(process.env.NODE_ENV)
  instance = axios.create({
    baseURL: baseURL.dev,
    timeout: TIMEOUT,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

// 设置post请求头
//axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

// 请求拦截器
instance.interceptors.request.use(
  function (config) {
    //给请求添加时间戳标识每个请求都是唯一的
    let getTimestamp = new Date().valueOf()
    if (config.url.indexOf('?') > -1) {
      config.url = config.url + "&timestamp=" + getTimestamp;
    } else {
      config.url = config.url + "?timestamp=" + getTimestamp;
    }
    //如果存在token则在请求头中携带token
    // const token = store.state.token;
    // token && (config.headers.Authorization = token);
    return config
  },
  function (error) {
    return Promise.reject(error);
  }
)

//相应拦截器
instance.interceptors.response.use(
  function (response) {
    if (response.status === 200) {
      return response
    } else {
      return Promise.reject(response.errMSG)
    }
  },
  function (error) {
    let msg = ""
    if (error.response || error.response.status) {
      let host = window.location.host
      switch (error.response.status) {
        case 404:
          msg = '服务器连接失败,请稍后再试';
          break;
        case 403: //403错误的时候进行重定向到登录页面
          window.href = 'http://' + host
          break;
        case 500:
          msg = "服务器连接失败,请稍后再试"
      }
    } else {
      msg = '网络连接失败,请检查网络连接'
    }
    return Promise.reject(msg)
  }
)
export default instance
