<template>
  <div id="AllPutawayPage">
    <van-nav-bar :title="commonData.navBarTitle">
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
        <!-- 起始货位 -->
        <van-cell-group>
          <van-field
            disabled
            ref="focusInputRef1"
            v-model.trim="locationNameStart"
            label="Start Location"
            label-width="100px"
            placeholder="Click to type location"
          >
            <template v-if="query.pageFlag !== 'pallet'" #button>
              <div style="line-height: 0">
                <van-button size="mini" type="info" @click="getList"
                  >Search</van-button
                >
              </div>
            </template>
          </van-field>
        </van-cell-group>
        <!-- 托盘号 -->
        <template v-if="query.pageFlag === 'pallet'">
          <van-cell-group>
            <van-field
              ref="focusInputRef2"
              v-model.trim="palletNumber"
              label="Pallet NO."
              label-width="100px"
              placeholder="Click to type pallet NO."
              @keydown.enter="palletEnter"
              @focus="stopKeyborad"
              :readonly="readonly1"
            >
            </van-field>
          </van-cell-group>
        </template>
        <!-- 整箱 -->
        <template v-else-if="query.pageFlag === 'box'">
          <van-cell-group>
            <van-field
              ref="focusInputRef2"
              v-model.trim="boxNo"
              label="boxNO."
              label-width="100px"
              placeholder="Click to type boxNO."
              @keydown.enter="boxNoAndSkuEnter('boxNo', 'boxNO.')"
              @focus="stopKeyborad"
              :readonly="readonly1"
            >
              <template #button>
                <div style="line-height: 0" class="flexBetweenCenter">
                  <van-tag type="warning" style="padding: 4px"
                    >Selected：{{ checkList.length }}</van-tag
                  >
                  <div v-if="checkList.length > 0" class="closeClass">
                    <van-icon
                      name="close"
                      size="18"
                      @click.stop="checkList = []"
                    />
                  </div>
                </div>
              </template>
            </van-field>
          </van-cell-group>
        </template>
        <!-- 散货 -->
        <template v-else>
          <van-cell-group>
            <van-field
              ref="focusInputRef2"
              v-model.trim="sku"
              label="SKU"
              label-width="100px"
              placeholder="Click to type SKU"
              @keydown.enter="boxNoAndSkuEnter('sku', 'SKU')"
              @focus="stopKeyborad"
              :readonly="readonly1"
            >
              <template #button>
                <div style="line-height: 0" class="flexBetweenCenter">
                  <van-tag type="warning" style="padding: 4px"
                    >Selected：{{ checkList.length }}</van-tag
                  >
                  <div v-if="checkList.length > 0" class="closeClass">
                    <van-icon
                      name="close"
                      size="18"
                      @click.stop="checkList = []"
                    />
                  </div>
                </div>
              </template>
            </van-field>
          </van-cell-group>
        </template>
        <!-- 目的货位 -->
        <van-cell-group>
          <van-field
            ref="focusInputRef3"
            v-model.trim="locationNameTarget"
            label="Target Location"
            label-width="100px"
            :placeholder="
              disabledTarget ? 'Prohibit filling in' : 'Click to type location'
            "
            @keydown.enter="chiftBtn"
            :disabled="disabledTarget"
            @focus="stopKeyborad"
            :readonly="readonly1"
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
          <van-list
            v-model="loading"
            :finished="finished"
            finished-text="There's nothing more left"
            @load="onLoad"
            :immediate-check="false"
          >
            <van-cell
              class="vanCellClass"
              style="padding: 5px 10px"
              v-for="item in list"
              :key="item.index"
            >
              <div
                class="vanCell_Div"
                :style="{
                  borderColor: checkList.includes(item[commonData.prop])
                    ? '#5cce69'
                    : '#ccc',
                }"
              >
                <!-- <div>

                  </div> -->
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
                <!-- 蓝色区域 -->
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
                <!-- 手动填写区域 -->
                <van-row
                  v-show="query.pageFlag !== 'pallet'"
                  class="vanRow"
                  style="background-color: #fff; padding: 5px 0"
                >
                  <van-col span="10">
                    <input
                      type="text"
                      v-model.trim="item.locationNameTarget"
                      placeholder="Scan target location"
                      style="
                        width: 100%;
                        border: 1px solid #ccc;
                        box-sizing: border-box;
                      "
                      @keydown.enter="PutawayBtn(item)"
                      @focus="stopKeyborad"
                      :readonly="readonly1"
                    />
                  </van-col>
                  <template v-if="item.inStorageStatus === 1">
                    <!-- 整箱 -->
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
                    <van-col span="7"> </van-col>
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
                </van-row>
              </div>
            </van-cell>
          </van-list>
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
    let PageData = {
      pallet: {
        prop: "palletNumber",
        navBarTitle: "Pallet Putaway",
        inStorageStatus: null,
      },
      box: {
        prop: "boxNo",
        navBarTitle: "BoxNO. Putaway",
        inStorageStatus: 1,
      },
      sku: {
        prop: "sku",
        navBarTitle: "SKU Putaway",
        inStorageStatus: 2,
      },
    };
    let that = this;
    return {
      commonData: PageData[that.$route.query.pageFlag],
      query: that.$route.query,
      readonly1: false,
      autoFocus: false,
      locationNameStart: "temp",
      locationNameTarget: "",
      palletNumber: "", //PHY16
      sku: "",
      boxNo: "",
      listContainerHeight: 0,
      list: [],
      loading: false,
      finished: false,
      searchLoading: false,
      searchList: [], //查询获取到的List
      checkList: [],
    };
  },
  created() {},
  computed: {
    disabledTarget() {
      let flag = true;
      if (this.query.pageFlag === "pallet") {
        flag = Boolean(
          this.locationNameStart &&
            this.palletNumber &&
            this.searchList.length > 0
        );
      } else {
        flag = Boolean(
          this.locationNameStart &&
            this.checkList.length > 0 &&
            this.searchList.length > 0
        );
      }
      return !flag;
    },
  },
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
    // 箱号回车  存储箱号
    boxNoAndSkuEnter(prop, label) {
      document.activeElement.blur();
      let isHaveItem = null;
      isHaveItem = this.searchList.find((item) => item[prop] === this[prop]);
      if (!isHaveItem) {
        this[prop] = "";
        return Toast.fail({
          message: `Unable to find ${label}`, //无数据
          position: "top",
        });
      }
      this.checkList.push(this[prop]);
      // 去重
      this.checkList = [...new Set(this.checkList)];
      //当前箱号或SKU置顶
      this.moveObjectToTop(this.searchList, this.list, prop);
      this[prop] = "";
    },
    // 置顶
    moveObjectToTop(searchList, list, prop) {
      const index = searchList.findIndex((obj) => obj[prop] === this[prop]); // 找到该对象的索引
      const LIndex = list.findIndex((obj) => obj[prop] === this[prop]); // 找到该对象的索引
      if (index !== -1) {
        // 在searchList找到相同的箱号
        const obj = searchList[index];
        if (LIndex !== -1) {
          list.splice(LIndex, 1); // 将该对象从数组中删除
        }
        list.unshift(obj); // 将该对象添加到数组的开头
      }
    },
    // 托盘回车
    palletEnter() {
      document.activeElement.blur();
      if (!this.palletNumber) {
        return Toast.fail({
          message: `Pallet NO. is empty`, //查询条件为空
          position: "top",
        });
      }
      this.getList("focusInputRef3");
    },
    // 上架
    async chiftBtn() {
      document.activeElement.blur();
      if (this.locationNameTarget === this.locationNameStart) {
        this.locationNameTarget = "";
        return Toast.fail({
          message: `ERROR：Same storage location`, //货位相同
          position: "top",
        });
      }
      let list = [];
      let type = 4;
      if (this.query.pageFlag === "pallet") {
        list = this.searchList;
      } else {
        type = 3;
        list = this.searchList.filter((item) =>
          this.checkList.includes(item[this.commonData.prop])
        );
      }
      await addAndRemove(list, {
        type,
        locationName: this.locationNameTarget,
      });
      Toast.success({
        message: "Putaway success", //上架成功
        position: "top",
      });
      //   货位合并后 清空数据
      this.resetDataFun();
    },
    // 单个上架
    async PutawayBtn(item) {
      document.activeElement.blur();
      if (item.locationNameTarget === item.locationName) {
        item.locationNameTarget = "";
        return Toast.fail({
          message: `ERROR：Same storage location`, //货位相同
          position: "top",
        });
      }
      await addAndRemove([item], {
        type: 3,
        locationName: item.locationNameTarget,
      });
      Toast.success({
        message: "Putaway success", //上架成功
        position: "top",
      });
      //   货位合并后 清空数据
      this.resetDataFun();
    },
    // 重置
    resetDataFun() {
      if (this.query.pageFlag === "pallet") {
        this.searchList = [];
        this.list = [];
        this.palletNumber = "";
        this.locationNameTarget = "";
        this.autoFocus = true;
        this.$nextTick(() => {
          this.$refs.focusInputRef2 && this.$refs.focusInputRef2.focus();
        });
      } else {
        this.locationNameTarget = "";
        this.getList("focusInputRef2");
      }
    },
    // 调接口获取数据
    async getList(inputRef) {
      const data = {
        warehouseId: this.query.warehouseId,
        locationName: this.locationNameStart,
        palletNumber: this.palletNumber,
        inStorageStatus: this.commonData.inStorageStatus,
      };
      this.searchLoading = true;
      this.searchList = [];
      this.checkList = [];
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
        item.locationNameTarget = "";
      });
      this.searchLoading = false;
      if (res.length > 0) {
        this.searchList = res;
        if (inputRef) {
          this.autoFocus = true;
          this.$nextTick(() => {
            this.$refs[inputRef] && this.$refs[inputRef].focus();
          });
        }
        // 清空列表数据
        this.finished = false;
        // 重新加载数据
        // 将 loading 设置为 true，表示处于加载状态
        this.loading = true;
        this.onLoad(inputRef);
      } else {
        this.finished = true;
      }
    },
    // 加载数据
    onLoad() {
      // 异步更新数据
      setTimeout(() => {
        let pageSize = 10; //先全部加载  之后10列一加载  需要考虑置顶效果
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
    if (this.query.pageFlag !== "pallet") {
      this.getList("focusInputRef2");
    } else {
      this.autoFocus = true;
      this.$nextTick(() => {
        this.$refs.focusInputRef2 && this.$refs.focusInputRef2.focus();
      });
    }
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
#AllPutawayPage {
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
      overflow-y: scroll;
      scroll-behavior: smooth; /* 平滑滚动效果 */
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
      ::v-deep .vanCellClass.van-cell::after {
        border-bottom: 0px;
      }
      .vanCell_Div {
        position: relative;
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