<template>
  <div class="contentBox journalPage">
    <header class="jbHead flex jb ac">
      <div class="jbHeadLeft flex ac">
        <button
          v-if="isPhone"
          type="button"
          class="jbMenu flex ac"
          aria-label="切换菜单"
          @click="toggleMenu"
        >
          <img src="/clone-assets/menu.png" class="img32" alt="" />
        </button>
        <div class="jbTitle">学习手帐</div>
      </div>
      <UserDropdown />
    </header>

    <div ref="bodyRef" class="jbBody" @scroll="onScroll">
      <!-- 顶部说明卡（背景图里的文案已擦掉，用 HTML 文本渲染） -->
      <section class="jbHero">
        <img class="jbHeroIcon" src="/clone-assets/journal/hero-icon.png" alt="" />
        <div class="jbHeroTitle">学习详情</div>
        <div class="jbHeroDesc">记录你的学习轨迹，跟踪每个句子和单词的掌握状态。</div>
      </section>

      <div class="jbTabsCard">
        <el-tabs v-model="kind" class="jbTabs" @tab-change="onKindChange">
          <el-tab-pane label="句子" name="sentence" />
          <el-tab-pane label="单词" name="word" />
        </el-tabs>
      </div>

      <div class="jbTools flex ac">
        <button
          v-for="item in STATES"
          :key="item.value"
          type="button"
          class="jbPill"
          :class="{ jbPillAct: state === item.value }"
          @click="setState(item.value)"
        >
          {{ item.label }}
        </button>

        <el-input
          v-model="keyword"
          class="jbSearch"
          placeholder="搜索英文内容或中文释义"
          :prefix-icon="Search"
          clearable
          @input="onSearchInput"
        />

        <el-dropdown trigger="click" @command="onSortChange">
          <button type="button" class="jbSort flex ac hand">
            <span class="jbSortLabel">{{ sortLabel }}</span>
            <span class="jbSortDir">↓</span>
            <el-icon class="jbSortCaret"><ArrowDown /></el-icon>
          </button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="1">创建日期</el-dropdown-item>
              <el-dropdown-item command="2">错误次数</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <el-button class="jbClear" :icon="Delete" @click="clearAll">全部清除</el-button>
      </div>

      <div class="jbListCard">
        <el-skeleton v-if="loading" animated>
          <template #template>
            <div v-for="n in 4" :key="n" class="jbRow flex ac">
              <el-skeleton-item variant="image" class="jbSkeletonBadge" />
              <div class="jbInfo flex col">
                <el-skeleton-item variant="text" class="jbSkeletonTitle" />
                <el-skeleton-item variant="text" class="jbSkeletonDesc" />
              </div>
              <el-skeleton-item variant="button" class="jbSkeletonBtn" />
            </div>
          </template>
        </el-skeleton>

        <template v-else-if="items.length">
          <div v-for="item in items" :key="item.itemId" class="jbRow flex ac">
            <span class="jbBadge flex ac jc" :class="item.itemType === WORD ? 'jbBadgeWord' : 'jbBadgeSentence'">
              <span v-if="item.itemType === WORD" class="jbBadgeAa">Aa</span>
              <img v-else class="jbBadgeQuote" src="/clone-assets/journal/icon-sentence.png" alt="" />
            </span>

            <div class="jbInfo flex col">
              <div class="jbName line1">{{ item.content }}</div>
              <div class="jbDesc line1">{{ item.contentCn }}</div>
            </div>

            <el-button
              class="jbBtn"
              :class="state === 'strange' ? 'jbBtnMaster' : 'jbBtnStrange'"
              :loading="actingId === item.itemId"
              @click="act(item)"
            >
              {{ state === "strange" ? "已掌握" : "不熟悉" }}
            </el-button>
          </div>

          <div v-if="loadingMore" class="jbMore">加载中…</div>
        </template>

        <div v-else class="jbEmpty flex col ac jc">
          <img class="jbEmptyImg" src="/clone-assets/collect/empty.png" alt="" />
          <div class="jbEmptyText">{{ emptyText }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { ArrowDown, Delete, Search } from "@element-plus/icons-vue";
import UserDropdown from "@/components/UserDropdown.vue";
import {
  JOURNAL_ITEM_TYPE,
  fetchJournalList,
  journalTypeOf,
  markJournalMastered,
  markJournalStrange,
  removeJournalItems,
  unwrapJournalPage,
  type JournalItem,
  type JournalState,
} from "@/api/journal";
import { getToken } from "@/api/token";
import { ensureLogin } from "@/composables/useAuth";
import { isPhone, toggleMenu } from "@/composables/useLayout";

type Kind = "sentence" | "word";

const STATES: { value: JournalState; label: string }[] = [
  { value: "strange", label: "不熟悉" },
  { value: "mastered", label: "已掌握" },
];

const WORD = JOURNAL_ITEM_TYPE.WORD;

const kind = ref<Kind>("sentence");
const state = ref<JournalState>("strange");
const sortType = ref(1);
const keyword = ref("");

const bodyRef = ref<HTMLElement>();
const items = ref<JournalItem[]>([]);
const loading = ref(true);
const loadingMore = ref(false);
const actingId = ref<string | number>("");

const pageSize = 50;
let current = 1;
let finished = false;
let requestSeq = 0;
let searchTimer: ReturnType<typeof setTimeout> | undefined;

const sortLabel = computed(() => (sortType.value === 2 ? "错误次数" : "创建日期"));

const emptyText = computed(() => {
  if (!getToken()) return "登录后可以查看你的学习手帐";
  const what = kind.value === "word" ? "单词" : "句子";
  return state.value === "mastered" ? `还没有已掌握的${what}` : `还没有不熟悉的${what}`;
});

const itemType = computed(() => (kind.value === "word" ? JOURNAL_ITEM_TYPE.WORD : JOURNAL_ITEM_TYPE.SENTENCE));

async function loadList(reset = false) {
  if (!getToken()) {
    items.value = [];
    finished = true;
    loading.value = false;
    loadingMore.value = false;
    return;
  }
  if (!reset && (loading.value || loadingMore.value || finished)) return;
  const seq = ++requestSeq;
  if (reset) {
    current = 1;
    finished = false;
    loading.value = true;
    items.value = [];
  } else {
    loadingMore.value = true;
  }
  try {
    const result = unwrapJournalPage(
      await fetchJournalList({
        state: state.value,
        itemType: itemType.value,
        keyword: keyword.value.trim(),
        sortType: sortType.value,
        page: current,
        limit: pageSize,
      }),
    );
    if (seq !== requestSeq) return;
    items.value = reset ? result.items : [...items.value, ...result.items];
    if (result.items.length < pageSize || (result.total != null && items.value.length >= result.total)) {
      finished = true;
    }
    current += 1;
  } catch {
    if (reset) items.value = [];
    finished = true;
  } finally {
    if (seq === requestSeq) {
      loading.value = false;
      loadingMore.value = false;
      ensureFill();
    }
  }
}

function onScroll() {
  const el = bodyRef.value;
  if (!el || loading.value || loadingMore.value || finished) return;
  if (el.scrollTop + el.clientHeight >= el.scrollHeight - 120) {
    void loadList();
  }
}

function ensureFill() {
  const el = bodyRef.value;
  if (!el || loading.value || loadingMore.value || finished) return;
  if (el.scrollHeight <= el.clientHeight) void loadList();
}

function onKindChange(name: string | number) {
  kind.value = name as Kind;
  void loadList(true);
}

function setState(next: JournalState) {
  if (state.value === next) return;
  state.value = next;
  void loadList(true);
}

function onSearchInput() {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    void loadList(true);
  }, 300);
}

