<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import MoriIcon from '@/components/MoriIcon.vue'
import TabBar from '@/components/TabBar.vue'
import { useShop } from '@/stores/shop'
import type { Address } from '@/types/shop'
import { money } from '@/utils/format'

const { state, updateAddress, syncOrders } = useShop()

const addressSheetOpen = ref(false)
const form = reactive<Address>({ ...state.address })

const favoritesCount = computed(() => state.favorites.length)
const pendingOrders = computed(() => state.orders.filter((order) => order.status === 'pending_payment').length)
const activeOrders = computed(
  () => state.orders.filter((order) => order.status === 'processing' || order.status === 'shipped').length
)
const points = 1280
const nextLevelPoints = 2000
const progress = Math.min(100, Math.round((points / nextLevelPoints) * 100))

const dateParts = (() => {
  const now = new Date()
  return {
    month: String(now.getMonth() + 1).padStart(2, '0'),
    day: String(now.getDate()).padStart(2, '0')
  }
})()

const statusEntries = [
  { key: 'pending', label: '待付款', icon: 'order', count: 0 },
  { key: 'packing', label: '待发货', icon: 'bag', count: 0 },
  { key: 'shipping', label: '待收货', icon: 'truck', count: 0 },
  { key: 'done', label: '已完成', icon: 'check', count: 0 }
]

onShow(async () => {
  Object.assign(form, state.address)
  try {
    await syncOrders()
  } catch {
    // Local demo orders remain available when cloud functions are not connected.
  }
})

function openAddress() {
  Object.assign(form, state.address)
  addressSheetOpen.value = true
}

function closeAddress() {
  addressSheetOpen.value = false
}

function saveAddress() {
  if (!form.name.trim() || !form.phone.trim() || !form.region.trim() || !form.detail.trim()) {
    uni.showToast({ title: '请完整填写地址信息', icon: 'none' })
    return
  }
  updateAddress({ ...form })
  addressSheetOpen.value = false
  uni.showToast({ title: '地址已更新', icon: 'none' })
}

function placeholderAction(label: string) {
  uni.showToast({ title: `${label}将在后续接入`, icon: 'none' })
}

function showFavorites() {
  uni.showToast({ title: `已收藏 ${favoritesCount.value} 件商品`, icon: 'none' })
}

function openOrder(orderId: string) {
  uni.showToast({ title: `订单 ${orderId} 详情待后端接入`, icon: 'none' })
}
</script>

