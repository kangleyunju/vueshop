<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 搜索框 -->
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

    <!-- 表格 -->
    <el-table :data="userList" border style="width: 100%">
      <el-table-column type="index" width="50"></el-table-column>
      <el-table-column prop="username" label="名字"></el-table-column>
      <el-table-column prop="email" label="邮箱"></el-table-column>
      <el-table-column prop="mobile" label="手机号"></el-table-column>
      <el-table-column prop="role_name" label="角色"></el-table-column>
      <el-table-column prop="mg_state" label="状态">
        <template slot-scope="data">
          <el-switch
            @change="changeState($event, data.row)"
            v-model="data.row.mg_state"
            active-color="#399bfb"
          ></el-switch>
        </template>
      </el-table-column>

      <el-table-column prop="caozuo" label="操作">
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

    <!-- 分页 -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[2, 5, 10, 20]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
    ></el-pagination>
  </div>
</template>

<script>
export default {
  data() {
    return {
      userList: [],
      total: 0,
      searchKey: "",
      queryInfo: {
        query: "", //关键字
        pagenum: "1",
        pagesize: "2"
      }
    };
  },

  methods: {
    handleSizeChange(val) {
      this.queryInfo.pagesize = val;
    },
    handleCurrentChange(val) {
      this.queryInfo.pagenum = val;
    },

    async getData() {
      // 向接口传参数：
      // GET 方式：使用第二个参数传参数： { params: 数据对象 }
      // POST 方式：使用第二个参数传参数：数据对象
      let { data: res } = await this.axios.get("/users", {
        params: this.queryInfo
      });
      if (res.meta.status != 200)
        return this.$message.error("用户数据获取失败！");
      console.log(res);
      // 保存用户列表
      this.userList = res.data.users;
      this.total = res.data.total;
    },
    //改变状态按钮
    async changeState(val, row) {
      let res = await this.axios.put(`/users/${row.id}/state/${val}`);
      console.log(res);
      if (res.data.meta.status != 200) {
        setTimeout(() => {
          // 如果失败将状态改变回去
          row.mg_state = !row.mg_state;
        }, 300);
        return this.$message.error("更新状态失败！");
      }
      this.$message.success("更新状态成功！");
    }
  },

  //监听
  watch: {
    queryInfo: {
      deep: true,
      // 对象一改变，handler 函数就会被调用了
      handler() {
        this.getData();
      }
    }
  },
  created() {
    this.getData();
  }
};
</script>