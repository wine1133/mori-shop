<script setup lang="ts">
import { computed } from 'vue'
import MoriIcon from '@/components/MoriIcon.vue'
import { useShop } from '@/stores/shop'
import type { Product } from '@/types/shop'
import { money } from '@/utils/format'

const props = defineProps<{
  product: Product
  index: number
}>()

const { state, toggleFavorite } = useShop()
const favorite = computed(() => state.favorites.includes(props.product.id))
const imageClass = computed(() => `product-card__image--${props.product.aspect}`)

function openDetail() {
  uni.navigateTo({ url: `/pages/detail/detail?id=${props.product.id}` })
}

function onFavorite() {
  toggleFavorite(props.product.id)
  uni.vibrateShort?.({ type: 'light' })
}

defineExpose({ openDetail })
</script>

<template>
  <view class="product-card fade-up" :style="{ animationDelay: `${Math.min(index, 6) * 55}ms` }" @tap="openDetail">
    <view class="product-card__visual" :class="imageClass">
      <image class="product-card__image" :src="product.images[0]" mode="aspectFill" />
      <view v-if="product.tag" class="product-card__tag">{{ product.tag }}</view>
      <view class="product-card__favorite" :class="{ 'is-active': favorite }" @tap.stop="onFavorite">
        <MoriIcon name="heart" :tone="favorite ? 'accent' : 'white'" :size="31" />
      </view>
      <view class="product-card__quick">
        <MoriIcon name="plus" tone="ink" :size="28" />
      </view>
    </view>

    <view class="product-card__body">
      <view class="product-card__category">{{ product.category }} · {{ product.englishName }}</view>
      <view class="product-card__name">{{ product.name }}</view>
      <view class="product-card__meta">
        <view class="product-card__price">
          <text class="product-card__currency">¥</text>
          <text class="product-card__number">{{ money(product.price) }}</text>
        </view>
        <text v-if="product.originalPrice" class="product-card__original">¥{{ money(product.originalPrice) }}</text>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.product-card {
  width: 100%;
  overflow: hidden;
}

.product-card:active .product-card__image {
  transform: scale(1.025);
}

.product-card__visual {
  position: relative;
  width: 100%;
  overflow: hidden;
  border-radius: 26rpx;
  background: var(--mori-surface-alt);
}

.product-card__image--tall {
  height: 500rpx;
}

.product-card__image--regular {
  height: 476rpx;
}

.product-card__image--short {
  height: 460rpx;
}

.product-card__image {
  width: 100%;
  height: 100%;
  transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}

.product-card__tag {
  position: absolute;
  top: 18rpx;
  left: 18rpx;
  padding: 9rpx 16rpx;
  border-radius: 999rpx;
  font-size: 18rpx;
  font-weight: 600;
  letter-spacing: 1rpx;
  color: var(--mori-ink);
  background: rgba(255, 253, 248, 0.9);
  backdrop-filter: blur(8px);
}

.product-card__favorite,
.product-card__quick {
  position: absolute;
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(29, 33, 28, 0.34);
  backdrop-filter: blur(8px);
}

.product-card__favorite {
  top: 14rpx;
  right: 14rpx;
}

.product-card__favorite.is-active {
  background: rgba(255, 253, 248, 0.94);
}

.product-card__quick {
  right: 16rpx;
  bottom: 16rpx;
  background: rgba(255, 253, 248, 0.94);
}

.product-card__body {
  padding: 18rpx 4rpx 28rpx;
}

.product-card__category {
  font-size: 18rpx;
  line-height: 1.4;
  letter-spacing: 1.2rpx;
  text-transform: uppercase;
  color: var(--mori-muted-light);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.product-card__name {
  margin-top: 7rpx;
  font-size: 26rpx;
  line-height: 1.42;
  font-weight: 500;
  color: var(--mori-ink);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-card__meta {
  margin-top: 12rpx;
  display: flex;
  align-items: baseline;
  gap: 12rpx;
}

.product-card__price {
  color: var(--mori-accent-deep);
  font-weight: 600;
}

.product-card__currency {
  font-family: var(--mori-serif);
  font-size: 23rpx;
  margin-right: 2rpx;
}

.product-card__number {
  font-family: var(--mori-serif);
  font-size: 34rpx;
  letter-spacing: -0.5rpx;
}

.product-card__original {
  font-size: 19rpx;
  color: var(--mori-muted-light);
  text-decoration: line-through;
}
</style>