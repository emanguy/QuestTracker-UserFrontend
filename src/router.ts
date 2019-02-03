import Vue from 'vue'
import Router from 'vue-router'
import QuestListPage from './views/QuestList.vue'

Vue.use(Router);

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'questList',
      component: QuestListPage
    },
    {
      path: '/quest/:questId',
      name: 'questDetail',
      component: () => import(/* webpackChunkName: "q-detail" */ './views/QuestDetail.vue')
    },
    {
      path: "/admin",
      name: "adminPage",
      component: () => import(/* webpackChunkName: "admin" */ "./views/Admin.vue")
    }
  ]
})
