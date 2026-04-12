/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, ReactNode, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { ChevronRight, RefreshCw, CheckCircle2, ArrowLeft, Swords, Scroll, Book, Sparkles, Shield, Wind, Flame } from 'lucide-react';

// --- Types ---
type OptionType = 'A' | 'B' | 'C';

interface Option {
  type: OptionType;
  text: string;
}

interface Question {
  id: number;
  text: string;
  options: Option[];
}

interface ResultType {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  advice: string;
  suggestion: string;
  icon: ReactNode;
  color: string;
  character: string;
  bgImage: string;
  charImage?: string;
  traits: string[];
  strengths: string[];
}

// --- Helper: Shuffle Array ---
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// --- Constants ---
const QUESTIONS: Question[] = [
  { id: 1, text: "面對突發的危機，你的第一反應是？", options: [{ type: 'A', text: "衝撞解決" }, { type: 'B', text: "冷靜停損" }, { type: 'C', text: "順其自然" }] },
  { id: 2, text: "連續高壓工作後，你如何恢復能量？", options: [{ type: 'A', text: "爆汗運動或大吃一頓" }, { type: 'B', text: "獨處覆盤與規劃下週" }, { type: 'C', text: "徹底放空，什麼都不做" }] },
  { id: 3, text: "遇到無法退讓的利益衝突時，你會：", options: [{ type: 'A', text: "強勢主導" }, { type: 'B', text: "談判交換" }, { type: 'C', text: "彈性退讓" }] },
  { id: 4, text: "「所有的失敗，都是因為我不夠努力。」", options: [{ type: 'A', text: "非常認同" }, { type: 'B', text: "不一定，策略與邏輯更重要" }, { type: 'C', text: "不認同，有時是運氣或天意" }] },
  { id: 5, text: "在團隊中，你通常扮演的角色是：", options: [{ type: 'A', text: "衝鋒陷陣的矛" }, { type: 'B', text: "掌控全局的腦" }, { type: 'C', text: "穩定人心的盾" }] },
  { id: 6, text: "構思企劃或設計時，你最看重：", options: [{ type: 'A', text: "視覺張力與震撼" }, { type: 'B', text: "嚴密無缺的邏輯" }, { type: 'C', text: "留白與極簡美感" }] },
  { id: 7, text: "獲得一筆意外之財，你會：", options: [{ type: 'A', text: "立刻買想要的東西" }, { type: 'B', text: "投入理財系統滾雪球" }, { type: 'C', text: "維持原生活，將部分捐出" }] },
  { id: 8, text: "面對他人的惡意中傷，你會：", options: [{ type: 'A', text: "當面對質" }, { type: 'B', text: "暗中佈局反擊" }, { type: 'C', text: "清者自清，懶得理會" }] },
  { id: 9, text: "你認為社會規則是：", options: [{ type: 'A', text: "用來打破的" }, { type: 'B', text: "用來利用的" }, { type: 'C', text: "用來看透的" }] },
  { id: 10, text: "對於展現自身才華，你的態度是：", options: [{ type: 'A', text: "鋒芒畢露" }, { type: 'B', text: "精準控制，對症下藥" }, { type: 'C', text: "深藏不露" }] },
  { id: 11, text: "夜深人靜時，最常讓你焦慮的是：", options: [{ type: 'A', text: "今天行動力不足，進度落後" }, { type: 'B', text: "未來變數太多，無法掌控" }, { type: 'C', text: "覺得自己與這世界格格不入" }] },
  { id: 12, text: "進入完全未知的領域，你傾向：", options: [{ type: 'A', text: "直接動手試錯" }, { type: 'B', text: "先建構理論邏輯" }, { type: 'C', text: "尋找心靈導師或靈感" }] },
  { id: 13, text: "穩固的伴侶或合夥關係，應建立在：", options: [{ type: 'A', text: "絕對的義氣與熱情" }, { type: 'B', text: "利益與能力的互補" }, { type: 'C', text: "精神的獨立與包容" }] },
  { id: 14, text: "你覺得自己這輩子最難放下的是：", options: [{ type: 'A', text: "對「輸贏與成就」的執著" }, { type: 'B', text: "對「計畫與掌控」的執著" }, { type: 'C', text: "對「尋找終極意義」的執著" }] },
  { id: 15, text: "局勢陷入死水，大家都束手無策時：", options: [{ type: 'A', text: "出奇招打破它" }, { type: 'B', text: "尋找對手的微小破綻" }, { type: 'C', text: "靜待時機自己出現" }] },
  { id: 16, text: "對於世俗的名聲與地位，你的真實看法：", options: [{ type: 'A', text: "是奮鬥的戰利品" }, { type: 'B', text: "是好用的資源工具" }, { type: 'C', text: "皆是過眼雲煙" }] },
  { id: 17, text: "「凡事都有因果，不強求反而會順利。」", options: [{ type: 'A', text: "不認同，事在人為" }, { type: 'B', text: "中立，看客觀條件" }, { type: 'C', text: "非常認同" }] },
  { id: 18, text: "理想的晚年生活是：", options: [{ type: 'A', text: "保持活力，傳承技藝" }, { type: 'B', text: "建立制度，發揮影響力" }, { type: 'C', text: "隱居山林，與世無爭" }] },
  { id: 19, text: "若要選一個象徵你的現代物品：", options: [{ type: 'A', text: "多功能瑞士刀" }, { type: 'B', text: "高效能伺服器" }, { type: 'C', text: "未經雕琢的璞玉" }] },
  { id: 20, text: "人生的終極意義在於：", options: [{ type: 'A', text: "轟轟烈烈燃燒一回" }, { type: 'B', text: "建立體制改變世界" }, { type: 'C', text: "達到內心絕對平靜" }] }
];

