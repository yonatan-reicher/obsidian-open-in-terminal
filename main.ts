import { App, Editor, FileSystemAdapter, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import * as child_process from 'child_process';

// Remember to rename these classes and interfaces!

interface OpenInTerminalSettings {
	command: string;
}

const DEFAULT_SETTINGS: OpenInTerminalSettings = {
	command: 'cmd'
}

export default class OpenInTerminal extends Plugin {
	settings: OpenInTerminalSettings;

	openTerminal() {
		if (!(this.app.vault.adapter instanceof FileSystemAdapter)) {
			return;
		}

		const path = this.app.vault.adapter.getBasePath();
		// TODO: Add a callback to handle failure
		child_process.exec(this.settings.command, {
			cwd: path
		});
	}

	async onload() {
		await this.loadSettings();

		// This creates an icon in the left ribbon.
		this.addRibbonIcon('run-command', 'Open Terminal', (_evt: MouseEvent) => {
			new Notice('Opening terminal...');
			this.openTerminal();
		});

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-terminal',
			name: 'Open terminal in vault folder',
			callback: () => {
				this.openTerminal();
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new OpenInTerminalSettingTab(this.app, this));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class OpenInTerminalSettingTab extends PluginSettingTab {
	plugin: OpenInTerminal;

	constructor(app: App, plugin: OpenInTerminal) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Command')
			.setDesc('This is the shell command that is used to open the terminal. Executed with cwd as the vault folder.')
			.addText(text => text
				.setPlaceholder('...')
				.setValue(this.plugin.settings.command)
				.onChange(async value => {
					this.plugin.settings.command = value;
					await this.plugin.saveSettings();
				}));
	}
}
