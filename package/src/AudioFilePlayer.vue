<template>
  <div v-show="!hidden" ref="audioPlayerContainerRef" class="audio-player-container" :class="{ rounded }">
    <slot name="extended-top" />
    <div ref="audioPlayerRef" class="audio-player">
      <div class="controls">
        <PreviousButton v-if="previousButton" class="button previous" @click="$emit('previous')" />
        <LoadingSpinner v-if="loading" class="button" />
        <PlayButton v-else :is-playing="isPlaying" class="button" @click="toggleAudio" />
        <NextButton v-if="nextButton" class="button next" @click="$emit('next')" />
        <TimeDisplay type="current" class="current" :current-time="displayTime" />
        <PlayBar :audio-player-container-width="audioPlayerContainerWidth" :audio-player-width="audioPlayerWidth" :current-time="currentTime" :duration="duration" @seek="seek" @set-seek-time="setSeekTime" />
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
    </div>
    <slot name="extended-bottom" />
    <audio ref="audioPlayer" :src="props.src" />
  </div>
</template>

<script lang="ts" setup>
import axios from 'axios'
import { computed, onMounted, ref, watch } from 'vue'
import LoadingSpinner from './components/LoadingSpinner.vue'
import NextButton from './components/NextButton.vue'
import PlayBar from './components/PlayBar.vue'
import PlayButton from './components/PlayButton.vue'
import PreviousButton from './components/PreviousButton.vue'
import ShuffleButton from './components/ShuffleButton.vue'
import TimeDisplay from './components/TimeDisplay.vue'
import VolumeToggle from './components/VolumeToggle.vue'
import './assets/css/main.css'

