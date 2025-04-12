import * as VueRouter from "vue-router";
import Home from "./components/Home.vue";
import ABubbelChart from "./components/ABubbelChart.vue";

const routes = [
  { path: "/", component: Home },
  { path: "/ABubbelChart", component: ABubbelChart },
];
export const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes,
});
