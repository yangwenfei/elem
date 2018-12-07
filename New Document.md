#搭建环境#
###vue 安装部署 ###
- npm install vue-cli -g
- vue init webpack elem
- cd elem 
- npm run dev

###使用Element-UI###
1. 安装:npm install element-ui -S
2. 整体引入：在项目的main.js中引入
      - import ElementUI from 'element-ui'
      - import 'element-ui/lib/theme-chalk/index.css'
      - Vue.use(ElementUI)
   
#配置动态路由#