const RESULTS: Record<number, ResultType> = {
  1: {
    id: 1,
    character: "呂布",
    title: "戰神 / 本能驅動者",
    subtitle: "血氣方剛的爆發期",
    description: "戰鬥力爆表，愛憎分明。你遵從內心的直覺與慾望，是個絕對的行動派，討厭彎彎繞繞的複雜規則。",
    advice: "【血氣方剛的爆發期】你目前正處於能量最旺盛、但也最容易失控的「衝撞期」。面對困境，你的第一反應是用蠻力打破它。道家提醒，過度的剛猛容易折損。你該調整的心態是「學會留白」。在即將發怒或衝動決定前，給自己三秒鐘的停頓。你的破壞力已經足夠，若能加上一點對大局的冷靜判斷，你將無堅不摧。",
    suggestion: "「剛者易折，水善利萬物而不爭。」\n你最不缺的就是勇氣，現在要練的是「停一秒」的能力。\n每次快要發火或衝動行事前，先深呼吸三秒鐘，問自己：這樣做對全局有沒有幫助？\n試著在日常中加入一點靜態習慣，例如散步或冥想，讓神經系統有喘息的空間。\n爆發力已經足夠強，只要再多一點沉穩，就是真正無法被擊倒的人。",
    icon: <Flame className="w-12 h-12" />,
    color: "from-red-950/90 to-red-900/80",
    bgImage: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=1200",
    charImage: "https://images.weserv.nl/?url=https://github.com/user-attachments/assets/6010386b-353b-4328-8262-964092eae61d",
    traits: ["直覺敏銳", "行動力極強"],
    strengths: ["破局能力", "純粹能量"]
  },
  2: {
    id: 2,
    character: "諸葛亮",
    title: "丞相 / 鞠躬盡瘁者",
    subtitle: "責任與天命的抗衡期",
    description: "智慧的化身，極度負責任。你追求完美的秩序，擁有強大的邏輯與大局觀，習慣將所有細節都扛在肩上。",
    advice: "【責任與天命的抗衡期】你正處於為團隊或目標殫精竭慮的階段，試圖以極致的腦力掌控一切。然而，道家言「慧極必傷」。面對不管怎麼算計都無法扭轉的壞局面，你必須學會「知命與放下」。你最大的課題是容許事物失控，並坦然接受人力有時而窮。適時地將責任外包，回歸對自身健康的關注，才是長遠之道。",
    suggestion: "「慧極必傷，情深不壽。」\n你的智慧是天賦，但大腦也需要充電。試著把手邊的事分一部分給別人，就算對方做得不如你，也讓他們有機會去嘗試。\n每週至少安排一段純粹放空的時間。\n接受「有些事情就是沒辦法完美」，就是順應道法的從容。",
    icon: <Scroll className="w-12 h-12" />,
    color: "from-blue-950/90 to-blue-900/80",
    bgImage: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&q=80&w=1200",
    charImage: "https://images.weserv.nl/?url=https://github.com/user-attachments/assets/0462be11-2fb4-46ff-a995-3d10ee7bcdbf",
    traits: ["邏輯縝密", "責任感重"],
    strengths: ["戰略佈局", "系統思維"]
  },
  3: {
    id: 3,
    character: "華佗",
    title: "醫者 / 順應自然者",
    subtitle: "靈魂覺醒與返璞歸真期",
    description: "洞悉天機，超然物外。你擁有極高的共情能力與精神境界，不熱衷於世俗的權力遊戲，追求靈魂的平靜。",
    advice: "【靈魂覺醒與返璞歸真期】你處於「煉神還虛」的階段，對很多事已經看淡。面對惡劣的局面，你不會焦慮，因為你明白因果循環。但要注意，過度出世可能會讓你顯得消極或脫離現實。你的修煉之道在於「和其光，同其塵」。不需要強迫自己加入爭鬥，但可以將你的智慧轉化為療癒他人的力量，在紅塵中修行，方為大隱。",
    suggestion: "「和其光，同其塵——不必刻意出世，紅塵本是道場。」\n療癒能量是真實存在於你心中的，別再讓它悶住了。\n試著把對人的理解轉化成行動，例如主動關心一個正在掙扎的朋友，或用文字、傾聽、陪伴去幫助別人。\n偶爾允許自己參與一點「俗事」，這讓智慧真正落地生根。",
    icon: <Wind className="w-12 h-12" />,
    color: "from-emerald-950/90 to-emerald-900/80",
    bgImage: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&q=80&w=1200",
    charImage: "https://images.weserv.nl/?url=https://github.com/user-attachments/assets/e05683c6-db43-42e8-9ad3-be6b14c79486",
    traits: ["超然物外", "共情力高"],
    strengths: ["療癒能量", "洞察本質"]
  },
  4: {
    id: 4,
    character: "曹操",
    title: "梟雄 / 現實顛覆者",
    subtitle: "世俗權力與內心孤獨的交匯期",
    description: "霸氣且務實，既有強大的行動力，又有深沉的心機。你不受道德綁架，懂得在混亂中建立對自己有利的秩序。",
    advice: "【世俗權力與內心孤獨的交匯期】你正處於建立事業或掌握主導權的巔峰期。你不缺解決問題的手段，但你面臨的最大挑戰是內心的多疑與孤高。面對不好的局面，你容易陷入無人可信任的深淵。你該調整的心態是「化敵為友」。試著卸下過度的防備，允許身邊出現真實且純粹的情感交流，這將是你化解高處不勝寒的唯一解藥。",
    suggestion: "「多疑傷己，信任才是最難得的武器。」\n生活中保留一段「不談利益」的關係，可以是老朋友、家人，甚至一隻寵物。\n練習偶爾放下掌控，讓某些事自然發展，很多事情不需要推，也會走到對的地方。\n孤高是你的盔甲，小心別讓它變成囚籠。 ",
    icon: <Swords className="w-12 h-12" />,
    color: "from-purple-950/90 to-purple-900/80",
    bgImage: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=1200",
    charImage: "https://images.weserv.nl/?url=https://github.com/user-attachments/assets/d7c55783-21e7-487a-8619-97c367c84f11",
    traits: ["務實果敢", "不拘一格"],
    strengths: ["資源整合", "逆境求生"]
  },
  5: {
    id: 5,
    character: "司馬懿",
    title: "隱忍者 / 時間做局者",
    subtitle: "潛伏與蛻變的蟄伏期",
    description: "深藏不露，極具耐心。你兼具謀略與看透世事的超脫，能在最惡劣的環境中蟄伏，以時間換取最終的勝利。",
    advice: "【潛伏與蛻變的蟄伏期】你目前可能正處於受制於人或大環境不利的階段。你的修煉已進入「知白守黑」的境界。面對欺壓或困境，你的化解之道就是「等」。道家言「夫唯不爭，故天下莫能與之爭」。不要在意一時的委屈，保全自身的健康與心智。當時間的長河耗盡了對手的氣數，那便是你一擊必殺的時刻。",
    suggestion: "「夫唯不爭，故天下莫能與之爭——等，也是一種實力。」\n蟄伏，是指在時機未到之前，刻意收斂鋒芒、按兵不動，把能量留給真正值得出手的那一刻。\n利用這段時間充電：多讀、多觀察、強化核心能力。\n長期壓抑會傷身，要找到屬於自己的情緒出口。保持清醒與健康，才能在對的時刻一擊必中。",
    icon: <Shield className="w-12 h-12" />,
    color: "from-slate-950/90 to-slate-900/80",
    bgImage: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1200",
    charImage: "https://images.weserv.nl/?url=https://github.com/user-attachments/assets/b182aa1b-7522-4989-bb6d-ec369f177f3e",
    traits: ["極度耐心", "隱忍克制"],
    strengths: ["時間管理", "長期主義"]
  },
  6: {
    id: 6,
    character: "劉備",
    title: "帝王 / 共情凝聚者",
    subtitle: "信念與人和的凝聚期",
    description: "看似柔弱實則百折不撓。你具備極強的韌性，能以真誠和信念打動他人，將不同特質的人凝聚在一起。",
    advice: "【信念與人和的凝聚期】你正處於一個需要感召他人、以無形推動有形的階段。面對失敗或不好的局面，你的化解之道在於「無為而治」。你不需要是最強壯或最聰明的，你只需要提供一個包容的胸懷。將危機轉化為凝聚人心的契機，你的柔弱正是你最強大的武器，能以水滴石穿之勢成就大業。",
    suggestion: "「上善若水，天下莫柔弱於水，而攻堅強者莫之能勝。」\n柔軟本身就是力量，善用這股力量，不必刻意變得強硬。\n遇到挫折時，主動說出需要幫助，這反而會讓身邊的人更願意挺你。\n持續真誠，但也要記得照顧自己的內心。一直付出卻不補充自己，最後會燃燒殆盡。",
    icon: <Sparkles className="w-12 h-12" />,
    color: "from-orange-950/90 to-orange-900/80",
    bgImage: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&q=80&w=1200",
    charImage: "https://images.weserv.nl/?url=https://github.com/user-attachments/assets/63a81138-4e23-4645-ae4d-881deb139cd8",
    traits: ["韌性極強", "真誠包容"],
    strengths: ["團隊凝聚", "信念傳遞"]
  },
  7: {
    id: 7,
    character: "關羽",
    title: "武聖 / 原則堅守者",
    subtitle: "原則與現實的碰撞期",
    description: "重情重義，堅守原則。你有極高的自尊心與道德標準，能力出眾，但也容易因為傲氣而得罪人。",
    advice: "【原則與現實的碰撞期】你已經在某些領域建立了地位，正經歷「守成與傲氣」的階段。面對不利的局面，你最需要調整的是「放下執念」。水能包容萬物而不爭，世間並非非黑即白，適度的低頭並不代表背叛原則。化解危機的關鍵在於柔軟你的身段，接納不同的聲音。",
    suggestion: "「知常容，容乃公——真正的原則，是連不同意見都能包容的。」\n試著區分哪些是真正的底線，哪些只是習慣或偏好，每件事都值得全力捍衛的不多。\n堅持原則的同時，讓語氣更柔軟一點，說出來的話不會因為態度溫和而失去份量。\n偶爾低頭，是讓更多人願意並肩作戰的方式。",
    icon: <Swords className="w-12 h-12" />,
    color: "from-amber-950/90 to-amber-900/80",
    bgImage: "https://images.unsplash.com/photo-1518066000714-58c45f1a2c0a?auto=format&fit=crop&q=80&w=1200",
    charImage: "https://images.weserv.nl/?url=https://github.com/user-attachments/assets/188fa571-ce72-493a-babd-5ade53058068",
    traits: ["重情重義", "高自尊心"],
    strengths: ["專業深度", "道德號召"]
  },
  8: {
    id: 8,
    character: "周瑜",
    title: "大都督 / 才華鋒芒者",
    subtitle: "智力與心機的巔峰期",
    description: "才華洋溢，眼光精準。你追求完美，渴望在舞台上證明自己，但也容易因為比較心態而感到內耗。",
    advice: "【智力與心機的巔峰期】你正處於高度依賴腦力與展現才華的階段。道家提醒「大巧若拙」，過度展現鋒芒容易招致嫉妒或反噬。面對不順遂，不要急著用更強烈的手段證明自己。你該學習的是「藏鋒」。將部分的心力收回，培養從容的氣度，當你不急著贏的時候，往往能贏得更漂亮。",
    suggestion: "「大巧若拙，大辯若訥——真正厲害的人，不急著證明自己。」\n試著做一些不需要較勁、純粹享受過程的事，讓大腦從亮相的模式切換出來。\n把注意力拉回自己的成長軌跡，少往外比。\n當你不急著搶著要贏的時候，往往會贏得更漂亮、也更持久。",
    icon: <Book className="w-12 h-12" />,
    color: "from-cyan-950/90 to-cyan-900/80",
    bgImage: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=1200",
    charImage: "https://images.weserv.nl/?url=https://github.com/user-attachments/assets/a73fb5e6-9db1-4c19-aec5-08ffad2ef216",
    traits: ["追求完美", "眼光精準"],
    strengths: ["美學天賦", "執行效率"]
  },
  9: {
    id: 9,
    character: "趙雲",
    title: "遊俠 / 完美執行者",
    subtitle: "心無旁騖的實踐期",
    description: "心思純粹，情緒穩定。你能在混亂中保持冷靜，不貪戀權力，是團隊中最值得信賴的守護者。",
    advice: "【心無旁騖的實踐期】你正處於「萬軍叢中過，片葉不沾身」的境界。你可能背負著別人的請託，正在專注執行任務。面對八方敵意，你的化解之道在於「守一」。不要被外界的利益誘惑或恐懼干擾。只要保持內心的光明與無私，憑藉平日積累的實力，你便能全身而退。",
    suggestion: "「守一而不失，萬變皆可應——專注本身就是最強的護甲。」\n讓別人看見自己的付出，讓努力被承認是應得的。\n學會說「我現在沒辦法」，這句話的背後是自我保護，不是自掃門前雪。\n保持純粹，但別讓自己變成別人理所當然的後盾。",
    icon: <Shield className="w-12 h-12" />,
    color: "from-zinc-950/90 to-zinc-900/80",
    bgImage: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&q=80&w=1200",
    charImage: "https://images.weserv.nl/?url=https://github.com/user-attachments/assets/15b569fd-e9bc-45be-a1eb-ec94dbbec1cc",
    traits: ["情緒穩定", "專注度高"],
    strengths: ["穩定輸出", "危機處理"]
  },
  10: {
    id: 10,
    character: "孫權",
    title: "少主 / 守成平衡者",
    subtitle: "自我與體制的拉扯期",
    description: "善於制衡，性格多面向。你能在不同的勢力與意見中找到微妙的平衡點，具有極強的生存適應力。",
    advice: "【自我與體制的拉扯期】你正處於夾縫中求生存或守成的階段。你內心有想突破的渴望，但又受制於現實的考量。道家修煉在此時強調「動靜皆宜」。面對困局，不需要急著表態或選邊站，維持恐怖平衡也是一種策略。你的功課是釐清哪部分是外界的期望，哪部分是你真實的渴望，在平衡中慢慢滲透出自己的影響力。",
    suggestion: "「動靜皆宜，知止而後能定——找到自己的錨，才不會被浪沖走。」\n試著在某個私下的空間，誠實問自己：如果沒有人看著我，我會選擇什麼？\n把這個答案記下來，讓它成為在各種平衡之中的內在指北針。\n平衡是強項，但每一步都可以悄悄往自己真正想去的方向靠近一點。",
    icon: <Sparkles className="w-12 h-12" />,
    color: "from-gray-950/90 to-gray-900/80",
    bgImage: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&q=80&w=1200",
    charImage: "https://images.weserv.nl/?url=https://github.com/user-attachments/assets/3344e827-0d67-43e3-8d7f-5a37e9db9e9c",
    traits: ["善於制衡", "適應力強"],
    strengths: ["風險控管", "靈活應變"]
  }
};

