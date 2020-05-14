import axiosOrigion from 'axios';


const maxRequestTimeout = 5000;

// use instance for private config
const axios = axiosOrigion.create();

// axios.defaults.baseURL = `/gmw/api`;
axios.defaults.timeout = maxRequestTimeout;

axios.interceptors.response.use(null, error => {
    const expectedError = error.response && error.response.status >= 400 && error.response.status < 500;

    if (!expectedError) {
        console.log(`Rd: error`, error)
        // 提示到界面
    }

    return Promise.reject(error);
});

function setJwt(jwt) {
    axios.defaults.headers.common['x-auth-token'] = jwt;
}

export default {
    get: axios.get,
    post: axios.post,
    put: axios.put,
    delete: axios.delete,
    setJwt,
};
