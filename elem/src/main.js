// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import store from './store'
import menuData from "@/assets/mock/nav"
import RouterUtil from './router/untils'
import '@/assets/css/index.scss'

let orgType='general-project'
let filterMenu=RouterUtil.menuFilter(menuData,orgType)
let menuList=RouterUtil.menuPath(filterMenu)

store.commit('SETMENU',menuList)
let routes= RouterUtil.menuUtils(menuList)
let obj=[{
  path:'/home',
  name:'home',
  component:require("@/components/pages/home.vue").default,
  children:routes
}]
router.addRoutes(obj)

Vue.config.productionTip = false
Vue.use(ElementUI)
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})
