import type { Product } from '@/types/shop'

export const products: Product[] = [
  {
    id: 'P01',
    name: '雾岸 · 轻羊毛廓形大衣',
    englishName: 'MIST COAST WOOL COAT',
    subtitle: '轻盈双面呢，留出恰到好处的廓形',
    price: 1299,
    originalPrice: 1599,
    category: '外套',
    images: [
      '/static/products/look-02.jpg',
      '/static/products/look-03.jpg',
      '/static/products/look-01.jpg'
    ],
    aspect: 'tall',
    tag: '本季新品',
    rating: 4.9,
    reviews: 86,
    sold: 238,
    colors: [
      { name: '燕麦', value: '#c8b9a0' },
      { name: '炭灰', value: '#4c4b47' }
    ],
    sizes: [
      { name: 'S', stock: 3 },
      { name: 'M', stock: 8 },
      { name: 'L', stock: 5 },
      { name: 'XL', stock: 0 }
    ],
    description: '以轻量双面羊毛重新定义秋季外套。落肩廓形包容身体，腰带可自由收束，在通勤与周末之间轻松切换。',
    material: '绵羊毛 78% · 聚酯纤维 22% / 双面呢工艺',
    care: '建议干洗。悬挂于通风处存放，避免长时间强光直射。'
  },
  {
    id: 'P02',
    name: '原野 · 羊绒混纺针织衫',
    englishName: 'FIELD CASHMERE KNIT',
    subtitle: '云朵般的触感，适合整个秋冬',
    price: 469,
    originalPrice: 599,
    category: '针织',
    images: ['/static/products/look-04.jpg', '/static/products/look-01.jpg'],
    aspect: 'short',
    tag: '柔软亲肤',
    rating: 4.8,
    reviews: 142,
    sold: 476,
    colors: [
      { name: '苔绿', value: '#6d755d' },
      { name: '奶油', value: '#d9cfbd' }
    ],
    sizes: [
      { name: 'S', stock: 12 },
      { name: 'M', stock: 7 },
      { name: 'L', stock: 3 }
    ],
    description: '细腻羊绒与精梳棉混纺，保留轻柔保暖感，同时更耐穿。微宽松版型适合单穿，也能作为大衣内搭。',
    material: '山羊绒 30% · 精梳棉 70%',
    care: '建议冷水手洗，平铺阴干。请勿拧干或高温熨烫。'
  },
  {
    id: 'P03',
    name: '苔痕 · 植鞣皮托特包',
    englishName: 'MOSS LEATHER TOTE',
    subtitle: '会随时间留下光泽的手工皮具',
    price: 899,
    category: '包袋',
    images: ['/static/products/bag-01.jpg', '/static/products/bag-02.jpg'],
    aspect: 'regular',
    tag: '手工皮具',
    rating: 4.9,
    reviews: 67,
    sold: 193,
    colors: [
      { name: '焦糖', value: '#8b5f3e' },
      { name: '深咖', value: '#4e392c' }
    ],
    sizes: [
      { name: '中号', stock: 6 },
      { name: '大号', stock: 2 }
    ],
    description: '选用植鞣头层牛皮，手工打磨边缘。可容纳 13 英寸电脑，内置拉链袋与双侧插袋，让日常收纳从容有序。',
    material: '头层植鞣牛皮 · 棉麻内衬',
    care: '避免接触水分与油污。定期使用无色皮革护理膏轻拭。'
  },
  {
    id: 'P04',
    name: '松烟 · 垂感直筒西裤',
    englishName: 'PINE SMOKE TROUSERS',
    subtitle: '利落线条与自然垂坠感并存',
    price: 389,
    category: '下装',
    images: ['/static/products/look-09.jpg', '/static/products/look-12.jpg'],
    aspect: 'tall',
    tag: '通勤优选',
    rating: 4.7,
    reviews: 118,
    sold: 364,
    colors: [
      { name: '松烟灰', value: '#5f625e' },
      { name: '墨黑', value: '#292a28' }
    ],
    sizes: [
      { name: '26', stock: 4 },
      { name: '27', stock: 9 },
      { name: '28', stock: 6 },
      { name: '29', stock: 0 },
      { name: '30', stock: 2 }
    ],
    description: '高腰直筒剪裁拉长腿部线条，混纺面料带有细腻纹理与自然垂感。后腰松紧设计，久坐依然舒适。',
    material: '醋酸纤维 52% · 粘胶纤维 43% · 氨纶 5%',
    care: '建议干洗。若水洗请使用中性洗涤剂，低温轻柔模式。'
  },
  {
    id: 'P05',
    name: '白桦 · 有机棉廓形衬衫',
    englishName: 'BIRCH COTTON SHIRT',
    subtitle: '一件可以从春天穿到冬天的白衬衫',
    price: 329,
    category: '上装',
    images: ['/static/products/look-11.jpg', '/static/products/look-10.jpg'],
    aspect: 'regular',
    tag: '经典基础款',
    rating: 4.8,
    reviews: 205,
    sold: 812,
    colors: [
      { name: '原生白', value: '#e9e4d8' },
      { name: '沙色', value: '#c7b69c' }
    ],
    sizes: [
      { name: 'S', stock: 10 },
      { name: 'M', stock: 14 },
      { name: 'L', stock: 6 }
    ],
    description: '有机棉面料经过酵素柔洗，触感细腻且不易起皱。略宽松的肩线与圆弧下摆，单穿或叠搭都松弛自然。',
    material: '有机棉 100%',
    care: '机洗轻柔，水温不超过 30°C。深浅色请分开洗涤。'
  },
  {
    id: 'P06',
    name: '赤陶 · 复古轻量跑鞋',
    englishName: 'TERRACOTTA RUNNER',
    subtitle: '城市漫游的轻盈脚下风景',
    price: 559,
    originalPrice: 699,
    category: '鞋履',
    images: ['/static/products/shoe-01.jpg', '/static/products/look-06.jpg'],
    aspect: 'short',
    tag: '限量配色',
    rating: 4.7,
    reviews: 93,
    sold: 287,
    colors: [
      { name: '赤陶', value: '#b85c3e' },
      { name: '米白', value: '#ddd5c3' }
    ],
    sizes: [
      { name: '36', stock: 2 },
      { name: '37', stock: 5 },
      { name: '38', stock: 8 },
      { name: '39', stock: 3 },
      { name: '40', stock: 0 },
      { name: '41', stock: 1 }
    ],
    description: '复古跑鞋轮廓搭配轻量缓震中底，麂皮与织物拼接鞋面带来丰富层次。日常通勤与周末出行都能轻松驾驭。',
    material: '反绒牛皮 / 透气织物 / 橡胶大底',
    care: '使用软毛刷干刷清洁。请勿机洗，避免长时间浸水。'
  },
  {
    id: 'P07',
    name: '岩灰 · 短款机车皮衣',
    englishName: 'SLATE LEATHER JACKET',
    subtitle: '克制而锋利的秋日态度',
    price: 1599,
    category: '外套',
    images: ['/static/products/look-06.jpg', '/static/products/look-05.jpg'],
    aspect: 'tall',
    tag: '设计师系列',
    rating: 4.9,
    reviews: 44,
    sold: 96,
    colors: [
      { name: '岩灰', value: '#3f4240' },
      { name: '深棕', value: '#6b5546' }
    ],
    sizes: [
      { name: 'S', stock: 2 },
      { name: 'M', stock: 4 },
      { name: 'L', stock: 1 }
    ],
    description: '短款机车夹克以柔软羊皮重塑硬朗轮廓，金属拉链与斜插袋保留经典细节。搭配高腰下装比例利落。',
    material: '绵羊皮 100% · 铜氨丝内衬',
    care: '仅限专业皮具干洗。避免受潮、暴晒与尖锐物刮擦。'
  },
  {
    id: 'P08',
    name: '林隙 · 真丝印花方巾',
    englishName: 'FOREST SILK SCARF',
    subtitle: '把一片森林系在颈间',
    price: 219,
    category: '配饰',
    images: ['/static/products/look-08.jpg', '/static/products/watch-01.jpg'],
    aspect: 'regular',
    tag: '桑蚕丝',
    rating: 4.6,
    reviews: 58,
    sold: 321,
    colors: [
      { name: '林隙绿', value: '#5f7059' },
      { name: '松露棕', value: '#8d6e58' }
    ],
    sizes: [{ name: '53 × 53cm', stock: 16 }],
    description: '以手绘植物纹样为灵感的真丝方巾，低温数码印花保留细腻色彩。可系于颈间、包袋或作为发带使用。',
    material: '桑蚕丝 100%',
    care: '建议冷水手洗或干洗，阴凉处平铺晾干。'
  },
  {
    id: 'P09',
    name: '月白 · 结构感腋下包',
    englishName: 'MOON WHITE BAG',
    subtitle: '极简线条里的实用主义',
    price: 759,
    category: '包袋',
    images: ['/static/products/bag-02.jpg', '/static/products/bag-01.jpg'],
    aspect: 'short',
    tag: '编辑推荐',
    rating: 4.8,
    reviews: 76,
    sold: 219,
    colors: [
      { name: '月白', value: '#dad2c5' },
      { name: '墨黑', value: '#2c2b29' }
    ],
    sizes: [
      { name: '小号', stock: 7 },
      { name: '中号', stock: 3 }
    ],
    description: '有雕塑感却意外轻巧的腋下包，磁吸开合与分层内袋兼顾美感与效率。可调节肩带适配不同穿搭。',
    material: '再生纤维复合皮革 · 棉质内衬',
    care: '使用柔软干布擦拭。避免与深色衣物长时间摩擦。'
  },
  {
    id: 'P10',
    name: '山岚 · 极简石英腕表',
    englishName: 'MOUNTAIN WATCH',
    subtitle: '时间也可以安静而克制',
    price: 1199,
    category: '配饰',
    images: ['/static/products/watch-01.jpg', '/static/products/look-08.jpg'],
    aspect: 'regular',
    tag: '礼赠之选',
    rating: 4.9,
    reviews: 31,
    sold: 88,
    colors: [
      { name: '雾银', value: '#bbb7ae' },
      { name: '暖金', value: '#b69a64' }
    ],
    sizes: [
      { name: '38mm', stock: 4 },
      { name: '42mm', stock: 2 }
    ],
    description: '简洁表盘去除多余刻度，以细窄表圈呈现轻盈比例。蓝宝石镜面与日本石英机芯，陪伴每一段日常。',
    material: '316L 精钢 / 蓝宝石玻璃 / 日本石英机芯',
    care: '支持 30 米生活防水。请勿在热水浴或潜水时佩戴。'
  },
  {
    id: 'P11',
    name: '晨雾 · 重磅基础白 T',
    englishName: 'MORNING MIST TEE',
    subtitle: '恰到好处的厚度与挺括感',
    price: 169,
    category: '上装',
    images: ['/static/products/look-10.jpg', '/static/products/look-07.jpg'],
    aspect: 'tall',
    tag: '人气单品',
    rating: 4.7,
    reviews: 326,
    sold: 1260,
    colors: [
      { name: '云白', value: '#e8e5dd' },
      { name: '雾灰', value: '#aaa79f' }
    ],
    sizes: [
      { name: 'S', stock: 20 },
      { name: 'M', stock: 18 },
      { name: 'L', stock: 11 },
      { name: 'XL', stock: 5 }
    ],
    description: '280g 重磅棉质面料，领口采用双层罗纹加固。微宽松剪裁搭配适中衣长，单穿有型，叠搭不臃肿。',
    material: '精梳棉 100%',
    care: '反面机洗，水温不超过 30°C。请勿高温烘干。'
  },
  {
    id: 'P12',
    name: '墨野 · 复古阔腿牛仔裤',
    englishName: 'INK FIELD DENIM',
    subtitle: '一条有呼吸感的复古牛仔裤',
    price: 429,
    originalPrice: 529,
    category: '下装',
    images: ['/static/products/look-12.jpg', '/static/products/look-09.jpg'],
    aspect: 'short',
    tag: '年度版型',
    rating: 4.8,
    reviews: 164,
    sold: 541,
    colors: [
      { name: '靛蓝', value: '#485568' },
      { name: '烟灰', value: '#65645f' }
    ],
    sizes: [
      { name: '26', stock: 6 },
      { name: '27', stock: 8 },
      { name: '28', stock: 5 },
      { name: '29', stock: 2 }
    ],
    description: '高腰阔腿版型以水洗丹宁呈现自然复古质感，前片打褶增加活动量。裤脚可挽可放，适配不同身高。',
    material: '棉 98% · 氨纶 2%',
    care: '冷水反面洗涤，减少浸泡。首次洗涤可能轻微掉色。'
  }
]

export const categories = ['全部', '外套', '针织', '包袋', '下装', '上装', '鞋履', '配饰']

export const findProduct = (id: string) => products.find((product) => product.id === id)