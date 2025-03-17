<script setup lang="ts">
const runtimeConfig = useRuntimeConfig();
const ogImageUrl = `${runtimeConfig.public.baseUrl}/twitter-shelter.webp`;

// ダークモード設定
const isDarkMode = ref(false);

// ローカルストレージからダークモード設定を読み込む
onMounted(() => {
  if (process.client) {
    const savedMode = localStorage.getItem('darkMode');
    isDarkMode.value = savedMode === 'true';
    applyDarkMode();
  }
});

// ダークモードを切り替える関数
const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value;
  if (process.client) {
    localStorage.setItem('darkMode', isDarkMode.value.toString());
  }
  applyDarkMode();
};

// ダークモードを適用する関数
const applyDarkMode = () => {
  if (process.client) {
    if (isDarkMode.value) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
  }
};

// メタタグの設定
useHead({
  meta: [
    { key: 'description', name: 'description', content: 'Twitter避難所です。' },
    { key: 'og:title', property: 'og:title', content: 'Twitter避難所' },
    { key: 'og:description', property: 'og:description', content: 'Twitter避難所です。' },
    { key: 'og:url', property: 'og:url', content: ogImageUrl },
    { key: 'og:image', property: 'og:image', content: ogImageUrl },
    { key: 'twitter:card', name: 'twitter:card', content: 'summary_large_image' },
    { key: 'twitter:title', name: 'twitter:title', content: `Twitter避難所` },
    { key: 'twitter:description', name: 'twitter:description', content: 'Twitter避難所です。' },
    { key: 'twitter:image', name: 'twitter:image', content: ogImageUrl },
    { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
    { charset: 'utf-8' },
  ],
  title: 'Twitter避難所',
  htmlAttrs: {
    lang: 'ja',
  },
});
</script>

<template>
  <div>
    <div class="theme-toggle">
      <button @click="toggleDarkMode" class="theme-toggle-button">
        <span v-if="isDarkMode">🌞</span>
        <span v-else>🌙</span>
      </button>
    </div>
    <TwitterShelter />
  </div>
</template>

<style>
body {
  font-family: 'Noto Sans JP', Meiryo, sans-serif;
  transition: background-color 0.3s, color 0.3s;
  margin: 0;
  padding: 0;
}

/* ライトモード（デフォルト） */
:root {
  --bg-color: #ffffff;
  --text-color: #333333;
  --border-color: #cccccc;
  --primary-color: #1da1f2;
  --primary-hover: #0c85d0;
  --chat-bg: #f9f9f9;
  --message-bg: #ffffff;
  --system-message-bg: #f8f9fa;
  --system-message-color: #6c757d;
  --user-message-bg: #e8f5fe;
  --user-badge-bg: #e1e8ed;
  --container-bg: #f5f8fa;
  --shadow-color: rgba(0, 0, 0, 0.1);
}

/* ダークモード */
.dark-mode {
  --bg-color: #15202b;
  --text-color: #e1e8ed;
  --border-color: #38444d;
  --primary-color: #1da1f2;
  --primary-hover: #1a91da;
  --chat-bg: #192734;
  --message-bg: #22303c;
  --system-message-bg: #253341;
  --system-message-color: #8899a6;
  --user-message-bg: #1c5380;
  --user-badge-bg: #38444d;
  --container-bg: #192734;
  --shadow-color: rgba(0, 0, 0, 0.3);
}

body {
  background-color: var(--bg-color);
  color: var(--text-color);
}

.theme-toggle {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
}

.theme-toggle-button {
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 5px var(--shadow-color);
  transition: background-color 0.3s;
}

.theme-toggle-button:hover {
  background-color: var(--primary-hover);
}

@media (max-width: 768px) {
  .theme-toggle {
    top: 10px;
    right: 10px;
  }
  
  .theme-toggle-button {
    width: 35px;
    height: 35px;
    font-size: 18px;
  }
}
</style>
