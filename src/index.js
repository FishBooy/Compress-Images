import Vue from 'vue';
import { Button, Form, Field, Uploader, Dialog, Toast, Loading, Tag, Icon, Stepper } from 'vant';
import App from './partials/App.vue';
import config from './config/index';

import 'vant/lib/button/style';
import 'vant/lib/form/style';
import 'vant/lib/field/style';
import 'vant/lib/uploader/style';
import 'vant/lib/dialog/style';
import 'vant/lib/toast/style';
import 'vant/lib/loading/style';
import 'vant/lib/tag/style';
import 'vant/lib/stepper/style';
// import 'vant/lib/icon/style';

Vue.use(Button);
Vue.use(Form);
Vue.use(Field);
Vue.use(Uploader);
Vue.use(Dialog);
Vue.use(Toast);
Vue.use(Loading);
Vue.use(Tag);
Vue.use(Icon);
Vue.use(Stepper);

Vue.use(config);

new Vue({
    render: (h) => h(App),
}).$mount('#app');
