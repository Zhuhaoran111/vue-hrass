<template>
    <div class="login-setting">
        <el-form ref="userForm" :rules="rules" :model="userInfo" label-width="120px"
            style="margin-left: 120px; margin-top: 30px">
            <el-form-item label="姓名:" prop="username">
                <el-input v-model="userInfo.username" style="width:300px" />
            </el-form-item>

            <el-form-item label="密码:" prop="password">
                <el-input v-model="userInfo.password" type="password" style="width:300px" />
            </el-form-item>

            <el-form-item>
                <el-button type="primary" @click="updateInfo">更新</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>
  
<script>
import { getUserPhotoApi, updateEmployeesAPI } from '@/api'
export default {
    name: 'LoginSetting',
    data() {
        return {
            userInfo: {
                username: '',
                password: ''
            },
            rules: {
                username: [{ required: true, message: '用户名不能为空', triggler: 'blur' }],
                password: [{ required: true, message: '密码不能为空', triggler: 'blur' }]
            }
        }
    },
    created() {
        // 调用获取用户详情的方法
        this.getUserInfoFn()
    },
    methods: {
        // 获取用户详情
        async getUserInfoFn() {
            const res = await getUserPhotoApi(this.$route.query.id)
            this.userInfo = res.data
        },
        //更新用户名和密码
        updateInfo() {
            this.$refs.userForm.validate(async valid => {
                if (valid) {
                    const res = await updateEmployeesAPI(this.userInfo)
                    this.$message.success(res.message)
                }
            })
        }
    }
}
</script>
  
<style lang="scss" scoped>

</style>