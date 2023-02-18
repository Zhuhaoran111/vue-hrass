<template>
    <div>
        <!-- checkbox 标签内容如果无,就用label属性值作为按钮后介绍
            roleIdsList绑定的值就是label的值，这个后端具体要什么值,
            具体复选框显示的文字可以用双标签夹着。
            当checkbox选中时,会把label的值添加到v-model的数组里,如果未选中就从数值中移除
         -->

        <!-- 问题：关于复选框的回显---勾选
            答案:v-model对应的数组里面有一些值，(这些值会跟循环的checkbox的label中配对)
            配对成功，就会影响checkbox的状态
         -->
        <!-- 渲染角色列表 -->
        <el-checkbox-group v-model="roleIdsList">
            <el-checkbox v-for="item in getRoleList" :key="item.id" :label="item.id">
                <span>{{ item.name }}</span>
            </el-checkbox>
        </el-checkbox-group>
        <el-row class="footer" type="flex" justify="center">
            <el-col :span="6">
                <el-button type="primary" size="small" @click="saveRole">保存</el-button>
                <el-button size="small" @click="cancleDialog">取消</el-button>
            </el-col>
        </el-row>
    </div>
</template>

<script>

export default {
    name: 'AssignRole',
    props: {
        //获取所有角色列表
        getRoleList: {
            type: Array,
            default: () => []
        }
    },
    data() {
        return {
            roleIdsList: []  //里面存的是复选框中选中的信息,也就是复选框中label的值
        }
    },
    methods: {
        // 取消弹框
        cancleDialog() {
            this.$emit('closeRoleDialog')
        },
        //保存分配的角色
        saveRole() {
            this.$emit('addRole', this.roleIdsList)
            this.$emit('closeRoleDialog')
        }
    }
}
</script>

<style lang="scss" scoped>
.footer {
    margin-top: 30px;
}
</style>
