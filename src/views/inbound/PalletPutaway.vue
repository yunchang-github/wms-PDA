<template>
  <div id="PalletPutaway">
    <van-nav-bar title="Pallet Putaway">
      <template #left>
        <svg class="icon navBarIcon" aria-hidden="true" @click.stop="goBack">
          <use xlink:href="#icon-zuojiantou"></use>
        </svg>
      </template>
      <!-- <template #right>
        <svg class="icon navBarIcon" aria-hidden="true" @click.stop="goHome">
          <use xlink:href="#icon-zhuye"></use>
        </svg>
      </template> -->
    </van-nav-bar>
    <div class="pageContainer">
      <div class="vanCeliContainer">
        <van-cell-group>
          <van-field
            ref="focusInput"
            v-model.trim="palletNo"
            label="Pallet NO"
            placeholder="Click to type pallet NO"
            @keydown.enter="getList"
          />
        </van-cell-group>
        <van-cell-group>
          <van-field
            ref="focusInputNext"
            v-model.trim="location"
            label="Location"
            placeholder="Click to type location"
            @keydown.enter="scanningPutawayFun"
          />
        </van-cell-group>
      </div>
      <div
        class="vanListContainer"
        :style="{ height: listContainerHeight + 'px' }"
      >
        <template v-if="searchLoading">
          <div class="vanLoadingContainer">
            <van-loading class="vanLoadingClass" color="#1989fa" />
          </div>
        </template>
        <template v-else>
          <van-pull-refresh v-model="refreshing" @refresh="getList">
            <van-list
              v-model="loading"
              :finished="finished"
              finished-text="没有更多了"
              @load="onLoad"
              :immediate-check="false"
            >
              <van-cell v-for="item in list" :key="item">
                今日操作历史数据{{ item }}
              </van-cell>
            </van-list>
          </van-pull-refresh>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import { Toast } from "vant";
export default {
  data() {
    return {
      palletNo: "",
      location: "",
      listContainerHeight: 0,
      list: [],
      loading: false,
      finished: false,
      refreshing: false,
      searchLoading: false,
      searchList: [], //查询获取到的List
    };
  },
  methods: {
    // 重置
    resetDataFun() {
      this.palletNo = "";
      this.location = "";
      this.list = [];
      this.$refs.focusInput.focus();
    },
    // 扫描上架功能
    scanningPutawayFun() {
      if (!this.location)
        return Toast.fail({
          message: "The Location is empty", //托盘号为空
          position: "top",
        });
      Toast.success({
        message: "Scanning success", //托盘号为空
        position: "top",
      });
      this.resetDataFun();
    },
    // 调接口获取数据
    getList() {
      if (!this.palletNo)
        return Toast.fail({
          message: "The Pallet NO is empty", //托盘号为空
          position: "top",
        });
      this.$refs.focusInputNext.focus();
      this.searchLoading = true;
      this.searchList = [];
      this.list = [];
      let arr = [];
      for (let i = 0; i < 20; i++) {
        //10列一加载
        arr.push(i + 1);
      }
      setTimeout(() => {
        this.searchList = arr;
        this.searchLoading = false;
        if (this.searchList.length > 0) {
          // 清空列表数据
          this.finished = false;
          // 重新加载数据
          // 将 loading 设置为 true，表示处于加载状态
          this.loading = true;
          this.onLoad();
        } else {
          this.list = [];
          this.finished = true;
        }
      }, 1000);
    },
    // 加载数据
    onLoad() {
      // 异步更新数据
      setTimeout(() => {
        if (this.refreshing) {
          this.list = [];
          this.refreshing = false;
        }
        let pageSize = 10; //10列一加载
        let size =
          this.searchList.length >= pageSize
            ? pageSize
            : this.searchList.length;
        for (let i = 0; i < size; i++) {
          this.list.push(this.searchList[i]);
        }
        // 加载状态结束
        this.loading = false;
        // 数据全部加载完成
        if (this.list.length >= this.searchList.length) {
          this.finished = true;
        }
      }, 300);
    },
    // 返回首页
    goBack() {
      this.$router.go(-1);
    },
    goHome() {
      this.$router.push({ name: "Home" });
    },
  },
  mounted() {
    this.$refs.focusInput.focus();
    // 获取list高度 pageContainer - vanCeliContainer getBoundingClientRect
    let pageContainerHeight = document
      .querySelector(".pageContainer")
      .getBoundingClientRect().height;
    let vanCeliContainerHeight = document
      .querySelector(".vanCeliContainer")
      .getBoundingClientRect().height;
    this.listContainerHeight = pageContainerHeight - vanCeliContainerHeight;
  },
};
</script>

<style lang="scss" scoped>
#PalletPutaway {
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  .pageContainer {
    flex: 1;
    .vanCeliContainer {
      border-bottom: 10px solid #f7f9fd;
    }
    .vanListContainer {
      overflow-y: scroll;
      .vanLoadingContainer {
        height: 100%;
        position: relative;
        .vanLoadingClass {
          position: absolute;
          left: 48%;
          top: 48%;
        }
      }
    }
  }
}
</style>