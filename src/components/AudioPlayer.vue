<template>
  <div class="audio-player-container">
    <audio ref="audioPlayer" crossorigin="anonymous" :src="src"></audio>
    <div v-if="loading || error" class="audio-player">
      <Antenna class="button" />
      <div v-if="loading" class="loading">Loading...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
    </div>
    <AudioStreamPlayer
      v-else-if="isStream"
      :src="src"
      :audio-status="audioStatus"
      @audio-status-updated="updateAudioStatus"
      @stream-ended="error = 'Stream ended'"
    />
    <AudioFilePlayer
      v-else
      :init-duration="duration"
      :audio-context="audioContext"
      :audio-status="audioStatus"
      @audio-status-updated="updateAudioStatus"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import axios from 'axios'
import AudioFilePlayer from './AudioFilePlayer.vue'
import AudioStreamPlayer from './AudioStreamPlayer.vue'
import Antenna from '../assets/Antenna.svg?component'

export default defineComponent({
  components: { Antenna, AudioFilePlayer, AudioStreamPlayer },
  props: {
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
  },
  emits: ['audio-status-updated'],
  data() {
    return {
      loading: true,
      duration: 0,
      audioContext: undefined as AudioContext | undefined,
      error: null as string | null
    }
  },
  computed: {
    isStream(): any {
      return this.stream !== null
    }
  },
  mounted() {
    this.initAudioContext()
  },
  methods: {
    updateAudioStatus(status: any) {
      this.$emit('audio-status-updated', status, this.idx)
    },
    async initAudioContext() {
      if (!this.src) {
        throw new Error('src is not set')
      }
      try {
        if (this.isStream) {
          const request = new XMLHttpRequest()
          request.open('GET', this.src)
          request.responseType = 'arraybuffer'
          request.send()
          request.onerror = () => {
            this.loading = false
            this.error = 'Stream not found'
          }
          request.onprogress = () => {
            if (request.status === 200) {
              request.abort()
              this.loading = false
            } else {
              this.loading = false
              this.error = 'Stream not found'
            }
          }
        } else {
          if (!this.src) {
            throw new Error('src is not set')
          }
          const { data } = await axios.get(this.src, {
            responseType: 'arraybuffer'
          })
          this.audioContext = new AudioContext()
          const { duration } = await this.audioContext.decodeAudioData(data)
          this.duration = duration
          this.loading = false
        }
      } catch (error: any) {
        this.loading = false
        console.log(error)
        this.error = error.message
      }
    }
  }
})
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
