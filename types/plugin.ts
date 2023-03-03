import { SemVer } from 'semver';

export abstract class PluginSpec {
  name: string;
  description: string;
  version: string;
  settings: PluginSettingsDiscriptor[];
  dependencies: Record<string, string> = {};

  constructor(
    name: string,
    description: string,
    version: string,
    settings: PluginSettingsDiscriptor[],
    dependencies: Record<string, string> = {}
  ) {
    // TODO: Validate dependencies

    this.name = name;
    this.description = description;
    this.version = version;
    this.settings = settings;
  }

  /**
   * Called when the plugin is loaded into client runtime
   * This function should perform any setup required for the plugin to run
   */
  abstract start(): void;

  /**
   * Called when the plugin is unloaded from client runtime
   * This function should perform any cleanup required for the plugin to stop running
   */
  abstract stop(): void;

  saveSettings(settings: Record<string, any>): void {

  }
}


export enum PluginSettingInputType {
  Text = 'text',
  Number = 'number',
  Switch = 'switch',
  Select = 'select',
  MultiSelect = 'multi-select',
};

export interface PluginSettingsDiscriptor {
  label: string;
  storeKey: string;
  description: string;
  type: PluginSettingInputType;
  required: boolean;
  options?: {
    validator?: (value: any) => boolean;
  };
}
