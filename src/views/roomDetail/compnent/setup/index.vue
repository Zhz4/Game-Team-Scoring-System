<template>
  <div>
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
      <!-- 设置表单 -->
      <el-form
          ref="ruleFormRef"
          :model="form"
          :rules="rule"
          label-width="120px"
      >
        <el-form-item label="人数" prop="peopleCount">
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
  </div>
</template>

<script>

</script>

<style scoped>

</style>
