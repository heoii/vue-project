<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 表格 -->
      <!-- 分类表格
      :data(设置数据源) :columns(设置表格中列配置信息) :selection-type(是否有复选框)
      :expand-type(是否展开数据) show-index(是否设置索引列) index-text(设置索引列头)
      border(是否添加纵向边框) :show-row-hover(是否鼠标悬停高亮)-->
      <tree-table
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="序号"
        border
        :show-row-hover="true"
      >
        <!-- 是否有效区域， 设置对应的模板列： slot="isok"(与columns中设置的template一致) -->
        <template slot="isok" slot-scope="scope">
          <i
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
            style="color:lightgreen;font-size:20px"
          ></i>
          <i class="el-icon-error" v-else style="color:red;font-size:20px"></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level===0">一级</el-tag>
          <el-tag size="mini" type="success" v-else-if="scope.row.cat_level===1">二级</el-tag>
          <el-tag size="mini" type="warning" v-else>三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="opt">
          <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
          <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页 -->
      <el-pagination
        :total="total"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3,5,10,15]"
        :page-size="queryInfo.pagesize"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        layout="total, sizes, prev, pager, next, jumper"
      ></el-pagination>
    </el-card>
    <!-- 添加分类对话框 -->
    <el-dialog
      title="添加分类"
      @close="addCateDialogClosed"
      :visible.sync="addCateDialogVisible"
      width="50%"
    >
      <!-- 添加分类表单 -->
      <el-form
        :rules="addCateFormRules"
        :model="addCateForm"
        ref="addCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称:" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类:" prop="cat_pid">
          <!-- 级联框 -->
          <!--  v-model(设置级联菜单绑定数据) :options(指定级联菜单数据源)  :props(用来配置数据显示的规则)
          clearable(提供“X”号完成删除文本功能)-->
          <el-cascader
            :options="parentCateList"
            :props="cascaderProps"
            @change="parentCateChange"
            clearable
            v-model="selectedKeys"
            style="width:100%"
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      // 商品分类列表
      cateList: [],
      // 绑定用户选择的分类值
      selectedKeys: [],
      // 查询分类数据的条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      addCateForm: {
        // 分类名称
        cat_name: '',
        // 添加分类的父级id，0则表示父级为0.添加一级分类
        cat_pid: 0,
        // 添加分类的等级，0则表示添加一级分类
        cat_level: 0
      },
      // 配置级联菜单中数据如何展示
      cascaderProps: {
        // 后台要的值
        value: 'cat_id',
        // 界面的展示的值
        label: 'cat_name',
        // 父子间的依赖项
        children: 'children',
        // expandTrigger='hover'(鼠标悬停触发级联)
        expandTrigger: 'hover',
        // 可以选择不是叶子节点的值
        checkStrictly: true
      },
      // 保存总数据条数
      total: 0,
      // 保存1,2级父级分类的列表
      parentCateList: [],
      // 是否显示商品分类添加弹出框
      addCateDialogVisible: false,
      // 添加分类校验规则
      addCateFormRules: {
        // 验证规则
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      columns: [
        // type:'template'(将该列设置为模板列)，template:'isok'(设置该列模板的名称为isok)
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          prop: '',
          type: 'template',
          template: 'isok'
        },
        {
          label: '排序',
          prop: '',
          type: 'template',
          template: 'order'
        },
        {
          label: '操作',
          prop: '',
          type: 'template',
          template: 'opt'
        }
      ]
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 级联选择器改变触发事件
    parentCateChange() {
      // 级联菜单中选择项发生变化时触发
      console.log(this.selectedKeys)
      // 如果用户选择了父级分类
      if (this.selectedKeys.length > 0) {
        // 则将数组中的最后一项设置为父级分类
        // eslint-disable-next-line standard/computed-property-even-spacing
        this.addCateForm.cat_pid = this.selectedKeys[
          this.selectedKeys.length - 1
        ]
        // level也要跟着发生变化
        this.addCateForm.cat_level = this.selectedKeys.length
      } else {
        // cat_pid为0 没有父级
        this.addCateForm.cat_pid = 0
        //  cat_level 为0 就是第一级
        this.addCateForm.cat_level = 0
        return true
      }
    },
    // 获取分类数据
    async getCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表数据失败')
      }
      this.cateList = res.data.result
      this.total = res.data.total
    },
    // 当pagesize发生改变时触发
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    // 当pagenum发生改变时触发
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    async getParentCateList() {
      // 获取父级分类数据列表
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 }
      })

      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类列表数据失败')
      }
      this.parentCateList = res.data
    },
    // 显示添加商品分类弹出框
    showAddCateDialog() {
      // 调用getParentCateList获取分类列表
      this.getParentCateList()
      // 显示添加分类对话框
      this.addCateDialogVisible = true
    },
    // 添加商品类别
    addCate() {
      console.log(this.addCateForm)
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post(
          'categories',
          this.addCateForm
        )
        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败')
        }
        this.$message.success('添加分类成功')
        this.getCateList()
        this.addCateDialogVisible = false
      })
    },
    // 重置添加商品类别弹出框
    addCateDialogClosed() {
      // 当关闭添加分类对话框时，重置表单
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
    }
  }
}
</script>
