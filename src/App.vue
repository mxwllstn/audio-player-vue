<template>
  <div class="content">
    <div class="container">
      <h4>multiple audio example</h4>
      <div v-for="(audio, idx) of audios" :key="idx">
        <AudioPlayer :src="audio.src" :idx="idx" :stream="audio.stream" :audio-status="audio.status" @toggle-audio="setStatus" />
        <button @click="toggleAudio(idx)">{{ audio.status }}</button>
      </div>
    </div>
    <div class="container">
      <h4>single audio example</h4>
      <AudioPlayer :src="audioFile" :audio-status="status" @toggle-audio="setStatus" />
      <button @click="toggleAudio()">{{ status }}</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import AudioPlayer from './components'

export default defineComponent({
  components: { AudioPlayer },
  emits: ['toggleAudio'],
  data() {
    return {
      audios: [
        {
          src: '/audio/1.mp3',
          status: 'stopped'
        },
        {
          src: 'https://stream.maxstein.net/EAR2THEWINDOW',
          stream: true,
          status: 'stopped'
        }
      ],
      audioFile: '/audio/1.mp3',
      status: 'stopped'
    }
  },
  methods: {
    setStatus(status: string, idx: number) {
      console.log(status)
      if (idx !== null) {
        this.audios[idx].status = status
      } else {
        this.status = status
      }
    },
    toggleAudio(idx?: number) {
      if (idx !== undefined) {
        if (this.audios[idx].status === 'play') {
          this.audios[idx].status = 'pause'
        } else {
          this.audios[idx].status = 'play'
        }
      } else {
        if (this.status === 'play') {
          this.status = 'pause'
        } else {
          this.status = 'play'
        }
      }
    }
  }
})
</script>
<style lang="scss" scoped>
.content {
  font-family: AuthenticSans, Arial, sans-serif;
  .container {
    padding: 1rem 0;
    h4 {
      padding: 1rem 1rem 0;
    }
  }
  button {
    border: 1px solid #000;
    border-radius: 0.25rem;
    padding: 0.25rem;
    margin: 0px 1rem;
    font-size: 0.75rem;
  }
}
</style>
