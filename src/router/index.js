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
export default router
