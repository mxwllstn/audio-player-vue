<template>
  <div class="audio-player-container">
    <audio ref="audioPlayer" crossorigin="anonymous" :src="src"></audio>
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <AudioStreamPlayer v-else-if="isStream" :src="src" />
    <AudioFilePlayer v-else :init-duration="duration" :audio-context="audioContext" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import axios from 'axios'
import AudioFilePlayer from './AudioFilePlayer.vue'
import AudioStreamPlayer from './AudioStreamPlayer.vue'

export default defineComponent({
  components: { AudioFilePlayer, AudioStreamPlayer },
  props: {
    src: {
      type: String,
      default: null
    },
    stream: {
      type: String,
      default: null
    }
  },
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
          request.onprogress = () => {
            if (request.status === 200) {
              request.abort()
              this.loading = false
            } else {
              this.loading = false
              console.error('stream not found')
              this.error = 'Error'
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
  font-size: 16px;
  font-family: AuthenticSans, Arial, sans-serif;
  .loading,
  .error {
    font-size: 1rem;
    font-family: SpaceGrotesk, Arial, sans-serif;
    padding: 1rem;
  }
  .audio-player {
    font-family: SpaceGrotesk, Arial, sans-serif;
    display: flex;
    align-items: center;
    // justify-content: center;
    padding: 1rem;
    .button {
      height: 1rem;
      width: 1rem;
      flex-shrink: 0;
    }
  }
}
</style>
