<template>
  <div id="PalletPutaway">
    <van-nav-bar title="Bulk cargo Check">
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
        <van-cell-group>
          <van-field
            ref="focusInputRef1"
            v-model="boxName"
            label="BoxName"
            placeholder="请扫描或输入箱名"
            @keydown.enter="getListByEnter('boxName')"
            @focus="stopKeyborad"
            :readonly="readonly1"
            clearable
            @clear="resetDataFun('boxName', 'focusInputRef1')"
          >
          </van-field>
        </van-cell-group>
        <van-cell-group>
          <van-field
            ref="focusInputRef2"
            v-model="fnsku"
            label="FNSKU"
            placeholder="扫描FNSKU条码可置顶"
            @keydown.enter="getListByEnter('fnsku')"
            @focus="stopKeyborad"
            :disabled="disabledSku"
            clearable
            @clear="resetDataFun('fnsku', 'focusInputRef2')"
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
                  <!-- 整箱 -->
                  <div class="flexBetweenCenter textIconContainerBox">
                    <div class="fsize14fweight700">
                      <span class="mr20">货位：{{ item.locationName }}</span>
                      <span class="mr20">总数：{{ item.totalQuantity }}</span>
                      <span
                        :style="{
                          color:
                            item.totalQuantity !== item.actualTotalQuantity
                              ? 'red'
                              : '',
                        }"
                        >盘后总数：{{ item.actualTotalQuantity }}</span
                      >
                    </div>
                    <van-button
                      size="mini"
                      type="primary"
                      @click.stop="checkBtn(item)"
                      >确认盘点</van-button
                    >
                  </div>
                  <div
                    class="flexStartCenter childItemClass"
                    :class="{
                      lastChildItemClass: skuI + 1 === item.child.length,
                    }"
                    v-for="(skuItem, skuI) in item.child"
                    :key="skuI"
                  >
                    <div
                      style="
                        width: 1.2rem;
                        margin-right: 6px;
                        line-height: 0;
                        border: 1px solid #eee;
                      "
                    >
                      <van-image
                        width="1.2rem"
                        height="1.2rem"
                        fit="contain"
                        @click="imagePreview(skuItem.imageUrl)"
                        :src="skuItem.imageUrl"
                      >
                        <template v-slot:error>加载失败</template>
                      </van-image>
                    </div>
                    <div class="tableListTextClass">
                      FNSKU：{{ skuItem.fnsku }}<br />
                      MSKU：{{ skuItem.msku }}
                    </div>
                    <div class="adjustInputClass">
                      <input
                        type="text"
                        v-model.trim="skuItem.actualQuantity"
                        placeholder="Actual Qty"
                        style="
                          width: 100%;
                          border: 1px solid #ccc;
                          box-sizing: border-box;
                        "
                        @input="adjustInputCHange(skuItem, item)"
                      />
                    </div>
                  </div>
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
import { selBulkInventoryList } from "@/api/storage/InventoryCheckPage";
import { Toast } from "vant";
export default {
  data() {
    let that = this;
    return {
      query: that.$route.query,
      readonly1: false,
      autoFocus: false,
      fnsku: "",
      boxNo: "",
      boxName: "",
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
    disabledSku() {
      let flag = Boolean(this.boxName && this.searchList.length > 0);
      return !flag;
    },
  },
  methods: {
    // 调整数量改变
    adjustInputCHange(row, item) {
      item.actualTotalQuantity = item.child.reduce((acc, cur) => {
        acc += Number(cur.actualQuantity || 0);
        return acc;
      }, 0);
      console.log(row);
    },
    async checkBtn(item) {
      if (!item.adjustQuantity && item.adjustQuantity !== 0)
        return Toast.fail({
          message: "The Quantity is empty", //数量为空
          position: "top",
        });
      let list = [];
      item.child.forEach((childItem) => {
        list.push({ ...item, ...childItem });
      });
      await inventoryCheck(list, { type: 2 });
      Toast.success({
        message: "Inventory success", //数量为空
        position: "top",
      });
      this.getList();
    },
    // 重置
    resetDataFun(prop, serachInputRef) {
      this[prop] = "";
      this.list = [];
      this.autoFocus = true;
      this.$refs[serachInputRef].focus();
    },
    // 调接口获取数据
    async getList() {
      const data = {
        isWms: 2,
        pageSize: 200,
        pageNum: 1,
        warehouseIds: this.query.warehouseId,
        boxName: this.boxName,
        fnsku: this.fnsku,
        boxNo: this.boxNo,
      };
      this.searchLoading = true;
      this.searchList = [];
      this.list = [];
      const { data: res } = await selBulkInventoryList(data);
      this.searchLoading = false;
      if (res.records.length > 0) {
        res.records.forEach((item) => {
          item.actualTotalQuantity = item.totalQuantity;
          item.child = item.warehouseBulkInventoryDetailVOS.map((val) => {
            return {
              msku: val.msku,
              mskuId: val.mskuId,
              fnsku: val.fnsku,
              imageUrl: val.imageUrl,
              totalQuantity: val.totalQuantity,
              actualQuantity: val.totalQuantity,
            };
          });
        });
        this.searchList = res.records;
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
    },
    // 回车查询
    getListByEnter(label) {
      if (!this.boxName) {
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
    stopKeyborad() {
      if (this.autoFocus) {
        this.readonly1 = true;
        setTimeout(() => {
          this.readonly1 = false;
        }, 200);
        this.autoFocus = false;
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
    this.$refs["focusInputRef1"].focus();
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
      border-bottom: 8px solid #f7f9fd;
    }
    .vanListContainer {
      overflow-y: scroll;
      scroll-behavior: smooth; /* 平滑滚动效果 */
      .tableListTextClass {
        flex: 1;
        font-size: 14px;
      }
      .adjustInputClass {
        width: 65px;
      }
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
        border: 1px solid #ccc;
        padding: 6px;
        font-size: 12px;
        line-height: 20px;
        ::v-deep .digitFieldClass {
          .van-field__control {
            border: 1px solid #eee;
          }
        }
        .textIconContainerBox {
          padding-bottom: 8px;
          border-bottom: 1px solid #ccc;
        }
        .childItemClass {
          padding: 8px 0;
          border-bottom: 1px solid #ccc;
        }
        .lastChildItemClass {
          border: none;
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