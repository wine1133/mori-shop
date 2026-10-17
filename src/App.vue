<script setup lang="ts">
import { onLaunch } from '@dcloudio/uni-app'
import { useShop } from '@/stores/shop'

onLaunch(() => {
  useShop()
})
</script>

<style lang="scss">
@import '@/styles/global.scss';
</style>