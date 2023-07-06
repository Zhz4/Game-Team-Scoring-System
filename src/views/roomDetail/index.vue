<template>
  <div id="operatingBox1">
    <!-- PC端 -->
    <el-container id="operatingBox">
      <!-- TODO 上面 -->
      <el-header class="top">
        <div class="top-box">
          <!-- 放置基础信息 -->
          <!-- 房间号 -->
          <div class="roomNumber">
            <span> 房间号:</span>
            <span>
              {{ roomId }}
            </span>
          </div>
          <!-- 开始游戏 -->
          <div class="gameButton">
            <div
              v-if="startGame !== 1"
              class="Sbutton"
              title="开始比赛"
              @click="theBeginningAndEndOfTheGame(1)"
            >
              <svg-icon
                class="icon"
                style="width: 50px; height: 50px"
                icon-class="startgame"
              ></svg-icon>
            </div>
            <div
              v-if="startGame !== 2 && startGame !== 0"
              class="Sbutton"
              title="暂停比赛"
              @click="theBeginningAndEndOfTheGame(2)"
            >
              <svg-icon
                class="icon"
                style="width: 50px; height: 50px"
                icon-class="suspend"
              ></svg-icon>
            </div>
            <div
              v-if="startGame !== 0"
              class="Sbutton"
              title="结束比赛"
              @click="theBeginningAndEndOfTheGame(0)"
            >
              <svg-icon
                class="icon"
                style="width: 60px; height: 60px"
                icon-class="end"
              ></svg-icon>
            </div>
          </div>
          <!-- 右侧盒子 -->
          <div class="right"></div>
        </div>
      </el-header>
      <el-container>
        <!-- TODO 左侧边 -->
        <el-aside class="left">
          <Dialog :form="form" :rule="rule"></Dialog>
          <DialogTeam :roomId="roomId" :id="selectRankId" :selectRanksName="selectRanksName"></DialogTeam>
          <ChooseTeam :randomColor="randomColor" :roomId="roomId"></ChooseTeam>
          <UserInfo></UserInfo>
          <div class="left-box">
            <!-- 操作栏 -->
            <div class="operatingBar">
              <!-- 退出房间 -->
              <div class="operatingItem">
                <span title="退出房间">
                  <svg-icon
                    title="退出房间"
                    class="icon"
                    icon-class="out"
                    @click="out"
                  ></svg-icon>
                </span>
              </div>
              <!-- 房间操作 -->
              <div class="operatingItem">
                <span title="设置">
                  <el-icon class="icon" size="30" @click="setUp"
                    ><SetUp
                  /></el-icon>
                </span>
                <!-- <el-icon class="icon" size="30" @click="setUp"><Setting /></el-icon> -->
              </div>
              <!-- 队伍设置 -->
              <div class="operatingItem">
                <span title="队伍设置">
                  <svg-icon
                      title="队伍设置"
                      class="icon"
                      icon-class="teamsetting"
                      @click="teamsetting_click"
                  ></svg-icon>
                </span>
              </div>
              <!-- 个人设置 -->
              <div class="operatingItem">
                <span title="个人设置">
                  <svg-icon
                      title="个人设置"
                      class="icon"
                      icon-class="userinfo"
                      @click="userinfo_click"
                  ></svg-icon>
                </span>
              </div>
            </div>
            <!-- 分队信息 -->
            <div class="teamInformation">
              <!-- 选择队伍 -->
              <div
                title="点击选择队伍"
                class="theTeamYouChoose"
                @click="handleOpen_choiceTeam"
              >
                <!-- 未选队 -->
                <div
                  class="theTeamYouChoose-unsteadyTeam"
                  v-if="!selectRanksIndex"
                >
                  <div class="theTeamYouChoose-title">请选择您的队伍</div>
                  <svg-icon
                    class="icon"
                    style="width: 40px; height: 40px"
                    icon-class="choose"
                  ></svg-icon>
                </div>
                <!-- 已选队 -->
                <div
                  class="theTeamYouChoose-haveSelectedTeams"
                  v-if="selectRanksIndex"
                >
                  <div
                    class="randomColorBox"
                    :style="{ backgroundColor: selectRanksColor }"
                  ></div>
                  <div style="margin-top: 10px; margin-left: 3px">
                    {{ selectRanksName }}
                  </div>
                </div>
              </div>
              <!--TODO  得分情况 -->
              <scoreCompnent :HistoricalRecord="HistoricalRecord"></scoreCompnent>
            </div>
          </div>
        </el-aside>
        <!-- TODO 中间 -->
        <el-main class="main">
          <div class="main-box">
            <!-- echart 实例 -->
            <div
              id="myEcharts"
              style="
                width: 100%;
                height: 400px;
                border-radius: 10px;
                overflow: hidden;
              "
            ></div>
            <!-- 初始显示 -->
            <div class="initialDisplay" v-if="startGame !== 1">
              <h4>坚持练习、不断改进策略，才能在游戏中获得胜利。</h4>
            </div>
            <!-- 输入分数 -->
            <div class="inputScore" v-if="startGame === 1">
              <div
                class="inputScore-item"
                v-for="(item, index) in Input_select_score"
                :key="index"
                @click="scoreConfirmation(item)"
              >
                {{ item }}分
              </div>
              <div class="inputScore-item">自定义</div>
            </div>
          </div>
        </el-main>
        <!-- TODO 右侧边 -->
        <div class="right">
          <div class="right-box">
            <div>
              <div>
                <svg-icon class="iconDisabled" icon-class="people"></svg-icon>
                <span>房间容量：{{ peopleCount }}</span>
              </div>
              <div>
                <svg-icon
                  class="iconDisabled"
                  icon-class="teamcount"
                ></svg-icon>
                <span>队伍数量：{{ ranksCount }}</span>
              </div>
            </div>
            <div>
              <p>在线人员：{{ member.length }}</p>
              <el-scrollbar height="380px" always>
                <div
                  style="min-width: 150px; display: flex; align-items: center"
                  v-for="(item, index) in member"
                  :key="index"
                >
                  <!-- 队伍颜色 -->
                  <span
                    class="memberTeamColor"
                    :style="{ backgroundColor: item.rank }"
                  ></span>
                  <!-- 队员昵称 -->
                  <span>{{ item.username }}</span>
                </div>
              </el-scrollbar>
            </div>
          </div>
        </div>
      </el-container>
    </el-container>
    <!-- 移动端 -->
  </div>
