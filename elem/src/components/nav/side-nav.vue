<template>
  <el-row class="side-nav">
    <el-col>
      <el-menu default-active="2" class="el-menu-vertical-demo" @open="handleOpen" @close="handleClose" background-color="gray">
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
    }
  },
  computed: {
    menuList () {
      return this.$store.state.nav.menuList
    }
  },
  methods: {
    handleOpen (key, keyPath) {
      console.log(key, keyPath);
    },
    handleClose (key, keyPath) {
      console.log(key, keyPath);
    },
    jump (item) {
      this.$router.push("/home/" + item.path)
      let obj = {}
      obj.title = item.text
      obj.name = item.code
      obj.index = item.index
      this.$emit("selected", obj)
    }
  }
}
</script>

