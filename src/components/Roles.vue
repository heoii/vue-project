<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRoleDialogVisible = true">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表 -->
      <!-- row-key="id" 是2019年3月提供的新特性，
      if there's nested data, rowKey is required.
      如果这是一个嵌套的数据，rowkey 是必须添加的属性-->
      <el-table :data="rolesList" border stripe>
        <!-- 添加展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <!-- 渲染一级权限 -->
            <el-row :key="item1.id" v-for="(item1) in scope.row.children">
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二，三级权限 -->
              <el-col :span="19">
                <el-row :key="item2.id" v-for="(item2) in item1.children">
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row,item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      :key="item3.id"
                      v-for="(item3) in item2.children"
                      closable
                      @close="removeRightById(scope.row,item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <!-- 编辑 -->
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              @click="showEditRoleDialog(scope.row.id)"
            >编辑</el-button>
            <!-- 删除 -->
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="removeRoleById(scope.row.id)"
            >删除</el-button>
            <!-- 分配权限 -->
            <el-button
              size="mini"
              type="warning"
              icon="el-icon-setting"
              @click="showSetRightDialog(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
        <el-table-column label></el-table-column>
      </el-table>
    </el-card>
    <!-- 添加角色对话框 -->
    <el-dialog
      title="添加角色"
      :visible.sync="addRoleDialogVisible"
      width="50%"
      @close="addRoleDialogClosed"
    >
      <!-- 对话框主体区域 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addRoleFormRef" label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 对话框底部区域 -->
      <span slot="footer">
        <el-button @click="addRoleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="addRole">确定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑角色对话框 -->
    <el-dialog
      title="编辑角色"
      :visible.sync="editRoleDialogVisible"
      width="50%"
      @close="editRoleDialogClosed"
    >
      <el-form :model="editForm" :rules="editFormRules" ref="editRoleFormRef" label-width="100px">
        <el-form-item label="角色名称">
          <el-input v-model="editForm.roleName" disabled></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 对话框底部区域 -->
      <span slot="footer">
        <el-button @click="editRoleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="editRole">确定</el-button>
      </span>
    </el-dialog>
    <!-- 分配权限对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="setRightDialogClose"
    >
      <!-- 树形组件
    show-checkbox:显示复选框
    node-key:设置选中节点对应的值
    default-expand-all:是否默认展开所有节点
    :default-checked-keys 设置默认选中项的数组
    :props 设置树之间的依赖项及显示项
      ref:设置引用-->
      <el-tree
        :data="rightsList"
        :props="treeProps"
        default-expand-all
        :default-checked-keys="defKeys"
        show-checkbox
        node-key="id"
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="allotRights">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      // 角色列表数据
      rolesList: [],
      // 权限树数据
      rightsList: [],
      // 控制分配权限对话框的显示
      setRightDialogVisible: false,
      // 树形控件的属性绑定对象
      treeProps: {
        // 通过label设置树形节点文本展示authName
        label: 'authName',
        // 设置通过children属性展示子节点信息
        children: 'children'
      },
      // 设置树形控件中默认选中的内容
      defKeys: [],
      // 保存正在操作的角色id,方便后面修改权限使用
      roleId: '',
      // 设置添加角色弹出框是否显示
      addRoleDialogVisible: false,
      // 添加角色的表单数据
      addForm: {
        roleName: '',
        roleDesc: ''
      },
      // 添加表单的验证规则对象
      addFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '角色名称在3~10个字符之间',
            trigger: 'blur'
          }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          {
            min: 6,
            max: 15,
            message: '角色描述在6~15个字符之间',
            trigger: 'blur'
          }
        ]
      },
      // 设置角色编辑弹出框是否显示
      editRoleDialogVisible: false,
      // 修改角色的表单数据
      editForm: {
        roleId: 1,
        roleName: '',
        roleDesc: ''
      },
      // 修改角色的验证规则对象
      editFormRules: {
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    // 获得角色列表
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      // 如果返回状态正常，将请求的数据保存在data中
      console.log(res.data)
      this.rolesList = res.data
    },
    // 显示修改角色弹出框
    async showEditRoleDialog(id) {
      const { data: res } = await this.$http.get(`roles/${id}`)
      if (res.meta.status !== 200) {
        console.log(res.meta)
        return this.$message.error('获取权限失败')
      }
      // 将获取到的数据保存到数据editForm中
      this.editForm = res.data
      // 显示弹出框
      this.editRoleDialogVisible = true
    },
    // 重置修改角色表单
    editRoleDialogClosed() {
      this.$refs.editRoleFormRef.resetFields()
    },
    // 重置添加角色表单
    addRoleDialogClosed() {
      this.$refs.addRoleFormRef.resetFields()
    },
    // 提交添加角色
    addRole() {
      // 点击确定按钮，添加新用户
      // 调用validate进行表单验证
      this.$refs.addRoleFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请填写完整角色信息')
        // 发送请求完成添加用户的操作
        const { data: res } = await this.$http.post('roles', this.addForm)
        // 判断如果添加失败，就提示
        if (res.meta.status !== 201) {
          return this.$message.error('添加角色失败')
        }
        // 添加成功提示
        this.$message.success('添加角色成功')
        // 关闭对话框
        this.addRoleDialogVisible = false
        // 重新请求最行数据
        this.getRolesList()
      })
    },
    //  提交修改角色
    editRole() {
      // 用户点击修改表单中的确定按钮之后，验证表单数据
      this.$refs.editRoleFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请填写完整用户信息')
        // 发送请求完成修改用户的操作
        const { data: res } = await this.$http.put(
          `roles/${this.editForm.roleId}`,
          this.editForm
        )
        // 判断如果修改失败，就做提示
        if (res.meta.status !== 200) {
          console.log(res.meta)
          return this.$message.error('修改用户失败')
        }
        // 修改成功的提示
        this.$message.success('修改用户成功')
        // 关闭对话框
        this.editRoleDialogVisible = false
        // 重新请求最新的数据
        this.getRolesList()
      })
    },
    // 通过id移除权限
    async removeRightById(role, rightId) {
      const confirmResult = await this.$confirm(
        '请问是否要删除该权限',
        '删除提示',
        {
          confirmButtonText: '确认删除',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      // 如果用户点击确认，则confirmResult 为'confirm'
      // 如果用户点击取消, 则confirmResult获取的就是catch的错误消息'cancel'
      if (confirmResult !== 'confirm') {
        return this.$message.info('已经取消删除')
      }
      // 用户点击了确定表示真的要删除
      // 当发送delete请求之后，返回的数据就是最新的角色权限信息
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      )
      if (res.meta.status !== 200) {
        return this.$message.error('删除角色权限失败')
      }
      this.$message.success('角色权限已删除')
      // 无需再重新加载所有权限
      // 只需要对现有的角色权限进行更新即可
      role.children = res.data
    },
    // 显示权限弹出框
    async showSetRightDialog(role) {
      // 将role.id保存起来以供保存权限时使用
      this.roleId = role.id
      // 获取所以权限的数据
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限失败')
      }
      // 如果返回状态正常，将请求的数据保存在data中
      this.rightsList = res.data
      // 调用getLeafKeys进行递归，将三级权限添加到数组中
      this.getLeafKeys(role, this.defKeys)
      // 当点击分配权限按钮时，展示对应的对话框,这个要在下面，先递归找值，后显示
      this.setRightDialogVisible = true
    },
    setRightDialogClose() {
      // 当用户关闭树形权限对话框的时候，清除掉所有选中状态
      this.defKeys = []
    },
    // 该函数会获取到当前角色的所有三级权限id并添加到defKeys中
    getLeafKeys(node, arr) {
      // 如果当前节点不包含children属性，则表示node为三级权限
      if (!node.children) {
        return arr.push(node.id)
      }
      // 递归调用
      node.children.forEach(item => {
        this.getLeafKeys(item, arr)
      })
    },
    // 修改用户权限
    async allotRights() {
      // 当用户在树形权限对话框中点击确定，将用户选择的权限发送请求进行更新
      // 获取所以选中及半选的内容
      // getCheckedKeys() tree组件内置api 选中叶子节点数据
      // getHalfCheckedKeys() tree组件内置api  选中半选节点数据
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      // 将数组转化为字符串用,号拼接,后台要求传递字符串
      const idStr = keys.join(',')
      // 发送更新请求
      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids: idStr }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败')
      }
      this.$message.success('分配权限成功')
      this.setRightDialogVisible = false
      this.getRolesList()
    },
    // 通过id删除用户
    async removeRoleById(id) {
      // 弹出确认框，是否删除用户
      const confirmRes = await this.$confirm(
        '请问是否要永久删除该角色',
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
      const { data: res } = await this.$http.delete('roles/' + id)
      // 判断如果删除失败，就做提示
      if (res.meta.status !== 200) return this.$message.error('删除用户失败')
      // 修改成功的提示
      this.$message.success('删除用户成功')
      this.getRolesList()
    }
  }
}
</script>
<style scoped>
.el-tag {
  margin: 7px;
}
</style>
