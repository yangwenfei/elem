 <template>
  <div class="tags-box">
    <el-tabs v-model="activTab" type="card" closable @tab-remove="removeTab" @tab-click="jump">
      <el-tab-pane v-for="(item) in tabsList" :key="item.name" :label="item.title" :name="item.name">
        {{item.content}}
      </el-tab-pane>
    </el-tabs>
  </div>
</template>


<script>
export default {
  data () {
    return {
      activTab: '',
      tabsList: []
    }
  },
  computed: {
    tabsMenuList () {
      return this.$store.state.nav.tabsMenuList
    }
  },
  methods: {
    addTab (activeNav) {
      this.activeNav = activeNav
      let flag = this.tabsList.some(el => {
        return el.name == activeNav.name
      })
      if (!flag) {
        this.tabsList.push(activeNav);
      }
      this.activTab = activeNav.name;
      this.catchArr(this.tabsList)
    },
    removeTab (targetName) {
      let tabs = this.tabsList;
      let activeName = this.activTab;
      if (activeName === targetName) {
        tabs.forEach((tab, index) => {
          if (tab.name === targetName) {
            let nextTab = tabs[index + 1] || tabs[index - 1];
            if (nextTab) {
              activeName = nextTab.name;
            }
          }
        });
      }
      this.activTab = activeName;
      this.tabsList = tabs.filter(tab => tab.name !== targetName);
      this.catchArr(this.tabsList)
      if (this.tabsList.length > 0) {
        this.jump()
      } else {
        this.$router.push("/home")
      }

    },
    jump () {
      let activeItem = null
      this.tabsMenuList.forEach(el => {
        if (el.name == this.activTab) {
          this.$router.push(el.path)
          activeItem = el
        }
      })
      this.$emit("selected", activeItem)
    },
    catchArr (tabsList) {//设置keep-alive需要缓存的数组
      let nameArr = []
      tabsList.forEach(el => {
        nameArr.push(el.name)
      })
      this.$store.commit("SETTABSLIST", nameArr)
    }
  },
  mounted () {
    this.$router.push("/home")
  }
}
</script>