const permission = {
  state: {
    orgType: ""
  },
  mutations: {
    ORGTYPE(state, payload) {
      state.orgType = payload
    }
  },
  actions: {
    SETORGTYPE(context) {
      let orgId = sessionStorage.getItem('org')
      api.axios.get('/gys/system/org/orgLevel/' + orgId)
        .then(res => {
          console.log(res.data)
          if (res.success) { //group 集团 company 公司 general-project 普通项目 mixing-station 搅拌站
            context.commit('ORGTYPE', res.data)
          } else {
            console.log(res.success)
          }
          //执行回调函数
          callback(res.data)
        })
        .catch(error => {
          console.log(error)
        })
    }
  }
}
export default permission
