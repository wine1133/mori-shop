<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { onLoad, onReady, onShow } from '@dcloudio/uni-app'
import MoriIcon from '@/components/MoriIcon.vue'
import ProductCard from '@/components/ProductCard.vue'
import TabBar from '@/components/TabBar.vue'
import { categories, products } from '@/data/products'
import { fetchProductList } from '@/api/shop'
import type { Product } from '@/types/shop'
import { useShop } from '@/stores/shop'

const { state, cartCount } = useShop()

const catalog = ref<Product[]>(products)
const heroSlides = [
  {
    type: 'video',
    season: 'MORI FILM · A/W 2026',
    title: ['流动的秋日', '藏在每一帧光影里'],
    subtitle: '一段关于材质、光线与日常的影像',
    cta: '探索本季',
    image: '/static/videos/mori-brand-poster.jpg'
  },
  {
    type: 'image',
    season: 'AUTUMN EDIT · 2026',
    title: ['把秋日的', '松弛穿在身上'],
    subtitle: '自然材质 · 克制剪裁 · 长久陪伴',
    cta: '探索本季',
    image: '/static/products/hero-autumn-portrait.jpg'
  },
  {
    type: 'image',
    season: 'MORI NOTES · VOL. 04',
    title: ['慢一点，', '让衣服与你相处得更久'],
    subtitle: '在耐看的廓形里，找到自己的节奏',
    cta: '阅读手记',
    image: '/static/products/look-07.jpg'
  }
]
const activeHero = ref(0)
const videoMuted = ref(true)
let heroVideoContext: any = null

const activeCategory = ref('全部')
const searchOpen = ref(false)
const keyword = ref('')
const refreshing = ref(false)

const filteredProducts = computed(() => {
  const query = keyword.value.trim().toLowerCase()
  return catalog.value.filter((product) => {
    const categoryMatch = activeCategory.value === '全部' || product.category === activeCategory.value
    const searchMatch =
      !query ||
      product.name.toLowerCase().includes(query) ||
      product.englishName.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query)
    return categoryMatch && searchMatch
  })
})

const leftProducts = computed(() => filteredProducts.value.filter((_, index) => index % 2 === 0))
const rightProducts = computed(() => filteredProducts.value.filter((_, index) => index % 2 === 1))
const cartBadge = computed(() => (cartCount.value > 99 ? '99+' : String(cartCount.value)))
const resultCaption = computed(() => {
  if (keyword.value.trim()) return `“${keyword.value.trim()}” 的搜索结果`
  if (activeCategory.value === '全部') return `本季精选 ${catalog.value.length} 件`
  return `${activeCategory.value}系列`
})

onLoad(async () => {
  const remote = await fetchProductList({ page: 1, pageSize: 50 })
  if (remote.cloudUsed && remote.products.length) {
    catalog.value = remote.products
  }
})

onReady(() => {
  heroVideoContext = uni.createVideoContext('hero-video')
})

onShow(() => {
  refreshing.value = false
  if (activeHero.value === 0 && heroVideoContext) heroVideoContext.play()
})

function onHeroChange(event: { detail: { current: number } }) {
  activeHero.value = event.detail.current
  if (!heroVideoContext) return
  if (activeHero.value === 0) heroVideoContext.play()
  else heroVideoContext.pause()
}

function toggleVideoSound() {
  videoMuted.value = !videoMuted.value
  nextTick(() => {
    if (heroVideoContext && activeHero.value === 0) heroVideoContext.play()
  })
}

function scrollToSection(selector: string) {
  uni.pageScrollTo({ selector, duration: 450 })
}

function heroAction(index: number) {
  scrollToSection(index === 2 ? '#journal' : '#curated')
}

function chooseCategory(category: string) {
  activeCategory.value = category
  searchOpen.value = false
}

function openSearch() {
  searchOpen.value = true
}

function closeSearch() {
  searchOpen.value = false
  keyword.value = ''
}

function openCart() {
  uni.redirectTo({ url: '/pages/cart/cart' })
}

function explore() {
  scrollToSection('#curated')
}

function resetFilters() {
  activeCategory.value = '全部'
  keyword.value = ''
  searchOpen.value = false
}
</script>

