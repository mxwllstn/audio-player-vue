<template>
  <svg v-if="isPlaying" width="100%" height="100%" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="1" width="4" height="12" rx="0.75" fill="black" />
    <rect x="9" y="1" width="4" height="12" rx="0.75" fill="black" />
  </svg>
  <svg v-else width="100%" height="100%" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12.6309 6.3063C13.123 6.62941 13.123 7.37059 12.631 7.6937L3.22469 13.8701C2.69419 14.2185 2 13.8252 2 13.1764L2 0.823578C2 0.174753 2.69419 -0.218456 3.22469 0.129883L12.6309 6.3063Z"
      fill="black"
    />
  </svg>
</template>

<script lang="ts" setup>
defineProps({
  isPlaying: {
    type: Boolean,
    default: false,
  },
})
</script>
