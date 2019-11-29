<template>
  <div>
    <el-container class="home-container">
      <!-- 头部区域 -->
      <el-header>
        Header
      <el-button type="info" @click="logout">退出</el-button>
      </el-header>
    <el-container>
      <el-aside>

      </el-aside>
    </el-container>
    </el-container>
  </div>
</template>

<script>
export default {
  methods: {
    logout () {
      window.sessionStorage.clear()
      this.$router.push('/login')
    }
  }
}
</script>

<style lang='less' scoped>
</style>
