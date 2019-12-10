// 入口文件
import Vue from 'vue'
import App from './App.vue'
import router from './router/index.js'
import './plugins/element.js'
import './assets/css/global.css'
import './assets/fonts/iconfont.css'
import TreeTable from 'vue-table-with-tree-grid'
// 导入axios以发送ajax请求
import axios from 'axios'
// 导入vue-quill-editor（富文本编辑器）
import VueQuillEditor from 'vue-quill-editor'
// 导入vue-quill-editor的样式
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
// 导入进度条插件
import nprogress from 'nprogress'
// 导入进度条样式
import 'nprogress/nprogress.css'
// 全局注册富文本组件
Vue.use(VueQuillEditor)
// 挂载axios
Vue.prototype.$http = axios
// 设置请求的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'

axios.interceptors.request.use(config => {
  // 当进入request拦截器，表示发送了请求，我们就开启进度条
  nprogress.start()
  // 为请求头对象，添加token验证的Authorization字段
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
// 在response拦截器中，隐藏进度条
axios.interceptors.response.use(config => {
  // 当进入response拦截器，表示请求已经结束，我们就结束进度条
  nprogress.done()
  return config
})
Vue.config.productionTip = false
// 全局注册组件
Vue.component('tree-table', TreeTable)

// 时间格式化
Vue.filter('dateFormat', v => {
  let date = new Date(v)

  let y = date.getFullYear() + ''
  let m = (date.getMonth() + 1 + '').padStart(2, '0')
  let d = (date.getDate() + '').padStart(2, '0')

  let hh = (date.getHours() + '').padStart(2, '0')
  let mm = (date.getMinutes() + '').padStart(2, '0')
  let ss = (date.getSeconds() + '').padStart(2, '0')

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})
new Vue({
  // data: {
  //   path: ''
  // },
  // watch: {
  //   $route(to, from) {
  //     this.path = to.path
  //   }
  // },
  // //  popstate 浏览器返回事件
  // mounted() {
  //   window.addEventListener(
  //     'popstate',
  //     () => {
  //       // 设置这个 activePath  能记录自己的走向 返回会自动打开上一次的路径
  //       // 改当前路径
  //       window.sessionStorage.setItem('activePath', this.path)
  //       window.location.reload()
  //     },
  //     false
  //   )
  // },
  router,
  render: h => h(App)
}).$mount('#app')
