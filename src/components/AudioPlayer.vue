<template>
  <div class="audio-player-container">
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
      :use-audio-context="true" @audio-status-updated="updateAudioStatus" @stream-ended="error = 'Stream ended'"
    />
    <AudioFilePlayer
      v-else :src="src" :audio-status="audioStatus" :play-on-mount="playOnMount"
      :previous-button="previousButton" :next-button="nextButton" :volume-button="volumeButton"
      :shuffle-button="shuffleButton" :spacebar-toggle="spacebarToggle" :use-audio-context="useAudioContext"
      :class="{ 'extended-info-opened': extendedInfoOpened }" @audio-status-updated="updateAudioStatus" @previous="$emit('previous')"
      @next="$emit('next')" @shuffle-toggle="handleShuffleToggle"
    >
      <slot />
    </AudioFilePlayer>
    <slot name="extended-bottom" />
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import AudioFilePlayer from './AudioFilePlayer.vue'
import AudioStreamPlayer from './AudioStreamPlayer.vue'
import AntennaIcon from './AntennaIcon.vue'

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
})

const emit = defineEmits(['loaded', 'audioStatusUpdated', 'previous', 'next', 'shuffleToggle'])

const loading = ref(true)
const error = ref(null as string | null)

const isStream = computed(() => props.stream !== null)

onMounted(async () => {
  await initAudioContext()
})

function setLoading(state: boolean) {
  loading.value = state
  state === false && emit('loaded')
}

function updateAudioStatus(status: any): void {
  emit('audioStatusUpdated', status, props.idx)
}

function handleShuffleToggle(active: any): void {
  emit('shuffleToggle', active)
}

async function initAudioContext() {
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
      }
      request.onprogress = () => {
        if (request.status === 200)
          request.abort()
        else
          error.value = 'Stream not found'

        setLoading(false)
      }
    }
    else {
      setLoading(false)
    }
  }
  catch (error: any) {
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

  .loading,
  .error {
    font-size: 1rem;
    font-family: SpaceGrotesk, Arial, sans-serif;
    line-height: 2.25rem;
  }

  @include md {
    padding: 1rem;
  }

  .audio-player {
    font-family: SpaceGrotesk, Arial, sans-serif;
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem 1rem;

    @include md {
      padding: 1rem 1rem 1rem 0.75rem;
      border-radius: 0.25rem;
    }

    .button {
      height: 1rem;
      width: auto;
      flex-shrink: 0;
    }
  }
}
</style>
