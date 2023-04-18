import Constants from "./Constants";
import moment from "moment";
import 'moment/locale/ru';

export default class Methods {
    static getIdeApiURL(endpoint) {
        return `${
            Constants.IDE_API_HOST
        }${
            Constants.IDE_API_PORT
        }/${
            Constants.IDE_API_CONTEXT_PATH
        }/${endpoint}`;
    }

    static datePast(date) {
        return moment(date).fromNow();
    }

    static fullDateTime(date) {
        return moment(date).format('LLL');
    }
}