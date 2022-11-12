<template>
  <div class="volume">
    <MuteButton v-if="muted" class="button" @click="toggleMute" />
    <VolumeButton v-if="!muted" class="button" @click="toggleMute" />
    <div v-if="showVolume" class="slider-container">
      <input v-model="volume" type="range" min="1" max="100" class="slider" @input="setGain" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue-demi'
import MuteButton from '../assets/mute.svg?component'
import VolumeButton from '../assets/volume.svg?component'

export default defineComponent({
  components: { MuteButton, VolumeButton },
  props: {
    initVolume: {
      type: Number,
      default: 100
    },
    showVolume: {
      type: Boolean,
      default: false
    },
    muted: {
      type: Boolean,
      default: false
    }
  },
  emits: ['setGain', 'toggleMute'],
  data() {
    return {
      volume: this.initVolume,
      prevVolume: 100
    }
  },
  methods: {
    setGain() {
      this.$emit('setGain', this.volume)
    },
    toggleMute() {
      if (this.muted) {
        this.volume = this.prevVolume
      } else {
        this.prevVolume = this.volume
        this.volume = 1
      }
      this.$emit('setGain', this.volume)
    }
  }
})
</script>

<style lang="scss" scoped>
.volume {
  display: block;
  position: relative;
  margin: 0px 1rem;
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
      -webkit-appearance: none; /* Override default CSS styles */
      appearance: none;
      width: 50px; /* Full-width */
      height: 3px; /* Specified height */
      background: #000; /* Grey background */
      outline: none; /* Remove outline */
      opacity: 0.7; /* Set transparency (for mouse-over effects on hover) */
      -webkit-transition: 0.2s; /* 0.2 seconds transition on hover */
      transition: opacity 0.2s;
      transform: rotate(270deg);

      &::-webkit-slider-thumb {
        -webkit-appearance: none; /* Override default look */
        appearance: none;
        border-radius: 10px;
        width: 10px; /* Set a specific slider handle width */
        height: 10px; /* Slider handle height */
        background: #000; /* Green background */
        cursor: pointer; /* Cursor on hover */
      }
    }
  }
  .button {
    position: relative;
    top: 2px;
  }
}
</style>
