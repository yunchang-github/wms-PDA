<template>
  <div class="page4" id="page4">
    <div style="dispaly: felx">
      <van-icon name="home-o" class="goHome" @click="goHome" />
      <van-icon name="arrow-left" class="arrow" @click="goPrev" />
      <span class="ycphone-title">{{ pageObj.scanBoxNumber }}</span>
      <van-button
        type="primary"
        size="small"
        style="float: right"
        @click="saveMainTable"
        >{{ pageObj.save }}</van-button
      >
    </div>
    <p class="fontS">
      {{ pageObj.distributionOrder }}:{{ handleAllocationCargoNo[0]
      }}<span class="bigFontS">{{ handleAllocationCargoNo[1] }}</span
      >{{ handleAllocationCargoNo[2]
      }}<span class="bigFontS">{{ handleAllocationCargoNo[3] }}</span>
    </p>
    <input
      type="text"
      id="input1"
      :placeholder="pageObj.scanBoxNumber"
      class="inputStyle"
      v-model="boxNo"
      @keyup.enter="lastSubmit"
    />
    <div class="preBoxNo">
      <p>{{ pageObj.BoxNumberOfTheLastScan }}:{{ preBoxNo }}</p>
      <p>{{ pageObj.BoxNo }}:{{ preBoxId }}</p>
      <p>
        <span
          >{{ pageObj.quantityProcessed }}: <b>{{ preProcessedNum }}</b>
        </span>
        <span style="margin-left: 10px"
          >{{ pageObj.unprocessedQuantity }}: <b>{{ preUnprocessedNum }}</b>
        </span>
      </p>
    </div>
    <div class="tableData" id="tableData">
      <div class="tableData-ul">
        <table cellspacing="0" cellpadding="5">
          <tr class="fixedStyle">
            <th>{{ pageObj.serialNumber }}</th>
            <th>{{ pageObj.location }}</th>
            <th>{{ pageObj.caseNumber }}</th>
            <th>{{ pageObj.totalAndProcessed }}</th>
          </tr>
          <tbody class="yctbody" id="yctbody">
            <tr v-for="(item, index) in tableData" :key="index">
              <td>
                <span :style="{ color: item.isRed ? '#993366' : '#333' }">{{
                  index + 1
                }}</span>
              </td>
              <td>
                <span :style="{ color: item.isRed ? '#993366' : '#333' }">{{
                  item.warehouseLocation
                }}</span>
              </td>
              <td>
                <span :style="{ color: item.isRed ? '#993366' : '#333' }">{{
                  item.boxId
                }}</span>
              </td>
              <td>
                <span
                  :style="{ color: item.isRed ? '#993366' : '#333' }"
                  @click="getProcessedNum(item)"
                  >{{ item.totalNum }}/{{ item.processedNum }}</span
                >
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <van-dialog
      v-model="show"
      :title="pageObj.addInformation"
      show-cancel-button
      @confirm="onSubmit"
      :confirmButtonText="confirmButtonText"
      :cancelButtonText="cancelButtonText"
    >
      <van-form>
        <van-field
          v-model="formInfo.boxWeight"
          name="validator"
          :label="pageObj.weight"
          :placeholder="pageObj.weightMax"
          :rules="[{ validator, message: pageObj.weightTip }]"
        />
        <van-field
          v-model="formInfo.boxLong"
          name="validator1"
          :label="pageObj.length"
          :placeholder="pageObj.maximumLength"
          :rules="[{ validator: validator1, message: pageObj.lengthTip }]"
        />
        <van-field
          v-model="formInfo.boxWide"
          name="validator1"
          :label="pageObj.width"
          :placeholder="pageObj.maximumWidth"
          :rules="[{ validator: validator1, message: pageObj.widthTip }]"
        />
        <van-field
          v-model="formInfo.boxHeight"
          name="validator1"
          :label="pageObj.high"
          :placeholder="pageObj.maximumHigh"
          :rules="[{ validator: validator1, message: pageObj.highTip }]"
        />
      </van-form>
    </van-dialog>
    <van-dialog
      v-model="targetShow"
      :title="targetTitle"
      :confirmButtonText="confirmButtonText"
    >
      <p
        v-for="(item, index) in targetArr"
        :key="index"
        style="padding: 0; margin: 0 4px; text-align: center"
      >
        {{ item }}
      </p>
    </van-dialog>
    <div class="showGoTop">
      <span
        >{{ pageObj.numberOfBoxesProcessed }}: <b>{{ processedNum }}</b></span
      >
      <span
        >{{ pageObj.NumberOfUnprocessedBoxes }}:
        <b>{{ unprocessedNum }}</b></span
      >
      <div class="goTop" @click="goTop">
        <van-icon name="back-top" />
      </div>
    </div>

    <van-overlay :show="loading">
      <div class="wrapper" @click.stop>
        <van-loading type="spinner" style="color: #fff" />
      </div>
    </van-overlay>
  </div>
