// Keep Render backend awake by self-pinging every 10 minutes
const PING_INTERVAL = 10 * 60 * 1000; // 10 minutes

export const startKeepAlive = (baseUrl: string) => {
  if (process.env.NODE_ENV !== 'production') return;
  
  console.log('🔔 Keep-alive started');
  
  setInterval(async () => {
    try {
      const res = await fetch(`${baseUrl}/api/health`);
      console.log(`🔔 Keep-alive ping: ${res.status}`);
    } catch (err) {
      console.log('🔔 Keep-alive failed (expected if cold starting)');
    }
  }, PING_INTERVAL);
};
