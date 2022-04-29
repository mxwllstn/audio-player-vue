<template>
  <div v-if="src" class="audio-player">
    <PlayButton v-if="!isPlaying" class="button" @click="toggleAudio" />
    <PauseButton v-else-if="isPlaying" class="button" @click="toggleAudio" />
    <VolumeButton
      :init-volume="initVolume"
      :show-volume="showVolume"
      :muted="muted"
      @mouseover="showVolume = true"
      @mouseleave="showVolume = false"
      @set-gain="setGain"
    />
    <div class="title">Stream</div>
  </div>
</template>

<script lang="ts">
/// <reference types="vite-svg-loader" />
import { defineComponent } from 'vue'
import PlayButton from '../assets/play.svg?component'
import PauseButton from '../assets/pause.svg?component'
import VolumeButton from './VolumeButton.vue'

export default defineComponent({
  components: { PlayButton, PauseButton, VolumeButton },
  props: {
    src: {
      type: String,
      default: null
    },
    audioStatus: {
      type: String,
      default: undefined
    }
  },
  emits: ['stream-ended', 'audio-status-updated'],
  data() {
    return {
      gainNode: null as GainNode | null,
      audioContext: null as AudioContext | null,
      source: null as MediaElementAudioSourceNode | null,
      isPaused: undefined as boolean | undefined,
      isStream: null as boolean | null,
      showVolume: false,
      initVolume: 100,
      volume: 100
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
    },
    muted(): boolean {
      return Number(this.volume) === 1
    }
  },
  watch: {
    audioStatus() {
      if (this.audioStatus !== this.status) {
        this.toggleAudio()
      }
    },
    status() {
      this.$emit('audio-status-updated', this.status)
    }
  },
  mounted() {
    this.initAudioPlayer()
  },
  methods: {
    initAudioPlayer() {
      this.audioPlayer.onended = () => {
        this.$emit('stream-ended')
        this.isPaused = this.audioPlayer.paused
      }
    },
    initAudioContext() {
      this.audioContext = new AudioContext()
      this.source = this.audioContext.createMediaElementSource(this.audioPlayer as HTMLMediaElement)
      this.gainNode = this.audioContext.createGain()
      this.source.connect(this.gainNode)
      this.gainNode.connect(this.audioContext.destination)
      this.setGain(this.volume)
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
      this.isPaused = this.audioPlayer.paused
    },
    start() {
      console.log('start')
      this.audioPlayer.src = this.src
      this.audioPlayer.load()
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
    },
    setGain(volume: number) {
      this.volume = volume
      if (this.gainNode) {
        this.gainNode.gain.value = this.volume / 100
      }
    }
  }
})
</script>

<style lang="scss" scoped>
</style>
