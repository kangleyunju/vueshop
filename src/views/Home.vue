<template>
  <el-container>
    <el-header>
      <div>
        <img src="../assets/logo.png" alt>
        <span>后台管理系统</span>
      </div>
      <el-button size="medium" :to="{ path: 'login' }">退出</el-button>
    </el-header>

    <el-container>
      <!-- 左侧菜单 -->
      <el-aside width="200px">
        <el-menu
          :router="true"
          background-color="#545c64"
          text-color="#fff"
          active-text-color="#399bfb"
        >

          <el-submenu v-for="(item, index) in menuList" :key="index" :index="item.path">
            <!-- 插槽：一级按钮 -->
            <template slot="title">
              <i class="el-icon-location"></i>
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级按钮 -->
            <el-menu-item v-for="(item1, index1) in item.children" :key="index1" :index="item1.path">
              {{item1.authName}}
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>

      <!-- 右侧主体 -->
      <el-main>
        <!-- 子组件容器 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<style>
.el-container {
  height: 100%;
}
.el-header img {
  width: 50px;
  /* 图片和文字垂直中线对齐 */
  vertical-align: middle;
}

.el-header {
  background-color: #1b6088;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.el-aside {
  background-color: #545c64;
  height: 100%;
}
</style>


<script>
export default {
  // 页面中要使用的数据必须要定义到 data 中
  data() {
    return {
      menuList: []
    }
  },
  // 获取初始数据
  async created() {
    const menus = await this.axios.get('/menus', {
      headers: {Authorization: sessionStorage.getItem('token')}
    })
    // console.log( menus )
    // 失败时弹出框 
    if(menus.data.meta.status != 200) return this.$message.error('获取菜单列表失败')
    // 保存到 data 中，然后就可以在页面只使用了
    this.menuList = menus.data.data
  }
}
</script>




