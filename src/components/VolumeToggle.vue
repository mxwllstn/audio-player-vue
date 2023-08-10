<template>
  <div class="volume">
    <VolumeButton :volume="volume" class="button" @click="toggleMute" />
    <div v-if="showVolume" class="slider-container">
      <input v-model="volume" type="range" min="0" max="100" class="slider" @input="setGain" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import VolumeButton from './VolumeButton.vue'

import { ref, computed } from 'vue'

const props = defineProps({
  initVolume: {
    type: Number,
    default: 100
  },
  showVolume: {
    type: Boolean,
    default: false
  } 
})
const emit = defineEmits(['set-gain', 'toggle-mute'])

const volume = ref(props.initVolume)
const prevVolume = ref(100)

const muted = computed((): boolean => Number(volume.value) === 0)

const setGain = () => {
  emit('set-gain', volume.value)
}
const toggleMute = () => {
  if (muted.value) {
    volume.value = prevVolume.value
  } else {
    prevVolume.value = volume.value
    volume.value = 0
  }
  emit('set-gain', volume.value)
}
</script>

<style lang="scss" scoped>
.volume {
  display: block;
  position: relative;
  margin-left: 1rem;

  .slider-container {
    background: #efefef;
    width: 30px;
    height: 80px;
    position: absolute;
    top: -80px;
    left: -5px;
    border: 5px solid white;

    .slider {
      position: relative;
      top: 22px;
      left: -15px;
      -webkit-appearance: none;
      /* Override default CSS styles */
      appearance: none;
      width: 50px;
      /* Full-width */
      height: 3px;
      /* Specified height */
      background: #000;
      /* Grey background */
      outline: none;
      /* Remove outline */
      opacity: 0.7;
      /* Set transparency (for mouse-over effects on hover) */
      -webkit-transition: 0.2s;
      /* 0.2 seconds transition on hover */
      transition: opacity 0.2s;
      transform: rotate(270deg);
      cursor: pointer;

      &::-webkit-slider-thumb {
        -webkit-appearance: none;
        /* Override default look */
        appearance: none;
        border-radius: 10px;
        width: 10px;
        /* Set a specific slider handle width */
        height: 10px;
        /* Slider handle height */
        background: #000;
        /* Green background */
        cursor: pointer;
        /* Cursor on hover */
      }
    }
  }

  .button {
    cursor: pointer;
    position: relative;
    top: 2px;
  }
}
</style>