</template>

<script lang="ts" setup>
import {onBeforeUnmount, onMounted, reactive, ref, computed, provide} from "vue";
import { useStore } from "vuex";
import { Setting, SetUp } from "@element-plus/icons-vue";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "vue-router";
import router from "../../router";
import { ElMessage, FormInstance, FormRules } from "element-plus";
import { Team, Member } from "../../interface/setUp";
import { fullColorHex,generateRandomTeams } from "../../util/colorConvert";
import { updateColumnChartEChart } from "../../util/echart";
import Dialog from './compnent/aside-left/dialog/index.vue'
import DialogTeam from './compnent/aside-left/dialog-teamSetUp/index.vue'
import ChooseTeam from './compnent/aside-left/dialog-chooseTeam/index.vue'
import scoreCompnent from './compnent/aside-left/score/index.vue'
import UserInfo from './compnent/aside-left/dialog-userinfo/index.vue'
import * as echarts from "echarts";
import { markRaw } from "vue";
import {setUsername} from "@/util/Token";
const store = useStore();
const roomId = router.currentRoute.value.params.roomId;
const sign = store.state.sign;
const ruleFormRef = ref<FormInstance>();
provide("ruleFormRef", ruleFormRef);
const outIN = ref<boolean>(false); // 判断是否执行了退出操作
const ws = ref<WebSocket | null>(null);
const randomColor = ref<any>([]);
const score = ref<string>("");
const Input_select_score = ref<string[]>(["1", "2", "3", "4", "5"]);
const dialogVisible_userinfo = ref<boolean>(false); // 个人信息dialog
provide("dialogVisible_userinfo", dialogVisible_userinfo);
const dialogVisible_choiceTeam = ref<boolean>(false); // 选择队伍dialog
provide("dialogVisible_choiceTeam", dialogVisible_choiceTeam);
const startGame = ref<number>(0); // 是否开始游戏 0：结束 1：开始 2：暂停
provide("startGame", startGame);
let selectRanksName = ref<string>("");
provide("selectRanksName", selectRanksName);
let selectRanksColor = ref<string>("");
provide("selectRanksColor", selectRanksColor);
let selectRanksIndex = ref<string>("");
provide("selectRanksIndex", selectRanksIndex);
let selectRankId = ref<string>(""); // 选择的队伍id
provide("selectRankId", selectRankId);
let dialogVisible_setUp_team = ref<boolean>(false);
provide("dialogVisible_setUp_team", dialogVisible_setUp_team);
let dialogVisible_setUp = ref<boolean>(false);
provide("dialogVisible_setUp", dialogVisible_setUp);
let ranksCount = ref<string>("");
let peopleCount = ref<string>("");
let form = reactive({
  peopleCount: "",
  ranksCount: "",
});
const member = ref<Array<Member>>([]);
const HistoricalRecord = ref<Array<any>>([]); // 历史记录
// 初始化chart
const chart = ref<echarts.ECharts | null>(null);

/**
 * 表单校验
 * @param rule
 * @param value
 * @param callback
 */
