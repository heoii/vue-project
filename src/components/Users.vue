<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片 -->
    <el-card>
      <!-- gutter 行间距  一行默认分为24份 ：span 占的份数 -->
      <!-- clearable 清除输入框中的数据 自带事件 清除之后触发 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="findUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="showAddDialog">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 渲染用户列表 -->
      <!-- border 加边框  stripe 隔行变色 -->
      <el-table :data="userList" border stripe>
        <!-- type='index' 就会显示数字 width 设置表格宽度 -->
        <el-table-column label="序号" type="index" width="50"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <!-- 作用域插槽中，一定要用 slot-scope 这个属性来接收数据，值是什么无所谓  -->
          <!-- 这里用到了插槽来读取值，所以prop会被覆盖，可以去掉了 -->
          <template slot-scope="scope">
            <!-- 这里接收的值继续 .row 可以拿到当前行的数据 再. 就是这个数据对象里的属性了 -->
            <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <!-- 修改 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.id)"
            ></el-button>
            <!-- 删除 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeUserById(scope.row.id)"
            ></el-button>
            <!-- :enterable 显示离开后不显示 -->
            <el-tooltip content="分配角色" placement="top" :enterable="false">
              <!-- 设置 -->
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="setRole(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页导航区域
      @size-change(pagesize改变时触发)
      @current-change(页码发生改变时触发)
      :current-page(设置当前页码)
      :page-size(设置每页的数据条数)
      :total(设置总页数)
      page-sizes 设置每一页的显示的条数
      layout 组件布局，子组件名用逗号分隔-->
      <el-pagination
        :total="total"
        :current-page="queryInfo.pagenum"
        :page-size="queryInfo.pagesize"
        :page-sizes="[1, 2, 5, 10]"
        @current-change="handleCurrentChange"
        @size-change="handleSizeChange"
        layout="total,sizes,prev,pager,next,jumper"
      ></el-pagination>
    </el-card>
    <!-- 添加用户弹出框组件
