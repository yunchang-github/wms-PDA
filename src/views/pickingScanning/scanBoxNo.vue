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
            >
              <div>
                <span style="margin-right: 12px">Picking Number</span>
                <span>
                  {{ query.pickingListNumber }}
                </span>
              </div>
              <div>
                <van-button
                  size="mini"
                  type="primary"
                  @click="completePickingBtn"
                  >Complete picking</van-button
                >
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
              <div
                style="
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                "
              >
                <span style="margin-right: 20px">
                  <span style="margin-right: 20px">
                    <span class="labelClass">已扫描数：</span
                    ><span class="labelClass" style="color: #52c41a">{{
                      scanCountSum
                    }}</span>
                  </span>
                  <span class="labelClass">未扫描数：</span>
                  <span class="labelClass" style="color: #333333">{{
                    boxCountSum - scanCountSum
                  }}</span>
                </span>
                <van-button
                  v-if="boxCountSum - scanCountSum > 0"
                  size="mini"
                  type="info"
                  @click="replaceableBoxNoBtn"
                  >未扫描箱号可替换明细</van-button
                >
              </div>
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
                          <template v-if="item.prop === 'boxName'">
                            <span @click.stop="showFnskuBtn(option)">{{
                              option[item.prop]
                            }}</span>
                          </template>
                          <template v-else>
                            {{ option[item.prop] }}
                          </template>
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
    <!-- 未扫描箱号可替换明细 -->
    <van-popup v-model="replaceableBoxNoVisible" class="replaceableBoxNoPopup">
      <div class="popupTitleClass">可替换箱号明细列表</div>
      <div class="popupContentClass">
        <template v-if="replaceableBoxNoLoading">
          <div class="loadingContainer">
            <van-loading color="#0094ff" vertical> Loading </van-loading>
          </div>
        </template>
        <template v-else>
          <template v-if="replaceableTableData.length">
            <div v-for="(firstItem, fI) in replaceableTableData" :key="fI">
              <div class="firstLevel">
                未扫描箱名：{{ firstItem.boxName }} ({{
                  firstItem.locationName
                }})
              </div>
              <template v-if="firstItem.accordList.length">
                <div
                  v-for="(secendItem, sI) in firstItem.accordList"
                  :key="fI + '-' + sI"
                >
                  <div class="secondLevel">
                    可替换箱号：<span
                      @click.stop="$globalFun.ycCopyText(secendItem.boxNo)"
                      >{{ secendItem.boxNo }}</span
                    >
                    <br />
                    所在货位：{{ secendItem.locationName }}
                  </div>
                </div>
              </template>
              <template v-else>
                <div class="secondLevel">无可替换箱号</div>
              </template>
            </div>
          </template>
          <template v-else> 未扫描箱号库存有问题 请联系管理员 </template>
        </template>
      </div>
      <div class="popupFootClass">
        <van-button size="small" type="default" @click="replaceableCancel"
          >关闭</van-button
        >
      </div>
    </van-popup>
  </div>
</template>
  
  <script>
