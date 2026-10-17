<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad, onShareAppMessage } from '@dcloudio/uni-app'
import MoriIcon from '@/components/MoriIcon.vue'
import { findProduct } from '@/data/products'
import { fetchProductDetail } from '@/api/shop'
import { useShop } from '@/stores/shop'
import type { Product } from '@/types/shop'
import { money } from '@/utils/format'

const { state, addToCart, buyNow, toggleFavorite } = useShop()

const product = ref<Product | null>(null)
const activeImage = ref(0)
const selectedColor = ref('')
const selectedSize = ref('')
const quantity = ref(1)
const sheetOpen = ref(false)
const addedPulse = ref(false)

const selectedColorValue = computed(
  () => product.value?.colors.find((color) => color.name === selectedColor.value)?.value || '#c8b9a0'
)

const availableSizes = computed(() => product.value?.sizes || [])

const selectedSizeStock = computed(() => {
  const size = product.value?.sizes.find((item) => item.name === selectedSize.value)
  return size?.stock ?? 0
})

const favorite = computed(() => (product.value ? state.favorites.includes(product.value.id) : false))
const total = computed(() => (product.value?.price || 0) * quantity.value)

function applyProduct(found: Product) {
  product.value = found
  selectedColor.value = found.colors[0]?.name || ''
  selectedSize.value = found.sizes.find((size) => size.stock > 0)?.name || found.sizes[0]?.name || ''
  quantity.value = 1
}

onLoad(async (options) => {
  const id = String(options?.id || 'P01')
  const fallback = findProduct(id)
  if (fallback) applyProduct(fallback)

  const remote = await fetchProductDetail(id)
  if (remote.cloudUsed && remote.product) {
    applyProduct(remote.product)
    return
  }

  if (!fallback) {
    uni.showToast({ title: '商品不存在', icon: 'none' })
    setTimeout(() => uni.redirectTo({ url: '/pages/index/index' }), 600)
  }
})

onShareAppMessage(() => ({
  title: product.value?.name || 'MORI 木里',
  path: `/pages/detail/detail?id=${product.value?.id || 'P01'}`,
  imageUrl: product.value?.images[0]
}))

function goBack() {
  const pages = getCurrentPages()
  if (pages.length > 1) {
    uni.navigateBack()
  } else {
    uni.redirectTo({ url: '/pages/index/index' })
  }
}

function shareProduct() {
  // #ifdef H5
  const link = window.location.href
  uni.setClipboardData({
    data: link,
    success: () => uni.showToast({ title: '链接已复制', icon: 'none' })
  })
  // #endif
  // #ifndef H5
  uni.showToast({ title: '请使用右上角分享', icon: 'none' })
  // #endif
}

function chooseColor(name: string) {
  selectedColor.value = name
}

function chooseSize(size: string, stock: number) {
  if (!stock) return
  selectedSize.value = size
  if (quantity.value > stock) quantity.value = stock
}

function decrease() {
  quantity.value = Math.max(1, quantity.value - 1)
}

function increase() {
  const max = Math.max(1, selectedSizeStock.value)
  quantity.value = Math.min(max, quantity.value + 1)
}

function addToBag() {
  if (!product.value) return
  if (!selectedSize.value) {
    uni.showToast({ title: '请选择尺码', icon: 'none' })
    return
  }
  addToCart(
    product.value,
    selectedSize.value,
    selectedColor.value,
    selectedColorValue.value,
    quantity.value
  )
  addedPulse.value = true
  setTimeout(() => {
    addedPulse.value = false
  }, 700)
  uni.showToast({ title: '已加入购物袋', icon: 'none' })
}

function openSheet() {
  if (!selectedSize.value) {
    uni.showToast({ title: '请选择尺码', icon: 'none' })
    return
  }
  sheetOpen.value = true
}

function closeSheet() {
  sheetOpen.value = false
}

async function submitOrder() {
  if (!product.value) return
  try {
    await buyNow(product.value, selectedSize.value, selectedColor.value, quantity.value)
    sheetOpen.value = false
    uni.showModal({
      title: '订单已创建',
      content: '支付状态：未支付。支付流程将在后端接入后开放。',
      confirmText: '查看订单',
      showCancel: false,
      success: () => uni.redirectTo({ url: '/pages/profile/profile' })
    })
  } catch (error) {
    uni.showToast({
      title: error instanceof Error ? error.message : '创建订单失败',
      icon: 'none'
    })
  }
}

