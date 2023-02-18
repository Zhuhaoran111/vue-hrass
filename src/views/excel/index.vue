<template>
    <div class="app-container">
        <!-- 表格上传的组件,table用来展示数据 -->
        <upload-excel-component :on-success="handleSuccess" :before-upload="beforeUpload" />
        <el-table :data="tableData" border highlight-current-row style="width: 100%;margin-top:20px;">
            <el-table-column v-for="item of tableHeader" :key="item" :prop="item" :label="item" />
        </el-table>
    </div>
</template>

<script>
//导入上传的组件
import UploadExcelComponent from '@/components/UploadExcel/index.vue'
import { importEmployeeAPI } from '@/api/'
import { formatExcelDate } from '@/utils'
export default {
    name: 'UploadExcel',
    components: { UploadExcelComponent },
    data() {
        return {
            //表格的数据
            tableData: [],
            //表格的头部数据  
            tableHeader: []
        }
    },
    methods: {
        beforeUpload(file) {
            //file就是上传的文件对象-size的单位是Byte
            //1Byte(字节)计算机里面保存一个字母/数字需要的二进制位个数(1Byte=8bit)
            //1KB=1024(字节)
            //1MB=1024KB
            const isLt1M = file.size / 1024 / 1024 < 1

            if (isLt1M) {
                return true  //通过
            }

            this.$message({   //不通过范围false,并提示
                message: 'Please do not upload files larger than 1m in size.',
                type: 'warning'
            })
            return false
        },
        //接收UploadExcel组件内,读取表格成功头部数据和表格体的数据
        async handleSuccess({ results, header }) {
            this.tableData = results
            this.tableHeader = header
            //result是数组套对象
            //每个对象对应一行数据
            //results里面，就是表格的所有数据

            //header就是第一行列标题字符串数组

            //注意:不能直接吧results发给后台，
            //原因是:后台要求传递的数据数组里对象(是英文的key名)
            //解决:后置处理
            //xlsx读取中文的对象数据，拿到以后遍历做一个转换(映射)

            //1.准备中文换英文的映射关系（枚举对象)
            const userRelations = {
                '入职日期': 'timeOfEntry',
                '手机号': 'mobile',
                '姓名': 'username',
                '转正日期': 'correctionTime',
                '工号': 'workNumber',
                '部门': 'departmentName',
                '聘用形式': 'formOfEmployment',
            }
            //注意，这里是遍历一次产生一个新对象,
            //2.遍历数组中的每个对象
            const newArr = results.map(obj => {
                const newObj = {}
                //3.拿到对象里面所有的key名(Object.keys(对象)->返回对象里面所有的key字符串数组)
                const keyArr = Object.keys(obj)   //['入职日期','姓名','工号','手机号','转正日期']   顺序不确定
                //4.遍历每个中文的key，换成对应的英文字符串
                keyArr.forEach(zhKey => {
                    //想把变量里面的值作为对象的key,必须用[]形式
                    const enKey = userRelations[zhKey]   //换出英文的字符串的key

                    //日期处理
                    if (enKey === 'correctionTime' || enKey === 'timeOfEntry') {
                        //newObj[enKey]是新对象里面英文的key，后面是对应的值，进行转换
                        newObj[enKey] = formatExcelDate(obj[zhKey])   //为新的对象，添加英文的key,和对应的值

                    } else {
                        newObj[enKey] = obj[zhKey]   //为新的对象，添加英文的key,和对应的值
                    }

                })
                //新对象上面forEach遍历很多次,新对象里有可很多英文的key+value,在返回这个处理好的英文对象
                return newObj
            })
            const res = await importEmployeeAPI(newArr)
            this.$message.success(res.message)
            this.$router.back()
        }

    }
}
</script>
