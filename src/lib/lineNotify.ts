// LINE OA / LINE Notify Integration Utility
export interface LineNotifyMessage {
  type: 'NEW_ORDER' | 'LOW_STOCK' | 'SYSTEM_ALERT';
  title: string;
  message: string;
  details?: Record<string, any>;
}

export async function sendLineNotification(notifyData: LineNotifyMessage): Promise<{ success: boolean; log: string }> {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  
  let formattedText = `\n🔔 [TukShop Alert] ${notifyData.title}\n`;
  formattedText += `-------------------------\n`;
  formattedText += `${notifyData.message}\n`;
  formattedText += `⏰ เวลา: ${timestamp}\n`;

  if (notifyData.details) {
    Object.entries(notifyData.details).forEach(([key, val]) => {
      formattedText += `• ${key}: ${val}\n`;
    });
  }

  // Simulate sending to LINE OA Webhook Token
  console.log('LINE OA Notification Sent:', formattedText);

  return {
    success: true,
    log: `ส่งการแจ้งเตือนไปยัง LINE OA สำเร็จ: ${notifyData.title} (${timestamp})`
  };
}
