<template>
  <div id="AllPutawayPage">
    <van-nav-bar title="Specify Box Shift">
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
        <!-- 箱号 -->
        <van-cell-group>
          <van-field
            ref="focusInputRef1"
            v-model.trim="boxNos"
            label="boxNO."
            label-width="100px"
            placeholder="Click to type boxNO."
            @keydown.enter="boxNoEnter"
            @focus="stopKeyborad"
            :readonly="readonly1"
          >
            <template #button>
              <div style="line-height: 0" class="flexBetweenCenter">
                <van-tag type="warning" style="padding: 4px"
                  >Selected：{{ checkList.length }}</van-tag
                >
                <div v-if="checkList.length > 0" class="closeClass">
                  <van-icon name="close" size="18" @click.stop="closeBtn" />
                </div>
              </div>
            </template>
          </van-field>
        </van-cell-group>
        <!-- 目的货位 -->
        <van-cell-group>
          <van-field
            ref="focusInputRef2"
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
                  borderColor: checkList.includes(item.boxNo)
                    ? '#5cce69'
                    : '#ccc',
                }"
              >
                <!-- 整箱 -->
                <div
                  class="textIconContainer textIconContainerBox flexBetweenCenter"
                >
                  <span class="fsize14fweight700" style="color: #464242"
                    >BoxNo：{{ item.boxNo }}</span
                  >
                  <span v-if="item.inStorageStatus === 1" class="textIconClass"
                    >BOX</span
                  >
                  <span
                    v-else
                    class="textIconClass"
                    style="background-color: #545c64"
                    >PCS</span
                  >
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
                    SKU：{{ skuItem.msku }} * {{ skuItem.totalQuantity }}<br />
                    {{ skuItem.mskuName }}
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
                  <!-- 整箱 -->
                  <van-col span="7">
                    <div>Box Count <br />{{ item.boxCount }}</div>
                  </van-col>
                  <van-col span="7" style="border-left: 1px solid #ccc">
                    <div>Box Qty <br />{{ item.totalQuantity }}</div>
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
    let that = this;
    return {
      query: that.$route.query,
      readonly1: false,
      autoFocus: false,
      locationNameTarget: "",
      boxNos: "",
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
      return !Boolean(this.checkList.length > 0 && this.searchList.length > 0);
    },
    disabledBoxAndSku() {
      return !Boolean(this.searchList.length > 0);
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
    // 输入框 移位
    async chiftBtn() {
      document.activeElement.blur();
      let list = [];
      this.searchList.forEach((item) => {
        if (this.checkList.includes(item.boxNo)) {
          item.child.forEach((childItem) => {
            list.push({ ...item, ...childItem });
          });
        }
      });
      try {
        await addAndRemove(list, {
          type: 2,
          locationName: this.locationNameTarget,
        });
        Toast.success({
          message: "Shift success",
          position: "top",
        });
        //   货位合并后 清空数据
        this.resetDataFun();
      } catch (e) {
        this.locationNameTarget = "";
        this.autoFocus = true;
        this.$nextTick(() => {
          this.$refs["focusInputRef2"] && this.$refs["focusInputRef2"].focus();
        });
      }
    },
    // 移位后重置
    resetDataFun() {
      this.searchList = [];
      this.list = [];
      this.checkList = [];
      this.locationNameTarget = "";
      this.autoFocus = true;
      this.$nextTick(() => {
        this.$refs["focusInputRef1"] && this.$refs["focusInputRef1"].focus();
      });
    },
    closeBtn() {
      this.searchList = [];
      this.list = [];
      this.checkList = [];
    },
    // 箱号回车
    boxNoEnter() {
      document.activeElement.blur();
      if (!this.boxNos) {
        return Toast.fail({
          message: `BoxNo. is empty`, //查询条件为空
          position: "top",
        });
      }
      let inputRef = "focusInputRef1";
      if (!this.checkList.includes(this.boxNos)) {
        this.checkList.unshift(this.boxNos);
        this.getList(inputRef);
      } else {
        this.$globalFun.webSpeakFun(`重复`);
        this.boxNos = "";
        this.autoFocus = true;
        this.$nextTick(() => {
          this.$refs[inputRef] && this.$refs[inputRef].focus();
        });
      }
    },
    // 调接口获取数据
    async getList(inputRef) {
      const data = {
        type: 2, //2 代表按照给的箱号顺序排序
        warehouseId: this.query.warehouseId,
        boxNos: this.checkList.join(","),
        // inStorageStatus: 1,
      };
      this.searchLoading = true;
      this.searchList = [];
      this.list = [];
      const { data: res } = await selPageList(data);
      let boxNoList = [];
      this.boxNos = "";
      res.forEach((item) => {
        // 整箱
        item.tempBoxNo = item.boxNo;
        boxNoList.push(item.boxNo);
      });
      let checkListNumO = this.checkList.length;
      if (boxNoList.length === 0) {
        this.checkList = [];
      } else {
        this.checkList = this.checkList.filter((boxNo) =>
          boxNoList.includes(boxNo)
        );
      }
      if (checkListNumO === this.checkList.length) {
        this.$globalFun.webSpeakFun(`成功`);
      } else {
        this.$globalFun.webSpeakFun(`错误`);
      }
      let listRemoveByBoxNo = this.$globalFun.removeDupAndSumByKey(
        res,
        "tempBoxNo",
        ["totalQuantity"],
        ["imageUrl", "msku", "mskuId", "mskuName", "newMskuId", "totalQuantity"]
      );
      listRemoveByBoxNo.forEach((item, i) => {
        item.index = i;
        item.originalLocationId = item.locationId;
        item.adjustQuantity = item.boxCount;
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