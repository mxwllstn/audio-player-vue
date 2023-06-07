<template>
  <div v-if="src" class="audio-player">
    <PlayButton v-if="!isPlaying" class="button" @click="toggleAudio" />
    <PauseButton v-else-if="isPlaying" class="button" @click="toggleAudio" />
    <VolumeBar v-if="volumeBar" :init-volume="initVolume" :volume="volume" @set-gain="setGain" />
    <VolumeButton v-else :init-volume="initVolume" :show-volume="showVolume" :muted="muted" @mouseover="showVolume = true"
      @mouseleave="showVolume = false" @set-gain="setGain" />
    <div class="title">Stream</div>
  </div>
</template>

<script lang="ts" setup>
/// <reference types="vite-svg-loader" />
import VolumeBar from './VolumeBar.vue'
import PlayButton from '../assets/play.svg?component'
import PauseButton from '../assets/pause.svg?component'
import VolumeButton from './VolumeButton.vue'

import { defineProps, defineEmits, ref, computed, watch, onMounted } from 'vue'
const props = defineProps({
  src: {
    type: String,
    default: null
  },
  audioStatus: {
    type: String,
    default: undefined
  },
  volumeBar: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['stream-ended', 'audio-status-updated'])

const audioPlayer = ref(new Audio(props.src))
const gainNode = ref(null as GainNode | null)
const audioContext = ref(null as AudioContext | null)
const source = ref(null as MediaElementAudioSourceNode | null)
const isPaused = ref(undefined as boolean | undefined)
const showVolume = ref(false)
const initVolume = ref(100)
const volume = ref(100)

const isPlaying = computed((): boolean => status.value === 'playing')
const status = computed((): string => isPaused.value === undefined ? 'stopped' : !isPaused.value ? 'playing' : 'paused')
const muted = computed((): boolean => Number(volume.value) === 1)

watch(() => props.audioStatus, () => {
  if (props.audioStatus !== status.value) {
    toggleAudio()
  }
})

watch(status, () => {
  emit('audio-status-updated', status.value)
})

onMounted(() => {
  initAudioPlayer()
})

const initAudioPlayer = () => {
  audioPlayer.value.crossOrigin = 'anonymous'
  audioPlayer.value.onended = () => {
    emit('stream-ended')
    isPaused.value = audioPlayer.value.paused
  }
}
const initAudioContext = () => {
  audioContext.value = new AudioContext()
  source.value = audioContext.value.createMediaElementSource(audioPlayer.value as HTMLMediaElement)
  gainNode.value = audioContext.value.createGain()
  source.value.connect(gainNode.value)
  gainNode.value.connect(audioContext.value.destination)
  setGain(volume.value)
}
const toggleAudio = async () => {
  if (!audioContext.value) {
    initAudioContext()
  }
  if (isPlaying.value) {
    stop()
  } else {
    start()
  }
  isPaused.value = audioPlayer.value.paused
}
const start = () => {
  audioPlayer.value.src = props.src
  audioPlayer.value.load()
  play()
}
const stop = () => {
  pause()
  audioPlayer.value.src = 'reset'
  audioPlayer.value.load()
}
const play = () => {
  audioPlayer.value.play()
}
const pause = () => {
  audioPlayer.value.pause()
}
const setGain = (vol: number) => {
  volume.value = vol
  if (gainNode.value) {
    gainNode.value.gain.value = volume.value / 100
  }
  console.log({ vol })
  console.log(gainNode.value && gainNode.value.gain.value)
}

</script>

<style lang="scss" scoped></style>
