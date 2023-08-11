<template>
  <div>
    <div class="extended">
      <div v-if="audioData" class="audio-data" @click="$emit('extended-click', 'info')">
        <div class="container">
          <div class="image" :style="{ backgroundImage: `url(${image})`, backgroundColor: '#80c79b' }"></div>
          <div class="info">
            <p class="artist">{{ artist }}</p>
            <p class="title">{{ title }}</p>
          </div>
        </div>
        <InfoButton class="button" :open="extendedInfoOpen" />
      </div>
      <div class="buttons">
        <QueueButton class="button" @click="$emit('extended-click', 'queue')" />
        <LocationButton class="button" @click="$emit('extended-click', 'location')" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import InfoButton from './InfoButton.vue'
import QueueButton from './QueueButton.vue'
import LocationButton from './LocationButton.vue'
import { computed } from 'vue'
const props = defineProps({
  audioData: {
    type: Object,
    default: null
  },
  extendedInfoOpen: {
    type: Boolean,
    default: false
  }
})

defineEmits(['extended-click'])

const artist = computed(() => props.audioData.artist)
const title = computed(() => props.audioData.title)
const image = computed(() => props.audioData.image)

</script>

<style lang="scss" scoped>
.extended {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  width: 360px;
  margin-left: 1rem;

  .audio-data {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem;
    transition: background-color 300ms;
    padding: 0px 0.75rem 0px 0.25rem;
    width: 100%;

    .container {
      display: flex;
      gap: 0.5rem;

      .image {
        height: 30px;
        width: 30px;
        background-size: cover;
        background-position: center;
      }

      .info {
        font-size: 0.825rem;
        display: flex;
        flex-direction: column;
        // white-space: nowrap;
        line-height: 1;
        justify-content: space-between;

        .artist {
          transition: color 300ms;
          color: #808080;
        }

        .title {
          transition: color 300ms;
          color: #000;
        }
      }



    }

    &:hover {
      cursor: pointer;
      .info {
        .artist {
          color: #000;
        }
      }
    }
  }

  .button {
    height: 1rem;
    cursor: pointer;
  }

  .buttons {
    display: flex;
    gap: 1rem;
  }
}
</style>