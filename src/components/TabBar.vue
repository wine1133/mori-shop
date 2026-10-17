<script setup lang="ts">
import { computed } from 'vue'
import MoriIcon from '@/components/MoriIcon.vue'
import { useShop } from '@/stores/shop'

const props = defineProps<{
  active: 'home' | 'cart' | 'profile'
}>()

const { cartCount } = useShop()

const tabs = [
  { key: 'home', label: '首页', icon: 'home', url: '/pages/index/index' },
  { key: 'cart', label: '购物袋', icon: 'bag', url: '/pages/cart/cart' },
  { key: 'profile', label: '我的', icon: 'user', url: '/pages/profile/profile' }
] as const

const badge = computed(() => (cartCount.value > 99 ? '99+' : String(cartCount.value)))

function switchTab(tab: (typeof tabs)[number]) {
  if (tab.key === props.active) return
  uni.redirectTo({ url: tab.url })
}
</script>

<template>
  <view class="tabbar">
    <view class="tabbar__inner">
      <view
        v-for="tab in tabs"
        :key="tab.key"
        class="tabbar__item"
        :class="{ 'tabbar__item--active': active === tab.key }"
        @tap="switchTab(tab)"
      >
        <view class="tabbar__icon-wrap">
          <MoriIcon
            :name="tab.icon"
            :tone="active === tab.key ? 'accent' : 'muted'"
            :size="43"
          />
          <view v-if="tab.key === 'cart' && cartCount > 0" class="tabbar__badge">
            {{ badge }}
          </view>
        </view>
        <text class="tabbar__label">{{ tab.label }}</text>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.tabbar {
  position: fixed;
  z-index: 80;
  left: 50%;
  bottom: 0;
  width: 100%;
  max-width: 540px;
  transform: translateX(-50%);
  background: rgba(255, 253, 248, 0.96);
  border-top: 1rpx solid var(--mori-line);
  box-shadow: 0 -14rpx 40rpx rgba(42, 37, 30, 0.05);
  backdrop-filter: blur(18px);
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}

.tabbar__inner {
  height: 122rpx;
  display: flex;
  align-items: center;
  padding: 0 44rpx;
}

.tabbar__item {
  position: relative;
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  transition: opacity 0.2s ease;
}

.tabbar__item:active {
  opacity: 0.66;
}

.tabbar__icon-wrap {
  position: relative;
  height: 46rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tabbar__label {
  font-size: 20rpx;
  line-height: 1;
  letter-spacing: 1rpx;
  color: var(--mori-muted);
}

.tabbar__item--active .tabbar__label {
  color: var(--mori-accent);
  font-weight: 600;
}

.tabbar__badge {
  position: absolute;
  top: -8rpx;
  right: -18rpx;
  min-width: 30rpx;
  height: 30rpx;
  padding: 0 7rpx;
  border-radius: 20rpx;
  background: var(--mori-accent);
  color: #fffdf8;
  font-size: 17rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3rpx solid var(--mori-surface);
}
</style>