function onSortChange(command: string | number) {
  const next = Number(command) === 2 ? 2 : 1;
  if (sortType.value === next) return;
  sortType.value = next;
  void loadList(true);
}

/** 列表右侧按钮：不熟悉 -> 标记已掌握；已掌握 -> 标记不熟悉（标记后从当前列表移除） */
async function act(item: JournalItem) {
  if (actingId.value) return;
  actingId.value = item.itemId;
  try {
    if (state.value === "strange") {
      await markJournalMastered(item.itemId);
      ElMessage.success("已标记为已掌握");
    } else {
      await markJournalStrange(item.itemId);
      ElMessage.success("已标记为不熟悉");
    }
    items.value = items.value.filter((row) => String(row.itemId) !== String(item.itemId));
  } catch {
    /* http 层已提示 */
  } finally {
    actingId.value = "";
  }
}

/** 全部清除：清空当前「内容类型 + 状态」这一份列表 */
async function clearAll() {
  if (!items.value.length) {
    ElMessage.info("当前列表已经是空的");
    return;
  }
  const tip = state.value === "mastered" ? "确定要清除全部已掌握的内容吗？" : "确定要清除全部不熟悉的内容吗？";
  try {
    await ElMessageBox.confirm(tip, "提示", {
      confirmButtonText: "确定清除",
      cancelButtonText: "取消",
      type: "warning",
    });
  } catch {
    return;
  }
  try {
    await removeJournalItems(
      journalTypeOf(state.value),
      items.value.map((row) => row.itemId),
    );
    ElMessage.success("已清除");
    void loadList(true);
  } catch {
    /* http 层已提示 */
  }
}

async function boot() {
  if (!getToken()) {
    items.value = [];
    loading.value = false;
    await ensureLogin();
    if (!getToken()) return;
  }
  await loadList(true);
}

onMounted(() => {
  void boot();
});
</script>