function toggleFav() {
  if (!product.value) return
  toggleFavorite(product.value.id)
  uni.vibrateShort?.({ type: 'light' })
}

function showServiceNotice() {
  uni.showToast({ title: '客服功能后端接入后开放', icon: 'none' })
}
</script>

<template>
  <view v-if="product" class="page-wrap detail-page">
    <view class="gallery">
      <swiper
        class="gallery__swiper"
        :current="activeImage"
        :circular="true"
        :duration="420"
        @change="activeImage = $event.detail.current"
      >
        <swiper-item v-for="image in product.images" :key="image">
          <image class="gallery__image" :src="image" mode="aspectFill" />
        </swiper-item>
      </swiper>

      <view class="gallery__shade" />

      <view class="detail-nav">
        <view class="round-button" @tap="goBack">
          <MoriIcon name="back" :size="36" />
        </view>
        <view class="detail-nav__right">
          <view class="round-button" @tap="shareProduct">
            <MoriIcon name="share" :size="34" />
          </view>
          <view class="round-button" :class="{ 'round-button--active': favorite }" @tap="toggleFav">
            <MoriIcon name="heart" :tone="favorite ? 'accent' : 'ink'" :size="35" />
          </view>
        </view>
      </view>

      <view class="gallery__bottom">
        <view class="gallery__counter">
          <text class="gallery__counter-current">{{ String(activeImage + 1).padStart(2, '0') }}</text>
          <view class="gallery__counter-line" />
          <text>{{ String(product.images.length).padStart(2, '0') }}</text>
        </view>
        <view class="gallery__dots">
          <view
            v-for="(_, index) in product.images"
            :key="index"
            class="gallery__dot"
            :class="{ 'gallery__dot--active': activeImage === index }"
          />
        </view>
      </view>
    </view>

    <view class="product-panel">
      <view class="product-panel__top">
        <view class="eyebrow">{{ product.category }} / {{ product.englishName }}</view>
        <view class="product-panel__title-row">
          <view class="product-title">{{ product.name }}</view>
          <view class="rating">
            <MoriIcon name="star" tone="accent" :size="24" />
            <text class="rating__value">{{ product.rating }}</text>
            <text class="rating__reviews">({{ product.reviews }})</text>
          </view>
        </view>
        <view class="product-subtitle">{{ product.subtitle }}</view>

        <view class="price-row">
          <view class="price-main">
            <text class="price-main__currency">¥</text>
            <text class="price-main__value">{{ money(product.price) }}</text>
            <text v-if="product.originalPrice" class="price-main__original">¥{{ money(product.originalPrice) }}</text>
          </view>
          <view class="member-chip">
            <MoriIcon name="leaf" tone="accent" :size="24" />
            <text>会员再享 95 折</text>
          </view>
        </view>

        <view class="sales-row">
          <text>已售 {{ product.sold }} 件</text>
          <view class="sales-row__dot" />
          <text>7 天无理由退换</text>
          <view class="sales-row__dot" />
          <text>顺丰包邮</text>
        </view>
      </view>

      <view class="benefits">
        <view class="benefit">
          <MoriIcon name="truck" tone="forest" :size="36" />
          <view class="benefit__copy">
            <text class="benefit__title">满 599 免运费</text>
            <text class="benefit__text">预计 48 小时内发出</text>
          </view>
        </view>
        <view class="benefit">
          <MoriIcon name="shield" tone="forest" :size="36" />
          <view class="benefit__copy">
            <text class="benefit__title">正品与材质保障</text>
            <text class="benefit__text">每件商品经过严格质检</text>
          </view>
        </view>
        <view class="benefit">
          <MoriIcon name="service" tone="forest" :size="36" />
          <view class="benefit__copy">
            <text class="benefit__title">专属搭配顾问</text>
            <text class="benefit__text">在线为你提供尺码建议</text>
          </view>
        </view>
      </view>

      <view class="divider" />

      <view class="selector">
        <view class="selector__head">
          <text class="selector__label">颜色 <text class="selector__en">/ COLOR</text></text>
          <text class="selector__selected">{{ selectedColor }}</text>
        </view>
        <view class="colors">
          <view
            v-for="color in product.colors"
            :key="color.name"
            class="color-option"
            :class="{ 'color-option--active': selectedColor === color.name }"
            @tap="chooseColor(color.name)"
          >
            <view class="color-option__swatch" :style="{ backgroundColor: color.value }" />
            <text>{{ color.name }}</text>
          </view>
        </view>
      </view>

      <view class="selector">
        <view class="selector__head">
          <text class="selector__label">尺码 <text class="selector__en">/ SIZE</text></text>
          <text class="selector__guide">尺码指南 →</text>
        </view>
        <view class="sizes">
          <view
            v-for="size in availableSizes"
            :key="size.name"
            class="size-option"
            :class="{
              'size-option--active': selectedSize === size.name,
              'size-option--disabled': size.stock === 0
            }"
            @tap="chooseSize(size.name, size.stock)"
          >
            <text>{{ size.name }}</text>
            <view v-if="size.stock === 0" class="size-option__line" />
          </view>
        </view>
        <view class="stock-line">
          <view class="stock-line__dot" :class="{ 'stock-line__dot--low': selectedSizeStock <= 3 }" />
          <text v-if="selectedSizeStock > 3">库存充足 · 现货 {{ selectedSizeStock }} 件</text>
          <text v-else-if="selectedSizeStock > 0" class="stock-line__low">仅剩 {{ selectedSizeStock }} 件</text>
          <text v-else>该尺码暂时缺货</text>
        </view>
      </view>

      <view class="selector quantity-row">
        <view>
          <text class="selector__label">数量 <text class="selector__en">/ QTY</text></text>
          <view class="quantity-row__hint">每单限购 99 件</view>
        </view>
        <view class="stepper">
          <view class="stepper__button" :class="{ 'stepper__button--disabled': quantity <= 1 }" @tap="decrease">
            <MoriIcon name="minus" :size="25" />
          </view>
          <text class="stepper__value">{{ quantity }}</text>
          <view
            class="stepper__button"
            :class="{ 'stepper__button--disabled': quantity >= selectedSizeStock }"
            @tap="increase"
          >
            <MoriIcon name="plus" :size="25" />
          </view>
        </view>
      </view>

      <view class="divider" />

      <view class="story">
        <view class="eyebrow">DESIGN NOTES / 关于这件作品</view>
        <view class="story__title">为日常留下更多呼吸感</view>
        <view class="story__text">{{ product.description }}</view>

        <view class="story__grid">
          <view class="story__cell">
            <text class="story__cell-label">材质</text>
            <text class="story__cell-value">{{ product.material }}</text>
          </view>
          <view class="story__cell">
            <text class="story__cell-label">洗护</text>
            <text class="story__cell-value">{{ product.care }}</text>
          </view>
        </view>
      </view>

      <view class="shipping-card">
        <view class="shipping-card__icon">
          <MoriIcon name="location" tone="forest" :size="38" />
        </view>
        <view class="shipping-card__copy">
          <text class="shipping-card__title">配送至 {{ state.address.region }}</text>
          <text class="shipping-card__text">{{ state.address.detail }} · 预计 2-4 天送达</text>
        </view>
        <MoriIcon name="arrow-right" tone="muted" :size="26" />
      </view>

      <view class="after-sale">
        <view class="after-sale__item">
          <MoriIcon name="shield" tone="muted" :size="29" />
          <text>正品保障</text>
        </view>
        <view class="after-sale__item">
          <MoriIcon name="truck" tone="muted" :size="29" />
          <text>48h 发货</text>
        </view>
        <view class="after-sale__item">
          <MoriIcon name="message" tone="muted" :size="29" />
          <text>在线客服</text>
        </view>
      </view>
    </view>

    <view class="detail-space" />

    <view class="buy-bar">
      <view class="buy-bar__utility">
        <view class="buy-bar__icon" @tap="toggleFav">
          <MoriIcon name="heart" :tone="favorite ? 'accent' : 'ink'" :size="36" />
          <text>{{ favorite ? '已收藏' : '收藏' }}</text>
        </view>
        <view class="buy-bar__icon" @tap="showServiceNotice">
          <MoriIcon name="service" :size="36" />
          <text>客服</text>
        </view>
      </view>
      <view class="buy-bar__actions">
        <button class="buy-button buy-button--outline" :class="{ 'buy-button--pulse': addedPulse }" @tap="addToBag">
          加入购物袋
        </button>
        <button class="buy-button buy-button--solid" @tap="openSheet">立即购买</button>
      </view>
    </view>

    <view v-if="sheetOpen" class="sheet-layer" @tap="closeSheet">
      <view class="sheet" @tap.stop>
        <view class="sheet__handle" />
        <view class="sheet__head">
          <text class="sheet__title">确认你的选择</text>
          <view class="sheet__close" @tap="closeSheet">
            <MoriIcon name="close" tone="muted" :size="31" />
          </view>
        </view>
        <view class="sheet__product">
          <image class="sheet__image" :src="product.images[0]" mode="aspectFill" />
          <view class="sheet__info">
            <text class="sheet__name">{{ product.name }}</text>
            <text class="sheet__variant">{{ selectedColor }} · {{ selectedSize }} · 数量 {{ quantity }}</text>
            <text class="sheet__price">¥{{ money(total) }}</text>
          </view>
        </view>
        <view class="sheet__address">
          <MoriIcon name="location" tone="forest" :size="31" />
          <view class="sheet__address-copy">
            <text>{{ state.address.name }} · {{ state.address.phone }}</text>
            <text class="sheet__address-detail">{{ state.address.region }}{{ state.address.detail }}</text>
          </view>
        </view>
        <view class="sheet__summary">
          <text>商品小计</text>
          <text>¥{{ money(total) }}</text>
        </view>
        <view class="sheet__summary">
          <text>运费</text>
          <text>{{ total >= 599 ? '免运费' : '¥12' }}</text>
        </view>
        <view class="sheet__total">
          <text>应付合计</text>
          <text class="sheet__total-price">¥{{ money(total >= 599 ? total : total + 12) }}</text>
        </view>
        <button class="sheet__submit" @tap="submitOrder">
          提交订单
          <text class="sheet__submit-note">未支付</text>
        </button>
        <text class="sheet__hint">本次为前端演示订单，支付流程将在后端接入后开放</text>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.detail-page {
  padding-bottom: 1rpx;
}

