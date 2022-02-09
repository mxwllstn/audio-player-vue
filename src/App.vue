<template>
  <AudioPlayer :src="audioFile" />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import AudioPlayer from './components';

export default defineComponent({
  components: { AudioPlayer },
  data() {
    return {
      audioFile: '/audio/1.mp3'
    }
  }
})
</script>
