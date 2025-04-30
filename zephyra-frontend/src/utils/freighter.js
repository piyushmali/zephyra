import { isConnected, getPublicKey, signTransaction } from '@stellar/freighter-api';

const freighterUtils = {
  isFreighterInstalled: () => {
    return typeof window !== 'undefined' && window.freighter !== undefined;
  },

  checkFreighterConnection: async () => {
    try {
      return await isConnected();
    } catch (error) {
      console.error('Error checking Freighter connection:', error);
      return false;
    }
  },

  getFreighterAccountDetails: async () => {
    try {
      const publicKey = await getPublicKey();
      return { publicKey };
    } catch (error) {
      console.error('Error getting Freighter account details:', error);
      throw error;
    }
  },

  connectWallet: async () => {
    try {
      // Get the public key using the imported function
      const publicKey = await getPublicKey();
      return publicKey;
    } catch (error) {
      console.error('Error connecting to Freighter:', error);
      throw error;
    }
  },

  signTransaction: async (xdr) => {
    try {
      return await signTransaction(xdr);
    } catch (error) {
      console.error('Error signing transaction:', error);
      throw error;
    }
  }
};

export default freighterUtils;