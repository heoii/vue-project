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
  Submenu,
  Card,
  Row,
  Col,
  Breadcrumb,
  BreadcrumbItem,
  Table,
  TableColumn,
  Switch,
  Tooltip,
  Dialog,
  Pagination,
  MessageBox,
  Tag,
  Tree,
  Select,
  Option,
  Cascader,
  Alert,
  Tabs,
  TabPane
} from 'element-ui'

// 进行全局挂载 $后面的名字可以任意
Vue.prototype.$message = Message
Vue.prototype.$confirm = MessageBox.confirm

Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
Vue.use(Container)
Vue.use(Main)
Vue.use(Dialog)
Vue.use(Aside)
Vue.use(Header)
Vue.use(Menu)
Vue.use(Submenu)
Vue.use(MenuItem)
Vue.use(Row)
Vue.use(Col)
Vue.use(Breadcrumb)
Vue.use(BreadcrumbItem)
Vue.use(Card)
Vue.use(Tooltip)
Vue.use(Table)
Vue.use(Switch)
Vue.use(TableColumn)
Vue.use(Pagination)
Vue.use(Tag)
Vue.use(Tree)
Vue.use(Select)
Vue.use(Option)
Vue.use(Cascader)
Vue.use(Alert)
Vue.use(Tabs)
Vue.use(TabPane)
