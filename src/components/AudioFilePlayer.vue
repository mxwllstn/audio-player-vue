<template>
  <div v-if="audioContext" class="audio-player">
    <PlayButton v-if="!isPlaying" class="button" @click="toggleAudio" />
    <PauseButton v-else-if="isPlaying" class="button" @click="toggleAudio" />
    <PlayBar :current-time="currentTime" :duration="duration" @seek="seek" @set-seek-time="setSeekTime" />
    <VolumeButton
      :init-volume="initVolume"
      :show-volume="showVolume"
      :muted="muted"
      @mouseover="showVolume = true"
      @mouseleave="showVolume = false"
      @set-gain="setGain"
    />
    <TimeDisplay :current-time="displayTime" :duration="duration" />
  </div>
</template>

<script lang="ts">
/// <reference types="vite-svg-loader" />
import { defineComponent } from 'vue'
import PlayBar from './PlayBar.vue'
import VolumeButton from './VolumeButton.vue'
import TimeDisplay from './TimeDisplay.vue'
import PlayButton from '../assets/play.svg?component'
import PauseButton from '../assets/pause.svg?component'

export default defineComponent({
  components: { PlayButton, PauseButton, PlayBar, VolumeButton, TimeDisplay },
  props: {
    audioContext: {
      type: AudioContext,
      default: null
    },
    initDuration: {
      type: Number,
      default: 0
    },
    audioStatus: {
      type: String,
      default: undefined
    },
    playOnSeek: {
      type: Boolean,
      default: false
    },
    resetOnEnd: {
      type: Boolean,
      default: false
    }
  },
  emits: ['audio-status-updated'],
  data() {
    return {
      gainNode: null as GainNode | null,
      source: null as MediaElementAudioSourceNode | null,
      isPaused: undefined as boolean | undefined,
      duration: 0,
      currentTime: 0,
      seekTime: null as null | number,
      timeUpdate: null as null | number,
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
    },
    displayTime(): number {
      return this.seekTime || this.currentTime
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
      this.duration = this.initDuration
      this.audioPlayer.onended = () => {
        if (this.timeUpdate) {
          clearInterval(this.timeUpdate)
        }
        this.isPaused = this.audioPlayer.paused
        this.resetOnEnd && this.resetCurrentTime()
      }
    },
    resetCurrentTime() {
      this.currentTime = 0
    },
    resumeAudioContext() {
      this.audioContext.resume()
      this.source = this.audioContext.createMediaElementSource(this.audioPlayer as HTMLMediaElement)
      this.gainNode = this.audioContext.createGain()
      this.source.connect(this.gainNode)
      this.gainNode.connect(this.audioContext.destination)
      this.setGain(this.volume)
    },
    toggleAudio() {
      if (this.audioContext.state === 'suspended') {
        this.resumeAudioContext()
      }
      if (this.isPlaying) {
        this.pause()
      } else {
        this.play()
      }
      this.isPaused = this.audioPlayer.paused
    },
    play() {
      this.audioPlayer.play()
      this.startTimeUpdate()
    },
    setGain(volume: number) {
      this.volume = volume
      if (this.gainNode) {
        this.gainNode.gain.value = this.volume / 100
      }
    },
    pause() {
      this.audioPlayer.pause()
      this.stopTimeUpdate()
    },
    setSeekTime(seekPosition: number): void {
      this.seekTime = this.duration * seekPosition
    },
    seek(seekPosition: number): void {
      this.seekTime = null
      this.audioPlayer.currentTime = this.duration * seekPosition
      this.currentTime = this.audioPlayer.currentTime
      !this.isPlaying && this.playOnSeek && this.toggleAudio()
    },
    startTimeUpdate() {
      this.timeUpdate = window.setInterval(() => {
        this.currentTime = this.audioPlayer.currentTime
      }, 25)
    },
    stopTimeUpdate() {
      if (this.timeUpdate) {
        clearInterval(this.timeUpdate)
      }
    }
  }
})
</script>

<style lang="scss" scoped></style>
