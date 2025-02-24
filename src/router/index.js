import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Login",
    component: resolve => require(["@/views/Login.vue"], resolve)
  },
  {
    path: "/login",
    redirect: '/',
    component: resolve => require(["@/views/Login.vue"], resolve)
  },
  {
    path: "/home",
    name: "Home",
    component: resolve => require(["@/views/Home.vue"], resolve)
  },
  // 大货签收
  {
    path: "/BoxNoSignPage",
    name: "BoxNoSignPage",
    component: resolve => require(["@/views/inbound/BoxNoSignPage.vue"], resolve)
  },
  // 所有上架页面
  {
    path: "/AllPutawayPage",
    name: "AllPutawayPage",
    component: resolve => require(["@/views/inbound/AllPutawayPage.vue"], resolve)
  },
  // 盘点
  {
    path: "/InventoryCheckPage",
    name: "InventoryCheckPage",
    component: resolve => require(["@/views/inventory/InventoryCheckPage.vue"], resolve)
  },
  // 所有转移页面
  {
    path: "/AllShiftPage",
    name: "AllShiftPage",
    component: resolve => require(["@/views/translocation/AllShiftPage.vue"], resolve)
  },
  // 指定箱子转移页面
  {
    path: "/specifyBoxShift",
    name: "specifyBoxShift",
    component: resolve => require(["@/views/translocation/specifyBoxShift.vue"], resolve)
    // FBA发货
  },
  {
    path: "/fbaDelivery",
    name: "fbaDelivery",
    component: resolve => require(["@/views/outbound/fbaDelivery.vue"], resolve)
  },
  // FBA扫描
  {
    path: "/scanPickFBA",
    name: "scanPickFBA",
    component: resolve => require(["@/views/pickingScanning/scanPickFBA.vue"], resolve)
  },
  // FBA-箱号扫描
  {
    path: "/scanBoxNo",
    name: "scanBoxNo",
    component: resolve => require(["@/views/pickingScanning/scanBoxNo.vue"], resolve)
  },
  // 拆箱
  {
    path: "/unboxing",
    name: "unboxing",
    component: resolve => require(["@/views/pickingScanning/unboxing.vue"], resolve)
  },
];

const router = new VueRouter({
  mode: "hash",
  base: process.env.BASE_URL,
  routes
});
const originalPush = VueRouter.prototype.push;
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err);
};
export default router;
