<template>
  <div class="homePage">
    首页
  </div>
</template>

<script>
import { getInfo } from "@/api/index";
export default {
  data() {
    return {
    };
  },
  methods: {
  
  },
  created() {
    getInfo().then(res=>{
      console.log('测试',res)
    })
  },
  mounted() {},
};
</script>

<style lang="scss" scoped>
.homePage{
  height:100vh;
  width:100vw;
  border:1px solid #eee;
  box-sizing: border-box;
}
</style>
