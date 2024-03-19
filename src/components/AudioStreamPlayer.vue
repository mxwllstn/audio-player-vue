<template>
  <div v-if="src" class="audio-player">
    <AntennaIcon v-if="isConnecting" class="button" />
    <PlayButton v-else :is-playing="isPlaying" class="button" @click="toggleAudio" />
    <VolumeBar v-if="volumeBar" :volume="volume" @set-gain="setGain" />
    <VolumeToggle
      v-else :init-volume="initVolume" :show-volume="showVolume" @mouseover="showVolume = true"
      @mouseleave="showVolume = false" @set-gain="setGain"
    />
    <div class="title">
      Stream
    </div>
    <audio ref="audioPlayer" :src="src" />
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue'
import AntennaIcon from './AntennaIcon.vue'
import VolumeBar from './VolumeBar.vue'
import PlayButton from './PlayButton.vue'
import VolumeToggle from './VolumeToggle.vue'

const props = defineProps({
  src: {
    type: String,
    default: null,
  },
  audioStatus: {
    type: String,
    default: undefined,
  },
  volumeBar: {
    type: Boolean,
    default: false,
  },
  masterVolume: {
    type: Number,
    default: 1,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['streamEnded', 'audioStatusUpdated'])

const audioPlayer = ref(new Audio(props.src))
const gainNode = ref(null as GainNode | null)
const audioContext = ref(null as AudioContext | null)
const source = ref(null as MediaElementAudioSourceNode | null)
const isPaused = ref(undefined as boolean | undefined)
const showVolume = ref(false)
const volume = ref(100)

const isReady = ref()
const initVolume = computed(() => Number(volume.value !== null ? volume.value : 100) * props.masterVolume)
const isPlaying = computed((): boolean => status.value === 'playing')
const isLoading = computed((): boolean => props.loading)
const isConnecting = computed(() => !isLoading.value && isReady.value === false)
const status = computed((): string => isConnecting.value ? 'connecting' : isLoading.value ? 'loading' : isPaused.value === undefined ? 'stopped' : !isPaused.value ? 'playing' : 'paused')

watch(() => props.audioStatus, () => {
  if ((status.value !== 'loading' && status.value !== 'connecting') && props.audioStatus !== status.value) {
    toggleAudio()
  }
})

watch(status, () => {
  emit('audioStatusUpdated', status.value)
})
watch(
  () => props.masterVolume,
  () => {
    setGain(volume.value)
  },
)

onMounted(() => {
  initAudioPlayer()
  props.volumeBar && setVolume(50)
})

function setVolume(vol: number) {
  volume.value = Number(vol)
}

function initAudioPlayer() {
  audioPlayer.value.crossOrigin = 'anonymous'
  audioPlayer.value.onended = () => {
    emit('streamEnded')
    isPaused.value = audioPlayer.value.paused
  }
}
function initAudioContext() {
  audioContext.value = new AudioContext()
  source.value = audioContext.value.createMediaElementSource(audioPlayer.value as HTMLMediaElement)
  gainNode.value = audioContext.value.createGain()
  source.value.connect(gainNode.value)
  gainNode.value.connect(audioContext.value.destination)
  setGain(volume.value)
}

audioPlayer.value.addEventListener('canplaythrough', () => {
  isReady.value = true
})

async function toggleAudio() {
  if (!audioContext.value) {
    initAudioContext()
  }

  if (!isReady.value) {
    isReady.value = false
  }

  if (isPlaying.value) {
    stop()
  } else {
    start()
  }

  isPaused.value = audioPlayer.value.paused
}
function start() {
  audioPlayer.value.src = props.src
  audioPlayer.value.load()
  play()
}
function stop() {
  pause()
  audioPlayer.value.src = 'reset'
  audioPlayer.value.load()
}
function play() {
  audioPlayer.value.play()
}
function pause() {
  audioPlayer.value.pause()
}
function setGain(vol: number) {
  setVolume(vol)
  if (gainNode.value) {
    gainNode.value.gain.value = (volume.value * props.masterVolume) / 100
  }
}
</script>