:visible.sync(设置是否显示对话框)
width(设置对话框的宽度)
:before-close(在对话框关闭前触发的事件)
    close 对话关闭后触发-->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <!-- 对话框主体区域 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="电话" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 对话框底部区域 -->
      <span slot="footer">
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="addUser">确定</el-button>
      </span>
    </el-dialog>
    <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="电话" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 对话框底部区域 -->
      <span slot="footer">
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="editUser">确定</el-button>
      </span>
    </el-dialog>
    <!-- 分配角色对话框 -->
    <el-dialog
      title="分配角色"
      :visible.sync="setRoleDialogVisible"
      width="50%"
      @close="setRoleDialogClosed"
    >
      <div>
        <p>当前用户：{{userInfo.username}}</p>
        <p>当前角色：{{userInfo.role_name}}</p>
        <p>
          分配的新角色
          <el-select v-model="selectedRoleId" placeholder="请选择角色">
            <!-- :label 显示文本 ：value 选中值 -->
            <el-option
              :key="item.id"
              v-for="item in rolesList"
              :label="item.roleName"
              :value="item.id"
            ></el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible=false">取消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    // 验证邮箱的规则
    var checkEmail = (rule, value, cb) => {
      const regEmail = /^\w+@\w+(\.\w+)+$/
      if (regEmail.test(value)) {
        return cb()
      }
      // 返回一个错误提示
      cb(new Error('请输入合法的邮箱'))
    }
    // 验证手机号码的规则
    var checkMobile = (rule, value, cb) => {
      const regMobile = /^1[34578]\d{9}$/
      if (regMobile.test(value)) {
        return cb()
      }
      // 返回一个错误提示
      cb(new Error('请输入合法的手机号码'))
    }
    return {
      // 获取查询用户信息的参数
      queryInfo: {
        // 查询的条件
        query: '',
        // 当前的页数
        pagenum: 1,
        // 每一页显示的条数
        pagesize: 2
      },
      // 保存请求回来的用户列表数据
      userList: [],
      // 初始化总条数为0
      total: 0,
      // 是否显示添加用户弹出窗
      addDialogVisible: false,
      // 是否显示编辑用户弹出框
      editDialogVisible: false,
      // 是否显示分配角色弹出框
      setRoleDialogVisible: false,
      // 保存正在操作的那个用户信息
      userInfo: {},
      // 保存所以的角色信息
      rolesList: [],
      // 保存用户选中的角色id
      selectedRoleId: '',
      // 添加用户的表单数据
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 修改用户的表单数据
      editForm: {
        username: '',
        email: '',
        mobile: ''
      },
      // 添加表单的验证规则对象
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名称', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '用户名在3~10个字符之间',
            trigger: 'blur'
          }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          {
            min: 6,
            max: 15,
            message: '用户名在6~15个字符之间',
            trigger: 'blur'
          }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          {
            validator: checkEmail,
            message: '邮箱格式不正确，请重新输入',
            trigger: 'blur'
          }
        ],
        mobile: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          {
            validator: checkMobile,
            message: '手机号码不正确，请重新输入',
            trigger: 'blur'
          }
        ]
      },
      // 修改表单的验证规则对象
      editFormRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          {
            validator: checkEmail,
            message: '邮箱格式不正确，请重新输入',
            trigger: 'blur'
          }
        ],
        mobile: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          {
            validator: checkMobile,
            message: '手机号码不正确，请重新输入',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  // 页面创建后，初始化数据
  created() {
    this.getUserList()
  },
  methods: {
    // 提交分配角色信息
    async saveRoleInfo() {
      // 当用户点击确定按钮之后
      // 判断用户是否选择了需要分配的角色
      if (!this.selectedRoleId) {
        return this.$message.error('请选择需要分配的角色')
      }
      // 发送完成分配角色的操作
      const { data: res } = await this.$http.put(
        `users/${this.userInfo.id}/role`,
        { rid: this.selectedRoleId }
      )
      // 判断如果删除失败，就做提示
      if (res.meta.status !== 200) return this.$message.error('分配角色失败')
      this.$message.success('分配角色成功')
      this.getUserList()
      // 关闭对话框
      this.setRoleDialogVisible = false
    },
    setRoleDialogClosed() {
      // 当关闭对话框的时候，重置下拉框中的内容
      this.selectedRoleId = ''
      this.userInfo = {}
    },
    // 分配用户角色
    async setRole(userInfo) {
      // 保存起来以供后续使用
      this.userInfo = userInfo
      // 获取收有角色信息，以备下拉列表使用
      const { data: res } = await this.$http.get('roles')
      // 判断是否获取成功
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      this.rolesList = res.data
      // 显示角色分配对话框
      this.setRoleDialogVisible = true
    },
    // 查找用户
    async findUserList() {
      // 从第一页开始查 不然后面的会查不到
      this.queryInfo.pagenum = 1
      const { data: res } = await this.$http.get('users', {
        params: this.queryInfo
      })
      // 如果返回状态为异常状态则报错并返回
      if (res.meta.status !== 200) {
        this.$message.err('获取用户列表失败')
      }
      // 如果返回状态正常，将请求的数据保存在data中
      this.userList = res.data.users
      this.total = res.data.total
    },
    // 发送请求获取用户列表数据
    async getUserList() {
      const { data: res } = await this.$http.get('users', {
        params: this.queryInfo
      })
      // 如果返回状态为异常状态则报错并返回
      if (res.meta.status !== 200) {
        this.$message.error('获取用户列表失败')
      }
      // 如果返回状态正常，将请求的数据保存在data中
      this.userList = res.data.users
      this.total = res.data.total
    },
    handleSizeChange(newSize) {
      // pagesize改变时触发，当pagesize发生改变的时候，我们应该
      // 以最新的pagesize来请求数据并展示数据
      //   console.log(newSize)
      this.queryInfo.pagesize = newSize
      // 重新按照pagesize发送请求，请求最新的数据
      this.getUserList()
    },
    handleCurrentChange(current) {
      // 页码发生改变时触发当current发生改变的时候，我们应该
      // 以最新的current页码来请求数据并展示数据
      //   console.log(current)
      this.queryInfo.pagenum = current
      // 重新按照pagenum发送请求，请求最新的数据
      this.getUserList()
    },
    async userStateChanged(row) {
      // 发送请求进行状态修改
      const { data: res } = await this.$http.put(
        `users/${row.id}/state/${row.mg_state}`
      )
      // 如果返回状态为异常状态则报错并返回
      if (res.meta.status !== 200) {
        row.mg_state = !row.mg_state
        return this.$message.error('修改状态失败')
      }
      this.$message.success('更新状态成功')
    },
    // 显示添加用户框
    showAddDialog() {
      this.addDialogVisible = true
    },
    async showEditDialog(id) {
      // 发送请求根据id获取用户信息
      const { data: res } = await this.$http.get('users/' + id)
      // 判断是否添加成功
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户信息失败')
      }
      // 将获取到的数据保存到数据editForm中
      this.editForm = res.data
      // 显示弹出框
      this.editDialogVisible = true
    },
    // 重置添加表单
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 重置修改表单
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 提交添加用户
    addUser() {
      // 点击确定按钮，添加新用户
      // 调用validate进行表单验证
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请填写完整用户信息')
        // 发送请求完成添加用户的操作
        const { data: res } = await this.$http.post('users', this.addForm)
        // 判断如果添加失败，就提示
        if (res.meta.status !== 201) {
          return this.$message.error('添加用户失败')
        }
        // 添加成功提示
        this.$message.success('添加用户成功')
        // 关闭对话框
        this.addDialogVisible = false
        // 重新请求最行数据
        this.getUserList()
      })
    },
    //  提交修改用户
    editUser() {
      // 用户点击修改表单中的确定按钮之后，验证表单数据
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请填写完整用户信息')
        // 发送请求完成修改用户的操作
        const { data: res } = await this.$http.put(
          'users/' + this.editForm.id,
          this.editForm
        )
        // 判断如果修改失败，就做提示
        if (res.meta.status !== 200) return this.$message.error('修改用户失败')
        // 修改成功的提示
        this.$message.success('修改用户成功')
        // 关闭对话框
        this.editDialogVisible = false
        // 重新请求最新的数据
        this.getUserList()
      })
    },
    // 通过id删除用户
    async removeUserById(id) {
      // 弹出确认框，是否删除用户
      const confirmRes = await this.$confirm(
        '请问是否要永久删除该用户',
        '删除提示',
        {
          confirmButtonText: '确认删除',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      // 如果用户点击确认，则confirmResult 为'confirm'
      // 如果用户点击取消, 则confirmResult获取的就是catch的错误消息'cancel'
      if (confirmRes !== 'confirm') {
        return this.$message.info('已经取消删除')
      }
      // 发送请求根据id完成删除操作
      const { data: res } = await this.$http.delete('users/' + id)
      // 判断如果删除失败，就做提示
      if (res.meta.status !== 200) return this.$message.error('删除用户失败')
      // 修改成功的提示
      this.$message.success('删除用户成功')
      // 判断是否向前一页
      const lostPage = this.total % this.queryInfo.pagesize
      if (lostPage === 1) --this.queryInfo.pagenum
      // 重新请求最新的数据
      this.getUserList()
    }
  }
}
</script>
<style scoped></style>
