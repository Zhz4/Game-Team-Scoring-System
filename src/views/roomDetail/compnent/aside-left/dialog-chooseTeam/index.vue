<script lang="ts" setup>
import {inject, ref, Ref} from "vue";
import {fullColorHex} from "@/util/colorConvert";
import store from "@/store";
const ws = store.state.websocket;
let colorbox = ref<any>(); // 操作dom

const props = defineProps({
  randomColor: {
    type: Array,
  },
  roomId:{
    type: String,
  },
});
let dialogVisible_choiceTeam = inject('dialogVisible_choiceTeam') as Ref<boolean>;
let selectRanksColor = inject('selectRanksColor') as Ref<string>;
let startGame = inject('startGame') as Ref<number>;
let selectRanksIndex = inject('selectRanksIndex') as Ref<string>;
let selectRankId = inject('selectRankId') as Ref<string>;
let selectRanksName = inject('selectRanksName') as Ref<string>;
// 选择队伍dialog
const handleClose_choiceTeam = () => {
  dialogVisible_choiceTeam.value = false;
};
/**
 * TODO 选中按钮样式
 * @param index
 * @param item
 */
const selectColorBox = (index: number,item:{id:string,name:string}) => {
  const mycolorDom: HTMLElement[] = Array.from(colorbox.value.children);
  console.log(mycolorDom);
  // 其他颜色恢复正常
  mycolorDom.forEach((item: any) => {
    item.children[0].style.opacity = "1";
    item.style.backgroundColor = "#100c2a";
  });
  // 选中颜色变浅
  (mycolorDom[index].children[0] as HTMLElement).style.opacity = "0.5";
  (mycolorDom[index] as HTMLElement).style.backgroundColor = "#484d5fa0";
  const rgb: string = (mycolorDom[index].children[0] as HTMLElement).style
      .backgroundColor;
  selectRanksColor.value = fullColorHex(rgb);
  selectRanksIndex.value = (index + 1).toString();
  selectRanksName.value = item.name;
  selectRankId.value = item.id;
  ws?.send(
      JSON.stringify({
        type: "selectTeam",
        id:item.id,
        color: selectRanksColor.value,
        roomId: props.roomId,
      })
  );
};
</script>
<template>
  <el-dialog
      class="dialog"
      v-model="dialogVisible_choiceTeam"
      :before-close="handleClose_choiceTeam"
      width="30%"
      style="background-color: #272a37; border-radius: 20px"
  >
    <template #header="{ titleId }">
      <div class="my-header" style="color: #e2dfdfe8;height: 10px">
        <h4 :id="titleId">选择队伍</h4>
      </div>
    </template>
    <el-scrollbar>
      <div class="dialog-body" v-if="startGame !== 1">
        <div ref="colorbox" class="chooseATeamFatherDialogBox">
          <div
              class="subTeam"
              v-for="(item, index) in randomColor"
              @click="selectColorBox(index,item)"
              :key="index"
          >
            <div
                class="randomColorBox"
                :style="{ backgroundColor: item.color }"
            ></div>
            <span> {{ item.name }}</span>
          </div>
        </div>
      </div>
    </el-scrollbar>
<!--    <template #footer>-->
<!--      <span class="dialog-footer">-->
<!--        <el-button-->
<!--            type="primary"-->
<!--            @click="dialogVisible_choiceTeam = false"-->
<!--        >-->
<!--          确认-->
<!--        </el-button>-->
<!--      </span>-->
<!--    </template>-->
  </el-dialog>
</template>
<style lang="less">
.el-scrollbar .el-scrollbar__wrap {
  max-height: 50vh;
  //max-height: 300px;
}
// 对话框内部样式
.dialog-body {
  color: #e2dfdfe8;
  cursor: pointer;
}
// 组队颜色盒子
.randomColorBox {
  width: 50px;
  height: 50px;
  border: 2px solid #ffffffda;
  transition: background-color 0.1s ease;
  border-radius: 50%;
}
// 选择队伍对话框子队伍
.chooseATeamFatherDialogBox {
  display: flex;
  flex-direction: column;
  gap: 5px;

  .subTeam {
    display: flex;
    gap: 10px;
    align-items: center;
    // 主轴线两边对齐
    justify-content: space-between;
    background-color: #100c2a;
    padding: 10px 20px;
    border-radius: 10px;

    &:hover {
      .boxHover(#484d5fa0)
    }
  }
}
// 盒子悬浮
.boxHover(@bgc) {
  transition: background-color .1s ease;
  background-color: @bgc !important;
}
</style>
