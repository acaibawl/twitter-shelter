<script setup lang="ts">
const runtimeConfig = useRuntimeConfig();
const ogImageUrl = `${runtimeConfig.public.baseUrl}/twitter-shelter.webp`;
useHead({
  meta: [
    { hid: 'description', name: 'description', content: 'Twitter避難所です。' },
    { hid: 'og:title', property: 'og:title', content: 'Twitter避難所' },
    { hid: 'og:description', property: 'og:description', content: 'Twitter避難所です。' },
    { hid: 'og:url', property: 'og:url', content: ogImageUrl },
    { hid: 'og:image', property: 'og:image', content: ogImageUrl },
    { hid: 'twitter:card', name: 'twitter:card', content: 'summary_large_image' },
    { hid: 'twitter:title', name: 'twitter:title', content: `Twitter避難所` },
    { hid: 'twitter:description', name: 'twitter:description', content: 'Twitter避難所です。' },
    { hid: 'twitter:image', name: 'twitter:image', content: ogImageUrl },
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
    <TwitterShelter />
  </div>
</template>

<style>
body {
  font-family: 'Noto Sans JP', Meiryo, sans-serif;
}
</style>
