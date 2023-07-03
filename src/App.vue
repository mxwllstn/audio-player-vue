<template>
  <div class="content">
    <div class="container">
      <h4>multiple audio example</h4>
      <div v-for="(audio, idx) of audios" :key="idx">
        <AudioPlayer :src="audio.src" :idx="idx" :stream="audio.stream" :volume-bar="audio.volumeBar" :audio-status="audio.status"
          @audio-status-updated="updateAudioStatus" />
        <button @click="toggleAudio(idx)">{{ audio.status }}</button>
      </div>
    </div>
    <div class="container">
      <h4>single audio example</h4>
      <AudioPlayer :src="audioFile" :audio-status="audioStatus" @audio-status-updated="updateAudioStatus" />
      <button @click="toggleAudio()">{{ audioStatus }}</button>
      <button @click="changeTrack(0)">track 1</button>
      <button @click="changeTrack(1)">track 2</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import AudioPlayer from './components'
import { ref } from 'vue'

const audios = ref([
  {
    src: '/audio/1.mp3',
    status: 'stopped'
  },
  {
    src: '/audio/2.mp3',
    status: 'stopped'
  },
  {
    src: 'https://stream.sonicscape.land/audiohijack2',
    stream: true,
    status: 'stopped'
  },
  {
    src: 'https://stream.sonicscape.land/audiohijack2',
    stream: true,
    status: 'stopped',
    volumeBar: true
  }
])
const audioFile = ref('/audio/1.mp3')
const audioStatus = ref('stopped')

const updateAudioStatus = (status: string, idx: number) => {
  console.log(status)
  if (idx !== null) {
    audios.value[idx].status = status
  } else {
    audioStatus.value = status
  }
}
const changeTrack = (idx: number) => {
  console.log(audios.value[idx].src)
  audioFile.value = audios.value[idx].src
}

const toggleAudio = (idx?: number) => {
  if (idx !== undefined) {
    if (audios.value[idx].status === 'playing') {
      audios.value[idx].status = 'paused'
    } else {
      audios.value[idx].status = 'playing'
    }
  } else {
    if (audioStatus.value === 'playing') {
      audioStatus.value = 'paused'
    } else {
      audioStatus.value = 'playing'
    }
  }
}

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
