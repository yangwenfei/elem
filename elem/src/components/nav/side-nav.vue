<template>
  <el-row class="side-nav">
    <el-col>
      <el-menu :default-active="activeIndex" :default-openeds="openedsArr" class="el-menu-vertical-demo" ref="sidenav" background-color="rgb(0, 21, 41)">
        <el-submenu v-for="item in menuList" :key="item.id" :index="item.index">
          <template slot="title">{{item.text}}</template>
          <el-menu-item v-for="child in item.children" :key="child.id" :index="child.index" @click="jump(child)">{{child.text}}</el-menu-item>
        </el-submenu>
      </el-menu>
    </el-col>
  </el-row>
</template>
<script>
export default {
  data () {
    return {
      openedsArr: []
    }
  },
  props: {
    activeIndex: {
      type: String
    }
  },
  computed: {
    menuList () {
      let openedsArr = this.$store.state.nav.menuList
      if (openedsArr) {
        let arrNew = []
        openedsArr.forEach((item, index) => {
          arrNew.push(index + 1 + '')
        })
        this.openedsArr = arrNew
      }
      console.log(openedsArr)
      return this.$store.state.nav.menuList
    }
  },
  methods: {
    jump (item) {
      this.$router.push("/home/" + item.path)
      let obj = {}
      obj.title = item.text
      obj.name = item.code
      obj.index = item.index
      obj.path = '/home/' + item.path
      this.$emit("selected", obj)
    }
  }
}
</script>

