<template>
  <div v-if="showDuration" class="playbar-container" @mousedown="initDrag">
    <div ref="playbar" class="playbar">
      <div v-if="duration" class="elapsed" :class="{ complete: markerPosition >= 100 }" :style="{ width: `${markerPosition}%` }" />
      <div class="marker" :style="{ left: `${markerPosition}%` }" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'

const props = defineProps({
  currentTime: {
    type: Number,
    default: null,
  },
  duration: {
    type: Number,
    default: null,
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

function initDrag(event: { x: number }): void {
  const windowOffset = window.innerWidth < 768 ? -16 : -2
  dragPosition.value = ((event.x - playbar.value.offsetLeft + windowOffset) / playbar.value.offsetWidth) * 100
  emit('setSeekTime', dragPosition.value / 100 >= 0 ? dragPosition.value / 100 : 0)
  dragInit.value = true
}
function drag(event: { x: number }): void {
  if (dragInit.value) {
    const windowOffset = window.innerWidth < 768 ? -16 : -2
    dragPosition.value = ((event.x - playbar.value.offsetLeft + windowOffset) / playbar.value.offsetWidth) * 100
    emit('setSeekTime', dragPosition.value / 100 >= 0 ? dragPosition.value / 100 : 0)
  }
}
function handleMouseup(event: { x: number }): void {
  if (dragInit.value) {
    const windowOffset = window.innerWidth < 768 ? -16 : -2
    dragPosition.value = null
    dragInit.value = false
    const seekPosition = (event.x - playbar.value.offsetLeft + windowOffset) / playbar.value.offsetWidth
    emit('seek', seekPosition)
  }
}

onMounted(() => {
  window.addEventListener('mousemove', (event) => {
    drag(event)
  })
  window.addEventListener('mouseup', (event) => {
    handleMouseup(event)
  })
})
</script>

<style lang="scss" scoped>
.playbar-container {
  width: 100%;
  padding: 1rem 0;
  cursor: pointer;

  @include md {
    padding: 0;
    position: absolute;
    top: 0;
    left: 0;
  }

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

      @include md {
        border-radius: 0.25rem 0 0;

        &.complete {
          border-radius: 0.25rem 0.25rem 0 0;
        }
      }

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

      @include md {
        display: none;
      }
    }

  }

  &:hover,
  &:active {
    .marker {
      opacity: 1
    }
  }

}
</style>
