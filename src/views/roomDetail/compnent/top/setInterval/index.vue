<script lang="ts" setup>
import {inject, ref, watch} from "vue";

let minutes = ref<number>(0)
let seconds = ref<number>(0)
const intervalId = ref()

const startGame = ref(inject('startGame') as number)

const startTimer = () => {
    intervalId.value = setInterval(() => {
    seconds.value++
    if (seconds.value === 60) {
      seconds.value = 0
      minutes.value++
    }
  }, 1000)
}

const stopTimer = () => {
  clearInterval(intervalId.value)
}

watch(startGame, (newValue, oldValue) => {
  if (newValue === 1) {
    startTimer()
  } else if (newValue === 2) {
    stopTimer()
  } else if(newValue === 0){
    stopTimer()
    seconds.value = 0
    minutes.value = 0
  }
});
</script>

<template>
  <div>
    <div class="time">
      <h1>{{ minutes }}:{{ seconds }}</h1>
    </div>
  </div>
</template>

<style lang="less" scoped>
.time{
  text-align: center;
  h1 {
    font-size: 40px;
    margin: 0;
  }
}

</style>