<template>
  <view class="page-wrap profile-page">
    <view class="profile-hero">
      <view class="profile-hero__orb profile-hero__orb--one" />
      <view class="profile-hero__orb profile-hero__orb--two" />

      <view class="profile-top safe-top">
        <view class="profile-brand">
          <text class="profile-brand__mark">MORI</text>
          <text class="profile-brand__sub">MEMBERSHIP</text>
        </view>
        <view class="profile-top__actions">
          <view class="profile-top__icon" @tap="placeholderAction('消息中心')">
            <MoriIcon name="message" tone="white" :size="35" />
          </view>
          <view class="profile-top__icon" @tap="placeholderAction('设置')">
            <MoriIcon name="settings" tone="white" :size="35" />
          </view>
        </view>
      </view>

      <view class="profile-user">
        <view class="avatar-wrap">
          <image class="avatar" src="/static/products/look-03.jpg" mode="aspectFill" />
          <view class="avatar__badge">
            <MoriIcon name="leaf" tone="white" :size="18" />
          </view>
        </view>
        <view class="profile-user__copy">
          <view class="profile-user__hello">GOOD DAY,</view>
          <view class="profile-user__name">林小满</view>
          <view class="profile-user__level">
            <text>MORI CLUB</text>
            <view class="profile-user__level-dot" />
            <text>银卡会员</text>
          </view>
        </view>
        <view class="profile-date">
          <text class="profile-date__number">{{ dateParts.day }}</text>
          <text class="profile-date__month">{{ dateParts.month }} / 2026</text>
        </view>
      </view>

      <view class="member-card">
        <view class="member-card__head">
          <view>
            <view class="member-card__label">MEMBER POINTS</view>
            <view class="member-card__points">{{ points }}<text>积分</text></view>
          </view>
          <view class="member-card__stamp">
            <MoriIcon name="star" tone="white" :size="22" />
            <text>SILVER</text>
          </view>
        </view>
        <view class="member-card__progress">
          <view class="member-card__progress-fill" :style="{ width: `${progress}%` }" />
        </view>
        <view class="member-card__foot">
          <text>距金卡会员还差 {{ nextLevelPoints - points }} 积分</text>
          <text>查看权益 →</text>
        </view>
      </view>
    </view>

    <view class="profile-body">
      <view class="stats-card">
        <view class="stat-item" @tap="showFavorites">
          <text class="stat-item__value">{{ favoritesCount }}</text>
          <text class="stat-item__label">收藏</text>
        </view>
        <view class="stat-divider" />
        <view class="stat-item" @tap="placeholderAction('优惠券')">
          <text class="stat-item__value">3</text>
          <text class="stat-item__label">优惠券</text>
        </view>
        <view class="stat-divider" />
        <view class="stat-item" @tap="placeholderAction('积分明细')">
          <text class="stat-item__value">{{ points }}</text>
          <text class="stat-item__label">积分</text>
        </view>
        <view class="stat-divider" />
        <view class="stat-item" @tap="placeholderAction('浏览足迹')">
          <text class="stat-item__value">18</text>
          <text class="stat-item__label">足迹</text>
        </view>
      </view>

      <view class="orders-card">
        <view class="block-head">
          <view>
            <view class="eyebrow">MY ORDERS</view>
            <view class="block-title">我的订单</view>
          </view>
          <view class="block-link" @tap="placeholderAction('全部订单')">
            <text>全部订单</text>
            <MoriIcon name="arrow-right" tone="muted" :size="24" />
          </view>
        </view>

        <view class="order-statuses">
          <view
            v-for="entry in statusEntries"
            :key="entry.key"
            class="order-status"
            @tap="placeholderAction(entry.label)"
          >
            <view class="order-status__icon">
              <MoriIcon :name="entry.icon" tone="forest" :size="38" />
              <view v-if="entry.key === 'pending' && pendingOrders" class="order-status__badge">{{ pendingOrders }}</view>
              <view v-if="entry.key === 'shipping' && activeOrders" class="order-status__badge">{{ activeOrders }}</view>
            </view>
            <text>{{ entry.label }}</text>
          </view>
        </view>

        <view v-if="state.orders.length" class="recent-orders">
          <view v-for="order in state.orders.slice(0, 2)" :key="order.id" class="recent-order" @tap="openOrder(order.id)">
            <view class="recent-order__head">
              <text class="recent-order__id">NO. {{ order.id }}</text>
              <text class="recent-order__status">{{ order.statusText }}</text>
            </view>
            <view class="recent-order__body">
              <view class="recent-order__images">
                <image
                  v-for="item in order.items.slice(0, 3)"
                  :key="`${order.id}-${item.productId}`"
                  class="recent-order__image"
                  :src="item.image"
                  mode="aspectFill"
                />
              </view>
              <view class="recent-order__meta">
                <text>{{ order.items.reduce((sum, item) => sum + item.quantity, 0) }} 件商品</text>
                <text class="recent-order__total">¥{{ money(order.total) }}</text>
              </view>
            </view>
          </view>
        </view>
        <view v-else class="no-orders">还没有订单，去首页发现本季精选吧。</view>
      </view>

      <view class="address-card" @tap="openAddress">
        <view class="address-card__icon">
          <MoriIcon name="location" tone="forest" :size="39" />
        </view>
        <view class="address-card__copy">
          <view class="address-card__label">
            <text>收货地址</text>
            <text v-if="state.address.isDefault" class="address-card__default">默认</text>
          </view>
          <view class="address-card__line">
            {{ state.address.name }} · {{ state.address.phone }}
          </view>
          <view class="address-card__detail">{{ state.address.region }}{{ state.address.detail }}</view>
        </view>
        <view class="address-card__action">
          <text>管理</text>
          <MoriIcon name="arrow-right" tone="muted" :size="25" />
        </view>
      </view>

      <view class="menu-card">
        <view class="menu-item" @tap="placeholderAction('我的收藏')">
          <view class="menu-item__icon"><MoriIcon name="heart" tone="accent" :size="32" /></view>
          <text class="menu-item__label">我的收藏</text>
          <text class="menu-item__value">{{ favoritesCount }} 件</text>
          <MoriIcon name="arrow-right" tone="muted" :size="24" />
        </view>
        <view class="menu-item" @tap="placeholderAction('优惠券与礼卡')">
          <view class="menu-item__icon"><MoriIcon name="coupon" tone="gold" :size="32" /></view>
          <text class="menu-item__label">优惠券与礼卡</text>
          <text class="menu-item__value">3 张可用</text>
          <MoriIcon name="arrow-right" tone="muted" :size="24" />
        </view>
        <view class="menu-item" @tap="placeholderAction('会员权益')">
          <view class="menu-item__icon"><MoriIcon name="leaf" tone="sage" :size="32" /></view>
          <text class="menu-item__label">会员权益</text>
          <text class="menu-item__value">银卡</text>
          <MoriIcon name="arrow-right" tone="muted" :size="24" />
        </view>
        <view class="menu-item" @tap="placeholderAction('售后服务')">
          <view class="menu-item__icon"><MoriIcon name="shield" tone="forest" :size="32" /></view>
          <text class="menu-item__label">售后服务</text>
          <text class="menu-item__value">7 天无理由</text>
          <MoriIcon name="arrow-right" tone="muted" :size="24" />
        </view>
        <view class="menu-item" @tap="placeholderAction('客服中心')">
          <view class="menu-item__icon"><MoriIcon name="service" tone="muted" :size="32" /></view>
          <text class="menu-item__label">客服中心</text>
          <text class="menu-item__value">09:00-22:00</text>
          <MoriIcon name="arrow-right" tone="muted" :size="24" />
        </view>
        <view class="menu-item" @tap="placeholderAction('设置')">
          <view class="menu-item__icon"><MoriIcon name="settings" tone="muted" :size="32" /></view>
          <text class="menu-item__label">设置</text>
          <text class="menu-item__value">隐私与通知</text>
          <MoriIcon name="arrow-right" tone="muted" :size="24" />
        </view>
      </view>

      <view class="profile-note">
        <MoriIcon name="leaf" tone="sage" :size="28" />
        <text>MORI 木里 · 与自然一起生活</text>
      </view>
    </view>

    <view class="profile-bottom-space" />
    <TabBar active="profile" />

    <view v-if="addressSheetOpen" class="sheet-layer" @tap="closeAddress">
      <view class="sheet" @tap.stop>
        <view class="sheet__handle" />
        <view class="sheet__head">
          <view>
            <view class="eyebrow">SHIPPING ADDRESS</view>
            <view class="sheet__title">收货地址</view>
          </view>
          <view class="sheet__close" @tap="closeAddress">
            <MoriIcon name="close" tone="muted" :size="31" />
          </view>
        </view>

        <view class="form-row">
          <text class="form-label">收货人</text>
          <input v-model="form.name" class="form-input" placeholder="请输入姓名" />
        </view>
        <view class="form-row">
          <text class="form-label">手机号码</text>
          <input v-model="form.phone" class="form-input" placeholder="请输入手机号码" />
        </view>
        <view class="form-row">
          <text class="form-label">所在地区</text>
          <input v-model="form.region" class="form-input" placeholder="省 / 市 / 区" />
        </view>
        <view class="form-row form-row--textarea">
          <text class="form-label">详细地址</text>
          <textarea v-model="form.detail" class="form-textarea" auto-height placeholder="街道、门牌号等" />
        </view>

        <view class="default-row" @tap="form.isDefault = !form.isDefault">
          <view class="check" :class="{ 'check--active': form.isDefault }">
            <MoriIcon v-if="form.isDefault" name="check" tone="white" :size="23" />
          </view>
          <text>设为默认收货地址</text>
        </view>

        <button class="sheet__save" @tap="saveAddress">保存地址</button>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.profile-page {
  min-height: 100vh;
}

