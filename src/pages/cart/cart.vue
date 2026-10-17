<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import MoriIcon from '@/components/MoriIcon.vue'
import TabBar from '@/components/TabBar.vue'
import { useShop } from '@/stores/shop'
import { money } from '@/utils/format'

const { state, cartTotal, selectedCount, allSelected, toggleItem, toggleAll, updateQuantity, removeItem, checkoutSelected } = useShop()

const editing = ref(false)

const cartQuantity = computed(() => state.cart.reduce((sum, item) => sum + item.quantity, 0))
const shippingHint = computed(() => {
  if (!cartTotal.value) return '满 599 元免运费'
  return cartTotal.value >= 599 ? '已满足免运费条件' : `再买 ¥${money(599 - cartTotal.value)} 即享免运费`
})

onShow(() => {
  editing.value = false
})

function goHome() {
  uni.redirectTo({ url: '/pages/index/index' })
}

function openProduct(productId: string) {
  uni.navigateTo({ url: `/pages/detail/detail?id=${productId}` })
}

function changeQuantity(key: string, delta: number, current: number) {
  updateQuantity(key, current + delta)
}

function confirmRemove(key: string) {
  uni.showModal({
    title: '移除商品',
    content: '确定从购物袋中移除这件商品吗？',
    confirmText: '移除',
    confirmColor: '#b75438',
    success: (result) => {
      if (result.confirm) removeItem(key)
    }
  })
}

function deleteSelected() {
  if (!selectedCount.value) {
    uni.showToast({ title: '请先选择商品', icon: 'none' })
    return
  }
  uni.showModal({
    title: '删除所选商品',
    content: `确定移除已选的 ${selectedCount.value} 件商品吗？`,
    confirmText: '删除',
    confirmColor: '#b75438',
    success: (result) => {
      if (!result.confirm) return
      const keys = state.cart.filter((item) => item.selected).map((item) => item.key)
      keys.forEach((key) => removeItem(key))
      if (!state.cart.length) editing.value = false
      uni.showToast({ title: '已移除', icon: 'none' })
    }
  })
}

function checkout() {
  if (!selectedCount.value) {
    uni.showToast({ title: '请选择要结算的商品', icon: 'none' })
    return
  }
  uni.showModal({
    title: '确认结算',
    content: `共 ${selectedCount.value} 件商品，合计 ¥${money(cartTotal.value)}。订单将以“未支付”状态创建，支付功能将在后端接入后开放。`,
    confirmText: '创建订单',
    confirmColor: '#b75438',
    success: async (result) => {
      if (!result.confirm) return
      try {
        const order = await checkoutSelected()
        if (!order) return
        uni.showToast({ title: '订单已创建', icon: 'none' })
        setTimeout(() => uni.redirectTo({ url: '/pages/profile/profile' }), 700)
      } catch (error) {
        uni.showToast({
          title: error instanceof Error ? error.message : '创建订单失败',
          icon: 'none'
        })
      }
    }
  })
}
</script>

