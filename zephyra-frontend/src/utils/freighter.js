import { isConnected, getPublicKey, signTransaction } from '@stellar/freighter-api';
import mockFreighter from './mockFreighter';
import { DEMO_MODE } from './api';

const freighterUtils = {
  isFreighterInstalled: async () => {
    if (DEMO_MODE) {
      return await mockFreighter.isInstalled();
    }
    return typeof window !== 'undefined' && window.freighter !== undefined;
  },

  checkFreighterConnection: async () => {
    try {
      if (DEMO_MODE) {
        return await mockFreighter.isConnected();
      }
      return await isConnected();
    } catch (error) {
      console.error('Error checking Freighter connection:', error);
      return false;
    }
  },

  getFreighterAccountDetails: async () => {
    try {
      if (DEMO_MODE) {
        const publicKey = await mockFreighter.getPublicKey();
        return { publicKey };
      }
      const publicKey = await getPublicKey();
      return { publicKey };
    } catch (error) {
      console.error('Error getting Freighter account details:', error);
      throw error;
    }
  },

  connectWallet: async () => {
    try {
      if (DEMO_MODE) {
        // Use mock implementation
        return await mockFreighter.connect();
      }
      // Get the public key using the imported function
      const publicKey = await getPublicKey();
      return publicKey;
    } catch (error) {
      console.error('Error connecting to Freighter:', error);
      throw error;
    }
  },

  signStellarTransaction: async (xdr) => {
    try {
      if (DEMO_MODE) {
        return await mockFreighter.signStellarTransaction(xdr);
      }
      return await signTransaction(xdr);
    } catch (error) {
      console.error('Error signing transaction:', error);
      throw error;
    }
  }
};

export default freighterUtils;