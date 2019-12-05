<template>
  <div>
    <!-- 面包屑导航栏 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item to="{path:'/home'}">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片 -->
    <el-card>
      <!-- 警告区域 :closable="false"(是否展示“X”号) show-icon(显示图标) -->
      <el-alert title="注意：只允许为第三级分类设置相关参数" show-icon :closable="false" type="warning"></el-alert>
      <!-- 商品分类选择区 -->
      <el-row>
        <el-col class="selectSortBox">
          <span>选择商品分类：</span>
          <!-- 选择商品分类的级联选择框 -->
          <el-cascader
            expandTrigger="hover"
            v-model="selectedCateKeys"
            :options="cateList"
            :props="cateProps"
            @change="handleChange"
            clearable
          ></el-cascader>
        </el-col>
      </el-row>
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 动态参数面板 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button
            size="mini"
            type="primary"
            :disabled="isButtonDisabled"
            @click="addDialogVisible = true"
          >添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="dynamicsTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand"></el-table-column>
            <!--  索引列 -->
            <el-table-column type="index"></el-table-column>
            <!-- 参数列 -->
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <!-- 操作列 -->
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  @click="showEditDialog(scope.row.attr_id)"
                >编辑</el-button>
                <el-button
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  @click="removeParams(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 静态属性面板 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button
            size="mini"
            type="primary"
            :disabled="isButtonDisabled"
            @click="addDialogVisible = true"
          >添加属性</el-button>
          <el-table :data="staticTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand"></el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <!-- 属性列 -->
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <!-- 操作列 -->
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  @click="showEditDialog(scope.row.attr_id)"
                >编辑</el-button>
                <el-button
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  @click="removeParams(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加动态参数弹出框 -->
    <el-dialog
      :title="'添加'+titleText"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <!-- 填加表单 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name" placeholder="请输入要添加的参数"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部插槽 -->
      <template slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="addParams">确定</el-button>
      </template>
    </el-dialog>
    <!-- 修改参数或属性对话框 -->
    <el-dialog
      :title="'修改'+titleText"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <!-- 添加表单 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      // 修改参数.属性对话框中的表单
      editForm: {
        attr_name: ''
      },
      // 修改表单的验证规则
      editFormRules: {
        attr_name: [{ required: true, message: '请输入名称', trigger: 'blur' }]
      },
      // 显示添加动态参数弹出框
      addDialogVisible: false,
      // 编辑
      editDialogVisible: false,
      // 添加参数的表单数据对象
      addForm: {
        attr_name: ''
      },
      // 添加表单验证规则
      addFormRules: {
        attr_name: [{ required: true, message: '请输入名称', trigger: 'blur' }]
      },
      // tab页签激活显示的页签项
      activeName: 'many',
      // 用来保存动态参数数据
      dynamicsTableData: [],
      // 用来保存静态属性数据
      staticTableData: [],
      // 分类列表
      cateList: [],
      // 用户在级联菜单中选中的分类id
      selectedCateKeys: [],
      // 配置级联菜单中数据如何展示
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      }
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 删除参数框
    async removeParams(attrId) {
      const confirmRes = await this.$confirm(
        '请问是否要删除改' + this.titleText,
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
      const { data: res } = await this.$http.delete(
        `categories/${this.cateId}/attributes/${attrId}`
      )
      if (res.meta.status !== 200) {
        return this.$message.error('删除参数数据失败')
      }
      this.$message.success('删除' + this.titleText + '数据成功')
      this.handleChange()
    },
    // 参数不能用_  编辑参数框
    async showEditDialog(attrId) {
      // 发起请求获取需要修改的那个参数数据
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes/${attrId}`,
        { params: { attr_sel: this.activeName } }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数数据失败')
      }
      this.editForm = res.data
      // 显示修改参数.属性对话框
      this.editDialogVisible = true
    },
    editDialogClosed() {
      // 当关闭修改参数.属性对话框时
      this.$refs.editFormRef.resetFields()
    },
    editParams() {
      // 验证表单
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        // 发送请求完成修改
        const { data: res } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          { attr_name: this.editForm.attr_name, attr_sel: this.activeName }
        )

        if (res.meta.status !== 200) {
          return this.$message.error('获取参数数据失败')
        }
        this.$message.success('修改' + this.titleText + '数据成功')
        this.editDialogVisible = false
        this.handleChange()
      })
    },
    // 提交添加参数
    addParams() {
      this.$refs.addFormRef.validate(async valid => {
        // 校验不通过，return
        if (!valid) return
        //  效验通过，发送添加参数请求
        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName,
            attr_vals: 'a,b,c'
          }
        )
        console.log(res)
        if (res.meta.status !== 201) {
          return this.$message.error('添加' + this.titleText + '数据失败')
        }
        this.$message.success('添加' + this.titleText + '数据成功')
        this.addDialogVisible = false
        this.handleChange()
      })
    },
    // 获取所有的商品分类列表
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取分类数据失败')
      }
      // 将数据列表赋值给cateList
      this.cateList = res.data
      // //保存总数据条数
      // this.total = res.data.total
      //   console.log(res.data);
    },
    async handleChange() {
      // 当用户在级联菜单中选择内容改变时触发
      console.log(this.selectedCateKeys)
      // 判断是否选择到第三级标签
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
        return
      }
      // 发送请求，根据用户选择的三级分类和面板获取参数数据
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        { params: { sel: this.activeName } }
      )
      if (res.meta.status !== 200) {
        console.log(res.meta)
        return this.$message.error('获取参数列表数据失败')
      }
      console.log(res.data)
      if (this.activeName === 'many') {
        // 获取的是动态参数
        this.dynamicsTableData = res.data
      } else if (this.activeName === 'only') {
        // 获取的是静态属性
        this.staticTableData = res.data
      }
    },
    // tab选项卡被点击
    handleTabClick() {
      console.log(this.activeName)
      this.handleChange()
    },
    addDialogClosed() {
      // 当关闭修改参数.属性对话框时
      this.$refs.addFormRef.resetFields()
    }
  },
  computed: {
    // 添加按钮是否禁用
    isButtonDisabled() {
      return this.selectedCateKeys.length !== 3
    },
    // 获取选中的三级分类id
    cateId() {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[this.selectedCateKeys.length - 1]
      }
      return null
    },
    titleText() {
      if (this.activeName === 'many') {
        // 获取的是动态参数
        return '动态参数'
      }
      // 获取的是静态属性
      return '静态参数'
    }
  }
}
</script>
<style lang='less' scoped>
.selectSortBox {
  margin: 10px 0px;
}
// 设置级联选择框的宽度
.el-cascader {
  width: 260px !important;
}
</style>
