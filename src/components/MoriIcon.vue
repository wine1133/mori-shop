<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    name: string
    size?: number | string
    tone?: 'ink' | 'muted' | 'accent' | 'white' | 'forest' | 'sage' | 'gold'
  }>(),
  {
    size: 40,
    tone: 'ink'
  }
)

const src = computed(() => {
  const suffix = props.tone === 'ink' ? '' : `-${props.tone}`
  return `/static/icons/${props.name}${suffix}.png`
})

const dimension = computed(() => (typeof props.size === 'number' ? `${props.size}rpx` : props.size))
</script>

<template>
  <image
    class="mori-icon"
    :src="src"
    :style="{ width: dimension, height: dimension }"
    mode="aspectFit"
  />
</template>

<style scoped lang="scss">
.mori-icon {
  flex: none;
}
</style>