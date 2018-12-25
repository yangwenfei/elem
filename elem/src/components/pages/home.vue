<template>
  <div class="app-router-view">
    <div class="app-box">
      <side-nav class="home-side-nav nav-scroll" :activeIndex="activeIndex" @selected="selectedTab"></side-nav>
      <div class="home-contain-box">
        <tabs-nav ref="tabsNav" @selected="selectedNav"></tabs-nav>
        <div class="contaner">
          <keep-alive>
            <router-view class='home-view'></router-view>
          </keep-alive>
        </div>
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
      activeIndex: ""
    }
  },
  components: {
    SideNav,
    TabsNav
  },
  methods: {
    selectedTab (val) {
      this.$refs.tabsNav.addTab(val)
    },
    selectedNav (val) {
      this.activeIndex = val ? val.index : ""
    }
  }
}
</script>

