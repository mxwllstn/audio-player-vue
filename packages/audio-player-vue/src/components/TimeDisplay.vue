<template>
  <div class="time">
    <span v-if="type === 'joint'">
      <span>{{ formatTime(currentTime) }}</span><span v-if="showDuration"> / {{ formatTime(duration) }} </span>
    </span>
    <span v-else-if="type === 'current'" class="current">{{ formatTime(currentTime) }}</span>
    <span v-else-if="type === 'duration' && showDuration" class="duration">{{ formatTime(duration) }}</span>
  </div>
</template>

<script lang="ts" setup>
import type { Duration, DurationUnitType } from '../utils/dayjs.js'
import { computed } from 'vue'
import dayjs from '../utils/dayjs.js'

const props = defineProps({
  currentTime: {
    type: Number,
    default: null,
  },
  duration: {
    type: Number,
    default: null,
  },
  type: {
    type: String,
    default: 'joint',
  },
})

const showDuration = computed(() => !Number.isNaN(props.duration) && typeof props.duration !== 'undefined')

function formatTime(time: number, durationType = 'seconds' as DurationUnitType, format = 'mm:ss') {
  const parsedTime = dayjs.duration(time, durationType) as Duration
  if (format === 'mm:ss' && durationType === 'seconds' && time > 3600) {
    return parsedTime.format('HH:mm:ss')
  } else {
    return parsedTime.format(format)
  }
}
</script>

<style lang="css" scoped>
.time {
  position: relative;
  top: -1px;
  font-family: SpaceMono, Arial, sans-serif;
  font-size: 1rem;
  flex-shrink: 0;
  user-select: none;

  @media (max-width: 768px) {
    top: 0;
  }
}
</style>
