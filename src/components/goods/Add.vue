<template>
  <div>
    <h3>添加商品</h3>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 消息提示 -->
      <el-alert title="添加商品信息" type="info" center show-icon :closable="false"></el-alert>

      <!-- 步骤条组件 -->
      <!-- align-center(居中效果) -->
      <!-- active 要是number型  所以要减0 隐式转换 -->
      <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- 表单：label-position="top"(设置label在文本框上方) -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        label-position="top"
      >
        <!-- tab栏区域
        :el-tab-pane必须是el-tabs的子节点
        :tab-position="'left'"(设置tab栏为左右结构tab栏)-->
        <!-- name 决定了v-model绑定的activeIndex的值  上面的 el-steps 中的:active的值为activeIndex -->
        <!-- 所以这里tabpane的变化就会导致 name 改变 ,activeIndex就会改变，：active的值就会变化，就会出现步骤条的变化了 -->
        <!-- before-leave tab栏切换前事件 -->
        <el-tabs
          v-model="activeIndex"
          :tab-position="'left'"
          :before-leave="beforeTabLeave"
          @tab-click="tabClicked"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <!-- 选择商品分类的级联选择框 -->
              <el-cascader
                v-model="addForm.goods_cat"
                :options="cateList"
                :props="cateProps"
                @change="handleChange"
                clearable
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 渲染表单item项 -->
            <el-form-item :label="item.attr_name" :key="item.attr_id" v-for="item in manyTableData">
              <!-- 使用数组渲染复选框组 动态属性-->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="val" :key="i" v-for="(val,i) in item.attr_vals" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <!-- 循环生成静态属性 -->
            <el-form-item :label="item.attr_name" :key="item.attr_id" v-for="item in onlyTableData">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- 商品图片上传
              action:指定图片上传api接口 这里用绝对地址
              :on-preview ： 当点击图片时会触发该事件进行预览操作,处理图片预览
              :on-remove : 当用户点击图片右上角的X号时触发执行
              :on-success：当用户点击上传图片并成功上传时触发
              list-type ：设置预览图片的方式
            :headers ：设置上传图片的请求头-->
            <el-upload
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :on-success="handleSuccess"
              list-type="picture"
              :headers="headerObj"
            >
              <el-button type="primary" size="small">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器组件 -->
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <!-- 添加商品按钮 -->
            <el-button type="primary" class="btnAdd" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 预览图片对话框 -->
    <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
      <img :src="previewPath" class="previewImg" width="100%" />
    </el-dialog>
  </div>
</template>
<script>
// 官方推荐将lodash导入为_
import _ from 'lodash'

