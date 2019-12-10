<template>
  <el-container class="home-container">
    <!-- 头部区域 -->
    <el-header>
      <div class="logoBar">
        <img src="../assets/logo.png" />
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <el-container>
      <!-- 侧边栏  动态绑定width 当折叠时大小改变-->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <!-- 侧边栏菜单 设置unique-opened为true 只能打开一个菜单
              collapse 判断是否折叠
              collapse-transition 是否开启折叠动画
              将el-menu的router属性设置为true就可以了，此时当我们点击二级菜单的时候，就会根据菜单的index
属性进行路由跳转
             default-active  默认活跃栏  $route.path 这个内置属性，可以在不刷新的情况下改变侧边栏的显示
        -->
        <el-menu
          unique-opened
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409EFF"
          :collapse="isCollapse"
          :collapse-transition="false"
          :default-active="$route.path === '/goods/add'? '/goods' :$route.path"
          router
        >
          <!-- 侧边栏是否展开按钮 -->
          <div class="hiddenBtn" @click="isHidden">|||</div>
          <!-- 一级菜单 -->
          <!-- index 进行动态绑定：index  index规定为字符串 所以用+来隐式转换数据类型 -->
          <el-submenu :index="item.id + ''" v-for="item in menuList" :key="item.id">
            <!-- 一级菜单模板 -->
            <template slot="title">
              <!-- 图标 设置对象通过id来动态绑定字体图标-->
              <i :class="iconsObj[item.id]"></i>
              <!-- 文本 后台传递的字段-->
              <span>{{ item.authName }}</span>
            </template>
            <!-- 二级子菜单 开启菜单的路由导航后  利用index设置路由地址-->
            <el-menu-item
              :index="'/'+subItem.path"
              v-for="subItem in item.children"
              :key="subItem.id"
            >
              <!-- 二级菜单模板 -->
              <template slot="title">
                <!-- 图标 -->
                <i class="el-icon-menu"></i>
                <!-- 文本 -->
                <span>{{ subItem.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 主结构 -->
      <el-main>
        <!-- 路由占位符 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      // 左侧菜单数据
      menuList: null,
      // 字体图标
      iconsObj: {
        '125': 'iconfont icon-user',
        '103': 'iconfont icon-tijikongjian',
        '101': 'iconfont icon-shangpin',
        '102': 'iconfont icon-danju',
        '145': 'iconfont icon-baobiao'
      },
      isCollapse: false,
      // 锁定选择栏
      activePath: ''
    }
  },
  created() {
    // 在created阶段请求左侧菜单数据  显示当前路径
    this.getMenuList()
  },
  methods: {
    logout() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    async getMenuList() {
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.menuList = res.data
      // console.log(res)
    },
    isHidden() {
      this.isCollapse = !this.isCollapse
    }
    // // 存当前路径
    // saveActivePath(path) {
    //   this.activePath = path
    //   window.sessionStorage.setItem('activePath', this.activePath)
    // }
  }
}
</script>

<style lang="less" scoped>
.home-container {
  height: 100%;
  .el-menu {
    /* 清除默认样式 */
    border-right: none;
  }
}
.el-header {
  width: 100%;
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  align-items: center;
  .logoBar {
    height: 60px;
    display: flex;
    align-items: center;
    img {
      height: 100%;
    }
    span {
      display: inline-block;
      margin-top: 30px;
      margin-left: 20px;
      height: 60px;
      color: #fff;
      font-size: 20px;
    }
  }
}
.el-aside {
  background-color: #333744;
}
.el-main {
  background-color: #eaedf1;
}
.iconfont {
  /* 让图标与文字之间有间隔 */
  margin-right: 10px;
}

.hiddenBtn {
  width: 100%;
  background-color: #333744;
  text-align: center;
  line-height: 25px;
  font-size: 10px;
  color: #fff;
  letter-spacing: 0.2em;
  cursor: pointer;
}
</style>
