/**
 * 菜品实物图本地匹配器
 * 来源：主工程 src/utils/dishImageMatcher.ts（关键词分支逐字搬运）
 * 差异：改为 import.meta.glob 静态收集 ../assets/images/lowkey_*.webp，
 *      按文件名后缀（burger / coldbrew / ...）索引，不再写 22 条 import。
 */

const modules = import.meta.glob('../assets/images/lowkey_*.webp', {
  eager: true,
  import: 'default'
}) as Record<string, string>;

/** 按关键字取图：images/lowkey_<key>.webp */
const pick = (key: string): string => {
  const m = modules;
  for (const path of Object.keys(m)) {
    if (path.toLowerCase().includes(`lowkey_${key.toLowerCase()}`)) {
      const mod = m[path] as any;
      return typeof mod === 'string' ? mod : mod?.default || '';
    }
  }
  return '';
};

const lowkeyBurgerImg = pick('burger');
const lowkeyCornImg = pick('corn');
const lowkeyEggplantImg = pick('eggplant');
const lowkeyOysterImg = pick('oyster');
const lowkeyScallopImg = pick('scallop');
const lowkeyLobsterImg = pick('lobster');
const lowkeyShrimpImg = pick('shrimp');
const lowkeySquidImg = pick('squid');
const lowkeyUnagiImg = pick('unagi');
const lowkeyChochinImg = pick('chochin');
const lowkeyWingsImg = pick('wings');
const lowkeyLeekImg = pick('leek');
const lowkeyLotusImg = pick('lotus');
const lowkeyFriesImg = pick('fries');
const lowkeyMushroomImg = pick('mushroom');
const lowkeyLasagnaImg = pick('lasagna');
const lowkeyGnocchiImg = pick('gnocchi');
const lowkeySodaImg = pick('soda');
const lowkeyColdbrewImg = pick('coldbrew');
const lowkeyDessertImg = pick('dessert');
const lowkeySteakImg = pick('steak');
const lowkeySeafoodImg = pick('seafood');
const lowkeyYakitoriImg = pick('yakitori');
const lowkeySkewersImg = pick('skewers');

