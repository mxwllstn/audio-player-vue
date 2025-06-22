<template>
  <div class="extended-info">
    <div class="extended">
      <div v-if="audioData" class="audio-data" @click="$emit('extendedClick', 'info')">
        <div class="container">
          <div class="image" :style="{ backgroundImage: `url(${image})` }" />
          <div class="info">
            <Vue3Marquee :animate-on-overflow-only="true" :pause-on-hover="true" :delay="1">
              <p class="artist">
                {{ artist }}
              </p>
            </Vue3Marquee>
            <Vue3Marquee :animate-on-overflow-only="true" :pause-on-hover="true" :delay="1">
              <p class="title">
                {{ title }}
              </p>
            </Vue3Marquee>
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
import { Vue3Marquee } from 'vue3-marquee'
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

const artist = computed(() => props.audioData?.artist)
const title = computed(() => props.audioData?.title)
const image = computed(() => props.audioData?.image)
</script>

<style lang="css" scoped>
.extended-info {
  @media (max-width: 768px) {
    width: 100%;
    min-width: 0;
  }

  .extended {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem;
    width: 360px;
    margin-left: 1rem;

    @media (max-width: 768px) {
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

      @media (max-width: 768px) {
        min-width: 0;
      }

      .container {
        display: flex;
        gap: 0.5rem;

        @media (max-width: 768px) {
          min-width: 0;
        }

        .image {
          min-height: 30px;
          min-width: 30px;
          background-size: cover;
          background-position: center;
        }

        .info {
          font-size: 0.825rem;
          display: flex;
          flex-direction: column;
          line-height: 1;
          justify-content: space-between;

          @media (max-width: 768px) {
            min-width: 0;
          }

          .artist {
            transition: color 300ms;
            color: #808080;
          }

          .title {
            transition: color 300ms;
            color: #000;
          }

          .marquee {
            p.artist,
            p.title {
              &::after {
                content: '\00a0\00a0\00a0\00a0\00a0';
              }
            }
          }

          .ellipsis {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
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
      width: auto;
      flex-shrink: 0;
    }

    .buttons {
      display: flex;
      gap: 1rem;
    }
  }
}
</style>
