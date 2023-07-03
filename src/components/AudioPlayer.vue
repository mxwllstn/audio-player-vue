<template>
  <div class="audio-player-container">
    <div v-if="loading || error" class="audio-player">
      <AntennaIcon class="button" />
      <div v-if="loading" class="loading">Loading...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
    </div>
    <AudioStreamPlayer v-else-if="isStream" :volume-bar="volumeBar" :src="src" :audio-status="audioStatus"
      @audio-status-updated="updateAudioStatus" @stream-ended="error = 'Stream ended'" />
    <AudioFilePlayer v-else :src="src" :init-duration="duration" :audio-context="audioContext" :audio-status="audioStatus"
      @audio-status-updated="updateAudioStatus" />
  </div>
</template>

<script lang="ts" setup>
import axios from 'axios'
import AudioFilePlayer from './AudioFilePlayer.vue'
import AudioStreamPlayer from './AudioStreamPlayer.vue'
import AntennaIcon from './AntennaIcon.vue'
import { ref, computed, onMounted, watch } from 'vue'

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
  }
})

const emit = defineEmits(['loaded', 'audio-status-updated'])

const loading = ref(true)
const error = ref(null as string | null)
const duration = ref(0)
const audioContext = ref(undefined as AudioContext | undefined)

const isStream = computed(() => props.stream !== null)

onMounted(async () => {
  await initAudioContext()
})

watch(() => props.src, async () => {
  !audioContext.value ? await initAudioContext() : audioContext.value && audioContext.value.state !== 'closed' && audioContext.value.close()
})


const setLoading = (state: boolean) => {
  loading.value = state
  state === false && emit('loaded')
}

const updateAudioStatus = (status: any): void => {
  emit('audio-status-updated', status, props.idx)
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
      const { data } = await axios.get(props.src, {
        responseType: 'arraybuffer'
      })
      audioContext.value = new AudioContext()
      const decoded = await audioContext.value.decodeAudioData(data)
      duration.value = decoded.duration
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
  }

  .audio-player {
    font-family: SpaceGrotesk, Arial, sans-serif;
    display: flex;
    align-items: center;
    // justify-content: center;
    padding: 1rem;

    .button {
      height: 1rem;
      width: auto;
      flex-shrink: 0;
    }
  }
}
</style>
