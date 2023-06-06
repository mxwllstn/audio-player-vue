<template>
  <div v-if="duration" class="playbar-container" @mousedown="initDrag" @mousemove="drag" @mouseup="handleMouseup">
    <div ref="playbar" class="playbar">
      <div class="marker" :style="{ left: markerPosition + '%' }"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
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
  emits: ['seek', 'set-seek-time'],
  data() {
    return {
      dragPosition: null as number | null,
      dragInit: false
    }
  },
  computed: {
    playbar(): any {
      return this.$refs.playbar as any
    },
    markerPosition(): number {
      const position =  this.dragInit && this.dragPosition ? this.dragPosition : (this.currentTime / this.duration) * 100
      return position > 100 ? 100 : position
    }
  },
  methods: {
    initDrag(event: any) {
      this.dragPosition = (event.x - this.playbar.offsetLeft) / this.playbar.offsetWidth * 100
      this.$emit('set-seek-time', this.dragPosition / 100)
      this.dragInit = true
    },
    drag(event: any) {
      if (this.dragInit) {
        this.dragPosition = (event.x - this.playbar.offsetLeft) / this.playbar.offsetWidth * 100
        this.$emit('set-seek-time', this.dragPosition / 100)
      }
    },
    handleMouseup(event: any) {
      this.dragPosition = null
      this.dragInit = false
      const seekPosition = (event.x - this.playbar.offsetLeft) / this.playbar.offsetWidth
      this.$emit('seek', seekPosition)
    }
  }
})
</script>

<style lang="scss" scoped>
.playbar-container {
  width: 100%;
  margin: 0px 1rem;
  padding: 1rem 0px;
  .playbar {
    background: #808080;
    height: 0.25rem;
    .marker {
      background: #000;
      height: 1.5rem;
      position: relative;
      top: -10px;
      left: 0px;
      width: 0.25rem;
    }
  }
}
</style>
