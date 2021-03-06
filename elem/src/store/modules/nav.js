const nav = {
  state: {
    menuList: [], //左侧导航菜单
    tabsMenuList: [], //导航菜单对应的所有tabs菜单
    tabsList: [] //当前打开的tabs菜单
  },
  mutations: {
    SETMENU(state, payload) {
      state.menuList = payload
      let flag = []

      function tabsArr(arr) {
        arr.forEach(element => {
          if (element.children && element.children.length > 0) {
            tabsArr(element.children)
          } else {
            let obj = {}
            obj.title = element.text
            obj.name = element.code
            obj.index = element.index
            obj.path = "/home/" + element.path
            flag.push(obj)
          }
        });
      }
      tabsArr(payload)
      state.tabsMenuList = flag
    },
    SETTABSLIST(state, payload) {
      state.tabsList = payload
    }
  },
  actions: {}
}
export default nav
