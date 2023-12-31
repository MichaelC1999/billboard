import { defaultSnapOrigin } from '../config';
import { GetSnapsResponse, Snap } from '../types';

/**
 * Get the installed snaps in MetaMask.
 *
 * @returns The snaps installed in MetaMask.
 */
export const getSnaps = async (): Promise<GetSnapsResponse> => {
  return (await window.ethereum.request({
    method: 'wallet_getSnaps',
  })) as unknown as GetSnapsResponse;
};

/**
 * Connect a snap to MetaMask.
 *
 * @param snapId - The ID of the snap.
 * @param params - The params to pass with the snap to connect.
 */
export const connectSnap = async (
  snapId: string = defaultSnapOrigin,
  address: string,
  params: Record<'version' | string, unknown> = {},
): Promise<{ [x: string]: any }> => {
  const snaps = await window.ethereum.request({
    method: 'wallet_requestSnaps',
    params: {
      'npm:billboard-snap': {},
    }
  });
  console.log(snaps, 'snaps')
  return snaps || {}
};

export const enableSnap = async (): Promise<any> => {

}

/**
 * Get the snap from MetaMask.
 *
 * @param version - The version of the snap to install (optional).
 * @returns The snap object returned by the extension.
 */
export const getSnap = async (version?: string): Promise<Snap | undefined> => {
  try {
    const snaps = await getSnaps();
    return Object.values(snaps).find((snap) => {
      return snap.id === defaultSnapOrigin && (!version || snap.version === version)
    }
    );
  } catch (e) {
    console.log('Failed to obtain installed snap', e);
    return undefined;
  }
};

export const isLocalSnap = (snapId: string) => snapId.startsWith('local:');
