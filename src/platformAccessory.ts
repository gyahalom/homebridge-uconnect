import { PlatformAccessory, CharacteristicValue } from 'homebridge';
import { UconnectHomebridgePlatform } from './platform';
import * as uapi from './uconnectApi';

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

  constructor(
    private readonly platform: UconnectHomebridgePlatform,
    private readonly accessory: PlatformAccessory,
  ) {

    this.lockCurrentState = this.platform.Characteristic.LockCurrentState.UNKNOWN;
    this.lockTargetState = this.platform.Characteristic.LockTargetState.UNSECURED;
    this.unlockCurrentState = this.platform.Characteristic.LockCurrentState.UNKNOWN;
    this.unlockTargetState = this.platform.Characteristic.LockTargetState.SECURED;

    // set accessory information
    const model = accessory.context.vehicle.year + ' ' + accessory.context.vehicle.model;
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, accessory.context.vehicle.make)
      .setCharacteristic(this.platform.Characteristic.Model, model)
      .setCharacteristic(this.platform.Characteristic.SerialNumber, accessory.context.vehicle.vin);

    // you can create multiple services for each accessory
    const lockService = this.accessory.getService('Lock Service') ||
      this.accessory.addService(this.platform.Service.LockMechanism, 'Lock Service',
        accessory.context.vehicle.vin + '-lock');

    const unlockService = this.accessory.getService('Unlock Service') ||
      this.accessory.addService(this.platform.Service.LockMechanism, 'Unlock Service',
        accessory.context.vehicle.vin + '-unlock');

    // set the service name, this is what is displayed as the default name on the Home app
    // in this example we are using the name we stored in the `accessory.context` in the `discoverDevices` method.
    lockService.setCharacteristic(this.platform.Characteristic.Name,
      accessory.context.vehicle.title + ' Lock');
    unlockService.setCharacteristic(this.platform.Characteristic.Name,
      accessory.context.vehicle.title + ' Unlock');

    // each service must implement at-minimum the "required characteristics" for the given service type
    // see https://developers.homebridge.io/#/service/Lightbulb
    lockService.getCharacteristic(this.platform.Characteristic.LockCurrentState)
      .onGet(this.handleLockCurrentStateGet.bind(this));
    unlockService.getCharacteristic(this.platform.Characteristic.LockCurrentState)
      .onGet(this.handleUnlockCurrentStateGet.bind(this));

    lockService.getCharacteristic(this.platform.Characteristic.LockTargetState)
      .onGet(this.handleLockTargetStateGet.bind(this))
      .onSet(this.handleLockTargetStateSet.bind(this));

    unlockService.getCharacteristic(this.platform.Characteristic.LockTargetState)
      .onGet(this.handleUnlockTargetStateGet.bind(this))
      .onSet(this.handleUnlockTargetStateSet.bind(this));

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
        // TODO: Check no error in service ID
        // Wait for service request to complete within timeout
        this.lockCurrentState = this.platform.Characteristic.LockCurrentState.UNKNOWN;
        const status = await uapi.checkLockStatus(this.accessory.context.vehicle.vin, requestId,
          this.platform.timeout);
        this.platform.log.debug('Request status ended with:', status);
        if (status === 'SUCCESS') {
          this.lockCurrentState = this.platform.Characteristic.LockCurrentState.SECURED;
          setTimeout(() => {
            this.lockTargetState = this.platform.Characteristic.LockTargetState.UNSECURED;
            this.lockCurrentState = this.platform.Characteristic.LockCurrentState.UNKNOWN;
          }, 3000);
        } else {
          this.lockTargetState = this.platform.Characteristic.LockTargetState.UNSECURED;
        }
      } else {
        this.platform.log.warn('Failed to authenticate');
      }
    }
  }

  async handleUnlockTargetStateSet(value: CharacteristicValue) {
    this.platform.log.debug('Triggered SET UnlockTargetState:', value);
    if (value === this.platform.Characteristic.LockTargetState.UNSECURED) {
      this.unlockTargetState = value;
      if (await uapi.auth(this.platform.username, this.platform.password)) {
        const requestId = await uapi.unlockCar(this.accessory.context.vehicle.vin, this.platform.pin);
        // TODO: Check no error in service ID
        // Wait for service request to complete within timeout
        this.unlockCurrentState = this.platform.Characteristic.LockCurrentState.UNKNOWN;
        const status = await uapi.checkUnlockStatus(this.accessory.context.vehicle.vin, requestId,
          this.platform.timeout);
        this.platform.log.debug('Request status ended with:', status);
        if (status === 'SUCCESS') {
          this.unlockCurrentState = this.platform.Characteristic.LockCurrentState.UNSECURED;
          setTimeout(() => {
            this.unlockTargetState = this.platform.Characteristic.LockTargetState.SECURED;
            this.unlockCurrentState = this.platform.Characteristic.LockCurrentState.UNKNOWN;
          }, 3000);
        } else {
          this.unlockTargetState = this.platform.Characteristic.LockTargetState.SECURED;
        }
      } else {
        this.platform.log.warn('Failed to authenticate');
      }
    }
  }

}
