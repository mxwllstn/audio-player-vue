<template>
  <div v-if="audioContext" class="audio-player">
    <PlayButton v-if="!isPlaying" class="button" @click="toggleAudio" />
    <PauseButton v-else-if="isPlaying" class="button" @click="toggleAudio" />
    <PlayBar :current-time="currentTime" :duration="duration" @seek="seek" />
    <TimeDisplay :current-time="currentTime" :duration="duration" />
  </div>
</template>

<script lang="ts">
/// <reference types="vite-svg-loader" />
import { defineComponent } from 'vue'
import PlayBar from './PlayBar.vue'
import TimeDisplay from './TimeDisplay.vue'
import PlayButton from '../assets/play.svg?component'
import PauseButton from '../assets/pause.svg?component'

export default defineComponent({
  components: { PlayButton, PauseButton, PlayBar, TimeDisplay },
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
    }
  },
  emits: ['toggle-audio'],
  data() {
    return {
      gainNode: null as GainNode | null,
      source: null as MediaElementAudioSourceNode | null,
      isPaused: undefined as boolean | undefined,
      duration: 0,
      currentTime: 0,
      timeUpdate: null as null | number,
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
  watch: {
    audioStatus() {
      if (this.audioStatus !== this.status) {
        this.toggleAudio()
      }
    },
    status() {
      this.$emit('toggle-audio', this.status)
    }
  },
  mounted() {
    this.initAudioPlayer()
  },
  methods: {
    initAudioPlayer() {
      // this.initDuration()
      this.duration = this.initDuration
      this.audioPlayer.onended = () => {
        if (this.timeUpdate) {
          clearInterval(this.timeUpdate)
        }
        this.isPaused = this.audioPlayer.paused
        this.currentTime = 0
      }
    },
    resumeAudioContext() {
      this.audioContext.resume()
      this.source = this.audioContext.createMediaElementSource(this.audioPlayer as HTMLMediaElement)
      this.source.connect(this.audioContext.destination)
    },
    // initDuration() {
    //   const { duration } = this.audioPlayer
    //   this.isStream = !isFinite(duration)
    //   this.duration = isFinite(duration) ? duration : null
    // },
    toggleAudio() {
      console.log(this.audioContext.state)
      if (this.audioContext.state === 'suspended') {
        this.resumeAudioContext()
      }
      if (this.isPlaying) {
        this.pause()
      } else {
        this.play()
      }
      // this.isPaused = this.source?.mediaElement.paused
      this.isPaused = this.audioPlayer.paused
    },
    play() {
      console.log('play')
      this.audioPlayer.play()
      this.startTimeUpdate()
      // this.source?.mediaElement.play()
    },
    pause() {
      console.log('pause')
      this.audioPlayer.pause()
      this.stopTimeUpdate()
      // this.source?.mediaElement.pause()
    },
    seek(event: any): void {
      const seek = (event.x - event.target.offsetLeft) / event.target.offsetWidth
      this.audioPlayer.currentTime = this.duration * seek
      if (!this.isPlaying) {
        this.toggleAudio()
      }
    },
    startTimeUpdate() {
      this.timeUpdate = window.setInterval(() => {
        this.currentTime = this.audioPlayer.currentTime
      }, 50)
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
