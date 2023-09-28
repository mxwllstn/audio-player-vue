<template>
  <div class="time">
    <span v-if="type === 'joint'">
      <span>{{ formatTime(currentTime) }}</span
      ><span v-if="showDuration"> / {{ formatTime(duration) }} </span>
    </span>
    <span v-else-if="type === 'current'" class="current">{{ formatTime(currentTime) }}</span>
    <span v-else-if="type === 'duration' && showDuration" class="duration">{{ formatTime(duration) }}</span>
  </div>
</template>

<script lang="ts" setup>
import dayjs, { Duration, DurationUnitType } from '../lib/dayjs'

import { computed } from 'vue'

const props = defineProps({
  currentTime: {
    type: Number,
    default: null
  },
  duration: {
    type: Number,
    default: null
  },
  type: {
    type: String,
    default: 'joint'
  }
})

const showDuration = computed(() => !isNaN(props.duration) && typeof props.duration !== 'undefined')

const formatTime = (time: number, durationType = 'seconds' as DurationUnitType, format = 'mm:ss') => {
  const parsedTime = dayjs.duration(time, durationType) as Duration
  return parsedTime.format(format)
}
</script>

<style lang="scss" scoped>
.time {
  position: relative;
  top: -1px;
  font-family: SpaceMono, Arial, sans-serif;
  font-size: 1rem;
  flex-shrink: 0;
  user-select: none;
  .current {
    // padding-left: 1rem;
  }
}
</style>
