<template>
  <div class="volume">
    <VolumeButton :volume="Number(volume)" class="button" @click="toggleMute" />
    <div v-if="showVolume" class="slider-container">
      <input v-model="volume" type="range" min="0" max="100" class="slider" @input="setGain">
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import VolumeButton from './VolumeButton.vue'

const props = defineProps({
  initVolume: {
    type: Number,
    default: 100,
  },
  showVolume: {
    type: Boolean,
    default: false,
  },
})
const emit = defineEmits(['setGain', 'toggle-mute'])

const volume = ref(Number(props.initVolume))
const prevVolume = ref(100)

const muted = computed((): boolean => Number(volume.value) === 0)

function setGain() {
  emit('setGain', Number(volume.value))
}
function toggleMute() {
  if (muted.value) {
    volume.value = Number(prevVolume.value)
  } else {
    prevVolume.value = Number(volume.value)
    volume.value = 0
  }
  emit('setGain', Number(volume.value))
}
</script>

<style lang="scss" scoped>
.volume {
  display: block;
  position: relative;
  z-index: 999;

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

      /* 0.2 seconds transition on hover */
      transition: opacity 0.2s;
      transform: rotate(270deg);
      cursor: pointer;

      &::-webkit-slider-thumb {
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
