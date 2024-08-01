<template>
  <div id="AllPutawayPage">
    <van-nav-bar title="BoxNO. Sign">
      <template #left>
        <svg class="icon navBarIcon" aria-hidden="true" @click.stop="goBack">
          <use xlink:href="#icon-zuojiantou"></use>
        </svg>
      </template>
      <template #right>
        {{ query.warehouseName }}
      </template>
    </van-nav-bar>
    <div class="pageContainer">
      <div class="vanCeliContainer">
        <!-- 入库单号 -->
        <van-cell-group>
          <van-field
            ref="focusInputRef1"
            v-model.trim="inStorageNumber"
            label="InStorageNO."
            label-width="100px"
            placeholder="Click to type InStorageNO."
            @keydown.enter="getList"
            @focus="stopKeyborad"
            :readonly="readonly1"
          >
            <template #button>
              <div style="line-height: 0">
                <van-button size="mini" type="warning" @click="resetDataBtnFun"
                  >Clear</van-button
                >
              </div>
            </template>
          </van-field>
        </van-cell-group>
        <van-cell-group>
          <van-field
            ref="focusInputRef2"
            v-model.trim="boxNo"
            label="boxNO."
            label-width="100px"
            placeholder="Click to type boxNO."
            @keydown.enter="boxNoEnter"
            @focus="stopKeyborad"
            :readonly="readonly1"
            :disabled="disabledBoxNo"
          >
          </van-field>
        </van-cell-group>
      </div>
      <div
        class="vanListContainer"
        :style="{ height: listContainerHeight + 'px' }"
      >
        <template v-if="loading">
          <div class="vanLoadingContainer">
            <van-loading class="vanLoadingClass" color="#1989fa" />
          </div>
        </template>
        <template v-else>
          <template v-if="inStorageData">
            <div class="inStorageInfoClass">
              <!-- 入库单信息 -->
              <span class="tipsClass mr20">
                总箱数：{{ inStorageData.boxCount }}
              </span>
              <span
                :class="{
                  warnTipsClass: inStorageData.boxCount - scanBoxCount !== 0,
                }"
              >
                未签收数：{{ inStorageData.boxCount - scanBoxCount }}
              </span>
            </div>
            <div class="signBoxNoInfoClass tipsClass">
              <template v-if="scanBoxNoData">
                <div><b>扫描的箱子信息</b></div>
                <div>
                  <span>箱号：{{ scanBoxNoData.boxNo }}</span>
                </div>
                <div>
                  扫描前状态：{{
                    scanBoxNoData.signedStatus === 1 ? "未签收" : "已签收"
                  }}
                </div>
                <div>
                  长宽高：{{ scanBoxNoData.boxLongWideHeight }}（CM） 重：{{
                    scanBoxNoData.boxWeight
                  }}（KG）
                </div>
                <div>箱名：{{ scanBoxNoData.boxName }}</div>
              </template>
              <template v-else>
                <div class="noContentClass">请扫描箱号进行签收</div>
              </template>
            </div>
          </template>
          <template v-else>
            <div class="noContentClass">请先扫描入库单号!!!</div>
          </template>
          <template v-if="signMsgData">
            <div class="signMsgDataClass" v-if="signMsgData.boxNo">
              <span
                v-html="signMsgData.msg"
                :style="{ color: signMsgData.color }"
              ></span>
            </div>
          </template>
        </template>
      </div>
    </div>
  </div>
</template>
  
  <script>
