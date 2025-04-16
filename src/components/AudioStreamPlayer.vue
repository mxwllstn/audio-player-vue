<template>
  <div v-show="!hidden" class="audio-player-container" :class="{ rounded }">
    <div v-if="loading || error" class="audio-player">
      <AntennaIcon class="button" />
      <div v-if="loading" class="loading">
        Loading...
      </div>
      <div v-else-if="error" class="error">
        {{ error }}
      </div>
    </div>
    <div v-else-if="src" class="audio-player">
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
    </div>
    <audio ref="audioPlayer" :src="props.src" />
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue'
import AntennaIcon from './AntennaIcon.vue'
import PlayButton from './PlayButton.vue'
import VolumeBar from './VolumeBar.vue'
import VolumeToggle from './VolumeToggle.vue'

const props = defineProps({
  src: {
    type: String,
    default: null,
  },
  idx: {
    type: Number,
    default: null,
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
  rounded: {
    type: Boolean,
    default: false,
  },
  hidden: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['streamEnded', 'spectralData', 'amplitudeData', 'loading', 'loaded', 'error', 'connected', 'toggle'])

const audioPlayer = ref() as any
const loading = ref(true)
const error = ref(null as string | null)
const gainNode = ref(null as GainNode | null)
const audioContext = ref(null as AudioContext | null)
const source = ref(null as MediaElementAudioSourceNode | null)
const isPaused = ref(undefined as boolean | undefined)
const showVolume = ref(false)
const volume = ref(100)

const analyser = ref(null as AnalyserNode | null)
const canPlayThrough = ref()
const initVolume = computed(() => Number(volume.value !== null ? volume.value : 100))
const isPlaying = computed((): boolean => status.value === 'playing')
const isLoading = computed((): boolean => props.loading)
const isConnecting = computed(() => !isLoading.value && canPlayThrough.value === false)
const status = computed((): string => error.value ? (error.value || 'error') : isConnecting.value ? 'connecting' : isLoading.value ? 'loading' : isPaused.value === undefined ? 'stopped' : !isPaused.value ? 'playing' : 'paused')

watch(() => props.masterVolume, () => {
  setGain(volume.value)
})

onMounted(async () => {
  await initStream()
  initAudioPlayer()
  if (props.volumeBar) {
    setVolume(50)
  }
})

function setLoading(state: boolean) {
  loading.value = state
  if (state === false) {
    emit('loaded')
  }
}

function setVolume(vol: number) {
  volume.value = Number(vol)
  audioPlayer.value.volume = (volume.value * props.masterVolume) / 100
}

async function initStream() {
  try {
    if (!props.src) {
      error.value = 'Select an audio source'
      setLoading(false)
      return
    }
    error.value = null
    setLoading(true)

    const request = new XMLHttpRequest()
    request.open('GET', props.src)
    request.responseType = 'arraybuffer'
    request.send()
    request.onerror = () => {
      setLoading(false)
      error.value = 'Stream not found'
      emit('error', error.value, props.idx)
    }
    request.onprogress = () => {
      if (request.status === 200) {
        request.abort()
      } else {
        error.value = 'Stream not found'
        emit('error', error.value, props.idx)
      }
      setLoading(false)
    }
  } catch (error: any) {
    setLoading(false)
    console.error(error.message)
  }
}

function initAudioPlayer() {
  audioPlayer.value.crossOrigin = 'anonymous'
  setGain(initVolume.value)

  audioPlayer.value?.addEventListener('canplaythrough', setCanPlayThrough)
  audioPlayer.value?.addEventListener('canplay', setCanPlayThrough)

  audioPlayer.value.onended = () => {
    emit('streamEnded')
    isPaused.value = audioPlayer.value?.paused
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
  if (source.value && analyser.value) {
    source.value.connect(analyser.value)
  }
  if (props.dataTracking) {
    if (props.dataTracking.includes('amplitude')) {
      trackData('amplitude')
    }
    if (props.dataTracking.includes('spectral')) {
      trackData('spectral')
    }
  }
}

function setCanPlayThrough() {
  canPlayThrough.value = true
  emit('connected')
  setGain(initVolume.value)
}

function resetDataTracking() {
  if (props.dataTracking.includes('amplitude')) {
    emit('amplitudeData', null, props.idx)
  }
}

function trackData(type: string | string[]) {
  if (type.includes('amplitude')) {
    setInterval(() => {
      if (status.value === 'playing') {
        const data = getAmplitudeData()
        if (data && Number.isFinite(data.avg)) {
          emit('amplitudeData', data, props.idx)
        } else {
          emit('amplitudeData', null, props.idx)
        }
      }
    }, 50)
  }
  if (type.includes('spectral')) {
    setInterval(() => {
      if (status.value === 'playing') {
        const data = getSpectralData()
        if (data) {
          emit('spectralData', data, props.idx)
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
    pause()
  } else {
    start()
  }

  if (props.dataTracking) {
    resetDataTracking()
  }

  isPaused.value = audioPlayer.value?.paused
  emit('toggle')
}
function start() {
  canPlayThrough.value = false
  audioPlayer.value?.load()
  play()
}
function play() {
  audioPlayer.value.src = props.src
  audioPlayer.value?.load()
  audioPlayer.value?.play()
}
function pause() {
  audioPlayer.value?.pause()
}
function setGain(vol: number) {
  setVolume(vol)
  if (gainNode.value) {
    gainNode.value.gain.value = (volume.value * props.masterVolume) / 100
  }
}

defineExpose({ play, pause, toggle: toggleAudio, status })
</script>

<style>
@import 'ress';
</style>

<style lang="scss" scoped>
.audio-player-container {
  display: flex;
  flex-direction: column;
  color: #000;

  .loading,
  .error {
    font-size: 1rem;
    font-family: SpaceGrotesk, Arial, sans-serif;
    line-height: 2.25rem;
  }

  .audio-player {
    font-family: SpaceGrotesk, Arial, sans-serif;
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem 1rem;

    @include md {
      padding: 1.25rem 1rem 1rem 0.75rem;
    }

    .button {
      height: 1rem;
      width: auto;
      flex-shrink: 0;
    }
  }

  &.rounded {
    @include md {
      .audio-player {
        border-radius: 0.25rem;

        .playbar {
          border-radius: 0.25rem 0.25rem 0 0;
        }

        &.extended-info-opened {
          border-radius: 0 0 0.25rem 0.25rem;

          .playbar {
            border-radius: 0;

            .elapsed {
              border-radius: 0;
            }
          }
        }
      }
    }
  }
}
</style>
