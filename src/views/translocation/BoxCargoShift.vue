<template>
  <div id="BoxCargoShift">
    <van-nav-bar title="Box-cargo Shift">
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
            ref="focusInputRef1"
            v-model.trim="locationNameStart"
            label="Start Location"
            label-width="120px"
            placeholder="Click to type location"
            @keydown.enter="getListByEnter"
          >
            <template #button>
              <div style="line-height: 0">
                <van-button
                  size="mini"
                  type="warning"
                  @click="resetDataFun('locationNameStart', 'focusInputRef1')"
                  >Clear</van-button
                >
              </div>
            </template>
          </van-field>
        </van-cell-group>
        <van-cell-group>
          <van-field
            ref="focusInputRef2"
            v-model.trim="locationNameTarget"
            label="Target Location"
            label-width="120px"
            placeholder="Click to type location"
            @keydown.enter="$refs.focusInputRef3.focus()"
          >
            <template #button>
              <div style="line-height: 0">
                <van-button
                  size="mini"
                  type="warning"
                  @click="resetDataFun('locationNameTarget', 'focusInputRef2')"
                  >Clear</van-button
                >
              </div>
            </template>
          </van-field>
        </van-cell-group>
        <van-cell-group>
          <van-field
            ref="focusInputRef3"
            v-model.trim="boxNo"
            label="boxNO."
            label-width="120px"
            :placeholder="
              disabledBoxNo ? 'Prohibit filling in' : 'Click to type boxNO.'
            "
            @keydown.enter="chiftBtn"
            :disabled="disabledBoxNo"
          >
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
                          :disabled="disabledBoxNo"
                          size="mini"
                          type="primary"
                          @click.stop="ShiftBtn(item)"
                          >Shift</van-button
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
import { selPageList } from "@/api/inventory/InventoryBylocation";
import { addAndRemove } from "@/api/translocation/LocationMerge";
import { Toast } from "vant";
export default {
  data() {
    return {
      locationNameStart: "",
      locationNameTarget: "",
      shiftBtnDisabled: true,
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
  computed: {
    disabledBoxNo() {
      let flag = Boolean(
        this.locationNameStart &&
          this.locationNameTarget &&
          this.list.length > 0
      );
      return !flag;
    },
  },
  methods: {
    // 移位
    async chiftBtn() {
      let currentItem = this.list.find((item) => item.boxNo === this.boxNo);
      //还原adjustQuantity
      if (currentItem.inStorageStatus === 1) {
        // 整箱
        currentItem.adjustQuantity = currentItem.boxCount;
      } else {
        // 散货
        currentItem.adjustQuantity = currentItem.totalQuantity;
      }
      if (!currentItem)
        return Toast.fail({
          message: `Unable to find boxNO.`, //无数据
          position: "top",
        });
      await addAndRemove([currentItem], {
        type: 2,
        locationName: this.locationNameTarget,
      });
      Toast.success({
        message: "Shift success",
        position: "top",
      });
      this.boxNo = "";
      this.getList("focusInputRef3");
    },
    async ShiftBtn(item) {
      if (!item.adjustQuantity && item.adjustQuantity !== 0)
        return Toast.fail({
          message: "The Quantity is empty", //数量为空
          position: "top",
        });
      await addAndRemove([item], {
        type: 2,
        locationName: this.locationNameTarget,
      });
      Toast.success({
        message: "Shift success", //数量为空
        position: "top",
      });
      this.getList();
    },
    // 重置
    resetDataFun(prop, serachInputRef) {
      this[prop] = "";
      if (prop === "locationNameStart") {
        this.list = [];
      }
      this.$refs[serachInputRef].focus();
    },
    // 调接口获取数据
    async getList(inputRef) {
      const data = {
        warehouseId: 1,
        locationName: this.locationNameStart,
        sku: this.sku,
        boxNo: this.boxNo,
        inStorageStatus: 1,
      };
      this.searchLoading = true;
      this.searchList = [];
      this.list = [];
      const { data: res } = await selPageList(data);
      res.forEach((item, i) => {
        item.index = i;
        item.originalLocationId = item.locationId;
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
        if (inputRef) {
          this.$nextTick(() => {
            this.$refs.inputRef && this.$refs.inputRef.focus();
          });
        }
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
    getListByEnter() {
      if (!this.locationNameStart) {
        return Toast.fail({
          message: `Start Location is empty`, //查询条件为空
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
    // this.locationNameStart = "临时货位";
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
#BoxCargoShift {
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