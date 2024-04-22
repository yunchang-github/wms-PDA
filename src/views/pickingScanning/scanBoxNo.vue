<template>
  <div id="scanBoxNo">
    <van-nav-bar title="BoxNO. scanning">
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
          <van-cell>
            <div
              style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                line-height: 0px;
              "
              :style="{ lineHeight: scanCountSum > 0 ? '0px' : '' }"
            >
              <div>
                <span style="margin-right: 12px">Picking Number</span>
                <span>
                  {{ query.pickingListNumber }}
                </span>
              </div>
              <div>
                <template v-if="scanCountSum > 0">
                  <van-button
                    size="mini"
                    type="primary"
                    @click="completePickingBtn"
                    >Complete picking</van-button
                  >
                </template>
              </div>
            </div>
          </van-cell>
        </van-cell-group>
        <!-- 拣货单号 -->
        <van-cell-group>
          <van-field
            ref="focusInputRef1"
            v-model.trim="boxNo"
            label="BoxNO."
            label-width="100px"
            placeholder="Click to type BoxNO."
            @keydown.enter="boxNoEnter"
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
        <template v-if="loading">
          <div
            class="loadingContainer"
            :style="{ height: listContainerHeight + 'px' }"
          >
            <van-loading color="#0094ff" vertical> Loading </van-loading>
          </div>
        </template>
        <template v-else>
          <div class="tableHeadClass">
            <div class="tableTipsClass">
              <span class="labelClass">上一条扫描的箱名：</span>
              {{ boxNameSuccess || "Not scanned yet" }} <br />
              <span class="labelClass">箱号：</span
              >{{ boxNoSuccess || "Not scanned yet" }} <br />
              <span style="margin-right: 20px">
                <span class="labelClass">已扫描数量：</span
                ><span class="labelClass" style="color: #52c41a">{{
                  scanCountSum
                }}</span>
              </span>
              <span class="labelClass">剩余未扫描数量：</span>
              <span class="labelClass" style="color: #333333">{{
                boxCountSum - scanCountSum
              }}</span>
            </div>
            <div class="tableClass">
              <table rules="cols" style="width: 100%">
                <thead>
                  <template v-for="(option, index) in searchTableColumns">
                    <th
                      :style="{ width: option.width }"
                      align="center"
                      :key="index"
                    >
                      {{ option.label }}
                    </th>
                  </template>
                </thead>
              </table>
            </div>
          </div>
          <div class="scrollbarClass">
            <div class="tableClass" style="border-top: none">
              <table rules="cols" style="width: 100%">
                <tbody>
                  <template v-if="showTable.length === 0 && !loading">
                    <tr :style="{ height: listContainerHeight }">
                      <td :colspan="searchTableColumns.length" align="center">
                        暂无数据
                      </td>
                    </tr>
                  </template>
                  <template v-else>
                    <tr
                      v-for="(option, index) in showTable"
                      :key="index"
                      @click="pPickingListNumberClick(option)"
                      :class="{
                        successScanClass: option.scanCount === option.boxCount,
                      }"
                    >
                      <template v-for="(item, i) in searchTableColumns">
                        <td
                          :style="{ width: item.width }"
                          align="center"
                          :key="i"
                        >
                          {{ option[item.prop] }}
                        </td>
                      </template>
                    </tr>
                  </template>
                </tbody>
              </table>
            </div>
          </div>
        </template>
      </div>
    </div>
    <!-- 警告弹窗 -->
    <!-- <van-dialog v-model="warnVisible" show-cancel-button>
      <template #title>
       
      </template>
      <template #default>
        <div>
          The box has not been fully scanned. Are you sure you have completed
          picking
        </div>
      </template>
    </van-dialog> -->
  </div>
</template>
  
  <script>
