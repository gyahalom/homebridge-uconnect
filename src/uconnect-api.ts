import axios from 'axios';
import qs from 'qs';

function setAxiosDefaults() : void {
  axios.defaults.headers.common['content-type'] = 'application/x-www-form-urlencoded';
  axios.defaults.maxRedirects = 0;
  axios.defaults.validateStatus = function (status) {
    return status >= 200 && status <= 302;
  };
}

function createCookie(cookies: object) : string {
  return Object.entries(cookies).reduce((pv, cv) => pv + cv[0] + '=' + cv[1] + ';', '');
}

function updateCookies(newCookies: Array<string> | undefined) : void {
  const cookies = Object.assign(parseCookies(String(axios.defaults.headers.common['Cookie'])), parseCookies(newCookies));
  axios.defaults.headers.common['Cookie'] = createCookie(cookies);
}

function parseCookies(cookies: string | Array<string> | undefined) : object {
  const cookieObj = {};
  const pat = /(?<key>\w+)=(?<value>[^;]+);?/;
  if (typeof(cookies) === 'string') {
    cookies = cookies.split(';');
  }
  for (const cookie of cookies || []) {
    const r = cookie.match(pat);
    if (r?.groups) {
      cookieObj[r.groups.key] = r.groups.value;
    }
  }
  return cookieObj;
}

export async function auth(username: string, password: string) : Promise<boolean> {
  try {
    axios.defaults.baseURL = 'https://www.mopar.com';
    const data1 = {
      'USER': username,
      'PASSWORD': password,
      'TARGET': 'https://sso.extra.chrysler.com/cgi-bin/moparproderedirect.cgi?env=prd&PartnerSpId=B2CAEM&IdpAdapterId=' +
      'B2CSM&appID=MOPUSEN_C&TargetResource=https://www.mopar.com/sign-in',
    };
    const url1 = 'https://sso.extra.chrysler.com/siteminderagent/forms/b2clogin.fcc';
    const res1 = await axios.post(url1, qs.stringify(data1));

    const data2 = {
      'PartnerSpId': 'B2CAEM',
      'IdpAdapterId': 'B2CSM',
      'ACSIdx': '',
      'TargetResource': 'https://www.mopar.com/sign-in',
    };
    const url2 = 'https://federation.chrysler.com/idp/startSSO.ping?' + qs.stringify(data2);
    const cookies = parseCookies(res1.headers['set-cookie']);
    const res2 = await axios.get(url2, {headers: {Cookie: createCookie(cookies)}});
    const pat = /name="SAMLResponse" value="([^"]+)"/;
    const saml = res2.data.match(pat)[1];

    const data3 = {
      'RelayState': 'https://www.mopar.com/sign-in',
      'SAMLResponse': saml,
    };
    const res3 = await axios.post('sign-in', qs.stringify(data3));
    updateCookies(res3.headers['set-cookie']);

    const res4 = await axios.get('en-us/loading.html');
    updateCookies(res4.headers['set-cookie']);

    const res5 = await axios.get('sign-in');
    updateCookies(res5.headers['set-cookie']);

    const res6 = await axios.get('chrysler/en-us/my-vehicle/dashboard.html');
    updateCookies(res6.headers['set-cookie']);

    axios.defaults.baseURL = 'https://www.mopar.com/moparsvc';

    return true;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return false;
    } else {
      return false;
    }
  }
}

export async function getUserData() : Promise<object | string> {
  try {
    const { data, headers } = await axios.get('user/getProfile');
    updateCookies(headers['set-cookie']);

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return error.message;
    } else {
      return 'An unexpected error occurred';
    }
  }
}

interface VehicleInfo {
  uuid: string;
  vin: string;
  title: string;
  make: string;
  model: string;
  year: string;
}

export async function getVehicleData() : Promise<Array<VehicleInfo> | string> {
  try {
    const { data, headers } = await axios.get('user/getVehicles');
    updateCookies(headers['set-cookie']);

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return error.message;
    } else {
      return 'An unexpected error occurred';
    }
  }
}

export async function getVehicleHealthReport(uuid: string) : Promise<object | string> {
  try {
    const url = 'getVHR?' + qs.stringify({uuid: uuid});
    const { data, headers } = await axios.get(url);
    updateCookies(headers['set-cookie']);

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return error.message;
    } else {
      return 'An unexpected error occurred';
    }
  }
}

export async function getToken() : Promise<string> {
  try {
    const { data } = await axios.get('token');

    return data.token;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return error.message;
    } else {
      return 'An unexpected error occurred';
    }
  }
}

