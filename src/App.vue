<template>
  <div class="content">
    <div class="container">
      <h4>multiple audio example</h4>
      <div v-for="(audio, idx) of audios" :key="idx">
        <AudioStreamPlayer v-if="audio.stream" ref="audioPlayer" :src="audio.src" :idx="idx" :volume-bar="audio.volumeBar" :audio-status="audio.status" :data-tracking="audio.dataTracking" :hidden="audio.hidden" :master-volume="0.75" @error="handleError($event, idx)" @audio-status-updated="updateAudioStatus" @amplitude-data="onAmplitudeData">
          <div v-if="audio.dataTracking" class="amplitude data-tracking" :style="{ background: audio.dataTracking && audio.status === 'playing' ? `rgb(199 0 57 / ${dbOpacity}%` : 'transparent', transform: `scale(${dbOpacity / 100 * 2})` }" />
        </AudioStreamPlayer>
        <AudioFilePlayer v-else ref="audioPlayer" :src="audio.src" :idx="idx" :stream="audio.stream" :audio-status="audio.status" :hidden="audio.hidden" :master-volume="0.75" @error="handleError($event, idx)" @audio-status-updated="updateAudioStatus" />
        <button v-if="audio?.status !== 'error'" :disabled="!audio.status" @click="toggleAudio(idx)">
          {{ audio.status ? audio.status : 'initializing' }}
        </button>
        <button v-if="idx === 1" @click="handleSeek(1, 0.5)">
          seek
        </button>
      </div>
    </div>
    <div class="container">
      <h4>single audio example</h4>
      <AudioFilePlayer :src="audioFile" :audio-status="audioStatus" :play-on-mount="playOnMount" @audio-status-updated="updateAudioStatus">
        <ExtendedInfo :audio-data="audioData" :extended-info-open="false" :queue-button="true" :location-button="true" />
      </AudioFilePlayer>
      <button @click="toggleAudio()">
        {{ audioStatus }}
      </button>
      <button @click="changeTrack(0)">
        track 1
      </button>
      <button @click="changeTrack(1)">
        track 2
      </button>
      <button @click="changeTrack(2)">
        track 3
      </button>
    </div>
    <div class="container">
      <h4>single audio example 2</h4>
      <AudioFilePlayer :src="audioFile" :audio-status="audioStatus" :next-button="true" :previous-button="true" :play-on-mount="playOnMount" :volume-button="false" :shuffle-button="true" :spacebar-toggle="true" rounded :extended-info-opened="showExtended" @audio-status-updated="updateAudioStatus" @next="handleNext" @previous="handlePrevious" @shuffle-toggle="handleShuffleToggle">
        <template v-if="showExtended" #extended-top>
          <div>test</div>
        </template>
        <ExtendedInfo :audio-data="audioData" :extended-info-open="false" :location-button="true" @extended-click="showExtended = !showExtended" />
      </AudioFilePlayer>
      <button @click="toggleAudio()">
        {{ audioStatus }}
      </button>
      <button @click="changeTrack(0)">
        track 1
      </button>
      <button @click="changeTrack(1)">
        track 2
      </button>
      <button @click="changeTrack(2)">
        track 3
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, useTemplateRef } from 'vue'
import { AudioFilePlayer, AudioStreamPlayer } from './components'
import ExtendedInfo from './components/ExtendedInfo.vue'

const audioPlayer = useTemplateRef('audioPlayer')

const showExtended = ref(false)

const audios = ref([
  {
    src: '/audio/1.mp3',
    data: {
      artist: 'Max Stein',
      title: 'Parc Lafontaine 2023.08.09',
      image: '/image/1.jpg',
    },
  },
  {
    src: '/audio/2.mp3',
    data: {
      artist: 'Max Stein',
      title: 'Echo Park Lake 2023.03.01',
    },
  },
  {
    src: '/audio/3.mp3',
    data: {
      artist: 'Max Stein',
      title: 'Parc Jarry 2022.05.12',
    },
  },
  {
    src: 'https://stream.radiovestige.com/AcousticMirror',
    stream: true,
  },
  {
    src: 'https://stream.sonicscape.land/audiohijack4',
    stream: true,
    volumeBar: true,
  },
  {
    src: 'https://stream.sonicscape.land/audiohijack4',
    stream: true,
    dataTracking: 'amplitude',
  },
  {
    src: 'https://stream.sonicscape.land/audiohijack4',
    stream: true,
    hidden: true,
  },
] as {
  src: string
  stream?: boolean
  hidden?: boolean
  status?: string
  data?: any
  dataTracking?: any
  volumeBar?: boolean
}[])
// const audioFile = ref()
const audioFile = ref(audios.value[0].src)
const audioData = ref(audios.value[0].data)
const audioStatus = ref('stopped')
const playOnMount = ref(false)

const shuffleActive = ref(false)

function handleError(error: string, idx: number) {
  // if (idx !== null) {
  //   audios.value[idx].status = error
  // } else {
  //   audioStatus.value = error
  // }
  console.log({ idx, error })
}

function handleSeek(idx: number, time: number) {
  if (audioPlayer.value?.[idx]) {
    audioPlayer.value[idx].seek(time)
  }
}

function updateAudioStatus(status: string, idx: number) {
  console.log({ status, idx })
  if (idx !== null) {
    audios.value[idx].status = status
  } else {
    audioStatus.value = status
  }
}
function changeTrack(idx: number) {
  playOnMount.value = true
  audioFile.value = audios.value[idx].src
  audioData.value = audios.value[idx].data
}

function toggleAudio(idx?: number) {
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
function handleNext() {
  changeTrack(2)
}

function handlePrevious() {
  changeTrack(1)
}

function handleShuffleToggle(active: boolean) {
  shuffleActive.value = active
}

const dbOpacity = ref(0)

const mapNumRange = (num: number, inMin: number, inMax: number, outMin: number, outMax: number) => ((num - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin

function onAmplitudeData(data: any) {
  const { avg } = data || {}
  const val = avg ? mapNumRange(avg, -50, 0, 0, 100) : 0
  dbOpacity.value = val
}
</script>

<style lang="scss" scoped>
.content {
  font-family: AuthenticSans, Arial, sans-serif;
  color: red;
  padding: 1rem 0 2rem;

  .container {
    padding: 0;

    h4 {
      padding: 1rem 1rem 0;
    }
  }

  button {
    border: 1px solid #000;
    border-radius: 0.25rem;
    padding: 0.25rem;
    margin: 0 1rem;
    font-size: 0.75rem;
  }
}

.data-tracking {
  transition:
    background-color 50ms linear,
    transform 500ms linear;
}

.amplitude {
  height: 1.25rem;
  width: 1.25rem;
  border-radius: 1.25rem;
}

:deep(.audio-player-container) {
  // padding-top: 1rem;
  // padding-bottom: 1rem;
  padding: 1rem 0;

  @include md {
    &.rounded {
      padding: 1rem;
    }
  }
}

:deep(.audio-player-container .audio-player .button) {
  &.shuffle.active {
    path {
      fill: green;
    }
  }
}
</style>
