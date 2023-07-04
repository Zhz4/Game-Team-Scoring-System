<script lang="ts" setup>
import {defineProps, defineEmits, ref, inject, Ref} from 'vue';
import {FormInstance} from "element-plus";
// const color1 = ref('#409EFF')
let dialogVisible_setUp =  inject('dialogVisible_setUp') as Ref<boolean>
const ruleFormRef = inject('ruleFormRef') as Ref<FormInstance>
const props = defineProps({
  form: {
    type: Object,
  },
  rule: {
    default: () => {
      return {
        peopleCount: [
          {required: true, message: '请输入人数', trigger: 'blur'},
          {
            pattern: /^[1-9]\d*$/,
            message: '请输入正整数',
            trigger: 'blur',
          },
        ],
        ranksCount: [
          {required: true, message: '请输入队伍数', trigger: 'blur'},
          {
            pattern: /^[1-9]\d*$/,
            message: '请输入正整数',
            trigger: 'blur',
          },
        ],
      };
    },
  },
});

/**
 * 关闭清空
 */
const handleClose = () => {
  dialogVisible_setUp.value = false;
};
/**
 * 取消设置房间
 */
const cancel = () => {
  dialogVisible_setUp.value = false;
};
/**
 * 点击确认设置房间
 */
const confirmed = inject('confirmed')
</script>
<template>
  <el-dialog
      v-model="dialogVisible_setUp"
      :before-close="handleClose"
      style="background-color: #272a37; border-radius: 20px"
      width="50%"
  >
    <template #header="{ titleId }">
      <div class="my-header" style="color: #e2dfdfe8">
        <h4 :id="titleId">设置房间</h4>
      </div>
    </template>
      <el-form
        ref="ruleFormRef"
        :model="form"
        :rules="rule"
        label-width="120px"
      >
        <el-form-item class="item" label="人数" prop="peopleCount">
          <el-input
            v-model.number.trim="form.peopleCount"
            maxlength="3"
          />
        </el-form-item>
        <el-form-item label="队伍数" prop="ranksCount">
          <el-input v-model.number.trim="form.ranksCount" maxlength="3" />
        </el-form-item>
      </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="cancel">取消</el-button>
        <el-button type="primary" @click="confirmed(ruleFormRef)">
          确认
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>
<style lang="less">
.el-form-item__label{
  color: #c5c5c5;
  font-weight:bold;
}
</style>
