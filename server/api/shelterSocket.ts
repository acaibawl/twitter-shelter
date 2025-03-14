import type { Peer, Message } from 'crossws';

// 接続ユーザー(peer)単位にRealtime APIのセッションを管理
const connections: { [id: string]: Peer } = {};
// ユーザー名を保存する辞書
const userNames: { [id: string]: string } = {};

// 現在の参加者リストを全ユーザーに送信する関数
const broadcastUserList = () => {
  const users = Object.values(userNames);
  const userCount = users.length;
  const userListMessage = JSON.stringify({
    type: 'userList',
    userCount,
    users
  });
  
  Object.values(connections).forEach((peer) => {
    peer.send(userListMessage);
  });
};

export default defineWebSocketHandler({
  open(peer: Peer) {
    connections[peer.id] = peer;
  },
  message(peer: Peer, message: Message) {
    const messageData = JSON.parse(message.toString());
    const { type = '', name = 'system', body = '' } = messageData;
    // ハートビートメッセージの場合
    if (type === 'heartbeat') {
      return;
    }
    // 入室メッセージの場合
    if (type === 'enter') {
      // ユーザー名を直接取得
      const userName = messageData.userName || '';
      if (userName) {
        userNames[peer.id] = userName;
        // 参加者リストを更新して全員に送信
        broadcastUserList();
        
        // 入室メッセージを全員に送信
        Object.values(connections).forEach((p) => {
          p.send(JSON.stringify({ 
            type: 'chatMessage',
            name: 'system', 
            body: `${userName} さんが入室しました` 
          }));
        });
      }
      return;
    }
    
    // 通常のメッセージを全てのユーザーにブロードキャスト
    if (type === 'chatMessage') {
      Object.values(connections).forEach((p) => {
        p.send(JSON.stringify({ 
          type: 'chatMessage',
          name, 
          body 
        }));
      });
    }
  },
  close(peer: Peer) {
    if (connections[peer.id]) {
      // ユーザーが退出したことを通知
      if (userNames[peer.id]) {
        const userName = userNames[peer.id];
        Object.values(connections).forEach((p) => {
          if (p.id !== peer.id) {
            p.send(JSON.stringify({ 
              type: 'chatMessage',
              name: 'system', 
              body: `${userName} さんが退出しました` 
            }));
          }
        });
        
        // ユーザー名の記録を削除
        delete userNames[peer.id];
      }
      
      connections[peer.id].close();
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete connections[peer.id];
      
      // 参加者リストを更新して全員に送信
      broadcastUserList();
    }
  },
});
