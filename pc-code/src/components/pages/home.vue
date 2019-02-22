<template>
  <div class="app-router-view">
    <div class="app-box">
      <side-nav class="home-side-nav nav-scroll"></side-nav>
      <div class="home-contain-box">
        <div class="contaner">
          <keep-alive :include="include">
            <router-view class='home-view'></router-view>
          </keep-alive>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import SideNav from "@/components/nav/side-nav"
export default {
  name: 'home',
  data () {
    return {
    }
  },
  computed: {
    include () {
      return this.$store.state.nav.tabsList
    }
  },
  components: {
    SideNav,
  },
}
</script>
<style lang="scss">
.contaner {
  width: 100%;
  height: 100%;
}
</style>


