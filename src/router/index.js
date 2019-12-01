// 路由文件

// 导入vue插件
import Vue from 'vue'
// 导入路由插件
import VueRouter from 'vue-router'
// 导入登录组件
import Login from '../components/Login.vue'
// 导入后台主页组件
import Home from '../components/Home.vue'
// 导入登录成功后的欢迎页
import Welcome from '../components/Welcome.vue'
// 导入用户页面
import Users from '../components/Users.vue'

Vue.use(VueRouter)
const router = new VueRouter({
  routes: [
    // 登录路由
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    // 当到达后台主页时先到了其子路由 welcome 页面
    {
      path: '/home',
      component: Home,
      redirect: '/welcome',
      children: [
        {
          path: '/welcome',
          component: Welcome
        },
        {
          path: '/users',
          component: Users
        }
      ]
    }
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
