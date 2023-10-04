<template>
  <div class="audio-player-container">
    <div v-if="loading || error" class="audio-player">
      <AntennaIcon class="button" />
      <div v-if="loading" class="loading">Loading...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
    </div>
    <AudioStreamPlayer v-else-if="isStream" :volume-bar="volumeBar" :src="src" :audio-status="audioStatus"
      @audio-status-updated="updateAudioStatus" @stream-ended="error = 'Stream ended'" />
    <AudioFilePlayer v-else :src="src" :audio-status="audioStatus" :play-on-mount="playOnMount"
      :previous-button="previousButton" :next-button="nextButton" :volume-button="volumeButton"
      :shuffle-button="shuffleButton" :spacebar-toggle="spacebarToggle" @audio-status-updated="updateAudioStatus"
      @previous="$emit('previous')" @next="$emit('next')" @shuffle-toggle="handleShuffleToggle">
      <slot />
      <audio ref="audioPlayer" :src="src"></audio>
    </AudioFilePlayer>
  </div>
</template>

<script lang="ts" setup>
import AudioFilePlayer from './AudioFilePlayer.vue'
import AudioStreamPlayer from './AudioStreamPlayer.vue'
import AntennaIcon from './AntennaIcon.vue'
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  src: {
    type: String,
    default: null
  },
  stream: {
    type: Boolean,
    default: null
  },
  audioStatus: {
    type: String,
    default: undefined
  },
  idx: {
    type: Number,
    default: null
  },
  volumeBar: {
    type: Boolean,
    default: false
  },
  playOnMount: {
    type: Boolean,
    default: false
  },
  previousButton: {
    type: Boolean,
    default: false
  },
  nextButton: {
    type: Boolean,
    default: false
  },
  volumeButton: {
    type: Boolean,
    default: true
  },
  shuffleButton: {
    type: Boolean,
    default: false
  },
  spacebarToggle: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['loaded', 'audio-status-updated', 'previous', 'next', 'shuffle-toggle'])

const loading = ref(true)
const error = ref(null as string | null)

const isStream = computed(() => props.stream !== null)

onMounted(async () => {
  await initAudioContext()
})

const setLoading = (state: boolean) => {
  loading.value = state
  state === false && emit('loaded')
}

const updateAudioStatus = (status: any): void => {
  emit('audio-status-updated', status, props.idx)
}

const handleShuffleToggle = (active: any): void => {
  emit('shuffle-toggle', active)
}

const initAudioContext = async () => {
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
        if (request.status === 200) {
          request.abort()
        } else {
          error.value = 'Stream not found'
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
@import '../assets/scss/main.scss';

.audio-player-container {

  .loading,
  .error {
    font-size: 1rem;
    font-family: SpaceGrotesk, Arial, sans-serif;
    margin: 0px 1rem;
    line-height: 2.25rem;
  }

  .audio-player {
    font-family: SpaceGrotesk, Arial, sans-serif;
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem 1rem;

    .button {
      height: 1rem;
      width: auto;
      flex-shrink: 0;
    }
  }
}
</style>
