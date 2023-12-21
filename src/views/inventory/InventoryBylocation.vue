<template>
  <div id="PalletPutaway">
    <van-nav-bar title="Location Check">
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
    <van-tabs class="vanTabs" @click="onClick" v-model="vanTabsValue">
      <van-tab title="All" name="All"></van-tab>
      <van-tab title="BOX" name="BOX"></van-tab>
      <van-tab title="PCS" name="PCS"></van-tab>
    </van-tabs>
    <div class="pageContainer">
      <div class="vanCeliContainer">
        <van-cell-group>
          <van-field
            ref="focusInputRef1"
            v-model="locationName"
            label="Location"
            placeholder="Click to type location"
            @keydown.enter="getListByEnter('Location')"
          >
            <template #button>
              <div style="line-height: 0">
                <van-button
                  size="mini"
                  type="warning"
                  @click="resetDataFun('locationName', 'focusInputRef1')"
                  >Clear</van-button
                >
              </div>
            </template>
          </van-field>
        </van-cell-group>
        <van-cell-group>
          <van-field
            ref="focusInputRef2"
            v-model="sku"
            label="SKU"
            placeholder="Click to type SKU"
            @keydown.enter="getListByEnter('SKU')"
          >
            <template #button>
              <div style="line-height: 0">
                <van-button
                  size="mini"
                  type="warning"
                  @click="resetDataFun('sku', 'focusInputRef2')"
                  >Clear</van-button
                >
              </div>
            </template>
          </van-field>
        </van-cell-group>
        <van-cell-group v-show="vanTabsValue !== 'PCS'">
          <van-field
            ref="focusInputRef3"
            v-model="boxNo"
            label="boxNO."
            placeholder="Click to type boxNO."
            @keydown.enter="getListByEnter('boxNO.')"
          >
            <template #button>
              <div style="line-height: 0">
                <van-button
                  size="mini"
                  type="warning"
                  @click="resetDataFun('boxNo', 'focusInputRef3')"
                  >Clear</van-button
                >
              </div>
            </template>
          </van-field>
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
              finished-text="There's nothing more left"
              @load="onLoad"
              :immediate-check="false"
            >
              <van-cell
                style="padding: 5px 10px"
                v-for="item in list"
                :key="item.index"
              >
                <div class="vanCell_Div">
                  <div style="display: flex; margin-bottom: 6px">
                    <div
                      style="
                        width: 2.2rem;
                        margin-right: 6px;
                        line-height: 0;
                        border: 1px solid #eee;
                      "
                    >
                      <van-image
                        width="2.2rem"
                        height="2.2rem"
                        fit="contain"
                        @click="imagePreview(item.imageUrl)"
                        :src="item.imageUrl"
                      >
                        <template v-slot:error>加载失败</template>
                      </van-image>
                    </div>
                    <div>
                      <template v-if="item.inStorageStatus === 1">
                        <!-- 整箱 -->
                        <div class="textIconContainer">
                          <span class="textIconClass">BOX</span>
                          <span>BoxNo：{{ item.boxNo }}</span>
                        </div>
                        SKU：{{ item.sku }}<br />
                        {{ item.skuName }}
                      </template>
                      <template v-else>
                        <!-- 散货 -->
                        <div class="textIconContainer">
                          <span
                            class="textIconClass"
                            style="background-color: #545c64"
                            >PCS</span
                          >
                          <span>SKU：{{ item.sku }} </span>
                        </div>
                        {{ item.skuName }}
                      </template>
                    </div>
                  </div>
                  <van-row class="vanRow">
                    <van-col span="10" style="border-right: 1px solid #ccc"
                      ><div>
                        Location <br />
                        <span>{{ item.locationName }}</span>
                      </div>
                    </van-col>
                    <template v-if="item.inStorageStatus === 1">
                      <!-- 整箱 -->
                      <van-col span="7">
                        <div>Box Count <br />{{ item.boxCount }}</div>
                      </van-col>
                      <van-col span="7" style="border-left: 1px solid #ccc">
                        <div>Box Qty <br />{{ item.boxQuantity }}</div>
                      </van-col>
                    </template>
                    <template v-else>
                      <van-col span="7"> </van-col>
                      <van-col span="7" style="border-left: 1px solid #ccc">
                        <div>Total Qty <br />{{ item.totalQuantity }}</div>
                      </van-col>
                    </template>
                  </van-row>
                  <van-row
                    class="vanRow"
                    style="background-color: #fff; padding: 5px 0"
                  >
                    <van-col span="5"
                      ><div style="display: flex; justify-content: center">
                        <van-button
                          size="mini"
                          type="primary"
                          @click.stop="checkBtn(item)"
                          >Inventory</van-button
                        >
                      </div>
                    </van-col>
                    <template v-if="item.inStorageStatus === 1">
                      <!-- 整箱 -->
                      <van-col span="5"> </van-col>
                      <van-col span="7">
                        <div style="display: flex; justify-content: center">
                          <input
                            type="text"
                            v-model.trim="item.adjustQuantity"
                            placeholder="Enter adjustQuantity"
                            style="
                              width: 80%;
                              border: 1px solid #ccc;
                              box-sizing: border-box;
                            "
                          />
                        </div>
                      </van-col>
                    </template>
                    <template v-else>
                      <van-col span="12"> </van-col>
                      <van-col span="7">
                        <div style="display: flex; justify-content: center">
                          <input
                            type="text"
                            v-model.trim="item.adjustQuantity"
                            placeholder="Enter adjustQuantity"
                            style="
                              width: 80%;
                              border: 1px solid #ccc;
                              box-sizing: border-box;
                            "
                          />
                        </div>
                      </van-col>
                      <van-col span="7"> </van-col>
                    </template>
                  </van-row>
                  <!-- <div>
                      <van-field
                        class="digitFieldClass"
                        type="digit"
                        v-model.trim="item.adjustQuantity"
                        :label="
                          item.inStorageStatus === 1
                            ? 'Counted box Count'
                            : 'Counted SKU Qty'
                        "
                        label-width="41%"
                        placeholder="Please enter"
                        style="padding: 5px"
                      >
                        <template #button>
                          <div style="line-height: 0; margin-left: 20px">
                            <van-button
                              size="mini"
                              type="primary"
                              @click.stop="checkBtn(item)"
                              >Inventory</van-button
                            >
                          </div>
                        </template>
                      </van-field>
                    </div> -->
                </div>
              </van-cell>
            </van-list>
          </van-pull-refresh>
        </template>
      </div>
    </div>
  </div>
