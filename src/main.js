import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import './style.css'
import App from './App.vue'

// SweetAlert2 setup
import VueSweetalert2 from 'vue-sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

// FontAwesome setup
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { 
  faUser, faUsers, faCog, faHome, faChartLine, faShoppingCart, faReceipt,
  faPlus, faEdit, faTrash, faSearch, faPhone, faMapMarkerAlt, faTimes,
  faCheck, faExclamationTriangle, faInfo, faBars, faSignOutAlt,
  faSave, faEye, faArrowLeft, faArrowRight, faFilter, faDownload,
  faSpinner, faCheckCircle, faTimesCircle, faExclamationCircle,
  faInfoCircle, faStar, faHeart, faShare, faComment, faThumbsUp,
  faLayerGroup, faPenToSquare, faChartBar, faMagnifyingGlass, faGear, faHouse,
  faMoneyBillWave, faCreditCard, faQrcode, faShirt, faWind, faFire, faMinus,
  faInbox, faTint, faBox, faTruck, faSyncAlt, faClock, faList, faClipboardList
} from '@fortawesome/free-solid-svg-icons'

// Add icons to library
library.add(
  faUser, faUsers, faCog, faHome, faChartLine, faShoppingCart, faReceipt,
  faPlus, faEdit, faTrash, faSearch, faPhone, faMapMarkerAlt, faTimes,
  faCheck, faExclamationTriangle, faInfo, faBars, faSignOutAlt,
  faSave, faEye, faArrowLeft, faArrowRight, faFilter, faDownload,
  faSpinner, faCheckCircle, faTimesCircle, faExclamationCircle,
  faInfoCircle, faStar, faHeart, faShare, faComment, faThumbsUp,
  faLayerGroup, faPenToSquare, faChartBar, faMagnifyingGlass, faGear, faHouse,
  faMoneyBillWave, faCreditCard, faQrcode, faShirt, faWind, faFire, faMinus,
  faInbox, faTint, faBox, faTruck, faSyncAlt, faClock, faList, faClipboardList
)

const app = createApp(App)
const pinia = createPinia()

app.component('FontAwesomeIcon', FontAwesomeIcon)

// SweetAlert2 configuration
const options = {
  confirmButtonColor: '#4f46e5',
  cancelButtonColor: '#6b7280',
  customClass: {
    popup: 'rounded-2xl',
    confirmButton: 'rounded-lg px-6 py-2 font-medium',
    cancelButton: 'rounded-lg px-6 py-2 font-medium'
  }
}

app.use(VueSweetalert2, options)
app.use(pinia)
app.use(router)

// Initialize auth store after pinia is set up
import { useAuthStore } from './store/auth'
const authStore = useAuthStore()
authStore.initializeAuth()

app.mount('#app')
