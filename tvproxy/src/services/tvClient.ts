import TradingView from '@mathieuc/tradingview';

class TVClientManager {
  private client: any = null;
  private connected = false;

  async getClient(): Promise<any> {
    if (this.client && this.connected) return this.client;

    const options: any = {};
    if (process.env.TV_SESSION) {
      options.token = process.env.TV_SESSION;
      options.signature = process.env.TV_SIGNATURE || '';
    }

    this.client = new TradingView.Client(options);
    this.connected = true;

    this.client.onDisconnected = () => {
      this.connected = false;
      console.log('[tvClient] Disconnected, will reconnect on next request');
    };

    return this.client;
  }

  async end() {
    if (this.client) {
      this.client.end();
      this.client = null;
      this.connected = false;
    }
  }
}

export const tvClient = new TVClientManager();
