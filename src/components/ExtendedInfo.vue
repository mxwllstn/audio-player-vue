<template>
  <div class="extended-info">
    <div class="extended">
      <div v-if="audioData" class="audio-data" @click="$emit('extendedClick', 'info')">
        <div class="container">
          <div class="image" :style="{ backgroundImage: `url(${image})` }" />
          <div class="info">
            <p class="artist">
              {{ artist }}
            </p>
            <p class="title">
              {{ title }}
            </p>
          </div>
        </div>
        <InfoButton class="button" :open="extendedInfoOpen" />
      </div>
      <div class="buttons">
        <QueueButton v-if="queueButton" class="button" @click="$emit('extendedClick', 'queue')" />
        <LocationButton v-if="locationButton" class="button" @click="$emit('extendedClick', 'location')" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import InfoButton from './InfoButton.vue'
import LocationButton from './LocationButton.vue'
import QueueButton from './QueueButton.vue'

const props = defineProps({
  audioData: {
    type: Object,
    default: null,
  },
  extendedInfoOpen: {
    type: Boolean,
    default: false,
  },
  queueButton: {
    type: Boolean,
    default: false,
  },
  locationButton: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['extendedClick'])

const artist = computed(() => props.audioData.artist)
const title = computed(() => props.audioData.title)
const image = computed(() => props.audioData.image)
</script>

<style lang="scss" scoped>
.extended-info {
  @include md {
    width: 100%;
  }

  .extended {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem;
    width: 360px;
    margin-left: 1rem;

    @include md {
      width: auto;
      margin-left: 0;
    }

    .audio-data {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.5rem;
      transition: background-color 300ms;
      padding: 0.5rem 0.75rem;
      margin: -0.5rem 0;
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
}
</style>
