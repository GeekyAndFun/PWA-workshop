const Utils = {
    getDateString: dateObject => {
        let hours = dateObject.getHours();
        if (hours < 10) {
            hours = `0${hours}`;
        }

        let minutes = dateObject.getMinutes();
        if (minutes < 10) {
            minutes = `0${minutes}`;
        }

        return `${hours}:${minutes}`;
    }
};

export default Utils;
