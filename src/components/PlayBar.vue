<template>
  <div v-if="showDuration" class="playbar-container" @mousedown="initDrag">
    <div ref="playbar" class="playbar">
      <div v-if="duration" class="elapsed" :style="{ width: markerPosition + '%' }"></div>
      <div class="marker" :style="{ left: markerPosition + '%' }"></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
const props = defineProps({
  currentTime: {
    type: Number,
    default: null
  },
  duration: {
    type: Number,
    default: null
  }
})

const emit = defineEmits(['seek', 'set-seek-time'])

const dragPosition = ref(null as number | null)
const dragInit = ref(false)
const playbar = ref()

const showDuration = computed(() => !isNaN(props.duration) && typeof props.duration !== 'undefined')

const markerPosition = computed((): number => {
  const position = dragInit.value && dragPosition.value ? dragPosition.value : (props.currentTime / props.duration) * 100
  return position > 100 ? 100 : position < 0 ? 0 : position
})

const initDrag = (event: { x: number }): void => {
  dragPosition.value = ((event.x - playbar.value.offsetLeft) / playbar.value.offsetWidth) * 100
  emit('set-seek-time', dragPosition.value / 100 >= 0 ? dragPosition.value / 100 : 0)
  dragInit.value = true
}
const drag = (event: { x: number }): void => {
  if (dragInit.value) {
    dragPosition.value = ((event.x - playbar.value.offsetLeft) / playbar.value.offsetWidth) * 100
    emit('set-seek-time', dragPosition.value / 100 >= 0 ? dragPosition.value / 100 : 0)
  }
}
const handleMouseup = (event: { x: number }): void => {
  if (dragInit.value) {
    dragPosition.value = null
    dragInit.value = false
    const seekPosition = (event.x - playbar.value.offsetLeft) / playbar.value.offsetWidth
    emit('seek', seekPosition)
  }
}

onMounted(() => {
  window.addEventListener('mousemove', event => {
    drag(event)
  })
  window.addEventListener('mouseup', event => {
    handleMouseup(event)
  })
})
</script>

<style lang="scss" scoped>
.playbar-container {
  width: 100%;
  // margin: 0px 1rem;
  padding: 1rem 0px;
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
      left: 0px;
      top: 0px;
    }

    .marker {
      opacity: 0;
      background: #000;
      height: 1.5rem;
      position: relative;
      top: -10px;
      left: 0px;
      width: 0.25rem;
      transition: opacity 100ms;
    }

  }

  &:hover, &:active {
      .marker {
        opacity: 1
      }
    }

}
</style>
