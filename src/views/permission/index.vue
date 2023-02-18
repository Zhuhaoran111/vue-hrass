<template>
    <div class="permission-container">
        <div class="app-container">
            <!-- 表格 -->
            <page-tools>
                <template #slot-right>
                    <!-- 参数2是子数据的pid也就是当前行父级的id,最高层就是0 -->
                    <el-button type="primary" size="small" @click="addPermission(1, '0')">添加权限</el-button>
                </template>
            </page-tools>
            <el-card>
                <el-table border class="card" :data="permissionData" row-key="id" height="700">
                    <el-table-column label="名称" prop="name" align="center" />
                    <el-table-column label="标识" prop="code" align="center" />
                    <el-table-column label="描述" prop="description" align="center" />
                    <el-table-column label="操作" align="center">
                        <template v-slot="{ row }">
                            <!-- 这里利用row.type===1也可以---后端做了处理 -->
                            <!-- 参数2是子数据的pid也就是当前行父级的id -->
                            <el-button type="text" v-if="row.type == 1" @click="addPermission(2, row.id)">添加</el-button>
                            <el-button type="text" @click="editPession(row.id)">编辑</el-button>
                            <el-button type="text" @click="deletePerssion(row.id)">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-card>
        </div>
        <perDialog ref="perssionDialog" :perssionData="perssionData" :showPerssion="showPerssion"
            @closePerssionDialog="closePerssionDialog" @savePerssion="savePerssion" :isEdit="isEdit"
            :faltPermissionList="faltPermissionList">
        </perDialog>
    </div>
</template>

<script>
import { transTree } from '@/utils/index'
import perDialog from './components/perDialog.vue'
import { getPermissionListAPI, addPermissionAPI, updatePermissionAPI, delPermissionAPI, getPermissionDetailAPI } from '@/api'
export default {
    data() {
        return {
            permissionData: [],  //table中所有的数据
            faltPermissionList: [],//扁平的数据,用于去重
            showPerssion: false,   //添加角色的弹框(显示和隐藏)
            perssionData: {},
            isEdit: false,   //添加和编辑区分
        }
    },
    components: { perDialog },
    created() {
        this.getPerssionList() //获取所有权限的列表
    },
    methods: {

        //获取所有权限的列表
        async getPerssionList() {
            const { data } = await getPermissionListAPI()
            //子级的pid就是父级的id,参数2找的是父级的id,但是有pid就是0，所以最顶层的id就是pid的值0(递归找子对象)
            //为了能让pid为'0'的对象，在数组里面的第一层,然后递归
            //把扁平的数据转化成数状结构(也就是子级，父级都是同级的数据打印下来)
            this.faltPermissionList = data
            this.permissionData = transTree(data, '0')
        },
        //添加权限
        //type是右上角就是1,下面的文字按钮就是2(type值作为新对象type使用)
        addPermission(type, pid) {
            this.isEdit = false
            this.showPerssion = true
            //下面的pid和type接受不到值
            this.$nextTick(() => {
                this.$refs.perssionDialog.formData.type = type
                this.$refs.perssionDialog.formData.pid = pid    //弹框组件里面data里面的值
            })

        },
        closePerssionDialog() {
            this.showPerssion = false

        },
        //保存权限点
        async savePerssion(formData) {
            if (!this.isEdit) {
                const res = await addPermissionAPI(formData)
                this.$message.success('添加权限点成功')
            } else {
                const res = await updatePermissionAPI(formData)
                this.$message.success('编辑权限点成功')
            }
            this.getPerssionList()
        },
        //编辑
        async editPession(id) {
            this.isEdit = true
            this.showPerssion = true
            const res = await getPermissionDetailAPI(id).catch(err => err)
            if (!res.success) return this.$message.error(res.message)
            // 数据回显
            this.$refs.perssionDialog.formData = res.data
        },
        //删除权限的方法
        async deletePerssion(id) {
            const res = await delPermissionAPI(id)
            this.$message.success(res.message)
            this.getPerssionList()
        }
    }
}
</script>

<style lang="scss" scoped>
.card {
    margin-top: 10px
}
</style>
