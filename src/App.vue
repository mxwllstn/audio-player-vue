<template>
  <div class="content">
    <div class="container">
      <h4>multiple audio example</h4>
      <div v-for="(audio, idx) of audios" :key="idx">
        <AudioPlayer :src="audio.src" :idx="idx" :stream="audio.stream" :volume-bar="audio.volumeBar"
          :audio-status="audio.status" @audio-status-updated="updateAudioStatus" />
        <button @click="toggleAudio(idx)">{{ audio.status }}</button>
      </div>
    </div>
    <div class="container">
      <h4>single audio example</h4>
      <AudioPlayer :src="audioFile" :audio-status="audioStatus" :play-on-mount="playOnMount"
        @audio-status-updated="updateAudioStatus">
        <ExtendedInfo :audio-data="audioData" :extended-info-open="false" :queue-button="true"
          :location-button="true" />
      </AudioPlayer>
      <button @click="toggleAudio()">{{ audioStatus }}</button>
      <button @click="changeTrack(0)">track 1</button>
      <button @click="changeTrack(1)">track 2</button>
      <button @click="changeTrack(2)">track 3</button>
    </div>
    <div class="container">
      <h4>single audio example</h4>
      <AudioPlayer :src="audioFile" :audio-status="audioStatus" :next-button="true" :previous-button="true"
        :play-on-mount="playOnMount" :volume-button="false" :shuffle-button="true" :spacebar-toggle="true"
        @audio-status-updated="updateAudioStatus" @next="handleNext" @previous="handlePrevious"
        @shuffle-toggle="handleShuffleToggle">
        <template v-if="showExtended" #extended-top>
          <div>test</div>
        </template>
        <ExtendedInfo :audio-data="audioData" :extended-info-open="false" :location-button="true"
          @extended-click="showExtended = !showExtended" />
      </AudioPlayer>
      <button @click="toggleAudio()">{{ audioStatus }}</button>
      <button @click="changeTrack(0)">track 1</button>
      <button @click="changeTrack(1)">track 2</button>
      <button @click="changeTrack(2)">track 3</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import AudioPlayer from './components'
import ExtendedInfo from './components/ExtendedInfo.vue'
import { ref } from 'vue'

const showExtended = ref(false)

const audios = ref([
  {
    src: '/audio/1.mp3',
    status: 'stopped',
    data: {
      artist: 'Max Stein',
      title: 'Parc Lafontaine 2023.08.09',
      image: '/image/1.jpg'
    }
  },
  {
    src: '/audio/2.mp3',
    status: 'stopped',
    data: {
      artist: 'Max Stein',
      title: 'Echo Park Lake 2023.03.01'
    }
  },
  {
    src: '/audio/3.mp3',
    status: 'stopped',
    data: {
      artist: 'Max Stein',
      title: 'Parc Jarry 2022.05.12'
    }
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
// const audioFile = ref()
const audioFile = ref(audios.value[0].src)
const audioData = ref(audios.value[0].data)
const audioStatus = ref('stopped')
const playOnMount = ref(false)

const shuffleActive = ref(false)

const updateAudioStatus = (status: string, idx: number) => {
  if (idx !== null) {
    audios.value[idx].status = status
  } else {
    audioStatus.value = status
  }
}
const changeTrack = (idx: number) => {
  playOnMount.value = true
  audioFile.value = audios.value[idx].src
  audioData.value = audios.value[idx].data
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
const handleNext = () => {
  changeTrack(2)
}

const handlePrevious = () => {
  changeTrack(1)
}

const handleShuffleToggle = (active: boolean) => {
  shuffleActive.value = active
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

:deep(.audio-player-container .audio-player .button) {
  &.shuffle.active {
    path {
      fill: green;
    }
  }

  // :deep(button.shuffle.active) {
  // :deep(path) {
  // fill: green;
  // }
  // }
}
</style>