<template>
  <view class="page-wrap cart-page">
    <view class="cart-top safe-top">
      <view class="cart-top__row">
        <view>
          <view class="eyebrow">YOUR SELECTION</view>
          <view class="cart-title">购物袋<text v-if="cartQuantity" class="cart-title__count">{{ cartQuantity }}</text></view>
        </view>
        <text v-if="state.cart.length" class="manage-button" @tap="editing = !editing">
          {{ editing ? '完成' : '管理' }}
        </text>
      </view>
    </view>

    <view v-if="state.cart.length" class="cart-content">
      <view class="shipping-banner">
        <view class="shipping-banner__icon">
          <MoriIcon name="truck" tone="forest" :size="35" />
        </view>
        <view class="shipping-banner__copy">
          <text class="shipping-banner__title">{{ shippingHint }}</text>
          <text class="shipping-banner__text">预计 48 小时内发出 · 支持 7 天无理由退换</text>
        </view>
        <view class="shipping-banner__leaf">
          <MoriIcon name="leaf" tone="sage" :size="28" />
        </view>
      </view>

      <view class="cart-list">
        <view v-for="item in state.cart" :key="item.key" class="cart-item">
          <view class="check" :class="{ 'check--active': item.selected }" @tap="toggleItem(item.key)">
            <MoriIcon v-if="item.selected" name="check" tone="white" :size="24" />
          </view>

          <image class="cart-item__image" :src="item.image" mode="aspectFill" @tap="openProduct(item.productId)" />

          <view class="cart-item__info">
            <view class="cart-item__top">
              <view class="cart-item__name" @tap="openProduct(item.productId)">{{ item.name }}</view>
              <view v-if="editing" class="cart-item__trash" @tap="confirmRemove(item.key)">
                <MoriIcon name="trash" tone="muted" :size="29" />
              </view>
            </view>
            <view class="cart-item__english">{{ item.englishName }}</view>
            <view class="cart-item__variant">
              <view class="variant-dot" :style="{ backgroundColor: item.colorValue }" />
              <text>{{ item.color }} / {{ item.size }}</text>
            </view>

            <view class="cart-item__bottom">
              <view class="cart-item__price">
                <text class="cart-item__currency">¥</text>
                <text class="cart-item__number">{{ money(item.price) }}</text>
              </view>
              <view class="mini-stepper">
                <view class="mini-stepper__button" @tap="changeQuantity(item.key, -1, item.quantity)">
                  <MoriIcon name="minus" :tone="item.quantity <= 1 ? 'muted' : 'ink'" :size="21" />
                </view>
                <text class="mini-stepper__value">{{ item.quantity }}</text>
                <view class="mini-stepper__button" @tap="changeQuantity(item.key, 1, item.quantity)">
                  <MoriIcon name="plus" :size="21" />
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="cart-service">
        <view class="cart-service__item">
          <MoriIcon name="shield" tone="muted" :size="28" />
          <text>正品保障</text>
        </view>
        <view class="cart-service__item">
          <MoriIcon name="service" tone="muted" :size="28" />
          <text>在线客服</text>
        </view>
        <view class="cart-service__item">
          <MoriIcon name="truck" tone="muted" :size="28" />
          <text>48h 发货</text>
        </view>
      </view>
    </view>

    <view v-else class="empty-cart">
      <view class="empty-cart__graphic">
        <view class="empty-cart__ring" />
        <MoriIcon name="bag" tone="muted" :size="92" />
      </view>
      <view class="empty-cart__title">购物袋还是空的</view>
      <view class="empty-cart__text">去挑选一些能长久陪伴你的物件吧。</view>
      <button class="empty-cart__button" @tap="goHome">去逛逛</button>
    </view>

    <view class="cart-bottom-space" />

    <view v-if="state.cart.length" class="cart-bar">
      <view class="cart-bar__select" @tap="toggleAll">
        <view class="check" :class="{ 'check--active': allSelected }">
          <MoriIcon v-if="allSelected" name="check" tone="white" :size="24" />
        </view>
        <text>全选</text>
      </view>

      <view v-if="!editing" class="cart-bar__summary">
        <view class="cart-bar__total">
          <text class="cart-bar__label">合计</text>
          <text class="cart-bar__currency">¥</text>
          <text class="cart-bar__price">{{ money(cartTotal) }}</text>
        </view>
        <button class="cart-bar__checkout" :class="{ 'cart-bar__checkout--disabled': !selectedCount }" @tap="checkout">
          去结算<text v-if="selectedCount"> · {{ selectedCount }}</text>
        </button>
      </view>

      <button v-else class="cart-bar__delete" @tap="deleteSelected">删除所选</button>
    </view>

    <TabBar active="cart" />
  </view>
</template>

<style scoped lang="scss">
.cart-page {
  min-height: 100vh;
}

.cart-top {
  padding-left: 34rpx;
  padding-right: 34rpx;
  padding-bottom: 18rpx;
}

.cart-top__row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
}

.cart-title {
  margin-top: 8rpx;
  font-family: var(--mori-serif);
  font-size: 58rpx;
  line-height: 1.05;
  font-weight: 500;
}

.cart-title__count {
  margin-left: 12rpx;
  font-family: var(--mori-serif);
  font-size: 28rpx;
  color: var(--mori-accent);
  vertical-align: top;
}

.manage-button {
  padding: 16rpx 0;
  font-size: 23rpx;
  color: var(--mori-muted);
  letter-spacing: 1rpx;
}

.cart-content {
  padding: 12rpx 28rpx 0;
}

