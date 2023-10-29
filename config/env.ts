const { NODE_ENV } = process.env;

export default {
  webBaseUrl: NODE_ENV === 'development' ? '/dev/' : '/pro/',
  wsHost: NODE_ENV === 'development' ? 'ws://127.0.0.1:9502' : 'wss://message.your_domain.com',
};
