<template>
    <div>
        <h1>登录页面</h1>
        <el-button type="primary" @click="login">登录</el-button>
    </div>
</template>
<script>
export default {
    name:'login',
    methods:{
        login(){
           this.$router.push('/home')
        }
    }
}
</script>

