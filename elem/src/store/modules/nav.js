const nav = {
  state: {
    menuList: [],
    tabsMenuList: []
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
    }
  },
  actions: {}
}
export default nav