.shipping-banner {
  padding: 22rpx 22rpx;
  border-radius: 22rpx;
  background: var(--mori-forest);
  color: #fffdf8;
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.shipping-banner__icon {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background: rgba(255, 253, 248, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.shipping-banner__copy {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5rpx;
}

.shipping-banner__title {
  font-size: 22rpx;
  font-weight: 500;
}

.shipping-banner__text {
  font-size: 18rpx;
  color: rgba(255, 253, 248, 0.62);
}

.shipping-banner__leaf {
  opacity: 0.72;
}

.cart-list {
  margin-top: 24rpx;
  border-radius: 24rpx;
  overflow: hidden;
  background: rgba(255, 253, 248, 0.66);
  border: 1rpx solid rgba(29, 33, 28, 0.06);
}

.cart-item {
  position: relative;
  padding: 26rpx 22rpx;
  display: flex;
  gap: 18rpx;
  border-bottom: 1rpx solid var(--mori-line);
}

.cart-item:last-child {
  border-bottom: 0;
}

.check {
  flex: none;
  width: 37rpx;
  height: 37rpx;
  border-radius: 50%;
  border: 1rpx solid var(--mori-line-strong);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.cart-item > .check {
  margin-top: 72rpx;
}

.check--active {
  background: var(--mori-forest);
  border-color: var(--mori-forest);
}

.cart-item__image {
  width: 160rpx;
  height: 214rpx;
  border-radius: 16rpx;
  flex: none;
  background: var(--mori-surface-alt);
}

.cart-item__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.cart-item__top {
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
}

.cart-item__name {
  flex: 1;
  font-size: 25rpx;
  line-height: 1.45;
  font-weight: 500;
}

.cart-item__trash {
  width: 50rpx;
  height: 50rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cart-item__english {
  margin-top: 5rpx;
  font-size: 16rpx;
  letter-spacing: 1.1rpx;
  color: var(--mori-muted-light);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.cart-item__variant {
  margin-top: 12rpx;
  height: 40rpx;
  padding: 0 12rpx;
  border-radius: 8rpx;
  align-self: flex-start;
  background: var(--mori-bg);
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 18rpx;
  color: var(--mori-muted);
}

.variant-dot {
  width: 17rpx;
  height: 17rpx;
  border-radius: 50%;
  border: 1rpx solid rgba(29, 33, 28, 0.12);
}

.cart-item__bottom {
  margin-top: auto;
  padding-top: 16rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.cart-item__price {
  color: var(--mori-accent-deep);
}

.cart-item__currency {
  font-family: var(--mori-serif);
  font-size: 21rpx;
}

.cart-item__number {
  font-family: var(--mori-serif);
  font-size: 32rpx;
  font-weight: 600;
}

.mini-stepper {
  height: 50rpx;
  border-radius: 999rpx;
  border: 1rpx solid var(--mori-line);
  display: flex;
  align-items: center;
  background: rgba(255, 253, 248, 0.7);
}

.mini-stepper__button {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mini-stepper__value {
  min-width: 34rpx;
  text-align: center;
  font-size: 20rpx;
}

.cart-service {
  margin-top: 26rpx;
  padding: 22rpx 20rpx;
  display: flex;
  justify-content: space-around;
  border-top: 1rpx solid var(--mori-line);
}

.cart-service__item {
  display: flex;
  align-items: center;
  gap: 7rpx;
  font-size: 18rpx;
  color: var(--mori-muted);
}

.empty-cart {
  min-height: 65vh;
  padding: 70rpx 50rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.empty-cart__graphic {
  position: relative;
  width: 230rpx;
  height: 230rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-cart__ring {
  position: absolute;
  top: 10rpx;
  left: 10rpx;
  right: 10rpx;
  bottom: 10rpx;
  border-radius: 50%;
  background: var(--mori-surface-alt);
}

.empty-cart__title {
  position: relative;
  margin-top: 26rpx;
  font-family: var(--mori-serif);
  font-size: 42rpx;
}

.empty-cart__text {
  position: relative;
  margin-top: 14rpx;
  font-size: 22rpx;
  color: var(--mori-muted);
}

.empty-cart__button {
  margin-top: 34rpx;
  height: 82rpx;
  padding: 0 54rpx;
  border-radius: 999rpx;
  background: var(--mori-forest);
  color: #fffdf8;
  font-size: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cart-bottom-space {
  height: 300rpx;
}

.cart-bar {
  position: fixed;
  z-index: 75;
  left: 50%;
  bottom: calc(122rpx + env(safe-area-inset-bottom));
  width: 100%;
  max-width: 540px;
  transform: translateX(-50%);
  height: 104rpx;
  padding: 0 26rpx;
  border-top: 1rpx solid var(--mori-line);
  background: rgba(255, 253, 248, 0.97);
  backdrop-filter: blur(18px);
  display: flex;
  align-items: center;
  gap: 18rpx;
}

.cart-bar__select {
  display: flex;
  align-items: center;
  gap: 10rpx;
  font-size: 21rpx;
  color: var(--mori-muted);
}

.cart-bar__summary {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 20rpx;
}

.cart-bar__total {
  display: flex;
  align-items: baseline;
  color: var(--mori-accent-deep);
}

.cart-bar__label {
  margin-right: 7rpx;
  font-size: 19rpx;
  color: var(--mori-muted);
}

.cart-bar__currency {
  font-family: var(--mori-serif);
  font-size: 21rpx;
}

.cart-bar__price {
  font-family: var(--mori-serif);
  font-size: 39rpx;
  font-weight: 600;
}

.cart-bar__checkout {
  height: 76rpx;
  padding: 0 30rpx;
  border-radius: 999rpx;
  background: var(--mori-accent);
  color: #fffdf8;
  font-size: 23rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cart-bar__checkout--disabled {
  opacity: 0.45;
}

.cart-bar__delete {
  flex: 1;
  height: 76rpx;
  border-radius: 999rpx;
  border: 1rpx solid var(--mori-accent);
  color: var(--mori-accent);
  font-size: 23rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>