</template>

<script>
import {
  scanBoxNo,
  selectByCargoDetail,
  mainComplete,
  getAllocationDisposeNum,
  getBoxNoByAllocationCargoNoAndBoxId,
  getPhoneAllocationDetail,
  getAllocationDisposeNumByBoxNo
} from "@/api/index.js";
import { Toast } from "vant";
import mp3 from "@/assets/s490.mp3";
export default {
  data() {
    return {
      targetTitle: "",
      targetShow: false,
      targetArr: [],
      myMp3: mp3,
      allocationCargoNo: "",
      handleAllocationCargoNo: [],
      boxNo: "",
      tableData: [],
      show: false,
      formInfo: {
        boxWeight: "",
        boxLong: "",
        boxWide: "",
        boxHeight: ""
      }, // 添加信息的表单'
      saveTableData: [], // 批量填写尺寸table
      saveDialogVisible: true, //批量填写尺寸弹框
      loading: false,
      finished: false,
      currentValue: "",
      currentRow: {}, // 当前点击的数据
      showInputBox: false,
      inputType: "weight", // 填写的是什么
      boxWeightVal: "",
      boxLongVal: "",
      boxWideVal: "",
      boxHeightVal: "",
      searchBarFixed: false,
      tempTableData: [], // 临时存放的table数据
      processedNum: "",
      unprocessedNum: "",
      preBoxNo: "", // 上一次的数据
      preBoxId: "",
      preProcessedNum: "",
      preUnprocessedNum: "",
      preBoxNoArr: [], // 临时存放的数据
      confirmButtonText: "确认",
      cancelButtonText: "取消",
      pageObj: {
        scanBoxNumber: "扫描箱子编号",
        save: "保存",
        distributionOrder: "配货单号",
        BoxNumberOfTheLastScan: "上一条扫描的箱号",
        BoxNo: "箱子编号",
        quantityProcessed: "已处理数量",
        unprocessedQuantity: "未处理数量",
        serialNumber: "序号",
        location: "库位",
        caseNumber: "箱号",
        totalAndProcessed: "总数/已处理数量",
        addInformation: "添加信息",
        weight: "重量(kg)",
        weightMax: "重量最大22",
        weightTip: "请正确填写重量(kg)",
        length: "长(cm)",
        maximumLength: "长最大63",
        lengthTip: "请正确填写长(cm)",
        width: "宽(cm)",
        maximumWidth: "宽最大63",
        widthTip: "请正确填写宽(cm)",
        high: "高(cm)",
        maximumHigh: "高最大63",
        highTip: "请正确填写高(cm)",
        numberOfBoxesProcessed: "已处理箱数",
        NumberOfUnprocessedBoxes: "未处理箱数",
        processedCaseNumberUnderAssociation: "关联下的已处理箱号",
        pleaseFillInTheDataCorrectly: "请正确填写数据!",
        thereIsCurrentlyNoDataToEdit: "当前没有要编辑的数据",
        operationSucceeded: "操作成功!",
        noBoxesWereHandled: "没有箱子被处理!"
      }
    };
  },
  methods: {
    // 获取已处理的箱子号
    getProcessedNum(item) {
      let that = this;
      getBoxNoByAllocationCargoNoAndBoxId({
        allocationCargoNo: this.allocationCargoNo,
        boxId: item.boxId
      }).then(res => {
        if (res.data.length > 0) {
          that.targetArr = res.data;
        }
        that.targetTitle =
          item.boxId + this.pageObj.processedCaseNumberUnderAssociation;
        that.targetShow = true;
      });
    },
    play() {
      let audioNum = document.getElementsByClassName("audio");
      if (audioNum.length == 1) {
        let audio = document.getElementsByClassName("audio")[0];
        audio.play();
      } else {
        let audio = document.createElement("audio");
        audio.src = this.myMp3;
        audio.style.display = "none";
        audio.controls = true;
        document.body.append(audio);
        audio.play();
      }
    },
    // 回到顶部
    goTop() {
      // 处理表格中的数据回到顶部
      this.tableData = [];
      setTimeout(() => {
        this.tableData = [...this.tempTableData];
      }, 300);
    },
    validator(val) {
      if (/^([1-9]\d*(\.\d*)?)|(0\.\d*[1-9][0-9])|(0\.\d*[1-9])$/.test(val)) {
        return val <= 22;
      } else {
        return false;
      }
    },
    validator1(val) {
      if (/^([1-9]\d*(\.\d*)?)|(0\.\d*[1-9][0-9])|(0\.\d*[1-9])$/.test(val)) {
        return val <= 63;
      } else {
        return false;
      }
    },
    // 输入框提交
    inputSubmit() {
      // 验证数据 重量不能大于22 其他不能大于63
      if (this.inputType == "boxWeight") {
        if (this.validator(this.currentValue)) {
          this.currentRow[this.inputType] = this.currentValue;
          this.showInputBox = false;
        } else {
          Toast(this.pageObj.pleaseFillInTheDataCorrectly);
        }
      } else {
        if (this.validator1(this.currentValue)) {
          this.currentRow[this.inputType] = this.currentValue;
          this.showInputBox = false;
        } else {
          Toast(this.pageObj.pleaseFillInTheDataCorrectly);
        }
      }
    },
    // 获取 批量数据
    onLoad() {
      this.loading = false;
      this.finished = true;
    },
    // 批量填写长宽高
    batchHandleDialogMoreEdit(value) {
      if (this.saveTableData.length === 0) {
        this.$globalFun.warnMsg(this.pageobj.thereIsCurrentlyNoDataToEdit);
        return;
      }
      // 验证数据是否超过最大值
      if (value === "boxWeight") {
        if (this.validator(this[`${value}Val`])) {
          this.saveTableData.forEach(item => {
            item[value] = this[`${value}Val`];
          });
        } else {
          Toast(this.pageObj.pleaseFillInTheDataCorrectly);
        }
      } else {
        if (this.validator1(this[`${value}Val`])) {
          this.saveTableData.forEach(item => {
            item[value] = this[`${value}Val`];
          });
        } else {
          Toast(this.pageObj.pleaseFillInTheDataCorrectly);
        }
      }
    },
    goHome() {
      this.$router.push({ name: "Home" });
    },
    goPrev() {
      //返回上一页
      // this.$router.go(-1);
      localStorage.removeItem("allocationCargoTable");
      this.$router.push({ name: "DistributionList" });
    },
    async lastSubmit() {
      let that = this;
      if (this.boxNo.trim().length > 0) {
        // 处理箱号
        // 获取配货单下的最新数据
        that.preBoxNoArr.push(this.boxNo.trim());
        let _data = {
          allocationCargoNo: that.allocationCargoNo,
          boxNo: that.boxNo.trim()
        };
        await scanBoxNo(_data).then(res => {
          if (!res.data) {
            Toast(this.pageObj.operationSucceeded);
            that.play();
            that.boxNo = "";
          } else if (res.data == "notMeasured") {
            that.show = true;
            that.boxWeight = "";
            that.boxLong = "";
            that.boxWide = "";
            that.boxHeight = "";
          }
        });
        if (that.preBoxNoArr.length > 1) {
          // 获取上一个箱号 已扫描的箱子
          that.preBoxNo = that.preBoxNoArr[that.preBoxNoArr.length - 2];
          getAllocationDisposeNumByBoxNo({
            allocationCargoNo: that.allocationCargoNo,
            boxNo: that.preBoxNo
          }).then(res => {
            if (res.data) {
              that.preBoxId = res.data.boxId;
              that.preProcessedNum = res.data.processedNum;
              that.preUnprocessedNum = res.data.unprocessedNum;
            }
          });
        }
        that.getBottomData();
        that.getTableData();
      } else {
        let tip =
          this.languageType == "Chinese"
            ? "箱子编号不能为空!"
            : "Input can not be empty!";
        Toast(tip);
      }
    },
    getBottomData() {
      let that = this;
      getAllocationDisposeNum({
        allocationCargoNo: that.allocationCargoNo
      }).then(res => {
        if (res.code == 200) {
          if (res.data) {
            that.processedNum = res.data.processedNum;
            that.unprocessedNum = res.data.unprocessedNum;
          }
        }
      });
    },
    closeInput() {
      this.currentValue = "";
      this.showInputBox = false;
    },
    scanBoxNoFun(_data) {
      let that = this;
      scanBoxNo(_data).then(res => {
        if (!res.data) {
          Toast(this.pageObj.operationSucceeded);
          that.play();
          that.boxWeight = "";
          that.boxLong = "";
          that.boxWide = "";
          that.boxHeight = "";
        } else if (res.data == "notMeasured") {
          that.show = true;
          that.boxWeight = "";
          that.boxLong = "";
          that.boxWide = "";
          that.boxHeight = "";
        }
        that.boxNo = "";
      });
    },
    // 提交表单信息
    onSubmit() {
      let that = this;
      let _data = {
        allocationCargoNo: that.allocationCargoNo,
        boxNo: that.boxNo.trim(),
        ...this.formInfo
      };
      that.scanBoxNoFun(_data);
    },
    getTableData() {
      let that = this;
      getPhoneAllocationDetail({
        allocationCargoNo: that.allocationCargoNo
      }).then(res => {
        if (res.data) {
          res.data.forEach(item => {
            // 处理数据是否相等  {{ item.totalNum }}/{{ item.processedNum }}
            if (item.totalNum == item.processedNum) {
              item.isRed = true;
            } else {
              item.isRed = false;
            }
          });
          that.tableData = res.data;
          that.tempTableData = JSON.parse(JSON.stringify(res.data));
        }
      });
    },
    // 完成
    saveMainTable() {
      let temp = JSON.parse(JSON.stringify(this.tableData));
      // 已处理数据全部为0 不能点击完成
      let flag = temp.every(item => {
        return item.processedNum == 0;
      });
      if (!flag) {
        this.handleSaveFun(temp);
      } else {
        Toast(this.pageObj.noBoxesWereHandled);
      }
    },
    async handleSaveFun(temp) {
      // 判断table中的数据拆箱状态在已确认的情况下是否全部是1  调接口清空页面
      // 先过滤掉 待处理和拆箱状态为2的数据  其他的数据再处理
      // let tableArr = temp.filter(item => {
      //   return item.isChangeBox == "2" && item.disposeStatus == 1;
      // });
      // let statusFlag = tableArr.every(item => {
      //   return item.isChangeBox == "1";
      // });
      // if (statusFlag) {
      //   let _data = {
      //     wlWarehouseBoxInfoList: [],
      //     wlWarehouseAllocationCargoDetailVOList: this.tableData
      //   };
      //   this.lastSaveFun(_data);
      // } else {
      let arr = [];
      await selectByCargoDetail({
        allocationCargoNo: this.allocationCargoNo.trim()
      }).then(res => {
        arr = res.data;
      });
      let _data = {
        wlWarehouseBoxInfoList: [],
        wlWarehouseAllocationCargoDetailVOList: arr
      };
      this.lastSaveFun(_data);
      // }
    },
    lastSaveFun(_data) {
      let that = this;
      that.loading = true;
      mainComplete(_data)
        .then(() => {
          that.allocationCargoNo = "";
          that.boxNo = "";
          Toast(this.pageObj.operationSucceeded);
          that.tableData = [];
          that.loading = false;
          that.goPrev();
        })
        .catch(error => {
          that.loading = false;
        });
    }
  },
  created() {
    this.allocationCargoNo = this.$route.query.allocationCargoNo;
    this.handleAllocationCargoNo = [
      this.allocationCargoNo.substring(0, 6),
      this.allocationCargoNo.substring(6, 8),
      this.allocationCargoNo.substring(8, this.allocationCargoNo.length - 3),
      this.allocationCargoNo.slice(-3)
    ];
    this.tempTableData = JSON.parse(
      localStorage.getItem("allocationCargoTable")
    );
    let handleTip = "";
    if (
      localStorage.getItem("handleTip") &&
      localStorage.getItem("handleTip").length > 0
    ) {
      handleTip = JSON.parse(localStorage.getItem("handleTip"));
    }
    if (handleTip && handleTip.length > 0) {
      Toast(handleTip);
      setTimeout(() => {
        localStorage.removeItem("handleTip");
      });
    }
    this.tableData = this.tempTableData;
    this.getBottomData();
    // 处理文字
    this.languageType = localStorage.getItem("warehouseLanguage") || "Chinese";
    this.confirmButtonText =
      this.languageType == "Chinese" ? "确认" : "confirm";
    this.cancelButtonText = this.languageType == "Chinese" ? "取消" : "cancel";
    if (this.languageType == "English") {
      this.pageObj = {
        scanBoxNumber: "scan box number",
        save: "save",
        distributionOrder: "distribution order number",
        BoxNumberOfTheLastScan: "case number of the last scan",
        BoxNo: "case number",
        quantityProcessed: "quantity processed",
        unprocessedQuantity: "unprocessed quantity",
        serialNumber: "serial number",
        location: "location",
        caseNumber: "case number",
        totalAndProcessed: "total / processed quantity",
        addInformation: "add information",
        weight: "weight (kg)",
        weightMax: "maximum 22",
        weightTip: "please fill in the weight correctly (kg)",
        length: "length (CM)",
        maximumLength: "maximum 63",
        lengthTip: "please fill in the length correctly (CM)",
        width: "width (CM)",
        maximumWidth: "maximum width 63",
        widthTip: "please fill in the width correctly (CM)",
        high: "height (CM)",
        maximumHigh: "maximum 63",
        highTip: "please fill in the height correctly (CM)",
        numberOfBoxesProcessed: "processed",
        NumberOfUnprocessedBoxes: "unprocessed boxes",
        processedCaseNumberUnderAssociation:
          "Processed case number under Association",
        pleaseFillInTheDataCorrectly: "Please fill in the data correctly!",
        thereIsCurrentlyNoDataToEdit: "There is currently no data to edit",
        operationSucceeded: "Operation succeeded!",
        noBoxesWereHandled: "No boxes were handled!"
      };
    }
  },

  mounted() {
    document.querySelector("#input1").focus();
    // window.addEventListener("scroll", this.handleScroll);
  },
  destroyed() {
    // window.removeEventListener("scroll", this.handleScroll);
  }
};
</script>