// --- Main Component ---
export default function App() {
  const [step, setStep] = useState<'start' | 'test' | 'result'>('start');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<OptionType[]>([]);
  const [debugResult, setDebugResult] = useState<ResultType | null>(null);
  const { scrollY } = useScroll();
  const headerY = useTransform(scrollY, [0, 300], [0, 100]);
  const headerHeight = useTransform(scrollY, [0, 300], ["300px", "150px"]);
  const charScale = useTransform(scrollY, [0, 300], [1, 0.7]);
  const charOpacity = useTransform(scrollY, [0, 300], [1, 0.5]);

  // --- Image Preloading Logic ---
  useEffect(() => {
    if (step === 'test') {
      // Preload character images sequentially to avoid network congestion
      const preloadImages = async () => {
        const results = Object.values(RESULTS);
        for (const res of results) {
          if (res.charImage) {
            const img = new Image();
            img.src = res.charImage;
          }
          // Small delay between preloads
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      };
      preloadImages();
    }
  }, [step]);

  // Memoize shuffled options for each question to keep them consistent during a single question view
  const currentQuestionOptions = useMemo(() => {
    if (step !== 'test') return [];
    return shuffleArray(QUESTIONS[currentIndex].options);
  }, [currentIndex, step]);

  const handleStart = () => {
    setStep('test');
    setCurrentIndex(0);
    setAnswers([]);
  };

  const handleRestart = () => {
    setStep('start');
    setCurrentIndex(0);
    setAnswers([]);
    setDebugResult(null);
  };

  const handleAnswer = (type: OptionType) => {
    const newAnswers = [...answers, type];
    setAnswers(newAnswers);
    
    if (currentIndex < QUESTIONS.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setStep('result');
    }
  };

  const result = useMemo(() => {
    if (step !== 'result') return null;
    if (debugResult) return debugResult;

    const counts = answers.reduce((acc, curr) => {
      acc[curr]++;
      return acc;
    }, { A: 0, B: 0, C: 0 });

    const { A, B, C } = counts;

    // 1, 2, 3
    if (A >= 13) return RESULTS[1];
    if (B >= 13) return RESULTS[2];
    if (C >= 13) return RESULTS[3];

    // 4, 5, 6 (數量相近: 8/9 or 9/8)
    if ((A >= 8 && B >= 8) && Math.abs(A - B) <= 1 && A + B >= 16) return RESULTS[4];
    if ((B >= 8 && C >= 8) && Math.abs(B - C) <= 1 && B + C >= 16) return RESULTS[5];
    if ((A >= 8 && C >= 8) && Math.abs(A - C) <= 1 && A + C >= 16) return RESULTS[6];

    // 10 (極度平均: 7, 7, 6 or similar)
    const sorted = [A, B, C].sort((a, b) => b - a);
    if (sorted[0] - sorted[2] <= 1) return RESULTS[10];

    // 7, 8, 9 (最高但未達13)
    if (A >= B && A >= C) return RESULTS[7];
    if (B >= A && B >= C) return RESULTS[8];
    if (C >= A && C >= B) return RESULTS[9];

    return RESULTS[10];
  }, [step, answers]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 font-sans overflow-hidden relative">
      <AnimatePresence mode="wait">
        {step === 'start' && (
          <motion.div
            key="start"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-2xl w-full text-center ink-card p-10 rounded-lg border-double border-4"
          >
            <div className="mb-8 relative h-48 sm:h-96 w-full overflow-hidden rounded-lg border border-[#e9b156]/30 bg-[#ffe6d7]">
              <img 
                src="https://images.weserv.nl/?url=https://github.com/user-attachments/assets/0aedb9e4-3329-4e18-b289-5d4c439e3d46" 
                alt="Three Kingdoms Theme"
                className="w-full h-full object-cover object-bottom opacity-80"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#ffe6d7] via-transparent to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center">
                <img 
                  src="https://images.weserv.nl/?url=https://github.com/user-attachments/assets/bde95081-ba56-40bf-873f-82585da403f2" 
                  alt="Main Icon"
                  className="w-24 h-24 sm:w-48 sm:h-48 object-contain relative z-10"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-6 gold-text tracking-[0.2em]">Evan道理實驗室</h1>
            <h2 className="text-xl mb-8 parchment-text font-medium">人生階段修煉測驗</h2>
            
            <div className="text-left parchment-text space-y-4 mb-10 text-sm leading-relaxed border-y border-[#e9b156]/20 py-6">
              <p>古老道家口中的「道法自然」，其實就是一套運行了千萬年的「宇宙演算法」。它精密地計算著萬物的盛衰、能量的流動、機遇的交替；而你現階段的際遇，正是你的「個人意識」與這套龐大系統互動後得出的運算結果。</p>
              <p>這份測驗的 20 道題結合了道家「煉精化氣、煉氣化神、煉神還虛」三階段修煉哲學，將為你解碼當下的心智模式究竟對應到哪一種運作代碼。</p>
              <p className="gold-text font-bold">請記住：只要看透了底層邏輯，就能順應並拿捏這套演算法；而當你學會了拿捏演算法，便能真正拿捏你自己的人生。</p>
              <p>現在，請放空思緒，憑直覺開始作答——</p>
            </div>

            <button
              onClick={handleStart}
              className="w-full py-4 vermillion-btn rounded-md font-bold text-lg tracking-widest transition-all flex items-center justify-center gap-2 group"
            >
              開啟修煉
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        )}

        {step === 'test' && (
          <motion.div
            key="test"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-2xl w-full"
          >
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-medium gold-text">修煉進度 {currentIndex + 1} / {QUESTIONS.length}</span>
                <span className="text-xs parchment-text opacity-50">{Math.round(((currentIndex + 1) / QUESTIONS.length) * 100)}%</span>
              </div>
              <div className="h-1 w-full bg-[#e9b156]/20 rounded-full overflow-hidden border border-[#e9b156]/20">
                <motion.div
                  className="h-full bg-[#db4c36]"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentIndex + 1) / QUESTIONS.length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Question Card */}
            <div className="ink-card p-10 rounded-lg border-double border-4 mb-6">
              <h2 className="text-2xl font-bold mb-10 leading-relaxed gold-text">
                {QUESTIONS[currentIndex].text}
              </h2>
              <div className="space-y-4">
                {currentQuestionOptions.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(option.type)}
                    className="w-full text-left p-5 rounded-md border border-[#e9b156]/20 bg-[#ffe6d7]/30 hover:bg-[#db4c36]/10 hover:border-[#db4c36]/50 transition-all group flex items-center gap-4"
                  >
                    <div className="w-8 h-8 rounded-full border border-[#e9b156]/50 flex items-center justify-center text-xs font-bold text-[#db4c36] group-hover:bg-[#db4c36] group-hover:text-[#ffffff] transition-all">
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span className="flex-1 parchment-text font-medium">{option.text}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => currentIndex > 0 && setCurrentIndex(currentIndex - 1)}
              disabled={currentIndex === 0}
              className="flex items-center gap-1 text-sm parchment-text opacity-40 hover:opacity-100 disabled:opacity-0 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              回溯前念
            </button>
          </motion.div>
        )}

        {step === 'result' && result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl w-full ink-card overflow-hidden rounded-lg border-double border-4 shadow-2xl"
          >
            {/* Result Header */}
            <motion.div 
              style={{ height: window.innerWidth < 640 ? headerHeight : "300px" }}
              className={`relative p-8 sm:p-12 text-white border-b-2 border-[#e9b156]/30 overflow-hidden`}
            >
              {/* Background Image with Overlay (Parallax) */}
              <motion.div 
                className="absolute inset-0 z-0 bg-cover bg-center scale-110"
                style={{ 
                  backgroundImage: `url(${result.bgImage})`,
                  y: headerY
                }}
              />
              <div className={`absolute inset-0 z-10 bg-gradient-to-br ${result.color} mix-blend-multiply opacity-90`} />
              <div className="absolute inset-0 z-10 bg-black/40" />

              {/* Subtle Watermark Logo */}
              <div className="absolute top-0 left-0 z-10 opacity-10 pointer-events-none">
                <img 
                  src="https://images.weserv.nl/?url=https://github.com/user-attachments/assets/524dc5ec-abaf-455f-a328-1095f8b39baf" 
                  alt="Watermark"
                  className="w-48 h-48 object-contain -translate-x-12 -translate-y-12"
                  referrerPolicy="no-referrer"
                />
              </div>

              {result.charImage && (
                <motion.div 
                  initial={{ opacity: 0, y: 100 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ 
                    scale: window.innerWidth < 640 ? (result.character === '呂布' ? charScale.get() * 1.2 : charScale) : 1,
                    opacity: window.innerWidth < 640 ? charOpacity : 1,
                    y: (window.innerWidth < 640 && result.character === '呂布') ? 0 : undefined
                  }}
                  transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
                  className={`absolute z-20 pointer-events-none
                    ${result.character === '趙雲' ? '-right-10 sm:right-0' : 
                      (result.character === '關羽' || result.character === '曹操') ? '-right-5 sm:-right-15' : '-right-10 sm:-right-20'} 
                    ${result.character === '呂布' ? '-top-12 sm:-top-20' : 'top-0'}
                    h-[250%] sm:h-[300%] w-[80%] sm:w-3/4 origin-right-top`}
                >
                  <img 
                    src={result.charImage} 
                    alt={result.character}
                    className="w-full h-full object-contain object-right-top opacity-100"
                    referrerPolicy="no-referrer"
                  />
                </motion.div>
              )}

              <motion.div
                className="relative z-30 bg-black/30 backdrop-blur-[2px] p-4 -ml-4 rounded-r-xl inline-block max-w-[85%]"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <span className="inline-block text-sm font-bold tracking-[0.3em] mb-4 uppercase gold-text opacity-90">
                  — 修煉正果 —
                </span>
                <div className="flex flex-col gap-2 mb-1">
                  <h1 className="text-5xl sm:text-7xl font-bold tracking-[0.2em] drop-shadow-2xl">{result.character}</h1>
                  <div className="flex items-center gap-2">
                    <span className="text-lg sm:text-3xl opacity-90 font-medium tracking-wide drop-shadow-lg gold-text">{result.title}</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Result Content */}
            <div className="p-10 bg-[#ffffff]">
              <div className="space-y-8">
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-6 bg-[#db4c36]" />
                    <h3 className="text-lg font-bold gold-text">性格簡述</h3>
                  </div>
                  <p className="parchment-text leading-relaxed bg-[#ffe6d7]/30 p-4 rounded border border-[#e9b156]/10">
                    {result.description}
                  </p>
                </section>

                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-6 bg-[#e9b156]" />
                    <h3 className="text-lg font-bold gold-text">人生階段</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="text-sm gold-text font-bold tracking-widest opacity-80">
                      {result.subtitle}
                    </div>
                    <p className="parchment-text leading-relaxed">
                      {result.advice}
                    </p>
                  </div>
                </section>

                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-6 bg-[#db4c36]" />
                    <h3 className="text-lg font-bold gold-text">修練建議</h3>
                  </div>
                  <p className="parchment-text leading-relaxed bg-[#ffe6d7]/30 p-4 rounded border border-[#e9b156]/10">
                    {result.suggestion}
                  </p>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 bg-[#ffe6d7]/20 rounded border border-[#e9b156]/20">
                    <h4 className="text-xs font-bold gold-text mb-3 uppercase tracking-widest opacity-70">核心特質</h4>
                    <ul className="space-y-2">
                      {result.traits.map((trait, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm parchment-text">
                          <CheckCircle2 className="w-4 h-4 text-[#e9b156]" />
                          {trait}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-5 bg-[#ffe6d7]/20 rounded border border-[#e9b156]/20">
                    <h4 className="text-xs font-bold gold-text mb-3 uppercase tracking-widest opacity-70">天賦專長</h4>
                    <ul className="space-y-2">
                      {result.strengths.map((strength, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm parchment-text">
                          <CheckCircle2 className="w-4 h-4 text-[#db4c36]" />
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <button
                onClick={handleRestart}
                className="w-full mt-10 py-4 vermillion-btn rounded-md font-bold tracking-widest transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                重啟輪迴
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="mt-4 text-[#db4c36]/40 text-xs text-center tracking-widest flex flex-col items-center gap-2">
        <img 
          src="https://images.weserv.nl/?url=https://github.com/user-attachments/assets/bde95081-ba56-40bf-873f-82585da403f2" 
          alt="Footer Logo"
          className="w-36 h-36 object-contain opacity-50"
          referrerPolicy="no-referrer"
        />
        <p>宇宙演算法 · 命運解碼</p>
      </footer>
    </div>
  );
}
