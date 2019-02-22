<template>
  <div class="wapper">
    <!-- <div class="header">
      <div class="page-header"><img class="logo" src="./assets/image/inspection.png"></img>供应商管理系统</div>
      <div class="logout" @click="logout"><img class="logoutImg" src="./assets/image/logout.png">退出</div> 
  </div> -->
    <div id="app">
      <router-view />
    </div>
  </div>
</template>

<script>
export default {
  name: 'App',
  methods: {
    // logout () {
    //   let host = window.location.host
    //   window.location = 'http://' + host
    // }
  },
}
</script>

<style  lang="scss"  scoped>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  height: 100%;
  width: 100%;
  font-size: 14px;
}
.header {
  position: absolute;
  background: #393939;
  padding: 0 15px;
  height: 50px;
  z-index: 10;
  width: 100%;
  box-shadow: 0 3px 3px rgba(0, 0, 0, 0.175);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.wapper {
  position: relative;
  min-width: 1320px;
  width: 100%;
  margin: 0 auto;
  height: 100%;
  overflow: hidden;
}
.page-header {
  display: flex;
  align-items: center;
  font-size: 24px;
  line-height: 34px;
  color: #f98601;
  font-weight: 700;
  .logo {
    width: 45px;
  }
}
.logout {
  cursor: pointer;
  color: #fff;
  font-size: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.logoutImg {
  width: 20px;
}
</style>