import {
  selPageList,
  selPageSonList,
  wmsInboundStockInSign,
} from "@/api/inventory/BoxNoSignPage";
import { Toast } from "vant";
export default {
  data() {
    let that = this;
    return {
      query: that.$route.query,
      readonly1: false,
      autoFocus: false,
      inStorageNumber: "",
      inStorageData: null,
      scanBoxCount: 0, // 已签收箱数
      boxNo: "",
      listContainerHeight: 0,
      loading: false,
      boxNolist: [],
      scanBoxNoData: null,
      signMsgData: null,
    };
  },
  created() {},
  computed: {
    disabledBoxNo() {
      let flag = Boolean(this.inStorageData && this.boxNolist.length > 0);
      return !flag;
    },
  },
  methods: {
    // 扫描箱号
    async boxNoEnter() {
      let findData = this.boxNolist.find(
        (item) => item.boxNo.toLowerCase() === this.boxNo.toLowerCase()
      );
      this.scanBoxNoData = findData;
      if (findData) {
        this.boxNo = "";
        if (findData.signedStatus === 1) {
          let tempData = [
            {
              ...findData,
              signedStatus: 2,
              boxCount: 1,
              inStorageId: this.inStorageData.id,
            },
          ];
          // 未签收 进行签收操作
          let flag = this.inStorageData.boxCount - this.scanBoxCount === 1; // 未签收数量为1
          try {
            await wmsInboundStockInSign({ flag }, tempData);
            findData.signedStatus = 2; //修改状态
            this.scanBoxCount = this.scanBoxCount + 1;
            if (flag) {
              this.signMsgData = {
                boxNo: findData.boxNo,
                msg: "当前入库单，签收完成",
                color: "#67c23a",
              };
            } else {
              this.signMsgData = {
                boxNo: findData.boxNo,
                msg: "签收成功",
                color: "#67c23a",
              };
            }
          } catch (e) {
            console.log(e);
            this.signMsgData = {
              boxNo: findData.boxNo,
              msg: "签收失败",
              color: "#f56c6c",
            };
          }
        } else {
          this.signMsgData = {
            boxNo: findData.boxNo,
            msg: "无法重复签收",
            color: "#e6a23c",
          };
        }
      } else {
        this.signMsgData = {
          boxNo: this.boxNo,
          msg: `未找到该箱号 <br> ${this.boxNo}`,
          color: "#f56c6c",
        };
        this.boxNo = "";
      }
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
    // 重置
    resetDataBtnFun() {
      this.inStorageNumber = "";
      this.boxNo = "";
      this.inStorageData = null;
      this.boxNolist = [];
      this.scanBoxNoData = null;
      this.signMsgData = null;
      this.autoFocus = true;
      this.$nextTick(() => {
        this.$refs.focusInputRef1 && this.$refs.focusInputRef1.focus();
      });
    },
    // 调接口获取数据
    async getList() {
      this.boxNo = "";
      this.inStorageData = null;
      this.boxNolist = [];
      this.scanBoxNoData = null;
      this.signMsgData = null;
      this.loading = true;
      const data = {
        warehouseIds: this.query.warehouseId,
        inStorageNumber: this.inStorageNumber,
        businessType: 1,
        pageNum: 1,
        pageSize: 1,
      };
      const { data: res } = await selPageList(data);
      if (res.records.length) {
        let item = res.records[0];
        item.boxCount = item.boxCount || 0;
        this.inStorageData = item;
        this.getSonList();
      }
    },
    async getSonList() {
      try {
        let res = await selPageSonList({
          id: this.inStorageData.id,
        });
        let boxNo = "";
        let index = 0;
        res.forEach((item) => {
          item.palletNumber = item.palletNumber || "无托盘";
          // 重写signedStatus 1为未签收  2 为已签收
          item.signedStatus = item.signaturesQuantity === item.boxCount ? 2 : 1;
          item.onlyKey1 = item.palletNumber; // 一层数据  以 托盘号为唯一值
          item.onlyKey2 = item.palletNumber + item.boxName; // 二层数据  以 托盘号加箱子名称
          item.onlyKey3 = item.palletNumber + item.boxName + item.boxNo; // 三层数据  以 托盘号加箱子名称加箱子编号
          item.onlyKey4 =
            item.palletNumber + item.boxName + item.boxNo + item.msku;
          item.index = index;
          if (boxNo !== item.boxNo) {
            item.index = ++index;
            boxNo = item.boxNo;
          }
          item.index = index;
          // 唯一值
          item.boxNoAndinStorageStatus = item.boxNo + item.inStorageStatus;
          // 页面显示处理
          item.boxLongWideHeight = `${item.boxLong || 0} / ${
            item.boxWide || 0
          } / ${item.boxHeight || 0}`;
          item.signaturesQuantity = item.signaturesQuantity || 0;
          // 🌹 初始值处理
          item.mixedFlag =
            res.filter((innerItem) => innerItem.boxNo == item.boxNo).length > 1
              ? 1
              : 0;
        });
        let listRemoveByBoxNo = this.$globalFun.removeDupAndSumByKey(
          res,
          "onlyKey3"
        );
        this.scanBoxCount = 0;
        listRemoveByBoxNo.forEach((item) => {
          this.scanBoxCount += item.signaturesQuantity;
        });
        this.boxNolist = listRemoveByBoxNo;
        this.loading = false;
        console.log(this.$refs.focusInputRef2);
        this.autoFocus = true;
        this.$nextTick(() => {
          this.$refs.focusInputRef2 && this.$refs.focusInputRef2.focus();
        });
      } catch (e) {
        console.log(e);
        this.loading = false;
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
.mr10 {
  margin-right: 10px;
}
.mr20 {
  margin-right: 20px;
}

.mb10 {
  margin-bottom: 10px;
}
.mb20 {
  margin-bottom: 20px;
}
.signMsgDataClass {
  margin-top: 100px;
  text-align: center;
  font-size: 30px;
}
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
    .palletInfoClass {
      padding: 6px;
    }
    .noContentClass {
      padding: 20px;
      text-align: center;
      color: #ada3a3;
    }
    .inStorageInfoClass {
      margin: 20px;
      font-size: 18px;
      text-align: center;
      font-weight: 700;
    }
    .signBoxNoInfoClass {
      margin: 10px 20px;
      font-size: 16px;
      line-height: 28px;
    }
    .tipsClass {
      color: darkslategrey;
    }
    .warnTipsClass {
      color: #cc1c1c;
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
    .vanListContainer {
      overflow-y: scroll;
      scroll-behavior: smooth; /* 平滑滚动效果 */
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