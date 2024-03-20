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
    <slot />
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
  dataTracking: {
    type: [String, Array],
    default: null,
  },
})

const emit = defineEmits(['streamEnded', 'audioStatusUpdated', 'spectralData', 'amplitudeData'])

const audioPlayer = ref(new Audio(props.src))
const gainNode = ref(null as GainNode | null)
const audioContext = ref(null as AudioContext | null)
const source = ref(null as MediaElementAudioSourceNode | null)
const isPaused = ref(undefined as boolean | undefined)
const showVolume = ref(false)
const volume = ref(100)

const analyser = ref(null as AnalyserNode | null)
const canPlayThrough = ref()
const initVolume = ref(Number(volume.value !== null ? volume.value : 100) * props.masterVolume)
const isPlaying = computed((): boolean => status.value === 'playing')
const isLoading = computed((): boolean => props.loading)
const isConnecting = computed(() => !isLoading.value && canPlayThrough.value === false)
const status = computed((): string => isConnecting.value ? 'connecting' : isLoading.value ? 'loading' : isPaused.value === undefined ? 'stopped' : !isPaused.value ? 'playing' : 'paused')

watch(() => props.audioStatus, () => {
  if ((status.value !== 'loading' && status.value !== 'connecting') && props.audioStatus !== status.value) {
    toggleAudio()
  }
})

watch(status, () => {
  emit('audioStatusUpdated', status.value)
})

watch(() => props.masterVolume, () => {
  setGain(volume.value)
})

onMounted(() => {
  initAudioPlayer()
  props.volumeBar && setVolume(50)
})

function setVolume(vol: number) {
  volume.value = Number(vol)
  audioPlayer.value.volume = (volume.value * props.masterVolume) / 100
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
  analyser.value = audioContext.value.createAnalyser()
  analyser.value.connect(audioContext.value.destination)
  source.value && analyser.value && source.value.connect(analyser.value)
  if (props.dataTracking) {
    props.dataTracking.includes('amplitude') && trackData('amplitude')
    props.dataTracking.includes('spectral') && trackData('spectral')
  }
  !canPlayThrough.value && setGain(0)
}

audioPlayer.value.addEventListener('canplaythrough', () => {
  canPlayThrough.value = true
  setGain(initVolume.value)
})

function resetDataTracking() {
  props.dataTracking.includes('amplitude') && emit('amplitudeData', null)
}

function trackData(type: string | string[]) {
  if (type.includes('amplitude')) {
    setInterval(() => {
      if (status.value === 'playing') {
        const data = getAmplitudeData()
        if (data && Number.isFinite(data.avg)) {
          emit('amplitudeData', data)
        }
      }
    }, 50)
  }
  if (type.includes('spectral')) {
    setInterval(() => {
      if (status.value === 'playing') {
        const data = getSpectralData()
        if (data) {
          emit('spectralData', data)
        }
      }
    }, 100)
  }
}

function getAmplitudeData() {
  if (analyser.value) {
    analyser.value.fftSize = 2048 * 4
    const bufferLength = analyser.value.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    const amplitudeData = new Float32Array(dataArray)

    analyser.value.getFloatTimeDomainData(amplitudeData)

    const sumOfSquares = amplitudeData.reduce((accumulator: number, currentValue: number) => accumulator + currentValue ** 2)
    const avgPowerDecibels = 10 * Math.log10(sumOfSquares / amplitudeData.length)

    const peakInstantaneousPower = amplitudeData.reduce((accumulator: number, currentValue: number) => Math.max(currentValue ** 2, accumulator))
    const peakInstantaneousPowerDecibels = 10 * Math.log10(peakInstantaneousPower)

    return { avg: avgPowerDecibels, peak: peakInstantaneousPowerDecibels }
  }
}

function getSpectralData() {
  if (analyser.value) {
    analyser.value.fftSize = 2048
    const bufferLength = analyser.value.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    const freqByteData = new Uint8Array(dataArray)
    const timeByteData = new Uint8Array(dataArray)

    analyser.value.getByteFrequencyData(freqByteData)
    analyser.value.getByteTimeDomainData(timeByteData)
    return { freq: freqByteData, time: timeByteData }
  }
}

async function toggleAudio() {
  if (!audioContext.value) {
    initAudioContext()
  }

  if (!canPlayThrough.value) {
    canPlayThrough.value = false
  }

  if (isPlaying.value) {
    stop()
  } else {
    start()
  }

  props.dataTracking && resetDataTracking()

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
