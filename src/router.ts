import { createRouter, createWebHistory } from 'vue-router'
import QuestListPage from './views/QuestList.vue'
import {baseURL} from "./ts/PathGeneration";

export default createRouter({
  history: createWebHistory(baseURL),
  routes: [
    {
      path: '/',
      name: 'questList',
      component: QuestListPage,
    },
    {
      path: '/quest/:questId',
      name: 'questDetail',
      component: () => import('./views/QuestDetail.vue'),
    },
    {
      path: "/admin",
      name: "adminPage",
      component: () => import("./views/Admin.vue")
    }
  ]
})