export function getSmartMatchedImageUrl(name: string, category?: string): string {
  const n = name.toLowerCase();

  // 1. 汉堡/肉排类
  if (n.includes('汉堡') || n.includes('slider') || n.includes('burger')) {
    return lowkeyBurgerImg;
  }

  // 2. 玉米类
  if (n.includes('玉米') || n.includes('corn')) {
    return lowkeyCornImg;
  }

  // 3. 茄子类
  if (n.includes('茄子') || n.includes('eggplant')) {
    return lowkeyEggplantImg;
  }

  // 4. 生蚝/牡蛎类
  if (n.includes('生蚝') || n.includes('蚝') || n.includes('oyster')) {
    return lowkeyOysterImg;
  }

  // 5. 扇贝/天鹅蛋类
  if (n.includes('扇贝') || n.includes('scallop') || n.includes('带子')) {
    return lowkeyScallopImg;
  }

  // 6. 虾/虾仁/龙虾/对虾类
  if (n.includes('龙虾') || n.includes('lobster')) {
    return lowkeyLobsterImg;
  }
  if (n.includes('虾') || n.includes('shrimp') || n.includes('prawn')) {
    return lowkeyShrimpImg;
  }

  // 7. 鱿鱼/墨鱼/章鱼
  if (n.includes('鱿鱼') || n.includes('墨鱼') || n.includes('squid') || n.includes('cuttlefish') || n.includes('八爪')) {
    return lowkeySquidImg;
  }

  // 8. 鳗鱼/小黄鱼/烤鱼
  if (n.includes('鳗') || n.includes('unagi') || n.includes('鱼') || n.includes('fish')) {
    return lowkeyUnagiImg;
  }

  // 9. 提灯 (日式提灯专用)
  if (n.includes('提灯') || n.includes('chochin')) {
    return lowkeyChochinImg;
  }

  // 10. 鸡翅/鸡腿/掌中宝/禽类
  if (n.includes('翅') || n.includes('鸡') || n.includes('鸭') || n.includes('wing') || n.includes('掌中宝') || n.includes('胗') || n.includes('心')) {
    return lowkeyWingsImg;
  }

  // 11. 韭菜/蔬菜/彩椒/贡菜/芦笋
  if (n.includes('韭菜') || n.includes('椒') || n.includes('贡菜') || n.includes('生菜') || n.includes('笋') || n.includes('芦笋') || n.includes('西葫芦') || n.includes('海带') || n.includes('西兰花')) {
    return lowkeyLeekImg;
  }

  // 12. 莲藕/土豆/苕皮/豆腐/面筋
  if (n.includes('藕') || n.includes('土豆片') || n.includes('苕皮') || n.includes('豆腐') || n.includes('面筋') || n.includes('豆皮')) {
    return lowkeyLotusImg;
  }

  // 13. 薯条/脆薯
  if (n.includes('薯条') || n.includes('脆薯') || n.includes('fries')) {
    return lowkeyFriesImg;
  }

  // 14. 菌菇/香菇/金针菇
  if (n.includes('菇') || n.includes('金针') || n.includes('mushroom') || n.includes('enoki')) {
    return lowkeyMushroomImg;
  }

  // 15. 千层焗面/芝士焗饭/焗意面
  if (n.includes('千层') || n.includes('焗面') || n.includes('焗饭') || n.includes('lasagna') || n.includes('penne')) {
    return lowkeyLasagnaImg;
  }

  // 16. 玉棋/黑松露手工面
  if (n.includes('玉棋') || n.includes('gnocchi')) {
    return lowkeyGnocchiImg;
  }

  // 17. 饮品/气泡/苏打
  if (n.includes('气泡') || n.includes('苏打') || n.includes('soda') || n.includes('柠檬') || n.includes('青柠')) {
    return lowkeySodaImg;
  }

  // 18. 咖啡/冷萃/酸梅汤
  if (n.includes('咖啡') || n.includes('冷萃') || n.includes('coffee') || n.includes('brew') || n.includes('乌梅') || category === 'drinks') {
    return lowkeyColdbrewImg;
  }

  // 19. 甜点/蛋糕/舒芙蕾/吐司/馒头/年糕
  if (n.includes('蛋糕') || n.includes('舒芙蕾') || n.includes('甜点') || n.includes('cake') || n.includes('dessert') || n.includes('南瓜') || n.includes('红薯') || n.includes('馒头') || n.includes('吐司') || n.includes('年糕') || category === 'desserts') {
    return lowkeyDessertImg;
  }

  // 20. 牛排/和牛/战斧/大肉盘/羊排/排骨
  if (n.includes('牛排') || n.includes('steak') || n.includes('拼盘') || n.includes('战斧') || n.includes('排骨') || n.includes('羊排') || n.includes('松板肉')) {
    return lowkeySteakImg;
  }

  // 21. 提拉米苏（原工程无独立图，归入甜点）
  if (n.includes('提拉米苏') || n.includes('tiramisu')) {
    return lowkeyDessertImg;
  }

  // 22. 海鲜/贝壳合集
  if (n.includes('海鲜') || n.includes('seafood') || n.includes('贝')) {
    return lowkeySeafoodImg;
  }

  // 23. 烧鸟
  if (n.includes('烧鸟') || n.includes('yakitori')) {
    return lowkeyYakitoriImg;
  }

  // 默认统一精选：暗调 Low-key 30° 机位炭火烤肉串
  return lowkeySkewersImg || lowkeyYakitoriImg || '';
}

/** 获取单个菜品匹配图片（支持菜品对象或名称字符串） */
export function matchDishImageUrl(dish: { id?: string; name?: string; category?: string } | string): string {
  if (typeof dish === 'string') {
    return getSmartMatchedImageUrl(dish);
  }
  return getSmartMatchedImageUrl(dish?.name || '', dish?.category);
}
