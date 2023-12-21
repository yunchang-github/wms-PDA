<template>
  <div id="app">
    <router-view />
    <van-overlay
      :show="$store.state.apiLoading"
      style="display: flex; justify-content: center; align-items: center"
    >
      <van-loading color="#0094ff" vertical> {{$store.state.apiLoadMsg}} </van-loading>
    </van-overlay>
  </div>
</template>
<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-touch-callout: none !important;
  -webkit-user-select: none;
}
.onlyOneLine {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.M0P0 {
  margin: 0;
  padding: 0;
}
.fontSize14 {
  font-size: 14px;
}
.fontSize16 {
  font-size: 16px;
}
.fontSize18 {
  font-size: 18px;
}
.padding10 {
  padding: 10px;
}
</style>