<style lang="scss" scoped>
.page4 {
  padding: 5% 5% 0;
  .goHome {
    margin-right: 2%;
    font-size: 20px;
    line-height: 30px;
    color: rgb(85, 85, 87);
  }
  .wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .arrow {
    margin-right: 5%;
    font-size: 18px;
  }
  .fontS {
    font-size: 20px;
    margin: 0.25rem 0;
  }
  .bigFontS {
    font-size: 22px;
    font-weight: bold;
    margin: 0;
    padding: 0;
  }
  .tempBox {
    height: 55vh;
    overflow-y: auto;
    .fontStyle {
      padding: 0;
      margin: 0;
      margin-bottom: 5px;
      font-size: 18px;
    }
  }
  .inputStyle {
    height: 30px;
    font-size: 20px;
    width: calc(100vw - 12%);
  }
  .ycphone-title {
    text-align: center;
    font-size: 24px;
  }
  .preBoxNo {
    font-size: 16px;
    p {
      padding: 0;
      margin: 0;
    }
  }
  .tableData {
    margin-top: 0.125rem;
    // height:75vh;
    height: calc(100vh - 7rem);
    overflow-x: auto;
    background-color: #fff;
    .tableData-ul {
      background-color: #fff;
      border-left: 1px solid #eaf2fc;
      border-bottom: 1px solid #eaf2fc;
      // .fixedStyle{
      //   width:100%;
      //   th{
      //     width:25%;
      //   }
      // }
    }
  }
  .showGoTop {
    position: fixed;
    right: 10px;
    bottom: 10px;
    z-index: 999;
    width: 100%;
    padding: 0 15px;
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    span {
      font-size: 16px;
      line-height: 36px;
    }
  }
  .goTop {
    color: #fff;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    font-size: 24px;
    text-align: center;
    line-height: 46px;
    cursor: pointer;
    background-color: rgba(0, 0, 0, 0.4);
  }
  table {
    border-collapse: collapse;
    border-top: 1px solid #eaf2fc;
    width: 100%;
    th,
    td {
      padding: 5px;
      font-size: 12px;
      line-height: 17px;
      text-align: center;
      padding: 9px 14px 8px;
      border-top: 1px solid #eaf2fc;
      border-right: 1px solid #eaf2fc;
    }
    th {
      background-color: #eaf2fc;
      position: sticky;
      // position: relative;
      top: 0px;
    }
    td {
      background-color: #fff;
    }

    // td:first-child{
    //     background-color: #fff;
    //     position: sticky;
    //     left:0px;
    // 		z-index: 1;
    // }
    // th:first-child{
    //     position: sticky;
    //     left:0px;
    // 		z-index: 1;
    // }
  }
  .table-body {
    overflow-y: scroll;
    scroll-behavior: smooth; /* 平滑滚动效果 */
  }
  .yctbody,
  .fixedStyle {
    td {
      padding: 2px;
      margin: 0;
    }
  }
  .wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
  }

  .block {
    position: relative;
    width: 92%;
    height: 80%;
    background-color: #fff;
    border-radius: 0.25rem;
    .batchInputBox {
      display: flex;
      padding: 0 0.125rem;
      font-size: 0.6rem;
      input {
        width: 86%;
        margin-top: 0.125rem;
        padding-left: 0.125rem;
      }
    }
    .tableHeadList {
      > span {
        display: inline-block;
        font-size: 0.45rem;
        text-align: center;
      }
    }
    .tableList {
      > span {
        display: inline-block;
        text-align: right;
      }
    }
    .tableContainer {
      height: 65%;
      overflow-y: scroll;
      scroll-behavior: smooth; /* 平滑滚动效果 */
    }
    .bottomBtn {
      position: absolute;
      bottom: 0.125rem;
      width: 100%;
      text-align: center;
    }
    .inputBox {
      position: absolute;
      width: 100%;
      height: 100%;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 99;
      background-color: rgba(0, 0, 0, 0.3);
      input {
        height: 1rem;
        padding-left: 0.25rem;
        font-size: 0.8rem;
      }
      .inputClose {
        font-size: 0.5rem;
        text-align: center;
        padding-top: 0.125rem;
      }
    }
  }
}
</style>
