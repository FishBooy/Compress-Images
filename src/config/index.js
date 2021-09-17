/* eslint-disable no-param-reassign */
import axios from 'axios';

export default {
    install: (vue) => {
        vue.prototype.$request = axios;
    },
};
