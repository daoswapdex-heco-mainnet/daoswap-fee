import Vue from "vue";
import VueRouter from "vue-router";
import CommunityRewardsApproveUSDTDAO from "../views/CommunityRewardsApproveUSDTDAO.vue";
import CommunityRewardsApproveUSDTHFIL from "../views/CommunityRewardsApproveUSDTHFIL.vue";
import CommunityRewardsApproveUSDTETH from "../views/CommunityRewardsApproveUSDTETH.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    component: () => import("@/layouts/home/Index.vue"),
    children: [
      {
        path: "",
        name: "Home",
        redirect: "/usdt-dao",
        component: () => import("@/views/home/Index.vue")
      },
      {
        path: "/usdt-dao",
        name: "RewardsUSDTDAO",
        component: CommunityRewardsApproveUSDTDAO
      },
      {
        path: "/usdt-hfil",
        name: "RewardsUSDTHFIL",
        component: CommunityRewardsApproveUSDTHFIL
      },
      {
        path: "/usdt-eth",
        name: "RewardsUSDTETH",
        component: CommunityRewardsApproveUSDTETH
      },
      {
        path: "/404",
        component: () => import("@/views/404.vue")
      },
      {
        path: "*",
        redirect: "/404"
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
