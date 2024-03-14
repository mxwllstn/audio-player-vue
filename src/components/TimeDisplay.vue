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
import { computed } from 'vue'
import type { Duration, DurationUnitType } from '../lib/dayjs'
import dayjs from '../lib/dayjs'

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

  @include md {
    top: 0;
  }
}
</style>
