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

// チャットウィンドウの参照
const chatWindowRef = ref<HTMLElement | null>(null);

// 自動スクロールするかどうかのフラグ
const shouldAutoScroll = ref(true);

// スクロールイベントハンドラ
const handleScroll = () => {
  if (!chatWindowRef.value) return;
  
  const { scrollTop, scrollHeight, clientHeight } = chatWindowRef.value;
  // 下端から20px以内ならば自動スクロールを有効にする
  shouldAutoScroll.value = scrollHeight - scrollTop - clientHeight < 20;
};

// スクロールを一番下に移動する関数
const scrollToBottom = () => {
  if (chatWindowRef.value && shouldAutoScroll.value) {
    nextTick(() => {
      chatWindowRef.value!.scrollTop = chatWindowRef.value!.scrollHeight;
    });
  }
};

// 強制的にスクロールを一番下に移動する関数
const forceScrollToBottom = () => {
  if (chatWindowRef.value) {
    nextTick(() => {
      chatWindowRef.value!.scrollTop = chatWindowRef.value!.scrollHeight;
      shouldAutoScroll.value = true;
    });
  }
};

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
    
    // メッセージが追加されたらスクロールを一番下に移動
    scrollToBottom();
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
  
  // 自分のメッセージを送信した後は強制的にスクロールを一番下に移動
  forceScrollToBottom();
};

// コンポーネントがマウントされたときにスクロールを一番下に移動
onMounted(() => {
  forceScrollToBottom();
});

onUnmounted(() => {
  close();
});
</script>

<template>
  <div class="chat-container">
    <h1>Twitter避難所</h1>
    <!-- 未ログインの場合は、名前入力フォームを表示 -->
    <div v-if="!isLoggedIn" class="login-container">
      <form @submit.prevent="joinChat">
        <input v-model="userName" placeholder="あなたの名前を入力してください">
        <button type="submit">チャットに参加</button>
      </form>
    </div>

    <!-- ログインした場合は、チャット画面を表示 -->
    <div v-else class="chat-content">
      <p class="welcome-message">ようこそ、{{ userName }} さん！Twitterが早く直るといいですね</p>
      
      <!-- 参加者リスト表示エリア -->
      <div class="user-list-container">
        <h3>参加者 ({{ userCount }}人)</h3>
        <div class="user-list">
          <span v-for="(user, index) in userList" :key="index" class="user-badge">
            {{ user }}
          </span>
        </div>
      </div>
      
      <div ref="chatWindowRef" class="chat-window" @scroll="handleScroll">
        <div v-for="(msg, index) in messages" :key="index" class="message" :class="{ 'system-message': msg.name === 'system', 'user-message': msg.name === userName }">
          <strong>{{ msg.name }}</strong>: {{ msg.body }}
        </div>
        <div v-if="!shouldAutoScroll" class="scroll-to-bottom" @click="forceScrollToBottom">
          <span>↓ 新しいメッセージ</span>
        </div>
      </div>
      <form @submit.prevent="sendMessage" class="message-form">
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
  width: 100%;
  box-sizing: border-box;
}

h1 {
  font-size: 1.8rem;
  margin-bottom: 1rem;
  text-align: center;
}

.welcome-message {
  text-align: center;
  margin-bottom: 1rem;
  color: #1da1f2;
  font-weight: bold;
}

.login-container {
  max-width: 400px;
  margin: 2rem auto;
  padding: 1.5rem;
  border-radius: 8px;
  background-color: #f5f8fa;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.chat-content {
  display: flex;
  flex-direction: column;
}

.chat-window {
  border: 1px solid #ccc;
  padding: 1rem;
  height: 300px;
  overflow-y: auto;
  margin-bottom: 1rem;
  border-radius: 8px;
  background-color: #f9f9f9;
  position: relative;
}

.message {
  margin-bottom: 0.5rem;
  word-break: break-word;
  padding: 0.5rem;
  border-radius: 4px;
  background-color: #fff;
}

.system-message {
  background-color: #f8f9fa;
  color: #6c757d;
  font-style: italic;
}

.user-message {
  background-color: #e8f5fe;
  text-align: right;
}

.scroll-to-bottom {
  position: absolute;
  bottom: 20px;
  right: 20px;
  background-color: #1da1f2;
  color: white;
  padding: 8px 12px;
  border-radius: 20px;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  animation: bounce 1s infinite alternate;
  z-index: 10;
}

@keyframes bounce {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-5px);
  }
}

form {
  display: flex;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.message-form {
  display: flex;
  gap: 0.5rem;
}

input {
  flex: 1;
  padding: 0.5rem;
  margin-right: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ccc;
  min-width: 200px;
}

button {
  padding: 0.5rem 1rem;
  background-color: #1da1f2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #0c85d0;
}

.user-list-container {
  margin-bottom: 1rem;
  border: 1px solid #eee;
  padding: 0.5rem;
  border-radius: 4px;
  background-color: #f5f8fa;
}

.user-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.user-badge {
  background-color: #e1e8ed;
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
  font-size: 0.9rem;
  display: inline-block;
  margin-bottom: 0.25rem;
}

/* レスポンシブ対応のためのメディアクエリ */
@media (max-width: 768px) {
  .chat-container {
    padding: 0.5rem;
  }
  
  h1 {
    font-size: 1.5rem;
  }
  
  .chat-window {
    height: 250px;
    padding: 0.5rem;
  }
  
  form {
    flex-direction: column;
  }
  
  .message-form {
    flex-direction: row;
  }
  
  input {
    margin-right: 0;
    margin-bottom: 0.5rem;
    width: 100%;
    min-width: auto;
  }
  
  .message-form input {
    margin-bottom: 0;
  }
  
  button {
    width: 100%;
  }
  
  .message-form button {
    width: auto;
    min-width: 80px;
  }
  
  .scroll-to-bottom {
    bottom: 10px;
    right: 10px;
    padding: 6px 10px;
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  h1 {
    font-size: 1.2rem;
  }
  
  .user-list-container h3 {
    font-size: 1rem;
  }
  
  .user-badge {
    font-size: 0.8rem;
  }
  
  .message {
    font-size: 0.9rem;
  }
  
  .welcome-message {
    font-size: 0.9rem;
  }
}
</style>
