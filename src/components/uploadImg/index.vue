<template>
    <div>
        <!-- 
            action：上传的地址(此属性必须写)
            show-file-list:是否显示上传的文件列表(标签下出现已经上传成功的文件名等)
            on-success：文件上传成功的钩子(回调右侧的函数执行，组件会给我们传值)
                        成功是前端->后端action地址(成功)
            before-upload:上传文件的钩子(函数内return false或者reject拒绝Promise对象)
            uplaod组件内停止往后端上传文件(主要作用，上传之前一个判断)

            //http-request使用后，默认上传的内部ajax就不在执行
            action写了也是没用的，也不会执行on-success

         -->
        <el-upload class="avatar-uploader" action="staffPhoto" :show-file-list="false" :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload" :http-request="upload">
            <img v-if="imageUrl" :src="imageUrl" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon" />
            <el-progress v-show="showProgress" type="circle" :percentage="percentage" class="progress"></el-progress>
        </el-upload>
    </div>
</template>

<script>
const COS = require('cos-js-sdk-v5')
// SECRETID 和 SECRETKEY请登录 https://console.cloud.tencent.com/cam/capi 进行查看和管理
var cos = new COS({
    SecretId: 'AKIDcBdlocTBj6ShFdswnSvDG6uVs46vWxBD',  //腾讯云的id,密码
    SecretKey: 'yhLmzyiGsIUj9XpnkW5QZWFl4A8tRjne'
})

export default {
    name: 'UploadImg',
    data() {
        return {
            imageUrl: '',   //上传成功的图片地址(外链)
            showProgress: false,
            percentage: 0 //进度条百分比(0-100)
        }
    },
    props: {
        staffPhoto: {
            type: String,
            default: ''
        }
    },

    watch: {
        staffPhoto(data) {
            this.imageUrl = data
        }
    },

    methods: {
        //文件上传成功到后台的回调函数
        //file是前端本地磁盘里，上传到浏览器上的，的这个文件对象信息

        //Object URL Array Map  Set是Js内置的对象(无需声明,直接使用)
        //URL.createObjectURL()方法，把vi文件数据，转成blob:临时的前端地址
        //可以用于img临时加载此前端文件在浏览器上img标签中进行显示

        //知识点1：img标签的src属性(base:64字符串，外链地址,相对地址,blob的临时地址)
        //知识点2:想要做上传图片的预览
        //思路1：上传文件到服务器后，让后端返回图片在服务器外链地址,加载给img标签给src做图片预览(必须上传成功)
        //思路2：纯前端(曲序上传到服务器,图片文件显示到页面上)URL.createObjectURL()
        handleAvatarSuccess(res, file) {
            //res:后端返回的响应数据(upload里面自带ajax请求，不会走封装的request.js)
            this.imageUrl = URL.createObjectURL(file.raw)
        },

        beforeAvatarUpload(file) {
            const isJPG = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'].includes(file.type)
            const isLt2M = file.size / 1024 / 1024 < 2

            if (!isJPG) {
                this.$message.error('上传头像图片只能是 JPG 格式!')
            }
            if (!isLt2M) {
                this.$message.error('上传头像图片大小不能超过 2MB!')
            }
            return isJPG && isLt2M
        },
        // 自定义上传属性
        upload(res) {
            this.showProgress = true //上传一瞬间
            if (res.file) {   //res.file，本地上传到浏览器的文件对象
                cos.putObject({
                    Bucket: '774861369-1316823326', // 存储桶的名称，必须
                    Region: 'ap-nanjing', // 存储桶所在地域，必须字段
                    Key: res.file.name, // 文件名，必须,存储桶里里面的文字
                    StorageClass: 'STANDARD', // 上传模式, 标准模式 存储的类型
                    Body: res.file, // 上传文件对象
                    // 上传进度条
                    //progressData.percent->进度条(0,1)区间
                    onProgress: (progressData) => {
                        this.percentage = parseInt(progressData.percent * 100)
                    }
                }, (err, data) => {
                    if (err === null && data.statusCode === 200) {
                        //图片显示预览
                        this.imageUrl = 'http://' + data.Location
                        setTimeout(() => {
                            this.showProgress = false
                        }, 1000)
                    }
                })
            }
        }
    }
}
</script>

<style>
.avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
}

.avatar-uploader .el-upload:hover {
    border-color: #409EFF;
}

.avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 160px;
    height: 160px;
    line-height: 178px;
    text-align: center;
}

.avatar {
    width: 178px;
    height: 178px;
    display: block;
}

.progress {
    position: absolute;
    display: flex;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #e4e4e4;
    border-radius: 50%;
    opacity: 0.9;
}
</style>