.gallery {
  position: relative;
  height: 1010rpx;
  background: var(--mori-surface-alt);
}

.gallery__swiper,
.gallery__image {
  width: 100%;
  height: 100%;
}

.gallery__shade {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 240rpx;
  pointer-events: none;
  background: linear-gradient(180deg, rgba(18, 21, 17, 0.28), rgba(18, 21, 17, 0));
}

.detail-nav {
  position: absolute;
  top: calc(var(--status-bar-height) + 22rpx);
  left: 26rpx;
  right: 26rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.detail-nav__right {
  display: flex;
  gap: 12rpx;
}

.round-button {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: rgba(255, 253, 248, 0.92);
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(20, 23, 18, 0.08);
}

.round-button:active {
  transform: scale(0.94);
}

.round-button--active {
  background: #fff8f3;
}

.gallery__bottom {
  position: absolute;
  left: 30rpx;
  right: 30rpx;
  bottom: 42rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.gallery__counter {
  height: 46rpx;
  padding: 0 16rpx;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  gap: 8rpx;
  background: rgba(27, 30, 25, 0.38);
  backdrop-filter: blur(10px);
  color: rgba(255, 253, 248, 0.7);
  font-family: var(--mori-serif);
  font-size: 17rpx;
  letter-spacing: 1rpx;
}

.gallery__counter-current {
  color: #fffdf8;
}

.gallery__counter-line {
  width: 20rpx;
  height: 1rpx;
  background: rgba(255, 253, 248, 0.5);
}

.gallery__dots {
  display: flex;
  gap: 8rpx;
}

.gallery__dot {
  width: 10rpx;
  height: 10rpx;
  border-radius: 50%;
  background: rgba(255, 253, 248, 0.45);
  transition: width 0.25s ease;
}

.gallery__dot--active {
  width: 30rpx;
  border-radius: 999rpx;
  background: #fffdf8;
}

.product-panel {
  position: relative;
  margin-top: -38rpx;
  padding: 42rpx 30rpx 0;
  border-radius: 40rpx 40rpx 0 0;
  background: var(--mori-bg);
  z-index: 2;
}

.product-panel__top {
  padding: 0 2rpx;
}

.product-panel__title-row {
  margin-top: 12rpx;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20rpx;
}

.product-title {
  flex: 1;
  font-family: var(--mori-serif);
  font-size: 48rpx;
  line-height: 1.24;
  font-weight: 500;
  letter-spacing: -0.5rpx;
}

.rating {
  margin-top: 10rpx;
  display: flex;
  align-items: center;
  gap: 5rpx;
}

.rating__value {
  font-size: 22rpx;
  font-weight: 600;
}

.rating__reviews {
  font-size: 19rpx;
  color: var(--mori-muted);
}

.product-subtitle {
  margin-top: 14rpx;
  font-size: 24rpx;
  line-height: 1.6;
  color: var(--mori-muted);
}

.price-row {
  margin-top: 28rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18rpx;
}

.price-main {
  display: flex;
  align-items: baseline;
  color: var(--mori-accent-deep);
}

.price-main__currency {
  font-family: var(--mori-serif);
  font-size: 28rpx;
  margin-right: 3rpx;
}

.price-main__value {
  font-family: var(--mori-serif);
  font-size: 60rpx;
  line-height: 1;
  font-weight: 600;
  letter-spacing: -1rpx;
}

.price-main__original {
  margin-left: 14rpx;
  font-size: 21rpx;
  color: var(--mori-muted-light);
  text-decoration: line-through;
}

.member-chip {
  height: 50rpx;
  padding: 0 16rpx;
  border-radius: 999rpx;
  border: 1rpx solid rgba(183, 84, 56, 0.22);
  background: rgba(183, 84, 56, 0.07);
  display: flex;
  align-items: center;
  gap: 6rpx;
  font-size: 18rpx;
  color: var(--mori-accent-deep);
}

.sales-row {
  margin-top: 22rpx;
  display: flex;
  align-items: center;
  gap: 12rpx;
  font-size: 20rpx;
  color: var(--mori-muted);
}

.sales-row__dot {
  width: 4rpx;
  height: 4rpx;
  border-radius: 50%;
  background: var(--mori-muted-light);
}

.benefits {
  margin-top: 32rpx;
  padding: 24rpx 22rpx;
  border-radius: 24rpx;
  display: flex;
  gap: 10rpx;
  background: rgba(255, 253, 248, 0.65);
  border: 1rpx solid rgba(29, 33, 28, 0.06);
}

.benefit {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: flex-start;
  gap: 8rpx;
}

.benefit__copy {
  display: flex;
  flex-direction: column;
  gap: 5rpx;
}

.benefit__title {
  font-size: 19rpx;
  font-weight: 500;
  line-height: 1.35;
}

.benefit__text {
  font-size: 17rpx;
  line-height: 1.45;
  color: var(--mori-muted);
}

.divider {
  height: 1rpx;
  margin: 36rpx 2rpx;
  background: var(--mori-line);
}

.selector + .selector {
  margin-top: 32rpx;
}

.selector__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16rpx;
}

.selector__label {
  font-size: 26rpx;
  font-weight: 600;
  letter-spacing: 1rpx;
}

.selector__en {
  font-size: 17rpx;
  color: var(--mori-muted-light);
  font-weight: 500;
  letter-spacing: 1.5rpx;
}

.selector__selected {
  font-size: 21rpx;
  color: var(--mori-muted);
}

.selector__guide {
  font-size: 19rpx;
  color: var(--mori-accent);
}

.colors {
  margin-top: 20rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 14rpx;
}

.color-option {
  height: 62rpx;
  padding: 0 18rpx 0 12rpx;
  border-radius: 999rpx;
  border: 1rpx solid var(--mori-line);
  display: flex;
  align-items: center;
  gap: 10rpx;
  font-size: 21rpx;
  color: var(--mori-muted);
  background: rgba(255, 253, 248, 0.55);
}

.color-option--active {
  border-color: var(--mori-ink);
  color: var(--mori-ink);
  background: var(--mori-surface);
}

.color-option__swatch {
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  border: 1rpx solid rgba(29, 33, 28, 0.12);
}

.sizes {
  margin-top: 20rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 14rpx;
}

.size-option {
  position: relative;
  min-width: 94rpx;
  height: 68rpx;
  padding: 0 22rpx;
  border-radius: 14rpx;
  border: 1rpx solid var(--mori-line);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 23rpx;
  color: var(--mori-ink-soft);
  background: rgba(255, 253, 248, 0.55);
}

.size-option--active {
  border-color: var(--mori-forest);
  background: var(--mori-forest);
  color: #fffdf8;
}

.size-option--disabled {
  color: var(--mori-muted-light);
  background: rgba(29, 33, 28, 0.025);
}

.size-option__line {
  position: absolute;
  left: 18%;
  right: 18%;
  top: 50%;
  height: 1rpx;
  background: var(--mori-muted-light);
  transform: rotate(-24deg);
}

.stock-line {
  margin-top: 16rpx;
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 19rpx;
  color: var(--mori-muted);
}

.stock-line__dot {
  width: 8rpx;
  height: 8rpx;
  border-radius: 50%;
  background: var(--mori-sage);
}

.stock-line__dot--low {
  background: var(--mori-accent);
}

.stock-line__low {
  color: var(--mori-accent-deep);
}

.quantity-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.quantity-row__hint {
  margin-top: 7rpx;
  font-size: 17rpx;
  color: var(--mori-muted-light);
}

.stepper {
  height: 62rpx;
  border-radius: 999rpx;
  border: 1rpx solid var(--mori-line);
  display: flex;
  align-items: center;
  background: rgba(255, 253, 248, 0.55);
}

.stepper__button {
  width: 62rpx;
  height: 62rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stepper__button--disabled {
  opacity: 0.28;
}

.stepper__value {
  width: 52rpx;
  text-align: center;
  font-size: 23rpx;
  font-weight: 600;
}

.story {
  padding: 4rpx 2rpx 0;
}

.story__title {
  margin-top: 14rpx;
  font-family: var(--mori-serif);
  font-size: 38rpx;
}

.story__text {
  margin-top: 18rpx;
  font-size: 23rpx;
  line-height: 1.95;
  color: var(--mori-ink-soft);
}

.story__grid {
  margin-top: 28rpx;
  border-top: 1rpx solid var(--mori-line);
}

.story__cell {
  padding: 22rpx 0;
  display: flex;
  gap: 24rpx;
  border-bottom: 1rpx solid var(--mori-line);
}

.story__cell-label {
  width: 70rpx;
  flex: none;
  font-size: 20rpx;
  color: var(--mori-muted);
}

.story__cell-value {
  flex: 1;
  font-size: 21rpx;
  line-height: 1.7;
  color: var(--mori-ink-soft);
}

.shipping-card {
  margin-top: 34rpx;
  padding: 24rpx;
  border-radius: 22rpx;
  background: rgba(255, 253, 248, 0.68);
  border: 1rpx solid rgba(29, 33, 28, 0.06);
  display: flex;
  align-items: center;
  gap: 18rpx;
}

.shipping-card__icon {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: rgba(38, 60, 50, 0.07);
  display: flex;
  align-items: center;
  justify-content: center;
}

.shipping-card__copy {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 7rpx;
}

.shipping-card__title {
  font-size: 22rpx;
  font-weight: 500;
}

.shipping-card__text {
  font-size: 18rpx;
  color: var(--mori-muted);
}

.after-sale {
  margin-top: 34rpx;
  padding: 26rpx 10rpx 8rpx;
  display: flex;
  justify-content: space-around;
  border-top: 1rpx solid var(--mori-line);
}

.after-sale__item {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 19rpx;
  color: var(--mori-muted);
}

.detail-space {
  height: 170rpx;
}

.buy-bar {
  position: fixed;
  z-index: 70;
  left: 50%;
  bottom: 0;
  width: 100%;
  max-width: 540px;
  transform: translateX(-50%);
  padding: 18rpx 24rpx;
  padding-bottom: calc(18rpx + env(safe-area-inset-bottom));
  border-top: 1rpx solid var(--mori-line);
  background: rgba(255, 253, 248, 0.97);
  backdrop-filter: blur(18px);
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.buy-bar__utility {
  display: flex;
  gap: 10rpx;
}

.buy-bar__icon {
  width: 64rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;
  font-size: 16rpx;
  color: var(--mori-muted);
}

.buy-bar__actions {
  flex: 1;
  display: flex;
  gap: 12rpx;
}

.buy-button {
  flex: 1;
  height: 88rpx;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  font-weight: 600;
  letter-spacing: 1rpx;
  transition: transform 0.18s ease;
}

.buy-button:active {
  transform: scale(0.97);
}

.buy-button--outline {
  border: 1rpx solid var(--mori-ink);
  color: var(--mori-ink);
  background: transparent;
}

.buy-button--solid {
  background: var(--mori-accent);
  color: #fffdf8;
  box-shadow: 0 12rpx 30rpx rgba(183, 84, 56, 0.24);
}

.buy-button--pulse {
  animation: add-pulse 0.7s ease;
}

@keyframes add-pulse {
  0%,
  100% {
    transform: scale(1);
  }
  45% {
    transform: scale(0.94);
    background: var(--mori-forest);
    color: #fffdf8;
  }
}

.sheet-layer {
  position: fixed;
  z-index: 99;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(21, 24, 20, 0.55);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  animation: layer-in 0.25s ease both;
}

.sheet {
  width: 100%;
  max-width: 540px;
  padding: 16rpx 30rpx calc(28rpx + env(safe-area-inset-bottom));
  border-radius: 34rpx 34rpx 0 0;
  background: var(--mori-surface);
  animation: sheet-in 0.35s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.sheet__handle {
  width: 62rpx;
  height: 7rpx;
  margin: 0 auto 22rpx;
  border-radius: 999rpx;
  background: var(--mori-line-strong);
}

.sheet__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sheet__title {
  font-family: var(--mori-serif);
  font-size: 38rpx;
}

.sheet__close {
  width: 50rpx;
  height: 50rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sheet__product {
  margin-top: 24rpx;
  display: flex;
  gap: 20rpx;
}

.sheet__image {
  width: 150rpx;
  height: 176rpx;
  border-radius: 16rpx;
  flex: none;
}

.sheet__info {
  flex: 1;
  min-width: 0;
  padding: 6rpx 0;
  display: flex;
  flex-direction: column;
}

.sheet__name {
  font-size: 26rpx;
  line-height: 1.45;
  font-weight: 500;
}

.sheet__variant {
  margin-top: 10rpx;
  font-size: 20rpx;
  color: var(--mori-muted);
}

.sheet__price {
  margin-top: auto;
  font-family: var(--mori-serif);
  font-size: 38rpx;
  color: var(--mori-accent-deep);
}

.sheet__address {
  margin-top: 24rpx;
  padding: 20rpx;
  border-radius: 18rpx;
  background: var(--mori-bg);
  display: flex;
  align-items: flex-start;
  gap: 14rpx;
}

.sheet__address-copy {
  display: flex;
  flex-direction: column;
  gap: 7rpx;
  font-size: 21rpx;
}

.sheet__address-detail {
  font-size: 18rpx;
  color: var(--mori-muted);
}

.sheet__summary {
  margin-top: 20rpx;
  display: flex;
  justify-content: space-between;
  font-size: 22rpx;
  color: var(--mori-muted);
}

.sheet__summary + .sheet__summary {
  margin-top: 12rpx;
}

.sheet__total {
  margin-top: 22rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid var(--mori-line);
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  font-size: 24rpx;
  font-weight: 500;
}

.sheet__total-price {
  font-family: var(--mori-serif);
  font-size: 44rpx;
  color: var(--mori-accent-deep);
}

.sheet__submit {
  margin-top: 24rpx;
  width: 100%;
  height: 90rpx;
  border-radius: 999rpx;
  background: var(--mori-accent);
  color: #fffdf8;
  font-size: 26rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
}

.sheet__submit-note {
  padding: 5rpx 10rpx;
  border-radius: 999rpx;
  background: rgba(255, 253, 248, 0.18);
  font-size: 16rpx;
  font-weight: 400;
}

.sheet__hint {
  margin-top: 14rpx;
  display: block;
  font-size: 18rpx;
  text-align: center;
  color: var(--mori-muted-light);
}

@keyframes layer-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes sheet-in {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}
</style>