<template>
  <view class="page-wrap home-page">
    <view class="home-top safe-top">
      <view class="topbar">
        <view class="brand" @tap="resetFilters">
          <text class="brand__name">MORI</text>
          <view class="brand__cn-wrap">
            <text class="brand__cn">木里</text>
            <text class="brand__tagline">NATURAL GOODS</text>
          </view>
        </view>

        <view class="topbar__actions">
          <view class="icon-button" @tap="openSearch">
            <MoriIcon name="search" :size="39" />
          </view>
          <view class="icon-button icon-button--bag" @tap="openCart">
            <MoriIcon name="bag" :size="41" />
            <view v-if="cartCount > 0" class="bag-count">{{ cartBadge }}</view>
          </view>
        </view>
      </view>

      <view v-if="searchOpen" class="search-panel">
        <view class="search-panel__field">
          <MoriIcon name="search" tone="muted" :size="31" />
          <input
            v-model="keyword"
            class="search-panel__input"
            :focus="searchOpen"
            confirm-type="search"
            placeholder="搜索单品、系列或品类"
            placeholder-class="search-panel__placeholder"
          />
        </view>
        <text class="search-panel__cancel" @tap="closeSearch">取消</text>
      </view>

      <view v-if="searchOpen && keyword" class="search-hint">
        <text>{{ resultCaption }}</text>
        <text class="search-hint__count">{{ filteredProducts.length }} 件</text>
      </view>
    </view>

    <view class="hero">
      <swiper
        class="hero__swiper"
        :current="activeHero"
        :circular="true"
        :duration="460"
        @change="onHeroChange"
      >
        <swiper-item v-for="(slide, index) in heroSlides" :key="slide.season">
          <view class="hero__slide">
            <video
              v-if="slide.type === 'video'"
              id="hero-video"
              class="hero__video"
              src="/static/videos/mori-brand.mp4"
              poster="/static/videos/mori-brand-poster.jpg"
              autoplay
              :muted="videoMuted"
              loop
              :controls="false"
              :show-center-play-btn="false"
              :show-play-btn="false"
              :show-fullscreen-btn="false"
              :show-progress="false"
              :enable-progress-gesture="false"
              object-fit="cover"
              playsinline
              webkit-playsinline
            />
            <image v-else class="hero__image" :src="slide.image" mode="aspectFill" />

            <view class="hero__veil" :class="{ 'hero__veil--video': slide.type === 'video' }" />

            <view class="hero__content">
              <view class="hero__topline">
                <view class="hero__season">
                  <view class="hero__season-line" />
                  <text>{{ slide.season }}</text>
                </view>
                <view v-if="slide.type === 'video'" class="hero__top-actions">
                  <view class="hero__motion">
                    <view class="hero__motion-dot" />
                    <text>MOTION · 00:26</text>
                  </view>
                  <view
                    class="hero__sound"
                    :class="{ 'hero__sound--on': !videoMuted }"
                    @tap.stop="toggleVideoSound"
                  >
                    <text class="hero__sound-icon">{{ videoMuted ? '♪' : '♫' }}</text>
                    <text>{{ videoMuted ? '开启声音' : '关闭声音' }}</text>
                  </view>
                </view>
              </view>

              <view v-if="slide.type !== 'video'" class="hero__title">
                <text v-for="line in slide.title" :key="line">{{ line }}</text>
              </view>

              <view class="hero__footer">
                <text class="hero__subtitle">{{ slide.subtitle }}</text>
                <view class="hero__cta" @tap.stop="heroAction(index)">
                  <text>{{ slide.cta }}</text>
                  <MoriIcon name="arrow-right" tone="white" :size="28" />
                </view>
              </view>
            </view>
          </view>
        </swiper-item>
      </swiper>

      <view class="hero__index">
        <text>{{ String(activeHero + 1).padStart(2, '0') }}</text>
        <view class="hero__index-line" />
        <text>{{ String(heroSlides.length).padStart(2, '0') }}</text>
      </view>
    </view>

    <view class="categories">
      <scroll-view class="categories__scroll" scroll-x :show-scrollbar="false">
        <view class="categories__row">
          <view
            v-for="category in categories"
            :key="category"
            class="category-chip"
            :class="{ 'category-chip--active': activeCategory === category }"
            @tap="chooseCategory(category)"
          >
            {{ category }}
          </view>
        </view>
      </scroll-view>
    </view>

    <view id="curated" class="curated">
      <view class="curated__heading">
        <view>
          <view class="eyebrow">CURATED DAILY</view>
          <view class="section-title">每日精选</view>
        </view>
        <view class="curated__aside">
          <text class="curated__caption">{{ resultCaption }}</text>
          <MoriIcon name="leaf" tone="sage" :size="33" />
        </view>
      </view>

      <view class="section-rule curated__rule" />

      <view v-if="filteredProducts.length" class="product-columns">
        <view class="product-column">
          <ProductCard
            v-for="(product, index) in leftProducts"
            :key="product.id"
            :product="product"
            :index="index * 2"
          />
        </view>
        <view class="product-column product-column--offset">
          <ProductCard
            v-for="(product, index) in rightProducts"
            :key="product.id"
            :product="product"
            :index="index * 2 + 1"
          />
        </view>
      </view>

      <view v-else class="empty-search">
        <view class="empty-search__icon">
          <MoriIcon name="search" tone="muted" :size="54" />
        </view>
        <text class="empty-search__title">没有找到相关单品</text>
        <text class="empty-search__text">换一个关键词，或看看本季全部精选。</text>
        <button class="text-button" @tap="resetFilters">查看全部商品</button>
      </view>
    </view>

    <view id="journal" class="journal">
      <view class="journal__image-wrap">
        <image class="journal__image" src="/static/products/look-07-journal.jpg" mode="aspectFill" />
        <view class="journal__stamp">
          <text>MORI</text>
          <text>NOTES</text>
        </view>
      </view>
      <view class="journal__body">
        <view class="eyebrow">木里手记 · VOL. 04</view>
        <view class="journal__title"><text>慢一点，</text><text>让衣服与你相处得更久。</text></view>
        <view class="journal__text">
          我们相信，真正值得留下的衣物，不必追赶季节。选择天然材质与耐看廓形，在日常里穿出属于自己的节奏。
        </view>
        <view class="journal__link">
          <text>阅读我们的选品哲学</text>
          <MoriIcon name="arrow-right" :size="27" />
        </view>
      </view>
    </view>

    <view class="home-footer">
      <text class="home-footer__mark">MORI</text>
      <text class="home-footer__text">木里 · 与自然一起生活</text>
      <view class="home-footer__meta">
        <text>SHANGHAI</text>
        <text>EST. 2026</text>
      </view>
    </view>

    <view class="tabbar-space" />
    <TabBar active="home" />
  </view>
