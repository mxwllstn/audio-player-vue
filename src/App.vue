<template>
  <AudioPlayer :src="audioFile" />
  <AudioPlayer :src="audioStream" stream />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import AudioPlayer from './components';

export default defineComponent({
  components: { AudioPlayer },
  data() {
    return {
      audioFile: '/audio/1.mp3',
      audioStream: 'http://localhost:8000/test',
    }
  }
})
</script>
