<template>
  <div class="time">
    <span>{{ formatTime(currentTime) }}</span>
    <span v-if="duration"> / {{ formatTime(duration) }} </span>
  </div>
</template>

<script lang="ts">
import dayjs, { Duration, DurationUnitType } from '../lib/dayjs'

export default {
  props: {
    currentTime: {
      type: Number,
      default: null
    },
    duration: {
      type: Number,
      default: null
    }
  },
  methods: {
    formatTime(time: number, durationType = 'seconds' as DurationUnitType, format = 'mm:ss') {
      const parsedTime = dayjs.duration(time, durationType) as Duration
      return parsedTime.format(format)
    }
  }
}
</script>

<style lang="scss" scoped>
.time {
  position: relative;
  top: -1px;
  font-family: SpaceMono, Arial, sans-serif;
  font-size: 1rem;
  flex-shrink: 0;
  user-select: none; /* Non-prefixed version, currently supported by Chrome, Edge, Opera and Firefox */
}
</style>
