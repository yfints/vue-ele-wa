<template>
  <div class="flex jc">
    <div class="keyboard-fit">
      <div class="keyboard-area">
        <div class="keyboard animate__animated animate__rotateInDownLeft">
          <div class="flex jb">
            <div v-for="n in 13" :key="`fn-${n}`" class="keyItem">
              <div class="key key1" />
            </div>
            <div class="keyItem">
              <div class="key key2" />
            </div>
          </div>
          <div class="flex jb">
            <div class="keyItem">
              <div class="key key2" />
            </div>
            <div
              v-for="key in row1"
              :key="key"
              class="keyItem"
              :data-key="key"
              @mousedown.prevent
              @click="press(key)"
            >
              <div class="key key1 keycode" :class="keyClass(key)">{{ key }}</div>
            </div>
            <div v-for="n in 3" :key="`r1e-${n}`" class="keyItem">
              <div class="key key1" />
            </div>
          </div>
          <div class="flex jb">
            <div class="keyItem">
              <div class="key key3" />
            </div>
            <div
              v-for="key in row2"
              :key="key"
              class="keyItem"
              :data-key="key"
              @mousedown.prevent
              @click="press(key)"
            >
              <div class="key key1 keycode" :class="keyClass(key)">{{ key }}</div>
            </div>
            <div v-for="n in 2" :key="`r2e-${n}`" class="keyItem">
              <div class="key key1" />
            </div>
            <div class="keyItem">
              <div class="key key3" />
            </div>
          </div>
          <div class="flex jb">
            <div class="keyItem">
              <div class="key key4" />
            </div>
            <div
              v-for="key in row3"
              :key="key"
              class="keyItem"
              :data-key="key"
              @mousedown.prevent
              @click="press(key)"
            >
              <div class="key key1 keycode" :class="keyClass(key)">{{ key }}</div>
            </div>
            <div v-for="n in 3" :key="`r3e-${n}`" class="keyItem">
              <div class="key key1" />
            </div>
            <div class="keyItem">
              <div class="key key4" />
            </div>
          </div>
          <div class="flex jb">
            <div v-for="n in 3" :key="`sp-${n}`" class="keyItem">
              <div class="key key1" />
            </div>
            <div class="keyItem keyItemSpace">
              <div class="key key5" />
            </div>
            <div v-for="n in 3" :key="`spe-${n}`" class="keyItem">
              <div class="key key1" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="gap30" />
</template>

<script setup lang="ts">
const props = defineProps<{
  nextKey: string;
  errorKey: string;
  activeKey: string;
}>();

const emit = defineEmits<{
  key: [value: string];
}>();

const row1 = ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"];
const row2 = ["A", "S", "D", "F", "G", "H", "J", "K", "L"];
const row3 = ["Z", "X", "C", "V", "B", "N", "M"];

function keyClass(key: string) {
  return {
    keyActive: props.nextKey === key || props.activeKey === key,
    keyError: props.errorKey === key,
  };
}

function press(key: string) {
  emit("key", key);
}
</script>