import {
  selPageSonList,
  selPdaPickingListInfo,
  pdaScanBox,
  pdaFbaCompletePick,
  FBACompletePick,
} from "@/api/overseasWarehouse/pickingListOrder";
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
      boxNoSuccess: "",
      boxNameSuccess: "",
      loading: false,
      scanCountSum: 0,
      boxCountSum: 0,
      pTableData: [],
      searchTableColumns: [
        {
          label: "序号",
          prop: "index",
          width: "12%",
        },
        {
          label: "库位",
          prop: "locationName",
          width: "20%",
        },
        {
          label: "箱名",
          prop: "boxName",
          width: "38%",
        },
        {
          label: "已扫描数/总数",
          prop: "scanCount_boxCount",
          width: "30%",
        },
      ],
      //   警告弹窗
      //   warnVisible: false,
    };
  },
  computed: {
    showTable() {
      let tableDataRemoveBoxNo = this.$globalFun.removeDupAndSumByKey(
        this.pTableData,
        "boxNameAndBoxNo"
      );
      let showTable = this.$globalFun.removeDupAndSumByKey(
        tableDataRemoveBoxNo,
        "boxName",
        ["scanCount", "boxCount"],
        ["boxNo"]
      );
      let scanCountSum = 0,
        boxCountSum = 0;
      showTable.forEach((item, index) => {
        item.index = index + 1;
        item.scanCount_boxCount = item.scanCount + "/" + item.boxCount;
        scanCountSum += item.scanCount;
        boxCountSum += item.boxCount;
      });
      this.scanCountSum = scanCountSum;
      this.boxCountSum = boxCountSum;
      return showTable;
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
    // 完成拣货
    async completePickingBtn() {
      try {
        let flag = true;
        if (this.boxCountSum - this.scanCountSum !== 0) {
          //   this.warnVisible = true;
          await Dialog.confirm({
            // <van-icon name="warning-o" />
            title: `Warn`,
            allowHtml: true,
            message:
              "The box has not been fully scanned. <br> Are you sure you have completed picking",
            confirmButtonText: "Complete picking",
            cancelButtonText: "Cancellation",
          });
          flag = false;
        }
        let list = this.getFbaConfirmData(this.pTableData);
        await FBACompletePick(list, { flag });
        // const data = {
        //   flag,
        //   pickingListNumber: this.query.pickingListNumber,
        // };
        // await pdaFbaCompletePick(data);
        Toast.success({
          message: "Complete picking success", //扫描成功
          position: "top",
        });
        this.goBack();
      } catch (e) {
        console.log(e);
      }
    },
    getFbaConfirmData(expandTableData) {
      let list = [];
      expandTableData.forEach((item) => {
        if (item.boxCount > 1) {
          // 箱数大于1
          if (item.scanCount === item.boxCount) {
            for (let i = 0; i < item.boxCount; i++) {
              list.push({
                pickingListId: this.query.id,
                ...item,
                id: item.idsList[i],
                boxCount: 1,
                boxStatus: 1,
              });
            }
          } else {
            for (let i = 0; i < item.scanCount; i++) {
              list.push({
                pickingListId: this.query.id,
                ...item,
                id: item.idsList[i],
                boxCount: 1,
                boxStatus: 1,
              });
            }
            let lastIdList = item.idsList.slice(item.scanCount - item.boxCount);
            lastIdList.forEach((id) => {
              list.push({
                ...item,
                pickingListId: this.query.id,
                id,
                boxCount: 0,
                boxStatus: 2,
              });
            });
          }
        } else {
          // 箱数小于1
          if (item.scanCount === item.boxCount) {
            list.push({
              pickingListId: this.query.id,
              ...item,
              boxCount: 1,
              boxStatus: 1,
            });
          } else {
            list.push({
              pickingListId: this.query.id,
              ...item,
              boxCount: 0,
              boxStatus: 2,
            });
          }
        }
      });
      return list;
    },
    pPickingListNumberClick(row) {
      this.pickingListNumber = row.pickingListNumber;
    },
    // 扫描箱号
    async boxNoEnter() {
      try {
        const data = {
          pickingListNumber: this.query.pickingListNumber,
          boxNo: this.boxNo,
        };
        const { data: res } = await pdaScanBox(data);
        this.boxNoSuccess = this.boxNo;
        this.boxNameSuccess = res;
        Toast.success({
          message: "Scan success", //扫描成功
          position: "top",
        });
      } catch (e) {
        console.log(e);
      } finally {
        this.boxNo = "";
        this.getMainTable();
      }
    },
    async getMainTable() {
      this.loading = true;
      const params = {
        id: this.query.id,
      };
      const { data: res } = await selPageSonList(params);
      res.forEach((item) => {
        item.idsList = item.ids.split(",");
        item.boxNameAndBoxNo = item.boxName + item.boxNo;
        item.scanCount = item.scanStatusStr
          .split(",")
          .filter((status) => status === "1").length;
      });
      this.pTableData = res;
      this.loading = false;
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
      this.getMainTable();
    });
  },
};
</script>
  
  <style lang="scss" scoped>
#scanBoxNo {
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
    overflow: hidden;
    flex: 1;
    .vanCeliContainer {
      border-bottom: 10px solid #f7f9fd;
    }
    .vanListContainer {
      box-sizing: border-box;
      padding: 15px;
      display: flex;
      flex-direction: column;
      .loadingContainer {
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .tableHeadClass {
        height: auto;
        .tableTipsClass {
          .labelClass {
            font-size: 15px;
            font-weight: 700;
          }
          font-size: 14px;
          color: #515a6e;
          margin-bottom: 10px;
          line-height: 20px;
        }
      }
      .scrollbarClass {
        flex: 1;
        height: 100%;
        overflow-y: scroll;
        scroll-behavior: smooth; /* 平滑滚动效果 */
      }
      .tableClass {
        // height: 100%;
        border: 1px solid #e6ebf5;
        border-bottom: none;
        table {
          table-layout: fixed;
          color: #515a6e;
          border-bottom: 1px solid #e6ebf5;
        }
        thead {
          th {
            font-size: 13px;
            padding: 6px;
            text-align: center;
            border: 1px solid #e6ebf5; /* 设置边框 */
            word-wrap: break-word;
          }
        }
        tbody {
          .successScanClass {
            background-color: #e1f5d5;
          }
          td {
            padding: 6px;
            text-align: center;
            font-size: 12px;
            border: 1px solid #e6ebf5; /* 设置边框 */
            word-wrap: break-word;
          }
        }
      }
    }
  }
}
</style>