import {
  selPageSonList,
  selPdaPickingListInfo,
  pdaScanBox,
  pdaFbaCompletePick,
  FBACompletePick,
  boxInventoryList,
} from "@/api/overseasWarehouse/pickingListOrder";
import { Toast, Dialog, Notify } from "vant";
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
        // {
        //   label: "序号",
        //   prop: "index",
        //   width: "12%",
        // },
        {
          label: "箱名",
          prop: "boxName",
          width: "44%",
        },
        {
          label: "库位",
          prop: "locationName",
          width: "20%",
        },
        {
          label: "已扫描数/总数",
          prop: "scanCount_boxCount",
          width: "36%",
        },
      ],
      replaceableBoxNoVisible: false,
      replaceableBoxNoLoading: false,
      replaceableTableData: [],
      //   警告弹窗
      //   warnVisible: false,
    };
  },
  computed: {
    showTable() {
      // 去除 混装数据
      let tableDataRemoveBoxNo = this.$globalFun.removeDupAndSumByKey(
        this.pTableData,
        "boxNameAndBoxNo",
        [],
        ["fnsku", "totalQuantity"]
      );
      tableDataRemoveBoxNo.forEach((item) => {
        let skuStr = item.child
          .map((val) => {
            return "&" + val.fnsku + "~" + val.totalQuantity;
          })
          .sort()
          .join(",");
        item.fnskuList = JSON.parse(JSON.stringify(item.child));
        item.boxOnlyKey = item.boxNameAndLocationName + skuStr;
      });
      // 去重 箱名加库位
      let showTable = this.$globalFun.removeDupAndSumByKey(
        tableDataRemoveBoxNo,
        "boxOnlyKey",
        ["scanCount", "boxCount"],
        ["boxNo", "scanStatus", "boxName"]
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
    showFnskuBtn(row) {
      let message =
        "箱明细数据\n" +
        row.fnskuList
          .map(
            (item) =>
              "FNSKU：" + item.fnsku + "  " + "数量：" + item.totalQuantity
          )
          .join("\n");
      Notify({ type: "primary", message, duration: 1500 });
    },
    replaceableCancel() {
      this.replaceableBoxNoVisible = false;
      this.replaceableTableData = [];
    },
    // 可替换箱号明细弹窗
    async replaceableBoxNoBtn() {
      let noScanBoxNo = [];
      this.showTable.forEach((item) => {
        item.child.forEach((val) => {
          if (val.scanStatus === 0) {
            noScanBoxNo.push(val.boxNo);
          }
        });
      });
      if (noScanBoxNo.length > 0) {
        this.replaceableBoxNoVisible = true;
        this.replaceableBoxNoLoading = true;
        const selBoxInfoQuery = {
          warehouseIds: this.query.warehouseId,
          companyId: this.query.companyId,
          pageType: 1,
          pageNum: 1,
          pageSize: 999,
          isWms: 2,
        };
        const { data: res } = await boxInventoryList({
          ...selBoxInfoQuery,
          boxNoList: noScanBoxNo.join(","),
        });
        let noScanList = res.records.map((item) => {
          return {
            boxName: item.boxName,
            boxNo: item.boxNo,
            locationName: item.locationName,
            skuListStr: item.warehouseInventoryBoxDetailVOS
              .map((val) => {
                return val.fnsku + "&" + val.totalQuantity;
              })
              .sort()
              .join(","),
          };
        });
        const allRes = await Promise.all(
          noScanList.map((item) => {
            return boxInventoryList({
              ...selBoxInfoQuery,
              boxName: item.boxName,
            });
          })
        );
        this.replaceableTableData = [];
        allRes.forEach(({ data: res }, resI) => {
          let currentNoScanItem = noScanList[resI];
          let accordList = res.records
            .map((item) => {
              return {
                remainingQuantity: item.boxCount - item.reserveQuantity, //剩余数
                boxName: item.boxName,
                boxNo: item.boxNo,
                locationName: item.locationName,
                skuListStr: item.warehouseInventoryBoxDetailVOS
                  .map((val) => {
                    return val.fnsku + "&" + val.totalQuantity;
                  })
                  .sort()
                  .join(","),
              };
            })
            // 剩余数大于0  且 不能为当前未扫描的箱号
            .filter((item) => {
              return (
                item.remainingQuantity > 0 &&
                item.boxNo !== currentNoScanItem.boxNo &&
                item.skuListStr === currentNoScanItem.skuListStr
              );
            });
          this.replaceableTableData.push({
            boxNameAndLocationName:
              currentNoScanItem.boxName + "-" + currentNoScanItem.locationName,
            boxName: currentNoScanItem.boxName,
            boxNo: currentNoScanItem.boxNo,
            locationName: currentNoScanItem.locationName,
            accordList,
            sortFlag: accordList.length > 0 ? 1 : 0,
          });
        });
        this.replaceableTableData = this.$globalFun
          .removeDupAndSumByKey(
            this.replaceableTableData,
            "boxNameAndLocationName"
          )
          .sort((a, b) => {
            return b.sortFlag - a.sortFlag;
          });
        this.replaceableBoxNoLoading = false;
      } else {
        Toast.fail({
          message: "无未扫描箱号",
          position: "top",
        });
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
    // 完成拣货
    async completePickingBtn() {
      try {
        let flag = true;
        if (this.boxCountSum - this.scanCountSum !== 0) {
          //   this.warnVisible = true;
          await Dialog.confirm({
            // <van-icon name="warning-o" />
            title: `警告`,
            allowHtml: true,
            // message:
            //   "The box has not been fully scanned. <br> Are you sure you have completed picking",
            message:
              "当前拣货单中的箱号<span style='color:red'> 未全部扫描 </span>， <br>已点击<span style='color:#1678dc'> 未扫描箱号可替换明细 </span>按钮确认？",
            confirmButtonText: "继续完成拣货",
            cancelButtonText: "取消当前操作",
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
        item.boxNameAndLocationName = item.boxName + "," + item.locationName;
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
            font-size: 14px;
            padding: 10px 6px;
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
            padding: 10px 6px;
            text-align: center;
            font-size: 14px;
            border: 1px solid #e6ebf5; /* 设置边框 */
            word-wrap: break-word;
          }
        }
      }
    }
  }
  .replaceableBoxNoPopup {
    padding: 10px;
    width: 80vw;
    height: 80vh;
    display: flex;
    flex-direction: column;
    color: #515a6e;
    .popupTitleClass {
      font-size: 20px;
      line-height: 30px;
      text-align: center;
      background-color: #079bef37;
      margin-bottom: 10px;
    }
    .loadingContainer {
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .popupContentClass {
      padding: 10px;
      flex: 1;
      overflow-y: scroll;
      scroll-behavior: smooth; /* 平滑滚动效果 */
      font-size: 16px;
      .firstLevel {
        font-weight: 700;
        margin-bottom: 5px;
      }
      .secondLevel {
        padding-left: 2ch;
        padding-bottom: 10px;
      }
    }
    .popupFootClass {
      padding-top: 10px;
      border-top: 1px solid #eee;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
}
</style>