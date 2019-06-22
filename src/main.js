import Vue from 'vue'
import App from './App.vue'
import router from './router'

//引入element ui
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
Vue.use(ElementUI)

// 引入 axios 的包
import axios from 'axios'
import VueAxios from 'vue-axios'
Vue.use(VueAxios, axios)

// 设置接口的基地址
Vue.axios.defaults.baseURL = 'http://127.0.0.1:11333/api/private/v1';

// 添加请求拦截器
Vue.axios.interceptors.request.use(function (config) {
  // 这里的代码，在每次发送 AJAX 之前都会被自动执行
  // config ：将要发送的 ajax 的数据对象
  // 向数据对象中添加一个协议头，添加上令牌
  // 添加一个 Authorization: xxxx 的协议头
  config.headers = { Authorization: sessionStorage.getItem('token') }
  return config;
});


// 引入全局样式
import "./assets/global.css"

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
