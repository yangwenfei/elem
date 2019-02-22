// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

import store from './store'
import api from '@/assets/js/api' // 导入api接口
import "babel-polyfill"

import menuData from "@/assets/mock/nav"
import RouterUtil from './router/untils'

import "@/assets/font/iconfont.css"
import '@/assets/css/index.scss'


let orgType = 'general-project'
let filterMenu = RouterUtil.menuFilter(menuData, orgType)
let menuList = RouterUtil.menuPath(filterMenu)

window.baseUrl = window.location.href.split('partner/')[0] + 'partner/'
store.commit('SETMENU', menuList)
let routes = RouterUtil.menuUtils(menuList)
let obj = [{
  path: '/home',
  redirect: "/home/" + routes[0].path,
  name: 'home',
  component: require("@/components/pages/home.vue").default,
  children: routes
}]
router.addRoutes(obj)

Vue.prototype.$api = api; // 将api挂载到vue的原型上

Vue.config.productionTip = false
Vue.use(ElementUI)
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: {
    App
  },
  template: '<App/>'
})
