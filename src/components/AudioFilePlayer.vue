<template>
  <div class="audio-player">
    <PlayButton v-if="!isPlaying" class="button" @click="toggleAudio" />
    <PauseButton v-else-if="isPlaying" class="button" @click="toggleAudio" />
    <PlayBar :current-time="currentTime" :duration="duration" @seek="seek" @set-seek-time="setSeekTime" />
    <VolumeToggle :init-volume="initVolume" :show-volume="showVolume" :muted="muted" @mouseover="showVolume = true"
      @mouseleave="showVolume = false" @set-gain="setGain" />
    <TimeDisplay :current-time="displayTime" :duration="duration" />
    <audio ref="audioPlayer" :src="src"></audio>
  </div>
</template>

<script lang="ts" setup>
import PlayBar from './PlayBar.vue'
import VolumeToggle from './VolumeToggle.vue'
import TimeDisplay from './TimeDisplay.vue'
import PlayButton from './PlayButton.vue'
import PauseButton from './PauseButton.vue'
import axios from 'axios'

import { ref, onMounted, watch, computed } from 'vue'

const props = defineProps({
  initDuration: {
    type: Number,
    default: 0
  },
  audioStatus: {
    type: String,
    default: null
  },
  playOnSeek: {
    type: Boolean,
    default: false
  },
  resetOnEnd: {
    type: Boolean,
    default: false
  },
  src: {
    type: String,
    default: null
  },
  playOnMount: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['audio-status-updated'])

const audioPlayer = ref()
const audioContext = ref(undefined as AudioContext | undefined)

const gainNode = ref(null as GainNode | null)
const source = ref(null as MediaElementAudioSourceNode | null)
const isPaused = ref(undefined as boolean | undefined)
const duration = ref(0)
const currentTime = ref(0)
const seekTime = ref(null as null | number)
const timeUpdate = ref(null as null | number)
const showVolume = ref(false)
const volume = ref(100)

const initVolume = computed(() => Number(volume.value) || 100)
const isPlaying = computed((): boolean => status.value === 'playing')
const status = computed((): string => isPaused.value === undefined ? 'stopped' : !isPaused.value ? 'playing' : 'paused')
const muted = computed((): boolean => Number(volume.value) === 0)
const displayTime = computed((): number => seekTime.value || currentTime.value)

watch(() => props.audioStatus, () => {
  if (props.audioStatus !== status.value) {
    toggleAudio()
  }
})
watch(status, () => {
  emit('audio-status-updated', status.value)
})

onMounted(async () => {
  initAudioPlayer()
  audioPlayer.value.onloadedmetadata = () => {
    resetCurrentTime()
    duration.value = audioPlayer.value.duration
    props.playOnMount && play()
  }
  await initAudioContext()
})

const initAudioContext = async () => {
  const { data } = await axios.get(props.src, {
    responseType: 'arraybuffer'
  })
  audioContext.value = new AudioContext()
  const decoded = await audioContext.value.decodeAudioData(data)
  duration.value = decoded.duration
}
const initAudioPlayer = () => {
  duration.value = props.initDuration
  audioPlayer.value.crossOrigin = 'anonymous'
  audioPlayer.value.onended = () => {
    if (timeUpdate.value) {
      clearInterval(timeUpdate.value)
    }
    isPaused.value = audioPlayer.value.paused
    props.resetOnEnd && resetCurrentTime()
  }
}
const resetCurrentTime = () => {
  currentTime.value = 0
}
const resumeAudioContext = () => {
  if (audioContext.value) {
    audioContext.value.resume()
    source.value = audioContext.value.createMediaElementSource(audioPlayer.value as HTMLMediaElement)
    gainNode.value = audioContext.value.createGain()
    source.value.connect(gainNode.value)
    gainNode.value.connect(audioContext.value.destination)
    setGain(Number(volume.value))
  }
}
const toggleAudio = () => {
  if (audioContext.value && audioContext.value.state === 'suspended') {
    resumeAudioContext()
  }
  if (isPlaying.value) {
    pause()
  } else {
    play()
  }
}
const play = () => {
  audioPlayer.value.play()
  startTimeUpdate()
  isPaused.value = audioPlayer.value.paused
}
const setGain = (vol: number) => {
  volume.value = vol
  if (gainNode.value) {
    gainNode.value.gain.value = volume.value / 100
  }
}
const pause = () => {
  audioPlayer.value.pause()
  stopTimeUpdate()
  isPaused.value = audioPlayer.value.paused
}
const setSeekTime = (seekPosition: number) => {
  seekTime.value = duration.value * seekPosition
}
const seek = (seekPosition: number) => {
  seekTime.value = null
  audioPlayer.value.currentTime = duration.value * seekPosition
  currentTime.value = audioPlayer.value.currentTime
  !isPlaying.value && props.playOnSeek && toggleAudio()
}
const startTimeUpdate = () => {
  timeUpdate.value = window.setInterval(() => {
    currentTime.value = audioPlayer.value?.currentTime
  }, 25)
}
const stopTimeUpdate = () => {
  if (timeUpdate.value) {
    clearInterval(timeUpdate.value)
  }
}
</script>

<style lang="scss" scoped></style>
