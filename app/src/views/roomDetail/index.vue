<template>
  <div>
    <div>
      房间号：
      {{ roomId }}
    </div>
    <div>
      房间设置信息：
      <p>房间容量：{{ peopleCount }}人</p>
      <p>队伍数量：{{ ranksCount }}队</p>
    </div>
    <div>
      在该房间的人
      <div v-for="(item, index) in member" :key="index">
        {{ item }}
      </div>
    </div>
    <div>
      <el-button type="primary" @click="out">退出房间</el-button>
    </div>
    <div>
      <el-button type="primary" @click="setUp">设置</el-button>
      <el-dialog
        v-model="dialogVisible_setUp"
        :before-close="handleClose"
        title="设置"
        width="50%"
      >
        <!-- 设置表单 -->
        <el-form
          ref="ruleFormRef"
          :model="form"
          :rules="rule"
          label-width="120px"
        >
          <el-form-item label="人数" prop="peopleCount">
            <el-input v-model.number.trim="form.peopleCount" maxlength="3" />
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
    <!-- 开始游戏 -->
    <div class="startgame">
      <el-button type="primary" @click="startGame = 1">开始比赛</el-button>
      <el-button type="primary" @click="startGame = 2">暂停比赛</el-button>
      <el-button type="primary" @click="startGame = 0">结束比赛</el-button>
    </div>
    <div>
      <el-input v-model="score" placeholder="请输入分数" />
      <el-button type="primary" @click="scoreConfirmation">确认</el-button>
    </div>
    <div v-if="startGame !== 1">
      您选择的队伍为：
      <div
        class="randomColorBox"
        :style="{ backgroundColor: selectRanksColor }"
      ></div>
      第{{ selectRanksIndex }}队
    </div>
    <div v-if="startGame !== 1">
      请选择队伍
      <div ref="colorbox">
        <div
          class="randomColorBox"
          v-for="(item, index) in randomColor"
          :style="{ backgroundColor: item.color }"
          @click="selectColorBox(index)"
          :key="index"
        >
          {{ index + 1 }}
        </div>
      </div>
    </div>
    <div v-if="startGame !== 1">
      <div>分队情况</div>
      <div class="clearfix" v-for="(item, index) in sortedScore" :key="index">
        <div
          class="randomColorBox fl"
          :style="{ backgroundColor: item.color }"
        ></div>
        <div
          class="fl"
          v-for="(item_member, index) in item.member"
          :key="index"
        >
          {{ item_member }}
        </div>
      </div>
    </div>
    <!-- 排行榜 -->
    排行榜
    <div class="ranking" v-for="(item, index) in sortedScore" :key="index">
      <!-- 颜色 -->
      <div
        class="randomColorBox"
        :style="{ backgroundColor: item.color }"
      ></div>
      <!-- 名字 -->
      <div class="name">队伍名称：{{ item.name }}</div>
      <!-- 分数 -->
      <div class="score">队伍得分：{{ item.score }}</div>
      <!-- 队员 -->
      <div class="member">
        队员：
        <div
          v-for="(item_member, index_member) in item.member"
          :key="index_member"
        >
          {{ item_member }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, onMounted, reactive, ref, computed } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import router from "../../router";
import { ElMessage, FormInstance, FormRules } from "element-plus";
import { Team } from "../../interface/setUp";
import { fullColorHex } from "../../util/colorConvert";

const store = useStore();
const roomId = router.currentRoute.value.params.roomId;
const sign = store.state.sign;
const ruleFormRef = ref<FormInstance>();
const outIN = ref<boolean>(false); // 判断是否执行了退出操作
const ws = ref<WebSocket | null>(null);
const randomColor = ref<any>([]);
const score = ref<string>("");
const startGame = ref<number>(0); // 是否开始游戏 0：结束 1：开始 2：暂停
let colorbox = ref<any>(); // 操作dom
let selectRanksColor = ref<string>("");
let selectRanksIndex = ref<string>("");
let dialogVisible_setUp = ref<boolean>(false);
let ranksCount = ref<string>("");
let peopleCount = ref<string>("");
let form = reactive({
  peopleCount: "",
  ranksCount: "",
});
const member = ref<any>([]);
/**
 * 表单校验
 * @param rule
 * @param value
 * @param callback
 */
const validateRanksCount = (rule: any, value: any, callback: any) => {
  if (Number(value) > Number(form.peopleCount)) {
    callback(new Error("队伍数不能大于人数"));
  } else if (value === "") {
    callback(new Error("队伍数不能为空"));
  } else {
    callback();
  }
};
const validatePeopleCount = (rule: any, value: string, callback: any) => {
  if (value === "") {
    callback(new Error("人数不能为空"));
  } else if (Number(value) < member.value.length) {
    callback(new Error("人数不能少于当前房间人数"));
  } else {
    callback();
  }
};
// 表单校验
const rule = reactive<FormRules>({
  peopleCount: [
    { type: "number", message: "必须填数字！" },
    { validator: validatePeopleCount },
  ],
  ranksCount: [
    { type: "number", message: "必须填数字！" },
    { validator: validateRanksCount },
  ],
});
/**
 * websorket初始化
 */