const props = defineProps({
  useAudioContext: {
    type: Boolean,
    default: false,
  },
  idx: {
    type: Number,
    default: null,
  },
  initDuration: {
    type: Number,
    default: 0,
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
  masterVolume: {
    type: Number,
    default: 1,
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

const emit = defineEmits(['previous', 'next', 'shuffleToggle', 'timeUpdate', 'durationUpdate', 'seekUpdate'])

const audioPlayer = ref() as any
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

const audioPlayerRef = ref()
const audioPlayerWidth = ref()

const audioPlayerContainerRef = ref()
const audioPlayerContainerWidth = ref()

const initVolume = computed(() => Number(volume.value !== null ? volume.value : 100))
const isPlaying = computed((): boolean => status.value === 'playing')
const status = computed((): string => (loading.value ? 'loading' : isPaused.value === undefined ? 'stopped' : !isPaused.value ? 'playing' : 'paused'))
const displayTime = computed((): number => seekTime.value || currentTime.value)

watch(
  () => props.masterVolume,
  () => {
    setGain(volume.value)
  },
)

const audioPlayerContainerResizeObserver = ref()
function onAudioPlayerContainerResize(entries: any[]) {
  entries.forEach((entry) => {
    if (entry.contentRect.width !== audioPlayerContainerWidth.value) {
      audioPlayerContainerWidth.value = entry.contentRect.width
    }
  })
}

function initAudioPlayerContainerResizeObserver() {
  audioPlayerContainerResizeObserver.value = new ResizeObserver(onAudioPlayerContainerResize)
  audioPlayerContainerResizeObserver.value.observe(audioPlayerContainerRef.value)
}

const audioPlayerResizeObserver = ref()
function onAudioPlayerResize(entries: any[]) {
  entries.forEach((entry) => {
    if (entry.contentRect.width !== audioPlayerWidth.value) {
      audioPlayerWidth.value = entry.contentRect.width
    }
  })
}

function initAudioPlayerResizeObserver() {
  audioPlayerResizeObserver.value = new ResizeObserver(onAudioPlayerResize)
  audioPlayerResizeObserver.value.observe(audioPlayerRef.value)
}

onMounted(async () => {
  initAudioPlayer()
  initAudioPlayerContainerResizeObserver()
  initAudioPlayerResizeObserver()

  audioPlayer.value.onloadstart = () => {
    setDuration(0)
  }
  audioPlayer.value.onloadedmetadata = () => {
    resetCurrentTime()
    setDuration(audioPlayer.value?.duration)
    if (props.playOnMount) {
      play()
    }
    loading.value = false
  }
  if (props.useAudioContext) {
    await initAudioContext()
  }
  if (props.spacebarToggle) {
    window.addEventListener('keyup', e => e.code === 'Space' && toggleAudio())
  }
})

function setCurrentTime(val: number) {
  currentTime.value = val
  emit('timeUpdate', { time: currentTime.value, duration: duration.value })
}

function setDuration(val: number) {
  duration.value = val
  emit('timeUpdate', { time: currentTime.value, duration: duration.value })
}

async function initAudioContext() {
  const { data } = await axios.get(props.src, {
    responseType: 'arraybuffer',
  })

  audioContext.value = new AudioContext()
  /* set duration */
  const decoded = await audioContext.value.decodeAudioData(data)
  setDuration(decoded.duration)

  /* gainNode setup */
  source.value = audioContext.value.createMediaElementSource(audioPlayer.value as HTMLMediaElement)
  gainNode.value = audioContext.value.createGain()
  source.value.connect(gainNode.value)
  gainNode.value.connect(audioContext.value.destination)
}

function initAudioPlayer() {
  setDuration(props.initDuration)
  audioPlayer.value.crossOrigin = 'anonymous'
  setGain(initVolume.value)
  audioPlayer.value.onended = () => {
    if (timeUpdate.value) {
      clearInterval(timeUpdate.value)
    }

    setCurrentTime(duration.value)
    isPaused.value = audioPlayer.value?.paused
    if (props.resetOnEnd) {
      resetCurrentTime()
    }
  }
  loading.value = false
}

function resetCurrentTime() {
  setCurrentTime(0)
}

function resumeAudioContext() {
  if (audioContext.value) {
    audioContext.value.resume()
    setGain(Number(volume.value))
  }
}

function toggleAudio() {
  if (audioContext.value && audioContext.value.state === 'suspended') {
    resumeAudioContext()
  }

  if (isPlaying.value) {
    pause()
  } else {
    play()
  }
}
function play() {
  audioPlayer.value?.play()
  startTimeUpdate()
  isPaused.value = audioPlayer.value?.paused
}
function setGain(vol: number) {
  volume.value = Number(vol)
  if (gainNode.value) {
    gainNode.value.gain.value = (volume.value * props.masterVolume) / 100
  } else {
    audioPlayer.value.volume = (vol * props.masterVolume) / 100
  }
}
function pause() {
  audioPlayer.value.pause()
  stopTimeUpdate()
  isPaused.value = audioPlayer.value?.paused
}
function setSeekTime(seekPosition: number | null) {
  seekTime.value = seekPosition ? duration.value * seekPosition : null
  emit('seekUpdate', seekTime.value)
}
function seek(seekPosition: number) {
  setSeekTime(null)
  audioPlayer.value.currentTime = duration.value * seekPosition
  setCurrentTime(audioPlayer.value?.currentTime)
  if (!isPlaying.value && props.playOnSeek) {
    toggleAudio()
  }
}
function startTimeUpdate() {
  timeUpdate.value = window.setInterval(() => {
    setCurrentTime(audioPlayer.value?.currentTime)
  }, 25)
}
function stopTimeUpdate() {
  if (timeUpdate.value) {
    clearInterval(timeUpdate.value)
  }
}

function toggleShuffle() {
  shuffleActive.value = !shuffleActive.value
  emit('shuffleToggle', shuffleActive.value)
}

defineExpose({ seek, play, pause, toggle: toggleAudio, status, isPlaying })
</script>

<style>
@import 'ress';
</style>

<style lang="css" scoped>
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
    width: 100%;
    position: relative;
    background: #f4f4f4;

    @media (max-width: 768px) {
      padding: 1.25rem 1rem 1rem 0.75rem;
    }

    .controls {
      display: flex;
      width: 100%;
      align-items: center;
      gap: 1rem;

      .button {
        height: 1rem;
        width: auto;
        flex-shrink: 0;
      }

      @media (max-width: 768px) {
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
        @media (max-width: 768px) {
          display: none;
        }
      }

      .current {
        @media (max-width: 768px) {
          display: none;
        }
      }
    }

    &.rounded {
      @media (max-width: 768px) {
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
}
</style>
