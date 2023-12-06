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
  {
    path: "/AllPutawayPage",
    name: "AllPutawayPage",
    component: resolve => require(["@/views/inbound/AllPutawayPage.vue"], resolve)
  },
  {
    path: "/BoxNoPutaway",
    name: "BoxNoPutaway",
    component: resolve => require(["@/views/inbound/BoxNoPutaway.vue"], resolve)
  },
  {
    path: "/InventoryBylocation",
    name: "InventoryBylocation",
    component: resolve => require(["@/views/inventory/InventoryBylocation.vue"], resolve)
  },
  {
    path: "/LocationMerge",
    name: "LocationMerge",
    component: resolve => require(["@/views/translocation/LocationMerge.vue"], resolve)
  },
  {
    path: "/BoxCargoShift",
    name: "BoxCargoShift",
    component: resolve => require(["@/views/translocation/BoxCargoShift.vue"], resolve)
  },
  {
    path: "/SkuCargoShift",
    name: "SkuCargoShift",
    component: resolve => require(["@/views/translocation/SkuCargoShift.vue"], resolve)
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
