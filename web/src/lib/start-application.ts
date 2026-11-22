type ApplicationModule = { mountApp: (onCommit: () => void) => void }

export async function startApplication(load: () => Promise<ApplicationModule>) {
  const startup = document.getElementById('app-startup')
  const status = document.getElementById('app-startup-status')
  const retry = document.getElementById('app-startup-retry')
  let chinese = false
  try {
    const language = localStorage.getItem('beaver-language')
    chinese =
      language === 'zh-CN' ||
      (!language && /^zh(?:$|-CN|-SG|-Hans)/i.test(navigator.language))
    const theme = localStorage.getItem('theme')
    if (theme === 'light' || theme === 'dark')
      startup?.setAttribute('data-theme', theme)
  } catch {
    /* Storage is optional. */
  }
  if (status) status.textContent = chinese ? '正在加载…' : 'Loading…'
  try {
    const app = await load()
    app.mountApp(() => {
      startup?.remove()
      document.getElementById('app-startup-style')?.remove()
    })
  } catch {
    startup?.setAttribute('data-failed', '')
    if (status)
      status.textContent = chinese
        ? '无法加载应用，请重试。'
        : 'Could not load the app. Please try again.'
    if (retry) {
      retry.hidden = false
      const button = retry.querySelector('button') ?? retry
      const label = button.querySelector('.astryx-text') ?? button
      label.textContent = chinese ? '重新加载' : 'Reload'
      button.onclick = () => location.reload()
    }
  }
}
