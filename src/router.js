import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'

Vue.use(Router)

const r = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      redirect: '/welcome'
    },
    {
      path: '',
      component: Home,
      children: [
        {
          path: '/welcome',
          component: () => import('./views/Welcome.vue')
        },
        {
          path: '/users',
          component: () => import('./views/User.vue')
        },
        {
          path: '/roles',
          component: () => import('./views/Role.vue')
        },
        {
          path: '/user',
          component: () => import('./views/User.vue')
        },
        {
          path: '/rights',
          component: () => import('./views/Rithts.vue')
        },
        {
          path: '/orders',
          component: () => import('./views/Orders.vue')
        },
        {
          path: '/reports',
          component: () => import('./views/reports.vue')
        },
        {
          path: '/goods',
          component: () => import('./views/goods.vue')
        },
        {
          path: '/categories',
          component: () => import('./views/categories.vue')
        },
        {
          path: '/params',
          component: () => import('./views/params.vue')
        }
      ]
    },
    {
      path: '/login',
      component: () => import('./views/Login.vue')
    }
  ]
})


r.beforeEach((to, from, next) => {
  // /login 允许访问
  if (to.path == '/login') return next()
  // 取出令牌
  let token = sessionStorage.getItem('token')
  // 如果有令牌
  if (token) return next()
  else return next('/login')

})


export default r