.profile-hero {
  position: relative;
  overflow: hidden;
  padding: 0 28rpx 42rpx;
  background: var(--mori-forest);
  color: #fffdf8;
  border-radius: 0 0 46rpx 46rpx;
}

.profile-hero__orb {
  position: absolute;
  border-radius: 50%;
  border: 1rpx solid rgba(255, 253, 248, 0.08);
}

.profile-hero__orb--one {
  width: 520rpx;
  height: 520rpx;
  right: -260rpx;
  top: 10rpx;
}

.profile-hero__orb--two {
  width: 760rpx;
  height: 760rpx;
  right: -380rpx;
  top: -140rpx;
}

.profile-top {
  position: relative;
  z-index: 2;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.profile-brand {
  display: flex;
  align-items: baseline;
  gap: 12rpx;
}

.profile-brand__mark {
  font-family: var(--mori-serif);
  font-size: 33rpx;
  letter-spacing: 5rpx;
}

.profile-brand__sub {
  font-size: 16rpx;
  letter-spacing: 2rpx;
  color: rgba(255, 253, 248, 0.45);
}

.profile-top__actions {
  display: flex;
  gap: 10rpx;
}

.profile-top__icon {
  width: 58rpx;
  height: 58rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.9;
}

.profile-user {
  position: relative;
  z-index: 2;
  margin-top: 22rpx;
  display: flex;
  align-items: center;
  gap: 22rpx;
}

.avatar-wrap {
  position: relative;
  width: 112rpx;
  height: 112rpx;
  flex: none;
}

.avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 3rpx solid rgba(255, 253, 248, 0.42);
}

