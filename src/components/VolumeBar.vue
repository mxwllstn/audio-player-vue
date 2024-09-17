<template>
  <div class="volumebar-container" @mousedown="initDrag">
    <div ref="volumebar" class="volumebar">
      <div class="elapsed" :style="{ width: `${markerPosition}%` }" />
      <div class="marker" :style="{ left: `${markerPosition}%` }" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'

const props = defineProps({
  volume: {
    type: Number,
    default: null,
  },
})

const emit = defineEmits(['setGain'])

const dragPosition = ref(null as number | null)
const gainPosition = ref(null as number | null)
const dragInit = ref(false)
const volumebar = ref()

const markerPosition = computed((): number => {
  const position = dragInit.value && dragPosition.value ? dragPosition.value : props.volume
  return position > 100 ? 100 : position < 0 ? 0 : position
})

function setGainPosition(position: number) {
  if (gainPosition.value !== position) {
    gainPosition.value = position
    emit('setGain', gainPosition.value)
  }
}
function initDrag(event: { x: number }): void {
  if (volumebar.value) {
    const position = ((event.x - volumebar.value.offsetLeft) / volumebar.value.offsetWidth) * 100
    dragPosition.value = position > 100 ? 100 : position < 0 ? 0 : position
    setGainPosition(dragPosition.value)
    dragInit.value = true
  }
}
function drag(event: { x: number }): void {
  if (volumebar.value && dragInit.value) {
    const position = ((event.x - volumebar.value.offsetLeft) / volumebar.value.offsetWidth) * 100
    dragPosition.value = position > 100 ? 100 : position < 0 ? 0 : position
    setGainPosition(dragPosition.value)
  }
}
function handleMouseup(): void {
  if (dragInit.value) {
    dragPosition.value = null
    dragInit.value = false
  }
}

onMounted(() => {
  window.addEventListener('mousemove', (event) => {
    drag(event)
  })
  window.addEventListener('mouseup', () => {
    handleMouseup()
  })
})
</script>

<style lang="scss" scoped>
.volumebar-container {
  width: 100%;
  margin: 0 1rem;
  padding: 1rem 0;

  .volumebar {
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
      background: #000;
      height: 1.5rem;
      position: relative;
      top: -10px;
      left: 0;
      width: 0.25rem;
    }
  }
}
</style>
