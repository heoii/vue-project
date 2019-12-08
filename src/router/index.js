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
// 导入权限管理页面
import Rights from '../components/Rights.vue'
// 导入角色列表
import Roles from '../components/Roles.vue'
// 导入商品分类
import Cate from '../components/goods/Cate.vue'
// 导入商品参数
import Params from '../components/goods/Params.vue'
// 导入商品列表
import GoodList from '../components/goods/List.vue'
// 添加商品页面
import GoodAdd from '../components/goods/Add.vue'
// 订单页面
import Order from '../components/order/Order.vue'

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
        },
        {
          path: '/rights',
          component: Rights
        },
        {
          path: '/roles',
          component: Roles
        },
        {
          path: '/categories',
          component: Cate
        },
        {
          path: '/params',
          component: Params
        },
        {
          path: '/goods',
          component: GoodList
        },
        {
          path: '/goods/add',
          component: GoodAdd
        },
        {
          path: '/orders',
          component: Order
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
