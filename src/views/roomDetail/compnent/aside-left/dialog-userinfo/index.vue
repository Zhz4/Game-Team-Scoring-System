<script lang="ts" setup>
import {inject, reactive, Ref} from "vue";
import store from "@/store";
import {ElMessage} from "element-plus";
import {getUsername} from "@/util/Token";

let dialogVisible_userinfo =  inject('dialogVisible_userinfo') as Ref<boolean>
const ws = store.state.websocket;

const form = reactive({
  username: getUsername(),
})
const handleClose_team = ()=>{
  dialogVisible_userinfo.value = false
}

const cancel = ()=>{
  dialogVisible_userinfo.value = false
}

const confirmed = () => {
  if (form.username === '') {
    ElMessage({
      message: "用户名不能为空",
      type: "error",
    });
    return;
  }
  ws?.send(
      JSON.stringify({
        type: "modifyNickname",
        newUsername: form.username,
      })
  );
  dialogVisible_userinfo.value = false
}

</script>

<template>
  <el-dialog
      v-model="dialogVisible_userinfo"
      :before-close="handleClose_team"
      style="background-color: #272a37; border-radius: 20px"
      width="50%"
  >
    <template #header="{ titleId }">
      <div class="my-header" style="color: #e2dfdfe8">
        <h4 :id="titleId">个人设置</h4>
      </div>
    </template>
    <el-form
        :model="form"
        label-width="120px">
      <el-form-item label="用户名" prop="name" >
        <el-input v-model="form.username" maxlength="9"/>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="cancel">取消</el-button>
        <el-button type="primary" @click="confirmed">
          确认
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style lang="less" scoped>

</style>
