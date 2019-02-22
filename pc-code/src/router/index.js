import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/pages/home'
import SupplyList from '@/components/pages/supply/supplyList'

Vue.use(Router)

export default new Router({
  routes: [{
    path: '/',
    name: 'home',
    component: Home
  }]
})
