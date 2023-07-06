<script lang="ts" setup>
// import "@/assets/css/tailwindcss.css";
import {nextTick, ref, watch} from "vue";
import {ElScrollbar} from "element-plus";
const scrollbarRef =  ref<InstanceType<typeof ElScrollbar>>()
const BIG_NUMBER = 1000000;
const props = defineProps({
  HistoricalRecord: {
    type: Array,
  },
});
/**
 * 滚动到底部
 */
const ScrollToTheBottom = ()=>{
  scrollbarRef.value?.setScrollTop(BIG_NUMBER)
  scrollbarRef.value?.$el.scrollTo({behavior: 'smooth'})
}
watch(() => props.HistoricalRecord, (newVal, oldVal) => {
  // 在这里处理 `HistoricalRecord` 的数据变化
  nextTick(()=>{
    console.log(props.HistoricalRecord)
    ScrollToTheBottom()
  })
});
const scoreContent = ref(null);
</script>
<template>
  <div class="score" ref="scoreContent">
    <div>得分情况</div>
    <el-scrollbar  ref="scrollbarRef" height="360px" @scroll="scroll"	 noresize>
        <div
          class="score-body"
          v-for="(item, index) in HistoricalRecord"
          :key="index">
          <el-tooltip
              show-after="1000"
              class="box-item"
              effect="dark"
              :content="item.time"
              placement="top-end"
          >
            <div>
              <div class="score-body-nickname">{{ item.username }}</div>
              <span class="score-body-rankName " :style="{backgroundColor:item.color}">{{ item.ranksName }}</span>
              <span class="emoji">👉</span>
              <span class="score-body-score"> +{{ item.score }} </span>
<!--              <span class="score-body-time">{{ item.time }}</span>-->
            </div>
          </el-tooltip>
          </div>
    </el-scrollbar>
  </div>
</template>

<style lang="less">
@import "./index";
</style>
