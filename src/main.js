// 入口文件
import Vue from 'vue'
import App from './App.vue'
import router from './router/index.js'
import './plugins/element.js'
import './assets/css/global.css'
import './assets/fonts/iconfont.css'
// 导入axios以发送ajax请求
import axios from 'axios'

// 设置请求的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 挂载axios
Vue.prototype.$http = axios

axios.interceptors.request.use(config => {
  // 为请求头对象，添加token验证的Authorization字段
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
Vue.config.productionTip = false

new Vue({
  data: {
    path: ''
  },
  //  popstate 浏览器返回事件
  mounted() {
    window.addEventListener(
      'popstate',
      () => {
        window.sessionStorage.setItem('activePath', this.path)
        window.location.reload()
      },
      false
    )
  },
  router,
  render: h => h(App),
  watch: {
    $route(to, from) {
      this.path = to.path
    }
  }
}).$mount('#app')
