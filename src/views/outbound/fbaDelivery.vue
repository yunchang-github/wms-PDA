<template>
    <div class="page2">
      <div style="dispaly:felx;">
        <van-icon name="home-o" class="goHome" @click="goHome" />
        <van-icon name="arrow-left" class="arrow" @click="goPrev" />
        <span class="ycphone-title">
          {{ languageType == "Chinese" ? "扫描配货单号" : "Scan box number" }}
        </span>
      </div>
      <input
        id="input"
        type="text"
        :placeholder="
          languageType == 'Chinese' ? '扫描配货单号' : 'Scan box number'
        "
        class="inputStyle"
        v-model="allocationCargoNo"
        @keyup.enter="goNext"
        style="margin-top:30px;"
      />
    </div>
  </template>
  
  <script>
  import { Toast } from "vant";
  import {
    getPhoneAllocationDetail,
    getAllocationOperationSign
  } from "@/api/outbound/fbaDelivery.js";
  import mp3 from "@/assets/9675.mp3";
  export default {
    data() {
      return {
        allocationCargoNo: "",
        tableData: [],
        myMp3: mp3,
        languageType: ""
      };
    },
    methods: {
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
      goHome() {
        this.$router.push({ name: "Home" });
      },
      goPrev() {
        //返回上一页
        // this.$router.go(-1);
        this.$router.push({ name: "Home" });
      },
      goNext() {
        if (this.allocationCargoNo.trim().length > 0) {
          // 请求数据显示在table中
          let that = this;
          let _data = {
            allocationCargoNo: this.allocationCargoNo.trim()
          };
          localStorage.removeItem("allocationCargoTable");
          getPhoneAllocationDetail(_data)
            .then(res => {
              if (res.code == 200) {
                if (res.data.length > 0) {
                  res.data.forEach(item => {
                    // 处理数据是否相等  {{ item.totalNum }}/{{ item.processedNum }}
                    if (item.totalNum == item.processedNum) {
                      item.isRed = true;
                    } else {
                      item.isRed = false;
                    }
                  });
                  localStorage.setItem(
                    "allocationCargoTable",
                    JSON.stringify(res.data)
                  );
                  // 添加提示音
                  that.play();
                  // 处理是否需要提示的接口
                  getAllocationOperationSign(_data).then(result => {
                    if (result.data) {
                      localStorage.setItem(
                        "handleTip",
                        JSON.stringify(result.data)
                      );
                    } else {
                      localStorage.setItem("handleTip", "");
                    }
                  });
                  // 跳转
                  that.$router.push({
                    name: "BoxNo",
                    query: { allocationCargoNo: this.allocationCargoNo.trim() }
                  });
                } else {
                  localStorage.setItem(
                    "allocationCargoTable",
                    JSON.stringify([])
                  );
                  let tip =
                    this.languageType == "Chinese"
                      ? "无效配货单!"
                      : "Invalid distribution order!";
                  Toast(tip);
                }
              }
            })
            .catch(error => {
              // Toast(error.response.data.error_description)
            });
        } else {
          let tip =
            this.languageType == "Chinese"
              ? "配货单号不能为空!"
              : "Input can not be empty!";
          Toast(tip);
        }
      }
    },
    created() {
      this.languageType = localStorage.getItem("warehouseLanguage") || "Chinese";
    },
    mounted() {
      document.querySelector("#input").focus();
    }
  };
  </script>
  
  <style lang="scss">
  .page2 {
    padding: 5% 5% 0;
    .goHome {
      margin-right: 2%;
      font-size: 20px;
      line-height: 30px;
      color: rgb(85, 85, 87);
    }
    .arrow {
      margin-right: 5%;
      font-size: 18px;
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
  }
  </style>
  