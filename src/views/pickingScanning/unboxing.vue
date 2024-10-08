<template>
  <div id="scanPickFBA">
    <van-nav-bar title="Unpack Box">
      <template #left>
        <svg class="icon navBarIcon" aria-hidden="true" @click.stop="goBack">
          <use xlink:href="#icon-zuojiantou"></use>
        </svg>
      </template>
      <template #right>
        {{ query.warehouseName }}
        <!-- <svg class="icon navBarIcon" aria-hidden="true" @click.stop="goHome">
                  <use xlink:href="#icon-zhuye"></use>
                </svg> -->
      </template>
    </van-nav-bar>
    <div class="pageContainer">
      <div class="vanCeliContainer">
        <!-- 拣货单号 -->
        <van-cell-group>
          <van-field
            ref="focusInputRef1"
            v-model.trim="boxNo"
            label="箱号"
            label-width="80px"
            placeholder="请扫描需要拆箱的箱号"
            @keyup.enter="boxNoEnter"
            @focus="stopKeyborad"
            :readonly="readonly1"
          >
          </van-field>
        </van-cell-group>
      </div>
      <div
        style="text-align: center; padding: 20px; color: #519a1d"
        :style="{
          height: listContainerHeight + 'px',
        }"
      >
        <span v-if="successBoxNo">
          {{ successBoxNo }} <br />
          拆箱成功
        </span>
      </div>
    </div>
  </div>
</template>
  
  <script>
import { devanningBoxFun } from "@/api/outbound/unboxing.js";
import { Toast, Dialog } from "vant";
export default {
  data() {
    let that = this;
    return {
      query: that.$route.query,
      listContainerHeight: 0,
      readonly1: false,
      autoFocus: false,
      boxNo: "",
      successBoxNo: "",
    };
  },
  created() {},
  methods: {
    stopKeyborad() {
      if (this.autoFocus) {
        this.readonly1 = true;
        setTimeout(() => {
          this.readonly1 = false;
        }, 200);
        this.autoFocus = false;
      }
    },
    async boxNoEnter() {
      if (!this.boxNo) {
        return Toast.fail({
          message: "箱号为空",
          position: "top",
        });
      }
      if (this.boxNo === this.successBoxNo) {
        this.$globalFun.webSpeakFun(`重复`);
        Dialog.confirm({
          title: "提示",
          message: "当前扫描箱号与上一次扫描箱号相同，是否继续拆箱",
        })
          .then(() => {
            this.devanningBoxFun();
          })
          .catch(() => {
            this.boxNo = "";
            this.autoFocus = true;
            this.$nextTick(() => {
              this.$refs.focusInputRef1 && this.$refs.focusInputRef1.focus();
            });
          });
      } else {
        this.devanningBoxFun();
      }
    },
    async devanningBoxFun() {
      try {
        const list = [
          {
            boxNo: this.boxNo,
            warehouseId: this.query.warehouseId,
          },
        ];
        await devanningBoxFun(list);
        this.successBoxNo = this.boxNo;
        this.boxNo = "";
        this.$globalFun.webSpeakFun(`成功`);
      } catch (e) {
        this.$globalFun.webSpeakFun(`错误`);
        this.successBoxNo = "";
        console.log(e);
      }
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
    this.autoFocus = true;
    this.$nextTick(() => {
      this.$refs.focusInputRef1 && this.$refs.focusInputRef1.focus();
      // 获取list高度 pageContainer - vanCeliContainer getBoundingClientRect
      let pageContainerHeight = document
        .querySelector(".pageContainer")
        .getBoundingClientRect().height;
      let vanCeliContainerHeight = document
        .querySelector(".vanCeliContainer")
        .getBoundingClientRect().height;
      this.listContainerHeight = pageContainerHeight - vanCeliContainerHeight;
    });
  },
};
</script>
  
  <style lang="scss" scoped>
#scanPickFBA {
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  ::v-deep .vanTabs {
    .van-tab {
      color: #333;
    }
    .van-tabs__nav {
      background-color: #d3e3fd;
    }
  }
  .closeClass {
    display: inline-block;
    position: relative;
    top: 0px;
    margin-left: 4px;
  }
  .pageContainer {
    flex: 1;
    .vanCeliContainer {
      border-bottom: 10px solid #f7f9fd;
    }
    .vanListContainer {
      box-sizing: border-box;
      padding: 20px 60px;
      display: flex;
      flex-direction: column;
      .loadingContainer {
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .tableHeadClass {
        height: auto;
      }
      .scrollbarClass {
        flex: 1;
        overflow-y: scroll;
        scroll-behavior: smooth; /* 平滑滚动效果 */
      }
      .tableClass {
        border: 1px solid #e6ebf5;
        border-bottom: none;
        table {
          table-layout: fixed;
          color: #515a6e;
          border-bottom: 1px solid #e6ebf5;
        }
        thead {
          th {
            padding: 10px 8px;
            font-size: 15px;
            text-align: center;
            border: 1px solid #e6ebf5; /* 设置边框 */
            word-wrap: break-word;
          }
        }
        tbody {
          td {
            padding: 10px 8px;
            text-align: center;
            font-size: 15px;
            border: 1px solid #e6ebf5; /* 设置边框 */
            word-wrap: break-word;
          }
        }
      }
    }
  }
}
</style>