</template>

<style scoped lang="scss">
.home-page {
  padding-bottom: 1rpx;
}

.home-top {
  padding-left: 32rpx;
  padding-right: 32rpx;
  padding-bottom: 20rpx;
}

.topbar {
  height: 90rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand {
  display: flex;
  align-items: center;
  gap: 15rpx;
}

.brand__name {
  font-family: var(--mori-serif);
  font-size: 55rpx;
  line-height: 1;
  font-weight: 600;
  letter-spacing: 5rpx;
}

.brand__cn-wrap {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
  padding-left: 14rpx;
  border-left: 1rpx solid var(--mori-line-strong);
}

.brand__cn {
  font-family: var(--mori-serif);
  font-size: 22rpx;
  line-height: 1;
  letter-spacing: 5rpx;
}

.brand__tagline {
  font-size: 16rpx;
  line-height: 1;
  letter-spacing: 1.2rpx;
  color: var(--mori-muted);
}

.topbar__actions {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.icon-button {
  position: relative;
  width: 70rpx;
  height: 70rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-button:active {
  background: rgba(29, 33, 28, 0.06);
}

.bag-count {
  position: absolute;
  top: 4rpx;
  right: 0;
  min-width: 28rpx;
  height: 28rpx;
  padding: 0 6rpx;
  border-radius: 20rpx;
  background: var(--mori-accent);
  color: #fffdf8;
  font-size: 16rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx solid var(--mori-bg);
}

.search-panel {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-top: 8rpx;
  animation: search-in 0.25s ease both;
}

.search-panel__field {
  flex: 1;
  height: 78rpx;
  padding: 0 24rpx;
  display: flex;
  align-items: center;
  gap: 14rpx;
  background: var(--mori-surface);
  border: 1rpx solid var(--mori-line);
  border-radius: 20rpx;
}

.search-panel__input {
  flex: 1;
  height: 100%;
  font-size: 26rpx;
  color: var(--mori-ink);
}

.search-panel__placeholder {
  color: var(--mori-muted-light);
}

.search-panel__cancel {
  font-size: 25rpx;
  color: var(--mori-muted);
}

.search-hint {
  margin-top: 18rpx;
  padding: 0 6rpx;
  display: flex;
  justify-content: space-between;
  font-size: 22rpx;
  color: var(--mori-muted);
}

.search-hint__count {
  color: var(--mori-accent);
}

@keyframes search-in {
  from {
    opacity: 0;
    transform: translateY(-10rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero {
  position: relative;
  margin: 4rpx 24rpx 0;
  height: 878rpx;
  border-radius: 34rpx;
  overflow: hidden;
  background: #756b5d;
}

.hero__swiper,
.hero__slide {
  width: 100%;
  height: 100%;
}

.hero__slide {
  position: relative;
  overflow: hidden;
  background: #756b5d;
}

.hero__image,
.hero__video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.hero__video {
  object-fit: cover;
}

.hero__veil {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  background:
    linear-gradient(180deg, rgba(20, 23, 18, 0.18) 0%, rgba(20, 23, 18, 0.04) 35%, rgba(20, 23, 18, 0.7) 100%),
    linear-gradient(90deg, rgba(20, 23, 18, 0.18) 0%, rgba(20, 23, 18, 0) 65%);
}

.hero__veil--video {
  background:
    linear-gradient(180deg, rgba(18, 21, 17, 0.12) 0%, rgba(18, 21, 17, 0.02) 32%, rgba(18, 21, 17, 0.74) 100%),
    linear-gradient(90deg, rgba(18, 21, 17, 0.28) 0%, rgba(18, 21, 17, 0) 72%);
}

.hero__content {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2;
  padding: 48rpx 38rpx 40rpx;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: #fffdf8;
  pointer-events: none;
}

.hero__topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
}

.hero__motion {
  height: 42rpx;
  padding: 0 14rpx;
  border-radius: 999rpx;
  border: 1rpx solid rgba(255, 253, 248, 0.2);
  background: rgba(20, 23, 18, 0.18);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  gap: 7rpx;
  font-size: 14rpx;
  letter-spacing: 1.5rpx;
  color: rgba(255, 253, 248, 0.76);
}

.hero__motion-dot {
  width: 7rpx;
  height: 7rpx;
  border-radius: 50%;
  background: #d8b890;
  box-shadow: 0 0 12rpx rgba(216, 184, 144, 0.8);
}

.hero__top-actions {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.hero__sound {
  height: 46rpx;
  padding: 0 14rpx;
  border-radius: 999rpx;
  border: 1rpx solid rgba(255, 253, 248, 0.36);
  background: rgba(255, 253, 248, 0.14);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  gap: 6rpx;
  font-size: 15rpx;
  letter-spacing: 0.5rpx;
  color: #fffdf8;
  pointer-events: auto;
  animation: sound-hint 2.6s ease-in-out infinite;
}

.hero__sound--on {
  border-color: rgba(255, 253, 248, 0.58);
  background: rgba(255, 253, 248, 0.24);
  animation: none;
}

.hero__sound-icon {
  font-size: 22rpx;
  line-height: 1;
}

@keyframes sound-hint {
  0%,
  100% {
    box-shadow: 0 0 0 rgba(255, 253, 248, 0);
  }
  50% {
    box-shadow: 0 0 0 6rpx rgba(255, 253, 248, 0.08), 0 6rpx 20rpx rgba(15, 18, 14, 0.18);
  }
}

.hero__season {
  display: flex;
  align-items: center;
  gap: 14rpx;
  font-size: 17rpx;
  letter-spacing: 3rpx;
  font-weight: 500;
}

.hero__season-line {
  width: 40rpx;
  height: 1rpx;
  background: rgba(255, 253, 248, 0.8);
}

.hero__title {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
  font-family: var(--mori-serif);
  font-size: 68rpx;
  line-height: 1.12;
  font-weight: 500;
  letter-spacing: 1rpx;
  text-shadow: 0 4rpx 30rpx rgba(15, 18, 14, 0.2);
}

.hero__title--film {
  font-size: 58rpx;
}

.hero__footer {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20rpx;
}

.hero__subtitle {
  font-size: 21rpx;
  line-height: 1.7;
  letter-spacing: 1rpx;
  color: rgba(255, 253, 248, 0.8);
}

.hero__cta {
  height: 68rpx;
  padding: 0 24rpx;
  border: 1rpx solid rgba(255, 253, 248, 0.55);
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 21rpx;
  letter-spacing: 1rpx;
  background: rgba(255, 253, 248, 0.1);
  backdrop-filter: blur(10px);
  pointer-events: auto;
}

.hero__index {
  position: absolute;
  z-index: 3;
  right: 30rpx;
  top: 50%;
  pointer-events: none;
  transform: translateY(-50%) rotate(90deg);
  transform-origin: center;
  display: flex;
  align-items: center;
  gap: 10rpx;
  font-family: var(--mori-serif);
  font-size: 17rpx;
  letter-spacing: 2rpx;
  color: rgba(255, 253, 248, 0.75);
}

.hero__index-line {
  width: 46rpx;
  height: 1rpx;
  background: rgba(255, 253, 248, 0.6);
}

.categories {
  margin-top: 30rpx;
}

.categories__scroll {
  width: 100%;
  white-space: nowrap;
}

.categories__row {
  display: inline-flex;
  gap: 14rpx;
  padding: 0 32rpx;
}

.category-chip {
  height: 64rpx;
  padding: 0 28rpx;
  border-radius: 999rpx;
  border: 1rpx solid var(--mori-line);
  background: rgba(255, 253, 248, 0.5);
  display: flex;
  align-items: center;
  font-size: 23rpx;
  letter-spacing: 1rpx;
  color: var(--mori-muted);
  transition: all 0.22s ease;
}

.category-chip--active {
  background: var(--mori-forest);
  border-color: var(--mori-forest);
  color: #f7f4ed;
  font-weight: 500;
}

.curated {
  padding: 52rpx 26rpx 0;
}

.curated__heading {
  padding: 0 6rpx;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20rpx;
}

.curated__aside {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding-bottom: 5rpx;
}

.curated__caption {
  font-size: 19rpx;
  letter-spacing: 1rpx;
  color: var(--mori-muted);
}

.curated__rule {
  margin: 28rpx 6rpx 26rpx;
}

.product-columns {
  display: flex;
  align-items: flex-start;
  gap: 20rpx;
}

.product-column {
  width: calc(50% - 10rpx);
}

.product-column--offset {
  padding-top: 58rpx;
}

.empty-search {
  padding: 100rpx 30rpx 90rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.empty-search__icon {
  width: 112rpx;
  height: 112rpx;
  border-radius: 50%;
  background: var(--mori-surface-alt);
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-search__title {
  margin-top: 26rpx;
  font-family: var(--mori-serif);
  font-size: 38rpx;
}

.empty-search__text {
  margin-top: 12rpx;
  font-size: 23rpx;
  color: var(--mori-muted);
}

.text-button {
  margin-top: 28rpx;
  height: 68rpx;
  padding: 0 30rpx;
  border-radius: 999rpx;
  background: var(--mori-forest);
  color: #fffdf8;
  font-size: 23rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.journal {
  margin: 64rpx 24rpx 0;
  border-radius: 32rpx;
  overflow: hidden;
  background: var(--mori-forest);
  color: #f8f4ec;
}

.journal__image-wrap {
  position: relative;
  height: 460rpx;
}

.journal__image {
  width: 100%;
  height: 100%;
  opacity: 0.86;
}

.journal__image-wrap::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(38, 60, 50, 0) 38%, rgba(38, 60, 50, 0.88) 100%);
}

.journal__stamp {
  position: absolute;
  top: 28rpx;
  right: 28rpx;
  width: 82rpx;
  height: 82rpx;
  border: 1rpx solid rgba(255, 253, 248, 0.5);
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-family: var(--mori-serif);
  font-size: 16rpx;
  line-height: 1.5;
  letter-spacing: 1rpx;
  color: rgba(255, 253, 248, 0.9);
}

.journal__body {
  padding: 8rpx 34rpx 42rpx;
}

.journal .eyebrow {
  color: rgba(255, 253, 248, 0.55);
}

.journal__title {
  margin-top: 18rpx;
  display: flex;
  flex-direction: column;
  font-family: var(--mori-serif);
  font-size: 46rpx;
  line-height: 1.32;
  font-weight: 500;
}

.journal__text {
  margin-top: 22rpx;
  font-size: 23rpx;
  line-height: 1.9;
  color: rgba(255, 253, 248, 0.68);
}

.journal__link {
  margin-top: 26rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 22rpx;
  border-top: 1rpx solid rgba(255, 253, 248, 0.18);
  font-size: 22rpx;
  letter-spacing: 1rpx;
}

.home-footer {
  padding: 82rpx 34rpx 60rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.home-footer__mark {
  font-family: var(--mori-serif);
  font-size: 34rpx;
  letter-spacing: 13rpx;
  padding-left: 13rpx;
}

.home-footer__text {
  margin-top: 12rpx;
  font-size: 20rpx;
  letter-spacing: 3rpx;
  color: var(--mori-muted);
}

.home-footer__meta {
  width: 100%;
  margin-top: 34rpx;
  padding-top: 22rpx;
  border-top: 1rpx solid var(--mori-line);
  display: flex;
  justify-content: space-between;
  font-size: 17rpx;
  letter-spacing: 2rpx;
  color: var(--mori-muted-light);
}

.tabbar-space {
  height: 150rpx;
}
</style>