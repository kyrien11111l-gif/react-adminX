import { createRoot } from 'react-dom/client'
import 'nprogress/nprogress.css'
import 'simplebar-react/dist/simplebar.min.css'
import { App } from '@/app'
import '@/styles/global.css'
import { showStartupLoading } from '@/utils/startupLoading'

showStartupLoading()
createRoot(document.getElementById('root')!).render(<App />)
