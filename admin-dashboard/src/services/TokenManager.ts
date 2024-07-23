class TokenManager {
    private static instance: TokenManager;
    private tokens: any = null;
  
    private constructor() {
      this.tokens = JSON.parse(localStorage.getItem('tokens') || '{}');
    }
  
    public static getInstance(): TokenManager {
      if (!TokenManager.instance) {
        TokenManager.instance = new TokenManager();
      }
      return TokenManager.instance;
    }
  
    public getTokens() {
      return this.tokens;
    }
  
    public setTokens(newTokens: any) {
      this.tokens = newTokens;
      localStorage.setItem('tokens', JSON.stringify(newTokens));
    }
  }
  
  export default TokenManager.getInstance();
  