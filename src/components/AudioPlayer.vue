<template>
  <div class="audio-player-container">
    <div v-if="loading || error" class="audio-player">
      <Antenna class="button" />
      <div v-if="loading" class="loading">Loading...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
    </div>
    <AudioStreamPlayer v-else-if="isStream" :src="src" :audio-status="audioStatus"
      @audio-status-updated="updateAudioStatus" @stream-ended="error = 'Stream ended'" />
    <AudioFilePlayer v-else :src="src" :init-duration="duration" :audio-context="audioContext" :audio-status="audioStatus"
      @audio-status-updated="updateAudioStatus" />
  </div>
</template>

<script lang="ts" setup>
import axios from 'axios'
import AudioFilePlayer from './AudioFilePlayer.vue'
import AudioStreamPlayer from './AudioStreamPlayer.vue'
import Antenna from '../assets/Antenna.svg?component'
import { ref, computed, onMounted, defineEmits, defineProps } from 'vue'

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
  }
})

const emit = defineEmits(['audio-status-updated'])

const loading = ref(true)
const error = ref(null as string | null)
const duration = ref(0)
const audioContext = ref(undefined as AudioContext | undefined)

const isStream = computed(() => props.stream !== null)

onMounted(async () => {
  await initAudioContext()
})

const updateAudioStatus = (status: any) => {
  emit('audio-status-updated', status, props.idx)
}

const initAudioContext = async () => {
  if (!props.src) {
    throw new Error('src is not set')
  }
  try {
    if (isStream.value) {
      const request = new XMLHttpRequest()
      request.open('GET', props.src)
      request.responseType = 'arraybuffer'
      request.send()
      request.onerror = () => {
        loading.value = false
        error.value = 'Stream not found'
      }
      request.onprogress = () => {
        if (request.status === 200) {
          request.abort()
          loading.value = false
        } else {
          loading.value = false
          error.value = 'Stream not found'
        }
      }
    } else {
      if (!props.src) {
        throw new Error('src is not set')
      }
      const { data } = await axios.get(props.src, {
        responseType: 'arraybuffer'
      })
      audioContext.value = new AudioContext()
      const decoded = await audioContext.value.decodeAudioData(data)
      duration.value = decoded.duration
      loading.value = false
    }
  } catch (error: any) {
    loading.value = false
    console.log(error)
    error.value = error.message
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
      flex-shrink: 0;
    }
  }
}
</style>
