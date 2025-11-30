'use client';

import { useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export function usePushNotifications() {
  const supabase = createClientComponentClient();

  useEffect(() => {
    registerServiceWorker();
  }, []);

  const registerServiceWorker = async () => {
    // Service Worker対応チェック
    if (!('serviceWorker' in navigator)) {
      console.log('Service Worker not supported');
      return;
    }

    if (!('PushManager' in window)) {
      console.log('Push notifications not supported');
      return;
    }

    try {
      // ログインしているかチェック
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('User not logged in');
        return;
      }

      // Service Worker登録
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('✅ Service Worker registered');

      // 通知許可状態を確認
      let permission = Notification.permission;
      
      if (permission === 'default') {
        // 許可リクエスト
        permission = await Notification.requestPermission();
      }

      if (permission !== 'granted') {
        console.log('❌ Push notification permission denied');
        return;
      }

      console.log('✅ Notification permission granted');

      // VAPID Public Key確認
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        console.error('❌ VAPID public key not configured');
        return;
      }

      // 既存のサブスクリプションを確認
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        // 新規サブスクリプション作成
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        });
        console.log('✅ New push subscription created');
      } else {
        console.log('✅ Existing push subscription found');
      }

      // サーバーに登録
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription),
      });

      if (!response.ok) {
        throw new Error('Failed to register subscription');
      }

      console.log('✅ Push notification setup complete');
    } catch (error) {
      console.error('❌ Push notification setup error:', error);
    }
  };

  // Base64文字列をUint8Arrayに変換
  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };
}
