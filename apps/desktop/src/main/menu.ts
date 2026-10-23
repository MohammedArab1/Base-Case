import { app, dialog, Menu, shell } from 'electron'
import type { MenuItemConstructorOptions } from 'electron'

const repositoryUrl = 'https://github.com/MohammedArab1/Base-Case'

async function showAbout(): Promise<void> {
  await dialog.showMessageBox({
    type: 'info',
    title: 'About Base Case',
    message: `Base Case ${app.getVersion()}`,
    detail: [
      'Local-first coding interview and system design practice.',
      '',
      `Electron ${process.versions.electron}`,
      `Chromium ${process.versions.chrome}`,
      `Node ${process.versions.node}`,
      '',
      'Application code: MIT',
      'Bundled content: CC BY-SA 4.0',
    ].join('\n'),
  })
}

async function showLicenses(): Promise<void> {
  await dialog.showMessageBox({
    type: 'info',
    title: 'Licenses',
    message: 'Base Case licensing',
    detail: [
      'Application code is licensed under the MIT License (LICENSE).',
      'Bundled problem and design content is licensed under CC BY-SA 4.0 (CONTENT_LICENSE).',
      'Third-party packages retain their own licenses; attribution notes are in NOTICE.',
      '',
      `Project: ${repositoryUrl}`,
    ].join('\n'),
  })
}

function helpItems(): MenuItemConstructorOptions[] {
  return [
    {
      label: 'Documentation',
      click: () => {
        void shell.openExternal(repositoryUrl)
      },
    },
    {
      label: 'Open data folder',
      click: () => {
        void shell.openPath(app.getPath('userData'))
      },
    },
    { type: 'separator' },
    { label: 'Licenses', click: () => void showLicenses() },
    ...(process.platform === 'darwin'
      ? []
      : [{ label: 'About Base Case', click: () => void showAbout() }]),
  ]
}

export function installApplicationMenu(): void {
  const template: MenuItemConstructorOptions[] = []

  if (process.platform === 'darwin') {
    template.push({
      label: app.name,
      submenu: [
        { label: `About ${app.name}`, click: () => void showAbout() },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    })
  }

  template.push(
    {
      label: 'File',
      submenu: [{ role: process.platform === 'darwin' ? 'close' : 'quit' }],
    },
    { role: 'editMenu' },
    { role: 'viewMenu' },
    { role: 'windowMenu' },
    {
      role: 'help',
      submenu: helpItems(),
    },
  )

  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}
