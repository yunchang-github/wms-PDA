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
  // {
  //   path: "/SkuSeparationDetail",
  //   name: "skuSeparationDetail",
  //   component: resolve => require(["@/views/StockPage/SkuSeparationDetail.vue"], resolve)
  // },
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
