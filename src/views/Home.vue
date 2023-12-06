<template>
  <div id="homePage">
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
import { selPageList as selWarehouseList } from "@/api/overseasWarehouse/warehouseInfoManager";
// import { getInfo } from "@/api/index";
import { Toast } from "vant";
export default {
  data() {
    return {
      showPicker: false,
      warehouseId: 1,
      warehouseName: "美西海外仓",
      defaultIndex: 0,
      warehouseOptions: [],
      mainPageList: [
        {
          title: "INBOUND",
          titleZn: "入库",
          color: "#409eff",
          list: [
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
            {
              label: "SKU  <br> Putaway",
              labelZn: "按件上架",
              pageName: "AllPutawayPage",
              query: {
                pageFlag: "sku",
              },
            },
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
            {
              label: "Location <br> Check",
              labelZn: "库位盘点",
              pageName: "InventoryBylocation",
            },
            {},
            {},
            {
              label: "Location <br> Shift",
              labelZn: "货位合并",
              pageName: "AllShiftPage",
              query: {
                pageFlag: "pallet",
              },
            },
            {
              label: "BoxNO. <br> Shift",
              labelZn: "箱货移位",
              pageName: "AllShiftPage",
              query: {
                pageFlag: "box",
              },
            },
            {
              label: "SKU <br> Shift",
              labelZn: "散货移位",
              pageName: "AllShiftPage",
              query: {
                pageFlag: "sku",
              },
            },
          ],
        },
      ],
    };
  },
  methods: {
    onConfirm(value) {
      this.warehouseName = value.text;
      this.warehouseId = value.id;
      this.showPicker = false;
    },
    goOtherPage(labelItem) {
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
      let index = this.warehouseOptions.findIndex(
        (item) => this.warehouseName === item.text
      );
      this.defaultIndex = index;
    },
  },
  created() {
    this.getWarehouseOptions();
    // getInfo().then((res) => {
    //   console.log("测试", res);
    // });
  },
  mounted() {},
};
</script>

<style lang="scss" scoped>
#homePage {
  height: 100vh;
  width: 100vw;
  background-color: #e5e5e5;
  font-size: 16px;
  .homeContainter {
    padding: 20px;
    height: calc(100%-40px);
    .titleContainer {
      margin-bottom: 20px;
      .titleClass {
        border-left: 4px solid #409eff;
        padding-left: 20px;
        font-size: 20px;
      }
      .vanRowClass {
        display: flex;
        justify-content: space-between;
        flex-wrap: wrap;
        margin: 20px 0;
        .vanColClass {
          flex: 0 0 32%;
          margin-bottom: 15px;
          .vanColDivClass {
            background-color: #fff;
            padding: 15px;
            text-align: center;
          }
        }
      }
    }
  }
}
</style>
