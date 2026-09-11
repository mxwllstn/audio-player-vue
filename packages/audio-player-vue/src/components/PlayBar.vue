<template>
  <div v-if="showDuration" class="playbar-container" @mousedown="initDrag" @touchstart="initDrag">
    <div ref="playbar" class="playbar">
      <div v-if="duration" class="elapsed" :class="{ complete: markerPosition >= 100 }" :style="{ width: `${markerPosition}%` }" />
      <div class="marker" :style="{ left: `${markerPosition}%` }" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'

const props = defineProps({
  currentTime: {
    type: Number,
    default: null,
  },
  duration: {
    type: Number,
    default: null,
  },
  fullWidth: {
    type: Boolean,
    default: false,
  },
  audioPlayerContainerWidth: {
    type: Number,
    default: 0,
  },
  audioPlayerWidth: {
    type: Number,
    default: 0,
  },
  rounded: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['seek', 'setSeekTime'])

const dragPosition = ref(null as number | null)
const dragInit = ref(false)
const playbar = ref()

const showDuration = computed(() => !Number.isNaN(props.duration) && typeof props.duration !== 'undefined')

const markerPosition = computed((): number => {
  const position = dragInit.value && dragPosition.value ? dragPosition.value : (props.currentTime / props.duration) * 100
  return position > 100 ? 100 : position < 0 ? 0 : position
})

const audioPlayerOffset = computed(() => {
  // POPUP or non-full-width layout: no horizontal offset needed
  if (!props.fullWidth) {
    return 1
  }

  // FULL WIDTH PLAYER LAYOUT
  const containerOffset = window.innerWidth - props.audioPlayerContainerWidth

  return (
    (props.audioPlayerContainerWidth - props.audioPlayerWidth + containerOffset - 32) / 2
  ) + 2
})

// Helper to get mouse/touch X
function getClientX(e: MouseEvent | TouchEvent): number {
  if ('touches' in e) {
    return e.touches[0]?.clientX ?? 0
  }
  return e.clientX
}

// Clamp 0–1
const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1)

function initDrag(event: any): void {
  if (!playbar.value) {
    return
  }

  window.addEventListener('mousemove', drag)
  window.addEventListener('mouseup', handleMouseup)
  window.addEventListener('touchmove', drag)
  window.addEventListener('touchend', handleMouseup)

  dragInit.value = true
  drag(event) // perform first position update immediately
}

function drag(event: any): void {
  if (!playbar.value || !dragInit.value) {
    return
  }

  const rect = playbar.value.getBoundingClientRect()
  const clientX = getClientX(event)

  const windowOffset = -audioPlayerOffset.value

  const pos = (clientX - rect.left + windowOffset) / rect.width
  dragPosition.value = pos * 100

  emit('setSeekTime', clamp01(pos))
}

function handleMouseup(event: any): void {
  if (!playbar.value || !dragInit.value) {
    return
  }

  const rect = playbar.value.getBoundingClientRect()
  const clientX = getClientX(event)
  const windowOffset = -audioPlayerOffset.value

  const seekPosition = (clientX - rect.left + windowOffset) / rect.width

  dragPosition.value = null
  dragInit.value = false

  emit('seek', clamp01(seekPosition))

  window.removeEventListener('mousemove', drag)
  window.removeEventListener('mouseup', handleMouseup)
  window.removeEventListener('touchmove', drag)
  window.removeEventListener('touchend', handleMouseup)
}
</script>

<style lang="css" scoped>
.playbar-container {
  width: 100%;
  padding: 1rem 0;
  cursor: pointer;

  .playbar {
    background: #808080;
    height: 0.25rem;
    position: relative;

    .elapsed {
      content: '';
      background: #000;
      height: 100%;
      position: absolute;
      left: 0;
      top: 0;
    }

    .marker {
      opacity: 0;
      background: #000;
      height: 1.5rem;
      position: relative;
      top: -10px;
      left: 0;
      width: 0.25rem;
      transition: opacity 100ms;
    }
  }

  &:hover,
  &:active {
    .marker {
      opacity: 1;
    }
  }
}

@media (max-width: 768px) {
  .playbar-container {
    padding: 0;
    position: absolute;
    top: 0;
    left: 0;

    .playbar {
      border-radius: 0.25rem 0.25rem 0 0;

      .marker {
        display: none;
      }
      .elapsed {
        border-radius: 0.25rem 0 0;

        &.complete {
          border-radius: 0.25rem 0.25rem 0 0;
        }
      }
    }
  }
}
</style>
