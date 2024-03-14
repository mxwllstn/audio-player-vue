<template>
  <div class="audio-player">
    <div class="controls">
      <PreviousButton v-if="previousButton" class="button previous" @click="$emit('previous')" />
      <LoadingSpinner v-if="loading" class="button" />
      <PlayButton v-else :is-playing="isPlaying" class="button" @click="toggleAudio" />
      <NextButton v-if="nextButton" class="button next" @click="$emit('next')" />
      <TimeDisplay type="current" class="current" :current-time="displayTime" />
      <PlayBar :current-time="currentTime" :duration="duration" @seek="seek" @set-seek-time="setSeekTime" />
      <TimeDisplay type="duration" class="duration" :duration="duration" />
      <ShuffleButton
        v-if="shuffleButton" class="button shuffle" :class="{ active: shuffleActive }"
        @click="toggleShuffle"
      />
      <VolumeToggle
        v-if="volumeButton" :init-volume="initVolume" :show-volume="showVolume" @mouseover="showVolume = true"
        @mouseleave="showVolume = false" @set-gain="setGain"
      />
    </div>
    <slot />
    <audio ref="audioPlayer" :src="src" />
  </div>
</template>

<script lang="ts" setup>
import axios from 'axios'
import { computed, onMounted, ref, watch } from 'vue'
import PlayBar from './PlayBar.vue'
import VolumeToggle from './VolumeToggle.vue'
import TimeDisplay from './TimeDisplay.vue'
import LoadingSpinner from './LoadingSpinner.vue'
import PlayButton from './PlayButton.vue'
import PreviousButton from './PreviousButton.vue'
import NextButton from './NextButton.vue'
import ShuffleButton from './ShuffleButton.vue'

const props = defineProps({
  useAudioContext: {
    type: Boolean,
    default: false,
  },
  initDuration: {
    type: Number,
    default: 0,
  },
  audioStatus: {
    type: String,
    default: null,
  },
  playOnSeek: {
    type: Boolean,
    default: false,
  },
  resetOnEnd: {
    type: Boolean,
    default: false,
  },
  src: {
    type: String,
    default: null,
  },
  playOnMount: {
    type: Boolean,
    default: false,
  },
  previousButton: {
    type: Boolean,
    default: false,
  },
  nextButton: {
    type: Boolean,
    default: false,
  },
  volumeButton: {
    type: Boolean,
    default: true,
  },
  shuffleButton: {
    type: Boolean,
    default: true,
  },
  spacebarToggle: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['audioStatusUpdated', 'previous', 'next', 'shuffleToggle'])

const audioPlayer = ref()
const audioContext = ref(undefined as AudioContext | undefined)
const loading = ref(true)

const gainNode = ref(null as GainNode | null)
const source = ref(null as MediaElementAudioSourceNode | null)
const isPaused = ref(undefined as boolean | undefined)
const duration = ref(0)
const currentTime = ref(0)
const seekTime = ref(null as null | number)
const timeUpdate = ref(null as null | number)
const showVolume = ref(false)
const volume = ref(100)

const shuffleActive = ref(false)

const initVolume = computed(() => Number(volume.value) || 100)
const isPlaying = computed((): boolean => status.value === 'playing')
const status = computed((): string => (isPaused.value === undefined ? 'stopped' : !isPaused.value ? 'playing' : 'paused'))
const displayTime = computed((): number => seekTime.value || currentTime.value)

watch(
  () => props.audioStatus,
  () => {
    if (props.audioStatus !== status.value)
      toggleAudio()
  },
)
watch(status, () => {
  emit('audioStatusUpdated', status.value)
})

onMounted(async () => {
  initAudioPlayer()
  audioPlayer.value.onloadstart = () => {
    duration.value = 0
  }
  audioPlayer.value.onloadedmetadata = () => {
    resetCurrentTime()
    duration.value = audioPlayer.value.duration
    props.playOnMount && play()
    loading.value = false
  }
  props.useAudioContext && await initAudioContext()
  props.spacebarToggle && window.addEventListener('keyup', e => e.code === 'Space' && toggleAudio())
})

async function initAudioContext() {
  const { data } = await axios.get(props.src, {
    responseType: 'arraybuffer',
  })

  audioContext.value = new AudioContext()
  /* set duration */
  const decoded = await audioContext.value.decodeAudioData(data)
  duration.value = decoded.duration

  /* gainNode setup */
  source.value = audioContext.value.createMediaElementSource(audioPlayer.value as HTMLMediaElement)
  gainNode.value = audioContext.value.createGain()
  source.value.connect(gainNode.value)
  gainNode.value.connect(audioContext.value.destination)
}
function initAudioPlayer() {
  duration.value = props.initDuration
  audioPlayer.value.crossOrigin = 'anonymous'
  audioPlayer.value.onended = () => {
    if (timeUpdate.value)
      clearInterval(timeUpdate.value)

    currentTime.value = duration.value
    isPaused.value = audioPlayer.value.paused
    props.resetOnEnd && resetCurrentTime()
  }
}
function resetCurrentTime() {
  currentTime.value = 0
}
function resumeAudioContext() {
  if (audioContext.value) {
    audioContext.value.resume()
    setGain(Number(volume.value))
  }
}
function toggleAudio() {
  if (audioContext.value && audioContext.value.state === 'suspended')
    resumeAudioContext()

  if (isPlaying.value)
    pause()
  else
    play()
}
function play() {
  audioPlayer.value.play()
  startTimeUpdate()
  isPaused.value = audioPlayer.value.paused
}
function setGain(vol: number) {
  volume.value = Number(vol)
  if (gainNode.value)
    gainNode.value.gain.value = volume.value / 100
  else
    audioPlayer.value.volume = vol / 100
}
function pause() {
  audioPlayer.value.pause()
  stopTimeUpdate()
  isPaused.value = audioPlayer.value.paused
}
function setSeekTime(seekPosition: number) {
  seekTime.value = duration.value * seekPosition
}
function seek(seekPosition: number) {
  seekTime.value = null
  audioPlayer.value.currentTime = duration.value * seekPosition
  currentTime.value = audioPlayer.value.currentTime
  !isPlaying.value && props.playOnSeek && toggleAudio()
}
function startTimeUpdate() {
  timeUpdate.value = window.setInterval(() => {
    currentTime.value = audioPlayer.value?.currentTime
  }, 25)
}
function stopTimeUpdate() {
  if (timeUpdate.value)
    clearInterval(timeUpdate.value)
}

function toggleShuffle() {
  shuffleActive.value = !shuffleActive.value
  emit('shuffleToggle', shuffleActive.value)
}
</script>

<style lang="scss" scoped>
.audio-player {
  display: flex;
  align-items: center;
  width: 100%;
  position: relative;
  background: #f4f4f4;

  .controls {
    display: flex;
    width: 100%;
    align-items: center;
    gap: 1rem;

    @include md {
      width: auto;

      .previous,
      .next,
      .shuffle {
        display: none;
      }
    }

    svg.button {
      cursor: pointer;

      &.next {
        padding-right: 0.5rem;
      }
    }

    .duration {
      @include md {
        display: none;
      }
    }

    .current {
      @include md {
        display: none;
      }
    }
  }
}
</style>
