// 路由文件

// 导入vue插件
import Vue from 'vue'
// 导入路由插件
import VueRouter from 'vue-router'
// 导入登录组件
import Login from '../components/Login.vue'
// 导入后台主页组件
import Home from '../components/Home.vue'

Vue.use(VueRouter)
const router = new VueRouter({
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    { path: '/home', component: Home }
  ]
})
// 挂载路由导航守卫
router.beforeEach((to, form, next) => {
// to表示将要访问的路径，from表示从哪里来，next是下一个要做的操作
  if (to.path === '/login') return next()
  // 读取sessionStorage中的token
  const tokenStr = window.sessionStorage.getItem('token')
  // 没有token 就返回登录页
  if (!tokenStr) return next('/login')
  next()
})
export default router