const validateRanksCount = (rule: any, value: any, callback: any) => {
  if (Number(value) > Number(form.peopleCount)) {
    callback(new Error("队伍数不能大于人数"));
  }else if(Number(value)>20){
    callback(new Error("队伍数不能大于20"));
  }
  else if (value === "") {
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

const userinfo_click = () => {
  dialogVisible_userinfo.value = true;
};

const teamsetting_click = () => {
  dialogVisible_setUp_team.value = true;
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
 * 点击确认设置房间
 */
const confirmed = async (formEl: FormInstance | undefined) => {
  console.log(formEl);
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
provide('confirmed', confirmed)
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
        (item: { nickname: string; rank: string;username:string }) => ({
          nickname: item.nickname,
          username: item.username,
          rank: item.rank,
        })
      );
      console.log(member.value);

      // dialog = data.TeamSetting
      try {
        peopleCount.value = data.TeamSetting.peopleCount;
        ranksCount.value = data.TeamSetting.ranksCount;
        randomColor.value = data.TeamSetting.ranksColorList;
        randomColor.value = data.TeamSetting.ranksColorList;
        updateColumnChartEChart(chart.value, randomColor.value);
      } catch (e) {
        console.log(e);
      }
    }
    if (data.type === "setUp") {
      watchSetUp(data);
      randomColor.value = data.data.ranksColorList;
      selectRanksColor.value = "";
      selectRanksColor.value = "";
      updateColumnChartEChart(chart.value, randomColor.value);
    }
    if (data.type === "selectTeam" || data.type === "changeTeamName") {
      randomColor.value = data.TeamSetting.ranksColorList;
      // 处理成员与分队 选择之后成员的队伍绑定
      data.TeamSetting.ranksColorList.map(
        (item: { member: Array<string>; color: string }) => {
          const memberlist = item.member;
          const color = item.color;
          memberlist.map((item_member: string) => {
            member.value.map((item_member2: Member) => {
              if (item_member2.nickname === item_member) {
                item_member2.rank = color;
              }
            });
          });
        }
      );
    }
    if (data.type === "addScore") {
      randomColor.value = data.TeamSetting.ranksColorList;
      HistoricalRecord.value = data.HistoricalRecord;
      updateColumnChartEChart(chart.value, randomColor.value);
    }
    if (data.type === "theBeginningAndEndOfTheGame") {
      startGame.value = data.Gtype;
      if (data.Gtype === 0) {
        randomColor.value = data.TeamSetting.ranksColorList;
        HistoricalRecord.value = data.HistoricalRecord;
        updateColumnChartEChart(chart.value, randomColor.value);
      }
      notification(data.Gtype);
    }
    if (data.type === "changeTeamName"){
      console.log(member.value);
      selectRanksColor.value = randomColor.value[Number(selectRanksIndex.value)-1].color;
    }
    if (data.type === "modifyNickname"){
      member.value = data.member.map(
        (item: { nickname: string; rank: string;username:string }) => ({
          nickname: item.nickname,
          username: item.username,
          rank: item.rank,
        }));
      setUsername(data.username);
      ElMessage({
        type: "success",
        message: "修改成功",
      });
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
const scoreConfirmation = (score: string) => {
  // TODO 点击确认分数
  if (score === "") {
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
      score: Number(score),
      roomId: roomId,
    })
  );
};

/**
 * 生成n个随机颜色
 * @param n 颜色的个数
 */
const handleRandomColor = (n: string) => {
  // TODO 生成随机颜色标记
  if (n == "") return;
  const teams: Array<object> = [];
  const name = generateRandomTeams(Number(n))
  for (let i = 0; i < Number(n); i++) {
    let team = <Team>{};
    const color = "#" + Math.floor(Math.random() * 16777215).toString(16);
    team.id = uuidv4();
    team.color = color;
    team.name = name[i];
    team.member = [];
    team.score = 0;
    teams.push(team);
  }
  return teams;
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
  // Object.assign(dialog, data.data);

  ElMessage({
    message: `${data.nickname}修改了房间设置`,
    type: "success",
  });
};

/**
 * 排行榜按照分数排序
 */
const sortedScore = computed(() => {
  return randomColor.value.sort((a: any, b: any) => b.score - a.score);
});

// 选择队伍dialog
const handleOpen_choiceTeam = () => {
  dialogVisible_choiceTeam.value = true;
};

/**
 * TODO 比赛通知
 * @param Gtype 通知类型 1：开始比赛 2：暂停比赛 3：结束比赛
 */
const notification = (Gtype: number) => {
  const typeArray = ["结束比赛", "开始比赛", "暂停比赛"];
  ElMessage({
    type: "success",
    message: typeArray[Gtype],
  });
};

/**
 * TODO 开始/暂停/结束比赛并发送给后端
 */
const theBeginningAndEndOfTheGame = (Gtype: number) => {
  // 判断是否选择了队伍
  if (selectRanksIndex.value === "" && selectRanksColor.value === "") {
    ElMessage({
      type: "warning",
      message: "请选择队伍",
    });
    return;
  }
  startGame.value = Gtype;
  // notification(Gtype);
  ws.value?.send(
    JSON.stringify({
      type: "theBeginningAndEndOfTheGame",
      roomId: roomId,
      Gtype: Gtype,
    })
  );
};
onMounted(() => {
  createws();
  const chartElement = document.getElementById("myEcharts");
  if (chartElement instanceof HTMLElement) {
    chart.value = markRaw(echarts.init(chartElement, "dark"));
  }
});
onBeforeUnmount(() => {
  chart.value?.dispose();
  chart.value = null;
  if (!outIN.value) {
    // 已经点了按钮就不用再执行退出了，否则就执行
    ws.value?.send(JSON.stringify({ type: "out" }));
  }
});
</script>

<style lang="less" scoped>
@import "@/assets/less/base.less";
@import "./index";
@import "./media.less";
</style>
