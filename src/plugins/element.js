import Vue from 'vue'
import {
  Button,
  Form,
  FormItem,
  Input,
  Message,
  Container,
  Main,
  Aside,
  Header,
  Menu,
  MenuItem,
  Submenu
} from 'element-ui'

// 进行全局挂载 $后面的名字可以任意
Vue.prototype.$message = Message

Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
Vue.use(Container)
Vue.use(Main)
Vue.use(Aside)
Vue.use(Header)
Vue.use(Menu)
Vue.use(Submenu)
Vue.use(MenuItem)
