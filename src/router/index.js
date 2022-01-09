import Vue from "vue";
import VueRouter from "vue-router";
import CommunityRewardsApprove from "../views/CommunityRewardsApprove.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    component: () => import("@/layouts/home/Index.vue"),
    children: [
      {
        path: "",
        name: "Rewards",
        component: CommunityRewardsApprove
      }
    ]
  }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  scrollBehavior: (to, from, savedPosition) => {
    if (to.hash) return { selector: to.hash };
    if (savedPosition) return savedPosition;

    return { x: 0, y: 0 };
  },
  routes
});

export default router;
