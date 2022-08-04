import { PlatformAccessory, CharacteristicValue } from 'homebridge';
import { UconnectHomebridgePlatform } from './uconnect-platform';
import * as uapi from './uconnect-api';

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class UconnectPlatformAccessory {
  private lockCurrentState: CharacteristicValue;
  private lockTargetState: CharacteristicValue;
  private unlockCurrentState: CharacteristicValue;
  private unlockTargetState: CharacteristicValue;
  private startEngineState: boolean;
  private stopEngineState: boolean;

  constructor(
    private readonly platform: UconnectHomebridgePlatform,
    private readonly accessory: PlatformAccessory,
  ) {

    this.lockCurrentState = this.platform.Characteristic.LockCurrentState.UNKNOWN;
    this.lockTargetState = this.platform.Characteristic.LockTargetState.UNSECURED;
    this.unlockCurrentState = this.platform.Characteristic.LockCurrentState.UNKNOWN;
    this.unlockTargetState = this.platform.Characteristic.LockTargetState.SECURED;
    this.startEngineState = false;
    this.stopEngineState = true;

    // set accessory information
    const model = accessory.context.vehicle.year + ' ' + accessory.context.vehicle.model;
    const name = accessory.context.vehicle.title || 'Car';
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, accessory.context.vehicle.make)
      .setCharacteristic(this.platform.Characteristic.Model, model)
      .setCharacteristic(this.platform.Characteristic.SerialNumber, accessory.context.vehicle.vin);

    // you can create multiple services for each accessory
    const lockService = this.accessory.getService('Lock Service') ||
      this.accessory.addService(this.platform.Service.LockMechanism, 'Lock Service',
        accessory.context.vehicle.vin + '-lock');
    // set the service name, this is what is displayed as the default name on the Home app
    // in this example we are using the name we stored in the `accessory.context` in the `discoverDevices` method.
    lockService.setCharacteristic(this.platform.Characteristic.Name, name + ' Lock');

    // each service must implement at-minimum the "required characteristics" for the given service type
    // see https://developers.homebridge.io/#/service/Lightbulb
    lockService.getCharacteristic(this.platform.Characteristic.LockCurrentState)
      .onGet(this.handleLockCurrentStateGet.bind(this));

    lockService.getCharacteristic(this.platform.Characteristic.LockTargetState)
      .onGet(this.handleLockTargetStateGet.bind(this))
      .onSet(this.handleLockTargetStateSet.bind(this));

    const unlockService = this.accessory.getService('Unlock Service') ||
      this.accessory.addService(this.platform.Service.LockMechanism, 'Unlock Service',
        accessory.context.vehicle.vin + '-unlock');

    unlockService.setCharacteristic(this.platform.Characteristic.Name, name + ' Unlock');

    unlockService.getCharacteristic(this.platform.Characteristic.LockCurrentState)
      .onGet(this.handleUnlockCurrentStateGet.bind(this));

    unlockService.getCharacteristic(this.platform.Characteristic.LockTargetState)
      .onGet(this.handleUnlockTargetStateGet.bind(this))
      .onSet(this.handleUnlockTargetStateSet.bind(this));

    const engineStartService = this.accessory.getService('Start Service') ||
      this.accessory.addService(this.platform.Service.Switch, 'Start Service',
        accessory.context.vehicle.vin + '-start');

    engineStartService.setCharacteristic(this.platform.Characteristic.Name, name + ' Start Engine');

    engineStartService.getCharacteristic(this.platform.Characteristic.On)
      .onGet(this.handleStartEngineGet.bind(this))
      .onSet(this.handleStartEngineSet.bind(this));

    const engineStopService = this.accessory.getService('Stop Service') ||
      this.accessory.addService(this.platform.Service.Switch, 'Stop Service',
        accessory.context.vehicle.vin + '-stop');

    engineStopService.setCharacteristic(this.platform.Characteristic.Name, name + ' Stop Engine');

    engineStopService.getCharacteristic(this.platform.Characteristic.On)
      .onGet(this.handleStopEngineGet.bind(this))
      .onSet(this.handleStopEngineSet.bind(this));

  }

  /**
   * Handle requests to get the current value of the "Lock Current State" characteristic
   */
  handleLockCurrentStateGet() {
    this.platform.log.debug('Triggered GET LockCurrentState');

    return this.lockCurrentState;
  }

  handleUnlockCurrentStateGet() {
    this.platform.log.debug('Triggered GET UnlockCurrentState');

    return this.unlockCurrentState;
  }

  /**
   * Handle requests to get the current value of the "Lock Target State" characteristic
   */
  handleLockTargetStateGet() {
    this.platform.log.debug('Triggered GET LockTargetState');

    return this.lockTargetState;
  }

  handleUnlockTargetStateGet() {
    this.platform.log.debug('Triggered GET UnlockTargetState');

    return this.unlockTargetState;
  }

  /**
   * Handle requests to set the "Lock Target State" characteristic
   */
  async handleLockTargetStateSet(value: CharacteristicValue) {
    this.platform.log.debug('Triggered SET LockTargetState:', value);
    if (value === this.platform.Characteristic.LockTargetState.SECURED) {
      this.lockTargetState = value;
      if (await uapi.auth(this.platform.username, this.platform.password)) {
        const requestId = await uapi.lockCar(this.accessory.context.vehicle.vin, this.platform.pin);
        if (!uapi.isValidRequestId(requestId)) {
          this.platform.log.error('Lock failed to submit request:', requestId);
        }
        this.lockCurrentState = this.platform.Characteristic.LockCurrentState.UNKNOWN;
        // Wait for service request to complete within timeout
        const status = await uapi.checkLockStatus(this.accessory.context.vehicle.vin, requestId,
          this.platform.timeout);
        this.platform.log.debug('Lock request status ended with:', status);
        if (status === 'SUCCESS') {
          this.platform.log.info('Lock command was successful');
          this.lockCurrentState = this.platform.Characteristic.LockCurrentState.SECURED;
          setTimeout(() => {
            this.lockTargetState = this.platform.Characteristic.LockTargetState.UNSECURED;
            this.lockCurrentState = this.platform.Characteristic.LockCurrentState.UNKNOWN;
          }, 3000);
        } else {
          this.platform.log.error('Lock command failed');
          this.lockTargetState = this.platform.Characteristic.LockTargetState.UNSECURED;
        }
      } else {
        this.platform.log.error('Failed to authenticate');
      }
    }
  }

  async handleUnlockTargetStateSet(value: CharacteristicValue) {
    this.platform.log.debug('Triggered SET UnlockTargetState:', value);
    if (value === this.platform.Characteristic.LockTargetState.UNSECURED) {
      this.unlockTargetState = value;
      if (await uapi.auth(this.platform.username, this.platform.password)) {
        const requestId = await uapi.unlockCar(this.accessory.context.vehicle.vin, this.platform.pin);
        if (!uapi.isValidRequestId(requestId)) {
          this.platform.log.error('Unlock failed to submit request:', requestId);
        }
        this.unlockCurrentState = this.platform.Characteristic.LockCurrentState.UNKNOWN;
        // Wait for service request to complete within timeout
        const status = await uapi.checkUnlockStatus(this.accessory.context.vehicle.vin, requestId,
          this.platform.timeout);
        this.platform.log.debug('Unlock request status ended with:', status);
        if (status === 'SUCCESS') {
          this.platform.log.info('Unlock command was successful');
          this.unlockCurrentState = this.platform.Characteristic.LockCurrentState.UNSECURED;
          setTimeout(() => {
            this.unlockTargetState = this.platform.Characteristic.LockTargetState.SECURED;
            this.unlockCurrentState = this.platform.Characteristic.LockCurrentState.UNKNOWN;
          }, 3000);
        } else {
          this.platform.log.error('Unlock command failed');
          this.unlockTargetState = this.platform.Characteristic.LockTargetState.SECURED;
        }
      } else {
        this.platform.log.error('Failed to authenticate');
      }
    }
  }

  handleStartEngineGet() {
    this.platform.log.debug('Triggered GET Start Engine');

    return this.startEngineState;
  }

  async handleStartEngineSet(value: CharacteristicValue) {
    this.platform.log.debug('Triggered SET Start Engine:', value);
    value = value as boolean;
    if (value) {
      this.startEngineState = value;
      if (await uapi.auth(this.platform.username, this.platform.password)) {
        const requestId = await uapi.startCar(this.accessory.context.vehicle.vin, this.platform.pin);
        if (!uapi.isValidRequestId(requestId)) {
          this.platform.log.error('Engine Start failed to submit request:', requestId);
        }
        // Wait for service request to complete within timeout
        const status = await uapi.checkStartStatus(this.accessory.context.vehicle.vin, requestId,
          this.platform.timeout);
        this.platform.log.debug('Engine Start request status ended with:', status);
        if (status === 'SUCCESS') {
          this.platform.log.info('Engine Start command was successful');
          setTimeout(() => {
            this.startEngineState = !value;
          }, 3000);
        } else {
          this.platform.log.error('Engine start command failed');
          this.startEngineState = !value;
        }
      } else {
        this.platform.log.error('Failed to authenticate');
      }
    }
  }

  handleStopEngineGet() {
    this.platform.log.debug('Triggered GET Stop Engine');

    return this.stopEngineState;
  }

  async handleStopEngineSet(value: CharacteristicValue) {
    this.platform.log.debug('Triggered SET Stop Engine:', value);
    value = value as boolean;
    if (!value) {
      this.stopEngineState = value;
      if (await uapi.auth(this.platform.username, this.platform.password)) {
        const requestId = await uapi.stopCar(this.accessory.context.vehicle.vin, this.platform.pin);
        if (!uapi.isValidRequestId(requestId)) {
          this.platform.log.error('Engine Stop failed to submit request:', requestId);
        }
        // Wait for service request to complete within timeout
        const status = await uapi.checkStopStatus(this.accessory.context.vehicle.vin, requestId,
          this.platform.timeout);
        this.platform.log.debug('Engine Stop request status ended with:', status);
        if (status === 'SUCCESS') {
          this.platform.log.info('Engine Stop command was successful');
          setTimeout(() => {
            this.stopEngineState = !value;
          }, 3000);
        } else {
          this.platform.log.error('Engine stop command failed');
          this.stopEngineState = !value;
        }
      } else {
        this.platform.log.error('Failed to authenticate');
      }
    }
  }

}
