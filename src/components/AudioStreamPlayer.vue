<template>
  <div v-if="src" class="audio-player">
    <PlayButton v-if="!isPlaying" class="button" @click="toggleAudio" />
    <PauseButton v-else-if="isPlaying" class="button" @click="toggleAudio" />
    <div class="title">Stream</div>
  </div>
</template>

<script lang="ts">
/// <reference types="vite-svg-loader" />
import { defineComponent } from 'vue'
import PlayButton from '../assets/play.svg?component'
import PauseButton from '../assets/pause.svg?component'

export default defineComponent({
  components: { PlayButton, PauseButton },
  props: {
    src: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      audioContext: null as AudioContext | null,
      source: null as MediaElementAudioSourceNode | null,
      isPaused: undefined as boolean | undefined,
      isStream: null as boolean | null
    }
  },
  computed: {
    audioPlayer(): any {
      return this.$parent?.$refs.audioPlayer
    },
    isPlaying(): boolean {
      return this.status === 'playing'
    },
    isStopped(): boolean {
      return this.status === 'stopped'
    },
    status(): string {
      return this.isPaused === undefined ? 'stopped' : !this.isPaused ? 'playing' : 'paused'
    }
  },
  mounted() {
    this.initAudioPlayer()
  },
  methods: {
    initAudioPlayer() {
      this.audioPlayer.onended = () => {
        this.isPaused = this.audioPlayer.paused
      }
    },
    initAudioContext() {
      this.audioContext = new AudioContext()
      this.source = this.audioContext.createMediaElementSource(this.audioPlayer as HTMLMediaElement)
      this.source.connect(this.audioContext.destination)
    },
    async toggleAudio() {
      if (!this.audioContext) {
        this.initAudioContext()
      }
      if (this.isPlaying) {
        this.stop()
      } else {
        this.start()
      }
      // this.isPaused = this.source?.mediaElement.paused
      this.isPaused = this.audioPlayer.paused
    },
    start() {
      console.log('start')
      if (this.audioPlayer.src.includes('reset')) {
        this.audioPlayer.src = this.src
        this.audioPlayer.load()
      }
      this.play()
    },
    stop() {
      console.log('stop')
      this.pause()
      this.audioPlayer.src = 'reset'
      this.audioPlayer.load()
    },
    play() {
      console.log('play')
      this.audioPlayer.play()
    },
    pause() {
      console.log('pause')
      this.audioPlayer.pause()
    }
  }
})
</script>

<style lang="scss" scoped>
.title {
  margin: 0px 1rem;
}
</style>
