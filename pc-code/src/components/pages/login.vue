<template>
  <div class="login">
    <h2 class="login-title">系统登录</h2>
    <el-row type="flex" justify="center">
      <el-col :span="6">
        <el-form ref="form" label-width="80px">
          <el-form-item label="用户名">
            <el-input placeholder="请输入用户名" v-model="username"></el-input>
          </el-form-item>
          <el-form-item label="密码">
            <el-input placeholder="请输入密码" type="password" v-model="password"></el-input>
          </el-form-item>
          <el-form-item>
            <div style="display:flex;justify-content: center;">
              <el-button type="primary" size="large" @click="login">登录</el-button>
              <el-button size="large" @click="reset">重置</el-button>
            </div>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  data () {
    return {
      username: '',
      password: ''
    }
  },
  methods: {
    verify () {
      var me = this
      if (me.username === '') {
        me.$message({
          message: '请输入用户名',
          type: 'warning'
        });
        return false
      }
      if (me.password === '') {
        me.$message({
          message: '请输入密码',
          type: 'warning'
        });
        return false
      }
      return true
    },
    reset () {
      this.username = '';
      this.password = '';
    },
    login () {
      let me = this
      if (this.verify()) {
        let url = window.baseUrl + 'autoLoginWithCookie'
        axios.get(url, {
          params: {
            username: me.username,
            password: me.password
          }
        }).then(function (res) {
          let data = res.data
          if (data) {
            if (data.code === 1) {
              //登录成功
              data.data.forEach((item, index) => {
                me.setcookie(item.name, item.value);
              })
              me.$message({
                message: '登陆成功',
                type: 'success'
              });
              //跳转到供应商发货列表
              me.$router.push('/home/supplyList')
            } else {
              me.$message({
                message: '账号或密码错误',
                type: 'error'
              });
            }
          }
        })
      }
    },
    setcookie (name, value) {
      //设置名称为name,值为value的Cookie
      var expdate = new Date();   //初始化时间
      expdate.setTime(expdate.getTime() + 30 * 60 * 1000);   //时间
      document.cookie = name + "=" + value + ";expires=" + expdate.toGMTString() + ";path=/";
    }
  }
}
</script>

<style scoped>
</style>
