<template>
  <div id="homePage">
    <div>
      <van-nav-bar
        left-text="退出登录"
        right-text="刷新页面"
        @click-left="LogOut"
        @click-right="refleshPage"
      />
    </div>
    <div class="homeContainter">
      <!-- 仓库选择 -->
      <div style="margin-bottom: 20px">
        <van-field
          readonly
          clickable
          name="picker"
          v-model="warehouseName"
          label="Select warehouse"
          label-width="140px"
          placeholder="Please select"
          @click="showPicker = true"
          right-icon="arrow-down"
        />
        <van-popup v-model="showPicker" position="bottom">
          <van-picker
            ref="pickerRef"
            show-toolbar
            :default-index="defaultIndex"
            confirm-button-text="Confirm"
            cancel-button-text="Cancel"
            :columns="warehouseOptions"
            @confirm="onConfirm"
            @cancel="showPicker = false"
          />
        </van-popup>
      </div>
      <!-- 页面 -->
      <div
        class="titleContainer"
        v-for="(titleItem, tI) in mainPageList"
        :key="tI"
      >
        <div class="titleClass" :style="{ borderColor: titleItem.color }">
          {{ titleItem.title }}
        </div>
        <div class="vanRowClass">
          <div
            class="vanColClass"
            v-for="(labelItem, lI) in titleItem.list"
            :key="lI"
            :style="{ 'pointer-events': !labelItem.label ? 'none' : 'auto' }"
            @click.stop="goOtherPage(labelItem)"
          >
            <div
              v-if="labelItem.label"
              class="vanColDivClass"
              v-html="labelItem.label"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  selPageList as selWarehouseList,
  selWarehouseOperateLog,
  saveWarehouseOperateLog,
} from "@/api/overseasWarehouse/warehouseInfoManager";
import { Toast, Dialog } from "vant";
import Cookies from "js-cookie";
export default {
  data() {
    return {
      showPicker: false,
      warehouseId: "",
      warehouseName: "",
      defaultIndex: 0,
      warehouseOptions: [],
      mainPageList: [
        {
          title: "INBOUND",
          titleZn: "入库",
          color: "#409eff",
          list: [
            {
              label: "Box NO.<br> Sign",
              labelZn: "大货签收",
              pageName: "BoxNoSignPage",
              query: {},
            },
            {},
            {},
            {
              label: "Pallet <br> Putaway",
              labelZn: "按托上架",
              pageName: "AllPutawayPage",
              query: {
                pageFlag: "pallet",
              },
            },
            {
              label: "Box NO. <br> Putaway",
              labelZn: "按箱号上架",
              pageName: "AllPutawayPage",
              query: {
                pageFlag: "box",
              },
            },
            {},
            // {
            //   label: "SKU  <br> Putaway",
            //   labelZn: "按件上架",
            //   pageName: "AllPutawayPage",
            //   query: {
            //     pageFlag: "msku",
            //   },
            // },
          ],
        },
        {
          title: "STORAGE",
          titleZn: "库存管理",
          color: "#e6a23c",
          list: [
            // {
            //   label: "Check <br> List",
            //   labelZn: "盘点单",
            // },
            // {
            //   label: "Bulk cargo <br> Check",
            //   labelZn: "库位盘点",
            //   pageName: "InventoryCheckPage",
            // },
            // {},
            // {},
            {
              label: "Location <br> Shift",
              labelZn: "货位合并",
              pageName: "AllShiftPage",
              query: {
                pageFlag: "pallet",
              },
            },
            {
              label: "Specify Box <br> Shift",
              labelZn: "指定箱货移位",
              pageName: "specifyBoxShift",
              query: {
                pageFlag: "box",
              },
            },
            {},
            // {
            //   label: "BoxNO. <br> Shift",
            //   labelZn: "箱货移位",
            //   pageName: "AllShiftPage",
            //   query: {
            //     pageFlag: "box",
            //   },
            // },
            // {
            //   label: "SKU <br> Shift",
            //   labelZn: "散货移位",
            //   pageName: "AllShiftPage",
            //   query: {
            //     pageFlag: "msku",
            //   },
            // },
          ],
        },
        {
          title: "OUTBOUND",
          titleZn: "大货扫描",
          color: "#d642de",
          list: [
            {
              label: "Scanning of <br> bulk picking",
              labelZn: "FBA拣货扫描",
              pageName: "scanPickFBA",
            },
            {
              label: "Unpack <br>  Box",
              labelZn: "拆箱",
              pageName: "unboxing",
            },
            {},
          ],
        },
        // {
        //   title: "OUTBOUND",
        //   titleZn: "出库",
        //   color: "#00c297",
        //   list: [
        //     {
        //       label: "FBA <br> Delivery",
        //       labelZn: "发货-FBA-处理",
        //       pageName: "fbaDelivery",
        //     },
        //   ],
        // },
      ],
    };
  },
  async created() {
    await this.selWarehouseOperateLog();
    await this.getWarehouseOptions();
  },
  methods: {
    // 确认选择
    async onConfirm(value) {
      try {
        await saveWarehouseOperateLog({ warehouseId: value.id });
        this.warehouseName = value.text;
        this.warehouseId = value.id;
        this.showPicker = false;
        Toast.success({
          message: "Select success", //选择成功
          position: "top",
        });
      } catch (e) {
        console.log(e);
        this.warehouseName = "";
        this.warehouseId = "";
        this.defaultIndex = 0;
      }
    },
    // 去往其他页面
    goOtherPage(labelItem) {
      if (!this.warehouseName)
        return Toast.fail({
          message: "The warehouse not select", //数量为空
          position: "top",
        });
      if (labelItem.pageName) {
        Toast.clear();
        this.$router.push({
          name: labelItem.pageName,
          query: Object.assign(
            {
              warehouseId: this.warehouseId,
              warehouseName: this.warehouseName,
            },
            labelItem.query
          ),
        });
      } else {
        Toast({
          message: "Not yet developed!", //暂未开发
          position: "top",
        });
      }
    },
    // 查询pda用户选择看哪个仓库
    async selWarehouseOperateLog() {
      try {
        const { data: res } = await selWarehouseOperateLog();
        if (res) {
          this.warehouseId = res.warehouseId;
          this.warehouseName = res.warehouseName;
        }
      } catch (e) {
        console.log(e);
      } finally {
        this.warehouseLoading = false;
      }
    },
    async getWarehouseOptions() {
      const data = {
        pageNum: 1,
        pageSize: 9999,
      };
      const { data: res } = await selWarehouseList(data);
      this.warehouseOptions = res.list.map((item) => {
        return {
          id: item.id,
          text: item.warehouseName,
        };
      });
      // 是否初始有值
      if (this.warehouseName) {
        let index = this.warehouseOptions.findIndex(
          (item) => this.warehouseName === item.text
        );
        this.defaultIndex = index;
      } else {
        this.defaultIndex = 0;
      }
    },
    // 退出登录
    LogOut() {
      let that = this;
      Dialog.confirm({
        title: "提示",
        message: "确定注销并退出系统吗？",
      })
        .then(() => {
          Cookies.remove("wms-admin-Token");
          Cookies.remove("wms-admin-Expires-In");
          that.$router.push("/");
        })
        .catch((e) => {
          console.log(e);
        });
    },
    // 刷新页面
    refleshPage() {
      location.reload();
    },
  },
  mounted() {},
};
</script>

<style lang="scss" scoped>
#homePage {
  height: 100vh;
  width: 100vw;
  background-color: #f1f1f1;
  font-size: 16px;
  .homeContainter {
    padding: 10px 20px;
    height: calc(100%-40px);
    .titleContainer {
      margin-bottom: 10px;
      .titleClass {
        border-left: 4px solid #409eff;
        padding-left: 20px;
        font-size: 20px;
      }
      .vanRowClass {
        display: flex;
        justify-content: space-between;
        flex-wrap: wrap;
        margin-top: 20px;
        .vanColClass {
          flex: 0 0 32%;
          margin-bottom: 15px;
          .vanColDivClass {
            background-color: #fff;
            padding: 12px;
            font-size: 14px;
            text-align: center;
          }
        }
      }
    }
  }
}
</style>
