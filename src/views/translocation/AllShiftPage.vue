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
            ref="focusInputRef1"
            v-model.trim="locationNameStart"
            label="Start Location"
            label-width="100px"
            placeholder="Click to type location"
            @keydown.enter="locationNameStartEnter"
            @focus="stopKeyborad"
            :readonly="readonly1"
          >
            <template #button>
              <div style="line-height: 0">
                <van-button size="mini" type="warning" @click="clearDataFun"
                  >Clear</van-button
                >
              </div>
            </template>
          </van-field>
        </van-cell-group>
        <!-- 整箱 -->
        <template v-if="query.pageFlag === 'box'">
          <van-cell-group>
            <van-field
              ref="focusInputRef2"
              v-model.trim="boxNo"
              label="boxNO."
              label-width="100px"
              placeholder="Click to type boxNO."
              @keydown.enter="boxNoAndSkuEnter('boxNo', 'boxNO.')"
              :disabled="disabledBoxAndSku"
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
        <template v-else-if="query.pageFlag === 'msku'">
          <van-cell-group>
            <van-field
              ref="focusInputRef2"
              v-model.trim="msku"
              label="SKU"
              label-width="100px"
              placeholder="Click to type SKU"
              @keydown.enter="boxNoAndSkuEnter('msku', 'SKU')"
              :disabled="disabledBoxAndSku"
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
                <template v-if="item.inStorageStatus === 1">
                  <!-- 整箱 -->
                  <div
                    class="textIconContainer textIconContainerBox flexBetweenCenter"
                  >
                    <span class="fsize14fweight700" style="color: #464242"
                      >BoxNo：{{ item.boxNo }}</span
                    >
                    <span class="textIconClass">BOX</span>
                  </div>
                  <div
                    style="display: flex; margin-bottom: 6px"
                    v-for="(skuItem, skuI) in item.child"
                    :key="skuI"
                  >
                    <div
                      style="
                        width: 1.6rem;
                        margin-right: 6px;
                        line-height: 0;
                        border: 1px solid #eee;
                      "
                    >
                      <van-image
                        width="1.6rem"
                        height="1.6rem"
                        fit="contain"
                        @click="imagePreview(skuItem.imageUrl)"
                        :src="skuItem.imageUrl"
                      >
                        <template v-slot:error>加载失败</template>
                      </van-image>
                    </div>
                    <div>
                      SKU：{{ skuItem.msku }} * {{ skuItem.boxQuantity }}<br />
                      {{ skuItem.mskuName }}
                    </div>
                  </div>
                </template>
                <template v-else>
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
                      <!-- 散货 -->
                      <div class="textIconContainer">
                        <span
                          class="textIconClass"
                          style="background-color: #545c64"
                          >PCS</span
                        >
                        <span>SKU：{{ item.msku }} </span>
                      </div>
                      {{ item.mskuName }}
                    </div>
                  </div>
                </template>
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
                      @keydown.enter="ShiftBtn(item)"
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
                  <van-col v-if="item.inStorageStatus === 1" span="5"
                    ><div>
                      <!-- <van-button
                        :disabled="
                          !(item.adjustQuantity && item.locationNameTarget)
                        "
                        size="mini"
                        type="primary"
                        @click.stop="ShiftBtn(item)"
                        >Shift</van-button
                      > -->
                    </div>
                  </van-col>
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
        navBarTitle: "Location Shift",
        inStorageStatus: null,
      },
      box: {
        prop: "boxNo",
        navBarTitle: "BoxNO. Shift",
        inStorageStatus: 1,
      },
      msku: {
        prop: "msku",
        navBarTitle: "SKU Shift",
        inStorageStatus: 2,
      },
    };
    let that = this;
    return {
      commonData: PageData[that.$route.query.pageFlag],
      query: that.$route.query,
      readonly1: false,
      autoFocus: false,
      locationNameStart: "",
      locationNameTarget: "",
      msku: "",
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
        flag = Boolean(this.locationNameStart && this.searchList.length > 0);
      } else {
        flag = Boolean(
          this.locationNameStart &&
            this.checkList.length > 0 &&
            this.searchList.length > 0
        );
      }
      return !flag;
    },
    disabledBoxAndSku() {
      let flag = Boolean(this.locationNameStart && this.searchList.length > 0);
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
    // 起始货位回车
    locationNameStartEnter() {
      document.activeElement.blur();
      if (!this.locationNameStart) {
        return Toast.fail({
          message: `Start Location is empty`, //查询条件为空
          position: "top",
        });
      }
      const inputRef =
        this.query.pageFlag === "pallet" ? "focusInputRef3" : "focusInputRef2";
      this.getList(inputRef);
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
    // 输入框 移位
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
      let type = 1;
      if (this.query.pageFlag === "pallet") {
        this.searchList.forEach((item) => {
          item.child.forEach((childItem) => {
            list.push({ ...item, ...childItem });
          });
        });
      } else {
        type = 2;
        this.searchList.forEach((item) => {
          if (this.checkList.includes(item[this.commonData.prop])) {
            item.child.forEach((childItem) => {
              list.push({ ...item, ...childItem });
            });
          }
        });
      }
      await addAndRemove(list, {
        type,
        locationName: this.locationNameTarget,
      });
      Toast.success({
        message: "Shift success", //上架成功
        position: "top",
      });
      //   货位合并后 清空数据
      this.resetDataFun();
    },
    // 单个上架
    async ShiftBtn(item) {
      document.activeElement.blur();
      if (item.locationNameTarget === item.locationName) {
        item.locationNameTarget = "";
        return Toast.fail({
          message: `ERROR：Same storage location`, //货位相同
          position: "top",
        });
      }
      let list = [];
      item.child.forEach((childItem) => {
        list.push({ ...item, ...childItem });
      });
      await addAndRemove(list, {
        type: 2,
        locationName: item.locationNameTarget,
      });
      Toast.success({
        message: "Shift success", //上架成功
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
        this.locationNameStart = "";
        this.locationNameTarget = "";
        this.autoFocus = true;
        this.$nextTick(() => {
          this.$refs.focusInputRef1 && this.$refs.focusInputRef1.focus();
        });
      } else {
        this.locationNameTarget = "";
        this.getList("focusInputRef2");
      }
    },
    // 清空
    clearDataFun() {
      this.searchList = [];
      this.list = [];
      this.locationNameStart = "";
      this.autoFocus = true;
      this.$nextTick(() => {
        this.$refs.focusInputRef1 && this.$refs.focusInputRef1.focus();
      });
    },
    // 调接口获取数据
    async getList(inputRef) {
      const data = {
        warehouseId: this.query.warehouseId,
        locationName: this.locationNameStart,
        inStorageStatus: this.commonData.inStorageStatus,
      };
      this.searchLoading = true;
      this.searchList = [];
      this.checkList = [];
      this.list = [];
      const { data: res } = await selPageList(data);
      res.forEach((item) => {
        if (item.inStorageStatus === 1) {
          // 整箱
          item.tempBoxNo = item.boxNo;
        } else {
          // 散货
          item.tempBoxNo = item.msku + item.mskuId;
        }
      });
      let listRemoveByBoxNo = this.$globalFun.removeDupAndSumByKey(
        res,
        "tempBoxNo",
        ["boxQuantity"],
        ["imageUrl", "msku", "mskuId", "mskuName", "newMskuId", "boxQuantity"]
      );
      listRemoveByBoxNo.forEach((item, i) => {
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
      if (listRemoveByBoxNo.length > 0) {
        this.searchList = listRemoveByBoxNo;
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
        this.list = [];
        this.finished = true;
      }
    },
    // 加载数据
    onLoad() {
      // 异步更新数据
      setTimeout(() => {
        let allLength = this.searchList.length;
        let currentLength = this.list.length;
        let pageSize = 10 + currentLength; //先全部加载  之后10列一加载  需要考虑置顶效果
        let size = allLength >= pageSize ? pageSize : allLength;
        let I = currentLength === 0 ? 0 : currentLength;
        for (let i = I; i < size; i++) {
          this.list.push(this.searchList[i]);
        }
        // 加载状态结束
        this.loading = false;
        // 数据全部加载完成
        if (currentLength >= allLength) {
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
    this.autoFocus = true;
    this.$nextTick(() => {
      this.$refs.focusInputRef1 && this.$refs.focusInputRef1.focus();
    });
    if (this.query.pageFlag !== "pallet") {
      //   this.locationNameStart = "temp";
      //   this.getList("focusInputRef2");
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
            line-height: 12px;
            background-color: #13227a;
            color: #fff;
            border-radius: 50%;
            padding: 4px;
            margin-right: 4px;
          }
        }
        .textIconContainerBox {
          padding-bottom: 4px;
          border-bottom: 1px solid #eee;
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