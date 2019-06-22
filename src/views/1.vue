<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-row :gutter="15" class="search-box">
        <el-col :span="10">
          <!-- 注意：如果是一个第三方的组件（不是HTML自带的标签）在使用修饰符时需要在后面加一个 .native -->
          <el-input
            @keyup.enter.native="queryInfo.query=searchKey"
            placeholder="请输入搜索关键字"
            v-model="searchKey"
          >
            <el-button @click="queryInfo.query=searchKey" slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button @click="addUserDialog=true" type="primary">添加新用户</el-button>
        </el-col>
      </el-row>

      <el-table :data="userList" border style="width: 100%">
        <!-- 首列序号 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column prop="mg_state" label="状态">
          <!-- slot-scope：代表获取当前行的数据 -->
          <template slot-scope="data">
            <!-- data.row ：当前这一行的数据，对象类型
                        data.$index：当前这条记录的下标
            -->
            <!-- 添加开关组件，并和每条记录的 mg_state 字段进行绑定 -->
            <el-switch
              @change="changeState($event, data.row)"
              v-model="data.row.mg_state"
              active-color="#399bfb" ></el-switch>
          </template>
        </el-table-column>
        
        <el-table-column prop="address" label="操作">

          <template slot-scope="data">
            <!-- data.row ：当前要修改的数据对象 -->
            <el-button
              size="mini"
              @click="showEditForm(data.row)"
              type="primary"
              icon="el-icon-edit"
              circle
            ></el-button>
            <el-button
              @click="del(data.row.id)"
              size="mini"
              type="danger"
              icon="el-icon-delete"
              circle
            ></el-button>
            <el-tooltip :enterable="false" effect="dark" content="分配角色" placement="top">
              <el-button size="mini" type="warning" icon="el-icon-s-tools" circle></el-button>
            </el-tooltip>

          </template>
        </el-table-column>
      </el-table>
      <!-- 分页-->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[2, 5, 10, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 添加用户的表单 -->
    <el-dialog @closed="$refs.addUserRef.resetFields()" title="添加用户" :visible.sync="addUserDialog">
      <el-form ref="addUserRef" :model="addUserForm" :rules="addUserRules">
        <el-form-item prop="username" label="用户名" label-width="80px">
          <el-input v-model="addUserForm.username"></el-input>
        </el-form-item>
        <el-form-item prop="password" label="密码" label-width="80px">
          <el-input type="password" v-model="addUserForm.password"></el-input>
        </el-form-item>
        <el-form-item prop="email" label="邮箱" label-width="80px">
          <el-input v-model="addUserForm.email"></el-input>
        </el-form-item>
        <el-form-item prop="mobile" label="手机号码" label-width="80px">
          <el-input v-model="addUserForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addUserDialog = false">取 消</el-button>
        <el-button type="primary" @click="add">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 修改用户的表单 -->
    <el-dialog
      @closed="$refs.editUserRef.resetFields()"
      title="修改用户信息"
      :visible.sync="editUserDialog"
    >
      <el-form ref="editUserRef" :model="editUserForm" :rules="editUserRules">
        <el-form-item prop="username" label="用户名" label-width="80px">
          <el-input v-model="editUserForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item prop="email" label="邮箱" label-width="80px">
          <el-input v-model="editUserForm.email"></el-input>
        </el-form-item>
        <el-form-item prop="mobile" label="手机号码" label-width="80px">
          <el-input v-model="editUserForm.mobile"></el-input>
        </el-form-item>
        <el-input type="hidden" v-model="editUserForm.id"></el-input>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editUserDialog = false">取 消</el-button>
        <el-button type="primary" @click="edit">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>


<script>
export default {
    // 页面中要使用的数据必须要写在 data() 中定义
    data() {
        // 验证用户名是否唯一
        /*
            rule: 这条规则对象
            value：要验证的值
            callback：回调函数，必须要调用
        */
        let validateNameExists = async (rule, value, callback) => {
            // 调用接口查询服务器
            let exists = await this.axios.get('/users/exists/'+value)
            // 判断有没有查询出数据，如果有就报错，否则通过
            if(exists.data.meta.status == 200)
                callback(new Error('用户名已经存在'))
            else
                callback()
        }
        return {
            addUserDialog: false,  // 控制添加用户的框是否显示
            // 添加用户的表单
            addUserForm: {
                username: '',
                password: '',
                email: '',
                mobile: ''
            },
            // 定义表单验证数据
            addUserRules: {
                username: [
                    { required: true, message: '用户名不能为空', trigger: "blur"},
                    { validator: validateNameExists, trigger: "blur"}
                ],
                password: { required: true, message: '密码不能为空', trigger: "blur"},
                email: [
                    { required: true, message: '邮箱不能为空', trigger: "blur"},
                    { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
                ],
                mobile: [
                    { required: true, message: '手机号码不能为空', trigger: "blur"},
                    { pattern: /^1[3456789]\d{9}$/, message: '手机格式不正确', trigger: ["blur", 'change']}
                ]
            },
            editUserDialog: false,  // 控制修改用户的框是否显示
            // 添加用户的表单
            editUserForm: {
                id: '',
                username: '',
                email: '',
                mobile: ''
            },
            // 定义表单验证数据
            editUserRules: {
                email: [
                    { required: true, message: '邮箱不能为空', trigger: "blur"},
                    { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
                ],
                mobile: [
                    { required: true, message: '手机号码不能为空', trigger: "blur"},
                    { pattern: /^1[3456789]\d{9}$/, message: '手机格式不正确', trigger: ["blur", 'change']}
                ]
            },
            searchKey: '',   // 搜索关键字
            userList: [],   // 用户列表的数据
            queryInfo: {
                query: '',  // 查询条件
                pagenum: 1,   // 当前页码
                pagesize: 2   // 每页条数
            },
            total: 0     // 总的记录数
        }
    },
    // 定义监听器
    watch: {
        queryInfo: {
            deep: true,
            // 对象一改变，handler 函数就会被调用了
            handler() {
                this.getData()
            }
        }
    },
    // 获取页面初始数据
    created() {
        this.getData()
    },
    methods: {
        // 修改用户状态
        async changeState( val, row ) {
            let res = await this.axios.put(`/users/${row.id}/state/${val}`)
            // console.log( res )
            if(res.data.meta.status != 200)
            {
                setTimeout(()=>{
                    // 如果失败将状态改变回去
                    row.mg_state = !row.mg_state
                }, 300)
                return this.$message.error('更新状态失败！')
            }
            this.$message.success('更新状态成功！')
        },
        // 获取数据
        async getData() {
            // 向接口传参数：
            // GET 方式：使用第二个参数传参数： { params: 数据对象 }
            // POST 方式：使用第二个参数传参数：数据对象
            let {data: res} = await this.axios.get('/users', { params: this.queryInfo })
            if(res.meta.status != 200) return this.$message.error('用户数据获取失败！')
            console.log( res )
            // 保存用户列表
            this.userList = res.data.users
            this.total = res.data.total
        },
        // 当每页条数改变时触发
        handleSizeChange( val ) {
            // 更新当前每页条数
            this.queryInfo.pagesize = val
        },
        // 当改变了当前页面时触发
        handleCurrentChange( val) {
            this.queryInfo.pagenum = val
        },
        del(id) {
            this.$confirm('此操作将永久删除该记录, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
              }).then(async () => {
                const res = await this.axios.delete(`/users/${id}`)
                // console.log( res )
                if(res.data.meta.status == 200) {

                    this.$message({
                        type: 'success',
                        message: '删除成功!'
                      });

                    // 重新加载数据
                    this.getData()
                } else {
                    this.$message.error('操作失败，失败原因：' + res.data.meta.msg)
                }
              }).catch(() => {
                this.$message({
                  type: 'info',
                  message: '已取消删除'
                });          
              });
        },
        add() {
            // 先验证表单
            this.$refs.addUserRef.validate(async c=>{
                if(c)
                {
                    const res = await this.axios.post('/users', this.addUserForm)
                    console.log( res )
                    if(res.data.meta.status == 201) {
                        this.$message.success('添加成功')
                        // 重新获取数据
                        this.getData()
                        // 关闭框
                        this.addUserDialog = false
                    }
                }
            })
            
        },
        edit() {
            // 先验证表单
            this.$refs.editUserRef.validate(async c=>{
                if(c)
                {
                    const res = await this.axios.put(`/users/${this.editUserForm.id}`, this.editUserForm)
                    console.log( res )
                    if(res.data.meta.status == 200) {
                        this.$message.success('更新成功')
                        // 重新获取数据
                        this.getData()
                        // 关闭框
                        this.editUserDialog = false
                    }
                }
            })
        },
        // 点击修改时显示表单
        showEditForm(data) {
            // 把要修改的数据绑定到表单中
            this.editUserForm.id = data.id
            this.editUserForm.username = data.username
            this.editUserForm.email = data.email
            this.editUserForm.mobile = data.mobile

            this.editUserDialog = true
        }
    }
}
</script>





<style>
.home .search-box {
  margin-bottom: 15px;
}
</style>