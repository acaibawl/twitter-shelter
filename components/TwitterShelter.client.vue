<script setup lang="ts">
import { useWebSocket } from '@vueuse/core';

// WebSocket の URL を動的に作成（HTTPSなら wss://、HTTPなら ws://）
const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
const socketUrl = `${protocol}://${window.location.host}/api/shelterSocket`;

// useWebSocket で WebSocket 接続を確立
const { status, data, send, open, close } = useWebSocket(socketUrl, {
  autoReconnect: {
    retries: 3,
    delay: 5000,
    onFailed() {
      alert('Failed to connect WebSocket after 3 retries');
    },
  },
  heartbeat: {
    message: JSON.stringify({ type: 'heartbeat', name: 'system', body: 'ping' }),
    interval: 1000,
    pongTimeout: 10000,
    responseMessage: JSON.stringify({ type: 'heartbeat', name: 'system', body: 'pong' }),
  },
  immediate: false,
  autoConnect: false,
  onConnected: () => {
    send(JSON.stringify({ 
      type: 'enter',
      userName: userName.value
    }));
  },
});

// 利用者の名前を格納する変数
const userName = ref('');
const isLoggedIn = ref(false);

// 受信したメッセージをリアクティブな配列として管理
const messages: {
  name: string;
  body: string;
}[] = reactive([]);

// 参加者リストを管理
const userCount = ref(0);
const userList = ref<string[]>([]);

// メッセージを受信したときの処理
watch(data, (newValue) => {
  const messageData = JSON.parse(newValue);
  
  // 参加者リストの更新メッセージの場合
  if (messageData.type === 'userList') {
    userCount.value = messageData.userCount;
    userList.value = messageData.users;
    return;
  }
  
  // 通常のチャットメッセージの場合
  if (messageData.type === 'chatMessage') {
    const { name = 'system', body = '' } = messageData;
    messages.push({ name, body });
    return;
  }
});

// 新しいメッセージの入力内容
const newMessage = ref('');

// チャット参加時の処理：名前が入力されていればチャットに参加（実際の参加処理は不要）
const joinChat = () => {
  if (!userName.value.trim()) {
    alert('名前を入力してください。');
    return;
  }
  // 参加後は、名前入力フォームは非表示になり、チャット画面が表示されます
  isLoggedIn.value = true;
  open();
};

// メッセージ送信時の処理：利用者名とメッセージ内容を JSON 化して送信
const sendMessage = () => {
  if (!newMessage.value.trim() || status.value !== 'OPEN') return;
  const payload = JSON.stringify({
    type: 'chatMessage',
    name: userName.value,
    body: newMessage.value,
  });
  send(payload);
  newMessage.value = '';
};

onUnmounted(() => {
  close();
});
</script>

<template>
  <div class="chat-container">
    <h1>Twitter避難所</h1>
    <!-- 未ログインの場合は、名前入力フォームを表示 -->
    <div v-if="!isLoggedIn">
      <form @submit.prevent="joinChat">
        <input v-model="userName" placeholder="あなたの名前を入力してください">
        <button type="submit">チャットに参加</button>
      </form>
    </div>

    <!-- ログインした場合は、チャット画面を表示 -->
    <div v-else>
      <p>ようこそ、{{ userName }} さん！Twitterが早く直るといいですね</p>
      
      <!-- 参加者リスト表示エリア -->
      <div class="user-list-container">
        <h3>参加者 ({{ userCount }}人)</h3>
        <div class="user-list">
          <span v-for="(user, index) in userList" :key="index" class="user-badge">
            {{ user }}
          </span>
        </div>
      </div>
      
      <div class="chat-window">
        <div v-for="(msg, index) in messages" :key="index" class="message">
          <strong>{{ msg.name }}</strong>: {{ msg.body }}
        </div>
      </div>
      <form @submit.prevent="sendMessage">
        <input v-model="newMessage" placeholder="メッセージを入力...">
        <button type="submit">送信</button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.chat-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}
.chat-window {
  border: 1px solid #ccc;
  padding: 1rem;
  height: 300px;
  overflow-y: auto;
  margin-bottom: 1rem;
}
.message {
  margin-bottom: 0.5rem;
}
form {
  display: flex;
  margin-bottom: 1rem;
}
input {
  flex: 1;
  padding: 0.5rem;
  margin-right: 0.5rem;
}
button {
  padding: 0.5rem 1rem;
}
.user-list-container {
  margin-bottom: 1rem;
  border: 1px solid #eee;
  padding: 0.5rem;
  border-radius: 4px;
}
.user-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.user-badge {
  background-color: #f0f0f0;
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
  font-size: 0.9rem;
}
</style>
