开始一个新vue项目基础的架构搭建步骤：环境搭建、动态路由配置、css样式初配置、store状态管理配置、请求配置

#搭建环境#
###vue 安装部署 ###
- npm install vue-cli -g
- vue init webpack elem
- cd elem 
- npm run dev

###使用Element-UI###
1. 安装:npm install element-ui -S
2. 整体引入：在项目的main.js中
    
   引入的代码

	import ElementUI from 'element-ui'; 

	import 'element-ui/lib/theme-chalk/index.css'

 	Vue.use(ElementUI)
      
   
#配置动态路由#

#状态管理构建#
###初步安装###
- npm install vuex --save
###配置vuex###
-  多个模块的store组合，目录结构	
   - store
   		- index.js
   		- modules
   			- nav.js
   			- permission.js
- store的入口文件 store/index.js中的基本配置

引入的代码
	
	//引用vue和vuex
	import Vue from 'vue'
	import Vuex from 'vuex'
	import createLogger from 'vuex/dist/logger'
	Vue.use(Vuex)
	
	//引用子模块(后期添加的模块都需要在此引入才能用)
	import nav from "./modules/nav"
	import permission from './modules/permission'

	// 如果是npm run dev的时候就是dev环境
	// 如果npm run build时候就是production环境
	// 检测在开发环境下修改state是不是通过mutation
	const debug = process.env.NODE_ENV !== 'production'
	//多个store模块组合
	export default new Vuex.Store({
		modules:{
			nav,
			permission
		},
 		strict: debug,
    	plugins: debug ? [createLogger()] : []
	})
   			
- 整体引入：在项目main.js中 

引入的代码

	import store from './store'
	//注册全局组件
	new Vue({
  		el: '#app',
  		router,  
  		store,  // 注册store
  		components: {APP}, 
  		template: <App/>
	})

###modules每个模块文件的基本代码###
 ./modules/nav.js
	
	const nav={
		state:{
			menuList:[]
		},
		mutations:{
			SETMENU(state,playload){
				state.menuList=playlaod
			}
		},
		actions:{}
	}
	
	export default nav
每一个模块都包含 state、mutations、actions
#预处理器sass#
###初步安装###
- npm install node-sass --save-dev
- npm install sass-loader --save-dev

**vue新版在build/until.js文件中已经对sass-loader进行了配置，所以webpack中不需要再自己进行配置了，安装完就可以直接使用**

###使用scss###
- css文件目录结构
	- css
		- index.scss //css的入口文件
		- reset.scss //样式重置文件
		- 其他样式文件.scss
- 整体引入：在项目main.js中 

引入的代码
	
	import '@/assets/css/index.scss'
- 入口文件 css/index.scss中的配置

引入的代码
	
	//引用其他文件时必须加上后缀名
	@import "./reset.scss";
	@import "./其他样式文件";
- 重置样式文件 css/reset.js的代码 （直接复制下面的代码拿来用即可）
 
引入的代码 

	/*reset */
	/* http://meyerweb.com/eric/tools/css/reset/ 
   		v2.0 | 20110126
   		License: none (public domain)
	*/
	html, body, div, span, applet, object, iframe,
	h1, h2, h3, h4, h5, h6, p, blockquote, pre,
	a, abbr, acronym, address, big, cite, code,
	del, dfn, em, img, ins, kbd, q, s, samp,
	small, strike, strong, sub, sup, tt, var,
	b, u, i, center,
	dl, dt, dd, ol, ul, li,
	fieldset, form, label, legend,
	table, caption, tbody, tfoot, thead, tr, th, td,
	article, aside, canvas, details, embed, 
	figure, figcaption, footer, header, hgroup, 
	menu, nav, output, ruby, section, summary,
	time, mark, audio, video {
		margin: 0;
		padding: 0;
		border: 0;
		// font-size: 100%;
		// font: inherit;
    	vertical-align: baseline;
    	box-sizing: border-box;
	}
	/* HTML5 display-role reset for older browsers */
	article, aside, details, figcaption, figure, 
	footer, header, hgroup, menu, nav, section {
		display: block;
	}
	body {
		line-height: 1;
	}
	ol, ul {
		list-style: none;
	}
	blockquote, q {
		quotes: none;
	}
	blockquote:before, blockquote:after,
		q:before, q:after {
		content: '';
		content: none;
	}
	table {
		border-collapse: collapse;
		border-spacing: 0;
	}

	/*common*/
	.clearfix:after {
    	content: " ";
    	display: block;
    	height: 0;
    	clear: both;
    	visibility: hidden;
    	overflow: hidden;
	}
	.clearfix {display: inline-block;}  /* for IE/Mac */
	 	body,html{
	 	width: 100%;
	 	height: 100%;
 	}
#引用iconfont字体图标#
- 将图标项目下载到本地
- 在项目中的assets下新建一个iconfont文件夹，下载的内容全部复制到里面，项目结构如下
	- assets
		- iconfont
			- 下载的文件
- 在入口文件main.js中全局引入 

引入的代码

	import "@/assets/font/iconfont.css"

#vue过度动画#
###简单使用###
- 引入vue-animate.css文件（可以网搜文件，引入步骤同上scss文件使用步骤）
- 第一种：使用custom-classes-transition,需要在不同的载入载出动画上加-enter和-leave后缀

代码

	<transition
  	 name="custom-classes-transition"
  	 enter-active-class="bounceLeft-enter"
  	 leave-active-class="bounceRight-leave"
	>
  		<p v-if="show">hello</p>
	</transition>
- 第二种：使用in/out类名在动画名后面加上In或者Out

代码

	<transition
  	 name="bounce"
  	 enter-active-class="bounceInLeft"
  	 leave-active-class="bounceOutRight"
	>
  		<p v-if="show">hello</p>
	</transition>
- 现在支持的动画
	- Bounce
		- bounce
		- bounceDown
		- bounceLeft
		- bounceRight
		- bounceUp
	- Fade
		- fade
		- fadeDown
		- fadeDownBig
		- fadeLeft
		- fadeLeftBig
		- fadeRight
		- fadeRightBig
		- fadeUp
		- fadeUpBig
	- Rotate
		- rotateDownLeft
		- rotateDownRight
		- rotateUpLeft
		- rotateUpRight
	- Slide

		- slideDown
		- slideLeft
		- slideRight
		- slideUp
	- Zoom
		- zoomDown
		- zoomLeft
		- zoomRight
		- zoomUp


#axios请求配置#
	