export default {
  data() {
    return {
      // 上传图片的url地址
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 图片上传组件的header请求头对象
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 保存预览图片的地址
      previewPath: '',
      // 控制预览图片对话框的显示和隐藏
      previewVisible: false,
      // 动态参数列表
      manyTableData: [],
      // 静态属性列表
      onlyTableData: [],
      // 商品分类列表
      cateList: [],
      // 级联选择框的规则
      cateProps: {
        // hover 方式展开级联框
        expandTrigger: 'hover',
        // label 页面展示的数据
        value: 'cat_id',
        // value 传给后台的值
        label: 'cat_name',
        // 子栏项目
        children: 'children'
      },
      // 保存步骤条激活项索引
      activeIndex: '0',
      // 添加商品的表单数据对象
      addForm: {
        goods_name: '',
        goods_price: 1,
        goods_weight: 1,
        goods_number: 1,
        // 商品类别
        goods_cat: [],
        // 上传图片信息
        picInfo: [],
        // 商品的详情介绍
        goods_introduce: ''
      },
      // 验证规则
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getCateList()
  },
  // 计算属性获取三级分类
  computed: {
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    }
  },
  methods: {
    // 编写点击事件完成商品添加
    add() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请填写必要的表单项!')

        // 将addForm进行深拷贝，避免goods_cat数组转换字符串之后导致级联选择器报错
        const form = _.cloneDeep(this.addForm)
        // 将goods_cat从数组转换为"1,2,3"字符串形式
        form.goods_cat = form.goods_cat.join(',')
        // 处理attrs数组，数组中需要包含商品的动态参数和静态属性
        // 将manyTableData（动态参数）处理添加到attrs
        this.manyTableData.forEach(item => {
          form.attrs.push({
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          })
        })
        // 将onlyTableData（静态属性）处理添加到attrs
        this.onlyTableData.forEach(item => {
          form.attrs.push({ attr_id: item.attr_id, attr_value: item.attr_vals })
        })

        // 发送请求完成商品的添加,商品名称必须是唯一的
        const { data: res } = await this.$http.post('goods', form)
        if (res.meta.status !== 201) {
          return this.$message.error('添加商品失败')
        }
        this.$message.success('添加商品成功')
        // 编程式导航跳转到商品列表
        this.$router.push('/goods')
      })
    },
    // 当用户点击图片进行预览时执行，处理图片预览
    handlePreview(file) {
      // 当用户点击图片进行预览时执行，处理图片预览
      // 形参file就是用户预览的那个文件  内置参数
      console.log(file)
      this.previewPath = file.response.data.url
      // 显示预览图片对话框
      this.previewVisible = true
    },
    // 清除图片时处理 内置参数
    handleRemove(file) {
      // 当用户点击X号删除时执行
      // 形参file就是用户点击删除的文件
      // 获取用户点击删除的那个图片的临时路径
      const filePath = file.response.data.tmp_path
      // 使用findIndex来查找符合条件的索引
      const index = this.addForm.picInfo.findIndex(
        item => item.filePath === filePath
      )
      // 移除索引对应的图片
      this.addForm.picInfo.splice(index, 1)
    },
    // 当图片上传成功触发 自带返回的参数
    handleSuccess(res) {
      let pathObj = {
        filePath: res.data.tmp_path
      }
      this.addForm.picInfo.push(pathObj)
      // console.log(this.addForm)
    },
    // 点击切换tab栏时触发
    async tabClicked() {
      if (this.activeIndex === '1') {
        // 发送请求获取动态参数
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          { params: { sel: 'many' } }
        )

        if (res.meta.status !== 200) {
          return this.$message.error('获取动态参数列表失败')
        }
        // 将attr_vals字符串转换为数组
        res.data.forEach(item => {
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })
        this.manyTableData = res.data
      } else if (this.activeIndex === '2') {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          { params: { sel: 'only' } }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('获取静态属性列表失败')
        }
        this.onlyTableData = res.data
        // console.log(res.data)
      }
    },
    // 获取商品列表
    async getCateList() {
      const { data: res } = await this.$http.get('/categories')
      if (res.meta.status !== 200) {
        console.log(res.meta)
        return this.$message.error('获取商品列表失败')
      }
      this.cateList = res.data
    },
    // 级联选择器发送变化函数
    handleChange() {
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
        this.$message.error('请选择到三级的商品')
        return true
      }
    },
    // tab栏切换前判断
    beforeTabLeave(activeName, oldActiveName) {
      // 当第一个tab栏要切换的时候
      if (oldActiveName === '0') {
        if (this.addForm.goods_cat.length !== 3) {
          this.$message.error('请选择商品的分类')
          return false
        } else if (this.addForm.goods_name.trim() === '') {
          this.$message.error('请输入商品名称')
          return false
        } else if (this.addForm.goods_price === '0') {
          this.$message.error('请输入商品价格')
          return false
        } else if (this.addForm.goods_weight === '0') {
          this.$message.error('请输入商品重量')
          return false
        } else if (this.addForm.goods_number === '0') {
          this.$message.error('请输入商品数量')
          return false
        }
      }
    }
  }
}
</script>
<style lang='less' scoped>
.el-alert {
  margin: 10px 0;
}
.el-form {
  margin-top: 30px;
}
.el-checkbox {
  margin: 0 40px 0 0;
}
.ql-editor {
  min-height: 300px;
}
.btnAdd {
  margin-top: 20px;
}
</style>
