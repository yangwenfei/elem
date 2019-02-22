import Vue from "vue"
import Vuex from "vuex"
import createLogger from 'vuex/dist/logger'
Vue.use(Vuex)

//引入各模块
import nav from './modules/nav'
import permission from './modules/permission'

// 如果是npm run dev的时候就是dev环境
// 如果npm run build时候就是production环境
// 检测在开发环境下修改state是不是通过mutation
const debug = process.env.NODE_ENV !== 'production'
export default new Vuex.Store({
    modules:{
        nav,
        permission
    },
    strict: debug,
    plugins: debug ? [createLogger()] : []
})