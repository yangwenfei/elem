<template>
  <div class="app-router-view">
    <div class="app-box">
      <side-nav class="home-side-nav nav-scroll" @selected="selectedTab"></side-nav>
      <div class="home-contain-box">
        <tabs-nav ref="tabsNav"></tabs-nav>
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>
<script>
import SideNav from "@/components/nav/side-nav"
import TabsNav from "@/components/nav/tabs-nav"
export default {
  name: 'home',
  data () {
    return {
    }
  },
  components: {
    SideNav,
    TabsNav
  },
  methods: {
    selectedTab (val) {
      this.$refs.tabsNav.addTab(val)
    }
  }
}
</script>