const createws = () => {
  const wss = store.state.websocket;
  ws.value = wss;
  wss.onmessage = (event: { data: string }) => {
    // TODO 监听数据
    const data = JSON.parse(event.data);
    console.log(data);
    if (
      data.type === "join" ||
      data.type === "delete" ||
      data.type === "check"
    ) {
      if (data.type === "join" && data.joinType === "fullyOccupied") {
        outIN.value = true;
        router.replace({
          name: "JoinRoom",
        });
        ElMessage({
          type: "warning",
          message: data.msg,
        });
        return;
      }
      member.value = data.member.map(
        (item: { nickname: string }) => item.nickname
      );
      // form = data.TeamSetting
      try {
        peopleCount.value = data.TeamSetting.peopleCount;
        ranksCount.value = data.TeamSetting.ranksCount;
        randomColor.value = data.TeamSetting.ranksColorList;
        randomColor.value = data.TeamSetting.ranksColorList;
      } catch (e) {
        console.log(e);
      }
    }
    if (data.type === "setUp") {
      watchSetUp(data);
      randomColor.value = data.data.ranksColorList;
      selectRanksColor.value = "";
      selectRanksColor.value = "";
    }
    if (data.type === "selectTeam") {
      randomColor.value = data.TeamSetting.ranksColorList;
    }
    if (data.type === "addScore") {
      randomColor.value = data.TeamSetting.ranksColorList;
    }
  };
  try {
    ws.value?.send(JSON.stringify({ type: "join", roomId: roomId }));
  } catch (e) {
    console.log(e);
  }
};
/**
 * 推出房间按钮
 */
const out = () => {
  ws.value?.send(JSON.stringify({ type: "out" }));
  outIN.value = true;
  router.replace({
    name: "JoinRoom",
  });
};
const setUp = () => {
  dialogVisible_setUp.value = true;
  form.peopleCount = peopleCount.value;
  form.ranksCount = ranksCount.value;
};

/**
 * 点击确认分数
 */
const scoreConfirmation = () => {
  // TODO 点击确认分数
  if (score.value === "") {
    ElMessage({
      type: "warning",
      message: "分数不能为空",
    });
    return;
  }
  if (selectRanksIndex.value === "" && selectRanksColor.value === "") {
    ElMessage({
      type: "warning",
      message: "请选择队伍",
    });
    return;
  }
  ws.value?.send(
    JSON.stringify({
      type: "addScore",
      score: Number(score.value),
      roomId: roomId,
    })
  );
  score.value = "";
};

/**
 * 生成n个随机颜色
 * @param n 颜色的个数
 */
const handleRandomColor = (n: string) => {
  // TODO 生成随机颜色标记
  if (n == "") return;
  const teams: Array<object> = [];
  for (let i = 0; i < Number(n); i++) {
    let team = <Team>{};
    const color = "#" + Math.floor(Math.random() * 16777215).toString(16);
    team.color = color;
    team.name = color;
    team.member = [];
    team.score = 0;
    teams.push(team);
  }
  return teams;
};

/**
 * 关闭清空
 */
const handleClose = () => {
  // form.ranksCount = "";
  // form.peopleCount = "";
  dialogVisible_setUp.value = false;
};
/**
 * 监听到了房间的设置信息
 * @param data 房间设置信息
 */
const watchSetUp = (data: {
  nickname: string;
  data: { peopleCount: string; ranksCount: string };
}) => {
  peopleCount.value = data.data.peopleCount;
  ranksCount.value = data.data.ranksCount;
  // Object.assign(form, data.data);

  ElMessage({
    message: `${data.nickname}修改了房间设置`,
    type: "success",
  });
};

/**
 * 点击确认设置房间
 */
const confirmed = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate((valid, fields) => {
    if (valid) {
      const TeamSetting = {
        peopleCount: form.peopleCount,
        ranksCount: form.ranksCount,
        ranksColorList: handleRandomColor(form.ranksCount),
      };
      ws.value?.send(
        JSON.stringify({
          type: "setUp",
          TeamSetting: TeamSetting,
          roomId: roomId,
        })
      );
      selectRanksIndex.value = "";
      selectRanksColor.value = "";
      dialogVisible_setUp.value = false;
    } else {
      ElMessage({
        message: `请检查好格式后提交`,
        type: "error",
      });
    }
  });
};

/**
 * 取消设置房间
 */
const cancel = () => {
  dialogVisible_setUp.value = false;
};
/**
 * 选中按钮样式
 * @param index
 */
const selectColorBox = (index: number) => {
  const mycolorDom: HTMLElement[] = Array.from(colorbox.value.children);
  // 其他颜色恢复正常
  mycolorDom.forEach((item) => {
    item.style.opacity = "1";
  });
  // 选中颜色变浅
  mycolorDom[index].style.opacity = "0.5";
  const rgb: string = mycolorDom[index].style.backgroundColor;
  selectRanksColor.value = fullColorHex(rgb);
  selectRanksIndex.value = (index + 1).toString();
  ws.value?.send(
    JSON.stringify({
      type: "selectTeam",
      color: selectRanksColor.value,
      roomId: roomId,
    })
  );
};
/**
 * 排行榜按照分数排序
 */
const sortedScore = computed(() => {
  return randomColor.value.sort((a: any, b: any) => b.score - a.score);
});
onMounted(() => {
  createws();
  document.getElementsByTagName("body")[0].className = "add_bg_roomDetail";
});
onBeforeUnmount(() => {
  if (!outIN.value) {
    // 已经点了按钮就不用再执行退出了，否则就执行
    ws.value?.send(JSON.stringify({ type: "out" }));
  }
});
</script>

<style lang="less" scoped>
@import "./index";
@import "@/assets/less/base.less";
</style>
