<template>
  <div class="home">{{ count }}</div>
  <button @click="add">添加</button>

</template>

<script lang="ts">
import { reactive, ref } from 'vue'

export default {
  setup() {
    const count = ref(0)
    const add = () => {
      count.value++
    }
    return {
      count,
      add
    }
  },
};
</script>

