<template>
    <div class="user-info">
        <!-- 个人信息 -->
        <el-form label-width="220px">
            <!-- 工号 入职时间 -->
            <el-row class="inline-info">
                <el-col :span="12">
                    <el-form-item label="工号">
                        <el-input v-model="userInfo.workNumber" class="inputW" />
                    </el-form-item>
                </el-col>

                <el-col :span="12">
                    <el-form-item label="入职时间">
                        <el-date-picker v-model="userInfo.timeOfEntry" style="width: 300px" type="date"
                            class="inputW" />
                    </el-form-item>
                </el-col>
            </el-row>
            <!-- 姓名 部门 -->
            <el-row class="inline-info">
                <el-col :span="12">
                    <el-form-item label="姓名">
                        <el-input v-model="userInfo.username" class="inputW" />
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="部门">
                        <el-input v-model="userInfo.departmentName" class="inputW" />
                    </el-form-item>
                </el-col>
            </el-row>
            <!--手机 聘用形式  -->
            <el-row class="inline-info">
                <el-col :span="12">
                    <el-form-item label="手机">
                        <el-input v-model="userInfo.mobile" style="width: 300px" readonly />
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="聘用形式">
                        <el-select v-model="userInfo.formOfEmployment" class="inputW">
                            <el-option v-for="item in EmployeeEnum.hireType" :key="item.id" :label="item.value"
                                :value="item.id" />
                        </el-select>
                    </el-form-item>
                </el-col>
            </el-row>
            <!-- 员工照片 -->
            <el-row class="inline-info">
                <el-col :span="12">
                    <el-form-item label="员工头像">
                        <!-- 放置上传图片 -->
                        <upload-img ref="uplaodImg" :staffPhoto="userInfo.staffPhoto" />
                    </el-form-item>
                </el-col>
            </el-row>
            <!-- 保存个人信息 -->
            <el-row class="inline-info" type="flex" justify="center">
                <el-col :span="12">
                    <el-button type="primary" @click="saveUser">保存更新</el-button>
                    <el-button @click="$router.back()">返回</el-button>
                </el-col>
            </el-row>
        </el-form>
    </div>
</template>
  
<script>
import { getUserPhotoApi, updateEmployeesAPI } from '@/api';
import EmployeeEnum from '@/api/constant'
import { Upload } from 'element-ui';
export default {
    name: "UserInfo",
    data() {
        return {
            userId: this.$route.query.id,
            EmployeeEnum,
            userInfo: {},
        };
    },
    created() {
        this.getUserInfoFn();
    },
    methods: {
        //获取用户信息
        async getUserInfoFn() {
            const res = await getUserPhotoApi(this.$route.query.id);
            this.userInfo = res.data;
            //额外加一个聘用形式
            //下面这样写，为何点击下拉框的值不变，标签里显示的值不变，但是
            //vue里面的数据变了，
            //问题：视图->数据(v),但是数据->向用没有更新给视图
            //vue框架原理:响应式原理
            //vue会检测data里面的每个变量(如果变量本身改变了->上面那句话，响应式更新视图所有)
            //检测userInfo里的每个属性(检测到变化，会更新数据+视图)
            //走到这句话的时候，数据->视图(但是没有绑定数据劫持)
            //给对象后续添加一个属性的时候，不会触发响应式
            // this.userInfo.formOfEmployment = this.$route.query.form   不好使
            //后续添加属性利用$set()触发双向绑定时，数据改变，视图更新
            //$set()vue内部提供的一个专门更新数组/对象某个值的(并且额外添加数据劫持)
            //参数1:数组/目标
            //参数2：下标，属性名
            //参数3：值
            this.$set(this.userInfo, "formOfEmployment", this.$route.query.form);
        },
        //保存个人信息的点击事件
        async saveUser() {
            this.userInfo.staffPhoto = this.$refs.uplaodImg.imageUrl
            const res = await updateEmployeesAPI(this.userInfo);
            this.$message.success(res.message);
            this.$router.back()  ///方法route带r的
        }
    },
    components: { Upload }
}

</script>
  
<style lang="scss" scoped>
.user-info {
    padding-top: 20px;
}
</style>