export type RequestStatus = 'INITIATED' | 'SUCCESS' | 'FAILURE';
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Lock Mechanism
export type LockAction = 'LOCK' | 'UNLOCK';

async function lockCarFunc(vin: string, pin: string, action: LockAction) : Promise<string> {
  try {
    const reqData = {
      'action': action,
      'vin': vin,
      'pin': pin,
    };
    const token = await getToken();
    const { data, headers } = await axios.post('connect/lock', qs.stringify(reqData),
      {headers: {'MOPAR-CSRF-SALT': token}});
    updateCookies(headers['set-cookie']);

    return data.serviceRequestId;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return error.message;
    } else {
      return 'An unexpected error occurred';
    }
  }
}

export function lockCar(vin: string, pin: string) : Promise<string> {
  return lockCarFunc(vin, pin, 'LOCK');
}

export function unlockCar(vin: string, pin: string) : Promise<string> {
  return lockCarFunc(vin, pin, 'UNLOCK');
}

async function requestLockStatus(vin: string, requestId: string, action: LockAction) : Promise<string> {
  try {
    const reqData = {
      'action': action,
      'vin': vin,
      'remoteServiceRequestID': requestId,
    };
    const url = 'connect/lock?' + qs.stringify(reqData);
    const { data, headers } = await axios.get(url);
    updateCookies(headers['set-cookie']);

    return data.status;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return error.message;
    } else {
      return 'An unexpected error occurred';
    }
  }
}

async function checkLockingStatus(vin: string, requestId: string, action: LockAction, timeout: number) : Promise<string> {
  let status = '';
  do {
    timeout--;
    // Wait for 1s
    await delay(1000);
    status = await requestLockStatus(vin, requestId, action);
  } while (status === 'INITIATED' && timeout > 0);
  return status;
}

export function checkLockStatus(vin: string, requestId: string, timeout: number) : Promise<string> {
  return checkLockingStatus(vin, requestId, 'LOCK', timeout);
}

export function checkUnlockStatus(vin: string, requestId: string, timeout: number) : Promise<string> {
  return checkLockingStatus(vin, requestId, 'UNLOCK', timeout);
}

// Engine Start Mechanism
export type EngineAction = 'START' | 'STOP';

async function engineFunc(vin: string, pin: string, action: EngineAction) : Promise<string> {
  try {
    const reqData = {
      'action': action,
      'vin': vin,
      'pin': pin,
    };
    const token = await getToken();
    const { data, headers } = await axios.post('connect/engine', qs.stringify(reqData),
      {headers: {'MOPAR-CSRF-SALT': token}});
    updateCookies(headers['set-cookie']);

    return data.serviceRequestId;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return error.message;
    } else {
      return 'An unexpected error occurred';
    }
  }
}

export function startCar(vin: string, pin: string) : Promise<string> {
  return engineFunc(vin, pin, 'START');
}

export function stopCar(vin: string, pin: string) : Promise<string> {
  return engineFunc(vin, pin, 'STOP');
}

async function requestEngineStatus(vin: string, requestId: string, action: EngineAction) : Promise<string> {
  try {
    const reqData = {
      'action': action,
      'vin': vin,
      'remoteServiceRequestID': requestId,
    };
    const url = 'connect/engine?' + qs.stringify(reqData);
    const { data, headers } = await axios.get(url);
    updateCookies(headers['set-cookie']);

    return data.status;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return error.message;
    } else {
      return 'An unexpected error occurred';
    }
  }
}

async function checkEngineStatus(vin: string, requestId: string, action: EngineAction, timeout: number) : Promise<string> {
  let status = '';
  do {
    timeout--;
    // Wait for 1s
    await delay(1000);
    status = await requestEngineStatus(vin, requestId, action);
  } while (status === 'INITIATED' && timeout > 0);
  return status;
}

export function checkStartStatus(vin: string, requestId: string, timeout: number) : Promise<string> {
  return checkEngineStatus(vin, requestId, 'START', timeout);
}

export function checkStopStatus(vin: string, requestId: string, timeout: number) : Promise<string> {
  return checkEngineStatus(vin, requestId, 'STOP', timeout);
}

export function isValidRequestId(requestId: string) : boolean {
  const hex = '[a-fA-F0-9]';
  const pat = new RegExp(`${hex}{8}-${hex}{4}-${hex}{4}-${hex}{4}-${hex}{12}`);
  return pat.test(requestId);
}

setAxiosDefaults();