.avatar__badge {
  position: absolute;
  right: -2rpx;
  bottom: 0;
  width: 34rpx;
  height: 34rpx;
  border-radius: 50%;
  background: var(--mori-accent);
  border: 3rpx solid var(--mori-forest);
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-user__copy {
  flex: 1;
}

.profile-user__hello {
  font-size: 17rpx;
  letter-spacing: 2.5rpx;
  color: rgba(255, 253, 248, 0.5);
}

.profile-user__name {
  margin-top: 5rpx;
  font-family: var(--mori-serif);
  font-size: 44rpx;
  line-height: 1.1;
}

.profile-user__level {
  margin-top: 9rpx;
  display: flex;
  align-items: center;
  gap: 9rpx;
  font-size: 17rpx;
  letter-spacing: 1.5rpx;
  color: rgba(255, 253, 248, 0.58);
}

.profile-user__level-dot {
  width: 3rpx;
  height: 3rpx;
  border-radius: 50%;
  background: rgba(255, 253, 248, 0.45);
}

.profile-date {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.profile-date__number {
  font-family: var(--mori-serif);
  font-size: 64rpx;
  line-height: 1;
  font-weight: 300;
  color: rgba(255, 253, 248, 0.88);
}

.profile-date__month {
  margin-top: 4rpx;
  font-size: 16rpx;
  letter-spacing: 1.5rpx;
  color: rgba(255, 253, 248, 0.45);
}

.member-card {
  position: relative;
  z-index: 2;
  margin-top: 34rpx;
  padding: 24rpx 24rpx 20rpx;
  border-radius: 22rpx;
  background: rgba(255, 253, 248, 0.09);
  border: 1rpx solid rgba(255, 253, 248, 0.13);
  backdrop-filter: blur(10px);
}

.member-card__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.member-card__label {
  font-size: 16rpx;
  letter-spacing: 2rpx;
  color: rgba(255, 253, 248, 0.46);
}

.member-card__points {
  margin-top: 6rpx;
  font-family: var(--mori-serif);
  font-size: 48rpx;
  line-height: 1;
}

.member-card__points text {
  margin-left: 7rpx;
  font-family: var(--mori-sans);
  font-size: 18rpx;
  color: rgba(255, 253, 248, 0.5);
}

.member-card__stamp {
  height: 40rpx;
  padding: 0 12rpx;
  border-radius: 999rpx;
  border: 1rpx solid rgba(255, 253, 248, 0.25);
  display: flex;
  align-items: center;
  gap: 5rpx;
  font-size: 16rpx;
  letter-spacing: 1.5rpx;
  color: rgba(255, 253, 248, 0.72);
}

.member-card__progress {
  height: 5rpx;
  margin-top: 20rpx;
  border-radius: 999rpx;
  background: rgba(255, 253, 248, 0.14);
  overflow: hidden;
}

.member-card__progress-fill {
  height: 100%;
  border-radius: 999rpx;
  background: linear-gradient(90deg, #c8a777, #efe1c6);
}

.member-card__foot {
  margin-top: 12rpx;
  display: flex;
  justify-content: space-between;
  font-size: 17rpx;
  color: rgba(255, 253, 248, 0.48);
}

.profile-body {
  padding: 0 28rpx;
}

.stats-card {
  position: relative;
  z-index: 3;
  margin-top: -20rpx;
  height: 116rpx;
  border-radius: 24rpx;
  background: var(--mori-surface);
  box-shadow: 0 18rpx 40rpx rgba(43, 36, 28, 0.08);
  display: flex;
  align-items: center;
  padding: 0 10rpx;
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5rpx;
}

.stat-item__value {
  font-family: var(--mori-serif);
  font-size: 36rpx;
  line-height: 1;
  font-weight: 500;
}

.stat-item__label {
  font-size: 18rpx;
  color: var(--mori-muted);
}

.stat-divider {
  width: 1rpx;
  height: 38rpx;
  background: var(--mori-line);
}

.orders-card {
  margin-top: 24rpx;
  padding: 26rpx 22rpx 22rpx;
  border-radius: 24rpx;
  background: rgba(255, 253, 248, 0.68);
  border: 1rpx solid rgba(29, 33, 28, 0.06);
}

.block-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
}

.block-title {
  margin-top: 5rpx;
  font-family: var(--mori-serif);
  font-size: 37rpx;
}

.block-link {
  padding-bottom: 4rpx;
  display: flex;
  align-items: center;
  gap: 3rpx;
  font-size: 18rpx;
  color: var(--mori-muted);
}

.order-statuses {
  margin-top: 24rpx;
  display: flex;
  justify-content: space-between;
}

.order-status {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 9rpx;
  font-size: 18rpx;
  color: var(--mori-ink-soft);
}

.order-status__icon {
  position: relative;
  width: 62rpx;
  height: 62rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.order-status__badge {
  position: absolute;
  top: -5rpx;
  right: -9rpx;
  min-width: 26rpx;
  height: 26rpx;
  padding: 0 5rpx;
  border-radius: 999rpx;
  background: var(--mori-accent);
  color: #fffdf8;
  font-size: 14rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.recent-orders {
  margin-top: 24rpx;
  border-top: 1rpx solid var(--mori-line);
}

.recent-order {
  padding-top: 20rpx;
}

.recent-order + .recent-order {
  margin-top: 18rpx;
  border-top: 1rpx solid var(--mori-line);
}

.recent-order__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.recent-order__id {
  font-size: 18rpx;
  letter-spacing: 1rpx;
  color: var(--mori-muted-light);
}

.recent-order__status {
  font-size: 19rpx;
  color: var(--mori-accent-deep);
}

.recent-order__body {
  margin-top: 13rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14rpx;
}

.recent-order__images {
  display: flex;
  gap: 8rpx;
}

.recent-order__image {
  width: 76rpx;
  height: 102rpx;
  border-radius: 9rpx;
  background: var(--mori-surface-alt);
}

.recent-order__meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4rpx;
  font-size: 18rpx;
  color: var(--mori-muted);
}

.recent-order__total {
  font-family: var(--mori-serif);
  font-size: 29rpx;
  color: var(--mori-ink);
}

.no-orders {
  margin-top: 22rpx;
  padding: 22rpx 0 6rpx;
  border-top: 1rpx solid var(--mori-line);
  font-size: 19rpx;
  color: var(--mori-muted);
  text-align: center;
}

.address-card {
  margin-top: 24rpx;
  padding: 24rpx 22rpx;
  border-radius: 24rpx;
  background: rgba(255, 253, 248, 0.68);
  border: 1rpx solid rgba(29, 33, 28, 0.06);
  display: flex;
  align-items: center;
  gap: 17rpx;
}

.address-card__icon {
  width: 66rpx;
  height: 66rpx;
  border-radius: 50%;
  background: rgba(38, 60, 50, 0.07);
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
}

.address-card__copy {
  flex: 1;
  min-width: 0;
}

.address-card__label {
  display: flex;
  align-items: center;
  gap: 9rpx;
  font-size: 20rpx;
  color: var(--mori-muted);
}

.address-card__default {
  padding: 3rpx 8rpx;
  border-radius: 5rpx;
  background: rgba(183, 84, 56, 0.09);
  color: var(--mori-accent-deep);
  font-size: 16rpx;
}

.address-card__line {
  margin-top: 7rpx;
  font-size: 22rpx;
  font-weight: 500;
}

.address-card__detail {
  margin-top: 5rpx;
  font-size: 18rpx;
  color: var(--mori-muted);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.address-card__action {
  display: flex;
  align-items: center;
  gap: 3rpx;
  font-size: 18rpx;
  color: var(--mori-muted);
}

.menu-card {
  margin-top: 24rpx;
  padding: 4rpx 22rpx;
  border-radius: 24rpx;
  background: rgba(255, 253, 248, 0.68);
  border: 1rpx solid rgba(29, 33, 28, 0.06);
}

.menu-item {
  height: 98rpx;
  display: flex;
  align-items: center;
  gap: 15rpx;
  border-bottom: 1rpx solid var(--mori-line);
}

.menu-item:last-child {
  border-bottom: 0;
}

.menu-item__icon {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-item__label {
  flex: 1;
  font-size: 23rpx;
}

.menu-item__value {
  font-size: 19rpx;
  color: var(--mori-muted);
}

.profile-note {
  padding: 34rpx 0 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  font-size: 18rpx;
  letter-spacing: 1rpx;
  color: var(--mori-muted-light);
}

.profile-bottom-space {
  height: 170rpx;
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
  align-items: flex-start;
  justify-content: space-between;
}

.sheet__title {
  margin-top: 5rpx;
  font-family: var(--mori-serif);
  font-size: 39rpx;
}

.sheet__close {
  width: 50rpx;
  height: 50rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-row {
  margin-top: 21rpx;
  padding: 0 20rpx;
  min-height: 82rpx;
  border-radius: 15rpx;
  border: 1rpx solid var(--mori-line);
  background: var(--mori-bg);
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.form-row--textarea {
  align-items: flex-start;
  padding-top: 20rpx;
  padding-bottom: 20rpx;
}

.form-label {
  width: 112rpx;
  flex: none;
  font-size: 20rpx;
  color: var(--mori-muted);
}

.form-input {
  flex: 1;
  height: 80rpx;
  font-size: 23rpx;
}

.form-textarea {
  flex: 1;
  min-height: 90rpx;
  font-size: 23rpx;
  line-height: 1.6;
}

.default-row {
  margin-top: 24rpx;
  display: flex;
  align-items: center;
  gap: 11rpx;
  font-size: 21rpx;
  color: var(--mori-muted);
}

.check {
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  border: 1rpx solid var(--mori-line-strong);
  display: flex;
  align-items: center;
  justify-content: center;
}

.check--active {
  background: var(--mori-forest);
  border-color: var(--mori-forest);
}

.sheet__save {
  margin-top: 28rpx;
  width: 100%;
  height: 88rpx;
  border-radius: 999rpx;
  background: var(--mori-accent);
  color: #fffdf8;
  font-size: 25rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
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