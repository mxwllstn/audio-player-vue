<template>
  <div v-show="!hidden" ref="audioPlayerContainer" class="audio-player-container" :class="{ rounded }">
    <slot name="extended-top" />
    <div v-if="loading || error" class="audio-player">
      <AntennaIcon class="button" />
      <div v-if="loading" class="loading">
        Loading...
      </div>
      <div v-else-if="error" class="error">
        {{ error }}
      </div>
    </div>
    <AudioStreamPlayer
      v-else-if="isStream" :volume-bar="volumeBar" :src="src" :audio-status="audioStatus"
      :use-audio-context="true" :master-volume="masterVolume" :loading="loading" :data-tracking="dataTracking"
      @audio-status-updated="updateAudioStatus" @stream-ended="error = 'Stream ended'"
      @amplitude-data="onAmplitudeData" @spectral-data="onSpectralData"
    >
      <slot />
    </AudioStreamPlayer>
    <AudioFilePlayer
      v-else :src="src" :audio-status="audioStatus" :play-on-mount="playOnMount" :audio-player-container-width="audioPlayerContainerWidth"
      :previous-button="previousButton" :next-button="nextButton" :volume-button="volumeButton"
      :shuffle-button="shuffleButton" :spacebar-toggle="spacebarToggle" :use-audio-context="useAudioContext"
      :class="{ 'extended-info-opened': extendedInfoOpened }" :master-volume="masterVolume"
      @audio-status-updated="updateAudioStatus" @previous="$emit('previous')" @next="$emit('next')"
      @shuffle-toggle="handleShuffleToggle" @time-update="$emit('timeUpdate', $event)" @seek-update="$emit('seekUpdate', $event)"
    >
      <slot />
    </AudioFilePlayer>
    <slot name="extended-bottom" />
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, useTemplateRef } from 'vue'
import AntennaIcon from './AntennaIcon.vue'
import AudioFilePlayer from './AudioFilePlayer.vue'
import AudioStreamPlayer from './AudioStreamPlayer.vue'

const props = defineProps({
  useAudioContext: {
    type: Boolean,
    default: false,
  },
  src: {
    type: String,
    default: null,
  },
  stream: {
    type: Boolean,
    default: null,
  },
  audioStatus: {
    type: String,
    default: undefined,
  },
  idx: {
    type: Number,
    default: null,
  },
  volumeBar: {
    type: Boolean,
    default: false,
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
    default: false,
  },
  spacebarToggle: {
    type: Boolean,
    default: false,
  },
  extendedInfoOpened: {
    type: Boolean,
    default: false,
  },
  masterVolume: {
    type: Number,
    default: 1,
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

const emit = defineEmits(['loaded', 'error', 'audioStatusUpdated', 'previous', 'next', 'shuffleToggle', 'amplitudeData', 'spectralData', 'timeUpdate', 'seekUpdate'])

const loading = ref(true)
const error = ref(null as string | null)
const audioPlayerContainer = useTemplateRef('audioPlayerContainer')

const isStream = computed(() => props.stream !== null)
const audioPlayerContainerWidth = computed(() => audioPlayerContainer.value?.clientWidth ?? 0)

onMounted(async () => {
  await initAudioPlayer()
})

function setLoading(state: boolean) {
  loading.value = state
  if (state === false) {
    emit('loaded')
  }
}

function updateAudioStatus(status: any): void {
  emit('audioStatusUpdated', status, props.idx)
}

function onAmplitudeData(data: any): void {
  emit('amplitudeData', data, props.idx)
}

function onSpectralData(data: any): void {
  emit('spectralData', data, props.idx)
}

function handleShuffleToggle(active: any): void {
  emit('shuffleToggle', active)
}

async function initAudioPlayer() {
  try {
    if (!props.src) {
      error.value = 'Select an audio source'
      setLoading(false)
      return
    }
    error.value = null
    setLoading(true)
    if (isStream.value) {
      const request = new XMLHttpRequest()
      request.open('GET', props.src)
      request.responseType = 'arraybuffer'
      request.send()
      request.onerror = () => {
        setLoading(false)
        error.value = 'Stream not found'
        updateAudioStatus('error')
        emit('error', error.value)
      }
      request.onprogress = () => {
        if (request.status === 200) {
          request.abort()
        } else {
          error.value = 'Stream not found'
          updateAudioStatus('error')
          emit('error', error.value)
        }

        setLoading(false)
      }
    } else {
      setLoading(false)
    }
  } catch (error: any) {
    setLoading(false)
    console.error(error.message)
  }
}
</script>

<style lang="scss">
@import '../assets/scss/main';

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