</template>
    
    <script>
import {
  selPageList,
  inventoryCheck,
} from "@/api/inventory/InventoryBylocation";
import { Toast } from "vant";
export default {
  data() {
    let that = this;
    return {
      query: that.$route.query,
      vanTabsValue: "All",
      locationName: "",
      sku: "",
      boxNo: "",
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
    async checkBtn(item) {
      if (!item.adjustQuantity && item.adjustQuantity !== 0)
        return Toast.fail({
          message: "The Quantity is empty", //数量为空
          position: "top",
        });
      await inventoryCheck([item], { type: 2 });
      Toast.success({
        message: "Inventory success", //数量为空
        position: "top",
      });
      this.getList();
    },
    onClick() {
      //   this.locationName = "";
      //   this.sku = "";
      if (this.locationName || this.sku) {
        this.getList();
      } else {
        this.list = [];
      }
      this.boxNo = "";
      this.$refs["focusInputRef1"].focus();
    },
    // 重置
    resetDataFun(prop, serachInputRef) {
      this[prop] = "";
      this.list = [];
      this.$refs[serachInputRef].focus();
    },
    // 调接口获取数据
    async getList() {
      const data = {
        warehouseId: this.query.warehouseId,
        locationName: this.locationName,
        sku: this.sku,
        boxNo: this.boxNo,
        inStorageStatus:
          this.vanTabsValue === "All"
            ? null
            : this.vanTabsValue === "BOX"
            ? 1
            : 2,
      };
      this.searchLoading = true;
      this.searchList = [];
      this.list = [];
      const { data: res } = await selPageList(data);
      res.forEach((item, i) => {
        item.index = i;
        if (item.inStorageStatus === 1) {
          // 整箱
          item.adjustQuantity = item.boxCount;
        } else {
          // 散货
          item.adjustQuantity = item.totalQuantity;
        }
      });
      setTimeout(() => {
        this.searchList = res;
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
      }, 100);
    },
    // 回车查询
    getListByEnter(label) {
      let flag =
        this.vanTabsValue === "PCS"
          ? !this.locationName && !this.sku
          : !this.locationName && !this.sku && !this.boxNo;
      if (flag) {
        return Toast.fail({
          message: `The ${label} is empty`, //查询条件为空
          position: "top",
        });
      }
      this.getList();
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
    this.$refs["focusInputRef1"].focus();
    // this.locationName = "temp";
    // this.getList();
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
  ::v-deep .vanTabs {
    .van-tab {
      color: #333;
    }
    .van-tabs__nav {
      background-color: #d3e3fd;
    }
  }
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
      //   list
      .vanCell_Div {
        border: 1px solid #eee;
        padding: 6px;
        font-size: 12px;
        line-height: 20px;
        ::v-deep .digitFieldClass {
          .van-field__control {
            border: 1px solid #eee;
          }
        }
        .textIconContainer {
          margin-bottom: 4px;
          .textIconClass {
            font-size: 11px;
            line-height: 24px;
            background-color: #13227a;
            color: #fff;
            border-radius: 50%;
            padding: 4px;
            margin-right: 4px;
          }
        }
        .vanRow {
          text-align: center;
          background-color: #cae9fc;
          padding: 5px;
          font-size: 14px;
          .otherSkuBtn {
            font-size: 14px;
            color: #006eff;
            text-decoration: underline;
          }
          .otherSkuBtnDisable {
            color: #c8c9cc;
            pointer-events: none;
            text-decoration: none;
          }
        }
        .divClass {
          margin: 5px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          input {
            border: 1px solid rgb(110, 110, 110);
          }
        }
      }
    }
  }
}
</style>