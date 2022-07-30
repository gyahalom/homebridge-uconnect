import { PlatformAccessory, CharacteristicValue } from 'homebridge';
import { UconnectHomebridgePlatform } from './platform';
import * as uapi from './uconnectApi';

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class UconnectPlatformAccessory {
  private lockState: CharacteristicValue;
  private unlockState: CharacteristicValue;

  constructor(
    private readonly platform: UconnectHomebridgePlatform,
    private readonly accessory: PlatformAccessory,
  ) {

    this.lockState = this.platform.Characteristic.LockCurrentState.UNKNOWN;
    this.unlockState = this.platform.Characteristic.LockCurrentState.UNKNOWN;

    // set accessory information
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Manufacturer')
      .setCharacteristic(this.platform.Characteristic.Model, 'Model')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, 'Serial');

    // you can create multiple services for each accessory
    const lockService = this.accessory.getService('Lock Service') ||
      this.accessory.addService(this.platform.Service.LockMechanism, 'Lock Service',
        accessory.context.device.vin + '-lock');

    const unlockService = this.accessory.getService('Unlock Service') ||
      this.accessory.addService(this.platform.Service.LockMechanism, 'Unlock Service',
        accessory.context.device.vin + '-unlock');

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

    return this.lockState;
  }

  handleUnlockCurrentStateGet() {
    this.platform.log.debug('Triggered GET UnlockCurrentState');

    return this.unlockState;
  }

  /**
   * Handle requests to get the current value of the "Lock Target State" characteristic
   */
  handleLockTargetStateGet() {
    this.platform.log.debug('Triggered GET LockTargetState');

    // set this to a valid value for LockTargetState
    const currentValue = this.platform.Characteristic.LockTargetState.SECURED;

    return currentValue;
  }

  handleUnlockTargetStateGet() {
    this.platform.log.debug('Triggered GET UnlockTargetState');

    // set this to a valid value for LockTargetState
    const currentValue = this.platform.Characteristic.LockTargetState.UNSECURED;

    return currentValue;
  }

  /**
   * Handle requests to set the "Lock Target State" characteristic
   */
  async handleLockTargetStateSet(value: CharacteristicValue) {
    this.platform.log.debug('Triggered SET LockTargetState:', value);
    if (value === this.platform.Characteristic.LockTargetState.SECURED) {
      if (await uapi.auth(this.platform.username, this.platform.password)) {
        this.lockState = this.platform.Characteristic.LockTargetState.UNSECURED;
        const requestId = await uapi.lockCar(this.accessory.context.vehicle.vin, this.platform.pin);
        // TODO: Check no error in service ID
        // Wait for service request to complete within timeout
        const status = await uapi.checkLockStatus(this.accessory.context.vehicle.vin, requestId,
          this.platform.timeout);
        this.platform.log.debug('Request status ended with:', status);
        if (status === 'SUCCESS') {
          this.lockState = this.platform.Characteristic.LockCurrentState.SECURED;
          setTimeout(() => {
            this.lockState = this.platform.Characteristic.LockCurrentState.UNKNOWN;
          }, 3000);
        } else {
          this.lockState = this.platform.Characteristic.LockCurrentState.UNKNOWN;
        }
      } else {
        this.platform.log.warn('Failed to authenticate');
      }
    }
  }

  async handleUnlockTargetStateSet(value: CharacteristicValue) {
    this.platform.log.debug('Triggered SET UnlockTargetState:', value);
    if (value === this.platform.Characteristic.LockTargetState.UNSECURED) {
      if (await uapi.auth(this.platform.username, this.platform.password)) {
        this.lockState = this.platform.Characteristic.LockTargetState.UNSECURED;
        const requestId = await uapi.unlockCar(this.accessory.context.vehicle.vin, this.platform.pin);
        // TODO: Check no error in service ID
        // Wait for service request to complete within timeout
        const status = await uapi.checkUnlockStatus(this.accessory.context.vehicle.vin, requestId,
          this.platform.timeout);
        this.platform.log.debug('Request status ended with:', status);
        if (status === 'SUCCESS') {
          this.unlockState = this.platform.Characteristic.LockCurrentState.UNSECURED;
          setTimeout(() => {
            this.unlockState = this.platform.Characteristic.LockCurrentState.UNKNOWN;
          }, 3000);
        } else {
          this.unlockState = this.platform.Characteristic.LockCurrentState.UNKNOWN;
        }
      } else {
        this.platform.log.warn('Failed to authenticate');
      }
    }
  }

}
