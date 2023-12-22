<template>
  <div id="scanPickFBA">
    <van-nav-bar title="Picking scanning">
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
        <!-- 拣货单号 -->
        <van-cell-group>
          <van-field
            ref="focusInputRef1"
            v-model.trim="pickingListNumber"
            label="Picking Number"
            label-width="100px"
            placeholder="Click to type Picking Number"
            @keydown.enter="pickingListNumberEnter"
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
          <div class="tableClass tableHeadClass">
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
          <div class="scrollbarClass">
            <div class="tableClass" style="border-top: none">
              <table rules="cols" style="width: 100%">
                <tbody>
                  <template v-if="pTableData.length === 0 && !loading">
                    <tr :style="{ height: listContainerHeight }">
                      <td :colspan="searchTableColumns.length" align="center">
                        暂无数据
                      </td>
                    </tr>
                  </template>
                  <template v-else>
                    <tr
                      v-for="(option, index) in pTableData"
                      :key="index"
                      @click="pPickingListNumberClick(option)"
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
  </div>
</template>

<script>
import { selPageList } from "@/api/overseasWarehouse/pickingListOrder";
export default {
  data() {
    let that = this;
    return {
      query: that.$route.query,
      listContainerHeight: 0,
      readonly1: false,
      autoFocus: false,
      pickingListNumber: "",
      loading: false,
      pTableData: [],
      searchTableColumns: [
        {
          label: "拣货单号",
          prop: "pickingListNumber",
        },
      ],
    };
  },
  created() {
    this.getMainTable();
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
    pPickingListNumberClick(row) {
      this.pickingListNumber = row.pickingListNumber;
      this.pickingListNumberEnter();
    },
    pickingListNumberEnter() {
      this.$router.push({
        name: "scanBoxNo",
        query: {
          warehouseId: this.query.warehouseId,
          warehouseName: this.query.warehouseName,
          pickingListNumber: this.pickingListNumber,
        },
      });
    },
    async getMainTable() {
      this.loading = true;
      const params = {
        pageSize: 99999,
        pageNum: 1,
        businessType: 1, //FBA
        pickingListStatus: "2", //拣货中
        warehouseIds: this.query.warehouseId,
      };
      const { data: res } = await selPageList(params);
      this.pTableData = res.records;
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
    });
  },
};
</script>

<style lang="scss" scoped>
#scanPickFBA {
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
      box-sizing: border-box;
      padding: 20px 60px;
      display: flex;
      flex-direction: column;
      .loadingContainer {
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .tableHeadClass {
        height: auto;
      }
      .scrollbarClass {
        flex: 1;
        overflow-y: scroll;
        scroll-behavior: smooth; /* 平滑滚动效果 */
      }
      .tableClass {
        border: 1px solid #e6ebf5;
        border-bottom: none;
        table {
          table-layout: fixed;
          color: #515a6e;
          border-bottom: 1px solid #e6ebf5;
        }
        thead {
          th {
            padding: 10px 8px;
            font-size: 15px;
            text-align: center;
            border: 1px solid #e6ebf5; /* 设置边框 */
            word-wrap: break-word;
          }
        }
        tbody {
          td {
            padding: 10px 8px;
            text-align: center;
            font-size: 15px;
            border: 1px solid #e6ebf5; /* 设置边框 */
            word-wrap: break-word;
          }
        }
      }
    }
  }
}
</style>