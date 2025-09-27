import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import './style.css'
import App from './App.vue'

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

app.component('FontAwesomeIcon', FontAwesomeIcon)
app.use(createPinia())
app.use(router)

app.mount('#app')
